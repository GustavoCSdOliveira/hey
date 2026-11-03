#!/usr/bin/env python3
"""Gera os 32 quadros do storyboard "Um nerd sobreviveria a um apocalipse?".

Saída: svg/NN.svg (1920x1080, camadas nomeadas para animar) e storyboard.html.
Cada SVG tem grupos com id: fundo, meio, personagem, frente, rotulos, hud.
Cores seguem o Guia de Estilo Visual (Kurzgesagt).
"""
import json
import math
import os
import random
import re
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080

# ---- Paleta (do guia) ----
CY, CYL, CYW = "#16F1FA", "#4DF7F9", "#91FCF9"
NIGHT, ULTRA, ROYAL = "#090A4E", "#1620C1", "#1587F0"
PURP, VIOL, LILAC = "#46068F", "#7F1AE3", "#DECEE0"
MAG, ORG, PEACH = "#D12686", "#F29E0C", "#F1AF64"
MINT, EMBER, YEL = "#17D985", "#C9351E", "#F2CB26"
DEEP, DEEP2 = "#020027", "#0C0245"
FOR1, FOR2, LEAF, LEAF2 = "#2A454D", "#13303F", "#6D925C", "#88B373"
OCE1, OCE2, OCE3 = "#14497A", "#0F6B87", "#65E3D2"
ALERT = "#E40839"

BGS = {  # nome: (topo, base)
    "night": (NIGHT, ULTRA), "cyan": (CY, CYL), "space": (DEEP, DEEP2),
    "ocean": (OCE1, OCE2), "forest": (FOR1, FOR2), "purple": (PURP, "#2a0a63"),
    "warm": (FOR2, FOR1),
}
GLOWS = {"cy": CYW, "yl": YEL, "or": ORG, "mg": MAG, "rd": EMBER, "mt": MINT, "wh": LILAC}


def defs():
    out = ["<defs>"]
    for k, (a, b) in BGS.items():
        out.append(f'<linearGradient id="bg_{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>')
    for k, c in GLOWS.items():
        out.append(f'<radialGradient id="g_{k}"><stop offset="0" stop-color="{c}" stop-opacity=".9"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>')
    out.append("</defs>")
    return "".join(out)


# ---- primitivas ----
def circ(x, y, r, fill, op=1, extra=""):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" opacity="{op}" {extra}/>'


def rr(x, y, w, h, r, fill, op=1, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" opacity="{op}" {extra}/>'


def glow(x, y, r, k="cy", op=1):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#g_{k})" opacity="{op}"/>'


def line(x1, y1, x2, y2, c, w=8, extra=""):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" stroke-linecap="round" {extra}/>'


def txt(x, y, s, size=40, fill="#fff", anchor="middle", extra=""):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" '
            f'font-weight="800" {extra}>{escape(s)}</text>')


def label(cx, cy, s, fill=MAG, size=44, rot=0):
    w = len(s) * size * 0.76 + 56
    h = size * 1.55
    g = f'<g transform="rotate({rot} {cx} {cy})">'
    g += rr(cx - w / 2, cy - h / 2, w, h, 12, fill)
    g += txt(cx, cy + size * 0.35, s, size)
    return g + "</g>"


def num(cx, cy, n, c=VIOL, r=46):
    return circ(cx, cy, r, "#fff") + txt(cx, cy + 18, str(n), 52, c)


def particles(seed, n, c="#fff", y0=0, y1=H):
    r = random.Random(seed)
    return "".join(circ(r.randint(20, W - 20), r.randint(y0, y1), r.choice([3, 4, 5, 7, 9]), c, round(r.uniform(.2, .7), 2))
                   for _ in range(n))


def drop(x, y, s, c=CYL, op=1):
    return (f'<path transform="translate({x} {y}) scale({s})" opacity="{op}" fill="{c}" '
            f'd="M0,-1 C0.6,-0.2 0.9,0.2 0.9,0.5 A0.9,0.9 0 0 1 -0.9,0.5 C-0.9,0.2 -0.6,-0.2 0,-1Z"/>')


def flame(x, y, s):
    p = "M0,-1 C0.5,-.4 0.85,0 0.72,.5 A.72,.72 0 0 1 -.72,.5 C-.85,0 -.3,-.3 0,-1Z"
    out = glow(x, y - s * .2, s * 2.2, "or", .8)
    for k, c in ((1, EMBER), (.72, ORG), (.42, YEL)):
        out += f'<path transform="translate({x} {y + s * (1 - k) * .5}) scale({s * k})" fill="{c}" d="{p}"/>'
    return out


def cap(x, y, r, fill, shade=None):
    """Círculo com sombra de matiz e reflexo (3 tons + reflexo)."""
    shade = shade or PURP
    return (circ(x, y, r, shade) + circ(x - r * .07, y - r * .07, r * .93, fill) +
            f'<ellipse cx="{x - r * .4}" cy="{y - r * .45}" rx="{r * .22}" ry="{r * .12}" fill="#fff" opacity=".55" transform="rotate(-30 {x - r * .4} {y - r * .45})"/>')


