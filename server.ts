import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

// Middleware
// Raised limit to accommodate base64-encoded plant photos from the diagnose endpoint (up to ~8MB files)
app.use(express.json({ limit: '15mb' }));

// API Key verification helper
function getApiKey(): string | null {
  // First look for SECRET1 as requested
  let key = process.env.SECRET1;
  
  // Fallback to GEMINI_API_KEY if SECRET1 is empty, not provided, or set to placeholder
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE' || key.trim() === '') {
    key = process.env.GEMINI_API_KEY;
  }
  
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE' || key.trim() === '') {
    return null;
  }
  return key;
}

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Neither SECRET1 nor GEMINI_API_KEY is configured, or they are set to placeholders. ' +
      'Please configure your Gemini API key as "SECRET1" (or "GEMINI_API_KEY") in your settings or .env file.'
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Gemini occasionally returns a transient 503 UNAVAILABLE when its own servers are
// overloaded ("This model is currently experiencing high demand") - this is not
// something our code can prevent, but a single blip should never surface as a hard
// failure to the user. Retries with exponential backoff before giving up.
function isRetryableGeminiError(err: any): boolean {
  const msg = String(err?.message || '');
  return err?.status === 503 || err?.code === 503 || /"code"\s*:\s*503/.test(msg) || /UNAVAILABLE/i.test(msg) || /overloaded|high demand/i.test(msg);
}

// A 429 RESOURCE_EXHAUSTED means the API key has hit its quota (e.g. the free tier's
// 20-requests/day cap) - unlike a 503, retrying does not help against a hard quota
// ceiling and just wastes more of it, so this is deliberately excluded from retry.
function isQuotaExceededError(err: any): boolean {
  const msg = String(err?.message || '');
  return err?.status === 429 || err?.code === 429 || /"code"\s*:\s*429/.test(msg) || /RESOURCE_EXHAUSTED/i.test(msg) || /quota/i.test(msg);
}

