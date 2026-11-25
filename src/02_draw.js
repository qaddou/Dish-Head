// =====================================================================
//  Drawing kit: 1930s rubber-hose primitives, lettering, film effects
// =====================================================================
let X = ctx; // current drawing context (switched while painting backgrounds)
function useCtx(g, fn) { const o = X; X = g; try { fn(); } finally { X = o; } }
const C = {
  ink: '#1b120c', ink2: '#3a2a1e', paper: '#efe0bb', cream: '#fbf1d6', white: '#fffaf0',
  red: '#c8382c', redD: '#8e2219', yellow: '#f4c430', gold: '#e3a623', orange: '#e0782b', brown: '#7a4a2a', brownD: '#4e2e18',
  blue: '#3f6fa8', blueD: '#26476f', teal: '#3c8f8a', green: '#6a9a3b', greenD: '#3f6324', purple: '#6b3f86', purpleD: '#43244f',
  pink: '#ff4fa8', pinkL: '#ffa3d1', gray: '#8b8b86', grayD: '#4f4e4a', skin: '#f5d3a8', glass: '#fff6d8'
};
const FONT_D = "'Ultra','Rockwell Extra Bold','Rockwell','Georgia',serif";
const FONT_M = "'Limelight','Georgia',serif";
const FONT_B = "'Libre Baskerville','Georgia',serif";
function shade(hex, a) {
  let n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  if (a < 0) { r *= 1 + a; g *= 1 + a; b *= 1 + a; } else { r += (255 - r) * a; g += (255 - g) * a; b += (255 - b) * a; }
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

function fillStroke(fill, lw, stroke) {
  if (fill) { X.fillStyle = fill; X.fill(); }
  if (lw) { X.lineWidth = lw; X.strokeStyle = stroke || C.ink; X.stroke(); }
}
function circ(x, y, r, fill, lw = 3, stroke) { X.beginPath(); X.arc(x, y, Math.max(.1, r), 0, TAU); fillStroke(fill, lw, stroke); }
function ell(x, y, rx, ry, rot, fill, lw = 3, stroke) { X.beginPath(); X.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, TAU); fillStroke(fill, lw, stroke); }
function rrect(x, y, w, h, r, fill, lw = 3, stroke) {
  r = Math.min(r, w / 2, h / 2); X.beginPath();
  X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath();
  fillStroke(fill, lw, stroke);
}
function poly(pts, fill, lw = 3, stroke, close = true) {
  X.beginPath(); X.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) X.lineTo(pts[i], pts[i + 1]);
  if (close) X.closePath(); fillStroke(fill, lw, stroke);
}
function blobPoly(pts, fill, lw = 3, stroke) { // smooth closed curve through points
  const n = pts.length / 2; X.beginPath();
  const mx = (i) => (pts[(i % n) * 2] + pts[((i + 1) % n) * 2]) / 2, my = (i) => (pts[(i % n) * 2 + 1] + pts[((i + 1) % n) * 2 + 1]) / 2;
  X.moveTo(mx(0), my(0));
  for (let i = 1; i <= n; i++) X.quadraticCurveTo(pts[(i % n) * 2], pts[(i % n) * 2 + 1], mx(i), my(i));
  X.closePath(); fillStroke(fill, lw, stroke);
}
function line(x1, y1, x2, y2, w = 3, col = C.ink) { X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.lineWidth = w; X.strokeStyle = col; X.stroke(); }
function hose(x1, y1, x2, y2, bend = 0, w = 5, col = C.ink) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
  X.beginPath(); X.moveTo(x1, y1); X.quadraticCurveTo(mx - dy / l * bend, my + dx / l * bend, x2, y2);
  X.lineWidth = w; X.strokeStyle = col; X.stroke();
}
function glove(x, y, r, a = 0, kind = 'open', fill = C.white) {
  X.save(); X.translate(x, y); X.rotate(a);
  if (kind === 'point') {
    rrect(-r * .2, -r * .32, r * 1.55, r * .62, r * .3, fill, 2.5);
    circ(0, 0, r * .82, fill, 2.5);
    line(-r * .2, -r * .15, r * .3, -r * .15, 1.6);
  } else if (kind === 'fist') {
    circ(0, 0, r, fill, 2.5);
    line(r * .1, -r * .55, r * .55, -r * .55, 1.6); line(r * .1, 0, r * .62, 0, 1.6); line(r * .1, r * .5, r * .55, r * .5, 1.6);
  } else {
    for (let i = -1; i <= 1; i++) ell(r * .75, i * r * .45, r * .55, r * .26, i * .35, fill, 2.2);
    ell(r * .1, -r * .85, r * .28, r * .48, -.6, fill, 2.2);
    circ(0, 0, r * .85, fill, 2.5);
  }
  rrect(-r * 1.35, -r * .62, r * .55, r * 1.24, r * .25, fill, 2.5);
  X.restore();
}
function shoe(x, y, dir = 1, s = 1, col = '#5a3420') {
  X.save(); X.translate(x, y); X.scale(dir * s, s);
  X.beginPath(); X.moveTo(-6, -2); X.quadraticCurveTo(-6, -11, 4, -10); X.quadraticCurveTo(17, -9, 17, -3); X.quadraticCurveTo(17, 1, 8, 1); X.lineTo(-6, 1); X.closePath();
  fillStroke(col, 2.5);
  ell(6, -7, 4, 2, -.3, 'rgba(255,255,255,.35)', 0);
  X.restore();
}
// classic "pie-cut" eye
function pieEye(x, y, rx, ry, lx = 0, ly = 0, o = {}) {
  const blink = o.blink || 0;
  if (blink > .85) { hose(x - rx, y + ry * .1, x + rx, y + ry * .1, -ry * .5, 2.6); return; }
  if (o.white !== false) ell(x, y, rx, ry * (1 - blink * .9), 0, o.whiteCol || C.white, 2.4);
  const px = x + lx * rx * .45, py = y + ly * ry * .4 + ry * .1;
  const prx = rx * (o.pupil || .55), pry = ry * (o.pupil || .62) * (1 - blink * .9);
  X.save(); X.beginPath(); X.ellipse(x, y, rx, ry * (1 - blink * .9), 0, 0, TAU); X.clip();
  ell(px, py, prx, pry, 0, o.pupilCol || C.ink, 0);
  if (o.pie !== false) {
    X.beginPath(); X.moveTo(px, py); X.arc(px, py, Math.max(prx, pry) + 1, -1.15, -.5); X.closePath(); X.fillStyle = C.white; X.fill();
  }
  X.restore();
  if (o.lid) { X.save(); X.beginPath(); X.ellipse(x, y, rx, ry, 0, 0, TAU); X.clip(); X.fillStyle = o.lidCol || C.ink; X.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * o.lid + 2); X.restore(); line(x - rx, y - ry + ry * o.lid * 2 - 1, x + rx, y - ry + ry * o.lid * 2 - 1, 2.4); }
  if (o.brow != null) { const b = o.brow; hose(x - rx * 1.1, y - ry * 1.25 + b * 5, x + rx * 1.1, y - ry * 1.25 - b * 5, -3, 3.2); }
}
function xEye(x, y, r) { line(x - r, y - r, x + r, y + r, 3); line(x + r, y - r, x - r, y + r, 3); }
function spiralEye(x, y, r, t) { X.beginPath(); for (let i = 0; i < 40; i++) { const a = i * .45 + t * 8, rr = r * i / 40; i ? X.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : X.moveTo(x, y); } X.lineWidth = 2; X.strokeStyle = C.ink; X.stroke(); }
function star(x, y, r, n = 5, inner = .48, fill = C.yellow, lw = 2.5, rot = -Math.PI / 2) {
  X.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * inner : r; X.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  X.closePath(); fillStroke(fill, lw);
}
function shadowAt(x, y, rx, a = .22) { X.save(); X.globalAlpha *= a; ell(x, y, rx, rx * .22, 0, C.ink, 0); X.restore(); }
function cloudPuff(x, y, s, fill = C.cream, lw = 3) {
  const pts = [[-1, .2, .55], [-.45, -.25, .7], [.25, -.35, .75], [.85, 0, .6], [.3, .3, .6], [-.4, .35, .55]];
  X.beginPath(); for (const p of pts) { X.moveTo(x + p[0] * s + p[2] * s, y + p[1] * s); X.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, TAU); }
  if (lw) { X.lineWidth = lw * 2; X.strokeStyle = C.ink; X.stroke(); }
  X.fillStyle = fill; X.fill();
}
function speedLines(x, y, dir, len, n = 3, col = C.ink) { for (let i = 0; i < n; i++) line(x - dir * (6 + i * 4), y - 14 + i * 12, x - dir * (6 + i * 4 + len), y - 14 + i * 12, 2, col); }

