# Linfócito T CD8+ de memória

<img class="sprite ficha" src="../sprites/png_x8/memoria_t_cd8.png" width="192" alt="Linfócito T CD8+ de memória">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/memoria_t_cd8.png` (48×48) · `sprites/png_x8/memoria_t_cd8.png` (384×384) |
| Índice no spritesheet | 12 (x = 576 px) |
| Tamanho real | mesmo tamanho da célula de origem |
| Área ocupada no sprite | 40×40 px |
| Paletas | Corpo → `CD8_BODY`, Espículas → `CYAN`, Núcleo → `NUC_ORANGE` |

## Biologia

Depois de uma infecção, alguns linfócitos T e B ativados se tornam **células de memória** de vida longa (anos ou décadas). Num segundo contato com o mesmo antígeno, respondem mais rápido e com mais força. É a base da imunidade adquirida e das vacinas. Na memória B, a afinidade do anticorpo já passou pela maturação.

## Como reconhecer no sprite

- Mesmo desenho da célula de origem
- **Aura dourada tracejada** ao redor
- 3 brilhos em forma de "+"
- Base: `linfocito_t_cd8`

## Construção (camadas, de trás para frente)

1. Desenhar a célula de origem completa
2. Anel tracejado com raio = (maior distância do sprite ao centro) + 1,8 px e espessura de ~1 px
3. Padrão: a cada 9° de ângulo, 3 segmentos acesos e 2 apagados; o 2º segmento aceso usa o tom de brilho
4. Brilhos: cruz de 5 px a raio + 2,6 px, nos ângulos −48°, 34° e 138°, centro em #fff3a0

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`CD8_BODY` | <span class="cor" style="background:#0a0a50"></span>`#0a0a50` | <span class="cor" style="background:#2a1a9c"></span>`#2a1a9c` | <span class="cor" style="background:#3a3be0"></span>`#3a3be0` | <span class="cor" style="background:#4a6cff"></span>`#4a6cff` | <span class="cor" style="background:#70a8ff"></span>`#70a8ff` | <span class="cor" style="background:#c8e8ff"></span>`#c8e8ff` |
| **Espículas**<br>`CYAN` | <span class="cor" style="background:#06285a"></span>`#06285a` | <span class="cor" style="background:#1590c8"></span>`#1590c8` | <span class="cor" style="background:#26b8e8"></span>`#26b8e8` | <span class="cor" style="background:#36d1f5"></span>`#36d1f5` | <span class="cor" style="background:#7ce8ff"></span>`#7ce8ff` | <span class="cor" style="background:#d0fbff"></span>`#d0fbff` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

Cores avulsas: <span class="cor" style="background:#ffd23a"></span>`#ffd23a` Aura (ouro) · <span class="cor" style="background:#fff3a0"></span>`#fff3a0` Aura (brilho)

## Ideias de animação

- Brilhos piscando de forma alternada (um por quadro)
- Aura girando devagar (deslocar o padrão em 9° por quadro)
- Na resposta secundária: a aura se expande e some enquanto a célula se multiplica
