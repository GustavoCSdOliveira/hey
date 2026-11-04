# Linfócito T CD4+ (auxiliar / helper)

<img class="sprite ficha" src="../sprites/png_x8/linfocito_t_cd4.png" width="192" alt="Linfócito T CD4+ (auxiliar / helper)">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/linfocito_t_cd4.png` (48×48) · `sprites/png_x8/linfocito_t_cd4.png` (384×384) |
| Índice no spritesheet | 7 (x = 336 px) |
| Tamanho real | 7–10 µm |
| Área ocupada no sprite | 30×30 px |
| Paletas | Corpo → `CD4_BODY`, Receptores (bolinhas) → `MAGENTA`, Núcleo → `NUC_ORANGE` |

## Biologia

Reconhece antígenos apresentados no **MHC de classe II**. Coordena a resposta imune liberando citocinas: ajuda o linfócito B a produzir anticorpos, ativa macrófagos e sustenta os T CD8+. Subtipos: Th1, Th2, Th17, Tfh e Treg. É o alvo do HIV.

## Como reconhecer no sprite

- Corpo **violeta** redondo
- **12 "bolinhas" rosa** na membrana (receptores)
- Núcleo grande, laranja e redondo (pouco citoplasma, típico do linfócito)

## Construção (camadas, de trás para frente)

1. 12 bolinhas (elipse 2,4 px) a 11,6 px do centro, a cada 30° começando em 8°, sombreadas sem brilho
2. Corpo: elipse 11,2 × 11,0 sombreada por cima
3. Contorno externo + anel do corpo
4. Núcleo: círculo de raio 6,8 no centro, sombreado, com contorno

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`CD4_BODY` | <span class="cor" style="background:#240850"></span>`#240850` | <span class="cor" style="background:#5a1a9c"></span>`#5a1a9c` | <span class="cor" style="background:#8a2fd8"></span>`#8a2fd8` | <span class="cor" style="background:#b04af0"></span>`#b04af0` | <span class="cor" style="background:#d080ff"></span>`#d080ff` | <span class="cor" style="background:#f0d0ff"></span>`#f0d0ff` |
| **Receptores (bolinhas)**<br>`MAGENTA` | <span class="cor" style="background:#3a0640"></span>`#3a0640` | <span class="cor" style="background:#a5189b"></span>`#a5189b` | <span class="cor" style="background:#d12fc2"></span>`#d12fc2` | <span class="cor" style="background:#f255d8"></span>`#f255d8` | <span class="cor" style="background:#ff8be8"></span>`#ff8be8` | <span class="cor" style="background:#ffd0f6"></span>`#ffd0f6` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

## Ideias de animação

- Pulsar suave (escala 1,00 ↔ 1,04)
- Ao ativar: soltar pequenos pontos (citocinas) em direção às células vizinhas
