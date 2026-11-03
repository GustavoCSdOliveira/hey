// Renderiza svg/NN.svg -> png/NN.png (1920x1080) e storyboard.html -> storyboard.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = __dirname;
  fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const files = fs.readdirSync(path.join(dir, 'svg')).filter(f => f.endsWith('.svg')).sort();
  for (const f of files) {
    await p.goto('file://' + path.join(dir, 'svg', f));
    await p.screenshot({ path: path.join(dir, 'png', f.replace('.svg', '.png')) });
  }
  const q = await b.newPage({ viewport: { width: 1800, height: 1000 } });
  await q.goto('file://' + path.join(dir, 'storyboard.html'));
  await q.waitForTimeout(500);
  await q.screenshot({ path: path.join(dir, 'storyboard.png'), fullPage: true });
  await b.close();
  console.log('renderizado', files.length);
})();