// ---------- lettering ----------
function font(size, f = FONT_D) { return size + 'px ' + f; }
function text(s, x, y, o = {}) {
  const g = X; let sz = o.size || 24; g.font = font(sz, o.font || FONT_D);
  if (o.maxW) while (sz > 8 && g.measureText(s).width > o.maxW) { sz -= 1; g.font = font(sz, o.font || FONT_D); }
  g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  if (o.shadow) { g.fillStyle = o.shadowCol || 'rgba(27,18,12,.6)'; g.fillText(s, x + o.shadow, y + o.shadow); }
  if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || C.ink; g.strokeText(s, x, y); }
  g.fillStyle = o.col || C.ink; g.fillText(s, x, y);
}
function textW(s, size, f = FONT_D) { X.font = font(size, f); return X.measureText(s).width; }
function wavyText(s, x, y, o = {}, t = 0) {
  const size = o.size || 40; X.font = font(size, o.font || FONT_D);
  const ws = []; let tot = 0; for (const ch of s) { const w = X.measureText(ch).width; ws.push(w); tot += w; }
  let cx = x - tot / 2 * (o.align === 'left' ? 0 : 1);
  let i = 0;
  for (const ch of s) {
    const w = ws[i];
    const yy = y + Math.sin(t * (o.speed || 6) + i * .55) * (o.amp ?? 4);
    const rot = Math.sin(t * 3 + i) * (o.rot ?? .03);
    X.save(); X.translate(cx + w / 2, yy); X.rotate(rot);
    text(ch, 0, 0, Object.assign({}, o, { align: 'center' }));
    X.restore(); cx += w; i++;
  }
}
function wrapText(s, x, y, maxW, lh, o = {}) {
  X.font = font(o.size || 16, o.font || FONT_B);
  const words = s.split(' '); let lineS = '', yy = y; const lines = [];
  for (const w of words) { const t = lineS ? lineS + ' ' + w : w; if (X.measureText(t).width > maxW && lineS) { lines.push(lineS); lineS = w; } else lineS = t; }
  if (lineS) lines.push(lineS);
  for (const l of lines) { text(l, x, yy, Object.assign({ font: FONT_B, size: 16 }, o)); yy += lh; }
  return lines.length;
}
// art-deco card frame
function decoCard(x, y, w, h, o = {}) {
  const fill = o.fill || C.cream;
  X.save();
  X.fillStyle = 'rgba(27,18,12,.35)'; rrectPath(x + 6, y + 7, w, h, 10); X.fill();
  rrect(x, y, w, h, 10, fill, 4);
  X.globalAlpha = .9; rrect(x + 8, y + 8, w - 16, h - 16, 6, null, 1.5, o.inner || C.ink2);
  const cs = 12; X.fillStyle = o.accent || C.red;
  for (const [cx, cy] of [[x + 8, y + 8], [x + w - 8, y + 8], [x + 8, y + h - 8], [x + w - 8, y + h - 8]]) { X.beginPath(); X.moveTo(cx, cy - cs / 2); X.lineTo(cx + cs / 2, cy); X.lineTo(cx, cy + cs / 2); X.lineTo(cx - cs / 2, cy); X.closePath(); X.fill(); X.lineWidth = 1.5; X.strokeStyle = C.ink; X.stroke(); }
  X.restore();
}
function rrectPath(x, y, w, h, r) { X.beginPath(); X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath(); }
function pointerGlove(x, y, t) { glove(x + Math.sin(t * 8) * 4, y, 11, 0, 'point'); }
function heartShape(x, y, s, fill = C.red, lw = 2.5) {
  X.beginPath(); X.moveTo(x, y + s * .9);
  X.bezierCurveTo(x - s * 1.4, y + s * .1, x - s * .9, y - s * .9, x, y - s * .3);
  X.bezierCurveTo(x + s * .9, y - s * .9, x + s * 1.4, y + s * .1, x, y + s * .9);
  fillStroke(fill, lw);
}

