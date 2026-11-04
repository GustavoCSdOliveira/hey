// Nerd vs. Apocalipse, versão Shorts (1080x1920, 52 s). frame(t) devolve o SVG do instante t.
const W = 1080, H = 1920;
const LANG = (typeof location !== "undefined" && new URLSearchParams(location.search).get("lang")) || "pt";
const EN = {
  "SEM SINAL": "NO SIGNAL", "APOCALIPSE": "APOCALYPSE", "ELE SOBREVIVE?": "CAN HE SURVIVE?",
  "LEU 300 WIKIS": "READ 300 WIKIS", "ZEROU 40 JOGOS": "BEAT 40 GAMES",
  "ÁGUA": "WATER", "COMIDA": "FOOD", "ENERGIA": "ENERGY", "MORAL": "MORALE",
  "DIA 1": "DAY 1", "SEM REDE": "NO GRID", "SOL": "SUN", "PAINEL": "PANEL", "INVERSOR": "INVERTER", "CASA": "HOME",
  "SEM REDE, SEM ENERGIA": "NO GRID, NO POWER", "TENTATIVA": "ATTEMPT", "+1 PERSISTÊNCIA": "+1 PERSISTENCE",
  "SEMANA 2": "WEEK 2", "SEM 1": "WK 1", "SEM 3": "WK 3", "SEM 6": "WK 6", "SEM 9": "WK 9", "A HORTA DEMORA": "GARDENS TAKE TIME",
  "A EQUIPE": "THE TEAM", "SISTEMAS": "SYSTEMS", "HORTA": "GARDEN", "CONSERTO": "REPAIRS", "SAÚDE": "HEALTH",
  "ESTIMATIVA DO ROTEIRO, NÃO É ESTUDO": "SCRIPT ESTIMATE, NOT A STUDY", "SOZINHO": "ALONE", "EM GRUPO": "IN A GROUP",
  "VOCÊ SABE": "CAN YOU", "ACENDER": "START", "UM FOGO?": "A FIRE?", "E VOCÊ? SOBREVIVERIA?": "WOULD YOU SURVIVE?",
};
const tr = s => (LANG === "en" && EN[s]) || s;
const CAP = () => (LANG === "en" ? CAPTIONS_EN : CAPTIONS);
const CY = "#16F1FA", CYL = "#4DF7F9", CYW = "#91FCF9", NIGHT = "#090A4E", ULTRA = "#1620C1", ROYAL = "#1587F0";
const PURP = "#46068F", VIOL = "#7F1AE3", LILAC = "#DECEE0", MAG = "#D12686", ORG = "#F29E0C", PEACH = "#F1AF64";
const MINT = "#17D985", EMBER = "#C9351E", YEL = "#F2CB26", DEEP = "#020027", DEEP2 = "#0C0245";
const FOR1 = "#2A454D", FOR2 = "#13303F", LEAF = "#6D925C", LEAF2 = "#88B373", OCE1 = "#14497A", OCE2 = "#0F6B87";
const FONT = "Nunito, Quicksand, 'Varela Round', 'DejaVu Sans', sans-serif";
const BGS = { night: [NIGHT, ULTRA], cyan: [CY, CYL], space: [DEEP, DEEP2], ocean: [OCE1, OCE2], forest: [FOR1, FOR2], purple: [PURP, "#2a0a63"], warm: [FOR2, FOR1] };
const GLOWS = { cy: CYW, yl: YEL, or: ORG, mg: MAG, rd: EMBER, mt: MINT, wh: LILAC };
const PCOL = { night: CYW, cyan: "#fff", space: CYW, ocean: CYW, forest: LEAF2, purple: LILAC, warm: YEL };

// ---- matemática e easing ----
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, d) => clamp((t - a) / d);
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeIO = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) { x -= 1.5 / d; return n * x * x + .75; } if (x < 2.5 / d) { x -= 2.25 / d; return n * x * x + .9375; } x -= 2.625 / d; return n * x * x + .984375; };
const pop = (t, a, d = .45) => (t < a ? 0 : back(prog(t, a, d)));
const lerp = (a, b, x) => a + (b - a) * x;
const f = n => +n.toFixed(1);
const rng = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const kf = (t, pts) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return lerp(v0, v1, (t - t0) / (t1 - t0)); } return pts[pts.length - 1][1]; };
const blinkAt = (t, off = 0) => { const p = (t + off) % 3.4; return p < .14 ? Math.sin(Math.PI * p / .14) : 0; };