def teo(x, y, s=1.0, mood="ok", aL=14, aR=-14, flip=False, look=0):
    """Téo. (x, y) = centro dos pés. Camada 'personagem'."""
    sx = -s if flip else s
    g = f'<g class="teo" transform="translate({x} {y}) scale({sx} {s})">'
    g += rr(-50, -165, 42, 150, 20, ULTRA) + rr(8, -165, 42, 150, 20, ULTRA)
    g += f'<ellipse cx="-30" cy="-10" rx="40" ry="18" fill="{LILAC}"/><ellipse cx="30" cy="-10" rx="40" ry="18" fill="{LILAC}"/>'
    # braço esquerdo (atrás) / direito
    for side, ang in ((-1, aL), (1, aR)):
        sx0 = side * 64
        g += (f'<g class="braco" transform="rotate({ang} {sx0} -350)">'
              + rr(sx0 - 15, -360, 30, 135, 15, MAG) + circ(sx0, -218, 22, PEACH) + "</g>")
    g += rr(-72, -395, 144, 255, 54, PURP) + rr(-72, -395, 116, 255, 54, MAG)
    g += rr(-42, -255, 84, 52, 22, PURP, .45)
    g += f'<g class="cabeca">'
    g += circ(-82, -452, 16, PEACH) + circ(82, -452, 16, PEACH)
    g += circ(0, -452, 84, "#c8844a") + circ(-4, -456, 80, PEACH)
    g += f'<path d="M-86,-455 A86,86 0 0 1 86,-455 C50,-512 -45,-510 -86,-455Z" fill="{NIGHT}"/>'
    dx = look
    if mood == "happy":
        pup, py = 11, -446
    elif mood == "shock":
        pup, py = 5, -448
    elif mood == "sad":
        pup, py = 11, -436
    else:
        pup, py = 11, -446
    for ex in (-36, 36):
        g += circ(ex, -448, 30, "#fff", extra=f'stroke="{ULTRA}" stroke-width="7"')
        g += circ(ex + dx + 4, py, pup, NIGHT)
        g += circ(ex + dx + 8, py - 5, 3.5, "#fff")
    g += line(-6, -448, 6, -448, ULTRA, 7)
    if mood == "sad":
        g += line(-62, -500, -16, -488, NIGHT, 7) + line(62, -500, 16, -488, NIGHT, 7)
        g += drop(104, -495, 15, CYL)
    elif mood == "happy":
        g += line(-60, -494, -14, -498, NIGHT, 7) + line(14, -498, 60, -494, NIGHT, 7)
        g += circ(-58, -418, 14, "#E7467A", .55) + circ(58, -418, 14, "#E7467A", .55)
    elif mood == "shock":
        g += line(-60, -498, -14, -506, NIGHT, 7) + line(14, -506, 60, -498, NIGHT, 7)
    else:
        g += line(-58, -496, -14, -496, NIGHT, 7) + line(14, -496, 58, -496, NIGHT, 7)
    g += "</g></g>"
    return g


def person(x, y, s, body, head=PEACH, hair=NIGHT):
    """Boneco de multidão: bloco + cabeça."""
    return (f'<g transform="translate({x} {y}) scale({s})">' + rr(-26, -100, 52, 100, 22, body)
            + circ(0, -126, 26, head) + f'<path d="M-27,-130 A27,27 0 0 1 27,-130 Z" fill="{hair}"/></g>')


def hud(v, only=None):
    """Barras de status no canto inferior direito. v = dict de 0..1."""
    rows = [("ÁGUA", "agua", CYW), ("COMIDA", "comida", ORG), ("ENERGIA", "energia", YEL), ("MORAL", "moral", MINT)]
    g = '<g id="hud_barras">' + rr(1340, 800, 540, 240, 26, NIGHT, .62)
    for i, (nome, k, c) in enumerate(rows):
        y = 842 + i * 50
        val = max(0, min(1, v.get(k, 1)))
        col = c if val > .3 else EMBER
        g += txt(1372, y + 22, nome, 24, "#fff", "start")
        g += rr(1540, y, 310, 28, 14, "#000", .0) + rr(1540, y, 310, 28, 14, DEEP2, .8)
        if val > 0:
            g += rr(1540, y, max(28, 310 * val), 28, 14, col)
    return g + "</g>"


def hud_big(v):
    rows = [("ÁGUA", "agua", CYW), ("COMIDA", "comida", ORG), ("ENERGIA", "energia", YEL), ("MORAL", "moral", MINT)]
    g = rr(1000, 250, 740, 500, 40, NIGHT, .7)
    for i, (nome, k, c) in enumerate(rows):
        y = 320 + i * 100
        g += txt(1050, y + 36, nome, 40, "#fff", "start")
        g += rr(1290, y, 400, 48, 24, DEEP2, .9) + rr(1290, y, 400 * v.get(k, 1), 48, 24, c)
    return g


# ---- ícones ----
def wifi(x, y, s, c):
    g = f'<g transform="translate({x} {y}) scale({s})" fill="none" stroke="{c}" stroke-width="22" stroke-linecap="round">'
    for r in (110, 70, 30):
        a = math.radians(40)
        g += f'<path d="M{-r * math.sin(a):.1f},{-r * math.cos(a):.1f} A{r},{r} 0 0 1 {r * math.sin(a):.1f},{-r * math.cos(a):.1f}"/>'
    return g + f'<circle r="2" cy="30" fill="{c}"/></g>'


def xmark(x, y, s, c=EMBER, w=22):
    return line(x - s, y - s, x + s, y + s, c, w) + line(x - s, y + s, x + s, y - s, c, w)


def bulb(x, y, s, on, col=YEL):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    if on:
        g += glow(0, -20, 150, "yl")
    g += circ(0, -20, 70, col if on else "#3a3f8f") + rr(-34, 40, 68, 54, 14, LILAC if on else "#555aa5")
    g += rr(-26, 96, 52, 20, 10, "#9aa" if on else "#444a95")
    return g + "</g>"


