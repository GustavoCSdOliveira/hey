// Episódio 2 — "E se você caísse num buraco negro?"
// Usa core.js (paleta do guia, mascote, HUD, câmera, legendas). Aqui: cenas, eventos de som e render.

window.EMPH = new Set(['negro.', 'segundos.', 'espaguete.', 'espaguetificação.', 'Sério.', 'nada.', 'chega.', 'devagar.', 'centro.', 'quebra.', 'escolheria?']);

const S = {
  s1: 0, s2: ts('b1') - 0.15, s3: ts('b2') - 0.15, s4: ts('c1') - 0.15,
  s5: ts('d1') - 0.15, s5b: ts('d2') - 0.5, s6: ts('e1') - 0.15, s7: ts('f1') - 0.15,
  s8: ts('g1') - 0.15, s9: ts('h1') - 0.15,
};
const LOOP_SETTLE = DUR - 0.4;
const LOOPF = k => ((T * k / DUR) % 1 + 1) % 1;   // fase que fecha exatamente no fim do vídeo
const STRETCH1 = wt('b3', 1), STRETCH2 = wt('b3', 2), NOODLE = wt('b4', 2);
const CROSS = wt('d2', 2) + 0.1;     // mascote cruza o horizonte (cena 5)
const BREAK = wt('g2', 3);           // "a física quebra"

window.EVENTS = [
  { t: ts('a2') + 0.1, k: 'heart' }, { t: ts('a2') + 0.9, k: 'heart' },
  { t: ts('a2') + 0.15, k: 'pop' },
  { t: S.s2, k: 'whoosh_s' }, { t: wt('b1', 7), k: 'pop' }, { t: wt('b1', 5), k: 'pop' },
  { t: S.s3, k: 'whoosh_s' }, { t: wt('b2', 4), k: 'pop' }, { t: wt('b2', 10), k: 'pop' },
  { t: STRETCH1, k: 'stretch' }, { t: STRETCH2, k: 'stretch2' }, { t: NOODLE, k: 'boing' },
  { t: S.s4, k: 'whoosh_s' }, { t: wt('c1', 3), k: 'impact' }, { t: ts('c2'), k: 'ding' },
  { t: S.s5, k: 'whoosh' }, { t: wt('d1', 9), k: 'pop' }, { t: wt('d1', 10) + 0.2, k: 'pop' },
  { t: S.s5b, k: 'whoosh_s' }, { t: CROSS, k: 'shimmer' }, { t: wt('d3', 3), k: 'pop' },
  { t: S.s6, k: 'whoosh_s' }, { t: S.s6 + 0.3, k: 'pop' }, { t: S.s6 + 0.5, k: 'pop' },
  { t: ts('e2'), k: 'tapestop' }, { t: wt('e2', 2), k: 'pop' },
  { t: S.s7, k: 'whoosh' }, { t: wt('f2', 5), k: 'pop' },
  { t: S.s8, k: 'whoosh_s' }, { t: BREAK, k: 'glitch_big' }, { t: BREAK, k: 'drop' },
  { t: S.s9, k: 'whoosh_s' }, { t: S.s9 + 0.3, k: 'pop' }, { t: S.s9 + 0.55, k: 'pop' }, { t: wt('h1', 5), k: 'pop' },
  { t: ts('h2') + 0.2, k: 'riser' },
];
window.SCENES = S; window.MARKS = { CROSS, BREAK, LOOP_SETTLE };

