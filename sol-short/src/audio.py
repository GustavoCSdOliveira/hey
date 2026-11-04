"""Trilha sonora sintetizada + efeitos sonoros + narração, com ducking e master.

Lê build/timeline.json e build/events.json (gerado pelo render) e grava build/mix.wav.
Tudo é gerado por síntese (sem samples de terceiros), então não há problema de direitos.
"""
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
rs = np.random.default_rng(42)
ts = lambda i: next(c for c in tl["clips"] if c["id"] == i)["start"]
te = lambda i: next(c for c in tl["clips"] if c["id"] == i)["end"]
S, M = ev["scenes"], ev["marks"]


def tt(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * g


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def reverb(x, secs=2.2, wet=0.25):
    n = int(secs * SR)
    ir = rs.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2)
    ir = lp(ir, 5000)
    y = fftconvolve(x, ir)[: len(x)]
    y /= np.max(np.abs(y)) + 1e-9
    return x * (1 - wet) + y * wet * np.max(np.abs(x))


# ---------------- música ----------------
def note(m):
    return 440 * 2 ** ((m - 69) / 12)


CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]  # Am F C G
chord_len = DUR / 8
t = np.arange(N) / SR

# brilho da trilha por seção (0 escuro … 1 claro) e volume do pad
def curve(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

bright = curve([(0, .8), (S["s4"], .9), (M["DARK"] - .6, 1.0), (M["DARK"], .15), (S["s8"], .25), (S["s9"], .6), (DUR, .8)])
padvol = curve([(0, .55), (ts("e1"), .55), (ts("e1") + .4, .0), (M["DARK"] - .02, 0), (M["DARK"] + .05, .6), (S["s8"], .5), (DUR, .55)])

pad = np.zeros(N)
for ci in range(8):
    notes = CH[ci % 4]
    t0, t1 = ci * chord_len - 0.4, (ci + 1) * chord_len + 0.4
    a, b = max(0, int(t0 * SR)), min(N, int(t1 * SR))
    tc = t[a:b]
    seg = np.zeros(b - a)
    for m in notes:
        f = note(m)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            for k in range(1, 9):  # dente-de-serra limitada, harmônicos atenuados
                seg += np.sin(2 * np.pi * ff * k * tc + k * det * 7) / (k ** 1.6) * np.exp(-(k - 1) * (1.2 - bright[a:b]) * 0.9)
    e = np.ones(b - a)
    x = int(0.4 * SR)
    e[:x] = np.linspace(0, 1, x) if a > 0 else 1
    if b < N: e[-x:] = np.linspace(1, 0, x)
    pad[a:b] += seg * e
pad = lp(pad, 3500) * padvol
pad /= np.max(np.abs(pad)) + 1e-9

# pulso/arpejo (tensão crescente nas cenas 2–5; some no silêncio antes da escuridão)
arp = np.zeros(N)
bpm = 100
step = 60 / bpm / 2
arpvol = curve([(0, 0), (S["s2"] - .1, 0), (S["s2"], .35), (ts("e1") - .2, .9), (ts("e1"), 0), (S["s8"], 0), (S["s8"] + .3, .35), (S["s9"], .35), (DUR - 1.2, .2), (DUR, 0)])
k = 0
tn = 0.0
while tn < DUR:
    ci = int(tn // chord_len) % 4
    m = CH[ci][[1, 2, 3, 4, 3, 2][k % 6]] + 12
    d = tt(0.35)
    pl = (np.sin(2 * np.pi * note(m) * d) + 0.3 * np.sin(4 * np.pi * note(m) * d)) * np.exp(-d * 9)
    i = int(tn * SR)
    add(arp, pl * arpvol[min(i, N - 1)], tn)
    tn += step
    k += 1

# drone grave na escuridão
drone = np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.5 * t + 1)
drone *= curve([(0, 0), (M["DARK"], 0), (M["DARK"] + .1, .8), (S["s8"], .5), (S["s9"], 0), (DUR, 0)])

music = 0.55 * pad + 0.32 * arp + 0.35 * lp(drone, 300)
music = reverb(music, 2.5, 0.3)

# ---------------- efeitos ----------------
def whoosh(d=0.5, lo=300, hi=4000):
    n = tt(d)
    x = rs.standard_normal(len(n))
    out = np.zeros(len(n))
    nseg = 24
    L = len(n) // nseg + 1
    for s in range(nseg):
        p = s / nseg
        f = lo + (hi - lo) * np.sin(np.pi * p)
        seg = bp(x, max(60, f * 0.6), min(20000, f * 1.4))[s * L:(s + 1) * L]
        out[s * L:s * L + len(seg)] = seg
    return out * np.sin(np.pi * n / d) ** 2


def boom(d=1.6, f0=110, f1=32):
    n = tt(d)
    f = f1 + (f0 - f1) * np.exp(-n * 5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-n * 2.2)
    s += lp(rs.standard_normal(len(n)), 900) * np.exp(-n * 9) * 0.8
    return s


def pop():
    n = tt(0.09)
    f = 500 + 900 * (n / 0.09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-n * 45)


def tick():
    n = tt(0.03)
    return (np.sin(2 * np.pi * 2400 * n) + 0.5 * np.sin(2 * np.pi * 1200 * n)) * np.exp(-n * 160)


def sparkle():
    out = np.zeros(int(0.9 * SR))
    for i in range(9):
        n = tt(0.5)
        f = rs.uniform(2200, 5200)
        add(out, np.sin(2 * np.pi * f * n) * np.exp(-n * 10) * 0.5, i * 0.045)
    return out


def implode():
    w = whoosh(0.32, 400, 6000)
    return w[::-1] * np.linspace(0.3, 1, len(w))


def glitch():
    out = np.zeros(int(0.5 * SR))
    for i in range(8):
        n = tt(0.04)
        f = rs.choice([180, 360, 720, 1440])
        add(out, np.sign(np.sin(2 * np.pi * f * n)) * 0.3 * env(len(n), 0.002, 0.01), i * 0.06)
    return lp(out, 4000)


def ghost():
    n = tt(0.9)
    f = 520 + 80 * np.sin(2 * np.pi * 7 * n) - 160 * n
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(n), 0.08, 0.4) * 0.6