def tap(x, y, s, dr=True):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += rr(-110, -90, 190, 50, 24, LILAC) + rr(40, -90, 44, 140, 22, LILAC) + rr(-30, -140, 36, 60, 12, PURP)
    if dr:
        g += drop(62, 100, 22, CYL)
    return g + "</g>"


def pizza_box(x, y, s):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += rr(-130, -20, 260, 110, 14, ORG) + rr(-130, -60, 260, 60, 14, "#d98405", extra="")
    g += f'<path d="M-130,-30 L-100,-110 L100,-110 L130,-30Z" fill="{PEACH}"/>' + rr(-60, 10, 120, 16, 8, YEL, .7)
    return g + "</g>"


def earth(x, y, r):
    g = glow(x, y, r * 1.9, "cy", .8) + cap(x, y, r, ROYAL, ULTRA)
    for dx, dy, rx, ry in ((-.3, -.2, .32, .22), (.25, .15, .28, .34), (-.05, .55, .3, .12)):
        g += f'<ellipse cx="{x + dx * r}" cy="{y + dy * r}" rx="{rx * r}" ry="{ry * r}" fill="{LEAF2}"/>'
    return g


def book(x, y, s, c=VIOL, g_=True):
    out = f'<g transform="translate({x} {y}) scale({s})">'
    if g_:
        out += glow(0, 0, 230, "yl", .9)
    out += rr(-110, -80, 220, 160, 16, c) + rr(-100, -70, 100, 140, 10, LILAC) + rr(6, -70, 94, 140, 10, LILAC)
    for i in range(4):
        out += line(-88, -40 + i * 28, -14, -40 + i * 28, "#9a8fc0", 6) + line(18, -40 + i * 28, 88, -40 + i * 28, "#9a8fc0", 6)
    return out + "</g>"


def germ(x, y, s, rot=0):
    g = f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
    g += f'<path d="M-60,0 C-60,-40 -20,-52 15,-45 C60,-38 70,0 55,30 C35,58 -45,50 -60,0Z" fill="{MINT}"/>'
    for dx, dy in ((-25, -5), (10, -15), (25, 18), (-10, 22), (40, 0)):
        g += circ(dx, dy, 7, YEL)
    g += f'<path d="M-60,0 C-90,-20 -100,20 -130,0" fill="none" stroke="{MINT}" stroke-width="10" stroke-linecap="round"/>'
    return g + "</g>"


def can(x, y, s, rot=0, c=LILAC):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">' + rr(-35, -50, 70, 100, 12, c)
            + rr(-35, -26, 70, 36, 4, MAG) + f'<ellipse cx="0" cy="-50" rx="35" ry="9" fill="#fff" opacity=".7"/></g>')


def mushroom(x, y, s, cap_c=MAG, danger=False):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    if danger:
        g += glow(0, -30, 180, "rd", .9)
    g += rr(-26, -30, 52, 90, 22, LILAC) + f'<path d="M-100,-20 C-100,-130 100,-130 100,-20Z" fill="{cap_c}"/>'
    for dx, dy, r in ((-45, -60, 12), (10, -85, 14), (50, -50, 10), (-5, -45, 8)):
        g += circ(dx, dy, r, "#fff", .85)
    return g + "</g>"


def sun(x, y, r):
    return glow(x, y, r * 3, "yl", .9) + circ(x, y, r, YEL) + circ(x, y, r * .78, "#FCF4E3", .6)


def panel_solar(x, y, s):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += f'<path d="M-130,60 L-90,-60 L130,-60 L90,60Z" fill="{ROYAL}" stroke="{CYW}" stroke-width="8" stroke-linejoin="round"/>'
    for i in range(1, 3):
        g += line(-130 + i * 73 - i * 13 + 13, 60, -90 + i * 73 - i * 13 + 13, -60, CYW, 4)
    g += line(-110, 0, 110, 0, CYW, 4) + rr(-8, 60, 16, 70, 6, LILAC)
    return g + "</g>"


def laptop(x, y, s, charge=.2):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    g += rr(-130, -150, 260, 160, 14, NIGHT) + rr(-116, -136, 232, 132, 8, CYL if charge > .2 else "#3b4fd0")
    g += rr(-160, 4, 320, 20, 10, LILAC)
    return g + "</g>"


def sprout(x, y, s, stage):
    g = f'<g transform="translate({x} {y}) scale({s})">'
    if stage == 0:
        g += circ(0, 0, 14, ORG)
    else:
        h = 60 + stage * 60
        c = LEAF2 if stage < 4 else "#8a6a2a"
        g += rr(-6, -h, 12, h, 6, c)
        for i in range(stage):
            yy = -h + 20 + i * 36
            dxs = -1 if i % 2 else 1
            g += f'<ellipse cx="{dxs * 28}" cy="{yy}" rx="28" ry="14" fill="{c}" transform="rotate({dxs * -25} {dxs * 28} {yy})"/>'
        if stage == 4:
            g += line(-30, -h - 10, 30, -h + 40, EMBER, 8)
    return g + "</g>"


def tree(x, y, s, c=LEAF, c2=LEAF2):
    return (f'<g transform="translate({x} {y}) scale({s})">' + rr(-18, -150, 36, 150, 14, "#1d3a40")
            + circ(0, -210, 90, c) + circ(-40, -170, 60, c2) + circ(50, -175, 55, c2) + "</g>")


