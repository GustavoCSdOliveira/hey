// Núcleo compartilhado da série "E se...?" (paleta do guia, primitivas, mascote, HUD, câmera, legendas).
// Extraído do episódio 1. Cada episódio define cenas, window.EVENTS, window.EMPH e window.renderFrame.
// sombra que muda de matiz, halos, partículas sempre em movimento, rótulos curtos em caixa.
// window.TL (timeline da narração) é injetado antes deste script.

const W = 1080, H = 1920;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TL = window.TL;
const DUR = TL.duration;

// ---------- paleta (Guia de Estilo) ----------
const P = {
  space0: '#020027', space1: '#0C0245', spaceMid: '#5E0FA5', spacePink: '#D33F7A',
  spaceOrange: '#FA9931', cream: '#FCF4E3',
  night: '#090A4E', ultra: '#1620C1', royal: '#1587F0', cyan: '#16F1FA', cyanL: '#4DF7F9',
  aqua: '#91FCF9', lilac: '#DECEE0', deepPurple: '#46068F', violet: '#7F1AE3', magenta: '#D12686',
  amber: '#F29E0C', peach: '#F1AF64', ember: '#C9351E', gold: '#F2CB26', hotPink: '#E40839',
  leaf: '#82AF69', forest: '#6D925C', forestL: '#88B373', lime: '#9FD142', tealDark: '#30535A',
  forestDark: '#2A454D', forestNight: '#13303F',
  sky0: '#1688FD', sky1: '#43B9FC', cloud: '#99F3FE', cloudHi: '#DBFEFB',
  ocean0: '#14497A', ocean1: '#0F6B87', oceanAcc: '#65E3D2', oceanMint: '#B9F6BE',
};

// ---------- utilidades ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
let DIM = 0, DIMTO = P.night;           // escurece cores de personagens (cena noturna)
const dc = h => DIM ? mix(h, DIMTO, DIM) : h;
const LP = k => Math.sin(2 * Math.PI * k * T / DUR); // fase periódica: o vídeo fecha o loop
let T = 0;

// ---------- linha do tempo ----------
const clip = id => TL.clips.find(c => c.id === id);
const ts = id => clip(id).start, te = id => clip(id).end;
function words(id) {
  const c = clip(id); const ws = c.text.split(' ');
  const weights = ws.map(w => w.replace(/[^\p{L}\d]/gu, '').length + 1.5);
  const tot = weights.reduce((a, b) => a + b, 0);
  let acc = c.start;
  return ws.map((w, i) => { const d = (c.end - c.start) * weights[i] / tot; const o = { w, t0: acc, t1: acc + d }; acc += d; return o; });
}
const wt = (id, i) => words(id)[i].t0;


