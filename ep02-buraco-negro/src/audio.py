"""Episódio 2: trilha + efeitos sintetizados + narração, com ducking. Grava build/mix.wav."""
import json
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
tl = json.loads((ROOT / "build/timeline.json").read_text())
ev = json.loads((ROOT / "build/events.json").read_text())
DUR = tl["duration"]
N = int(round(DUR * 30)) * SR // 30
rs = np.random.default_rng(7)
ts = lambda i: next(c for c in tl["clips"] if c["id"] == i)["start"]
te = lambda i: next(c for c in tl["clips"] if c["id"] == i)["end"]
S, M = ev["scenes"], ev["marks"]
t = np.arange(N) / SR


def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def sweep(f): return np.sin(2 * np.pi * np.cumsum(f) / SR)


def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i < 0: x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[: j - i] * g


def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def reverb(x, secs=2.2, wet=0.25):
    n = int(secs * SR)
    ir = lp(rs.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.0), 5000)
    y = fftconvolve(x, ir)[: len(x)]
    y /= np.max(np.abs(y)) + 1e-9
    return x * (1 - wet) + y * wet * np.max(np.abs(x))


def curve(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def note(m): return 440 * 2 ** ((m - 69) / 12)


# ---------------- música: Ré menor espacial ----------------
CH = [[38, 45, 50, 53, 57], [34, 41, 46, 50, 53], [41, 48, 53, 57, 60], [36, 43, 48, 52, 55]]  # Dm Bb F C
chord_len = DUR / 8
bright = curve([(0, .8), (S["s5"], .9), (S["s7"], .5), (M["BREAK"], .1), (S["s9"], .7), (DUR, .8)])
padvol = curve([(0, .6), (M["BREAK"] - .05, .6), (M["BREAK"], 0), (S["s9"] - .1, 0), (S["s9"] + .3, .55), (DUR, .6)])
pad = np.zeros(N)
for ci in range(8):
    t0, t1 = ci * chord_len - 0.4, (ci + 1) * chord_len + 0.4
    a, b = max(0, int(t0 * SR)), min(N, int(t1 * SR))
    tc = t[a:b]; seg = np.zeros(b - a)
    for m in CH[ci % 4]:
        for det in (-0.12, 0.0, 0.11):
            ff = note(m) * 2 ** (det / 12)
            for k in range(1, 9):
                seg += np.sin(2 * np.pi * ff * k * tc + k * det * 7) / (k ** 1.6) * np.exp(-(k - 1) * (1.2 - bright[a:b]) * 0.9)
    e = np.ones(b - a); x = int(0.4 * SR)
    if a > 0: e[:x] = np.linspace(0, 1, x)
    if b < N: e[-x:] = np.linspace(1, 0, x)
    pad[a:b] += seg * e
pad = lp(pad, 3200) * padvol
pad /= np.max(np.abs(pad)) + 1e-9

# arpejo cristalino (pausa na espaguetificação cômica e na singularidade)
arp = np.zeros(N)
arpvol = curve([(0, .3), (S["s3"], .5), (S["s4"] - .1, .5), (S["s4"], .15), (S["s5"], .4), (S["s7"], .7), (M["BREAK"] - .05, .8), (M["BREAK"], 0), (S["s9"], 0), (S["s9"] + .2, .35), (DUR, .3)])
step, k, tn = 60 / 96 / 2, 0, 0.0
while tn < DUR:
    m = CH[int(tn // chord_len) % 4][[2, 3, 4, 3][k % 4]] + 12
    d = tt(0.4)
    add(arp, (np.sin(2 * np.pi * note(m) * d) + 0.25 * np.sin(6 * np.pi * note(m) * d)) * np.exp(-d * 8) * arpvol[min(int(tn * SR), N - 1)], tn)
    tn += step; k += 1

# drone grave (presença do buraco negro), sobe dentro do horizonte
drone = (np.sin(2 * np.pi * 36.7 * t) + 0.6 * np.sin(2 * np.pi * 55 * t + 1) + 0.3 * np.sin(2 * np.pi * 73.4 * t)) * (1 + 0.25 * np.sin(2 * np.pi * 0.4 * t))
drone *= curve([(0, .5), (S["s2"], .35), (S["s5"], .5), (S["s7"], 1.0), (M["BREAK"], 1.0), (M["BREAK"] + 1.5, .2), (S["s9"], .4), (DUR, .5)])

music = reverb(0.55 * pad + 0.3 * arp + 0.45 * lp(drone, 260), 2.6, 0.32)

# ---------------- efeitos ----------------
def whoosh(d=0.5, lo=300, hi=4000):
    n = tt(d); x = rs.standard_normal(len(n)); out = np.zeros(len(n)); nseg = 24; L = len(n) // nseg + 1
    for s in range(nseg):
        f = lo + (hi - lo) * np.sin(np.pi * s / nseg)
        seg = bp(x, max(60, f * 0.6), min(20000, f * 1.4))[s * L:(s + 1) * L]; out[s * L:s * L + len(seg)] = seg
    return out * np.sin(np.pi * n / d) ** 2

def pop():
    n = tt(0.09); return sweep(500 + 900 * n / 0.09) * np.exp(-n * 45)

def heart():
    out = np.zeros(int(0.5 * SR))
    for o, g in ((0, 1), (0.18, 0.7)):
        n = tt(0.25); add(out, sweep(65 - 20 * n / 0.25) * np.exp(-n * 18) * g, o)
    return lp(out, 200)

def stretch(f0=300, f1=900, d=0.45):   # apito subindo (estica)
    n = tt(d); f = f0 * (f1 / f0) ** (n / d)
    return (sweep(f) + 0.3 * sweep(2 * f)) * env(len(n), 0.03, 0.08) * 0.6

def boing():
    n = tt(0.7); f = 180 + 120 * np.sin(2 * np.pi * 9 * n) * np.exp(-n * 4)
    return sweep(f) * np.exp(-n * 4)

def impact():
    n = tt(1.2); s = sweep(30 + 90 * np.exp(-n * 6)) * np.exp(-n * 3)
    return s + lp(rs.standard_normal(len(n)), 1200) * np.exp(-n * 10) * 0.7

def ding():
    n = tt(1.0); return (np.sin(2 * np.pi * 1320 * n) + 0.4 * np.sin(2 * np.pi * 2640 * n)) * np.exp(-n * 5) * 0.6

def shimmer():
    out = np.zeros(int(1.2 * SR))
    for i in range(14):
        n = tt(0.6); add(out, np.sin(2 * np.pi * rs.uniform(1800, 4800) * n) * np.exp(-n * 7) * 0.4, i * 0.04)
    return out

def tapestop():   # tempo "freando": tom descendo até parar
    n = tt(1.4); f = 520 * (1 - n / 1.4) ** 1.5 + 20
    return (sweep(f) + 0.4 * sweep(f * 1.5)) * env(len(n), 0.02, 0.3) * 0.6

def glitch_big():
    out = np.zeros(int(1.0 * SR))
    for i in range(16):
        n = tt(0.05); f = rs.choice([90, 180, 360, 720, 1440, 2880])
        add(out, np.sign(np.sin(2 * np.pi * f * n)) * 0.35 * env(len(n), 0.002, 0.01), i * 0.055)
    return lp(out, 6000)

def drop():
    n = tt(2.4); s = sweep(70 * np.exp(-n * 1.2) + 26) * np.exp(-n * 1.0)
    return s + lp(rs.standard_normal(len(n)), 400) * np.exp(-n * 4) * 0.6

def riser():
    d = DUR - ts("h2") - 0.2; n = tt(d)
    x = bp(rs.standard_normal(len(n)), 800, 9000) * (n / d) ** 2
    return x * env(len(n), 0.0, 0.05) * 0.5

sfx = np.zeros(N)
lib = {"whoosh": (lambda: whoosh(0.55), 0.55), "whoosh_s": (lambda: whoosh(0.3, 600, 5000), 0.3), "pop": (pop, 0.35),
       "heart": (heart, 0.9), "stretch": (lambda: stretch(300, 700), 0.45), "stretch2": (lambda: stretch(450, 1100), 0.45),
       "boing": (boing, 0.6), "impact": (impact, 0.8), "ding": (ding, 0.4), "shimmer": (shimmer, 0.45),
       "tapestop": (tapestop, 0.45), "glitch_big": (glitch_big, 0.45), "drop": (drop, 0.9), "riser": (riser, 0.35)}
for e in ev["events"]:
    fn, g = lib[e["k"]]
    add(sfx, fn(), e["t"] - (0.12 if e["k"].startswith("whoosh") else 0), g)
# tique-taque acelerado na contagem "menos de um minuto"
tq = ts("f2") + 0.9
while tq < S["s8"]:
    n = tt(0.03); add(sfx, (np.sin(2 * np.pi * 2400 * n) + 0.5 * np.sin(2 * np.pi * 1200 * n)) * np.exp(-n * 160), tq, 0.25); tq += 0.25
sfx = reverb(sfx, 1.2, 0.18)

# ---------------- voz + ducking ----------------
voice, vsr = sf.read(ROOT / "build/voice/narration.wav"); assert vsr == SR
v = np.zeros(N); v[: min(N, len(voice))] = voice[:N]
v = hp(v, 80)
envv = np.abs(lp(np.abs(v), 15))
v = v * np.where(envv > 0.12, (0.12 / (envv + 1e-9)) ** 0.5, 1.0)
v /= np.max(np.abs(v)) + 1e-9
v = reverb(v, 0.6, 0.06)
duck = 1 - 0.55 * np.clip(lp((np.abs(v) > 0.02).astype(float), 3) * 3, 0, 1)

mix = 1.0 * v + 0.30 * music * duck + 0.55 * sfx
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
sf.write(ROOT / "build/mix.wav", np.stack([mix, mix], axis=1), SR)
print("mix ok", len(mix) / SR, "s")
