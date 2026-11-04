# Neutrófilo

<img class="sprite ficha" src="../sprites/png_x8/neutrofilo.png" width="192" alt="Neutrófilo">

| Campo | Valor |
|---|---|
| Arquivo | `sprites/png/neutrofilo.png` (48×48) · `sprites/png_x8/neutrofilo.png` (384×384) |
| Índice no spritesheet | 3 (x = 144 px) |
| Tamanho real | 12–15 µm |
| Área ocupada no sprite | 35×33 px |
| Paletas | Corpo e espículas → `ORANGE`, Núcleo → `NUC_BLUE` |

## Biologia

Leucócito mais abundante (50–70 %). É a primeira linha de defesa contra bactérias e fungos: chega rápido por quimiotaxia, fagocita, degranula e pode lançar NETs (redes de DNA). Núcleo segmentado em 3 a 5 lobos. Vive horas a poucos dias e forma o pus.

## Como reconhecer no sprite

- Corpo **laranja espiculado** (10 espículas)
- Núcleo **azul com 4 lobos** ligados por filamentos
- 11 grânulos pontuais claros no citoplasma

## Construção (camadas, de trás para frente)

1. 10 espículas afinadas (3,2 → 0,9 px), de 11 a 15,6 px do centro, a cada 36° (±5°), tom *meio-tom*
2. Corpo: elipse rx 12,6 × ry 12,4 (harmônico 4, amplitude 0,02), sombreado
3. Contorno externo unindo corpo + espículas
4. Lobos (elipse 3,9 × 3,7) em (18,21) (23,5,16,6) (30,19,5) (29,5,28,5), cada um sombreado individualmente
5. Filamentos entre lobos com 1,7 px de largura, tom *meio-tom* azul
6. Contorno do núcleo desenhado sobre o citoplasma
7. Grânulos: 11 pixels *hi* a ≥ 3,2 px de distância entre si e longe do núcleo

## Cores

| Parte | Contorno | Sombra | Meio-tom | Base | Luz | Brilho |
|---|---|---|---|---|---|---|
| **Corpo e espículas**<br>`ORANGE` | <span class="cor" style="background:#4a1a05"></span>`#4a1a05` | <span class="cor" style="background:#c25a0f"></span>`#c25a0f` | <span class="cor" style="background:#ee8a12"></span>`#ee8a12` | <span class="cor" style="background:#ffaa1c"></span>`#ffaa1c` | <span class="cor" style="background:#ffc94a"></span>`#ffc94a` | <span class="cor" style="background:#fff0a0"></span>`#fff0a0` |
| **Núcleo**<br>`NUC_BLUE` | <span class="cor" style="background:#0e1c5a"></span>`#0e1c5a` | <span class="cor" style="background:#2a3bb8"></span>`#2a3bb8` | <span class="cor" style="background:#2f6bf0"></span>`#2f6bf0` | <span class="cor" style="background:#3fa2f5"></span>`#3fa2f5` | <span class="cor" style="background:#7cd2ff"></span>`#7cd2ff` | <span class="cor" style="background:#d0f4ff"></span>`#d0f4ff` |

## Ideias de animação

- Rastejar (diapedese): esticar a 1,15 × 0,9 e voltar, alternando a direção
- Espículas pulsando (alternar dois sprites com espículas a 90 % e 100 %)
- Fagocitose: abrir dois pseudópodes que envolvem a bactéria