// ---------- paper & watercolor painting ----------
const Paper = {
  tex: null,
  make() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    const id = g.createImageData(512, 512), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = 200 + Math.random() * 55; d[i] = v; d[i + 1] = v * .96; d[i + 2] = v * .86; d[i + 3] = 255; }
    g.putImageData(id, 0, 0);
    g.globalAlpha = .06; g.strokeStyle = '#5a4630';
    for (let i = 0; i < 900; i++) { g.lineWidth = rnd(.3, 1.2); const x = rnd(512), y = rnd(512), a = rnd(TAU), l = rnd(3, 14); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.globalAlpha = .05; for (let i = 0; i < 60; i++) { g.fillStyle = Math.random() < .5 ? '#7a5a30' : '#ffffff'; g.beginPath(); g.arc(rnd(512), rnd(512), rnd(10, 60), 0, TAU); g.fill(); }
    this.tex = c;
  },
  apply(g, w, h, a = .38) {
    if (!this.tex) this.make();
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a;
    const p = g.createPattern(this.tex, 'repeat'); g.fillStyle = p; g.fillRect(0, 0, w, h);
    g.restore();
  }
};
function wash(g, pathFn, col, o = {}) {
  const passes = o.passes || 4, j = o.jit ?? 2.5;
  g.save();
  for (let i = 0; i < passes; i++) {
    g.save(); g.translate(rnd(-j, j), rnd(-j, j)); g.globalAlpha = o.alpha || .3;
    g.fillStyle = col; g.beginPath(); pathFn(g); g.fill(); g.restore();
  }
  if (o.edge !== false) { g.globalAlpha = o.edgeA || .55; g.strokeStyle = o.edgeCol || shade(col.startsWith('#') ? col : '#555555', -.45); g.lineWidth = o.edgeW || 2; g.beginPath(); pathFn(g); g.stroke(); }
  g.restore();
}
function skyGrad(g, w, h, top, bot) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function blotches(g, w, h, col, n = 30, a = .06) { g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = rnd(a * .4, a); g.beginPath(); g.ellipse(rnd(w), rnd(h), rnd(20, 120), rnd(15, 70), rnd(TAU), 0, TAU); g.fill(); } g.restore(); }
function vignetteOn(g, w, h, a = .45) { const gr = g.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, w * .7); gr.addColorStop(0, 'rgba(40,20,5,0)'); gr.addColorStop(1, 'rgba(40,20,5,' + a + ')'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }

