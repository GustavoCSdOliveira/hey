#!/usr/bin/env python3
"""Recorta cada frase da narração bruta e a posiciona no instante da cena (alinha áudio e vídeo).
Uso: python3 montar_narracao.py  ->  narracao.wav (55 s)"""
import subprocess

RAW = "narracao_bruta.mp3"
DURACAO = 55.0
# (início e fim da fala em narracao_bruta.mp3, início da fala no vídeo)
FRASES = [
    (0.00, 2.83, 0.3), (3.43, 5.55, 3.5), (6.68, 10.74, 6.0), (11.86, 15.34, 10.4), (16.06, 18.40, 14.3),
    (19.15, 25.01, 17.0), (25.66, 29.85, 23.3), (31.11, 34.97, 28.0), (35.51, 38.55, 32.3), (39.32, 42.06, 37.7),
    (42.54, 45.63, 40.8), (46.31, 48.06, 44.3), (48.68, 51.91, 46.4), (53.22, 54.45, 50.0), (55.34, 57.16, 51.6),
]
f, labels = [], []
for i, (a, b, tv) in enumerate(FRASES):
    a0 = max(0, a - 0.06)
    ms = int(round((tv - (a - a0)) * 1000))
    f.append(f"[0:a]atrim=start={a0}:end={b + 0.12},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,adelay={ms}|{ms}[a{i}]")
    labels.append(f"[a{i}]")
f.append("".join(labels) + f"amix=inputs={len(FRASES)}:normalize=0:dropout_transition=0,apad=whole_dur={DURACAO},atrim=0:{DURACAO},"
         "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7,aformat=sample_rates=44100:channel_layouts=stereo[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", RAW, "-filter_complex", ";".join(f), "-map", "[out]", "narracao.wav"], check=True)
print("ok narracao.wav")