async function withGeminiRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 1000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (!isRetryableGeminiError(err) || attempt === retries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 300;
      console.warn(`Gemini overloaded (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(delay)}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: getApiKey() !== null,
    timestamp: new Date().toISOString()
  });
});

// App configuration endpoint (safe public values for frontend connection)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
  });
});

// --- Plant Voice (talking-plant persona), powered by a local open-source model via Ollama ---
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

type PlantMood = 'happy' | 'needy' | 'distressed';
type PlantIssue = 'water_low' | 'water_critical' | 'light_off' | 'ph_high' | 'ph_low';

const PLANT_VOICE_FALLBACKS: Record<PlantMood, string[]> = {
  happy: [
    "Hey! Just soaking up some light today. How are you?",
    "Feeling good today. Thanks for checking in on me!",
    "Living my best leafy life right now.",
    "Growing nicely over here. Proud of me?",
    "Today's a great day to be a plant.",
  ],
  needy: [
    "Hellooo? Anyone there? I could use a little attention.",
    "Not gonna lie, I've had better days. Come see me?",
    "I'm okay, but I've felt cozier. Just saying.",
    "A little TLC would go a long way right about now.",
    "Things are a bit off today. Nothing dramatic. Yet.",
  ],
  distressed: [
    "Stop ignoring me. I mean it this time.",
    "This is officially a cry for help.",
    "I'm not thriving. I need you, like, now.",
    "Excuse me?! I've been calling for you all day.",
    "Okay this is urgent. Come find me.",
  ],
};

// Fallback lines tied to a *specific* cause, used when we know exactly what's wrong
// (rather than just a generic mood) - checked in order, first matching issue wins.
const ISSUE_VOICE_FALLBACKS: Partial<Record<PlantIssue, string[]>> = {
  water_critical: [
    "I need water. Like, right now, I'm actually thirsty.",
    "My roots are begging. Please, some water?",
    "I'm bone dry over here. Water me?",
  ],
  water_low: [
    "Getting a little thirsty - could use some water soon.",
    "My water's running low. Top me up?",
  ],
  light_off: [
    "I don't think I'm getting enough sunlight here. Move me somewhere brighter?",
    "It's kind of dark over here. Can I get a sunnier spot?",
    "I could really use more light. Different windowsill, maybe?",
  ],
  ph_high: [
    "Something feels a bit off with my water balance today.",
    "My roots feel a little uneasy - might be worth checking my water.",
  ],
  ph_low: [
    "Something feels a bit off with my water balance today.",
    "My roots feel a little uneasy - might be worth checking my water.",
  ],
};

// What each issue means in plain language, fed to the model so it complains about
// the *actual* problem instead of a generic mood.
const ISSUE_PROMPT_HINTS: Record<PlantIssue, string> = {
  water_critical: "you are very thirsty because your water reservoir is critically low - urgently ask to be watered",
  water_low: "your water is starting to run low - gently ask for some water soon",
  light_off: "you aren't getting enough light right now - ask to be moved somewhere sunnier",
  ph_high: "your water's pH balance feels off (too alkaline) - mention feeling a bit unbalanced or off",
  ph_low: "your water's pH balance feels off (too acidic) - mention feeling a bit unbalanced or off",
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

const VALID_ISSUES: PlantIssue[] = ['water_critical', 'water_low', 'light_off', 'ph_high', 'ph_low'];

app.post('/api/plant/voice', async (req, res) => {
  const { plantName, mood, issues } = req.body as { plantName?: string; mood?: PlantMood; issues?: string[] };
  const safeMood: PlantMood = mood === 'needy' || mood === 'distressed' ? mood : 'happy';
  const safePlantName = plantName || 'your plant';
  const safeIssues: PlantIssue[] = Array.isArray(issues) ? issues.filter((i): i is PlantIssue => VALID_ISSUES.includes(i as PlantIssue)) : [];

  // Prefer specific, grounded complaints (low water, no light, etc.) over a generic mood -
  // "I need water" reads as a real plant, "I feel neglected" reads as a canned mood label.
  const moodBrief = safeIssues.length > 0
    ? safeIssues.map((i) => ISSUE_PROMPT_HINTS[i]).join('; and ')
    : safeMood === 'distressed' ? 'you feel neglected and are dramatically calling out for attention'
    : safeMood === 'needy' ? 'you feel a little neglected and are gently nudging for attention'
    : 'you feel great and are cheerfully checking in';

  const prompt =
    `You are a ${safePlantName} plant with a witty, warm personality, speaking directly to your owner in first person. ` +
    `Right now ${moodBrief}. Write exactly ONE short line (under 15 words), no quotes, no emoji, no stage directions, just what the plant would say out loud.`;

  const fallbackLine = () => {
    for (const issue of safeIssues) {
      const bank = ISSUE_VOICE_FALLBACKS[issue];
      if (bank) return pickRandom(bank);
    }
    return pickRandom(PLANT_VOICE_FALLBACKS[safeMood]);
  };

  try {
    const ollamaCall = fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.9, num_predict: 40 },
      }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(`Ollama responded ${r.status}`);
      const data: any = await r.json();
      const line = (data.response || '').trim().replace(/^"|"$/g, '');
      if (!line) throw new Error('Empty response from model');
      return line;
    });

    const line = await withTimeout(ollamaCall, 4000);
    res.json({ line, mood: safeMood, issues: safeIssues, source: 'ai' });
  } catch (err: any) {
    res.json({ line: fallbackLine(), mood: safeMood, issues: safeIssues, source: 'canned' });
  }
});

// --- Plant Voice audio (text-to-speech), powered by a local open-source model via Piper ---
const PIPER_VOICE_PATH = process.env.PIPER_VOICE_PATH || path.join(process.cwd(), 'models', 'piper', 'en_US-amy-medium.onnx');
const PIPER_PYTHON = process.env.PIPER_PYTHON || 'python';
const PIPER_URL = process.env.PIPER_URL || null;
const piperOutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agrinexus-piper-'));

let piperProcess: ChildProcessWithoutNullStreams | null = null;
let piperQueue: Promise<unknown> = Promise.resolve();

function getPiperProcess(): ChildProcessWithoutNullStreams {
  if (piperProcess && !piperProcess.killed) return piperProcess;
  piperProcess = spawn(PIPER_PYTHON, [
    '-m', 'piper',
    '-m', PIPER_VOICE_PATH,
    '-d', piperOutDir,
    '--output-dir-naming', 'timestamp',
  ]);
  piperProcess.on('exit', () => { piperProcess = null; });
  piperProcess.stderr.on('data', () => {}); // swallow piper's debug/info logs
  return piperProcess;
}

// Synthesizes one line of text to a WAV buffer.
// On Railway (or anywhere PIPER_URL is set), calls the separate Piper service over HTTP
// instead of spawning a local python process, which only exists on a dev machine.
// Requests to the local process are serialized through piperQueue since one Piper process
// handles one line at a time.
function synthesizeSpeech(text: string): Promise<Buffer> {
  if (PIPER_URL) {
    return fetch(`${PIPER_URL}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(`Piper service responded ${r.status}`);
      const arrayBuffer = await r.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });
  }

  const run = async () => {
    const proc = getPiperProcess();
    const before = new Set(fs.readdirSync(piperOutDir));

    proc.stdin.write(text.replace(/\n/g, ' ').trim() + '\n');

    const deadline = Date.now() + 15000;
    let newFile: string | null = null;
    while (Date.now() < deadline) {
      const after = fs.readdirSync(piperOutDir);
      newFile = after.find((f) => !before.has(f)) || null;
      if (newFile) break;
      await new Promise((r) => setTimeout(r, 150));
    }
    if (!newFile) throw new Error('Piper synthesis timed out');

    const fullPath = path.join(piperOutDir, newFile);
    // Wait for the file to stop growing (Piper still writing it). On a cold start
    // (fresh process, model not yet loaded into memory) this can take several seconds,
    // so give it its own generous deadline rather than a fixed iteration count -
    // a premature read here previously returned a 0-byte/truncated "successful" response.
    let lastSize = -1;
    let stableSize = 0;
    const writeDeadline = Date.now() + 15000;
    while (Date.now() < writeDeadline) {
      const size = fs.statSync(fullPath).size;
      if (size === lastSize && size > 0) {
        stableSize = size;
        break;
      }
      lastSize = size;
      await new Promise((r) => setTimeout(r, 150));
    }

    const buffer = fs.readFileSync(fullPath);
    fs.unlink(fullPath, () => {});
    if (buffer.length === 0 || buffer.length !== stableSize) {
      throw new Error('Piper wrote an incomplete audio file');
    }
    return buffer;
  };

  const result = piperQueue.then(run, run);
  piperQueue = result.catch(() => {});
  return result;
}

