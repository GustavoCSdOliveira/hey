# E se você caísse num buraco negro? (série "E se…?", ep. 2)

- **Vídeo final:** `output/e-se-voce-caisse-num-buraco-negro.mp4` (1080×1920, 30 fps, ~40 s, −14 LUFS)
- **Storyboard:** [`STORYBOARD.md`](STORYBOARD.md) · **Texto para postar:** [`POST.md`](POST.md)

## Estrutura (mesmos passos do ep. 1)

- `src/narration.json`: roteiro em clipes (a animação se sincroniza a ele)
- `src/core.js`: núcleo reutilizável da série (paleta do guia, primitivas, mascote "Faísca", HUD, câmera, legendas)
- `src/scenes.js`: cenas, eventos de som e loop deste episódio
- `src/voice.py` → `src/render.js` → `src/audio.py` → ffmpeg (veja os comandos em `../sol-short/README.md`)

Para um novo episódio: copie esta pasta, troque `narration.json` e reescreva `scenes.js`. O `core.js` não muda.