// ---------- primitivas ----------
function circle(x, y, r, f) { if (r <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = f; ctx.fill(); }
function ellipse(x, y, rx, ry, f, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, Math.PI * 2); ctx.fillStyle = f; ctx.fill(); }
function rrectPath(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function rrect(x, y, w, h, r, f) { rrectPath(x, y, w, h, r); ctx.fillStyle = f; ctx.fill(); }
function glow(x, y, r, color, a) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(0.45, rgba(color, a * 0.45)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function capsule(x1, y1, x2, y2, w, f) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = f; ctx.stroke(); }
function sparkle(x, y, s, color, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  glow(x, y, s * 2.2, color, 0.5);
  capsule(x - s, y, x + s, y, s * 0.16, color); capsule(x, y - s, x, y + s, s * 0.16, color);
  circle(x, y, s * 0.18, P.cream);
  ctx.restore();
}

// ---------- texto ----------
const FONT = 'Nunito';
function label(text, x, y, bg, o = {}) {
  const size = o.size || 46, sc = o.scale ?? 1, a = o.alpha ?? 1;
  if (sc <= 0.01 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc); if (o.rot) ctx.rotate(o.rot);
  ctx.font = `900 ${size}px ${FONT}`;
  const tw = ctx.measureText(text).width, padX = size * 0.5, padY = size * 0.3;
  const w = tw + padX * 2, h = size + padY * 2;
  rrect(-w / 2, -h / 2 + size * 0.1, w, h, size * 0.28, mix(bg, '#000000', 0.18)); // degrau de sombra
  rrect(-w / 2, -h / 2, w, h, size * 0.28, bg);
  ctx.fillStyle = o.color || '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, size * 0.04);
  ctx.restore();
}
const popScale = (t, t0, d = 0.32) => t < t0 ? 0 : E.back(prog(t, t0, t0 + d));

// ---------- fundos ----------
const STARS = (() => { const R = rng(11), out = []; const cols = [P.lilac, P.aqua, P.cyanL, P.magenta, P.violet, P.spacePink, P.cream];
  [[200, 1.4], [110, 2.4], [40, 3.8]].forEach(([n, r], l) => { for (let i = 0; i < n; i++) out.push({ l, x: R() * W, y: R() * H, r: r * (0.6 + R() * 0.8), c: cols[Math.floor(R() * cols.length)], ph: R() * 6.28, sp: 0.6 + R() * 2 }); });
  return out; })();
const SPARKS = (() => { const R = rng(5), out = []; for (let i = 0; i < 9; i++) out.push({ x: R() * W, y: R() * H, s: 14 + R() * 22, c: [P.violet, P.cyanL, P.spacePink][i % 3], ph: R() * 6 }); return out; })();

function bgSpace(o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, P.space0); g.addColorStop(1, P.space1);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, 3 * W, 3 * H);
  glow(W * 0.75, H * 0.25, 900, P.spaceMid, 0.22 * (o.neb ?? 1));
  glow(W * 0.15, H * 0.8, 800, P.deepPurple, 0.25 * (o.neb ?? 1));
  const px = o.px || 0, py = o.py || 0, sa = o.alpha ?? 1;
  for (const s of STARS) {
    const f = (s.l + 1) * 0.5;
    let x = s.x + px * f + LP(1) * 10 * (s.l + 1), y = s.y + py * f;
    x = ((x % W) + W) % W; y = ((y % H) + H) % H;
    const tw = 0.55 + 0.45 * Math.sin(T * s.sp + s.ph);
    ctx.globalAlpha = sa * tw * (s.l === 0 ? 0.6 : 0.9);
    circle(x, y, s.r, s.c);
  }
  ctx.globalAlpha = 1;
  for (const s of SPARKS) sparkle(((s.x + px * 0.5) % W + W) % W, ((s.y + py * 0.5) % H + H) % H, s.s * (0.85 + 0.15 * Math.sin(T * 2 + s.ph)), s.c, sa * 0.8);
}

const CLOUDS = [
  { x: 170, y: 330, s: 1.0 }, { x: 860, y: 250, s: 0.8 }, { x: 900, y: 820, s: 1.15 }, { x: 140, y: 930, s: 0.75 }, { x: 560, y: 1080, s: 0.6 },
];
function cloud(x, y, s, base, hi) {
  const parts = [[-90, 10, 60], [-30, -20, 80], [50, -5, 70], [110, 15, 50], [10, 25, 60]];
  for (const [dx, dy, r] of parts) circle(x + dx * s, y + dy * s, r * s, base);
  for (const [dx, dy, r] of parts) circle(x + dx * s - 8 * s, y + dy * s - 12 * s, r * s * 0.72, hi);
  rrect(x - 150 * s, y + 25 * s, 300 * s, 46 * s, 23 * s, base);
}
function bgDay() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, P.sky0); g.addColorStop(0.7, P.sky1); g.addColorStop(1, P.sky1);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, 3 * W, 3 * H);
  CLOUDS.forEach((c, i) => cloud(c.x + LP(1) * 18 * (i % 2 ? 1 : -1), c.y, c.s, P.cloud, P.cloudHi));
}
function hill(night = 0) {
  const cx = 540, top = 1235, R = 1700;
  circle(cx, top + R, R, mix(P.forestL, P.deepPurple, night));
  circle(cx, top + 26 + R, R, mix(P.forest, P.night, night));
  circle(cx, top + 190 + R, R, mix(P.forestDark, P.space0, night));
  // tufos
  const R2 = rng(3);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 120 + R2() * 40; const y = top + 40 + Math.abs(x - 540) * 0.12 + R2() * 20; ellipse(x, y, 26, 12, mix(P.forestL, P.deepPurple, night)); }
}