// ---- primitivas ----
const circ = (x, y, r, fill, op = 1, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(0, r))}" fill="${fill}" opacity="${op}" ${ex}/>`;
const rr = (x, y, w, h, r, fill, op = 1, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" rx="${r}" fill="${fill}" opacity="${op}" ${ex}/>`;
const glow = (x, y, r, k, op = 1) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#g_${k})" opacity="${op}"/>`;
const line = (x1, y1, x2, y2, c, w = 8, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
const txt = (x, y, s, size = 40, fill = "#fff", anchor = "middle", ex = "") => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="800" ${ex}>${tr(s)}</text>`;
const S = (cx, cy, sc, inner, rot = 0) => (sc <= 0.001 ? "" : `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)}) scale(${sc.toFixed(3)}) translate(${-f(cx)} ${-f(cy)})">${inner}</g>`);
const label = (cx, cy, s, fill = MAG, size = 44, rot = 0, sc = 1) => { s = tr(s); const w = s.length * size * .74 + 56, h = size * 1.55; return S(cx, cy, sc, rr(cx - w / 2, cy - h / 2, w, h, 14, fill) + txt(cx, cy + size * .35, s, size), rot); };
const drop = (x, y, s, c = CYL, op = 1) => `<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" opacity="${op}" fill="${c}" d="M0,-1 C0.6,-0.2 0.9,0.2 0.9,0.5 A0.9,0.9 0 0 1 -0.9,0.5 C-0.9,0.2 -0.6,-0.2 0,-1Z"/>`;
function flame(x, y, s, t = 0) {
  const p = "M0,-1 C0.5,-.4 0.85,0 0.72,.5 A.72,.72 0 0 1 -.72,.5 C-.85,0 -.3,-.3 0,-1Z";
  const wob = 1 + .06 * Math.sin(t * 14);
  let o = glow(x, y - s * .2, s * 2.2, "or", .8);
  for (const [k, c] of [[1, EMBER], [.72, ORG], [.42, YEL]]) o += `<path transform="translate(${f(x)} ${f(y + s * (1 - k) * .5)}) scale(${f(s * k * (2 - wob))} ${f(s * k * wob)})" fill="${c}" d="${p}"/>`;
  return o;
}
function particles(t, col) {
  const r = rng(11); let o = "";
  for (let i = 0; i < 38; i++) {
    const x0 = r() * W, y0 = r() * H, rad = [3, 4, 5, 7, 9][Math.floor(r() * 5)], op = .2 + r() * .5, sp = 8 + r() * 22;
    o += circ(x0 + Math.sin(t * .7 + i) * 14, ((y0 - t * sp) % H + H) % H, rad, col, f(op));
  }
  return o;
}

