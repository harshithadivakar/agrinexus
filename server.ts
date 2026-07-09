import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

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

app.post('/api/plant/voice', async (req, res) => {
  const { plantName, mood } = req.body as { plantName?: string; mood?: PlantMood };
  const safeMood: PlantMood = mood === 'needy' || mood === 'distressed' ? mood : 'happy';
  const safePlantName = plantName || 'your plant';

  const moodBrief =
    safeMood === 'distressed' ? 'you feel neglected and are dramatically calling out for attention'
    : safeMood === 'needy' ? 'you feel a little neglected and are gently nudging for attention'
    : 'you feel great and are cheerfully checking in';

  const prompt =
    `You are a ${safePlantName} plant with a witty, warm personality, speaking directly to your owner in first person. ` +
    `Right now ${moodBrief}. Write exactly ONE short line (under 15 words), no quotes, no emoji, no stage directions, just what the plant would say out loud.`;

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
    res.json({ line, mood: safeMood, source: 'ai' });
  } catch (err: any) {
    res.json({ line: pickRandom(PLANT_VOICE_FALLBACKS[safeMood]), mood: safeMood, source: 'canned' });
  }
});

// --- Plant Voice audio (text-to-speech), powered by a local open-source model via Piper ---
const PIPER_VOICE_PATH = process.env.PIPER_VOICE_PATH || path.join(process.cwd(), 'models', 'piper', 'en_US-amy-medium.onnx');
const PIPER_PYTHON = process.env.PIPER_PYTHON || 'python';
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

// Synthesizes one line of text to a WAV buffer using the persistent Piper process.
// Requests are serialized through piperQueue since one Piper process handles one line at a time.
function synthesizeSpeech(text: string): Promise<Buffer> {
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
    // Wait for the file to stop growing (Piper still writing it)
    let lastSize = -1;
    for (let i = 0; i < 30; i++) {
      const size = fs.statSync(fullPath).size;
      if (size === lastSize && size > 0) break;
      lastSize = size;
      await new Promise((r) => setTimeout(r, 100));
    }

    const buffer = fs.readFileSync(fullPath);
    fs.unlink(fullPath, () => {});
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while communicating with Gemini.' 
    });
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

    const response = await ai.models.generateContent({
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
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Gemini Diagnose API Error:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred while diagnosing the plant photo.',
    });
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
