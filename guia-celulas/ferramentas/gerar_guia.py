#!/usr/bin/env python3
"""Monta a pasta `guia-celulas/` (documentação .md + sprites + script) e o PDF.

Uso:  python3 tools/gerar_guia.py
Requer: Pillow, pandoc e Playwright (Chromium) para o PDF.
"""
import os
import shutil
import subprocess
import sys

from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import gerar_celulas as G  # noqa: E402

RAIZ = os.path.normpath(os.path.join(AQUI, '..'))
GUIA = os.path.join(RAIZ, 'guia-celulas')


def hexs(rgb):
    return '#%02x%02x%02x' % rgb


RAMPAS = {
    'RED': 'Vermelho – hemácia', 'PLT': 'Lilás – plaqueta', 'ORANGE': 'Laranja – neutrófilo',
    'NUC_BLUE': 'Azul – núcleo do neutrófilo', 'EOS': 'Laranja-avermelhado – eosinófilo',
    'EOS_GRAN': 'Vermelho – grânulos do eosinófilo', 'NUC_PURPLE': 'Roxo – núcleos (eosinófilo, plasmócito)',
    'NK_BLUE': 'Azul royal – célula NK', 'CYAN': 'Ciano – espículas e grânulos (NK, CD8+)',
    'DC_BODY': 'Roxo – corpo da dendrítica', 'MAGENTA': 'Magenta – dendritos e receptores CD4',
    'CD4_BODY': 'Violeta – linfócito T CD4+', 'CD8_BODY': 'Azul-violeta – linfócito T CD8+',
    'B_BODY': 'Rosa-magenta – linfócito B', 'PL_BODY': 'Rosa claro – plasmócito',
    'NUC_ORANGE': 'Laranja-ouro – núcleo dos linfócitos, NK e dendrítica',
}
TONS = [('outline', 'Contorno'), ('dark', 'Sombra'), ('mid', 'Meio-tom'),
        ('base', 'Base'), ('light', 'Luz'), ('hi', 'Brilho')]
AVULSAS = [
    ('#3d1666', 'Grânulos da plaqueta'), ('#1a0640', 'Cromatina do plasmócito'),
    ('#9a4dff', 'BCR (Y) do linfócito B – A'), ('#c58bff', 'BCR (Y) do linfócito B – B'),
    ('#a050ff', 'Anticorpo secretado – roxo'), ('#ff60d0', 'Anticorpo secretado – rosa'),
    ('#6a7bff', 'Anticorpo secretado – azul'), ('#ffd23a', 'Aura de memória (ouro)'),
    ('#fff3a0', 'Aura de memória (brilho)'), ('#0b0a4a', 'Fundo da prévia (sugestão)'),
    ('#5b1ff0', 'Etiqueta de nome (sugestão)'), ('#ffb81c', 'Faixa de título (sugestão)'),
]