def piece(x, y, w, h, c, shade, lab=None, eyes=True, tab=True):
    g = rr(x - w / 2, y - h / 2 + 8, w, h, 36, shade) + rr(x - w / 2, y - h / 2, w, h, 36, c)
    if tab:
        g += circ(x, y - h / 2 - 6, 24, c) + circ(x + w / 2 + 6, y, 22, shade)
    if eyes:
        g += circ(x - 24, y - 8, 14, "#fff") + circ(x + 24, y - 8, 14, "#fff") + circ(x - 21, y - 6, 6, NIGHT) + circ(x + 27, y - 6, 6, NIGHT)
    return g


# ---- cenas ----
def L(**kw):
    return {k: kw.get(k, "") for k in ("fundo", "meio", "personagem", "frente", "rotulos", "hud")}


def s1():
    f = rr(1000, 250, 640, 400, 36, ULTRA) + rr(1030, 280, 580, 340, 20, CYL) + rr(1280, 650, 80, 90, 10, PURP) + rr(1200, 730, 240, 30, 15, PURP)
    f += wifi(1320, 490, 1.3, ULTRA) + xmark(1320, 440, 130, EMBER, 30)
    pulse = circ(1320, 450, 260, EMBER, .18) + circ(1320, 450, 330, EMBER, .1)
    sofa = rr(300, 760, 560, 200, 70, VIOL) + rr(300, 700, 560, 110, 60, "#9b46ee") + rr(260, 740, 80, 230, 36, PURP) + rr(820, 740, 80, 230, 36, PURP)
    return L(fundo=glow(1320, 450, 600, "cy", .35), meio=pulse + f, personagem=teo(600, 870, .9, "sad", look=10), frente=sofa,
             rotulos=label(1320, 190, "SEM SINAL", EMBER, 46))


def s2():
    panels = ["#0b0e5c", "#0d1b6e", "#241067"]
    m = ""
    for i, c in enumerate(panels):
        m += rr(i * 640, 0, 640, H, 0, c)
    m += bulb(320, 480, 1.7, False) + tap(960, 470, 1.8) + pizza_box(1600, 520, 1.5)
    for i in (1, 2):
        m += rr(i * 640 - 4, 0, 8, H, 0, "#fff", .9)
    r = label(320, 880, "SEM LUZ", MAG, 50) + label(960, 880, "SEM ÁGUA", ROYAL, 50) + label(1600, 880, "SEM PIZZA", VIOL, 50)
    return L(meio=m, rotulos=r)


def s3():
    m = earth(960, 430, 320)
    r = txt(100, 900, "NERD vs. APOCALIPSE", 120, "#fff", "start", 'letter-spacing="2"') + txt(106, 975, "ELE SOBREVIVE?", 48, CYW, "start", 'letter-spacing="14"')
    return L(meio=m, rotulos=r)


def s4():
    return L(fundo=glow(960, 520, 700, "cy", .35), personagem=teo(960, 1060, 2.0, "ok"), rotulos=label(1480, 250, "SPOILER", MAG, 74, -8))


def s5():
    m = book(360, 420, .9, VIOL, True)
    pad = rr(1440, 360, 260, 130, 60, VIOL) + circ(1500, 425, 22, CYW) + circ(1640, 425, 22, MAG)
    m += glow(1570, 425, 220, "mg", .5) + pad
    return L(meio=m, personagem=teo(960, 1000, 1.45, "happy"),
             rotulos=label(360, 640, "LEU 300 WIKIS", VIOL, 42) + label(1570, 640, "ZEROU 40 JOGOS", ROYAL, 42))


def s6():
    r = ""
    ls = [(1, "CURIOSIDADE"), (2, "PACIÊNCIA"), (3, "LER O MANUAL")]
    for i, (n, t) in enumerate(ls):
        y = 300 + i * 190
        r += num(260, y, n, VIOL) + label(640, y, t, VIOL if n < 3 else ORG, 52)
    return L(meio=glow(1500, 520, 420, "yl", .55) + book(1500, 520, 1.5, MAG, False), rotulos=r, fundo=glow(1500, 520, 520, "wh", .35))


def s7():
    r = ""
    ls = [(1, "CORPO DE PLANTA"), (2, "MÃO DE TECLADO"), (3, "SOL? RARO")]
    for i, (n, t) in enumerate(ls):
        y = 300 + i * 190
        r += num(260, y, n, ORG) + label(660, y, t, ORG, 50)
    jug = rr(1180, 700, 150, 190, 40, ROYAL) + rr(1220, 660, 70, 60, 18, ROYAL) + drop(1255, 790, 40, CYW)
    return L(meio=glow(1500, 700, 360, "or", .25) + jug, personagem=teo(1520, 1000, 1.25, "sad", aL=70, aR=-70), rotulos=r)


def s8():
    return L(personagem=teo(520, 1020, 1.5, "ok"), meio=hud_big({"agua": 1, "comida": 1, "energia": 1, "moral": 1}),
             rotulos=label(1370, 190, "STATUS INICIAL", MAG, 54))


def city(lit):
    g = ""
    r = random.Random(4)
    x = 0
    while x < W:
        w = r.randint(120, 220)
        h = r.randint(260, 620)
        g += rr(x, 780 - h + 220, w - 10, h, 6, "#1620C1" if x / W < lit else "#0f1470")
        for wy in range(780 - h + 250, 960, 60):
            for wx in range(x + 20, x + w - 40, 50):
                on = (x / W < lit) and r.random() > .25
                g += rr(wx, wy, 24, 30, 4, YEL if on else "#0b0f5a", 1)
        x += w
    return g


