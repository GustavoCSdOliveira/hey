#!/usr/bin/env python3
"""Animação de 15 s com os sprites de células (pixel art).

Roteiro:
  0–4 s   Corrente sanguínea: hemácias e plaquetas; plaquetas tampam uma lesão
  4–8 s   Resposta inata: neutrófilo fagocita bactérias, dendrítica captura antígeno
  8–12 s  Resposta adaptativa: CD4+ ativa CD8+ e B; CD8+ e NK matam células
          infectadas; B vira plasmócito e secreta anticorpos
  12–15 s Memória imunológica

A cena é desenhada em 320×180 e ampliada 6× (1920×1080) sem suavização.
Uso:  python3 tools/gerar_animacao.py
Saída: animacao/animacao_celulas.mp4 e animacao/animacao_celulas.gif (prévia)
"""
import math
import os
import random
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import gerar_celulas as G  # noqa: E402

W, H, S = 320, 180, 6
FPS, DUR = 24, 15.0
OUT = os.path.normpath(os.path.join(AQUI, '..', 'animacao'))

# ---------------------------------------------------------------- sprites
SPR = {slug: fn().image() for slug, _, fn in G.CELULAS}

GREEN = G.Ramp('#0a3a12', '#1f8a2a', '#3cbf3a', '#6ee04a', '#a8f56a', '#e8ffc0')
INFEC = G.Ramp('#1a2a3a', '#4a5a7a', '#6a7a9a', '#8a9aba', '#b0c0da', '#e8f0ff')


def _bacteria():
    sp = G.Sprite()
    m = G.limb((18, 24), (30, 24), 8, 8) | G.ellipse(18, 24, 4, 4) | G.ellipse(30, 24, 4, 4)
    sp.shade(m, GREEN, 24, 24, 10, 4)
    sp.outline(GREEN.outline)
    for q in ((21, 24), (25, 23), (28, 25)):
        sp.p[q] = GREEN.dark
    return sp.image()


def _infectada():
    sp = G.Sprite()
    body = G.ellipse(24, 24, 10.5, 10, [(0.03, 3, 0.5)])
    sp.shade(body, INFEC)
    sp.outline(INFEC.outline)
    nuc = G.ellipse(23, 24, 4.2, 4)
    sp.shade(nuc, G.NUC_PURPLE, 23, 24, 4.2, 4)
    sp.ring(nuc, G.NUC_PURPLE.outline)
    G.granules(sp, {q for q in body if math.hypot(q[0] - 24, q[1] - 24) < 8.5}, G.dilate(nuc, 1), GREEN, 6, 4)
    return sp.image()


def _y(deg, cor):
    sp = G.Sprite()
    sp.put(G.y_glyph(*G.polar(-2.5, deg), deg, 3.0, 2.2), G.hx(cor))
    return sp.image()


SPR['bacteria'] = _bacteria()
SPR['infectada'] = _infectada()
ANTICORPOS = [_y(a, c) for a in range(0, 360, 45) for c in ('#a050ff', '#ff60d0', '#6a7bff')]
CITOCINA = Image.new('RGBA', (3, 3), (0, 0, 0, 0))
for q in ((1, 0), (0, 1), (1, 1), (2, 1), (1, 2)):
    CITOCINA.putpixel(q, G.GOLD + (255,))
CITOCINA.putpixel((1, 1), G.GOLD_HI + (255,))


# ---------------------------------------------------------------- tempo
def ease(u):
    u = max(0.0, min(1.0, u))
    return u * u * (3 - 2 * u)


def seg(t, a, b):
    return ease((t - a) / (b - a))


def lerp(a, b, u):
    return a + (b - a) * u


def lerp2(p, q, u):
    return lerp(p[0], q[0], u), lerp(p[1], q[1], u)


def caminho(t, pontos):
    """pontos = [(t0,(x,y)), (t1,(x,y)), ...] → posição interpolada com easing."""
    if t <= pontos[0][0]:
        return pontos[0][1]
    for (ta, pa), (tb, pb) in zip(pontos, pontos[1:]):
        if t <= tb:
            return lerp2(pa, pb, seg(t, ta, tb))
    return pontos[-1][1]


