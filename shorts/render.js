// Uso:
//   node render.js stills 1 5 12      -> stills/t_*.png nos instantes pedidos
//   node render.js video [fps=30]     -> nerd-vs-apocalipse-shorts.mp4 (+ .srt)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const { CAPTIONS, CAPTIONS_EN, DURATION } = require('./captions.js');
const LANG = process.env.LANGV === 'en' ? 'en' : 'pt', SUF = LANG === 'en' ? '-en' : '';

const ts = s => { const ms = Math.round(s * 1000), p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };

function writeSrt(file) {
  fs.writeFileSync(file, (LANG === 'en' ? CAPTIONS_EN : CAPTIONS).map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.text}\n`).join('\n'));
}

(async () => {
  const [mode = 'stills', ...rest] = process.argv.slice(2);
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(dir, 'index.html') + '?render=1&lang=' + LANG);

  if (mode === 'stills') {
    fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
    for (const t of rest.map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(dir, 'stills', `t_${String(t).padStart(5, '0')}${SUF}.png`) });
    }
  } else {
    const fps = Number(rest[0] || 30), out = path.join(dir, `nerd-vs-apocalipse-shorts${SUF}.mp4`), wav = path.join(dir, 'audio', `narracao${LANG === 'en' ? '_en' : ''}.wav`);
    writeSrt(path.join(dir, `nerd-vs-apocalipse-shorts${SUF}.srt`));
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      ...(fs.existsSync(wav) ? ['-i', wav] : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo']),
      '-map', '0:v', '-map', '1:a', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k', out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const total = Math.round(DURATION * fps), t0 = Date.now();
    for (let i = 0; i < total; i++) {
      await page.evaluate(t => render(t), i / fps);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('pronto', out);
  }
  if (errors.length) console.log('ERROS JS:', errors.join(' | '));
  await browser.close();
})();
