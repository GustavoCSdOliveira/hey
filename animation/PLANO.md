# DICALAB · Filme "Estilo Apple" — Plano de cenas (para aprovação)

**Fonte:** vídeo 464×832, 60 fps, 25,401 s, vertical 9:16, áudio AAC.
**Saída:** Remotion, 1080×1920 (9:16), 30 fps, 762 frames. Linha do tempo única em `src/lib/timeline.ts`.

## O que o vídeo mostra
Tratador/revestidor de sementes DICALAB: carga do lote → aplicação do líquido vermelho no tambor → descarga pela calha → balde cheio de sementes tratadas → logo. Cortes detectados por ffmpeg: 5,97 / 9,48 / 13,5 / 17,0 / 22,35 s.

## Áudio / ritmo
Não há fala transcrevível. Há apenas ruído do motor e do fluxo de sementes (envelope RMS medido). O ritmo vem dos cortes de câmera e dos picos de áudio: silêncio 0–0,6 s, picos nas despejadas (~2–4 s, 13–22 s), baixa energia em 5–9 s. O áudio original é mantido a 35% como bed.

## Cenas (ms)
| # | ms | Cena | Ação | Câmera / foco | Tipografia |
|---|----|------|------|---------------|-----------|
| 1 | 0–2000 | Ignição | Máquina emerge do preto; LED liga em 700 ms | Dolly-in suave, leve órbita | "DICALAB" 100→700 |
| 2 | 2000–5970 | Carga | Tampa abre (0–800), sementes caem (700–2400), tampa fecha (2900–3600) | Dolly-in + órbita | "Carregue." + chip Etapa 01 |
| 3 | 5970–9480 | Tratamento | Macro top-down do tambor; gota vermelha em 300 ms; sementes tingem 700–3200 | Rack focus (blur 22→0), tilt 22°→0 | "Cubra." + Etapa 02 |
| 4 | 9480–13500 | Descarga | Balde entra, calha gira (500), fluxo vermelho (1000+) | Órbita lateral leve | "Descarregue." + Etapa 03 |
| 5 | 13500–17000 | Macro extremo | Calha inox + fluxo, close do vídeo original | Rack focus calha→sementes (600–1500) | "Cada semente. Uniforme." |
| 6 | 17000–22350 | Enchimento | Balde enche; câmera inclina 38° para o topo | Tilt-down | "Pronto." (3700) |
| 7 | 22350–25401 | Logo | Fundo branco puro, frasco + wordmark | Mola crítica | DICALAB |

## Estilo
- Easing `cubic-bezier(0.25,1,0.5,1)` em tudo; molas com amortecimento crítico (`damping = 2√(k·m)`).
- Mesh gradients metálicos, vidro fosco (`backdrop-filter: blur(48px)`), borda interna de 1 px, vinheta e grão.
- Fonte: pilha SF Pro → Inter → system-ui (SF não é redistribuível; em Mac renderiza SF de verdade).

## Decisões tomadas (v2)
- **Modelo 3D real** (three.js via `@remotion/three`): máquina procedural nas cores originais (corpo cinza, tambor verde, calha inox, painel preto, botão vermelho, anel LED verde, balde verde, sementes vermelhas).
- **Mãos mantidas:** luvas pretas de nitrilo + manga branca, em 3D, animadas por keyframes em cada cena.
- Cenário claro/escuro alternado; UI de vidro fosco por cima.

## Pipeline
```bash
cd animation && npm install
npm run studio      # edição ao vivo
npm run preview     # 357×640, 15 fps, CRF 34 -> out/preview.mp4
npm run final       # 1080×1920 -> FFmpeg H.264 CRF17 -> out/final_1080p.mp4
```
Sem GPU o WebGL roda por software (`--gl=swangle`, já no `remotion.config.ts`): render lento. Se o Chromium não for baixado, use `BROWSER_EXE=/caminho/chromium`.

## Estado
7 cenas em 3D validadas por stills. Pendências conhecidas: mãos ainda blocky (dedos rígidos), monte de sementes no balde ralo, cena 3 com sombra escura atrás da tampa, alavanca/mãos esquerdas a refinar, preview em vídeo ainda não rodado.