app.post('/api/plant/voice/audio', async (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  try {
    const audio = await synthesizeSpeech(text);
    res.set('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (error: any) {
    console.error('Piper TTS error:', error);
    res.status(500).json({ error: error.message || 'Speech synthesis failed' });
  }
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, history, plantContext } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Initialize Gemini client (will throw if not configured)
    const ai = getGeminiClient();

    // Setup system instructions based on garden application theme
    const systemInstruction = 
      "You are the AgriNexus AI Gardening Advisor, a knowledgeable assistant integrated into the AgriNexus Smart Hydroponic Garden app. " +
      "Your goal is to provide expert advice on indoor hydroponics, crop care, pH levels, light cycles, and harvesting. " +
      "Keep answers highly practical, concise, friendly, and structured. " +
      (plantContext ? `The user is currently growing: ${plantContext}. Tailor your advice specifically to this plant when relevant.` : "");

    // Prepare contents including history if available, else a single prompt
    let contents: any = prompt;
    if (history && Array.isArray(history) && history.length > 0) {
      contents = history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));
      // Append the current prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });
    }

    const response = await withGeminiRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })
    );

    const reply = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (isQuotaExceededError(error)) {
      res.status(429).json({ error: "This app has hit its daily Gemini API quota. Please try again tomorrow, or upgrade the API plan." });
      return;
    }
    if (isRetryableGeminiError(error)) {
      res.status(503).json({ error: "Gemini's servers are experiencing high demand right now. Please try again in a moment." });
      return;
    }
    res.status(500).json({ error: error.message || 'An unexpected error occurred while communicating with Gemini.' });
  }
});

