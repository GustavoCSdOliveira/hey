# Storyboard: Um nerd sobreviveria a um apocalipse?

32 quadros 16:9 (1920×1080) no estilo Kurzgesagt, um por plano do roteiro (`../nerd-vs-apocalipse-roteiro.md`).

| Pasta/arquivo | Conteúdo |
|---------------|----------|
| `svg/NN.svg` | Quadro vetorial em camadas, pronto para animar |
| `png/NN.png` | Mesmo quadro em PNG 1920×1080 |
| `storyboard.html` / `storyboard.png` | Folha de contato com narração, tempo e direção de cena |
| `meta.json` | Plano, ato, tempo, duração, narração e direção |
| `gerar_storyboard.py` | Gera os SVGs e o HTML (`python3 gerar_storyboard.py`) |
| `render.js` | Exporta PNGs com Playwright (`node render.js`) |

## Camadas de cada SVG (de trás para frente)

`#bg` · `#fundo` (partículas e halos) · `#meio` (cenário e objetos) · `#personagem` (Téo, com `.cabeca` e `.braco`) · `#frente` · `#rotulos` · `#hud`

Abra o SVG no Figma, Illustrator, Affinity, Rive ou After Effects (via Illustrator/Lottie) e anime por camada. As cores seguem o guia: fundo em uma família, personagem na cor oposta, sombras mudando de matiz e nenhum preto puro.
