# Prompt para criar novas células no mesmo estilo

Copie o bloco abaixo, troque o que está entre `<…>` e cole no Claude (ou em outro assistente)
num projeto que tenha `ferramentas/gerar_celulas.py`.

```text
Crie um novo sprite de pixel art da célula <NOME DA CÉLULA> seguindo exatamente o estilo do
kit "guia-celulas" (veja 01-estilo-visual.md e 02-paletas.md):

- Canvas 48x48, fundo transparente, centro da célula em (24,24).
- Tamanho proporcional ao real: <TAMANHO EM µm> (≈2 px por µm nos leucócitos; raio máx. 22 px).
- Luz do canto superior esquerdo, L=(-0.55,-0.65,0.52); 4 tons em faixas
  (I>0.78 luz, >0.38 base, >0.02 meio-tom, resto sombra) + brilho de 2 px.
- Contorno de 1 px em vizinhança 4, no tom mais escuro da paleta (nunca preto).
- Núcleo com contorno próprio desenhado sobre o citoplasma.
- Ordem das camadas: elementos de trás → corpo → contorno → anel interno → núcleo → grânulos → elementos soltos.
- Morfologia que deve aparecer: <ex.: núcleo em ferradura, vacúolos, grânulos azul-escuros grandes>.
- Cores: <reutilizar rampa existente, ex.: NUC_PURPLE, ou criar uma rampa nova com 6 tons:
  contorno, sombra, meio-tom, base, luz, brilho>.
- Código visual para diferenciar das outras células: <ex.: pseudópodes largos, borda ondulada>.

Implemente como uma função nova em gerar_celulas.py usando os helpers existentes
(ellipse, limb, poly, y_glyph, Sprite.shade/outline/ring, granules, dilate), adicione-a
na lista CELULAS, gere os PNGs e crie a ficha celulas/<slug>.md no mesmo formato das outras.
```

## Exemplos de células para completar o conjunto

| Célula | Tamanho | Dicas de morfologia | Paleta sugerida |
|---|---|---|---|
| Monócito | 15–20 µm | núcleo em ferradura/rim, citoplasma azul-acinzentado | corpo `NK_BLUE` mais claro, núcleo `NUC_PURPLE` |
| Macrófago | 20–30 µm | grande, irregular, pseudópodes largos, vacúolos | corpo `ORANGE`/amarelo, núcleo `NUC_PURPLE` |
| Basófilo | 10–14 µm | grânulos grandes azul-escuros que cobrem o núcleo | corpo `CD8_BODY` claro, grânulos `NUC_PURPLE` |
| Mastócito | 10–20 µm | oval, cheio de grânulos roxos | corpo `PL_BODY`, grânulos `NUC_PURPLE` |
| Treg | 7–10 µm | como o T CD4+, mas com receptores em outra cor | corpo `CD4_BODY`, bolinhas verdes (nova rampa) |
| T virgem (naive) | 7–10 µm | sem receptores destacados, cores mais frias e apagadas | rampa dessaturada |
| Bactéria / vírus / helminto | — | "inimigos" para as cenas | verde-limão/ácido (contraste com o resto) |