// ---------- buraco negro (referência: capa do guia) ----------
const DISK = [[2.5, P.deepPurple], [2.28, P.violet], [2.08, P.magenta], [1.9, P.spacePink], [1.74, P.spaceOrange], [1.6, P.gold], [1.47, P.cream], [1.36, '#FFFFFF']];
function diskBands(r, front) {
  for (const [f, col] of DISK) {
    ctx.beginPath(); ctx.ellipse(0, 0, r * f, r * f * 0.26, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
    ctx.lineWidth = r * 0.17; ctx.strokeStyle = col; ctx.stroke();
  }
  // faixas de movimento (o disco gira)
  ctx.setLineDash([r * 0.18, r * 0.5]); ctx.lineDashOffset = -LOOPF(60) * r * 0.68;
  for (const f of [2.2, 1.82, 1.52]) {
    ctx.beginPath(); ctx.ellipse(0, 0, r * f, r * f * 0.26, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
    ctx.lineWidth = r * 0.05; ctx.strokeStyle = rgba('#FFFFFF', 0.35); ctx.stroke();
  }
  ctx.setLineDash([]);
}
function blackHole(x, y, r, o = {}) {
  const tilt = o.tilt ?? -0.32, a = o.alpha ?? 1;
  if (r <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  glow(x, y, r * 4.2, P.violet, 0.35);
  glow(x, y, r * 2.4, P.spacePink, 0.25);
  // anel de fótons (luz do disco de trás, curvada por cima)
  [[1.5, P.deepPurple], [1.36, P.magenta], [1.24, P.spaceOrange], [1.14, P.gold], [1.07, P.cream]].forEach(([f, c]) => circle(x, y, r * f, c));
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); diskBands(r, false); ctx.restore();
  // horizonte de eventos: azul-marinho profundo (nunca #000), borda violeta
  circle(x, y, r * 1.02, P.violet);
  const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  g.addColorStop(0, '#0B0330'); g.addColorStop(0.75, P.space0); g.addColorStop(1, '#1A0650');
  circle(x, y, r * 0.97, g);
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); diskBands(r, true); ctx.restore();
  // poeira espiralando
  const R = rng(31);
  for (let i = 0; i < 30; i++) {
    const ph = (LOOPF(5 + Math.floor(R() * 8)) + R()) % 1, ang = R() * 6.28 + ph * 5, d = r * (4.2 - ph * 2.6);
    const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d * 0.45;
    capsule(px, py, px + Math.cos(ang + 1.6) * 16, py + Math.sin(ang + 1.6) * 7, 5, rgba([P.cyanL, P.spacePink, P.aqua, P.gold][i % 4], 0.7 * Math.sin(ph * Math.PI)));
  }
  ctx.restore();
}

// ---------- outros elementos ----------
function fallLines(speed, col, a = 0.5) {           // riscos subindo = sensação de queda
  const R = rng(41); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 22; i++) { const x = R() * W, L = 80 + R() * 220, y = ((R() * (H + 400) - LOOPF(Math.round(speed / 50 * (0.6 + R()))) * (H + 400)) % (H + 400) + H + 400) % (H + 400) - 200; capsule(x, y, x, y + L, 4 + R() * 4, col); }
  ctx.restore();
}
function radialLines(p, col, cx = 540, cy = 960) {
  const R = rng(8); ctx.save(); ctx.globalAlpha = p;
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, d0 = 200 + R() * 500, L = 200 + p * 500; capsule(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0, cx + Math.cos(a) * (d0 + L), cy + Math.sin(a) * (d0 + L), 6 + R() * 8, col); }
  ctx.restore();
}
function city(y0, s = 1) {
  const R = rng(51); let x = -40;
  while (x < W + 40) {
    const w = (70 + R() * 90) * s, h = (180 + R() * 380) * s, col = [P.ultra, P.deepPurple, '#2A1A9A', P.violet][Math.floor(R() * 4)];
    rrect(x, y0 - h, w, h + 40, 14 * s, col);
    rrect(x, y0 - h, w * 0.3, h + 40, 14 * s, mix(col, '#FFFFFF', 0.12));
    for (let wy = y0 - h + 26 * s; wy < y0 - 20; wy += 38 * s) for (let wx = x + 16 * s; wx < x + w - 20 * s; wx += 30 * s) if (R() > 0.45) rrect(wx, wy, 14 * s, 18 * s, 4 * s, rgba(P.gold, 0.85));
    x += w + 8 * s;
  }
  rrect(-100, y0, W + 200, 600, 0, P.night);
}
function arrow(x, y, len, w, col) {       // seta para cima, cantos arredondados
  if (len <= 0) return;
  capsule(x, y, x, y - len + w, w, col);
  ctx.beginPath(); ctx.moveTo(x - w * 1.3, y - len + w * 1.6); ctx.lineTo(x, y - len - w * 0.6); ctx.lineTo(x + w * 1.3, y - len + w * 1.6); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = w * 0.5; ctx.strokeStyle = col; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
}
function noodles(x0, y0, x1, y1, n, amp, t) {     // fios de espaguete entre dois pontos
  for (let k = 0; k < n; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const q = i / 40, x = lerp(x0, x1, q) + Math.sin(q * 9 + t * 6 + k * 1.7) * amp * Math.sin(q * Math.PI) + (k - (n - 1) / 2) * 16 * (1 - q);
      const y = lerp(y0, y1, q);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = [P.peach, P.gold, P.spaceOrange][k % 3]; ctx.stroke();
  }
}
function galaxy(x, y, s, rot) {
  glow(x, y, 520 * s, P.violet, 0.4);
  const R = rng(61);
  for (let i = 0; i < 520; i++) {
    const arm = i % 2, q = R(), a = rot + arm * Math.PI + q * 4.2 + (R() - 0.5) * 0.5, d = (30 + q * 420) * s;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.55;
    ctx.globalAlpha = 0.5 + 0.5 * (1 - q);
    circle(px, py, (2 + R() * 5) * s, [P.cyanL, P.spacePink, P.lilac, P.violet, P.aqua][Math.floor(R() * 5)]);
  }
  ctx.globalAlpha = 1;
  glow(x, y, 160 * s, P.cream, 0.7); circle(x, y, 26 * s, P.cream);
}
function mascotT(x, y, o = {}) {   // mascote com rotação/estica (âncora no centro do corpo)
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale((o.s || 1) * (o.sx || 1), (o.s || 1) * (o.sy || 1));
  ctx.globalAlpha = o.alpha ?? 1;
  mascot(0, 150, 1, { lookX: o.lookX ?? 0, lookY: o.lookY ?? -1, wave: o.wave });
  ctx.restore();
}

