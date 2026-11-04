# Eosinófilo

<img class="sprite ficha" src="../sprites/png_x8/eosinofilo.png" width="192" alt="Eosinófilo">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/eosinofilo.png` (48×48) · `sprites/png_x8/eosinofilo.png` (384×384) |
| Índice no spritesheet | 4 (x = 192 px) |
| Tamanho real | 12–17 µm |
| Área ocupada no sprite | 33×28 px |
| Paletas | Corpo → `EOS`, Grânulos → `EOS_GRAN`, Núcleo → `NUC_PURPLE` |

## Biologia

Representa 1–4 % dos leucócitos. Combate parasitas grandes (helmintos) liberando a proteína básica principal e outras proteínas tóxicas dos grânulos. Participa de alergias e da asma. Núcleo bilobado ("óculos") e grânulos grandes que coram com eosina (vermelho-alaranjado).

## Como reconhecer no sprite

- Oval **laranja** com **núcleo roxo bilobado**
- 13 grânulos 2×2 vermelhos com brilho e sombra

## Construção (camadas, de trás para frente)

1. Corpo: elipse rx 15,2 × ry 12,6 com irregularidade (harmônicos 4 e 3)
2. Lobos: elipses 4,7 × 5,6 em (19, 23,6) e (29,5, 24,6), unidos por uma ponte de 2,2 px
3. Contorno do núcleo sobre o citoplasma
4. Grânulos 2×2: pixel sup-esq = *hi*, sup-dir = *light*, inf-dir = *dark*, resto = *base*; distância mínima de 3,7 px, longe do núcleo

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`EOS` | <span class="cor" style="background:#4a1405"></span>`#4a1405` | <span class="cor" style="background:#c8481a"></span>`#c8481a` | <span class="cor" style="background:#ef6e1e"></span>`#ef6e1e` | <span class="cor" style="background:#ff8f1f"></span>`#ff8f1f` | <span class="cor" style="background:#ffb040"></span>`#ffb040` | <span class="cor" style="background:#ffe0a0"></span>`#ffe0a0` |
| **Grânulos**<br>`EOS_GRAN` | <span class="cor" style="background:#5a0a05"></span>`#5a0a05` | <span class="cor" style="background:#a81a14"></span>`#a81a14` | <span class="cor" style="background:#d92b1f"></span>`#d92b1f` | <span class="cor" style="background:#f04a30"></span>`#f04a30` | <span class="cor" style="background:#ff6b4a"></span>`#ff6b4a` | <span class="cor" style="background:#ffc0a0"></span>`#ffc0a0` |
| **Núcleo**<br>`NUC_PURPLE` | <span class="cor" style="background:#260a40"></span>`#260a40` | <span class="cor" style="background:#4b1a8c"></span>`#4b1a8c` | <span class="cor" style="background:#6b2fd0"></span>`#6b2fd0` | <span class="cor" style="background:#8a4cf0"></span>`#8a4cf0` | <span class="cor" style="background:#b58bff"></span>`#b58bff` | <span class="cor" style="background:#e3d0ff"></span>`#e3d0ff` |

## Ideias de animação

- Degranulação: grânulos "saltando" para fora (deslocar 2–4 px e sumir)
- Flutuar lentamente com rotação de ±5°