# --------------------------------------------------------------- fichas
CELULAS = {
    'hemacia': dict(
        nome='Hemácia (eritrócito)', real='7–8 µm de diâmetro, ~2 µm de espessura',
        rampas=[('Corpo', 'RED')], extras=[],
        bio=('Transporta O₂ dos pulmões aos tecidos e devolve parte do CO₂, graças à '
             'hemoglobina. É a célula mais numerosa do sangue (~5 milhões/µL). Não tem núcleo '
             'nem organelas. O formato de disco bicôncavo aumenta a superfície de troca e permite '
             'que ela se dobre para passar em capilares. Vive cerca de 120 dias.'),
        visual=['Disco vermelho **sem núcleo**', 'Centro afundado (mais escuro), borda em anel mais clara',
                'Brilho de 3 px no anel superior esquerdo'],
        construcao=['Elipse rx 10,6 × ry 10,2 com leve irregularidade (harmônico 3, amplitude 0,025)',
                    'Sombreamento de **toro**: pico da borda em 68 % do raio; fora do pico a normal aponta para fora, dentro aponta para dentro (×0,75)',
                    'Centro (raio < 30 %) em tom *meio-tom* chapado',
                    'Contorno externo de 1 px', 'Brilho (tom *hi*) em 3 pixels do anel superior esquerdo'],
        anim=['Rolar/girar ao longo do vaso (rotação de 90° em 4 quadros funciona bem)',
              'Achatar (escala 1,0 × 0,8) ao passar por capilares', 'Fluxo em fila, levemente desalinhado',
              'Variação "de lado": achatar para 1,0 × 0,35 para simular visão lateral']),
    'plaqueta': dict(
        nome='Plaqueta (trombócito)', real='2–3 µm',
        rampas=[('Corpo', 'PLT')], extras=[('#3d1666', 'Grânulos')],
        bio=('Fragmento do citoplasma do megacariócito (medula óssea). Atua na hemostasia: '
             'adere à parede do vaso lesionado, libera o conteúdo dos grânulos e se agrega '
             'formando o tampão plaquetário. Sem núcleo. Vive de 7 a 10 dias.'),
        visual=['Pequeno fragmento oval lilás', '4 grânulos escuros de 1 px', 'É o menor sprite do conjunto'],
        construcao=['Elipse rx 5,6 × ry 4,4 com irregularidade (harmônico 3, amplitude 0,05)',
                    'Sombreamento esférico em 4 tons', 'Grânulos em (22,25) (26,22) (25,26) (21,22)', 'Contorno externo'],
        anim=['Flutuar em grupos de 3 a 6 com rotações diferentes',
              'Ao detectar lesão: trocar pelo sprite **plaqueta_ativada** (1–2 quadros de transição)',
              'Agregação: aproximar várias plaquetas ativadas até se sobreporem']),
    'plaqueta_ativada': dict(
        nome='Plaqueta ativada', real='2–3 µm (corpo) + pseudópodes',
        rampas=[('Corpo e pseudópodes', 'PLT')], extras=[('#3d1666', 'Grânulos')],
        bio=('Quando entra em contato com colágeno exposto ou com trombina, a plaqueta muda de '
             'forma, emite pseudópodes (filopódios), libera ADP e tromboxano e passa a se ligar '
             'ao fibrinogênio e a outras plaquetas.'),
        visual=['Mesmo corpo lilás da plaqueta', '6 pseudópodes finos irradiando', '5 grânulos escuros'],
        construcao=['6 pseudópodes afinados (largura 3,0 → 1,1 px) nos ângulos −80, −25, 30, 85, 140, 200°, '
                    'comprimento 9,5 ± 1,5 px, saindo de 3 px do centro, em tom *meio-tom*',
                    'Corpo: elipse rx 5,8 × ry 5,0, sombreado por cima dos pseudópodes',
                    'Grânulos e contorno externo (que une corpo + pseudópodes)'],
        anim=['Pseudópodes "crescendo": desenhar com 40 %, 70 % e 100 % do comprimento',
              'Pequena vibração (±1 px) enquanto se prende à lesão']),
    'neutrofilo': dict(
        nome='Neutrófilo', real='12–15 µm',
        rampas=[('Corpo e espículas', 'ORANGE'), ('Núcleo', 'NUC_BLUE')], extras=[],
        bio=('Leucócito mais abundante (50–70 %). É a primeira linha de defesa contra bactérias e fungos: '
             'chega rápido por quimiotaxia, fagocita, degranula e pode lançar NETs (redes de DNA). '
             'Núcleo segmentado em 3 a 5 lobos. Vive horas a poucos dias e forma o pus.'),
        visual=['Corpo **laranja espiculado** (10 espículas)', 'Núcleo **azul com 4 lobos** ligados por filamentos',
                '11 grânulos pontuais claros no citoplasma'],
        construcao=['10 espículas afinadas (3,2 → 0,9 px), de 11 a 15,6 px do centro, a cada 36° (±5°), tom *meio-tom*',
                    'Corpo: elipse rx 12,6 × ry 12,4 (harmônico 4, amplitude 0,02), sombreado',
                    'Contorno externo unindo corpo + espículas',
                    'Lobos (elipse 3,9 × 3,7) em (18,21) (23,5,16,6) (30,19,5) (29,5,28,5), cada um sombreado individualmente',
                    'Filamentos entre lobos com 1,7 px de largura, tom *meio-tom* azul',
                    'Contorno do núcleo desenhado sobre o citoplasma',
                    'Grânulos: 11 pixels *hi* a ≥ 3,2 px de distância entre si e longe do núcleo'],
        anim=['Rastejar (diapedese): esticar a 1,15 × 0,9 e voltar, alternando a direção',
              'Espículas pulsando (alternar dois sprites com espículas a 90 % e 100 %)',
              'Fagocitose: abrir dois pseudópodes que envolvem a bactéria']),
    'eosinofilo': dict(
        nome='Eosinófilo', real='12–17 µm',
        rampas=[('Corpo', 'EOS'), ('Grânulos', 'EOS_GRAN'), ('Núcleo', 'NUC_PURPLE')], extras=[],
        bio=('Representa 1–4 % dos leucócitos. Combate parasitas grandes (helmintos) liberando a proteína '
             'básica principal e outras proteínas tóxicas dos grânulos. Participa de alergias e da asma. '
             'Núcleo bilobado ("óculos") e grânulos grandes que coram com eosina (vermelho-alaranjado).'),
        visual=['Oval **laranja** com **núcleo roxo bilobado**', '13 grânulos 2×2 vermelhos com brilho e sombra'],
        construcao=['Corpo: elipse rx 15,2 × ry 12,6 com irregularidade (harmônicos 4 e 3)',
                    'Lobos: elipses 4,7 × 5,6 em (19, 23,6) e (29,5, 24,6), unidos por uma ponte de 2,2 px',
                    'Contorno do núcleo sobre o citoplasma',
                    'Grânulos 2×2: pixel sup-esq = *hi*, sup-dir = *light*, inf-dir = *dark*, resto = *base*; '
                    'distância mínima de 3,7 px, longe do núcleo'],
        anim=['Degranulação: grânulos "saltando" para fora (deslocar 2–4 px e sumir)',
              'Flutuar lentamente com rotação de ±5°']),
    'celula_nk': dict(
        nome='Célula NK (natural killer)', real='10–15 µm (linfócito grande granular)',
        rampas=[('Corpo', 'NK_BLUE'), ('Espículas e grânulos', 'CYAN'), ('Núcleo', 'NUC_ORANGE')], extras=[],
        bio=('Linfócito da imunidade **inata**. Elimina células infectadas por vírus e células tumorais que '
             'perderam o MHC de classe I ("missing self"), sem precisar de sensibilização prévia. Mata '
             'liberando perforina e granzimas e produz IFN-γ.'),
        visual=['Corpo **azul** com 9 espículas **ciano**', 'Núcleo laranja reniforme (com reentrância)',
                '7 grânulos ciano 2×2 (grânulos citotóxicos)'],
        construcao=['9 espículas (3,0 → 1,0 px), de 11 a 15,2 px, a cada 40° (±6°), tom *base* ciano',
                    'Corpo: elipse 12,6 × 12,2 (harmônicos 3 e 5)', 'Contorno externo',
                    'Núcleo: elipse 6,6 × 7,0 em (23, 24) menos uma elipse 2,3 × 2,6 em (28,6, 21,8)',
                    'Grânulos ciano a < 10,8 px do centro, longe do núcleo'],
        anim=['"Beijo da morte": encostar na célula-alvo e soltar os grânulos ciano em direção a ela',
              'Espículas girando lentamente (rotação contínua de 360° em 16 quadros)']),
    'celula_dendritica': dict(
        nome='Célula dendrítica', real='corpo ~10–15 µm; prolongamentos de até 50 µm ou mais',
        rampas=[('Corpo', 'DC_BODY'), ('Dendritos', 'MAGENTA'), ('Núcleo', 'NUC_ORANGE')], extras=[],
        bio=('Principal célula apresentadora de antígeno. Vive nos tecidos (pele, mucosas) capturando '
             'antígenos. Ao ser ativada, migra pelos vasos linfáticos até o linfonodo e apresenta peptídeos '
             'no MHC I e II aos linfócitos T virgens, decidindo o tipo de resposta. É a ponte entre a '
             'imunidade inata e a adaptativa.'),
        visual=['Corpo roxo pequeno e **8 dendritos magenta ramificados**', 'Núcleo laranja levemente deslocado'],
        construcao=['8 braços a cada 45° (±8°): tronco de 6 px até 14,5 ± 1,5 px (largura 4,0 → 2,0)',
                    'Na ponta do tronco: 2 ramos a ±30° (largura 2,2 → 1,0, comprimento ~8 px) + 1 prolongamento central (+6,5 px)',
                    'Textura nos dendritos: 1 em cada 3 pixels em *base* na metade iluminada',
                    'Corpo: elipse 9,3 × 8,6 sombreada', 'Contorno externo magenta escuro + anel do corpo em roxo escuro',
                    'Núcleo: elipse 4,6 × 4,4 em (25, 23,5)'],
        anim=['Dendritos "ondulando": deslocar as pontas ±1 px em quadros alternados',
              'Migração: encolher os dendritos (70 %) enquanto se move e estendê-los ao chegar ao linfonodo']),
    'linfocito_t_cd4': dict(
        nome='Linfócito T CD4+ (auxiliar / helper)', real='7–10 µm',
        rampas=[('Corpo', 'CD4_BODY'), ('Receptores (bolinhas)', 'MAGENTA'), ('Núcleo', 'NUC_ORANGE')], extras=[],
        bio=('Reconhece antígenos apresentados no **MHC de classe II**. Coordena a resposta imune liberando '
             'citocinas: ajuda o linfócito B a produzir anticorpos, ativa macrófagos e sustenta os T CD8+. '
             'Subtipos: Th1, Th2, Th17, Tfh e Treg. É o alvo do HIV.'),
        visual=['Corpo **violeta** redondo', '**12 "bolinhas" rosa** na membrana (receptores)',
                'Núcleo grande, laranja e redondo (pouco citoplasma, típico do linfócito)'],
        construcao=['12 bolinhas (elipse 2,4 px) a 11,6 px do centro, a cada 30° começando em 8°, sombreadas sem brilho',
                    'Corpo: elipse 11,2 × 11,0 sombreada por cima', 'Contorno externo + anel do corpo',
                    'Núcleo: círculo de raio 6,8 no centro, sombreado, com contorno'],
        anim=['Pulsar suave (escala 1,00 ↔ 1,04)', 'Ao ativar: soltar pequenos pontos (citocinas) em direção às células vizinhas']),
    'linfocito_t_cd8': dict(
        nome='Linfócito T CD8+ (citotóxico)', real='7–10 µm',
        rampas=[('Corpo', 'CD8_BODY'), ('Espículas', 'CYAN'), ('Núcleo', 'NUC_ORANGE')], extras=[],
        bio=('Reconhece antígenos no **MHC de classe I**, presente em quase todas as células. Mata células '
             'infectadas e tumorais com perforina e granzimas, ou pela via Fas/FasL. Precisa da ajuda do '
             'T CD4+ para uma resposta forte e duradoura.'),
        visual=['Corpo **azul-violeta**', '**11 espículas ciano** pontiagudas', 'Núcleo laranja central'],
        construcao=['11 espículas (3,4 → 0,7 px), de 10 a 15,8 px, a cada 32,7° começando em 6°, tom *base* ciano',
                    'Corpo: elipse 11,0 × 10,8', 'Contorno externo (sem anel interno, para as espículas ficarem ligadas ao corpo)',
                    'Núcleo: raio 6,6'],
        anim=['Espículas "armando": alternar comprimento 85 % ↔ 100 %', 'Ataque: avançar rápido até o alvo e piscar em branco por 1 quadro']),
    'linfocito_b': dict(
        nome='Linfócito B', real='7–10 µm',
        rampas=[('Corpo', 'B_BODY'), ('Núcleo', 'NUC_ORANGE')],
        extras=[('#9a4dff', 'BCR – Y roxo'), ('#c58bff', 'BCR – Y lilás')],
        bio=('Tem na superfície o **BCR**, um anticorpo de membrana que reconhece o antígeno na forma nativa. '
             'Também apresenta antígeno ao T CD4+. Depois de ativado (com a ajuda do Tfh), prolifera e se '
             'diferencia em plasmócito ou em célula B de memória.'),
        visual=['Oval **rosa-magenta**', 'Núcleo laranja grande', '**7 pequenos Y** (BCR) na superfície, apontando para fora'],
        construcao=['Corpo: elipse 13,0 × 10,8', 'Contorno externo + anel do corpo', 'Núcleo: elipse 7,2 × 6,9 em (23,4, 24)',
                    'Y: tronco de 3,2 px + 2 braços de 2,4 px a ±42°, começando 1,7 px fora da borda de uma elipse 15,6 × 13,4, '
                    'a cada 51,4° a partir de 14°, cores alternadas'],
        anim=['Y "balançando" ±10°', 'Ao encontrar o antígeno: os Y se agrupam de um lado (capping)']),
    'plasmocito': dict(
        nome='Plasmócito', real='10–20 µm',
        rampas=[('Corpo', 'PL_BODY'), ('Núcleo', 'NUC_PURPLE')],
        extras=[('#1a0640', 'Cromatina'), ('#a050ff', 'Anticorpo roxo'), ('#ff60d0', 'Anticorpo rosa'),
                ('#6a7bff', 'Anticorpo azul')],
        bio=('Linfócito B totalmente diferenciado: uma "fábrica" de anticorpos que secreta milhares de '
             'moléculas por segundo. Tem muito retículo endoplasmático rugoso, um Golgi desenvolvido '
             '(o halo claro ao lado do núcleo) e o núcleo excêntrico com cromatina em "roda de carroça".'),
        visual=['Oval rosa claro com o **núcleo roxo deslocado para a esquerda**', 'Cromatina em pontos, como uma "roda de carroça"',
                'Halo claro (Golgi) do lado direito do núcleo', '**Anticorpos (Y) soltos** ao redor'],
        construcao=['Corpo: elipse 13,2 × 11,0 em (24,5, 24)', 'Halo: anel entre 1 e 3 px ao redor do núcleo, só do lado direito, tom *light*',
                    'Núcleo: elipse 5,9 × 6,2 em (19, 24,2)', 'Cromatina: 6 pontos a 3,4 px do centro do núcleo (a cada 60°) + 1 ponto central',
                    'Anticorpos: até 10 Y (tronco 2,6 + braços 2,0) a 16,5–20,5 px do centro, em ângulos aleatórios, '
                    'a ≥ 5,2 px uns dos outros, alternando 3 cores'],
        anim=['Secreção contínua: gerar novos Y na borda direita e afastá-los 1 px por quadro',
              'Leve "respiração" (escala 1,00 ↔ 1,03)']),
}
MEMORIA = dict(
    real='mesmo tamanho da célula de origem',
    bio=('Depois de uma infecção, alguns linfócitos T e B ativados se tornam **células de memória** de vida longa '
         '(anos ou décadas). Num segundo contato com o mesmo antígeno, respondem mais rápido e com mais força. '
         'É a base da imunidade adquirida e das vacinas. Na memória B, a afinidade do anticorpo já passou pela maturação.'),
    visual=['Mesmo desenho da célula de origem', '**Aura dourada tracejada** ao redor', '3 brilhos em forma de "+"'],
    construcao=['Desenhar a célula de origem completa',
                'Anel tracejado com raio = (maior distância do sprite ao centro) + 1,8 px e espessura de ~1 px',
                'Padrão: a cada 9° de ângulo, 3 segmentos acesos e 2 apagados; o 2º segmento aceso usa o tom de brilho',
                'Brilhos: cruz de 5 px a raio + 2,6 px, nos ângulos −48°, 34° e 138°, centro em #fff3a0'],
    anim=['Brilhos piscando de forma alternada (um por quadro)', 'Aura girando devagar (deslocar o padrão em 9° por quadro)',
          'Na resposta secundária: a aura se expande e some enquanto a célula se multiplica'],
)
for slug, origem, nome in (('memoria_t_cd4', 'linfocito_t_cd4', 'Linfócito T CD4+ de memória'),
                           ('memoria_t_cd8', 'linfocito_t_cd8', 'Linfócito T CD8+ de memória'),
                           ('memoria_b', 'linfocito_b', 'Linfócito B de memória')):
    base = CELULAS[origem]
    CELULAS[slug] = dict(nome=nome, real=MEMORIA['real'], rampas=base['rampas'],
                         extras=base['extras'] + [('#ffd23a', 'Aura (ouro)'), ('#fff3a0', 'Aura (brilho)')],
                         bio=MEMORIA['bio'], visual=MEMORIA['visual'] + [f'Base: `{origem}`'],
                         construcao=MEMORIA['construcao'], anim=MEMORIA['anim'])