// ---------- film effects ----------
const Film = {
  grains: [], pats: [], vign: null, scratches: [], dust: [], flick: 0, gi: 0,
  init() {
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
      const id = g.createImageData(256, 256), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() * 60; }
      g.putImageData(id, 0, 0); this.grains.push(c); this.pats.push(ctx.createPattern(c, 'repeat'));
    }
    const v = mkCanvas(W, H, 1); const g = v.g;
    const gr = g.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, W * .66);
    gr.addColorStop(0, 'rgba(30,15,0,0)'); gr.addColorStop(.75, 'rgba(30,15,0,.18)'); gr.addColorStop(1, 'rgba(15,6,0,.6)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); this.vign = v;
  },
  update(dt) {
    if (frameNo % 2 === 0) this.gi = (this.gi + 1) % 4;
    this.flick = Math.random() < .08 ? rnd(.02, .06) : this.flick * .8;
    if (Math.random() < .05) this.scratches.push({ x: rnd(W), life: rnd(.08, .5), w: rnd(.6, 1.6), dark: Math.random() < .7, wob: rnd(1, 4) });
    if (Math.random() < .07) this.dust.push({ x: rnd(W), y: rnd(H), life: rnd(.04, .12), r: rnd(1, 3.5), hair: Math.random() < .25, a: rnd(TAU) });
    for (const s of this.scratches) s.life -= dt; this.scratches = this.scratches.filter(s => s.life > 0);
    for (const s of this.dust) s.life -= dt; this.dust = this.dust.filter(s => s.life > 0);
  },
  draw() {
    if (!this.vign) return;
    ctx.save();
    if (Settings.d.grain) {
      ctx.globalAlpha = .55; ctx.fillStyle = this.pats[this.gi];
      ctx.translate(rnd(-60, 0), rnd(-60, 0)); ctx.fillRect(0, 0, W + 60, H + 60); ctx.setTransform(RS, 0, 0, RS, 0, 0);
      ctx.globalAlpha = 1;
      for (const s of this.scratches) { ctx.globalAlpha = .35; ctx.strokeStyle = s.dark ? '#2a1a0a' : '#fff6dc'; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.quadraticCurveTo(s.x + s.wob, H / 2, s.x - s.wob * .5, H); ctx.stroke(); }
      for (const d of this.dust) { ctx.globalAlpha = .5; ctx.fillStyle = ctx.strokeStyle = '#1e1208'; if (d.hair) { ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x + 10, d.y + 6, d.x + Math.cos(d.a) * 22, d.y + Math.sin(d.a) * 22); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill(); } }
      ctx.globalAlpha = this.flick; ctx.fillStyle = '#1a0f05'; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1; ctx.drawImage(this.vign, 0, 0, W, H);
    ctx.restore();
  }
};