def drop():
    n = tt(2.2)
    f = 70 * np.exp(-n * 1.2) + 28
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-n * 1.1)
    s += lp(rs.standard_normal(len(n)), 400) * np.exp(-n * 4) * 0.6
    return s


sfx = np.zeros(N)
lib = {
    "whoosh": (lambda: whoosh(0.5), 0.55), "whoosh_s": (lambda: whoosh(0.3, 600, 5000), 0.3),
    "implode": (implode, 0.6), "boom": (boom, 1.0), "pop": (pop, 0.35), "sparkle": (sparkle, 0.4),
    "glitch": (glitch, 0.35), "ghost": (ghost, 0.45), "drop": (drop, 1.0),
}
for e in ev["events"]:
    fn, g = lib[e["k"]]
    add(sfx, fn(), e["t"] - (0.12 if e["k"].startswith("whoosh") else 0), g)

# tique-taque do contador (cenas 2–5)
tq = S["s2"] + 0.3
while tq < M["DARK"] - 0.1:
    add(sfx, tick(), tq, 0.22)
    tq += 0.5

# vento + estalos de gelo (cena 7)
a, b = S["s7"], S["s8"]
wn = lp(rs.standard_normal(int((b - a) * SR)), 700) * (0.6 + 0.4 * np.sin(np.arange(int((b - a) * SR)) / SR * 2.1))
add(sfx, wn * env(len(wn), 0.4, 0.3), a, 0.35)
for i in range(18):
    tc = rs.uniform(ts("g1"), b - 0.2)
    add(sfx, bp(rs.standard_normal(int(0.02 * SR)), 2000, 7000) * np.exp(-tt(0.02) * 200), tc, 0.25)

# bolhas (cena 8)
for i in range(26):
    n = tt(0.06)
    f = rs.uniform(250, 500) * (1 + 2 * n / 0.06)
    add(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-n * 40), rs.uniform(S["s8"], S["s9"] - 0.2), 0.18)

sfx = reverb(sfx, 1.2, 0.18)

# ---------------- narração + ducking ----------------
voice, vsr = sf.read(ROOT / "build/voice/narration.wav")
assert vsr == SR
v = np.zeros(N)
v[: min(N, len(voice))] = voice[:N]
v = hp(v, 80)
# compressão simples
envv = np.abs(lp(np.abs(v), 15))
gain = np.where(envv > 0.12, (0.12 / (envv + 1e-9)) ** 0.5, 1.0)
v = v * gain
v /= np.max(np.abs(v)) + 1e-9
v = reverb(v, 0.6, 0.06)

duck = lp((np.abs(v) > 0.02).astype(float), 3)
duck = 1 - 0.55 * np.clip(duck * 3, 0, 1)

mix = 1.0 * v + 0.30 * music * duck + 0.55 * sfx
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
# estéreo leve: música/sfx com pequena diferença L/R
L = mix
R = mix.copy()
st = np.stack([L, R], axis=1)
sf.write(ROOT / "build/mix.wav", st, SR)
print("mix ok", len(mix) / SR, "s")