# ---------------------------------------------------------------- fundo
def fundo():
    bg = Image.new('RGBA', (W, H), G.hx('#0b0a4a') + (255,))
    d = ImageDraw.Draw(bg)
    for y0, y1, borda in ((0, 14, 14), (166, 180, 165)):
        d.rectangle([0, y0, W, y1], fill=G.hx('#2a0a4a'))
        d.line([0, borda, W, borda], fill=G.hx('#8a1f7a'))
        for i in range(-1, W // 26 + 2):
            x = i * 26 + (0 if y0 == 0 else 13)
            cy = (y0 + y1) / 2
            d.ellipse([x, cy - 4, x + 22, cy + 4], fill=G.hx('#4a1260'), outline=G.hx('#6a1a7a'))
            d.rectangle([x + 9, cy - 1, x + 12, cy + 1], fill=G.hx('#c23bd6'))
    return bg


BG = fundo()
rnd = random.Random(42)
PLASMA = [(rnd.uniform(0, W), rnd.uniform(18, 162), rnd.uniform(6, 16)) for _ in range(60)]
HEMACIAS = [(rnd.uniform(0, W + 60), 28 + i * 13.5 + rnd.uniform(-4, 4), rnd.uniform(38, 62), rnd.uniform(0, 6))
            for i in range(10)]
PLAQUETAS = [(rnd.uniform(0, W + 60), rnd.uniform(30, 150), rnd.uniform(45, 65)) for _ in range(7)]
LESAO = [(152, 160), (162, 157), (172, 161)]
FONTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def fonte(sz):
    return ImageFont.truetype(FONTE, sz) if os.path.exists(FONTE) else ImageFont.load_default()


F_LABEL, F_TITULO, F_LEGENDA = fonte(22), fonte(36), fonte(26)


# ---------------------------------------------------------------- quadro
class Quadro:
    def __init__(self):
        self.c = BG.copy()
        self.labels = []

    def put(self, img, x, y, sx=1.0, sy=None, alpha=1.0, flash=0.0):
        sy = sx if sy is None else sy
        if alpha <= 0.01 or sx <= 0.02 or sy <= 0.02:
            return
        im = img
        if sx != 1 or sy != 1:
            im = im.resize((max(1, round(im.width * sx)), max(1, round(im.height * sy))), Image.NEAREST)
        if flash > 0:
            branco = Image.new('RGBA', im.size, (255, 255, 255, 255))
            branco.putalpha(im.getchannel('A'))
            im = Image.blend(im, branco, min(1, flash))
        if alpha < 1:
            im = im.copy()
            im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
        x0, y0 = round(x - im.width / 2), round(y - im.height / 2)
        # recorte para permitir sprites parcialmente fora da tela
        cx0, cy0 = max(0, -x0), max(0, -y0)
        cx1, cy1 = min(im.width, W - x0), min(im.height, H - y0)
        if cx1 <= cx0 or cy1 <= cy0:
            return
        self.c.alpha_composite(im.crop((cx0, cy0, cx1, cy1)), (x0 + cx0, y0 + cy0))

    def label(self, txt, x, y, alpha=1.0, dy=21):
        if alpha > 0.02:
            self.labels.append((txt, x, y + dy, alpha))


def caixa_texto(d, txt, cx, top, f, alpha, fundo, cor, pad=10, alt=None, centro=True):
    tw = d.textlength(txt, font=f)
    alt = alt or f.size + 12
    x0 = cx - tw / 2 - pad if centro else cx
    x0 = max(10, min(W * S - tw - 2 * pad - 10, x0))  # não sair da tela
    a = int(255 * alpha)
    d.rounded_rectangle([x0, top, x0 + tw + 2 * pad, top + alt], radius=8, fill=fundo + (int(a * 0.92),))
    d.text((x0 + pad, top + (alt - f.size) / 2 - 2), txt, font=f, fill=cor + (a,))


TITULOS = [  # (texto, início, fim)
    ('1 · Corrente sanguínea', 0.2, 3.8),
    ('2 · Infecção: resposta inata', 4.0, 7.9),
    ('3 · Resposta adaptativa', 8.0, 11.9),
    ('4 · Memória imunológica', 12.1, 15.2),
]
LEGENDAS = [
    ('Hemácias levam O₂ · plaquetas fecham a lesão', 0.8, 3.8),
    ('Neutrófilos fagocitam bactérias · a dendrítica captura o antígeno', 4.6, 7.9),
    ('CD4+ coordena · CD8+ e NK matam células infectadas · B vira plasmócito', 8.8, 11.9),
    ('Na próxima infecção, a resposta será mais rápida e mais forte', 12.8, 15.2),
]


def janela(t, a, b, f=0.3):
    return min(seg(t, a, a + f), 1 - seg(t, b - f, b))


# ================================================================= cena
B1, B2, B3 = (222, 70), (250, 126), (284, 88)
I1, I2 = (268, 62), (252, 132)


def cena(t):
    q = Quadro()
    d = ImageDraw.Draw(q.c)

    # partículas do plasma
    for x0, y, v in PLASMA:
        x = (x0 + v * t) % W
        d.point((x, y), fill=G.hx('#1e1c70'))
        d.point((x + 1, y), fill=G.hx('#1e1c70'))

    # lesão na parede inferior
    if t > 1.0:
        u = seg(t, 1.0, 1.6)
        larg = 14 * u
        d.polygon([(162 - larg, 165), (162 - larg * .6, 172), (162, 168), (162 + larg * .6, 173), (162 + larg, 165)],
                  fill=G.hx('#5a0a1a'))

    fundo_alpha = 1.0 if t < 8 else lerp(1, .55, seg(t, 8, 8.6)) if t < 12 else lerp(.55, .4, seg(t, 12, 12.5))

    # hemácias rolando
    for x0, y, v, fase in HEMACIAS:
        x = (x0 + v * t) % (W + 60) - 30
        roll = 0.72 + 0.28 * abs(math.cos(fase + t * 2.2))
        q.put(SPR['hemacia'], x, y + math.sin(t * 2 + fase) * 1.5, 1.0, roll, alpha=fundo_alpha)
    if 0.6 < t < 3.8:
        x0, y, v, fase = HEMACIAS[4]
        q.label('Hemácia', (x0 + v * t) % (W + 60) - 30, y, janela(t, 0.6, 3.8), dy=14)

    # plaquetas (as 3 primeiras vão para a lesão)
    for i, (x0, y, v) in enumerate(PLAQUETAS):
        livre = ((x0 + v * t) % (W + 60) - 30, y + math.sin(t * 3 + i) * 2)
        if i < 3:
            ta = 1.4
            pa = ((x0 + v * ta) % (W + 60) - 30, y)
            if t < ta:
                pos = livre
            else:
                pos = lerp2(pa, LESAO[i], seg(t, ta, 2.6 + i * .15))
            ativ = t > 2.6 + i * .15
            pop = 1 + 0.35 * max(0, 1 - (t - (2.6 + i * .15)) / 0.25) if ativ else 1
            q.put(SPR['plaqueta_ativada' if ativ else 'plaqueta'], *pos, pop, alpha=fundo_alpha)
        else:
            q.put(SPR['plaqueta'], *livre, alpha=fundo_alpha)
    q.label('Plaquetas', 162, 132, janela(t, 2.6, 3.8), dy=0)

    # --------------------------------------------- ato 2: resposta inata
    if 3.7 < t < 8.6:
        # bactérias
        estado = {}
        for i, b in enumerate((B1, B2, B3)):
            x = lerp(W + 30, b[0], seg(t, 3.7 + i * .2, 4.7 + i * .2))
            estado[i] = (x, b[1] + math.sin(t * 6 + i * 2))
        # neutrófilo
        N = caminho(t, [(4.2, (-30, 82)), (5.8, (B1[0] - 13, B1[1])), (6.4, (B1[0] - 13, B1[1])),
                        (7.2, (B3[0] - 13, B3[1])), (7.8, (B3[0] - 13, B3[1])), (8.6, (W + 40, 52))])
        andando = 4.2 < t < 5.8 or 6.4 < t < 7.2 or t > 7.8
        k = 0.07 * math.sin(t * 12) if andando else 0.04 * math.sin(t * 20)
        # dendrítica
        D = caminho(t, [(4.6, (-30, 140)), (6.4, (B2[0] - 17, B2[1] + 2)), (7.0, (B2[0] - 17, B2[1] + 2)),
                        (8.0, (-40, 112))])
        # fagocitose
        comidas = [(0, 5.8, 6.4, N), (2, 7.2, 7.8, N), (1, 6.4, 7.0, D)]
        for i, (x, y) in estado.items():
            alvo = next(c for c in comidas if c[0] == i)
            _, a, b, quem = alvo
            if t < a:
                q.put(SPR['bacteria'], x, y)
            elif t < b:
                u = seg(t, a, b)
                q.put(SPR['bacteria'], *lerp2((x, y), quem, u), 1 - u * .9)
        # eosinófilo de passagem
        if 4.0 < t < 9.5:
            E = (lerp(-30, W + 30, (t - 4.0) / 5.5), 40 + math.sin(t * 2) * 3)
            q.put(SPR['eosinofilo'], *E, 1 + 0.03 * math.sin(t * 4))
            q.label('Eosinófilo', *E, janela(t, 4.6, 7.9), dy=22)
        q.put(SPR['celula_dendritica'], *D, 1 + 0.03 * math.sin(t * 5))
        q.put(SPR['neutrofilo'], *N, 1 + k, 1 - k)
        q.label('Neutrófilo', *N, janela(t, 5.0, 7.9))
        q.label('Célula dendrítica', *D, janela(t, 5.4, 7.6), dy=24)
        if 4.0 < t < 5.6:
            q.label('Bactérias', 256, 92, janela(t, 4.4, 5.6), dy=0)

    # --------------------------------------------- ato 3: resposta adaptativa
    if 7.9 < t < 12.6:
        fim = 1 - seg(t, 11.9, 12.5)
        DC = caminho(t, [(8.0, (-30, 96)), (8.8, (52, 96))])
        CD4 = caminho(t, [(8.2, (-30, 40)), (9.2, (88, 84))])
        CD8 = caminho(t, [(8.4, (-30, 28)), (9.6, (150, 52)), (10.4, (150, 52)), (11.0, (I1[0] - 17, I1[1]))])
        NK = caminho(t, [(9.4, (W + 30, 160)), (10.6, (I2[0] + 17, I2[1] + 2))])
        BC = caminho(t, [(8.6, (-30, 150)), (9.8, (140, 130))])
        # células infectadas
        for (alvo, t_hit, ent) in ((I1, 11.0, 8.0), (I2, 10.6, 8.2)):
            pos = (lerp(W + 30, alvo[0], seg(t, ent, ent + .9)), alvo[1] + math.sin(t * 3 + alvo[1]))
            if t < t_hit:
                q.put(SPR['infectada'], *pos, alpha=fim)
            elif t < t_hit + .25:
                q.put(SPR['infectada'], *pos, 1 + .1 * math.sin((t - t_hit) * 60), flash=.8, alpha=fim)
            elif t < t_hit + .9:
                u = (t - t_hit - .25) / .65
                im = SPR['infectada']
                for j, (bx, by) in enumerate(((0, 0), (24, 0), (0, 24), (24, 24))):
                    frag = im.crop((bx, by, bx + 24, by + 24))
                    dx, dy = (-1 if bx == 0 else 1), (-1 if by == 0 else 1)
                    q.put(frag, pos[0] + (bx - 12) / 2 + dx * 14 * u, pos[1] + (by - 12) / 2 + dy * 14 * u,
                          1 - u * .4, alpha=(1 - u) * fim)
        if 8.9 < t < 10.6:
            q.label('Célula infectada', *I1, janela(t, 9.0, 10.6), dy=-34)
        # citocinas do CD4+ para CD8+ e B
        if 9.7 < t < 10.45:
            for alvo, n in ((CD8, 3), (BC, 3)):
                for j in range(n):
                    u = seg(t, 9.7 + j * .08, 10.4)
                    p = lerp2(CD4, alvo, u)
                    q.put(CITOCINA, p[0], p[1] - math.sin(u * math.pi) * (8 + j * 4))
        pulso = 1 + .12 * math.sin(math.pi * seg(t, 9.2, 9.7)) if 9.2 < t < 9.7 else 1 + .025 * math.sin(t * 5)
        q.put(SPR['celula_dendritica'], *DC, 1 + .03 * math.sin(t * 5), alpha=fim)
        q.put(SPR['linfocito_t_cd4'], *CD4, pulso, alpha=fim)
        ataque8 = .12 * max(0, 1 - abs(t - 11.0) / .2)
        q.put(SPR['linfocito_t_cd8'], *CD8, 1 + ataque8, alpha=fim)
        atk_nk = .12 * max(0, 1 - abs(t - 10.6) / .2)
        q.put(SPR['celula_nk'], *NK, 1 + atk_nk, alpha=fim)
        # B → plasmócito
        if t < 10.55:
            q.put(SPR['linfocito_b'], *BC, 1 + .025 * math.sin(t * 5), flash=seg(t, 10.4, 10.55), alpha=fim)
        else:
            q.put(SPR['plasmocito'], *BC, 1 + .03 * math.sin(t * 6), flash=1 - seg(t, 10.55, 10.8), alpha=fim)
        # anticorpos secretados
        ra = random.Random(7)
        for k in range(14):
            t0 = 10.8 + k * 0.085
            ang = math.radians(ra.uniform(-75, 25))
            vel = ra.uniform(55, 85)
            img = ANTICORPOS[ra.randrange(len(ANTICORPOS))]
            if t0 < t < t0 + 1.3:
                dt = t - t0
                q.put(img, BC[0] + 10 + math.cos(ang) * vel * dt, BC[1] + math.sin(ang) * vel * dt,
                      alpha=min(1, 1.6 - dt * 1.2) * fim)
        q.label('Célula dendrítica', *DC, janela(t, 8.8, 9.9), dy=24)
        q.label('T CD4+', *CD4, janela(t, 9.2, 11.8))
        q.label('T CD8+', *CD8, janela(t, 9.6, 11.8))
        q.label('Célula NK', *NK, janela(t, 10.0, 11.8))
        q.label('Linfócito B' if t < 10.55 else 'Plasmócito', *BC, janela(t, 9.8, 11.8), dy=19)

    # --------------------------------------------- ato 4: memória
    if t > 12.0:
        for i, (slug, nome) in enumerate((('memoria_t_cd4', 'T CD4+ de memória'),
                                          ('memoria_t_cd8', 'T CD8+ de memória'),
                                          ('memoria_b', 'B de memória'))):
            x = 84 + i * 76
            y = lerp(H + 40, 88, seg(t, 12.1 + i * .25, 13.0 + i * .25)) + math.sin(t * 3 + i) * 2
            brilho = .25 * max(0, math.sin(t * 6 + i * 2.1)) ** 8
            q.put(SPR[slug], x, y, 1 + .03 * math.sin(t * 4 + i), flash=brilho)
            q.label(nome, x, y, seg(t, 13.0 + i * .25, 13.4 + i * .25), dy=27)
    return q


def renderizar(t):
    q = cena(t)
    big = q.c.resize((W * S, H * S), Image.NEAREST)
    ov = Image.new('RGBA', big.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for txt, x, y, a in q.labels:
        caixa_texto(d, txt, x * S, y * S, F_LABEL, a, G.hx('#5b1ff0'), (255, 255, 255))
    for txt, a0, b0 in TITULOS:
        a = janela(t, a0, b0, .35)
        if a > 0.01:
            caixa_texto(d, txt, 36, 20, F_TITULO, a, G.hx('#ffb81c'), G.hx('#1a0a4a'), pad=16, centro=False)
    for txt, a0, b0 in LEGENDAS:
        a = janela(t, a0, b0, .35)
        if a > 0.01:
            caixa_texto(d, txt, W * S / 2, H * S - 66, F_LEGENDA, a, G.hx('#0b0a4a'), (255, 255, 255), pad=18)
    big.alpha_composite(ov)
    # fade in / fade out
    escuro = max(1 - seg(t, 0, .5), seg(t, 14.4, 15.0))
    if escuro > 0:
        big = Image.blend(big, Image.new('RGBA', big.size, (0, 0, 0, 255)), escuro)
    return big.convert('RGB')


def main():
    os.makedirs(OUT, exist_ok=True)
    mp4 = os.path.join(OUT, 'animacao_celulas.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                           '-s', f'{W * S}x{H * S}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation',
                           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        ff.stdin.write(renderizar(i / FPS).tobytes())
    ff.stdin.close()
    ff.wait()
    gif = os.path.join(OUT, 'animacao_celulas.gif')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp4, '-vf',
                    'fps=12,scale=640:-1:flags=neighbor,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=none',
                    gif], check=True)
    print('ok:', mp4, gif)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--quadros':
        os.makedirs(OUT, exist_ok=True)
        for t in map(float, sys.argv[2:]):
            renderizar(t).save(os.path.join(OUT, f'_quadro_{t:05.2f}.png'))
    else:
        main()