// ---- personagem ----
function teo(x, y, s, o = {}) {
  const mood = o.mood || "ok", aL = o.aL ?? 14, aR = o.aR ?? -14, look = o.look || 0, bl = o.blink || 0, tilt = o.tilt || 0;
  const e = 1 - .92 * bl;
  let g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(tilt)}) scale(${s})">`;
  g += rr(-50, -165, 42, 150, 20, ULTRA) + rr(8, -165, 42, 150, 20, ULTRA);
  g += `<ellipse cx="-30" cy="-10" rx="40" ry="18" fill="${LILAC}"/><ellipse cx="30" cy="-10" rx="40" ry="18" fill="${LILAC}"/>`;
  for (const [side, ang] of [[-1, aL], [1, aR]]) { const sx = side * 64; g += `<g transform="rotate(${f(ang)} ${sx} -350)">` + rr(sx - 15, -360, 30, 135, 15, MAG) + circ(sx, -218, 22, PEACH) + "</g>"; }
  g += rr(-72, -395, 144, 255, 54, PURP) + rr(-72, -395, 116, 255, 54, MAG) + rr(-42, -255, 84, 52, 22, PURP, .45);
  g += circ(-82, -452, 16, PEACH) + circ(82, -452, 16, PEACH) + circ(0, -452, 84, "#c8844a") + circ(-4, -456, 80, PEACH);
  g += `<path d="M-86,-455 A86,86 0 0 1 86,-455 C50,-512 -45,-510 -86,-455Z" fill="${NIGHT}"/>`;
  const pup = mood === "shock" ? 5 : 11, py = mood === "sad" ? -436 : mood === "happy" ? -446 : -446;
  for (const ex of [-36, 36]) {
    g += `<ellipse cx="${ex}" cy="-448" rx="30" ry="${f(30 * e)}" fill="#fff" stroke="${ULTRA}" stroke-width="7"/>`;
    if (bl < .6) g += `<ellipse cx="${f(ex + look + 4)}" cy="${py}" rx="${pup}" ry="${f(pup * e)}" fill="${NIGHT}"/>` + circ(ex + look + 8, py - 5, 3.5, "#fff");
  }
  g += line(-6, -448, 6, -448, ULTRA, 7);
  if (mood === "sad") g += line(-62, -500, -16, -488, NIGHT, 7) + line(62, -500, 16, -488, NIGHT, 7) + drop(104, -495, 15, CYL);
  else if (mood === "happy") g += line(-60, -494, -14, -498, NIGHT, 7) + line(14, -498, 60, -494, NIGHT, 7) + circ(-58, -418, 14, "#E7467A", .55) + circ(58, -418, 14, "#E7467A", .55);
  else if (mood === "shock") g += line(-60, -498, -14, -506, NIGHT, 7) + line(14, -506, 60, -498, NIGHT, 7);
  else g += line(-58, -496, -14, -496, NIGHT, 7) + line(14, -496, 58, -496, NIGHT, 7);
  return g + "</g>";
}
const bob = (t, a = 5, sp = 2.4) => Math.sin(t * sp) * a;
function person(x, y, s, body) { return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">` + rr(-26, -100, 52, 100, 22, body) + circ(0, -126, 26, PEACH) + `<path d="M-27,-130 A27,27 0 0 1 27,-130 Z" fill="${NIGHT}"/></g>`; }
function piece(x, y, w, h, c, shade) {
  return rr(x - w / 2, y - h / 2 + 10, w, h, 40, shade) + rr(x - w / 2, y - h / 2, w, h, 40, c) + circ(x, y - h / 2 - 6, 26, c) + circ(x + w / 2 + 6, y, 24, shade)
    + circ(x - 28, y - 8, 16, "#fff") + circ(x + 28, y - 8, 16, "#fff") + circ(x - 25, y - 6, 7, NIGHT) + circ(x + 31, y - 6, 7, NIGHT);
}

// ---- objetos ----
function wifi(x, y, s, c) {
  let g = `<g transform="translate(${f(x)} ${f(y)}) scale(${s})" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round">`;
  for (const r of [110, 70, 30]) { const a = 40 * Math.PI / 180; g += `<path d="M${f(-r * Math.sin(a))},${f(-r * Math.cos(a))} A${r},${r} 0 0 1 ${f(r * Math.sin(a))},${f(-r * Math.cos(a))}"/>`; }
  return g + `<circle r="2" cy="30" fill="${c}"/></g>`;
}
const xmark = (x, y, s, c = EMBER, w = 22) => line(x - s, y - s, x + s, y + s, c, w) + line(x - s, y + s, x + s, y - s, c, w);
function earth(x, y, r, t) {
  let g = glow(x, y, r * 1.9, "cy", .8) + circ(x, y, r, ULTRA) + circ(x - r * .04, y - r * .04, r * .96, ROYAL);
  const sh = Math.sin(t * .6) * r * .12;
  for (const [dx, dy, rx, ry] of [[-.3, -.2, .32, .22], [.25, .15, .28, .34], [-.05, .55, .3, .12]]) g += `<ellipse cx="${f(x + dx * r + sh)}" cy="${f(y + dy * r)}" rx="${f(rx * r)}" ry="${f(ry * r)}" fill="${LEAF2}"/>`;
  return g + `<ellipse cx="${f(x - r * .4)}" cy="${f(y - r * .45)}" rx="${f(r * .22)}" ry="${f(r * .12)}" fill="#fff" opacity=".5" transform="rotate(-30 ${f(x - r * .4)} ${f(y - r * .45)})"/>`;
}
function book(x, y, s, c = VIOL, gl = true) {
  let o = `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">`;
  if (gl) o += glow(0, 0, 230, "yl", .9);
  o += rr(-110, -80, 220, 160, 16, c) + rr(-100, -70, 100, 140, 10, LILAC) + rr(6, -70, 94, 140, 10, LILAC);
  for (let i = 0; i < 4; i++) o += line(-88, -40 + i * 28, -14, -40 + i * 28, "#9a8fc0", 6) + line(18, -40 + i * 28, 88, -40 + i * 28, "#9a8fc0", 6);
  return o + "</g>";
}
const pad = (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${glow(0, 0, 220, "mg", .5)}${rr(-130, -65, 260, 130, 62, VIOL)}${circ(-60, 0, 22, CYW)}${circ(60, 0, 22, MAG)}</g>`;
function can(x, y, s, rot = 0, c = LILAC) { return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">` + rr(-35, -50, 70, 100, 12, c) + rr(-35, -26, 70, 36, 4, MAG) + `<ellipse cx="0" cy="-50" rx="35" ry="9" fill="#fff" opacity=".7"/></g>`; }
function sprout(x, y, sc, stage, wilt = 0) {
  let g = `<g transform="translate(${f(x)} ${f(y)}) scale(${sc.toFixed(3)}) rotate(${f(wilt * 18)})">`;
  if (stage === 0) g += circ(0, 0, 14, ORG);
  else {
    const h = 60 + stage * 60, c = wilt > 0 ? "#8a6a2a" : LEAF2;
    g += rr(-6, -h, 12, h, 6, c);
    for (let i = 0; i < stage; i++) { const yy = -h + 20 + i * 36, d = i % 2 ? -1 : 1; g += `<ellipse cx="${d * 28}" cy="${yy}" rx="28" ry="14" fill="${c}" transform="rotate(${d * -25 + wilt * d * 40} ${d * 28} ${yy})"/>`; }
  }
  return g + "</g>";
}
function city(p) {
  const r = rng(4); let g = ""; let x = -20;
  while (x < W) {
    const w = 100 + Math.floor(r() * 90), h = 300 + Math.floor(r() * 420), on = (x + w / 2) / W > p;
    g += rr(x, 1560 - h, w - 8, h + 200, 6, on ? ULTRA : "#0f1470");
    for (let wy = 1560 - h + 30; wy < 1540; wy += 64) for (let wx = x + 16; wx < x + w - 36; wx += 46) { const rv = r(); g += rr(wx, wy, 24, 32, 4, on && rv > .25 ? YEL : "#0b0f5a"); }
    x += w;
  }
  return g;
}
function hud(v, pp) {
  const rows = [["ÁGUA", "a", CYW], ["COMIDA", "c", ORG], ["ENERGIA", "e", YEL], ["MORAL", "m", MINT]];
  let g = rr(40, 150, 1000, 170, 30, NIGHT, .66);
  rows.forEach(([n, k, c], i) => { const x = 70 + (i % 2) * 490, y = 182 + Math.floor(i / 2) * 66, val = clamp(v[k]); g += txt(x, y + 24, n, 26, "#fff", "start") + rr(x + 150, y, 300, 30, 15, DEEP2, .85) + rr(x + 150, y, Math.max(30, 300 * val), 30, 15, val > .3 ? c : EMBER); });
  return `<g transform="translate(0 ${f((1 - pp) * -220)})" opacity="${f(pp)}">${g}</g>`;
}
const hudVals = t => ({
  a: kf(t, [[8.6, 1], [17, 1], [18.2, .45], [24.4, .45], [25.6, 1]]),
  c: kf(t, [[8.6, 1], [17, .85], [28, .8], [31.5, .06]]),
  e: kf(t, [[8.6, 1], [10.5, 1], [13.5, .4], [24, .3]]),
  m: kf(t, [[8.6, 1], [24, .85], [32, .3]]),
});

// ---- cenas (tl = tempo local) ----
function sA(tl) {
  let o = glow(540, 520, 620, "cy", .3);
  for (let i = 0; i < 3; i++) { const p = (tl * .8 + i / 3) % 1; o += circ(540, 520, 220 + p * 360, EMBER, f((1 - p) * .22)); }
  o += S(540, 520, pop(tl, .1, .5), rr(240, 330, 600, 380, 40, ULTRA) + rr(270, 360, 540, 320, 24, CYL) + rr(500, 710, 80, 90, 10, PURP) + rr(420, 790, 240, 34, 17, PURP) + wifi(540, 560, 1.4, ULTRA));
  o += S(540, 520, pop(tl, .9, .4), xmark(540, 520, 130, EMBER, 30));
  o += label(540, 250, "SEM SINAL", EMBER, 60, 0, pop(tl, .5, .4));
  o += teo(540, 1290 + bob(tl, 4), .8, { mood: "sad", look: Math.sin(tl * 3) * 9, blink: blinkAt(tl) });
  o += rr(190, 1210, 700, 230, 80, VIOL) + rr(190, 1140, 700, 130, 70, "#9b46ee") + rr(140, 1180, 100, 270, 44, PURP) + rr(840, 1180, 100, 270, 44, PURP);
  return o;
}
function sB(tl, t) {
  const sc = .4 + .6 * back(prog(tl, 0, .8)), br = 1 + .012 * Math.sin(tl * 3);
  let o = earth(540, 640, 300 * sc * br, t);
  const e1 = easeOut(prog(tl, .5, .5)), e2 = easeOut(prog(tl, .8, .5)), e3 = easeOut(prog(tl, 1.2, .5));
  o += `<g opacity="${f(e1)}">${txt(540, 1130 + (1 - e1) * 70, "NERD vs.", 150)}</g>`;
  o += `<g opacity="${f(e2)}">${txt(540, 1262 + (1 - e2) * 70, "APOCALIPSE", 120)}</g>`;
  o += `<g opacity="${f(e3)}">${txt(540, 1350 + (1 - e3) * 50, "ELE SOBREVIVE?", 52, CYW, "middle", 'letter-spacing="10"')}</g>`;
  return o;
}
function sC(tl) {
  let o = glow(540, 1100, 700, "wh", .3);
  o += S(200, 440, pop(tl, .3, .5), book(200, 440, .6, VIOL, true)) + label(680, 440, "LEU 300 WIKIS", VIOL, 46, 0, pop(tl, .5, .45));
  o += S(200, 650, pop(tl, 1.2, .5), pad(200, 650, .75)) + label(680, 650, "ZEROU 40 JOGOS", ROYAL, 46, 0, pop(tl, 1.4, .45));
  o += teo(540, 1440 + bob(tl, 6), 1.1, { mood: "happy", aL: 14 + Math.sin(tl * 2) * 6, aR: -14 - Math.sin(tl * 2) * 6, blink: blinkAt(tl, 1) });
  return o;
}
function box(x, y, w, h, t, c, sc) { return S(x, y, sc, rr(x - w / 2, y - h / 2, w, h, 26, c) + txt(x, y + 17, t, 48)); }
function sD(tl) {
  if (tl < 3.9) {
    const p = easeIO(prog(tl, .5, 1.9));
    let o = glow(300, 400, 500, "yl", .12 * (1 - p)) + city(p) + rr(0, 1540, W, 400, 0, DEEP);
    o += label(300, 400, "DIA 1", ORG, 76, 0, pop(tl, .1, .4)) + label(540, 540, "SEM REDE", EMBER, 62, 0, pop(tl, 2, .4));
    return `<g transform="translate(${f(-easeIO(prog(tl, 3.6, .3)) * 1080)} 0)">${o}</g>`;
  }
  const l = tl - 3.9, slide = (1 - easeOut(prog(l, 0, .35))) * 1080;
  let o = "";
  const bx = [[430, "SOL", ORG, .2, 440], [650, "PAINEL", ROYAL, .45, 440], [870, "INVERSOR", VIOL, .7, 480], [1110, "CASA", MAG, .95, 440]];
  bx.forEach(([y, t, c, a, w]) => { o += box(540, y, w, 130, t, c, pop(l, a, .4)); });
  [[495, 585], [715, 805], [935, 1045]].forEach(([y1, y2], i) => {
    const on = prog(l, .3 + i * .25, .3); if (on <= 0) return;
    o += line(540, y1, 540, lerp(y1, y2, on), CYW, 12) + (on > .9 ? `<path d="M540,${y2 + 14} L515,${y2 - 20} L565,${y2 - 20}Z" fill="${CYW}"/>` : "");
  });
  o += S(540, 990, pop(l, 1.3, .4), xmark(540, 990, 60, EMBER, 24) + glow(540, 990, 140, "rd", .6));
  o += label(540, 1320, "SEM REDE, SEM ENERGIA", EMBER, 50, 0, pop(l, 1.6, .4));
  return `<g transform="translate(${f(slide)} 0)">${o}</g>`;
}
const OK = 7.5; // instante do sucesso na cena E (narração: "na décima quarta, funciona")
function tentativa(tl) { return clamp(prog(tl, .5, 6.9) * 14, 0, 13.999); }
function sE(tl) {
  const att = tentativa(tl), n = tl >= OK ? 14 : 1 + Math.floor(att), fr = att % 1, ok = tl >= OK;
  let o = glow(700, 1250, 500, "or", ok ? .35 : .12);
  // sticks e chama de cada tentativa
  if (!ok) {
    o += [0, 1, 2, 3, 4].map(i => line(610 + i * 20, 1400, 730 - i * 14, 1355 - i * 4, "#a86f3b", 16)).join("");
    if (fr < .6) o += flame(690, 1340, Math.sin(fr / .6 * Math.PI) * 55 + 4, tl);
    else for (let i = 0; i < 4; i++) { const q = (fr - .6) / .4; o += circ(690 + i * 22, 1290 - q * 140 - i * 40, 22 + i * 8, LILAC, f(.55 * (1 - q) * (1 - i * .15))); }
  }
  // contador
  const pulse = ok ? 1 + .15 * Math.max(0, 1 - prog(tl, OK, .4) * 2) : 1 + .3 * Math.max(0, 1 - fr * 5);
  o += label(540, 400, "TENTATIVA", ORG, 54);
  o += rr(340, 470, 400, 300, 56, NIGHT, .75) + S(540, 660, pulse, txt(540, 690, String(n), 190, ok ? MINT : YEL));
  if (ok) {
    const r = prog(tl, OK, .9), rs = 160 + 380 * easeOut(r);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; o += line(700 + Math.cos(a) * rs, 1250 + Math.sin(a) * rs, 700 + Math.cos(a) * (rs + 150), 1250 + Math.sin(a) * (rs + 150), "#fff", 10, `opacity="${f(1 - r)}"`); }
    o += flame(700, 1360, 100 * Math.min(1, pop(tl, OK, .5)), tl);
    const pot = easeOut(prog(tl, OK + .6, .5)), py = (1 - pot) * -260;
    o += `<g transform="translate(0 ${f(py)})" opacity="${f(pot)}">` + rr(520, 1080, 360, 200, 60, "#30535A") + rr(490, 1070, 420, 34, 17, LILAC) + rr(900, 1130, 90, 30, 15, "#30535A") + rr(410, 1130, 90, 30, 15, "#30535A") + rr(540, 1090, 320, 26, 13, CYL);
    for (let i = 0; i < 6; i++) { const q = (tl * .9 + i / 6) % 1; o += circ(560 + i * 55 + Math.sin(tl * 3 + i) * 8, 1040 - q * 110, 12 + (i % 2) * 8, CYW, f((1 - q) * .7)); }
    o += "</g>";
    o += label(740, 940, "+1 PERSISTÊNCIA", MINT, 52, 0, pop(tl, OK + .9, .4));
  }
  const arm = ok ? -150 : -40 + Math.sin(tl * 9) * 14;
  o += teo(250, 1440 + bob(tl, 4), 1.0, { mood: ok ? "happy" : "sad", aL: 40 + Math.sin(tl * 9) * 10, aR: arm, blink: blinkAt(tl), look: ok ? 0 : 8 });
  return o;
}
function sF(tl) {
  if (tl < 2.0) {
    let o = [700, 1010].map(y => rr(120, y, 840, 30, 12, "#3a6a70")).join("");
    [[250, 650], [410, 650], [570, 650], [730, 650], [330, 960], [490, 960], [650, 960], [810, 960]].forEach(([x, y], i) => {
      const st = .1 + i * .14, dt = Math.max(0, tl - st), fall = .5 * 2600 * dt * dt;
      if (y + fall < 1900) o += can(x, y + fall, 1.2, dt * 220 * (i % 2 ? 1 : -1), i % 3 === 0 ? CYW : i % 3 === 1 ? LILAC : ORG);
    });
    o += circ(540, 1320, 130, LILAC) + circ(540, 1320, 88, "#fff", .8);
    o += label(540, 420, "SEMANA 2", ORG, 66, 0, pop(tl, .1, .4));
    return `<g transform="translate(${f(-easeIO(prog(tl, 1.7, .3)) * 1080)} 0)">${o}</g>`;
  }
  const l = tl - 2.0, slide = (1 - easeOut(prog(l, 0, .35))) * 1080;
  let o = rr(0, 1250, W, 400, 0, PURP) + rr(0, 1240, W, 22, 0, VIOL);
  [[190, 0, "SEM 1"], [430, 1, "SEM 3"], [670, 2, "SEM 6"], [910, 4, "SEM 9"]].forEach(([x, st, t], i) => {
    const g = prog(l, .2 + i * .4, .6), wilt = st === 4 ? easeIO(prog(l, 1.6, .7)) : 0;
    o += sprout(x, 1240, 1.2 * easeOut(g), st, wilt) + label(x, 1350, t, st === 4 && wilt > .5 ? EMBER : ROYAL, 40, 0, pop(l, .2 + i * .4, .4));
  });
  o += label(540, 420, "A HORTA DEMORA", MINT, 62, 0, pop(l, .1, .4));
  o += S(910, 1000, pop(l, 2.2, .4), xmark(910, 1000, 55, EMBER, 22));
  return `<g transform="translate(${f(slide)} 0)">${o}</g>`;
}
function sG(tl) {
  let o = circ(540, 820, 560, PURP, .5) + glow(540, 820, 700, "wh", .22) + circ(540, 820, 430, VIOL);
  const bl = (tl > 2.0 && tl < 2.2) ? Math.sin((tl - 2.0) / .2 * Math.PI) : 0, e = 1 - .93 * bl;
  const px = Math.sin(tl * 1.2) * 26, py = 40 + Math.sin(tl * .9) * 8;
  for (const ex of [370, 710]) {
    o += `<ellipse cx="${ex}" cy="780" rx="140" ry="${f(140 * e)}" fill="#fff" stroke="${ULTRA}" stroke-width="22"/>`;
    if (bl < .6) o += `<ellipse cx="${f(ex + px)}" cy="${f(780 + py)}" rx="52" ry="${f(52 * e)}" fill="${NIGHT}"/>` + circ(ex + px + 18, 780 + py - 20, 14, "#fff");
  }
  o += line(500, 780, 580, 780, ULTRA, 22);
  const q = (tl * .55) % 1, tearY = 960 + q * 400;
  o += drop(790, tearY, 52 * (1 - q * .3), CYL, f(1 - q * .6));
  o += glow(900, 1380, 140 + Math.sin(tl * 3) * 20, "or", .9) + circ(900, 1380, 20, YEL);
  return o;
}
const PCS = [[330, 560, MAG, PURP, "SISTEMAS"], [750, 560, MINT, "#0d8a56", "HORTA"], [330, 1010, ORG, "#b56e00", "CONSERTO"], [750, 1010, VIOL, PURP, "SAÚDE"]];
function sH(tl) {
  let o = glow(540, 780, 800, "cy", .3) + label(540, 330, "A EQUIPE", NIGHT, 62, 0, pop(tl, .1, .4));
  const snap = prog(tl, 2.2, .5), pulse = 1 + .05 * Math.sin(snap * Math.PI * 2) * (snap < 1 ? 1 : 0);
  PCS.forEach(([x, y, c, sh, t], i) => {
    const st = .25 + i * .35, b = bounce(prog(tl, st, .8)), dy = (1 - b) * -1000, sq = prog(tl, st + .7, .01) > 0 ? 1 + .12 * Math.max(0, 1 - prog(tl, st + .7, .3) * 3) * Math.sin(prog(tl, st + .7, .3) * 18) : 1;
    o += S(x, y + 120, pulse, `<g transform="translate(0 ${f(dy)})">${S(x, y + 125, 1 / sq, piece(x, y, 340, 250, c, sh))}</g>`);
    o += label(x, y + 190, t, sh, 40, 0, pop(tl, st + .8, .35));
  });
  for (let i = 0; i < 8; i++) o += person(90 + i * 128, 1400 + Math.sin(tl * 3 + i) * -6, .9 * pop(tl, 3.2 + i * .12, .4), [MAG, MINT, ORG, VIOL, ROYAL, YEL, MAG, MINT][i]);
  return o;
}
function sI(tl) {
  let o = glow(540, 900, 700, "mt", .2) + label(540, 330, "ESTIMATIVA DO ROTEIRO, NÃO É ESTUDO", NIGHT, 32, 0, pop(tl, .1, .4));
  const w1 = 840 * .25 * back(prog(tl, .4, .8)), w2 = 840 * .88 * back(prog(tl, 2.3, 1.1));
  o += txt(120, 560, "SOZINHO", 62, NIGHT, "start") + rr(120, 600, Math.max(20, w1), 120, 60, ORG);
  o += txt(120, 860, "EM GRUPO", 62, NIGHT, "start") + rr(120, 900, Math.max(20, w2), 120, 60, MINT);
  o += glow(120 + w2, 960, 150, "mt", .6 * prog(tl, 2.3, 1.1));
  o += teo(540, 1450 + bob(tl, 5), .7, { mood: "happy", aL: 20, aR: -150 + Math.sin(tl * 5) * 10, blink: blinkAt(tl, 2) });
  return o;
}
function sJ(tl, t) {
  const sunY = lerp(1250, 930, easeOut(prog(tl, 0, 5)));
  let o = glow(800, sunY, 420, "yl", .9) + circ(800, sunY, 120, YEL) + circ(800, sunY, 94, "#FCF4E3", .6);
  for (const [x, s] of [[100, 1], [330, 1.4], [600, .9], [860, 1.3], [1010, 1]]) o += `<g transform="translate(${x} 1470) scale(${s})">${rr(-18, -150, 36, 150, 14, "#1d3a40")}${circ(0, -210, 90, "#25454b")}${circ(-40, -170, 60, "#2a5058")}${circ(50, -175, 55, "#2a5058")}</g>`;
  o += rr(0, 1450, W, 500, 0, FOR1);
  o += flame(780, 1290 + Math.sin(t * 8) * 3, 110, t);
  o += teo(330, 1470 + bob(tl, 5), 1.1, { mood: "happy", aL: 20, aR: -85 + Math.sin(tl * 4) * 5, blink: blinkAt(tl, 1) });
  const L = (y, s, c, a) => `<g transform="translate(0 ${f((1 - clamp(pop(tl, a, .5), 0, 1)) * 40)})" opacity="${f(clamp(pop(tl, a, .5), 0, 1))}">${txt(540, y, s, 108, c)}</g>`;
  o += L(430, "VOCÊ SABE", "#fff", .2) + L(555, "ACENDER", YEL, .6) + L(680, "UM FOGO?", YEL, 1.0);
  o += label(540, 780, "E VOCÊ? SOBREVIVERIA?", MAG, 52, 0, pop(tl, 1.8, .45));
  return o;
}