def s9():
    return L(fundo=glow(300, 300, 500, "yl", .12), meio=city(.45) + rr(0, 1000, W, 80, 0, DEEP),
             rotulos=label(220, 120, "DIA 1", ORG, 60) + label(1500, 150, "SEM REDE", EMBER, 56))


def s10():
    pn = panel_solar(380, 880, 1.5) + panel_solar(720, 900, 1.2) + panel_solar(1560, 900, 1.3)
    return L(fundo=sun(1540, 230, 90), meio=pn, personagem=teo(1060, 1060, 1.5, "happy", aL=160, aR=-160),
             rotulos=label(380, 520, "PAINEL SOLAR", ROYAL, 48))


def box(x, y, w, h, t, c):
    return rr(x - w / 2, y - h / 2, w, h, 24, c) + txt(x, y + 16, t, 44)


def s11():
    m = ""
    xs = [(220, "SOL", ORG), (620, "PAINEL", ROYAL), (1060, "INVERSOR", VIOL), (1560, "CASA", MAG)]
    for x, t, c in xs:
        m += box(x, 470, 300 if t == "INVERSOR" else 250, 150, t, c)
    for x1, x2 in ((350, 490), (760, 870), (1250, 1420)):
        m += line(x1, 470, x2, 470, CYW, 12) + f'<path d="M{x2 + 22},470 L{x2 - 10},445 L{x2 - 10},495Z" fill="{CYW}"/>'
    m += xmark(1335, 470, 55, EMBER, 22) + glow(1335, 470, 130, "rd", .6)
    return L(meio=m, rotulos=label(960, 760, "SEM REDE, SEM ENERGIA", EMBER, 60))


def s12():
    bat = rr(1230, 380, 360, 190, 34, LILAC) + rr(1590, 430, 36, 90, 12, LILAC) + rr(1250, 400, 90, 150, 20, EMBER)
    return L(meio=laptop(520, 720, 2.0, .1) + bat + glow(1330, 480, 260, "rd", .3), personagem=teo(1000, 1060, 1.1, "sad", aL=50, aR=-50),
             rotulos=label(310, 170, "LIÇÃO 1", ORG, 56) + label(1410, 250, "BATERIA 8%", EMBER, 50),
             hud=hud({"agua": 1, "comida": 1, "energia": .45, "moral": .9}))


def s13():
    m = ""
    items = [(380, "3 MINUTOS", "ar"), (960, "3 DIAS", "agua"), (1540, "3 SEMANAS", "comida")]
    for x, t, k in items:
        m += circ(x, 440, 150, "#fff", .95)
        if k == "ar":
            m += f'<ellipse cx="{x - 45}" cy="440" rx="40" ry="70" fill="{MAG}"/><ellipse cx="{x + 45}" cy="440" rx="40" ry="70" fill="{MAG}"/>' + line(x, 360, x, 430, VIOL, 10)
        elif k == "agua":
            m += drop(x, 440, 90, ROYAL)
        else:
            m += circ(x, 440, 90, ORG) + circ(x, 440, 62, PEACH)
        m += label(x, 700, t, ROYAL if k != "comida" else ORG, 52)
    return L(meio=m, rotulos=label(960, 140, "A REGRA DOS 3 (APROXIMADA)", NIGHT, 52))


def s14():
    wave = f'<path d="M0,700 C300,620 500,780 900,700 S1500,620 {W},700 L{W},{H} L0,{H}Z" fill="{OCE2}"/>'
    wave += f'<path d="M0,780 C300,720 600,850 1000,780 S1600,730 {W},790 L{W},{H} L0,{H}Z" fill="{OCE1}"/>'
    lens = circ(1080, 400, 280, NIGHT, .55) + circ(1080, 400, 270, OCE3, .35)
    lens += germ(960, 380, 1.6, 10) + germ(1210, 470, 1.1, -30) + germ(1100, 300, .8, 40)
    lens += circ(1080, 400, 280, "none", extra='stroke="#fff" stroke-width="16"') + line(1280, 600, 1500, 820, "#fff", 24)
    return L(meio=wave + lens, personagem=teo(430, 1040, 1.2, "shock", look=12), rotulos=label(1080, 90, "MICRÓBIOS", MINT, 56))


def s15():
    sticks = "".join(line(840 + i * 18, 880, 940 - i * 12, 840 - i * 6, "#a86f3b", 14) for i in range(5))
    smoke = "".join(circ(1010 + i * 30, 740 - i * 70, 34 + i * 12, LILAC, .5 - i * .1) for i in range(4))
    return L(meio=sticks + flame(900, 840, 40) + smoke, personagem=teo(520, 1040, 1.35, "sad", aL=60, aR=-40, look=10),
             rotulos=label(1180, 330, "FOGO?", EMBER, 64, 6))


def s16():
    rays = "".join(line(1250 + 230 * math.cos(a), 600 + 230 * math.sin(a), 1250 + 380 * math.cos(a), 600 + 380 * math.sin(a), "#fff", 10, 'opacity=".8"')
                   for a in [i * math.pi / 6 for i in range(12)])
    return L(meio=rays + flame(1250, 640, 140), personagem=teo(560, 1040, 1.4, "happy", aL=20, aR=-150),
             rotulos=label(1250, 200, "TENTATIVA 14", ORG, 64) + txt(1250, 330, "✓", 90, MINT))