// ---------- particles ----------
const FX = {
  list: [],
  clear() { this.list = []; },
  add(p) { p.t = 0; p.life = p.life || .5; p.vx = p.vx || 0; p.vy = p.vy || 0; p.rot = p.rot || 0; p.vr = p.vr || 0; this.list.push(p); if (this.list.length > 700) this.list.splice(0, 50); return p; },
  update(dt) {
    for (const p of this.list) {
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.rot += p.vr * dt;
      if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      if (p.floor && p.y > p.floor) { p.y = p.floor; p.vy *= -.45; p.vx *= .7; }
    }
    this.list = this.list.filter(p => p.t < p.life);
  },
  draw(layer = 0) {
    for (const p of this.list) {
      if ((p.layer || 0) !== layer) continue;
      const k = p.t / p.life; X.save(); X.globalAlpha = p.fade === false ? 1 : clamp(1 - k * k, 0, 1) * (p.a ?? 1);
      switch (p.k) {
        case 'puff': { const r = p.r * (.5 + ease.outQ(Math.min(1, k * 1.6)) * .7); cloudPuff(p.x, p.y, r, p.col || C.cream, p.lw ?? 2); break; }
        case 'ball': circ(p.x, p.y, p.r * (1 - k * .6), p.col || C.cream, p.lw ?? 2); break;
        case 'spark': { const l = p.len || 10; const a = Math.atan2(p.vy, p.vx); line(p.x, p.y, p.x - Math.cos(a) * l, p.y - Math.sin(a) * l, p.w || 3, p.col || C.yellow); break; }
        case 'star': star(p.x, p.y, p.r * (1 - k * .5), 5, .45, p.col || C.yellow, 2, p.rot); break;
        case 'ring': { X.beginPath(); X.arc(p.x, p.y, p.r + (p.grow || 120) * ease.outQ(k), 0, TAU); X.lineWidth = (p.w || 6) * (1 - k); X.strokeStyle = p.col || C.cream; X.stroke(); break; }
        case 'flash': { X.globalAlpha = (1 - k) * (p.a ?? .8); const gr = X.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, p.col || '#fffbe8'); gr.addColorStop(1, 'rgba(255,240,200,0)'); X.fillStyle = gr; X.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); break; }
        case 'confetti': X.translate(p.x, p.y); X.rotate(p.rot); X.scale(1, Math.cos(p.t * 12)); X.fillStyle = p.col; X.fillRect(-4, -2.5, 8, 5); break;
        case 'drop': ell(p.x, p.y, p.r * .8, p.r, 0, p.col || C.gold, 1.5); break;
        case 'text': { const s = 1 + ease.outBack(Math.min(1, k * 4)) * .2; X.translate(p.x, p.y); X.scale(s, s); text(p.s, 0, 0, { size: p.size || 22, col: p.col || C.cream, stroke: 5, font: p.font || FONT_D }); break; }
        case 'debris': X.translate(p.x, p.y); X.rotate(p.rot); if (p.draw) p.draw(p); else rrect(-p.r, -p.r * .6, p.r * 2, p.r * 1.2, 2, p.col || C.gray, 2); break;
        case 'coin': X.translate(p.x, p.y); X.scale(Math.abs(Math.cos(p.t * 10)) + .1, 1); circ(0, 0, p.r || 7, C.gold, 2); break;
        case 'bubble': circ(p.x + Math.sin(p.t * 6 + p.r) * 3, p.y, p.r, 'rgba(220,245,255,.25)', 1.5, '#e8fbff'); break;
        case 'note': text(p.s || '♪', p.x, p.y, { size: p.size || 22, col: p.col || C.ink }); break;
        case 'line': line(p.x, p.y, p.x + p.dx, p.y + p.dy, p.w || 2, p.col || C.ink); break;
        case 'heart': heartShape(p.x, p.y, p.r || 8, p.col || C.red, 2); break;
        case 'fn': p.draw(p, k); break;
      }
      X.restore();
    }
  },
  puffs(x, y, n = 6, s = 14, col, spread = 60) { for (let i = 0; i < n; i++) this.add({ k: 'puff', x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: rnd(-spread, spread), vy: rnd(-spread, spread * .3), r: s * rnd(.7, 1.2), life: rnd(.35, .6), col, drag: 3 }); },
  sparks(x, y, n = 8, col = C.yellow, sp = 380) { for (let i = 0; i < n; i++) { const a = rnd(TAU), v = rnd(sp * .4, sp); this.add({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.15, .35), col, drag: 4, len: rnd(6, 14) }); } },
  stars(x, y, n = 6, col = C.yellow, sp = 260) { for (let i = 0; i < n; i++) { const a = rnd(TAU), v = rnd(sp * .4, sp); this.add({ k: 'star', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: rnd(5, 10), life: rnd(.3, .6), col, vr: rnd(-8, 8), drag: 3 }); } },
  boom(x, y, s = 1, quiet) {
    this.add({ k: 'flash', x, y, r: 90 * s, life: .18 });
    this.add({ k: 'ring', x, y, r: 10 * s, grow: 90 * s, w: 7 * s, life: .35, col: C.cream });
    for (let i = 0; i < 7; i++) { const a = rnd(TAU), v = rnd(60, 200) * s; this.add({ k: 'puff', x: x + Math.cos(a) * 10 * s, y: y + Math.sin(a) * 10 * s, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, r: rnd(14, 24) * s, life: rnd(.45, .8), col: i % 3 === 0 ? '#c9bda4' : C.cream, drag: 4 }); }
    this.sparks(x, y, 8, C.yellow, 420 * s);
    if (!quiet) { Sfx.boom(s); Camera.shake(5 * s, .25); }
  },
  confetti(x, y, n = 30) { const cols = [C.red, C.yellow, C.blue, C.green, C.cream, C.orange]; for (let i = 0; i < n; i++) this.add({ k: 'confetti', x, y, vx: rnd(-260, 260), vy: rnd(-520, -120), g: 700, life: rnd(1, 2), col: pick(cols), vr: rnd(-10, 10), drag: 1.2 }); },
  pop(x, y, s, col = C.cream, size = 22) { this.add({ k: 'text', x, y, s, vy: -60, life: .8, col, size, layer: 1 }); }
};
