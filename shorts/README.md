# Versão Shorts (9:16, 55 s) com narração

| Arquivo | O que é |
|---------|---------|
| `nerd-vs-apocalipse-shorts.mp4` | Vídeo final, 1080×1920, 30 fps, com narração e legendas |
| `nerd-vs-apocalipse-shorts.srt` | Legendas com os tempos da narração |
| `animation.js` / `captions.js` / `index.html` | Animação (linha do tempo em HTML/SVG) e legendas |
| `audio/narracao_bruta.mp3` | Locução gerada (voz "Liam", vidIQ), com as 15 frases em sequência |
| `audio/montar_narracao.py` | Recorta cada frase e a posiciona na cena (gera `narracao.wav`) |
| `render.js` | Renderiza quadro a quadro (Playwright) e codifica com ffmpeg |

Para refazer: `python3 audio/montar_narracao.py` e depois `node render.js video 30`.
Se mudar o texto, gere uma nova locução e ajuste os tempos em `FRASES` (montar_narracao.py) e em `captions.js`.

## Versão em inglês

`LANGV=en node render.js video 30` gera `nerd-vs-apocalipse-shorts-en.mp4` (usa `audio/narracao_bruta_en.mp3`, `python3 audio/montar_narracao.py en` e `CAPTIONS_EN`). Os rótulos da tela são traduzidos pelo dicionário `EN` em `animation.js`.
