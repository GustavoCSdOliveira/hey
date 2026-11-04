# Animação

## Convenções

- Todos os sprites têm **48×48** e o **centro em (24, 24)**: o ponto de ancoragem (*pivot*) é sempre o centro.
- `sprites/spritesheet.png` é um atlas de **1 linha × 14 quadros** (672×48). Quadro *i* = `x = i × 48`.
- Para novos quadros de uma mesma célula, use uma linha por célula: `celula_estado_01.png`, `_02`…
- Taxa sugerida: **8 a 12 fps** para movimentos orgânicos e 4 a 6 fps para "respirar".
- Rotação: prefira girar em ângulos de 90° (sem perda de pixel) ou redesenhar. Rotações livres
  num motor de jogo devem ser feitas **depois** de ampliar ×4 ou mais, para não "quebrar" os pixels.

## Movimentos básicos que funcionam para todas as células

| Movimento | Como fazer |
|---|---|
| Respirar / pulsar | escala 1,00 → 1,04 → 1,00 (ease in-out, 1,2 s) |
| Flutuar | deslocamento senoidal de ±2 px em y (2–3 s) + rotação de ±4° |
| Rastejar | esticar 1,15 × 0,90 na direção do movimento e voltar |
| Ser atingida | piscar em branco por 1 quadro + tremer ±1 px |
| Morrer (apoptose) | dividir o sprite em 4–6 "bolhas" que se afastam e somem |
| Ativação | trocar de sprite (ex.: plaqueta → plaqueta ativada) com 1 quadro intermediário em escala 1,1 |

## Cenas sugeridas

1. **Corrente sanguínea**: hemácias rolando + plaquetas + leucócitos esparsos, fundo `#0b0a4a`.
2. **Lesão e coagulação**: plaquetas trocam para o sprite ativado e se agregam.
3. **Infecção bacteriana**: neutrófilos chegam (quimiotaxia) e fagocitam.
4. **Apresentação de antígeno**: a dendrítica migra até o linfonodo e "toca" o T CD4+.
5. **Resposta adaptativa**: CD4+ ativa CD8+ e B; B → plasmócito soltando anticorpos.
6. **Memória**: células com aura dourada reaparecem e respondem mais rápido.
7. **Parasita**: eosinófilos degranulando ao redor de um helminto.
8. **Vírus/tumor**: NK e CD8+ atacando células-alvo.
