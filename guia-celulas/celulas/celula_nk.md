# Célula NK (natural killer)

<img class="sprite ficha" src="../sprites/png_x8/celula_nk.png" width="192" alt="Célula NK (natural killer)">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/celula_nk.png` (48×48) · `sprites/png_x8/celula_nk.png` (384×384) |
| Índice no spritesheet | 5 (x = 240 px) |
| Tamanho real | 10–15 µm (linfócito grande granular) |
| Área ocupada no sprite | 32×33 px |
| Paletas | Corpo → `NK_BLUE`, Espículas e grânulos → `CYAN`, Núcleo → `NUC_ORANGE` |

## Biologia

Linfócito da imunidade **inata**. Elimina células infectadas por vírus e células tumorais que perderam o MHC de classe I ("missing self"), sem precisar de sensibilização prévia. Mata liberando perforina e granzimas e produz IFN-γ.

## Como reconhecer no sprite

- Corpo **azul** com 9 espículas **ciano**
- Núcleo laranja reniforme (com reentrância)
- 7 grânulos ciano 2×2 (grânulos citotóxicos)

## Construção (camadas, de trás para frente)

1. 9 espículas (3,0 → 1,0 px), de 11 a 15,2 px, a cada 40° (±6°), tom *base* ciano
2. Corpo: elipse 12,6 × 12,2 (harmônicos 3 e 5)
3. Contorno externo
4. Núcleo: elipse 6,6 × 7,0 em (23, 24) menos uma elipse 2,3 × 2,6 em (28,6, 21,8)
5. Grânulos ciano a < 10,8 px do centro, longe do núcleo

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`NK_BLUE` | <span class="cor" style="background:#060a3a"></span>`#060a3a` | <span class="cor" style="background:#1b1f9c"></span>`#1b1f9c` | <span class="cor" style="background:#2a3be0"></span>`#2a3be0` | <span class="cor" style="background:#3a63ff"></span>`#3a63ff` | <span class="cor" style="background:#5aa0ff"></span>`#5aa0ff` | <span class="cor" style="background:#b0e0ff"></span>`#b0e0ff` |
| **Espículas e grânulos**<br>`CYAN` | <span class="cor" style="background:#06285a"></span>`#06285a` | <span class="cor" style="background:#1590c8"></span>`#1590c8` | <span class="cor" style="background:#26b8e8"></span>`#26b8e8` | <span class="cor" style="background:#36d1f5"></span>`#36d1f5` | <span class="cor" style="background:#7ce8ff"></span>`#7ce8ff` | <span class="cor" style="background:#d0fbff"></span>`#d0fbff` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

## Ideias de animação

- "Beijo da morte": encostar na célula-alvo e soltar os grânulos ciano em direção a ela
- Espículas girando lentamente (rotação contínua de 360° em 16 quadros)