ORDEM = [s for s, _, _ in G.CELULAS]


# ------------------------------------------------------------ utilidades
def swatch(rgbs, caminho, tam=28):
    im = Image.new('RGB', (tam * len(rgbs), tam), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, c in enumerate(rgbs):
        d.rectangle([i * tam, 0, (i + 1) * tam - 1, tam - 1], fill=c)
    im.save(caminho)


def tabela_rampa(nome_var, pref):
    r = getattr(G, nome_var)
    cab = '| ' + ' | '.join(rot for _, rot in TONS) + ' |'
    sep = '|' + '---|' * len(TONS)
    val = '| ' + ' | '.join(
        f'<span class="cor" style="background:{hexs(getattr(r, a))}"></span>`{hexs(getattr(r, a))}`'
        for a, _ in TONS) + ' |'
    return '\n'.join([cab, sep, val])


def ficha_md(slug, pref='../', nivel='#'):
    c = CELULAS[slug]
    im = Image.open(os.path.join(GUIA, 'sprites', 'png', f'{slug}.png'))
    x0, y0, x1, y1 = im.getbbox()
    out = [f'{nivel} {c["nome"]}', '',
           f'<img class="sprite ficha" src="{pref}sprites/png_x8/{slug}.png" width="192" alt="{c["nome"]}">', '',
           '| Campo | Valor |', '|---|---|',
           f'| Arquivo | `sprites/png/{slug}.png` (48×48) · `sprites/png_x8/{slug}.png` (384×384) |',
           f'| Índice no spritesheet | {ORDEM.index(slug)} (x = {ORDEM.index(slug) * 48} px) |',
           f'| Tamanho real | {c["real"]} |',
           f'| Área ocupada no sprite | {x1 - x0}×{y1 - y0} px |',
           f'| Paletas | {", ".join(f"{p} → `{v}`" for p, v in c["rampas"])} |', '',
           f'{nivel}# Biologia', '', c['bio'], '',
           f'{nivel}# Como reconhecer no sprite', ''] + [f'- {v}' for v in c['visual']] + [
           '', f'{nivel}# Construção (camadas, de trás para frente)', ''] + [
           f'{i}. {v}' for i, v in enumerate(c['construcao'], 1)] + [
           '', f'{nivel}# Cores', '']
    cel = lambda h: f'<span class="cor" style="background:{h}"></span>`{h}`'  # noqa: E731
    out += ['| Parte | ' + ' | '.join(r for _, r in TONS) + ' |', '|' + '---|' * (len(TONS) + 1)]
    for parte, var in c['rampas']:
        r = getattr(G, var)
        out.append(f'| **{parte}**<br>`{var}` | ' + ' | '.join(cel(hexs(getattr(r, a))) for a, _ in TONS) + ' |')
    out.append('')
    if c['extras']:
        out += ['Cores avulsas: ' + ' · '.join(f'{cel(h)} {u}' for h, u in c['extras']), '']
    out += [f'{nivel}# Ideias de animação', ''] + [f'- {v}' for v in c['anim']] + ['']
    return '\n'.join(out)


# ------------------------------------------------------------ textos fixos
def readme(pref='', links=True):
    linhas = '\n'.join(
        (f'| {i} | [{CELULAS[s]["nome"]}]({pref}celulas/{s}.md) | `{s}.png` |' if links else
         f'| {i} | {CELULAS[s]["nome"]} | `{s}.png` |') for i, s in enumerate(ORDEM))
    return f"""# Guia de células humanas em pixel art

<img class="sprite" src="{pref}sprites/spritesheet_preview.png" alt="prévia">

Kit reutilizável com **14 sprites** de células do sangue e do sistema imune, no mesmo estilo
visual. Inclui as regras de estilo, as paletas, uma ficha técnica por célula, ideias de animação,
um prompt pronto para criar novas células e o script que gera tudo.

## Estrutura da pasta

```
guia-celulas/
├── README.md                 ← este índice
├── 01-estilo-visual.md       ← regras de pixel art (canvas, luz, contorno, tons)
├── 02-paletas.md             ← todas as paletas com códigos hex
├── 03-animacao.md            ← convenções e dicas para animar
├── 04-prompt-novas-celulas.md← prompt para gerar novas células no mesmo estilo
├── 05-uso-em-projetos.md     ← como usar em HTML/CSS, Phaser, Godot, Unity, vídeo
├── celulas/                  ← 1 ficha .md por célula
├── sprites/png/              ← sprites 48×48 (originais)
├── sprites/png_x8/           ← sprites 384×384 (ampliados sem suavização)
├── sprites/spritesheet.png   ← todas as células em 1 linha (atlas 672×48)
├── paletas/                  ← amostras de cor em .png
├── ferramentas/              ← gerar_celulas.py e gerar_guia.py
└── guia-celulas.pdf          ← este guia completo em PDF
```

## Células

| # | Célula | Arquivo |
|---|---|---|
{linhas}

## Regras de ouro (resumo)

1. Canvas **48×48 px**, fundo transparente, centro da célula em **(24, 24)**.
2. Luz vindo do **canto superior esquerdo**.
3. **4 tons** por material (sombra, meio-tom, base, luz) + 1 brilho + 1 contorno.
4. **Contorno de 1 px** em vizinhança 4 (sem diagonais), num tom escuro da própria cor.
5. Núcleo com contorno próprio, desenhado **por cima** do citoplasma.
6. Ampliar **sempre** em múltiplos inteiros e com *nearest neighbor*.
7. Células de memória = célula de origem + **aura dourada tracejada**.
"""


ESTILO = """# Estilo visual

## Referências

- **Forma e cor**: o infográfico *"The Immune System"* (fundo azul-marinho, células em neon
  saturado, núcleos laranja ou dourados, prolongamentos magenta e ciano).
- **Técnica de pixel**: personagens em pixel art clássicos (contorno escuro e colorido,
  sombreamento em faixas, brilho de 1 a 2 px, sem antisserrilhado).

## Canvas e escala

| Regra | Valor |
|---|---|
| Tamanho do canvas | 48 × 48 px |
| Fundo | transparente (RGBA) |
| Centro da célula | (24, 24); coordenadas contínuas, com o centro do pixel em +0,5 |
| Escala biológica | ~2 px por µm nos leucócitos; o tamanho relativo é preservado (a plaqueta é a menor, a hemácia é menor que os leucócitos) |
| Maior extensão permitida | raio de ~22 px (deixe 2 px de margem para o contorno e a aura) |
| Ampliação | só múltiplos inteiros (×2, ×4, ×6, ×8) com *nearest neighbor* |

## Luz e sombreamento

- Vetor de luz normalizado **L = (−0,55; −0,65; 0,52)**, vindo do canto superior esquerdo, um pouco de frente.
- Cada forma é tratada como um elipsoide: normal `n = (nx, ny, √(1 − nx² − ny²))`.
- Intensidade `I = n · L`, quantizada em faixas (sem gradiente nem *dithering*):

| Intensidade | Tom |
|---|---|
| I > 0,78 | **luz** |
| 0,38 < I ≤ 0,78 | **base** |
| 0,02 < I ≤ 0,38 | **meio-tom** |
| I ≤ 0,02 | **sombra** |

- **Brilho especular**: 2 pixels lado a lado no tom *hi*, na posição `(cx − 0,42·rx, cy − 0,5·ry)`.
  Só em formas com mais de 12 pixels.
- Formas côncavas (o centro da hemácia) usam a luz invertida: escuro em cima à esquerda, claro embaixo à direita.

## Contorno

- **1 px, vizinhança 4** (cima, baixo, esquerda, direita). Diagonais ficam "em escada", como na referência.
- Cor do contorno = tom mais escuro da paleta principal da célula (nunca preto puro).
- O contorno externo é calculado sobre a **união** de corpo + espículas + prolongamentos.
- **Anel interno**: para separar o corpo dos receptores (CD4, dendrítica, B), desenha-se um
  contorno sobre os pixels já pintados ao redor do corpo.
- **Núcleo**: tem contorno próprio, desenhado sobre o citoplasma.

## Ordem das camadas

1. Elementos de trás: espículas, bolinhas, dendritos, pseudópodes
2. Corpo (citoplasma) sombreado
3. Contorno externo
4. Anel interno (opcional)
5. Halo ou estruturas internas claras (Golgi)
6. Núcleo sombreado + contorno do núcleo
7. Grânulos e detalhes (cromatina)
8. Elementos de fora sem contorno: anticorpos (Y), aura de memória, brilhos

## Elementos recorrentes

| Elemento | Como desenhar |
|---|---|
| **Espícula** | Trapézio afinado (base 3–3,4 px → ponta 0,7–1 px), radial, entrando 1 px no corpo |
| **Bolinha / receptor** | Círculo de raio 2,4 px sobre a borda, sombreado sem brilho |
| **Grânulo 2×2** | sup-esq = brilho · sup-dir = luz · inf-esq = base · inf-dir = sombra |
| **Grânulo pontual** | 1 pixel no tom de brilho |
| **Anticorpo (Y)** | Tronco de 2,6–3,2 px + 2 braços de 2,0–2,4 px a ±42°, 1 px de espessura, sem contorno |
| **Núcleo de linfócito** | Círculo laranja-ouro de raio 6,6–7,2 (ocupa ~60 % da célula) |
| **Aura de memória** | Anel tracejado dourado (3 acesos, 2 apagados a cada 9°) + 3 brilhos em "+" |

## Simplificações (avisar em material didático)

As cores são **estilizadas** e não reproduzem a coloração real de lâmina (Giemsa/H&E). Por exemplo,
o citoplasma real do neutrófilo é rosa-pálido, não laranja. As formas seguem a morfologia real:
núcleo multilobulado, bilobado, excêntrico etc. As espículas e "bolinhas" são **códigos visuais**
para diferenciar as células numa animação, não estruturas em escala.
"""


def paletas_md(pref=''):
    out = ['# Paletas', '',
           'Cada paleta (rampa) tem 6 cores: **contorno, sombra, meio-tom, base, luz e brilho**, nessa ordem nas amostras.', '']
    for var, desc in RAMPAS.items():
        out += [f'## {desc}', '', f'Nome no código: `{var}`', '', tabela_rampa(var, pref), '']
    out += ['## Cores avulsas', '', '| Hex | Uso |', '|---|---|']
    out += [f'| `{h}` | {u} |' for h, u in AVULSAS]
    out += ['', '## Paleta completa em uma linha (para importar no Aseprite/Photoshop)', '', '```']
    todas = []
    for var in RAMPAS:
        r = getattr(G, var)
        todas += [hexs(getattr(r, a)) for a, _ in TONS]
    todas += [h for h, _ in AVULSAS]
    vistos = []
    for h in todas:
        if h not in vistos:
            vistos.append(h)
    out += [' '.join(vistos), '```', '', f'Total: {len(vistos)} cores únicas. Também disponível em `paletas/paleta.gpl` (GIMP/Aseprite).', '']
    return '\n'.join(out), vistos


ANIMACAO = """# Animação

## Convenções

- Todos os sprites têm **48×48** e o **centro em (24, 24)**: o ponto de ancoragem (*pivot*) é sempre o centro.
- `sprites/spritesheet.png` é um atlas de **1 linha × 14 quadros** (672×48). Quadro *i* = `x = i × 48`.
- Para novos quadros de uma mesma célula, use uma linha por célula: `celula_estado_01.png`, `_02`…
- Taxa sugerida: **8 a 12 fps** para movimentos orgânicos e 4 a 6 fps para "respirar".
- Rotação: prefira girar em ângulos de 90° (sem perda de pixel) ou redesenhar. Rotações livres
  num motor de jogo devem ser feitas **depois** de ampliar ×4 ou mais, para não "quebrar" os pixels.

## Movimentos básicos que funcionam para todas as células

| Movimento | Como fazer |
|---|---|
| Respirar / pulsar | escala 1,00 → 1,04 → 1,00 (ease in-out, 1,2 s) |
| Flutuar | deslocamento senoidal de ±2 px em y (2–3 s) + rotação de ±4° |
| Rastejar | esticar 1,15 × 0,90 na direção do movimento e voltar |
| Ser atingida | piscar em branco por 1 quadro + tremer ±1 px |
| Morrer (apoptose) | dividir o sprite em 4–6 "bolhas" que se afastam e somem |
| Ativação | trocar de sprite (ex.: plaqueta → plaqueta ativada) com 1 quadro intermediário em escala 1,1 |

## Cenas sugeridas

1. **Corrente sanguínea**: hemácias rolando + plaquetas + leucócitos esparsos, fundo `#0b0a4a`.
2. **Lesão e coagulação**: plaquetas trocam para o sprite ativado e se agregam.
3. **Infecção bacteriana**: neutrófilos chegam (quimiotaxia) e fagocitam.
4. **Apresentação de antígeno**: a dendrítica migra até o linfonodo e "toca" o T CD4+.
5. **Resposta adaptativa**: CD4+ ativa CD8+ e B; B → plasmócito soltando anticorpos.
6. **Memória**: células com aura dourada reaparecem e respondem mais rápido.
7. **Parasita**: eosinófilos degranulando ao redor de um helminto.
8. **Vírus/tumor**: NK e CD8+ atacando células-alvo.
"""

PROMPT = """# Prompt para criar novas células no mesmo estilo

Copie o bloco abaixo, troque o que está entre `<…>` e cole no Claude (ou em outro assistente)
num projeto que tenha `ferramentas/gerar_celulas.py`.

```text
Crie um novo sprite de pixel art da célula <NOME DA CÉLULA> seguindo exatamente o estilo do
kit "guia-celulas" (veja 01-estilo-visual.md e 02-paletas.md):

- Canvas 48x48, fundo transparente, centro da célula em (24,24).
- Tamanho proporcional ao real: <TAMANHO EM µm> (≈2 px por µm nos leucócitos; raio máx. 22 px).
- Luz do canto superior esquerdo, L=(-0.55,-0.65,0.52); 4 tons em faixas
  (I>0.78 luz, >0.38 base, >0.02 meio-tom, resto sombra) + brilho de 2 px.
- Contorno de 1 px em vizinhança 4, no tom mais escuro da paleta (nunca preto).
- Núcleo com contorno próprio desenhado sobre o citoplasma.
- Ordem das camadas: elementos de trás → corpo → contorno → anel interno → núcleo → grânulos → elementos soltos.
- Morfologia que deve aparecer: <ex.: núcleo em ferradura, vacúolos, grânulos azul-escuros grandes>.
- Cores: <reutilizar rampa existente, ex.: NUC_PURPLE, ou criar uma rampa nova com 6 tons:
  contorno, sombra, meio-tom, base, luz, brilho>.
- Código visual para diferenciar das outras células: <ex.: pseudópodes largos, borda ondulada>.

Implemente como uma função nova em gerar_celulas.py usando os helpers existentes
(ellipse, limb, poly, y_glyph, Sprite.shade/outline/ring, granules, dilate), adicione-a
na lista CELULAS, gere os PNGs e crie a ficha celulas/<slug>.md no mesmo formato das outras.
```

## Exemplos de células para completar o conjunto

| Célula | Tamanho | Dicas de morfologia | Paleta sugerida |
|---|---|---|---|
| Monócito | 15–20 µm | núcleo em ferradura/rim, citoplasma azul-acinzentado | corpo `NK_BLUE` mais claro, núcleo `NUC_PURPLE` |
| Macrófago | 20–30 µm | grande, irregular, pseudópodes largos, vacúolos | corpo `ORANGE`/amarelo, núcleo `NUC_PURPLE` |
| Basófilo | 10–14 µm | grânulos grandes azul-escuros que cobrem o núcleo | corpo `CD8_BODY` claro, grânulos `NUC_PURPLE` |
| Mastócito | 10–20 µm | oval, cheio de grânulos roxos | corpo `PL_BODY`, grânulos `NUC_PURPLE` |
| Treg | 7–10 µm | como o T CD4+, mas com receptores em outra cor | corpo `CD4_BODY`, bolinhas verdes (nova rampa) |
| T virgem (naive) | 7–10 µm | sem receptores destacados, cores mais frias e apagadas | rampa dessaturada |
| Bactéria / vírus / helminto | — | "inimigos" para as cenas | verde-limão/ácido (contraste com o resto) |
"""

USO = """# Uso em projetos

## Gerar ou ajustar

```bash
python3 ferramentas/gerar_celulas.py     # gera sprites/png, png_x8 e spritesheet
python3 ferramentas/gerar_guia.py        # reconstrói esta pasta e o PDF (pandoc + Playwright)
```

Para mudar uma cor, edite a rampa no topo de `gerar_celulas.py` (ex.: `RED = Ramp(...)`) e rode de novo.
Os scripts originais ficam em `tools/` no repositório; aqui estão copiados em `ferramentas/`.
Ao rodar a cópia, os arquivos são gerados na pasta acima dela.

## HTML / CSS

```html
<img src="sprites/png/neutrofilo.png" class="celula">
<style>
  .celula { width: 192px; image-rendering: pixelated; }      /* 48 × 4 */
  @keyframes respirar { 50% { transform: scale(1.04); } }
  .celula { animation: respirar 1.2s ease-in-out infinite; }
</style>
```

Usando o spritesheet como recorte:

```css
.hemacia { width:48px; height:48px; background:url(sprites/spritesheet.png) 0 0;
           image-rendering: pixelated; transform: scale(4); }
.neutrofilo { background-position: -144px 0; }   /* índice 3 × 48 */
```

## Phaser 3

```js
this.load.spritesheet('celulas', 'sprites/spritesheet.png', { frameWidth: 48, frameHeight: 48 });
const n = this.add.sprite(400, 300, 'celulas', 3).setScale(4);   // 3 = neutrófilo
// no config do jogo: pixelArt: true
```

## Godot 4

- Importe o PNG com **Filter = Nearest** (Projeto → Configurações → Rendering → Textures → Default Texture Filter = Nearest).
- Use `Sprite2D` com `hframes = 14` e `frame = <índice>`.

## Unity

- Texture Type = *Sprite*, **Filter Mode = Point**, Compression = None, Pixels Per Unit = 48.
- Sprite Mode = *Multiple* → Slice → Grid by Cell Size 48×48.

## Vídeo (After Effects, Premiere, CapCut, DaVinci)

- Use os arquivos de `sprites/png_x8/` (384×384). Se precisar de mais, amplie em múltiplos inteiros com *nearest neighbor*.
- No After Effects: camada → Qualidade → **Rascunho**, ou Efeito → *Transformar* com amostragem "Vizinho mais próximo", para não borrar ao escalar.

## Índices do spritesheet

| Índice | Célula | x (px) |
|---|---|---|
""" + '\n'.join(f'| {i} | `{s}` | {i * 48} |' for i, s in enumerate(ORDEM)) + '\n'


# ------------------------------------------------------------------ main
def main():
    G.main()  # garante sprites atualizados em celulas/
    if os.path.exists(GUIA):
        shutil.rmtree(GUIA)
    for sub in ('celulas', 'sprites/png', 'sprites/png_x8', 'paletas', 'ferramentas'):
        os.makedirs(os.path.join(GUIA, sub), exist_ok=True)
    src = os.path.join(RAIZ, 'celulas')
    for sub in ('png', 'png_x8'):
        for f in os.listdir(os.path.join(src, sub)):
            shutil.copy(os.path.join(src, sub, f), os.path.join(GUIA, 'sprites', sub, f))
    for f in ('spritesheet.png', 'spritesheet_preview.png'):
        shutil.copy(os.path.join(src, f), os.path.join(GUIA, 'sprites', f))
    for f in ('gerar_celulas.py', 'gerar_guia.py'):
        shutil.copy(os.path.join(AQUI, f), os.path.join(GUIA, 'ferramentas', f))

    for var in RAMPAS:
        r = getattr(G, var)
        swatch([getattr(r, a) for a, _ in TONS], os.path.join(GUIA, 'paletas', f'{var.lower()}.png'))

    pal_md, cores = paletas_md()
    with open(os.path.join(GUIA, 'paletas', 'paleta.gpl'), 'w') as fp:
        fp.write('GIMP Palette\nName: Celulas pixel art\nColumns: 6\n#\n')
        for h in cores:
            r, g, b = G.hx(h)
            fp.write(f'{r:3d} {g:3d} {b:3d}\t{h}\n')

    arquivos = {
        'README.md': readme(), '01-estilo-visual.md': ESTILO, '02-paletas.md': pal_md,
        '03-animacao.md': ANIMACAO, '04-prompt-novas-celulas.md': PROMPT, '05-uso-em-projetos.md': USO,
    }
    for nome, txt in arquivos.items():
        with open(os.path.join(GUIA, nome), 'w') as fp:
            fp.write(txt)
    for s in ORDEM:
        with open(os.path.join(GUIA, 'celulas', f'{s}.md'), 'w') as fp:
            fp.write(ficha_md(s))

    # ---------- documento único para o PDF (caminhos relativos à raiz da pasta)
    capa = f"""<div class="capa">
<h1 class="titulo">Guia de células humanas<br>em pixel art</h1>
<p class="sub">Sangue e sistema imune · 14 sprites · paletas · fichas técnicas · animação</p>
<img class="sprite" src="sprites/spritesheet_preview.png">
</div>
"""
    partes = [capa, '# Visão geral\n' + readme(links=False).split('\n', 2)[2], ESTILO, pal_md,
              '# Fichas das células\n\nUma página por célula, na ordem do spritesheet.\n']
    partes += ['<div class="quebra"></div>\n\n' + ficha_md(s, pref='', nivel='##') for s in ORDEM]
    partes += [ANIMACAO, PROMPT, USO,
               '# Apêndice – código do gerador\n\n```python\n' +
               open(os.path.join(AQUI, 'gerar_celulas.py')).read() + '\n```\n']
    tudo = '\n\n'.join(partes)
    md_path = os.path.join(GUIA, '_guia_completo.md')
    html_path = os.path.join(GUIA, '_guia_completo.html')
    css_path = os.path.join(GUIA, '_estilo.css')
    with open(md_path, 'w') as fp:
        fp.write(tudo)
    with open(css_path, 'w') as fp:
        fp.write(CSS)
    subprocess.run(['pandoc', md_path, '-f', 'gfm+raw_html', '-t', 'html5', '-s', '--css', '_estilo.css',
                    '--metadata', 'title=Guia de células humanas em pixel art',
                    '-o', html_path], check=True)
    pdf_path = os.path.join(GUIA, 'guia-celulas.pdf')
    js = f"""
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://{html_path}', {{ waitUntil: 'load' }});
  await p.pdf({{ path: '{pdf_path}', format: 'A4', printBackground: true,
    margin: {{ top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' }},
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888">Guia de células humanas em pixel art · <span class="pageNumber"></span>/<span class="totalPages"></span></div>' }});
  await b.close();
}})();
"""
    subprocess.run(['node', '-e', js], check=True)
    for f in (md_path, html_path, css_path):
        os.remove(f)
    print('Guia gerado em', GUIA)


CSS = """
body { font-family: 'DejaVu Sans', sans-serif; font-size: 10.5pt; color: #1d1a3a; line-height: 1.45; max-width: none; margin: 0; }
header#title-block-header { display: none; }
h1 { color: #2a12a8; border-bottom: 3px solid #ffb81c; padding-bottom: 4px; page-break-before: always; font-size: 20pt; }
h2 { color: #5b1ff0; margin-top: 1.4em; font-size: 14pt; }
h3 { color: #3a2a80; font-size: 11.5pt; margin-bottom: .3em; }
.quebra { page-break-before: always; }
img.ficha { float: right; width: 150px; margin: 0 0 8px 12px; }
.quebra ~ * { font-size: 9.6pt; }
.quebra ~ table { font-size: 8.4pt; }
.quebra ~ h3 { margin: .7em 0 .2em; }
.quebra ~ ul, .quebra ~ ol { margin: .2em 0; }
h2, h3 { page-break-after: avoid; }
tr, img { page-break-inside: avoid; }
table { border-collapse: collapse; margin: .5em 0 1em; font-size: 9.5pt; }
th, td { border: 1px solid #d8d4f0; padding: 3px 8px; text-align: left; vertical-align: top; }
th { background: #efeaff; }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.8pt; background: #f3f1fb; padding: 0 3px; border-radius: 3px; }
pre { background: #14123a; color: #e8e6ff; padding: 10px 12px; border-radius: 6px; font-size: 7.6pt; line-height: 1.35;
      white-space: pre-wrap; word-break: break-word; }
pre code { background: none; color: inherit; font-size: inherit; padding: 0; }
img { image-rendering: pixelated; max-width: 100%; }
img.sprite { background: #0b0a4a; border-radius: 8px; padding: 6px; display: block; }
.cor { display: inline-block; width: 11px; height: 11px; border: 1px solid #0003; margin-right: 4px; vertical-align: -1px; }
td code { white-space: nowrap; }
.capa { text-align: center; padding-top: 40px; }
.capa h1.titulo { page-break-before: avoid; border: none; font-size: 30pt; color: #2a12a8; }
.capa .sub { font-size: 12pt; color: #5b1ff0; margin-bottom: 24px; }
.capa img { margin: 0 auto; }
nav#TOC { page-break-before: always; }
nav#TOC::before { content: 'Sumário'; display: block; font-size: 20pt; color: #2a12a8; font-weight: bold;
                  border-bottom: 3px solid #ffb81c; margin-bottom: 10px; }
nav#TOC ul { list-style: none; padding-left: 14px; }
nav#TOC > ul > li { margin-top: 6px; font-weight: bold; }
nav#TOC li li { font-weight: normal; }
nav#TOC a { color: #2a12a8; text-decoration: none; }
"""

if __name__ == '__main__':
    main()
