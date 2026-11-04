# Célula dendrítica

<img class="sprite ficha" src="../sprites/png_x8/celula_dendritica.png" width="192" alt="Célula dendrítica">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/celula_dendritica.png` (48×48) · `sprites/png_x8/celula_dendritica.png` (384×384) |
| Índice no spritesheet | 6 (x = 288 px) |
| Tamanho real | corpo ~10–15 µm; prolongamentos de até 50 µm ou mais |
| Área ocupada no sprite | 48×46 px |
| Paletas | Corpo → `DC_BODY`, Dendritos → `MAGENTA`, Núcleo → `NUC_ORANGE` |

## Biologia

Principal célula apresentadora de antígeno. Vive nos tecidos (pele, mucosas) capturando antígenos. Ao ser ativada, migra pelos vasos linfáticos até o linfonodo e apresenta peptídeos no MHC I e II aos linfócitos T virgens, decidindo o tipo de resposta. É a ponte entre a imunidade inata e a adaptativa.

## Como reconhecer no sprite

- Corpo roxo pequeno e **8 dendritos magenta ramificados**
- Núcleo laranja levemente deslocado

## Construção (camadas, de trás para frente)

1. 8 braços a cada 45° (±8°): tronco de 6 px até 14,5 ± 1,5 px (largura 4,0 → 2,0)
2. Na ponta do tronco: 2 ramos a ±30° (largura 2,2 → 1,0, comprimento ~8 px) + 1 prolongamento central (+6,5 px)
3. Textura nos dendritos: 1 em cada 3 pixels em *base* na metade iluminada
4. Corpo: elipse 9,3 × 8,6 sombreada
5. Contorno externo magenta escuro + anel do corpo em roxo escuro
6. Núcleo: elipse 4,6 × 4,4 em (25, 23,5)

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`DC_BODY` | <span class="cor" style="background:#1c0640"></span>`#1c0640` | <span class="cor" style="background:#4a1699"></span>`#4a1699` | <span class="cor" style="background:#6a22d4"></span>`#6a22d4` | <span class="cor" style="background:#8a3df0"></span>`#8a3df0` | <span class="cor" style="background:#b078ff"></span>`#b078ff` | <span class="cor" style="background:#e2cbff"></span>`#e2cbff` |
| **Dendritos**<br>`MAGENTA` | <span class="cor" style="background:#3a0640"></span>`#3a0640` | <span class="cor" style="background:#a5189b"></span>`#a5189b` | <span class="cor" style="background:#d12fc2"></span>`#d12fc2` | <span class="cor" style="background:#f255d8"></span>`#f255d8` | <span class="cor" style="background:#ff8be8"></span>`#ff8be8` | <span class="cor" style="background:#ffd0f6"></span>`#ffd0f6` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

## Ideias de animação

- Dendritos "ondulando": deslocar as pontas ±1 px em quadros alternados
- Migração: encolher os dendritos (70 %) enquanto se move e estendê-los ao chegar ao linfonodo