// ================= CENAS =================
// Quadro de loop: mascote caindo diante do buraco negro.
function loopFrame(t) {
  bgSpace({ py: -2 * H * T / DUR });
  blackHole(540, 640, 200);
  fallLines(500, rgba(P.lilac, 0.6), 0.35);
  mascotT(540, 1080, { s: 0.78, rot: 0.35 * LP(2) - 0.2, lookY: -1, lookX: 0.2 });
}

function scene1(t) {
  const p = E.inOut(prog(t, 0, S.s2));
  const shake = t > ts('a2') ? 3 : 0;
  cam(1 + 0.1 * p, 540, 900, () => loopFrame(t), shake);
  // contagem regressiva de tensão
  const hs = popScale(t, ts('a2') + 0.15) * (1 - prog(t, S.s2 - 0.2, S.s2));
  if (hs > 0) { const n = Math.max(1, 9 - Math.floor((t - ts('a2')) * 3)); timerHUD(`0:0${n}`, 540, 250, { scale: hs * (1 + 0.06 * Math.max(0, Math.sin(t * 12))), bg: P.hotPink, icon: P.cream }); }
}

function scene2(t) {
  const p = E.inOut(prog(t, S.s2, S.s3));
  cam(1.0, 540, lerp(1150, 900, p), () => {
    bgSpace({ neb: 0.8 });
    blackHole(540, 560, 115);
    city(1260, 1);
    // régua de tamanho
    const rp = E.out(prog(t, wt('b1', 5), wt('b1', 5) + 0.4));
    if (rp > 0) { const L = 330 * rp; capsule(540 - L, 820, 540 + L, 820, 8, P.lilac); capsule(540 - L, 795, 540 - L, 845, 8, P.lilac); capsule(540 + L, 795, 540 + L, 845, 8, P.lilac); }
    label('≈ 60 km', 540, 900, P.violet, { scale: popScale(t, wt('b1', 5)), size: 46 });
    label('Tamanho de São Paulo', 540, 1010, P.royal, { scale: popScale(t, wt('b1', 7)), size: 40 });
  });
}

