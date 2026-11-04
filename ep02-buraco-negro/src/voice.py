"""Gera a narração clipe a clipe com Piper (voz pt-BR) e monta a linha do tempo.

Saídas:
  build/voice/<id>.wav      clipes individuais (48 kHz mono, sem silêncio nas pontas)
  build/voice/narration.wav narração completa
  build/timeline.json       início/fim de cada clipe + duração total
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = Path(sys.argv[1])  # pasta com pt_BR-faber-medium.onnx
SR = 48000
LEAD_IN = 0.15  # o áudio começa quase de imediato (gancho em 0 s)

cfg = json.loads((ROOT / "src/narration.json").read_text())
out = ROOT / "build/voice"
out.mkdir(parents=True, exist_ok=True)
model = MODEL_DIR / f"{cfg['voice']}.onnx"


def trim(x, thr=0.01, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


clips, t = [], LEAD_IN
pieces = [np.zeros(int(LEAD_IN * SR))]
for c in cfg["clips"]:
    raw = out / f"{c['id']}_raw.wav"
    subprocess.run(
        ["python3", "-m", "piper", "-m", str(model), "-f", str(raw),
         "--length-scale", str(cfg["length_scale"]), "--sentence-silence", "0"],
        input=c["text"].encode(), check=True, capture_output=True)
    wav = out / f"{c['id']}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-ar", str(SR), "-ac", "1", str(wav)], check=True)
    x, _ = sf.read(wav)
    x = trim(x)
    sf.write(wav, x, SR)
    d = len(x) / SR
    clips.append({**c, "start": round(t, 3), "end": round(t + d, 3)})
    pieces += [x, np.zeros(int(c["gap_after"] * SR))]
    t += d + c["gap_after"]

full = np.concatenate(pieces)
sf.write(out / "narration.wav", full, SR)
(ROOT / "build/timeline.json").write_text(json.dumps({"fps": 30, "duration": round(t, 3), "clips": clips}, ensure_ascii=False, indent=1))
for c in clips:
    print(f"{c['id']}  {c['start']:6.2f}-{c['end']:6.2f}  {c['text']}")
print("total", round(t, 2))