// Gemini Plant Disease Diagnosis Endpoint
app.post('/api/gemini/diagnose', async (req, res) => {
  try {
    const { imageDataUrl, plantContext } = req.body;
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      res.status(400).json({ error: 'imageDataUrl is required' });
      return;
    }

    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'imageDataUrl must be a base64 data URL (e.g. data:image/jpeg;base64,...)' });
      return;
    }
    const [, mimeType, base64Data] = match;

    const ai = getGeminiClient();

    const prompt =
      'You are a plant-health assistant analyzing a single photo submitted by a home hydroponic grower. ' +
      'Look closely for signs of disease, pests, nutrient deficiency, or stress on leaves, stems, and roots. ' +
      (plantContext ? `The grower says this is: ${plantContext}. ` : '') +
      'Respond with your best assessment even if uncertain. If the image does not contain a plant, set isPlant to false.';

    const response = await withTimeout(
      withGeminiRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
          config: {
            temperature: 0.4,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isPlant: { type: Type.BOOLEAN },
                status: { type: Type.STRING, enum: ['healthy', 'stressed', 'unhealthy', 'unknown'] },
                summary: { type: Type.STRING },
                diseaseSigns: { type: Type.STRING },
                recommendation: { type: Type.STRING },
                issues: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['isPlant', 'status', 'summary', 'diseaseSigns', 'recommendation', 'issues'],
            },
          },
        })
      ),
      45000
    );

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Gemini Diagnose API Error:', error);
    const isTimeout = error.message === 'timeout';
    const isQuotaExceeded = !isTimeout && isQuotaExceededError(error);
    const isOverloaded = !isTimeout && !isQuotaExceeded && isRetryableGeminiError(error);
    const message = isTimeout
      ? 'The photo analysis is taking too long. Please try again.'
      : isQuotaExceeded
      ? 'This app has hit its daily Gemini API quota. Please try again tomorrow, or upgrade the API plan.'
      : isOverloaded
      ? "Gemini's servers are experiencing high demand right now. Please try again in a moment."
      : (error.message || 'An unexpected error occurred while diagnosing the plant photo.');
    res.status(isTimeout ? 504 : isQuotaExceeded ? 429 : isOverloaded ? 503 : 500).json({ error: message });
  }
});

// --- Support ticket submission, forwarded to Zapier (Webhooks by Zapier -> Email action) ---
const ZAPIER_SUPPORT_WEBHOOK_URL = process.env.ZAPIER_SUPPORT_WEBHOOK_URL || null;

app.post('/api/support/ticket', async (req, res) => {
  const { category, message, userEmail, userName } = req.body as {
    category?: string;
    message?: string;
    userEmail?: string;
    userName?: string;
  };

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  if (!ZAPIER_SUPPORT_WEBHOOK_URL) {
    console.error('ZAPIER_SUPPORT_WEBHOOK_URL is not configured - support ticket was not sent anywhere.');
    res.status(500).json({ error: 'Support ticketing is not configured yet.' });
    return;
  }

  try {
    const zapierRes = await fetch(ZAPIER_SUPPORT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: category || 'other',
        message: message.trim(),
        userEmail: userEmail || 'unknown',
        userName: userName || 'unknown',
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!zapierRes.ok) {
      throw new Error(`Zapier webhook responded ${zapierRes.status}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error forwarding support ticket to Zapier:', error);
    res.status(502).json({ error: 'Could not send your ticket right now. Please try again shortly.' });
  }
});

// Start the server
async function startServer() {
  // Vite middleware setup for Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
