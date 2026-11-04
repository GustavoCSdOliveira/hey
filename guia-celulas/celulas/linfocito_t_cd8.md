# Linfócito T CD8+ (citotóxico)

<img class="sprite ficha" src="../sprites/png_x8/linfocito_t_cd8.png" width="192" alt="Linfócito T CD8+ (citotóxico)">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/linfocito_t_cd8.png` (48×48) · `sprites/png_x8/linfocito_t_cd8.png` (384×384) |
| Índice no spritesheet | 8 (x = 384 px) |
| Tamanho real | 7–10 µm |
| Área ocupada no sprite | 35×34 px |
| Paletas | Corpo → `CD8_BODY`, Espículas → `CYAN`, Núcleo → `NUC_ORANGE` |

## Biologia

Reconhece antígenos no **MHC de classe I**, presente em quase todas as células. Mata células infectadas e tumorais com perforina e granzimas, ou pela via Fas/FasL. Precisa da ajuda do T CD4+ para uma resposta forte e duradoura.

## Como reconhecer no sprite

- Corpo **azul-violeta**
- **11 espículas ciano** pontiagudas
- Núcleo laranja central

## Construção (camadas, de trás para frente)

1. 11 espículas (3,4 → 0,7 px), de 10 a 15,8 px, a cada 32,7° começando em 6°, tom *base* ciano
2. Corpo: elipse 11,0 × 10,8
3. Contorno externo (sem anel interno, para as espículas ficarem ligadas ao corpo)
4. Núcleo: raio 6,6

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`CD8_BODY` | <span class="cor" style="background:#0a0a50"></span>`#0a0a50` | <span class="cor" style="background:#2a1a9c"></span>`#2a1a9c` | <span class="cor" style="background:#3a3be0"></span>`#3a3be0` | <span class="cor" style="background:#4a6cff"></span>`#4a6cff` | <span class="cor" style="background:#70a8ff"></span>`#70a8ff` | <span class="cor" style="background:#c8e8ff"></span>`#c8e8ff` |
| **Espículas**<br>`CYAN` | <span class="cor" style="background:#06285a"></span>`#06285a` | <span class="cor" style="background:#1590c8"></span>`#1590c8` | <span class="cor" style="background:#26b8e8"></span>`#26b8e8` | <span class="cor" style="background:#36d1f5"></span>`#36d1f5` | <span class="cor" style="background:#7ce8ff"></span>`#7ce8ff` | <span class="cor" style="background:#d0fbff"></span>`#d0fbff` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

## Ideias de animação

- Espículas "armando": alternar comprimento 85 % ↔ 100 %
- Ataque: avançar rápido até o alvo e piscar em branco por 1 quadro
