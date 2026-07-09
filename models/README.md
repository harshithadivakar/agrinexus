# Models used by AgriNexus

All model weights are gitignored (too large for git, and easy to re-fetch).
This file is the single source of truth for what's used, where it lives, and how to get it.

## 1. Text generation — Ollama (`llama3.2`)

Used by: `POST /api/plant/voice` (talking-plant persona lines) in `server.ts`.

- Managed by Ollama itself, **not** stored in this repo's `models/` folder — Ollama
  keeps its own global model store (`~/.ollama/models` on this machine) shared across
  every project that uses it, and doesn't support pointing at an arbitrary folder
  without reconfiguring the Ollama service system-wide.
- Fetch it with:
  ```
  ollama pull llama3.2
  ```
- Config: `OLLAMA_URL` (default `http://localhost:11434`) and `OLLAMA_MODEL`
  (default `llama3.2`) env vars in `.env`, see `.env.example`.

## 2. Text-to-speech — Piper (`en_US-amy-medium`)

Used by: `POST /api/plant/voice/audio` (spoken plant lines) in `server.ts`.

- Weights live in `models/piper/` (gitignored):
  - `en_US-amy-medium.onnx`
  - `en_US-amy-medium.onnx.json`
- Fetch them with:
  ```
  cd models/piper
  python -m piper.download_voices en_US-amy-medium
  ```
- Requires the `piper-tts` Python package: `pip install piper-tts`
- Config: `PIPER_VOICE_PATH` env var (default `models/piper/en_US-amy-medium.onnx`)
  in `.env`, see `.env.example`.

## 3. AI Gardening Advisor & photo diagnosis — Gemini (`gemini-3.5-flash`)

Used by: `POST /api/gemini/chat` and `POST /api/gemini/diagnose` in `server.ts`.

- Hosted by Google, no local weights. Requires `GEMINI_API_KEY` (or `SECRET1`) in `.env`.