def s17():
    pot = rr(700, 600, 520, 290, 70, "#30535A") + rr(660, 590, 600, 40, 20, LILAC) + rr(1220, 660, 120, 36, 18, "#30535A") + rr(580, 660, 120, 36, 18, "#30535A")
    wat = rr(720, 600, 480, 30, 15, CYL)
    steam = "".join(circ(780 + i * 85, 520 - (i % 3) * 70, 26 + (i % 2) * 10, CYW, .55) for i in range(6))
    return L(meio=flame(960, 930, 80) + pot + wat + steam, personagem=teo(300, 1040, 1.2, "happy", aL=150, aR=-18, flip=False),
             rotulos=label(960, 190, "+1 PERSISTÊNCIA", MINT, 58), hud=hud({"agua": 1, "comida": .75, "energia": .5, "moral": .85}))


def s18():
    shelf = "".join(rr(260, y, 1400, 28, 10, "#3a6a70") for y in (400, 640))
    cans = can(400, 360, 1.0) + can(560, 360, 1.0, 8, CYW) + can(1100, 600, 1.0, -20, ORG) + can(1260, 650, .9, 80) + can(1420, 880, .9, 100)
    plate = circ(960, 880, 120, LILAC) + circ(960, 880, 80, "#fff", .8)
    return L(fundo=glow(960, 540, 900, "rd", .12), meio=shelf + cans + plate, rotulos=label(960, 150, "SEMANA 2", ORG, 60),
             hud=hud({"agua": 1, "comida": .08, "energia": .5, "moral": .6}))


def s19():
    m = mushroom(380, 760, 1.5, MAG) + mushroom(780, 780, 1.2, ORG) + mushroom(1240, 750, 1.7, VIOL, True) + mushroom(1600, 790, 1.1, MINT)
    bal = rr(1240, 120, 560, 190, 40, "#fff") + f'<path d="M1330,310 L1300,370 L1390,310Z" fill="#fff"/>'
    pix = "".join(rr(1290 + i * 70, 150, 60, 60, 4, c) for i, c in enumerate((LEAF, LEAF2, LEAF, LEAF2, LEAF)))
    return L(fundo=glow(1240, 700, 400, "rd", .35), meio=m + bal + pix, personagem=teo(190, 1050, .9, "shock"),
             rotulos=label(1520, 270, "MINECRAFT", NIGHT, 36) + label(1240, 560, "?", EMBER, 80, 0))


def s20():
    m = rr(0, 800, W, 280, 0, PURP) + rr(0, 790, W, 22, 0, VIOL)
    labs = ""
    for i, (stage, t) in enumerate(((0, "SEMANA 1"), (1, "SEMANA 3"), (2, "SEMANA 6"), (4, "SEMANA 9"))):
        x = 330 + i * 420
        m += sprout(x, 790, 1.4, stage)
        labs += label(x, 920, t, ROYAL if stage < 4 else EMBER, 40)
        if i < 3:
            m += f'<path d="M{x + 120},560 L{x + 270},560" stroke="{CYW}" stroke-width="10" stroke-linecap="round"/><path d="M{x + 290},560 L{x + 258},535 L{x + 258},585Z" fill="{CYW}"/>'
    return L(fundo=circ(1400, 240, 140, LEAF2, .25) + circ(500, 180, 90, LEAF2, .2), meio=m, rotulos=labs + label(960, 140, "A HORTA NÃO É INSTANTÂNEA", MINT, 54))


def s21():
    sheet = rr(140, 160, 1000, 760, 36, ROYAL)
    for r_ in range(5):
        for c_ in range(4):
            sheet += rr(170 + c_ * 240, 270 + r_ * 125, 215, 100, 18, CYW if (r_ + c_) % 2 else "#4fb0ff", .85)
    sheet += rr(170, 190, 940, 60, 18, NIGHT, .75) + txt(640, 235, "CALORIAS  ·  RAÇÃO/DIA", 36)
    mp = rr(1240, 160, 560, 760, 36, "#1f5360") + f'<path d="M1320,820 C1420,640 1500,700 1560,520 S1700,380 1720,260" fill="none" stroke="{YEL}" stroke-width="12" stroke-dasharray="26 22" stroke-linecap="round"/>'
    mp += circ(1320, 820, 24, MAG) + sprout(1720, 300, .7, 2) + glow(1720, 250, 120, "mt", .6)
    return L(meio=sheet + mp, rotulos=label(640, 90, "PLANILHA DO APOCALIPSE", MAG, 52) + label(1520, 90, "ROTA DA HORTA", MINT, 40))


def s22():
    m = "".join(tree(x, 900, 1.6 + (i % 2) * .6, LEAF if i % 2 else FOR1, LEAF2 if i % 2 else LEAF) for i, x in enumerate((100, 520, 1300, 1700)))
    return L(fundo=glow(960, 540, 700, "wh", .08), meio=m, personagem=teo(960, 1030, .75, "sad"),
             hud=hud({"agua": .9, "comida": .1, "energia": .5, "moral": .3}))


def s23():
    m = rr(0, 0, 960, H, 0, "#3d0a8c") + rr(960, 0, 960, H, 0, "#2a0a63") + rr(954, 0, 12, H, 0, "#fff", .9)
    m += book(480, 380, 1.2, MAG, True) + glow(480, 230, 200, "cy", .5)
    m += f'<path d="M1370,330 l40,-70 l60,0 l-35,60 l60,60 l-50,50 l-60,-40 l-70,100 l-40,-30Z" fill="{LILAC}"/>'
    return L(meio=m, personagem=teo(480, 1060, .85, "happy", aL=70) + teo(1440, 1060, .85, "sad", aL=60, aR=-60),
             rotulos=label(480, 120, "SABER", ROYAL, 62) + label(1440, 120, "FAZER", EMBER, 62))


