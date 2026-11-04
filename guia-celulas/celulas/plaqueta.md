# Plaqueta (trombócito)

<img class="sprite ficha" src="../sprites/png_x8/plaqueta.png" width="192" alt="Plaqueta (trombócito)">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/plaqueta.png` (48×48) · `sprites/png_x8/plaqueta.png` (384×384) |
| Índice no spritesheet | 1 (x = 48 px) |
| Tamanho real | 2–3 µm |
| Área ocupada no sprite | 14×11 px |
| Paletas | Corpo → `PLT` |

## Biologia

Fragmento do citoplasma do megacariócito (medula óssea). Atua na hemostasia: adere à parede do vaso lesionado, libera o conteúdo dos grânulos e se agrega formando o tampão plaquetário. Sem núcleo. Vive de 7 a 10 dias.

## Como reconhecer no sprite

- Pequeno fragmento oval lilás
- 4 grânulos escuros de 1 px
- É o menor sprite do conjunto

## Construção (camadas, de trás para frente)

1. Elipse rx 5,6 × ry 4,4 com irregularidade (harmônico 3, amplitude 0,05)
2. Sombreamento esférico em 4 tons
3. Grânulos em (22,25) (26,22) (25,26) (21,22)
4. Contorno externo

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo**<br>`PLT` | <span class="cor" style="background:#2e1245"></span>`#2e1245` | <span class="cor" style="background:#5b2a86"></span>`#5b2a86` | <span class="cor" style="background:#8348b8"></span>`#8348b8` | <span class="cor" style="background:#a867d8"></span>`#a867d8` | <span class="cor" style="background:#c791ee"></span>`#c791ee` | <span class="cor" style="background:#efd2ff"></span>`#efd2ff` |

Cores avulsas: <span class="cor" style="background:#3d1666"></span>`#3d1666` Grânulos

## Ideias de animação

- Flutuar em grupos de 3 a 6 com rotações diferentes
- Ao detectar lesão: trocar pelo sprite **plaqueta_ativada** (1–2 quadros de transição)
- Agregação: aproximar várias plaquetas ativadas até se sobreporem
