# Estilo visual

## Referências

- **Forma e cor**: o infográfico *"The Immune System"* (fundo azul-marinho, células em neon
  saturado, núcleos laranja ou dourados, prolongamentos magenta e ciano).
- **Técnica de pixel**: personagens em pixel art clássicos (contorno escuro e colorido,
  sombreamento em faixas, brilho de 1 a 2 px, sem antisserrilhado).

## Canvas e escala

| Regra | Valor |
|---|---|
| Tamanho do canvas | 48 × 48 px |
| Fundo | transparente (RGBA) |
| Centro da célula | (24, 24); coordenadas contínuas, com o centro do pixel em +0,5 |
| Escala biológica | ~2 px por µm nos leucócitos; o tamanho relativo é preservado (a plaqueta é a menor, a hemácia é menor que os leucócitos) |
| Maior extensão permitida | raio de ~22 px (deixe 2 px de margem para o contorno e a aura) |
| Ampliação | só múltiplos inteiros (×2, ×4, ×6, ×8) com *nearest neighbor* |

## Luz e sombreamento

- Vetor de luz normalizado **L = (−0,55; −0,65; 0,52)**, vindo do canto superior esquerdo, um pouco de frente.
- Cada forma é tratada como um elipsoide: normal `n = (nx, ny, √(1 − nx² − ny²))`.
- Intensidade `I = n · L`, quantizada em faixas (sem gradiente nem *dithering*):

| Intensidade | Tom |
|---|---|
| I > 0,78 | **luz** |
| 0,38 < I ≤ 0,78 | **base** |
| 0,02 < I ≤ 0,38 | **meio-tom** |
| I ≤ 0,02 | **sombra** |

- **Brilho especular**: 2 pixels lado a lado no tom *hi*, na posição `(cx − 0,42·rx, cy − 0,5·ry)`.
  Só em formas com mais de 12 pixels.
- Formas côncavas (o centro da hemácia) usam a luz invertida: escuro em cima à esquerda, claro embaixo à direita.

## Contorno

- **1 px, vizinhança 4** (cima, baixo, esquerda, direita). Diagonais ficam "em escada", como na referência.
- Cor do contorno = tom mais escuro da paleta principal da célula (nunca preto puro).
- O contorno externo é calculado sobre a **união** de corpo + espículas + prolongamentos.
- **Anel interno**: para separar o corpo dos receptores (CD4, dendrítica, B), desenha-se um
  contorno sobre os pixels já pintados ao redor do corpo.
- **Núcleo**: tem contorno próprio, desenhado sobre o citoplasma.

## Ordem das camadas

1. Elementos de trás: espículas, bolinhas, dendritos, pseudópodes
2. Corpo (citoplasma) sombreado
3. Contorno externo
4. Anel interno (opcional)
5. Halo ou estruturas internas claras (Golgi)
6. Núcleo sombreado + contorno do núcleo
7. Grânulos e detalhes (cromatina)
8. Elementos de fora sem contorno: anticorpos (Y), aura de memória, brilhos

## Elementos recorrentes

| Elemento | Como desenhar |
|---|---|
| **Espícula** | Trapézio afinado (base 3–3,4 px → ponta 0,7–1 px), radial, entrando 1 px no corpo |
| **Bolinha / receptor** | Círculo de raio 2,4 px sobre a borda, sombreado sem brilho |
| **Grânulo 2×2** | sup-esq = brilho · sup-dir = luz · inf-esq = base · inf-dir = sombra |
| **Grânulo pontual** | 1 pixel no tom de brilho |
| **Anticorpo (Y)** | Tronco de 2,6–3,2 px + 2 braços de 2,0–2,4 px a ±42°, 1 px de espessura, sem contorno |
| **Núcleo de linfócito** | Círculo laranja-ouro de raio 6,6–7,2 (ocupa ~60 % da célula) |
| **Aura de memória** | Anel tracejado dourado (3 acesos, 2 apagados a cada 9°) + 3 brilhos em "+" |

## Simplificações (avisar em material didático)

As cores são **estilizadas** e não reproduzem a coloração real de lâmina (Giemsa/H&E). Por exemplo,
o citoplasma real do neutrófilo é rosa-pálido, não laranja. As formas seguem a morfologia real:
núcleo multilobulado, bilobado, excêntrico etc. As espículas e "bolinhas" são **códigos visuais**
para diferenciar as células numa animação, não estruturas em escala.
