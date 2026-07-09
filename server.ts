import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();

// Middleware
app.use(express.json());

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
