#!/usr/bin/env python3
"""Gerador de sprites pixel-art de células humanas (sangue / sistema imune).

Todos os sprites têm o mesmo canvas (48x48, fundo transparente) e o centro da
célula fica em (24, 24), o que facilita animar (rotação, pulsar, trocar frames)
sem precisar realinhar nada. O tamanho relativo entre células é respeitado.

Uso:  python3 tools/gerar_celulas.py
Saída: celulas/png (48x48), celulas/png_x8 (384x384), celulas/spritesheet*.png
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFont

N = 48
C = 24.0
LIGHT = (-0.55, -0.65, 0.52)
_l = math.sqrt(sum(v * v for v in LIGHT))
LIGHT = tuple(v / _l for v in LIGHT)
NB4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def hx(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class Ramp:
    """dark, mid, base, light, hi + outline (cor do contorno)."""

    def __init__(self, outline, dark, mid, base, light, hi):
        self.outline, self.dark, self.mid, self.base, self.light, self.hi = (
            hx(outline), hx(dark), hx(mid), hx(base), hx(light), hx(hi))


# ----------------------------------------------------------------- paletas
# (inspiradas na imagem de referência "The Immune System")
RED = Ramp('#4a0d14', '#8e1b24', '#c4262e', '#e63b3b', '#ff6a5a', '#ffc2b0')
PLT = Ramp('#2e1245', '#5b2a86', '#8348b8', '#a867d8', '#c791ee', '#efd2ff')
ORANGE = Ramp('#4a1a05', '#c25a0f', '#ee8a12', '#ffaa1c', '#ffc94a', '#fff0a0')
NUC_ORANGE = Ramp('#5a1c00', '#d1500a', '#ff8a14', '#ffb020', '#ffd24a', '#fff3b0')
NUC_BLUE = Ramp('#0e1c5a', '#2a3bb8', '#2f6bf0', '#3fa2f5', '#7cd2ff', '#d0f4ff')
NUC_PURPLE = Ramp('#260a40', '#4b1a8c', '#6b2fd0', '#8a4cf0', '#b58bff', '#e3d0ff')
EOS = Ramp('#4a1405', '#c8481a', '#ef6e1e', '#ff8f1f', '#ffb040', '#ffe0a0')
EOS_GRAN = Ramp('#5a0a05', '#a81a14', '#d92b1f', '#f04a30', '#ff6b4a', '#ffc0a0')
NK_BLUE = Ramp('#060a3a', '#1b1f9c', '#2a3be0', '#3a63ff', '#5aa0ff', '#b0e0ff')
CYAN = Ramp('#06285a', '#1590c8', '#26b8e8', '#36d1f5', '#7ce8ff', '#d0fbff')
DC_BODY = Ramp('#1c0640', '#4a1699', '#6a22d4', '#8a3df0', '#b078ff', '#e2cbff')
MAGENTA = Ramp('#3a0640', '#a5189b', '#d12fc2', '#f255d8', '#ff8be8', '#ffd0f6')
CD4_BODY = Ramp('#240850', '#5a1a9c', '#8a2fd8', '#b04af0', '#d080ff', '#f0d0ff')
CD8_BODY = Ramp('#0a0a50', '#2a1a9c', '#3a3be0', '#4a6cff', '#70a8ff', '#c8e8ff')
B_BODY = Ramp('#3a0640', '#9a1a8c', '#cc2fc0', '#ee4fd8', '#ff86e8', '#ffd6f6')
PL_BODY = Ramp('#3a0640', '#b02a9e', '#e04fc8', '#ff70e0', '#ff9eee', '#ffe0fa')
GOLD = hx('#ffd23a')
GOLD_HI = hx('#fff3a0')
GOLD_DK = hx('#e69a10')


# ------------------------------------------------------------ máscaras
def ellipse(cx, cy, rx, ry, rough=None):
    m = set()
    for y in range(N):
        for x in range(N):
            dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            lim = 1.0
            if rough:
                th = math.atan2(dy, dx)
                lim += sum(a * math.cos(k * th + p) for a, k, p in rough)
            if math.hypot(dx, dy) <= lim:
                m.add((x, y))
    return m


def poly(pts):
    img = Image.new('L', (N, N), 0)
    ImageDraw.Draw(img).polygon([(x - .5, y - .5) for x, y in pts], fill=1)
    px = img.load()
    return {(x, y) for y in range(N) for x in range(N) if px[x, y]}


def limb(p0, p1, w0, w1):
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    return poly([(x0 + nx * w0 / 2, y0 + ny * w0 / 2), (x1 + nx * w1 / 2, y1 + ny * w1 / 2),
                 (x1 - nx * w1 / 2, y1 - ny * w1 / 2), (x0 - nx * w0 / 2, y0 - ny * w0 / 2)])


def polar(r, deg, cx=C, cy=C):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def line_pts(p0, p1):
    (x0, y0), (x1, y1) = p0, p1
    n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
    return {(int(math.floor(x0 + (x1 - x0) * i / n)), int(math.floor(y0 + (y1 - y0) * i / n)))
            for i in range(n + 1)}


def y_glyph(x, y, deg, stem=3.2, arm=2.4, spread=42):
    """Anticorpo em forma de Y. (x,y) = base do tronco; aponta para `deg`."""
    tip = polar(stem, deg, x, y)
    m = line_pts((x, y), tip)
    m |= line_pts(tip, polar(arm, deg - spread, *tip))
    m |= line_pts(tip, polar(arm, deg + spread, *tip))
    return m


# --------------------------------------------------------------- sprite
class Sprite:
    def __init__(self):
        self.p = {}

    def put(self, m, color):
        for q in m:
            if 0 <= q[0] < N and 0 <= q[1] < N:
                self.p[q] = color

    def shade(self, m, ramp, cx=None, cy=None, rx=None, ry=None, concave=False, spec=True):
        if not m:
            return
        xs, ys = [q[0] for q in m], [q[1] for q in m]
        cx = (min(xs) + max(xs) + 1) / 2 if cx is None else cx
        cy = (min(ys) + max(ys) + 1) / 2 if cy is None else cy
        rx = (max(xs) - min(xs) + 1) / 2 if rx is None else rx
        ry = (max(ys) - min(ys) + 1) / 2 if ry is None else ry
        for (x, y) in m:
            nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            r2 = nx * nx + ny * ny
            if r2 > 1:
                s = math.sqrt(r2)
                nx, ny, nz = nx / s, ny / s, 0.0
            else:
                nz = math.sqrt(1 - r2)
            if concave:
                I = 0.22 - (nx * LIGHT[0] + ny * LIGHT[1]) * 0.85
            else:
                I = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]
            col = (ramp.light if I > 0.78 else ramp.base if I > 0.38 else
                   ramp.mid if I > 0.02 else ramp.dark)
            self.p[(x, y)] = col
        if spec and len(m) > 12:
            hx_, hy_ = int(cx - .42 * rx), int(cy - .5 * ry)
            for q in ((hx_, hy_), (hx_ + 1, hy_)):
                if q in m:
                    self.p[q] = ramp.hi

    def outline(self, color):
        add = set()
        for (x, y) in self.p:
            for dx, dy in NB4:
                q = (x + dx, y + dy)
                if q not in self.p and 0 <= q[0] < N and 0 <= q[1] < N:
                    add.add(q)
        for q in add:
            self.p[q] = color

    def ring(self, m, color):
        """Contorno desenhado sobre pixels já existentes ao redor de `m`."""
        add = set()
        for (x, y) in m:
            for dx, dy in NB4:
                q = (x + dx, y + dy)
                if q in self.p and q not in m:
                    add.add(q)
        for q in add:
            self.p[q] = color

    def extent(self):
        return max(math.hypot(x + .5 - C, y + .5 - C) for x, y in self.p)

    def memory_aura(self):
        """Aura dourada pontilhada + brilhos: marca visual de 'célula de memória'."""
        R = self.extent() + 1.8
        for y in range(N):
            for x in range(N):
                d = math.hypot(x + .5 - C, y + .5 - C)
                if abs(d - R) < 0.55 and (x, y) not in self.p:
                    # anel tracejado: 3 pixels acesos, 2 apagados
                    a = (math.degrees(math.atan2(y + .5 - C, x + .5 - C)) + 360) % 360
                    if int(a / 9) % 5 < 3:
                        self.p[(x, y)] = GOLD if int(a / 9) % 5 != 1 else GOLD_HI
        R += 2.6
        for deg in (-48, 34, 138):
            sx, sy = polar(R, deg)
            sx, sy = int(sx), int(sy)
            for q in ((sx, sy), (sx - 1, sy), (sx + 1, sy), (sx, sy - 1), (sx, sy + 1)):
                if 0 <= q[0] < N and 0 <= q[1] < N:
                    self.p[q] = GOLD
            if 0 <= sx < N and 0 <= sy < N:
                self.p[(sx, sy)] = GOLD_HI

    def image(self):
        img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        px = img.load()
        for (x, y), c in self.p.items():
            if 0 <= x < N and 0 <= y < N:
                px[x, y] = c + (255,)
        return img


def granules(sp, region, avoid, ramp, count, seed, size=2, min_d=3.6):
    """Espalha grânulos 2x2 (com brilho e sombra) dentro de `region`."""
    rnd = random.Random(seed)
    pts = []
    cand = sorted(region)
    tries = 0
    while len(pts) < count and tries < 4000:
        tries += 1
        x, y = rnd.choice(cand)
        blk = {(x + i, y + j) for i in range(size) for j in range(size)}
        if not blk <= region or blk & avoid:
            continue
        if any(math.hypot(x - a, y - b) < min_d for a, b in pts):
            continue
        pts.append((x, y))
        sp.put(blk, ramp.base)
        sp.p[(x, y)] = ramp.hi if ramp.hi else ramp.light
        sp.p[(x + size - 1, y + size - 1)] = ramp.dark
        if size > 1:
            sp.p[(x + 1, y)] = ramp.light
    return pts


def dilate(m, r):
    out = set()
    for x, y in m:
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                if dx * dx + dy * dy <= r * r + 1:
                    out.add((x + dx, y + dy))
    return out


# ====================================================================
#  CÉLULAS
# ====================================================================
def hemacia():
    sp = Sprite()
    rx, ry = 10.6, 10.2
    body = ellipse(C, C, rx, ry, [(0.025, 3, 0.4)])
    # disco bicôncavo: perfil de "toro" (borda alta, centro afundado)
    PEAK = 0.68
    for (x, y) in body:
        nx, ny = (x + .5 - C) / rx, (y + .5 - C) / ry
        d = math.hypot(nx, ny) or 1e-6
        ux, uy = nx / d, ny / d
        if d >= PEAK:
            s = min(1.0, (d - PEAK) / (1 - PEAK))       # normal aponta para fora
        else:
            s = -min(1.0, (PEAK - d) / PEAK) * 0.75      # normal aponta para dentro
        I = (ux * LIGHT[0] + uy * LIGHT[1]) * s + math.sqrt(max(0, 1 - s * s)) * LIGHT[2]
        if d < 0.3:
            col = RED.mid
        else:
            col = (RED.light if I > 0.8 else RED.base if I > 0.45 else
                   RED.mid if I > 0.12 else RED.dark)
        sp.p[(x, y)] = col
    sp.outline(RED.outline)
    # brilho no anel superior esquerdo
    for q in ((18, 16), (19, 15), (17, 17)):
        if q in body:
            sp.p[q] = RED.hi
    return sp


def plaqueta():
    sp = Sprite()
    body = ellipse(C, C, 5.6, 4.4, [(0.05, 3, 1.0)])
    sp.shade(body, PLT)
    for q in ((22, 25), (26, 22), (25, 26), (21, 22)):
        if q in body:
            sp.p[q] = hx('#3d1666')
    sp.outline(PLT.outline)
    return sp


def plaqueta_ativada():
    sp = Sprite()
    rnd = random.Random(7)
    pods = []
    for i, deg in enumerate((-80, -25, 30, 85, 140, 200)):
        L = 9.5 + rnd.uniform(-1.2, 1.8)
        a, b = polar(3, deg), polar(L, deg + rnd.uniform(-10, 10))
        pods.append(limb(a, b, 3.0, 1.1))
    for m in pods:
        sp.put(m, PLT.mid)
    body = ellipse(C, C, 5.8, 5.0, [(0.05, 3, 1.0)])
    sp.shade(body, PLT)
    for q in ((22, 25), (26, 22), (25, 26), (21, 22), (24, 24)):
        if q in body:
            sp.p[q] = hx('#3d1666')
    sp.outline(PLT.outline)
    return sp


def neutrofilo():
    sp = Sprite()
    rnd = random.Random(11)
    for i in range(10):
        deg = i * 36 + rnd.uniform(-5, 5)
        sp.put(limb(polar(11, deg), polar(15.6, deg), 3.2, 0.9), ORANGE.mid)
    body = ellipse(C, C, 12.6, 12.4, [(0.02, 4, 0.6)])
    sp.shade(body, ORANGE)
    sp.outline(ORANGE.outline)
    # núcleo multilobulado (4 lobos ligados por filamentos)
    lobes = [(18, 21), (23.5, 16.6), (30, 19.5), (29.5, 28.5)]
    nuc = set()
    parts = []
    for (lx, ly) in lobes:
        m = ellipse(lx, ly, 3.9, 3.7)
        parts.append((m, lx, ly))
        nuc |= m
    strands = set()
    for a, b in zip(lobes, lobes[1:]):
        strands |= limb(a, b, 1.7, 1.7)
    nuc_all = nuc | strands
    sp.put(strands, NUC_BLUE.mid)
    for m, lx, ly in parts:
        sp.shade(m, NUC_BLUE, lx, ly, 3.9, 3.7)
    sp.ring(nuc_all, NUC_BLUE.outline)
    # grânulos neutros (pontinhos claros)
    region = body - dilate(nuc_all, 2)
    rg = random.Random(3)
    cand = sorted(q for q in region if math.hypot(q[0] - C, q[1] - C) < 10.5)
    pts = []
    for _ in range(3000):
        if len(pts) >= 11:
            break
        q = rg.choice(cand)
        if all(math.hypot(q[0] - a, q[1] - b) > 3.2 for a, b in pts):
            pts.append(q)
            sp.p[q] = ORANGE.hi
    return sp


def eosinofilo():
    sp = Sprite()
    body = ellipse(C, C, 15.2, 12.6, [(0.02, 4, 0.3), (0.015, 3, 1.1)])
    sp.shade(body, EOS)
    sp.outline(EOS.outline)
    n1 = ellipse(19, 23.6, 4.7, 5.6)
    n2 = ellipse(29.5, 24.6, 4.7, 5.6)
    strand = limb((22, 23.6), (27, 24.6), 2.2, 2.2)
    sp.put(strand, NUC_PURPLE.mid)
    sp.shade(n1, NUC_PURPLE, 19, 23.6, 4.7, 5.6)
    sp.shade(n2, NUC_PURPLE, 29.5, 24.6, 4.7, 5.6)
    nuc = n1 | n2 | strand
    sp.ring(nuc, NUC_PURPLE.outline)
    region = {q for q in body if math.hypot((q[0] - C) / 14.2, (q[1] - C) / 11.4) < 1}
    granules(sp, region, dilate(nuc, 2), EOS_GRAN, 13, seed=5, min_d=3.7)
    return sp


def celula_nk():
    sp = Sprite()
    rnd = random.Random(21)
    for i in range(9):
        deg = i * 40 + rnd.uniform(-6, 6)
        sp.put(limb(polar(11, deg), polar(15.2, deg), 3.0, 1.0), CYAN.base)
    body = ellipse(C, C, 12.6, 12.2, [(0.03, 3, 0.2), (0.02, 5, 1.0)])
    sp.shade(body, NK_BLUE)
    sp.outline(NK_BLUE.outline)
    nuc = ellipse(C - 1, C, 6.6, 7.0) - ellipse(C + 4.6, C - 2.2, 2.3, 2.6)
    sp.shade(nuc, NUC_ORANGE, C - 1, C, 6.6, 7.0)
    sp.ring(nuc, NUC_ORANGE.outline)
    region = {q for q in body if math.hypot(q[0] - C, q[1] - C) < 10.8}
    granules(sp, region, dilate(nuc, 2), CYAN, 7, seed=9, min_d=3.6)
    return sp


def celula_dendritica():
    sp = Sprite()
    rnd = random.Random(33)
    for i in range(8):
        deg = i * 45 + rnd.uniform(-8, 8)
        L = 14.5 + rnd.uniform(-1.5, 1.5)
        mid = polar(L, deg)
        sp.put(limb(polar(6, deg), mid, 4.0, 2.0), MAGENTA.mid)
        for s in (-1, 1):
            tip = polar(8 + rnd.uniform(-1, 1), deg + s * (30 + rnd.uniform(-5, 8)), *mid)
            sp.put(limb(mid, tip, 2.2, 1.0), MAGENTA.mid)
        # prolongamento central fino
        sp.put(limb(mid, polar(L + 6.5, deg + rnd.uniform(-6, 6)), 2.0, 1.0), MAGENTA.mid)
    body = ellipse(C, C, 9.3, 8.6, [(0.04, 3, 0.8), (0.03, 2, 0.1)])
    # base clara nos prolongamentos (luz vinda do canto superior esquerdo)
    for (x, y) in list(sp.p):
        if (x + y) % 3 == 0 and (x < C or y < C):
            sp.p[(x, y)] = MAGENTA.base
    sp.shade(body, DC_BODY)
    sp.outline(MAGENTA.outline)
    sp.ring(body, DC_BODY.outline)
    nuc = ellipse(C + 1, C - .5, 4.6, 4.4)
    sp.shade(nuc, NUC_ORANGE, C + 1, C - .5, 4.6, 4.4)
    sp.ring(nuc, NUC_ORANGE.outline)
    return sp


def _nucleo_linfocito(sp, cx=C, cy=C, r=6.8):
    nuc = ellipse(cx, cy, r, r * 0.97)
    sp.shade(nuc, NUC_ORANGE, cx, cy, r, r * 0.97)
    sp.ring(nuc, NUC_ORANGE.outline)
    return nuc


def linfocito_t_cd4():
    sp = Sprite()
    # "bolinhas" (receptores CD4) ao redor da membrana
    knobs = set()
    for i in range(12):
        deg = i * 30 + 8
        k = ellipse(*polar(11.6, deg), 2.4, 2.4)
        knobs |= k
        sp.shade(k, MAGENTA, *polar(11.6, deg), 2.4, 2.4, spec=False)
    body = ellipse(C, C, 11.2, 11.0, [(0.02, 3, 0.5)])
    sp.shade(body, CD4_BODY)
    sp.outline(CD4_BODY.outline)
    sp.ring(body, CD4_BODY.outline)
    _nucleo_linfocito(sp)
    return sp


def linfocito_t_cd8():
    sp = Sprite()
    for i in range(11):
        deg = i * (360 / 11) + 6
        sp.put(limb(polar(10, deg), polar(15.8, deg), 3.4, 0.7), CYAN.base)
    body = ellipse(C, C, 11.0, 10.8, [(0.02, 3, 0.5)])
    sp.shade(body, CD8_BODY)
    sp.outline(CD8_BODY.outline)
    _nucleo_linfocito(sp, r=6.6)
    return sp


def _bcr(sp, rx, ry, n=7, start=14, colors=(hx('#9a4dff'), hx('#c58bff'))):
    """Anticorpos de superfície (BCR): pequenos Y na membrana."""
    for i in range(n):
        deg = start + i * (360 / n)
        t = math.radians(deg)
        # ponto na borda da elipse
        k = 1 / math.hypot(math.cos(t) / rx, math.sin(t) / ry)
        bx, by = C + k * math.cos(t), C + k * math.sin(t)
        base = polar(1.7, deg, bx, by)
        sp.put(y_glyph(*base, deg), colors[i % 2])


def linfocito_b():
    sp = Sprite()
    body = ellipse(C, C, 13.0, 10.8, [(0.02, 3, 0.9)])
    sp.shade(body, B_BODY)
    sp.outline(B_BODY.outline)
    sp.ring(body, B_BODY.outline)
    nuc = ellipse(C - .6, C, 7.2, 6.9)
    sp.shade(nuc, NUC_ORANGE, C - .6, C, 7.2, 6.9)
    sp.ring(nuc, NUC_ORANGE.outline)
    _bcr(sp, 15.6, 13.4)
    return sp


def plasmocito():
    sp = Sprite()
    body = ellipse(C + .5, C, 13.2, 11.0, [(0.025, 3, 0.2), (0.015, 2, 1.0)])
    sp.shade(body, PL_BODY)
    sp.outline(PL_BODY.outline)
    # halo perinuclear (Golgi) – crescente mais claro ao lado do núcleo
    ncx, ncy = 19.0, 24.2
    nuc = ellipse(ncx, ncy, 5.9, 6.2)
    halo = {q for q in dilate(nuc, 3) - dilate(nuc, 1) if q in body and q[0] > ncx - 1}
    sp.put(halo, PL_BODY.light)
    sp.shade(nuc, NUC_PURPLE, ncx, ncy, 5.9, 6.2)
    sp.ring(nuc, NUC_PURPLE.outline)
    # cromatina em "roda de carroça"
    dk = hx('#1a0640')
    for deg in range(0, 360, 60):
        x, y = polar(3.4, deg + 15, ncx, ncy)
        if (int(x), int(y)) in nuc:
            sp.p[(int(x), int(y))] = dk
    sp.p[(int(ncx), int(ncy))] = dk
    # anticorpos secretados (Y soltos)
    rnd = random.Random(2)
    placed = []
    pal = (hx('#a050ff'), hx('#ff60d0'), hx('#6a7bff'))
    for deg in (-70, -35, -5, 28, 62, 98, 150, 200, 235, 262):
        for _ in range(30):
            r = rnd.uniform(16.5, 20.5)
            x, y = polar(r, deg + rnd.uniform(-8, 8))
            ex = math.hypot((x - C - .5) / 13.2, (y - C) / 11.0)
            if ex < 1.35 or not (3 < x < 44 and 3 < y < 44):
                continue
            if any(math.hypot(x - a, y - b) < 5.2 for a, b in placed):
                continue
            placed.append((x, y))
            sp.put(y_glyph(x, y, rnd.uniform(0, 360), 2.6, 2.0), pal[len(placed) % 3])
            break
    return sp


def _com_memoria(fn):
    sp = fn()
    sp.memory_aura()
    return sp


CELULAS = [
    ('hemacia', 'Hemácia', hemacia),
    ('plaqueta', 'Plaqueta', plaqueta),
    ('plaqueta_ativada', 'Plaqueta ativada', plaqueta_ativada),
    ('neutrofilo', 'Neutrófilo', neutrofilo),
    ('eosinofilo', 'Eosinófilo', eosinofilo),
    ('celula_nk', 'Célula NK', celula_nk),
    ('celula_dendritica', 'Célula dendrítica', celula_dendritica),
    ('linfocito_t_cd4', 'Linfócito T CD4+', linfocito_t_cd4),
    ('linfocito_t_cd8', 'Linfócito T CD8+', linfocito_t_cd8),
    ('linfocito_b', 'Linfócito B', linfocito_b),
    ('plasmocito', 'Plasmócito', plasmocito),
    ('memoria_t_cd4', 'T CD4+ de memória', lambda: _com_memoria(linfocito_t_cd4)),
    ('memoria_t_cd8', 'T CD8+ de memória', lambda: _com_memoria(linfocito_t_cd8)),
    ('memoria_b', 'B de memória', lambda: _com_memoria(linfocito_b)),
]


def fonte(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
              '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'celulas')
    for sub in ('png', 'png_x8'):
        os.makedirs(os.path.join(raiz, sub), exist_ok=True)

    imgs = []
    for slug, nome, fn in CELULAS:
        im = fn().image()
        imgs.append((slug, nome, im))
        im.save(os.path.join(raiz, 'png', f'{slug}.png'))
        im.resize((N * 8, N * 8), Image.NEAREST).save(os.path.join(raiz, 'png_x8', f'{slug}.png'))

    # spritesheet nativo (transparente) – 1 linha, pronto para animação/atlas
    sheet = Image.new('RGBA', (N * len(imgs), N), (0, 0, 0, 0))
    for i, (_, _, im) in enumerate(imgs):
        sheet.paste(im, (i * N, 0))
    sheet.save(os.path.join(raiz, 'spritesheet.png'))

    # prévia ampliada com legendas, fundo escuro como na referência
    cols, esc = 5, 6
    cw, ch = N * esc + 20, N * esc + 52
    rows = math.ceil(len(imgs) / cols)
    W, H = cols * cw + 20, rows * ch + 90
    prev = Image.new('RGBA', (W, H), hx('#0b0a4a') + (255,))
    d = ImageDraw.Draw(prev)
    titulo, ft = 'Células humanas – pixel art', fonte(24)
    d.rectangle([20, 18, 48 + d.textlength(titulo, font=ft), 58], fill=hx('#ffb81c'))
    d.text((34, 24), titulo, font=ft, fill=hx('#1a0a4a'))
    for i, (slug, nome, im) in enumerate(imgs):
        r, c = divmod(i, cols)
        x0, y0 = 20 + c * cw, 80 + r * ch
        prev.alpha_composite(im.resize((N * esc, N * esc), Image.NEAREST), (x0 + 10, y0))
        f = fonte(15)
        tw = d.textlength(nome, font=f)
        bx = x0 + 10 + (N * esc - tw) / 2
        d.rectangle([bx - 8, y0 + N * esc + 6, bx + tw + 8, y0 + N * esc + 30], fill=hx('#5b1ff0'))
        d.text((bx, y0 + N * esc + 9), nome, font=f, fill=hx('#ffffff'))
    prev.convert('RGB').save(os.path.join(raiz, 'spritesheet_preview.png'))
    print(f'{len(imgs)} sprites gerados em {os.path.normpath(raiz)}')


if __name__ == '__main__':
    main()