def s24():
    hd = rr(380, 380, 400, 280, 30, LILAC) + circ(580, 520, 80, "#9a8fc0") + circ(580, 520, 24, NIGHT) + rr(400, 610, 360, 28, 14, EMBER)
    return L(meio=hd + book(1380, 520, 1.5, MAG, True) + glow(1380, 520, 350, "yl", .35),
             rotulos=label(580, 250, "HD: ENERGIA 0%", EMBER, 48) + label(1380, 250, "LIVRO DE PAPEL", ORG, 48),
             fundo=rr(956, 0, 8, H, 0, "#fff", .8))


def s25():
    face = circ(960, 540, 430, VIOL) + glow(960, 540, 600, "wh", .25)
    eyes = ""
    for ex in (760, 1160):
        eyes += circ(ex, 520, 150, "#fff", extra=f'stroke="{ULTRA}" stroke-width="22"') + circ(ex + 55, 560, 52, NIGHT) + circ(ex + 75, 540, 14, "#fff")
    eyes += line(900, 520, 1020, 520, ULTRA, 22) + drop(1260, 740, 50, CYL)
    far = glow(1700, 920, 160, "or", .9) + circ(1700, 920, 20, YEL)
    return L(fundo=circ(960, 540, 520, PURP, .5), meio=face + far, personagem=eyes)


def s26():
    r = random.Random(9)
    cols = [MAG, ORG, MINT, VIOL, ROYAL, YEL, EMBER]
    m = ""
    for row in range(5):
        for k in range(14):
            m += person(80 + k * 140 + (row % 2) * 60 + r.randint(-20, 20), 380 + row * 150, .7 + row * .12, r.choice(cols))
    m += glow(960, 760, 360, "yl", .6)
    for x, c in ((820, MAG), (960, MINT), (1100, ORG)):
        m += person(x, 900, 1.5, c)
    return L(meio=m, rotulos=label(960, 140, "HUMANOS NUNCA SOBREVIVERAM SOZINHOS", NIGHT, 50))


def s27():
    m = piece(330, 560, 300, 260, MAG, PURP) + piece(740, 560, 300, 260, MINT, "#0d8a56") + piece(1150, 560, 300, 260, ORG, "#b56e00") + piece(1560, 560, 300, 260, VIOL, PURP)
    r = label(330, 760, "SISTEMAS", MAG, 40) + label(740, 760, "HORTA", "#0d8a56", 40) + label(1150, 760, "CONSERTO", "#b56e00", 40) + label(1560, 760, "SAÚDE", PURP, 40)
    return L(fundo=glow(960, 560, 900, "cy", .3), meio=m, rotulos=r + label(960, 170, "A EQUIPE", NIGHT, 56))


def s28():
    m = ""
    for i, (c, sh) in enumerate(((MAG, PURP), (MINT, "#0d8a56"), (ORG, "#b56e00"), (VIOL, PURP))):
        m += piece(330 + i * 360, 300, 330, 190, c, sh, tab=False)
    tube = rr(760, 480, 400, 520, 40, "#fff", .18, 'stroke="#fff" stroke-width="8"')
    for i, (c, t) in enumerate(((CYW, "ÁGUA"), ("#d8c58f", "AREIA"), (NIGHT, "CARVÃO"), (LEAF2, "CASCALHO"))):
        tube += rr(772, 500 + i * 120, 376, 110, 18, c, .95) + txt(960, 570 + i * 120, t, 36, "#fff" if i != 0 else NIGHT)
    tube += "".join(drop(840 + i * 120, 440 + (i % 2) * 20, 22, CYL) for i in range(3))
    return L(fundo=glow(960, 700, 700, "cy", .25), meio=m + tube, rotulos=label(1560, 760, "FILTRO DE ÁGUA", ROYAL, 44) + label(960, 100, "PEÇAS ENCAIXADAS", NIGHT, 48))


def s29():
    m = rr(500, 330, 360, 100, 50, ORG) + rr(500, 560, 1000, 100, 50, MINT)
    r = txt(470, 395, "SOZINHO", 50, NIGHT, "end") + txt(470, 625, "EM GRUPO", 50, NIGHT, "end")
    r += label(1000, 190, "ESTIMATIVA DO ROTEIRO, NÃO É ESTUDO", NIGHT, 34)
    return L(meio=m + glow(1500, 610, 150, "mt", .6), rotulos=r, personagem=teo(1720, 1040, 1.1, "happy", aL=20, aR=-150))


def s30():
    far = "".join(tree(x, 760, .9, FOR1, FOR1) for x in (150, 520, 900, 1300, 1700))
    mid = "".join(person(x, 960, 1.4, c) for x, c in ((700, MINT), (1020, ORG), (1250, VIOL)))
    front = "".join(f'<ellipse cx="{x}" cy="1060" rx="140" ry="50" fill="{LEAF}" transform="rotate({a} {x} 1060)"/>' for x, a in ((100, -15), (1820, 15), (1500, 8)))
    return L(fundo=sun(1500, 330, 110) + glow(960, 600, 800, "or", .2), meio=far + rr(0, 960, W, 120, 0, FOR1), personagem=teo(380, 1020, 1.3, "happy", aL=22) + mid + sprout(520, 1000, 1.4, 1), frente=front,
             rotulos=label(1000, 150, "O NERD PLANTA COM A EQUIPE", NIGHT, 48))