function scene3(t) {
  const st1 = E.back(prog(t, STRETCH1, STRETCH1 + 0.35)), st2 = E.back(prog(t, STRETCH2, STRETCH2 + 0.35));
  const sy = 1 + 0.7 * st1 + 0.9 * st2, sx = 1 - 0.25 * st1 - 0.2 * st2;
  const nood = E.out(prog(t, NOODLE, NOODLE + 0.4));
  const pIn = E.out(prog(t, S.s3, S.s3 + 0.4));
  cam(lerp(1.25, 1.0, pIn) + 0.06 * prog(t, S.s3, S.s4), 540, 900, () => {
    bgSpace({ neb: 0.7 });
    blackHole(540, 300, 120, { tilt: 0.0 });
    const my = 960 + 30 * Math.sin(t * 2);
    if (nood < 1) {
      // mascote de cabeça para baixo: os pés apontam para o buraco negro
      mascotT(540, my - (sy - 1) * 120, { s: 0.85, rot: Math.PI, sx, sy, lookY: 1, alpha: 1 - nood });
      // setas de força: pés (forte) × cabeça (fraca)
      const ap = popScale(t, wt('b2', 4)) * (1 - nood);
      ctx.globalAlpha = clamp(ap); arrow(540, my - 120 - (sy - 1) * 240, 260 * ap, 26, P.hotPink); ctx.globalAlpha = 1;
      const ah = popScale(t, wt('b2', 10)) * (1 - nood);
      ctx.globalAlpha = clamp(ah); arrow(650, my + 230, 110 * ah, 20, P.spacePink); ctx.globalAlpha = 1;
      label('Pés: puxão forte', 780, my - 230, P.hotPink, { scale: popScale(t, wt('b2', 4)) * (1 - nood), size: 36 });
      label('Cabeça: fraco', 790, my + 110, P.spacePink, { scale: popScale(t, wt('b2', 10)) * (1 - nood), size: 36 });
    }
    if (nood > 0) {
      ctx.globalAlpha = nood;
      noodles(540, 1180, 540, 420, 5, 40 + 30 * nood, t);
      // olhinhos no fim do fio
      ellipse(520, 1190, 16, 18, '#FFFFFF'); ellipse(560, 1190, 16, 18, '#FFFFFF'); circle(520, 1196, 8, P.space0); circle(560, 1196, 8, P.space0);
      ctx.globalAlpha = 1;
    }
  }, nood > 0 ? 6 * (1 - prog(t, NOODLE, NOODLE + 0.5)) : 0);
}

function scene4(t) {
  const pIn = E.out(prog(t, S.s4, S.s4 + 0.4));
  const tw = wt('c1', 3), ser = ts('c2');
  cam(lerp(1.3, 1.0, pIn) + 0.15 * E.out(prog(t, ser, ser + 0.25)), 540, 860, () => {
    bgSpace({ neb: 0.9 });
    blackHole(540, 760, 90, { tilt: 0.25 });
    // fios girando em espiral para dentro
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) { const q = i / 50, a = k * 1.05 + q * 5 - t * 1.4, d = 90 + (1 - q) * 520; const x = 540 + Math.cos(a) * d, y = 760 + Math.sin(a) * d * 0.7; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.strokeStyle = rgba([P.peach, P.gold, P.spaceOrange][k % 3], 0.85); ctx.stroke();
    }
    blackHole(540, 760, 90, { tilt: 0.25, alpha: 0.0 });
  });
  label('ESPAGUETIFICAÇÃO', 540, 330, P.magenta, { scale: popScale(t, tw, 0.4) * (1 + 0.03 * Math.sin(t * 9)), size: 70, rot: -0.05 });
  label('termo científico de verdade', 540, 450, P.royal, { scale: popScale(t, ser), size: 38 });
}

