# Linfócito B

<img class="sprite ficha" src="../sprites/png_x8/linfocito_b.png" width="192" alt="Linfócito B">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/linfocito_b.png` (48×48) · `sprites/png_x8/linfocito_b.png` (384×384) |
| Índice no spritesheet | 9 (x = 432 px) |
| Tamanho real | 7–10 µm |
| Área ocupada no sprite | 45×41 px |
| Paletas | Corpo → `B_BODY`, Núcleo → `NUC_ORANGE` |

## Biologia

Tem na superfície o **BCR**, um anticorpo de membrana que reconhece o antígeno na forma nativa. Também apresenta antígeno ao T CD4+. Depois de ativado (com a ajuda do Tfh), prolifera e se diferencia em plasmócito ou em célula B de memória.

## Como reconhecer no sprite

- Oval **rosa-magenta**
- Núcleo laranja grande
- **7 pequenos Y** (BCR) na superfície, apontando para fora

## Construção (camadas, de trás para frente)

1. Corpo: elipse 13,0 × 10,8
2. Contorno externo + anel do corpo
3. Núcleo: elipse 7,2 × 6,9 em (23,4, 24)
4. Y: tronco de 3,2 px + 2 braços de 2,4 px a ±42°, começando 1,7 px fora da borda de uma elipse 15,6 × 13,4, a cada 51,4° a partir de 14°, cores alternadas

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`B_BODY` | <span class="cor" style="background:#3a0640"></span>`#3a0640` | <span class="cor" style="background:#9a1a8c"></span>`#9a1a8c` | <span class="cor" style="background:#cc2fc0"></span>`#cc2fc0` | <span class="cor" style="background:#ee4fd8"></span>`#ee4fd8` | <span class="cor" style="background:#ff86e8"></span>`#ff86e8` | <span class="cor" style="background:#ffd6f6"></span>`#ffd6f6` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

Cores avulsas: <span class="cor" style="background:#9a4dff"></span>`#9a4dff` BCR – Y roxo · <span class="cor" style="background:#c58bff"></span>`#c58bff` BCR – Y lilás

## Ideias de animação

- Y "balançando" ±10°
- Ao encontrar o antígeno: os Y se agrupam de um lado (capping)
