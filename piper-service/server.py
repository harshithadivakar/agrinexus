import os
import subprocess
import tempfile
import threading
import time
from pathlib import Path

from flask import Flask, request, jsonify, Response

MODEL_PATH = os.environ.get("PIPER_MODEL_PATH", "/app/en_US-amy-medium.onnx")
OUT_DIR = tempfile.mkdtemp(prefix="piper-out-")

app = Flask(__name__)
lock = threading.Lock()
proc = None


def get_process():
    global proc
    if proc is None or proc.poll() is not None:
        proc = subprocess.Popen(
            ["python", "-m", "piper", "-m", MODEL_PATH, "-d", OUT_DIR, "--output-dir-naming", "timestamp"],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
        )
    return proc


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/synthesize", methods=["POST"])
def synthesize():
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip().replace("\n", " ")
    if not text:
        return jsonify({"error": "text is required"}), 400

    with lock:
        p = get_process()
        before = set(os.listdir(OUT_DIR))
        p.stdin.write(text + "\n")
        p.stdin.flush()

        deadline = time.time() + 15
        new_file = None
        while time.time() < deadline:
            diff = set(os.listdir(OUT_DIR)) - before
            if diff:
                new_file = diff.pop()
                break
            time.sleep(0.15)

        if not new_file:
            return jsonify({"error": "Piper synthesis timed out"}), 500

        full_path = Path(OUT_DIR) / new_file
        last_size = -1
        for _ in range(30):
            size = full_path.stat().st_size
            if size == last_size and size > 0:
                break
            last_size = size
            tim
        return Response(audio_bytes, mimetype="audio/wav")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))