function scene5(t) {
  if (t < S.s5b) {                                   // galáxia → zoom no centro
    const p = E.in(prog(t, S.s5, S.s5b));
    cam(0.9 + p * 6, 540, 820, () => { bgSpace({ neb: 1 }); galaxy(540, 820, 1.25, t * 0.12); });
    label('Centro da Via Láctea', 540, 1150, P.violet, { scale: popScale(t, wt('d1', 9)) * (1 - p), size: 42 });
    if (p > 0.6) { ctx.fillStyle = rgba(P.space0, (p - 0.6) * 2.5); ctx.fillRect(0, 0, W, H); }
    return;
  }
  // horizonte gigante: a borda vira quase uma linha reta no fundo
  const p = E.out(prog(t, S.s5b, S.s5b + 0.5));
  const my = lerp(420, 1130, E.inOut(prog(t, S.s5b + 0.2, CROSS + 0.5)));
  const crossed = t > CROSS;
  cam(lerp(1.3, 1.0, p), 540, 960, () => {
    bgSpace({ py: -T * 30 });
    const R = 2600, cy = 960 + R;
    glow(540, 960, 900, P.spaceOrange, 0.35);
    [[1.06, P.violet], [1.04, P.magenta], [1.025, P.spaceOrange], [1.012, P.gold], [1.004, P.cream]].forEach(([f, c]) => circle(540, cy, R * f, c));
    circle(540, cy, R, P.space0);
    if (crossed) { const q = prog(t, CROSS, CROSS + 0.6); ctx.beginPath(); ctx.arc(540, 960, 40 + q * 500, 0, 7); ctx.lineWidth = 16 * (1 - q); ctx.strokeStyle = rgba(P.cream, 1 - q); ctx.stroke(); }
    mascotT(540, my, { s: 0.7, rot: 0.1 * Math.sin(t * 2), lookY: crossed ? 0.3 : 1, wave: t > ts('d3') ? 1 : 0 });
    label('Sagitário A*', 300, 360, P.violet, { scale: popScale(t, S.s5b + 0.1), size: 40 });
    label('4 milhões de Sóis', 760, 360, P.spaceOrange, { scale: popScale(t, S.s5b + 0.3), size: 40 });
    label('Nada!', 800, 880, P.royal, { scale: popScale(t, wt('d3', 3)), size: 48 });
  });
}

