# Uso em projetos

## Gerar ou ajustar

```bash
python3 ferramentas/gerar_celulas.py     # gera sprites/png, png_x8 e spritesheet
python3 ferramentas/gerar_guia.py        # reconstrói esta pasta e o PDF (pandoc + Playwright)
```

Para mudar uma cor, edite a rampa no topo de `gerar_celulas.py` (ex.: `RED = Ramp(...)`) e rode de novo.
Os scripts originais ficam em `tools/` no repositório; aqui estão copiados em `ferramentas/`.
Ao rodar a cópia, os arquivos são gerados na pasta acima dela.

## HTML / CSS

```html
<img src="sprites/png/neutrofilo.png" class="celula">
<style>
  .celula { width: 192px; image-rendering: pixelated; }      /* 48 × 4 */
  @keyframes respirar { 50% { transform: scale(1.04); } }
  .celula { animation: respirar 1.2s ease-in-out infinite; }
</style>
```

Usando o spritesheet como recorte:

```css
.hemacia { width:48px; height:48px; background:url(sprites/spritesheet.png) 0 0;
           image-rendering: pixelated; transform: scale(4); }
.neutrofilo { background-position: -144px 0; }   /* índice 3 × 48 */
```

## Phaser 3

```js
this.load.spritesheet('celulas', 'sprites/spritesheet.png', { frameWidth: 48, frameHeight: 48 });
const n = this.add.sprite(400, 300, 'celulas', 3).setScale(4);   // 3 = neutrófilo
// no config do jogo: pixelArt: true
```

## Godot 4

- Importe o PNG com **Filter = Nearest** (Projeto → Configurações → Rendering → Textures → Default Texture Filter = Nearest).
- Use `Sprite2D` com `hframes = 14` e `frame = <índice>`.

## Unity

- Texture Type = *Sprite*, **Filter Mode = Point**, Compression = None, Pixels Per Unit = 48.
- Sprite Mode = *Multiple* → Slice → Grid by Cell Size 48×48.

## Vídeo (After Effects, Premiere, CapCut, DaVinci)

- Use os arquivos de `sprites/png_x8/` (384×384). Se precisar de mais, amplie em múltiplos inteiros com *nearest neighbor*.
- No After Effects: camada → Qualidade → **Rascunho**, ou Efeito → *Transformar* com amostragem "Vizinho mais próximo", para não borrar ao escalar.

## Índices do spritesheet

| Índice | Célula | x (px) |
|---|---|---|
| 0 | `hemacia` | 0 |
| 1 | `plaqueta` | 48 |
| 2 | `plaqueta_ativada` | 96 |
| 3 | `neutrofilo` | 144 |
| 4 | `eosinofilo` | 192 |
| 5 | `celula_nk` | 240 |
| 6 | `celula_dendritica` | 288 |
| 7 | `linfocito_t_cd4` | 336 |
| 8 | `linfocito_t_cd8` | 384 |
| 9 | `linfocito_b` | 432 |
| 10 | `plasmocito` | 480 |
| 11 | `memoria_t_cd4` | 528 |
| 12 | `memoria_t_cd8` | 576 |
| 13 | `memoria_b` | 624 |
