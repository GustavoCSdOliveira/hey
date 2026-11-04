# Linfócito B de memória

<img class="sprite ficha" src="../sprites/png_x8/memoria_b.png" width="192" alt="Linfócito B de memória">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/memoria_b.png` (48×48) · `sprites/png_x8/memoria_b.png` (384×384) |
| Índice no spritesheet | 13 (x = 624 px) |
| Tamanho real | mesmo tamanho da célula de origem |
| Área ocupada no sprite | 48×48 px |
| Paletas | Corpo → `B_BODY`, Núcleo → `NUC_ORANGE` |

## Biologia

Depois de uma infecção, alguns linfócitos T e B ativados se tornam **células de memória** de vida longa (anos ou décadas). Num segundo contato com o mesmo antígeno, respondem mais rápido e com mais força. É a base da imunidade adquirida e das vacinas. Na memória B, a afinidade do anticorpo já passou pela maturação.

## Como reconhecer no sprite

- Mesmo desenho da célula de origem
- **Aura dourada tracejada** ao redor
- 3 brilhos em forma de "+"
- Base: `linfocito_b`

## Construção (camadas, de trás para frente)

1. Desenhar a célula de origem completa
2. Anel tracejado com raio = (maior distância do sprite ao centro) + 1,8 px e espessura de ~1 px
3. Padrão: a cada 9° de ângulo, 3 segmentos acesos e 2 apagados; o 2º segmento aceso usa o tom de brilho
4. Brilhos: cruz de 5 px a raio + 2,6 px, nos ângulos −48°, 34° e 138°, centro em #fff3a0

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`B_BODY` | <span class="cor" style="background:#3a0640"></span>`#3a0640` | <span class="cor" style="background:#9a1a8c"></span>`#9a1a8c` | <span class="cor" style="background:#cc2fc0"></span>`#cc2fc0` | <span class="cor" style="background:#ee4fd8"></span>`#ee4fd8` | <span class="cor" style="background:#ff86e8"></span>`#ff86e8` | <span class="cor" style="background:#ffd6f6"></span>`#ffd6f6` |
| **Núcleo**<br>`NUC_ORANGE` | <span class="cor" style="background:#5a1c00"></span>`#5a1c00` | <span class="cor" style="background:#d1500a"></span>`#d1500a` | <span class="cor" style="background:#ff8a14"></span>`#ff8a14` | <span class="cor" style="background:#ffb020"></span>`#ffb020` | <span class="cor" style="background:#ffd24a"></span>`#ffd24a` | <span class="cor" style="background:#fff3b0"></span>`#fff3b0` |

Cores avulsas: <span class="cor" style="background:#9a4dff"></span>`#9a4dff` BCR – Y roxo · <span class="cor" style="background:#c58bff"></span>`#c58bff` BCR – Y lilás · <span class="cor" style="background:#ffd23a"></span>`#ffd23a` Aura (ouro) · <span class="cor" style="background:#fff3a0"></span>`#fff3a0` Aura (brilho)

## Ideias de animação

- Brilhos piscando de forma alternada (um por quadro)
- Aura girando devagar (deslocar o padrão em 9° por quadro)
- Na resposta secundária: a aura se expande e some enquanto a célula se multiplica