function panel(x0, w, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, w, H); ctx.clip(); fn(); ctx.restore(); }
function camP(z, sx, cx, cy, fn) { ctx.save(); ctx.translate(sx, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore(); }
function scene6(t) {
  const pIn = E.out(prog(t, S.s6, S.s6 + 0.35));
  const hy = 1150;
  const edge = (x0, w) => {
    bgSpace({ py: -T * 20, neb: 0.8 });
    glow(x0 + w / 2, hy, 500, P.spaceOrange, 0.3);
    const R = 1800, cy = hy + R;
    [[1.05, P.violet], [1.03, P.magenta], [1.018, P.spaceOrange], [1.008, P.gold]].forEach(([f, c]) => circle(x0 + w / 2, cy, R * f, c));
    circle(x0 + w / 2, cy, R, P.space0);
  };
  // esquerda: para você (atravessa normalmente)
  panel(0, 535, () => camP(lerp(0.85, 1, pIn), 270, 270, 960, () => {
    edge(0, 540);
    const my = lerp(500, 1450, prog(t, S.s6, S.s7));
    mascotT(270, my, { s: 0.6, lookY: 1 });
    clockIcon(390, my - 230, 34, P.gold);
  }));
  // direita: visto de fora (desacelera, congela, avermelha e some)
  panel(545, 535, () => camP(lerp(0.85, 1, pIn), 810, 810, 960, () => {
    edge(540, 540);
    const k = prog(t, S.s6, S.s7);
    const slow = 1 - Math.exp(-k * 3.2);                 // aproxima-se assintoticamente da borda
    const my = lerp(500, 980, slow);
    const red = E.inOut(prog(t, ts('e2'), te('e3')));
    DIM = red * 0.75; DIMTO = P.ember;
    mascotT(810, my, { s: 0.6, lookY: 1, alpha: 1 - red * 0.88 });
    DIM = 0;
    // relógio quase parando
    const ang = -Math.PI / 2 + 6 * (1 - Math.exp(-(t - S.s6) * 0.6));
    circle(930, my - 230, 34, P.gold); circle(930, my - 230, 24, '#FFFFFF'); capsule(930, my - 230, 930 + Math.cos(ang) * 17, my - 230 + Math.sin(ang) * 17, 5, P.gold);
  }));
  rrect(535, 0, 10, H, 0, P.lilac);
  label('PARA VOCÊ', 270, 230, P.royal, { scale: popScale(t, S.s6 + 0.3), size: 40 });
  label('VISTO DE FORA', 810, 230, P.magenta, { scale: popScale(t, S.s6 + 0.5), size: 40 });
  label('nunca chega', 810, 1250 - 150, P.ember, { scale: popScale(t, wt('e2', 2)), size: 38 });
}

function scene7(t) {
  const pIn = E.out(prog(t, S.s7, S.s7 + 0.5));
  cam(lerp(1.6, 1.0, pIn), 540, 880, () => {
    const g = ctx.createRadialGradient(540, 820, 20, 540, 820, 1300);
    g.addColorStop(0, P.deepPurple); g.addColorStop(0.5, P.space1); g.addColorStop(1, P.space0);
    ctx.fillStyle = g; ctx.fillRect(-W, -H, 3 * W, 3 * H);
    // todos os caminhos convergem para o centro
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2 + 0.1;
      ctx.setLineDash([30, 40]); ctx.lineDashOffset = T * 160;
      capsule(540 + Math.cos(a) * 1300, 820 + Math.sin(a) * 1300, 540 + Math.cos(a) * 30, 820 + Math.sin(a) * 30, 6, rgba(i % 2 ? P.violet : P.spacePink, 0.55));
      ctx.setLineDash([]);
    }
    glow(540, 820, 160, P.cream, 0.6 + 0.2 * Math.sin(T * 8));
    circle(540, 820, 14, P.cream);
    const q = E.in(prog(t, S.s7, S.s8 + 0.2));
    mascotT(540 + 60 * Math.sin(t), lerp(300, 760, q), { s: lerp(0.7, 0.15, q), rot: t * 0.8, lookY: 1 });
    label('Centro', 540, 940, P.violet, { scale: popScale(t, wt('f1', 5)), size: 40 });
  });
  const tf = wt('f2', 5);
  const hs = popScale(t, tf);
  if (hs > 0) timerHUD(fmt(59 - (t - tf) * 6), 540, 250, { scale: hs, bg: P.hotPink, icon: P.cream });
}