const SCENES = [
  { a: 0, b: 3.4, bg: "night", fn: sA }, { a: 3.4, b: 5.9, bg: "space", fn: sB }, { a: 5.9, b: 10.3, bg: "cyan", fn: sC },
  { a: 10.3, b: 16.9, bg: "space", fn: sD }, { a: 16.9, b: 27.9, bg: "ocean", fn: sE }, { a: 27.9, b: 32.2, bg: "forest", fn: sF },
  { a: 32.2, b: 37.6, bg: "purple", fn: sG }, { a: 37.6, b: 44.2, bg: "cyan", fn: sH }, { a: 44.2, b: 49.8, bg: "cyan", fn: sI },
  { a: 49.8, b: 55, bg: "warm", fn: sJ },
];

function wrap(s, max = 28) {
  const w = s.split(" "), out = []; let cur = "";
  for (const x of w) { if ((cur + " " + x).trim().length > max && cur) { out.push(cur); cur = x; } else cur = (cur + " " + x).trim(); }
  if (cur) out.push(cur);
  return out;
}
function captionSvg(t) {
  const c = CAP().find(c => t >= c.a && t < c.b); if (!c) return "";
  const p = easeOut(prog(t, c.a, .2)), lines = wrap(c.text);
  const st = 'stroke="#090A4E" stroke-width="16" stroke-linejoin="round" paint-order="stroke"';
  return `<g opacity="${f(p)}" transform="translate(0 ${f((1 - p) * 30)})">` + lines.map((l, i) => txt(540, 1545 + i * 66, l, 54, "#fff", "middle", st)).join("") + "</g>";
}

function defs() {
  let d = "<defs>";
  for (const [k, [a, b]] of Object.entries(BGS)) d += `<linearGradient id="bg_${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  for (const [k, c] of Object.entries(GLOWS)) d += `<radialGradient id="g_${k}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  return d + "</defs>";
}

function frame(t) {
  const sc = SCENES.find(s => t >= s.a && t < s.b) || SCENES[SCENES.length - 1], tl = t - sc.a;
  const e = easeOut(prog(tl, 0, .25)), z = 1.05 - .05 * e;
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}">${defs()}<rect width="${W}" height="${H}" fill="url(#bg_${sc.bg})"/>`;
  o += particles(t, PCOL[sc.bg]);
  o += `<g opacity="${f(.15 + .85 * e)}" transform="translate(540 960) scale(${z.toFixed(3)}) translate(-540 -960)">${sc.fn(tl, t)}</g>`;
  if (t >= 8.6 && t < 32.2) o += hud(hudVals(t), easeOut(prog(t, 8.6, .5)) * (1 - prog(t, 31.7, .4)));
  return o + captionSvg(t) + "</svg>";
}
function render(t) { document.getElementById("stage").innerHTML = frame(t); }
