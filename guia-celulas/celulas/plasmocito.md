# Plasmócito

<img class="sprite ficha" src="../sprites/png_x8/plasmocito.png" width="192" alt="Plasmócito">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/plasmocito.png` (48×48) · `sprites/png_x8/plasmocito.png` (384×384) |
| Índice no spritesheet | 10 (x = 480 px) |
| Tamanho real | 10–20 µm |
| Área ocupada no sprite | 44×40 px |
| Paletas | Corpo → `PL_BODY`, Núcleo → `NUC_PURPLE` |

## Biologia

Linfócito B totalmente diferenciado: uma "fábrica" de anticorpos que secreta milhares de moléculas por segundo. Tem muito retículo endoplasmático rugoso, um Golgi desenvolvido (o halo claro ao lado do núcleo) e o núcleo excêntrico com cromatina em "roda de carroça".

## Como reconhecer no sprite

- Oval rosa claro com o **núcleo roxo deslocado para a esquerda**
- Cromatina em pontos, como uma "roda de carroça"
- Halo claro (Golgi) do lado direito do núcleo
- **Anticorpos (Y) soltos** ao redor

## Construção (camadas, de trás para frente)

1. Corpo: elipse 13,2 × 11,0 em (24,5, 24)
2. Halo: anel entre 1 e 3 px ao redor do núcleo, só do lado direito, tom *light*
3. Núcleo: elipse 5,9 × 6,2 em (19, 24,2)
4. Cromatina: 6 pontos a 3,4 px do centro do núcleo (a cada 60°) + 1 ponto central
5. Anticorpos: até 10 Y (tronco 2,6 + braços 2,0) a 16,5–20,5 px do centro, em ângulos aleatórios, a ≥ 5,2 px uns dos outros, alternando 3 cores

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`PL_BODY` | <span class="cor" style="background:#3a0640"></span>`#3a0640` | <span class="cor" style="background:#b02a9e"></span>`#b02a9e` | <span class="cor" style="background:#e04fc8"></span>`#e04fc8` | <span class="cor" style="background:#ff70e0"></span>`#ff70e0` | <span class="cor" style="background:#ff9eee"></span>`#ff9eee` | <span class="cor" style="background:#ffe0fa"></span>`#ffe0fa` |
| **Núcleo**<br>`NUC_PURPLE` | <span class="cor" style="background:#260a40"></span>`#260a40` | <span class="cor" style="background:#4b1a8c"></span>`#4b1a8c` | <span class="cor" style="background:#6b2fd0"></span>`#6b2fd0` | <span class="cor" style="background:#8a4cf0"></span>`#8a4cf0` | <span class="cor" style="background:#b58bff"></span>`#b58bff` | <span class="cor" style="background:#e3d0ff"></span>`#e3d0ff` |

Cores avulsas: <span class="cor" style="background:#1a0640"></span>`#1a0640` Cromatina · <span class="cor" style="background:#a050ff"></span>`#a050ff` Anticorpo roxo · <span class="cor" style="background:#ff60d0"></span>`#ff60d0` Anticorpo rosa · <span class="cor" style="background:#6a7bff"></span>`#6a7bff` Anticorpo azul

## Ideias de animação

- Secreção contínua: gerar novos Y na borda direita e afastá-los 1 px por quadro
- Leve "respiração" (escala 1,00 ↔ 1,03)