function scene8(t) {
  const pIn = E.out(prog(t, S.s8, S.s8 + 0.4));
  const br = prog(t, BREAK, BREAK + 1.2);
  cam(lerp(1.4, 1.0, pIn) + 0.1 * prog(t, S.s8, BREAK), 540, 860, () => {
    bgSpace({ neb: 0.4, alpha: 0.4 });
    // malha do espaço-tempo afunilando para o ponto central
    const cx = 540, cy = 860;
    for (let gi = -8; gi <= 8; gi++) for (let gj = -10; gj <= 10; gj++) {
      const x0 = cx + gi * 70, y0 = cy + gj * 70;
      const pull = (px, py) => { const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) + 1, f = 1 - 110 / (d + 110) * (0.6 + 0.4 * prog(t, S.s8, BREAK)); return [cx + dx * f, cy + dy * f]; };
      const R = rng(gi * 100 + gj + 500);
      const fly = br > 0 ? E.out(br) * (200 + R() * 500) : 0, fa = R() * 6.28;
      const off = [Math.cos(fa) * fly, Math.sin(fa) * fly];
      ctx.globalAlpha = 1 - br * 0.9;
      const [ax, ay] = pull(x0, y0), [bx, by] = pull(x0 + 70, y0), [qx, qy] = pull(x0, y0 + 70);
      capsule(ax + off[0], ay + off[1], bx + off[0], by + off[1], 4, rgba(P.cyanL, 0.5));
      capsule(ax + off[0], ay + off[1], qx + off[0], qy + off[1], 4, rgba(P.violet, 0.6));
    }
    ctx.globalAlpha = 1;
    glow(cx, cy, 200, P.cream, 0.8); circle(cx, cy, 18 + 6 * Math.sin(T * 10), '#FFFFFF');
    label('?', cx, cy - 260, P.violet, { scale: popScale(t, ts('g1') + 0.3) * (1 + 0.08 * Math.sin(t * 7)) * (1 - br), size: 120 });
    label('Singularidade', cx, cy + 300, P.magenta, { scale: popScale(t, ts('g2')), size: 44 });
  }, br > 0 ? 14 * (1 - br) : 0);
  // glitch: fatias deslocadas na quebra
  if (t > BREAK && t < BREAK + 0.6) {
    const R = rng(Math.floor(t * 30));
    for (let i = 0; i < 7; i++) { const y = R() * H, h = 20 + R() * 90, dx = (R() - 0.5) * 120; ctx.drawImage(cv, 0, y, W, h, dx, y, W, h); }
    ctx.fillStyle = rgba(P.magenta, 0.15); ctx.fillRect(0, 0, W, H);
  }
}

function scene9(t) {
  const tr = ts('h2') + 0.05;                        // a partir daqui volta ao quadro de loop
  if (t < tr) {
    const pIn = E.out(prog(t, S.s9, S.s9 + 0.35));
    cam(lerp(1.2, 1.0, pIn), 540, 960, () => {
      bgSpace({ neb: 0.9 });
      blackHole(290, 760, 70, { tilt: 0.2 });
      blackHole(790, 760, 150, { tilt: -0.3 });
    });
    label('Pequeno', 290, 1040, P.spaceOrange, { scale: popScale(t, S.s9 + 0.3), size: 44 });
    label('Gigante', 790, 1040, P.violet, { scale: popScale(t, S.s9 + 0.55), size: 44 });
    label('Comenta aí!', 540, 330, P.magenta, { scale: popScale(t, wt('h1', 5)), size: 52, rot: -0.04 });
    return;
  }
  const p = E.inOut(prog(t, tr, LOOP_SETTLE));
  cam(lerp(2.4, 1.0, p), 540, lerp(1000, 900, p), () => loopFrame(t), 4 * (1 - p));
  if (p < 0.4) radialLines((0.4 - p) * 2, rgba(P.lilac, 0.5), 540, 960);
}

window.renderFrame = function (t) {
  T = t; DIM = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.setLineDash([]);
  ctx.fillStyle = P.space0; ctx.fillRect(0, 0, W, H);
  if (t < S.s2) scene1(t);
  else if (t < S.s3) scene2(t);
  else if (t < S.s4) scene3(t);
  else if (t < S.s5) scene4(t);
  else if (t < S.s6) scene5(t);
  else if (t < S.s7) scene6(t);
  else if (t < S.s8) scene7(t);
  else if (t < S.s9) scene8(t);
  else scene9(t);
  captions(t);
};
