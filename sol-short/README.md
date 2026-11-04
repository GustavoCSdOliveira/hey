# E se o Sol sumisse agora? (Short animado)

- **Vídeo final:** `output/e-se-o-sol-sumisse.mp4` (1080×1920, 30 fps, H.264 + AAC, ~40 s, loudness −14 LUFS)
- **Storyboard detalhado:** [`STORYBOARD.md`](STORYBOARD.md)
- **Texto para postar:** [`POST.md`](POST.md)

## Como regenerar

Tudo é gerado por código: a animação vetorial é desenhada no canvas, a voz é sintetizada localmente e a trilha e os efeitos são sintetizados, sem nenhum asset de terceiros.

```bash
pip install piper-tts numpy scipy soundfile
# voz pt-BR "faber" (Piper): baixe pt_BR-faber-medium.onnx + .onnx.json para <pasta_voz>
python3 src/voice.py <pasta_voz>        # narração + build/timeline.json
node src/render.js video                # animação -> build/video_silent.mp4 (+ build/events.json)
python3 src/audio.py                    # trilha + SFX + narração -> build/mix.wav
ffmpeg -i build/video_silent.mp4 -i build/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 \
  -c:v copy -c:a aac -b:a 192k -shortest output/e-se-o-sol-sumisse.mp4
```

- Para trocar o texto, edite `src/narration.json`. As cenas se reposicionam sozinhas pela linha do tempo da voz.
- Para checar quadros específicos: `node src/render.js stills 0 1.5 17.8`.