def s31():
    r = ""
    for i, (n, t) in enumerate(((1, "MÃOS"), (2, "FOGO"), (3, "AMIGOS"))):
        x = 360 + i * 600
        r += num(x, 330, n, MAG, 56) + label(x, 760, t, VIOL, 56)
    m = rr(300, 410, 120, 24, 12, LILAC, extra='transform="rotate(-35 360 420)"') + circ(380, 480, 50, LILAC, extra='fill-opacity=".0"')
    m = f'<g transform="translate(360 560) rotate(-35)">{rr(-100, -18, 200, 36, 18, LILAC)}{circ(-100, 0, 36, LILAC)}{circ(-100, 0, 14, NIGHT)}</g>'
    m += flame(960, 600, 100) + person(1480, 640, 1.3, MAG) + person(1640, 640, 1.3, ORG) + line(1530, 570, 1590, 570, PEACH, 16)
    return L(meio=m, rotulos=r)


def s32():
    fl = flame(1100, 760, 120)
    arm = rr(1050, 700, 160, 60, 28, PEACH)
    return L(fundo=glow(1100, 600, 800, "or", .45), meio="", personagem=teo(640, 1050, 1.7, "happy", aL=10, aR=-85), frente=fl,
             rotulos=txt(960, 250, "VOCÊ SABE", 72, "#fff", "start") + txt(960, 340, "ACENDER UM FOGO?", 72, YEL, "start"))


SCENES = {
    1: ("night", s1), 2: ("night", s2), 3: ("space", s3), 4: ("night", s4),
    5: ("cyan", s5), 6: ("cyan", s6), 7: ("cyan", s7), 8: ("cyan", s8),
    9: ("space", s9), 10: ("space", s10), 11: ("night", s11), 12: ("space", s12),
    13: ("ocean", s13), 14: ("ocean", s14), 15: ("ocean", s15), 16: ("ocean", s16), 17: ("ocean", s17),
    18: ("forest", s18), 19: ("forest", s19), 20: ("forest", s20), 21: ("forest", s21), 22: ("forest", s22),
    23: ("purple", s23), 24: ("purple", s24), 25: ("purple", s25),
    26: ("cyan", s26), 27: ("cyan", s27), 28: ("cyan", s28), 29: ("cyan", s29),
    30: ("warm", s30), 31: ("warm", s31), 32: ("warm", s32),
}
PART_C = {"night": CYW, "cyan": "#fff", "space": CYW, "ocean": CYW, "forest": LEAF2, "purple": LILAC, "warm": YEL}
FONT = "Nunito, Quicksand, 'Varela Round', 'Arial Rounded MT Bold', 'DejaVu Sans', sans-serif"


def build(n):
    bg, fn = SCENES[n]
    L_ = fn()
    L_["fundo"] = particles(n * 7, 38, PART_C[bg]) + L_["fundo"]
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">',
           defs(), f'<rect id="bg" width="{W}" height="{H}" fill="url(#bg_{bg})"/>']
    for k in ("fundo", "meio", "personagem", "frente", "rotulos", "hud"):
        out.append(f'<g id="{k}">{L_[k]}</g>')
    out.append("</svg>")
    return "".join(out)


def main():
    import importlib.util
    spec = importlib.util.spec_from_file_location("gen", os.path.join(HERE, "dados_roteiro.py"))
    dados = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dados)
    os.makedirs(os.path.join(HERE, "svg"), exist_ok=True)
    for n in SCENES:
        with open(os.path.join(HERE, "svg", f"{n:02d}.svg"), "w", encoding="utf-8") as fh:
            fh.write(build(n))
    # metadados para a folha de contato
    meta, n, t = [], 0, 0.0
    for titulo, paleta, shots in dados.ATOS:
        for narr, vis in shots:
            n += 1
            words = len(re.findall(r"\S+", narr))
            dur = max(5, round(words / 2.5))
            meta.append({"n": n, "ato": titulo, "t": f"{int(t) // 60}:{int(t) % 60:02d}", "dur": dur, "narr": narr, "vis": vis})
            t += dur
    with open(os.path.join(HERE, "meta.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=1)
    cards = ""
    for m in meta:
        cards += (f'<article><img src="png/{m["n"]:02d}.png" alt="Plano {m["n"]}"><div class="c">'
                  f'<div class="h"><b>Plano {m["n"]:02d}</b><span>{m["t"]} · {m["dur"]} s</span></div>'
                  f'<small>{escape(m["ato"])}</small><p class="n">“{escape(m["narr"])}”</p><p class="v">{escape(m["vis"])}</p></div></article>')
    html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard Nerd vs Apocalipse</title><style>
:root{{--bg:#090A4E;--card:#1620C1;--tx:#fff;--mu:#91FCF9}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--tx);font-family:{FONT};padding:32px 16px}}
h1{{margin:0 0 4px;font-size:34px}}.sub{{color:var(--mu);margin:0 0 28px}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:20px;max-width:1900px;margin:auto}}
article{{background:#0f1470;border-radius:18px;overflow:hidden}}img{{width:100%;display:block}}
.c{{padding:14px 16px 18px}}.h{{display:flex;justify-content:space-between}}.h span{{color:var(--mu)}}small{{color:#F29E0C;font-weight:700}}
.n{{font-size:17px;margin:8px 0}}.v{{font-size:13px;color:#DECEE0;margin:0;opacity:.85}}
</style></head><body><h1>Um nerd sobreviveria a um apocalipse?</h1><p class="sub">Storyboard · 32 planos · 16:9 · estilo Kurzgesagt</p><main>{cards}</main></body></html>"""
    with open(os.path.join(HERE, "storyboard.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    print("ok", len(SCENES), "quadros")


if __name__ == "__main__":
    main()
