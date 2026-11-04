// Renderiza a animação quadro a quadro no Chromium (canvas) e codifica com ffmpeg.
// Uso: node src/render.js video            -> build/video_silent.mp4 + build/events.json
//      node src/render.js stills t1 t2 ...  -> build/stills/f_<t>.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/timeline.json'), 'utf8'));
fs.writeFileSync(path.join(ROOT, 'build/timeline.js'), 'window.TL = ' + JSON.stringify(tl) + ';');

(async () => {
  const mode = process.argv[2] || 'video';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.goto('file://' + path.join(ROOT, 'src/index.html'));
  await page.evaluate(async () => { await document.fonts.load('900 40px Nunito'); await document.fonts.ready; });
  const events = await page.evaluate(() => ({ events: window.EVENTS, scenes: window.SCENES, marks: window.MARKS }));
  fs.writeFileSync(path.join(ROOT, 'build/events.json'), JSON.stringify(events, null, 1));

  const grab = async t => {
    const b64 = await page.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
    return Buffer.from(b64, 'base64');
  };

  if (mode === 'stills') {
    const dir = path.join(ROOT, 'build/stills'); fs.mkdirSync(dir, { recursive: true });
    for (const a of process.argv.slice(3)) { const t = parseFloat(a); fs.writeFileSync(path.join(dir, `f_${t.toFixed(2)}.png`), await grab(t)); }
  } else {
    const fps = tl.fps, n = Math.round(tl.duration * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(ROOT, 'build/video_silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 120 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('ok', n, 'frames');
  }
  await browser.close();
})();