// ---------- Sol ----------
function sun(x, y, r, o = {}) {
  const pulse = 1 + 0.025 * LP(4);
  const a = o.alpha ?? 1;
  if (r <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  glow(x, y, r * 3.2, P.spaceOrange, 0.45);
  circle(x, y, r * 2.05 * pulse, rgba(P.spacePink, 0.10));
  circle(x, y, r * 1.68 * pulse, rgba(P.spaceOrange, 0.16));
  circle(x, y, r * 1.36 * pulse, rgba(P.amber, 0.30));
  circle(x, y, r, P.spaceOrange);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  circle(x + r * 0.22, y + r * 0.25, r * 0.95, P.amber);            // sombra (matiz mais quente)
  circle(x - r * 0.08, y - r * 0.08, r * 0.8, P.gold);
  circle(x - r * 0.22, y - r * 0.24, r * 0.46, P.cream);
  const R = rng(9);
  for (let i = 0; i < 7; i++) { const ang = R() * 6.28 + T * 0.15, d = r * (0.3 + R() * 0.55); ellipse(x + Math.cos(ang) * d, y + Math.sin(ang) * d, r * 0.09, r * 0.06, rgba(P.amber, 0.55), ang); }
  ctx.restore();
  ellipse(x - r * 0.45, y - r * 0.5, r * 0.16, r * 0.08, rgba('#FFFFFF', 0.65), -0.7);
  ctx.restore();
}
function ghostSun(x, y, r, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const bob = (o.eyes || 0) * 8 * Math.sin(T * 5);
  glow(x, y + bob, r * 1.8, P.lilac, 0.10);
  ctx.setLineDash([r * 0.22, r * 0.16]); ctx.lineDashOffset = -T * 30;
  ctx.beginPath(); ctx.arc(x, y + bob, r, 0, 7); ctx.lineWidth = Math.max(4, r * 0.06); ctx.lineCap = 'round'; ctx.strokeStyle = rgba(P.lilac, 0.75); ctx.stroke();
  ctx.setLineDash([]);
  const e = o.eyes || 0;
  if (e > 0) {
    const s = E.back(clamp(e)) * r * 0.2, blink = (Math.sin(T * 3.1) > 0.97) ? 0.15 : 1;
    ellipse(x - r * 0.32, y + bob - r * 0.05, s, s * 1.25 * blink, P.lilac);
    ellipse(x + r * 0.32, y + bob - r * 0.05, s, s * 1.25 * blink, P.lilac);
    circle(x - r * 0.32 + s * 0.2, y + bob, s * 0.5 * blink, P.space0);
    circle(x + r * 0.32 + s * 0.2, y + bob, s * 0.5 * blink, P.space0);
    // boquinha "uuu"
    ellipse(x, y + bob + r * 0.4, s * 0.45, s * 0.6, rgba(P.lilac, 0.9));
  }
  ctx.restore();
}

// ---------- Terra ----------
const CONT = [
  [[-0.30, -0.35, 0.22], [-0.20, -0.14, 0.18], [-0.16, 0.14, 0.14], [-0.10, 0.38, 0.12]],
  [[0.25, -0.42, 0.20], [0.42, -0.30, 0.22], [0.30, -0.05, 0.16], [0.34, 0.24, 0.15], [0.24, 0.42, 0.10]],
  [[0.80, 0.30, 0.16], [0.92, 0.18, 0.10]],
  [[-0.78, -0.12, 0.14], [-0.70, 0.10, 0.10]],
];
function earth(x, y, r, o = {}) {
  const light = o.light ?? 1, frozen = o.frozen || 0, rot = o.rot ?? T * 0.06;
  const ld = o.lightDir ?? -2.3; const lx = Math.cos(ld), ly = Math.sin(ld);
  const dk = (h, k = 0.78) => mix(h, P.night, (1 - light) * k);
  glow(x, y, r * 1.6, light > 0.5 ? P.aqua : P.violet, 0.18 + 0.12 * light);
  circle(x, y, r * 1.06, rgba(dk(P.cyanL), 0.25));
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  circle(x, y, r, dk(P.ultra, 0.6));
  circle(x + lx * r * 0.12, y + ly * r * 0.12, r * 0.98, dk(P.royal));
  circle(x + lx * r * 0.32, y + ly * r * 0.32, r * 0.62, dk(P.sky1, 0.85));
  // continentes (rolam com a rotação)
  for (const c of CONT) for (const [u0, v, rr] of c) {
    let u = ((u0 + rot + 1.3) % 2.6 + 2.6) % 2.6 - 1.3;
    const cx = x + u * r, cy = y + v * r;
    circle(cx + r * 0.025, cy + r * 0.03, rr * r, dk(P.forest));
    circle(cx, cy, rr * r, light > 0.02 ? dk(P.leaf) : P.forestNight);
    circle(cx - rr * r * 0.25, cy - rr * r * 0.25, rr * r * 0.5, dk(P.lime, 0.9));
    if (light < 0.95) { const R = rng(Math.floor((u0 + 2) * 1000 + v * 100)); ctx.globalAlpha = (1 - light) * (1 - frozen * 0.8); for (let k = 0; k < 5; k++) circle(cx + (R() - 0.5) * rr * r * 1.3, cy + (R() - 0.5) * rr * r * 1.3, r * 0.012 + R() * r * 0.01, P.gold); ctx.globalAlpha = 1; }
  }
  // gelo avançando dos polos
  if (frozen > 0) {
    // geada orgânica: manchas que surgem dos polos em direção ao equador
    const iceB = mix(P.lilac, '#8E97E6', (1 - light) * 0.7), iceS = mix('#B8BFF0', P.ultra, (1 - light) * 0.45), iceH = mix('#FFFFFF', P.lilac, 0.4);
    const R = rng(23), blobs = [];
    for (let gy = -1.1; gy <= 1.1; gy += 0.14) for (let gx = -1.1; gx <= 1.1; gx += 0.14) {
      const jx = (R() - 0.5) * 0.1, jy = (R() - 0.5) * 0.1;
      const th = (1 - Math.abs(gy)) * 0.92 + R() * 0.12;
      const s = E.out(clamp((frozen - th) / 0.18));
      if (s > 0) blobs.push([x + (gx + jx) * r, y + (gy + jy) * r, r * (0.1 + R() * 0.05) * s]);
    }
    for (const [bx, by, br] of blobs) circle(bx + br * 0.15, by + br * 0.2, br * 1.05, iceS);
    for (const [bx, by, br] of blobs) circle(bx, by, br, iceB);
    for (const [bx, by, br] of blobs) circle(bx - br * 0.3, by - br * 0.3, br * 0.35, iceH);
  }
  // terminador (lado da noite)
  circle(x - lx * r * 1.15, y - ly * r * 1.15, r * 1.25, rgba(P.night, 0.38 * light));
  ctx.restore();
  // brilho especular e rim light
  ctx.beginPath(); ctx.arc(x, y, r * 0.84, ld - 0.5, ld + 0.5); ctx.lineWidth = r * 0.05; ctx.lineCap = 'round'; ctx.strokeStyle = rgba(P.aqua, 0.65 * light + 0.12); ctx.stroke();
}

// ---------- mascote (astronauta "Faísca") ----------
function mascot(x, y, s, o = {}) {
  const lookX = o.lookX ?? 0, lookY = o.lookY ?? -1;
  const bob = 4 * LP(6), sh = o.shiver ? Math.sin(T * 60) * 2.5 * o.shiver : 0;
  ctx.save(); ctx.translate(x + sh, y); ctx.scale(s, s);
  ellipse(0, 4, 78, 15, rgba(P.space0, 0.28));
  ctx.translate(0, bob);
  rrect(-44, -46, 32, 50, 14, dc(P.ember)); rrect(12, -46, 32, 50, 14, dc(P.ember));
  // braços
  const wave = o.wave ? Math.sin(T * 12) * 0.5 * o.wave : 0;
  capsule(-62, -128, -86, -78, 26, dc('#E06A1B'));
  capsule(62, -128, 86 + wave * 30, -78 - wave * 70, 26, dc('#E06A1B'));
  // corpo com degraus de luz/base/sombra
  rrectPath(-66, -160, 132, 128, 50); ctx.save(); ctx.clip();
  ctx.fillStyle = dc(P.spaceOrange); ctx.fillRect(-70, -170, 140, 140);
  circle(70, -40, 95, dc('#E06A1B'));
  circle(-60, -150, 60, dc(P.peach));
  ctx.restore();
  rrect(-34, -122, 68, 42, 14, dc(P.cream));
  circle(-16, -101, 7, dc(P.magenta)); circle(0, -101, 7, dc(P.gold)); circle(16, -101, 7, dc(P.royal));
  rrect(-62, -172, 124, 26, 13, dc(P.lilac));
  // capacete
  const hx = 0, hy = -238;
  glow(hx, hy, 120, P.aqua, 0.12 * (1 - DIM));
  circle(hx, hy, 84, rgba(dc(P.aqua), 0.28));
  ellipse(hx, hy + 6, 60, 50, dc(P.night));
  const blink = ((T + 0.7) % 3.3) < 0.1 ? 0.12 : 1;
  for (const sx of [-1, 1]) {
    const ex = hx + sx * 24, ey = hy + 2;
    ellipse(ex, ey, 14, 16 * blink, '#FFFFFF');
    if (blink > 0.5) circle(ex + lookX * 6, ey + lookY * 7, 7.5, P.space0);
  }
  ctx.beginPath(); ctx.arc(hx, hy, 68, Math.PI * 1.08, Math.PI * 1.42); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#FFFFFF', 0.7 * (1 - DIM * 0.6)); ctx.stroke();
  circle(hx + 40, hy - 46, 6, rgba('#FFFFFF', 0.6));
  // antena
  const ay = hy - 84, tip = ay - 44 + 3 * LP(8);
  capsule(hx, ay, hx + 4, tip, 7, dc(P.lilac));
  glow(hx + 4, tip, 40, P.gold, 0.5 * (1 - DIM * 0.5));
  circle(hx + 4, tip, 12, P.gold);
  ctx.restore();
}

// ---------- HUD (caixa com ícone de relógio) ----------
function clockIcon(x, y, r, col) {
  circle(x, y, r, col); circle(x, y, r * 0.72, '#FFFFFF');
  const a = T * 6; capsule(x, y, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.16, col); capsule(x, y, x, y - r * 0.4, r * 0.16, col);
}
function timerHUD(text, x, y, o = {}) {
  const sc = o.scale ?? 1, a = o.alpha ?? 1; if (sc <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 64px ${FONT}`;
  const tw = ctx.measureText(text).width; const w = tw + 150, h = 100;
  const bg = o.bg || P.ultra;
  rrect(-w / 2, -h / 2 + 8, w, h, 26, mix(bg, '#000000', 0.25));
  rrect(-w / 2, -h / 2, w, h, 26, bg);
  clockIcon(-w / 2 + 56, 0, 28, o.icon || P.gold);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 100, 4);
  ctx.restore();
}
const fmt = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ---------- câmera ----------
function cam(z, cx, cy, fn, shake = 0, rot = 0) {
  ctx.save();
  const sx = shake ? (Math.sin(T * 91) + Math.sin(T * 57)) * shake : 0, sy = shake ? (Math.cos(T * 83) + Math.sin(T * 47)) * shake : 0;
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); if (rot) ctx.rotate(rot); ctx.translate(-cx, -cy);
  fn(); ctx.restore();
}


// ---------- legendas (palavra a palavra, caixa colorida) ----------
const EMPH = new Set();
const CHUNKS = (() => {
  const out = [];
  for (const c of TL.clips) {
    const ws = words(c.id); let cur = [];
    const flush = () => { if (cur.length) out.push({ ws: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1 }); cur = []; };
    const maxW = c.id === 'a1' ? 5 : 3, maxC = c.id === 'a1' ? 24 : 15;   // o gancho aparece inteiro no quadro 0
    for (const w of ws) {
      const len = cur.map(x => x.w).join(' ').length + w.w.length;
      if (cur.length >= maxW || (cur.length && len > maxC)) flush();
      cur.push(w);
      if (/[.?!,:]$/.test(w.w) || w.w.endsWith('...')) flush();
    }
    flush();
  }
  return out;
})();
const CAP_Y = 1395;
function captions(t) {
  let ch = null;
  for (const c of CHUNKS) if (t >= c.t0 - 0.04 && t < c.t1 + 0.12) ch = c;
  if (!ch && t < CHUNKS[0].t0) ch = CHUNKS[0];             // quadro 0 já traz o texto do gancho
  if (!ch && t > DUR - 0.35) ch = CHUNKS[0];               // e o fim repete, fechando o loop
  if (!ch) return;
  const preview = t < CHUNKS[0].t0 || t > DUR - 0.35;
  const emph = ch.ws.some(w => (window.EMPH || EMPH).has(w.w));
  let size = emph ? 84 : 74;
  const txts = ch.ws.map(w => w.w.toUpperCase());
  ctx.font = `900 ${size}px ${FONT}`;
  const full = ctx.measureText(txts.join(' ')).width;
  if (full > 880) { size = Math.floor(size * 880 / full); ctx.font = `900 ${size}px ${FONT}`; }
  const space = ctx.measureText(' ').width;
  const widths = txts.map(s => ctx.measureText(s).width);
  const tw = widths.reduce((a, b) => a + b, 0) + space * (txts.length - 1);
  const sc = preview ? 1 : E.back(prog(t, ch.t0 - 0.04, ch.t0 + 0.14));
  const bg = emph ? P.magenta : P.violet;
  ctx.save(); ctx.translate(540, CAP_Y); ctx.scale(sc, sc);
  const w = tw + 70, h = size + 44;
  rrect(-w / 2, -h / 2 + 10, w, h, 26, mix(bg, '#000000', 0.3));
  rrect(-w / 2, -h / 2, w, h, 26, bg);
  let x = -tw / 2;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ch.ws.forEach((wd, i) => {
    const on = preview ? i === 0 : t >= wd.t0 - 0.03;
    const cur = !preview && t >= wd.t0 - 0.03 && t < wd.t1;
    ctx.fillStyle = cur ? P.gold : (on ? '#FFFFFF' : rgba('#FFFFFF', 0.55));
    ctx.fillText(txts[i], x, 6);
    x += widths[i] + space;
  });
  ctx.restore();
}
