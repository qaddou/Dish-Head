// =====================================================================
//  Bosses 5-8: Murkmaw the Deep, Dr. Ampere Voltmeyer, The Iron Wyrm,
//  Baron Von Gloom
// =====================================================================

// ---------------------------------------------------------------- abyss arena
ARENAS.abyss = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#3d7f92', '#0f2c3c');
    blotches(g, w, h, '#000000', 25, .1);
    g.save(); g.globalAlpha = .35; poly([60, 470, 120, 330, 240, 300, 330, 350, 380, 470], '#1d3c48', 0); poly([520, 470, 600, 380, 690, 360, 760, 470], '#1d3c48', 0); g.restore();
    g.save(); g.globalAlpha = .3; rrect(560, 300, 150, 60, 10, '#24343a', 3); line(620, 300, 600, 180, 6, '#24343a'); g.restore();
    const R = mulberry32(9);
    for (let i = 0; i < 14; i++) { const x = R() * w, y = FLOOR - 4; const c = ['#e86a4a', '#f4a0a0', '#e8c060', '#9a7ad0'][Math.floor(R() * 4)]; for (let k = 0; k < 4; k++) hose(x, y, x + (k - 1.5) * 10, y - 20 - R() * 20, (k - 1.5) * 4, 5, c); }
    g.fillStyle = '#c9b27a'; g.fillRect(0, FLOOR, w, h - FLOOR);
    for (let y = FLOOR + 10; y < h; y += 14) { g.beginPath(); for (let x = 0; x <= w; x += 30) g.quadraticCurveTo(x + 15, y + 4, x + 30, y); g.lineWidth = 1.5; g.strokeStyle = 'rgba(90,70,30,.4)'; g.stroke(); }
    line(0, FLOOR, w, FLOOR, 3);
    Paper.apply(g, w, h, .28); vignetteOn(g, w, h, .5);
  },
  live(st, t) {
    X.save(); X.globalAlpha = .12; for (let i = 0; i < 5; i++) { const x = 100 + i * 190 + Math.sin(t * .3 + i) * 40; X.beginPath(); X.moveTo(x, 0); X.lineTo(x + 60, 0); X.lineTo(x - 40 + 120, FLOOR); X.lineTo(x - 140, FLOOR); X.closePath(); X.fillStyle = '#e8fbff'; X.fill(); } X.restore();
    for (let i = 0; i < 6; i++) { const x = 40 + i * 120, sw = Math.sin(t * 1.3 + i) * 18; X.beginPath(); X.moveTo(x, FLOOR); X.quadraticCurveTo(x + sw, FLOOR - 90, x - sw * .5, FLOOR - 170 - (i % 3) * 30); X.lineWidth = 8; X.strokeStyle = C.ink; X.stroke(); X.lineWidth = 5; X.strokeStyle = '#4f8a3a'; X.stroke(); }
    if (frameNo % 9 === 0) FX.add({ k: 'bubble', x: rnd(W), y: FLOOR, vy: -rnd(40, 90), r: rnd(2, 6), life: 6 });
  }
};
// ---------------------------------------------------------------- 5. Murkmaw the Deep
function drTentacle(b) {
  const h = b.h, x = b.x, y0 = FLOOR; if (h < 2) return;
  X.save(); X.translate(x, y0);
  const sw = Math.sin(b.t * 8) * 8;
  X.beginPath(); X.moveTo(-22, 0); X.quadraticCurveTo(-26 + sw, -h * .5, -6 + sw * 1.4, -h); X.quadraticCurveTo(4 + sw * 1.4, -h - 14, 10 + sw, -h + 4); X.quadraticCurveTo(22 + sw, -h * .5, 22, 0); X.closePath(); fillStroke('#7a4a8a', 3.5);
  for (let k = 1; k < 6; k++) { const yy = -h * k / 6; if (yy < -h + 10) break; ell(-10 + sw * (k / 6), yy, 5, 4, 0, '#e8b4d8', 1.5); }
  X.restore();
}
function drInk(b) { X.translate(b.x, b.y); const w = Math.sin(b.t * 8) * 2; blobPoly([-b.r - w, 0, -b.r * .5, -b.r - w, b.r * .5, -b.r + w, b.r + w, 0, b.r * .5, b.r, -b.r * .5, b.r + w], b.pink ? C.pink : '#2a2040', 2.5); circ(-4, -4, 3, 'rgba(255,255,255,.5)', 0); }
function drGlowFish(b) { X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1); const gr = X.createRadialGradient(0, 0, 2, 0, 0, 26); gr.addColorStop(0, 'rgba(160,255,230,.6)'); gr.addColorStop(1, 'rgba(160,255,230,0)'); X.fillStyle = gr; X.fillRect(-26, -26, 52, 52); ell(0, 0, 13, 8, 0, b.pink ? C.pink : '#9ff0d8', 2.2); poly([11, 0, 20, -7, 20, 7], b.pink ? C.pink : '#9ff0d8', 2); circ(-6, -2, 2, C.ink, 0); }
function drTooth(b) { const a = Math.atan2(b.vy, b.vx); X.translate(b.x, b.y); X.rotate(a); poly([12, 0, -8, -7, -8, 7], b.pink ? C.pink : C.white, 2.2); }
function drBubbleH(b) { circ(b.x, b.y, b.r, b.pink ? 'rgba(255,79,168,.7)' : 'rgba(220,245,255,.35)', 2.2, b.pink ? C.pinkD : '#e8fbff'); circ(b.x - b.r * .3, b.y - b.r * .3, b.r * .25, 'rgba(255,255,255,.8)', 0); }
function drSweep(b) { X.save(); X.translate(b.x, b.y); const w = b.w; X.beginPath(); X.moveTo(-w / 2, -b.h / 2); for (let x = -w / 2; x <= w / 2; x += 30) X.lineTo(x, -b.h / 2 + Math.sin(x * .03 + b.t * 6) * 8); X.quadraticCurveTo(-w / 2 - 50, 0, -w / 2, b.h / 2); X.lineTo(w / 2, b.h / 2); X.lineTo(w / 2, -b.h / 2); X.closePath(); X.lineTo(-w / 2, -b.h / 2); fillStroke('#7a4a8a', 4); for (let x = -w / 2 + 20; x < w / 2; x += 40) ell(x, b.h / 2 - 12, 7, 6, 0, '#e8b4d8', 1.5); X.restore(); }
function* deepTentacles(b, n) {
  const p = b.st.target(); const xs = [clamp(p.x, 40, 640)]; for (let i = 1; i < n; i++) xs.push(clamp(rnd(40, 640), 40, 640));
  for (const x of xs) { warnRect(b.st, x, FLOOR - 8, 54, 16, .85, { col: '#c060ff', iy: FLOOR - 40 }); for (let k = 0; k < 4; k++) FX.add({ k: 'bubble', x: x + rnd(-15, 15), y: FLOOR - 4, vy: -rnd(60, 120), r: rnd(3, 6), life: 1.2 }); }
  Sfx.splash(); yield .85;
  for (const x of xs) b.st.bullet({ x, y: FLOOR, w: 46, h: 1, shape: 'rect', dr: drTentacle, keep: true, life: 1.6, hp: 0, upd: (q) => { const T = q.t; const hh = T < .25 ? T / .25 * 290 : T < 1.05 ? 290 : Math.max(0, 290 * (1 - (T - 1.05) / .4)); q.h = Math.max(1, hh); q.y = FLOOR - q.h / 2; if (T > 1.45) q.dead = true; } });
  Camera.shake(3, .2); yield .4;
}
function* deepInk(b) { b.mouthT = .8; for (let i = 0; i < b.cnt(3); i++) { b.st.bullet({ x: 690, y: 300, vx: -120, vy: rnd(-60, 60), r: 15, hp: 4, pink: i === 1, dr: drInk, life: 6, upd: (q, dt, st) => { const p = st.target(q), a = angTo(q.x, q.y, p.x, p.cy), sp = 105 * b.D.spd; q.vx += (Math.cos(a) * sp - q.vx) * dt; q.vy += (Math.sin(a) * sp - q.vy) * dt; } }); Sfx.splash(); yield .4; } }
function* deepFish(b) { for (let k = 0; k < 2; k++) { const y0 = rnd(150, 420); for (let i = 0; i < 5; i++) { b.st.bullet({ x: W + 20 + i * 36, y: y0, y0, ph: i * .6, vx: -210 * b.D.spd, r: 10, glow: 50, dr: drGlowFish, pink: i === 2 && k === 1, upd: q => { q.y = q.y0 + Math.sin(q.t * 3 + q.ph) * 50; } }); } yield 1.4; } }
function* deepLure(b) { b.lureFlash = .5; yield .5; b.ring(b.lx, b.ly, b.cnt(12), 170, { r: 9, col: '#bff8e8', glow: 40 }, rnd(TAU), null, rndi(0, 11)); Sfx.zap(); yield .8; }
function* deepMaw(b) {
  b.mouthT = 3.2; b.pull = 2.8; Sfx.whoosh(); yield .6;
  for (let k = 0; k < 4; k++) { const x = 690, y = 310; b.fan(x, y, b.aimAt(x, y), b.cnt(5), .9, 300, { r: 9, dr: drTooth }, k === 2 ? 2 : -1); Sfx.shoot('spread'); yield .5; }
  yield 1;
}
function* deepBubbles(b) { for (let k = 0; k < 2; k++) { const n = 14, gap = rndi(0, n - 1); b.ring(690, 300, n, 150, { r: 14, dr: drBubbleH }, rnd(TAU), i => Math.abs(i - gap) <= 1 || Math.abs(i - gap) === n - 1, (gap + 6) % n); Sfx.splash(); yield 1.2; } }
function* deepSweep(b) {
  const low = Math.random() < .5, y = low ? FLOOR - 55 : 250, h = low ? 110 : 130;
  warnRect(b.st, W / 2 - 60, y, W - 120, h, 1, { col: '#c060ff', ix: 80, iy: y - h / 2 - 20 }); Sfx.warn(); yield 1;
  b.st.bullet({ x: W + 500, y, w: 900, h: h - 20, shape: 'rect', vx: -900 * b.D.spd, dr: drSweep, margin: 1100, keep: false, life: 3 }); Sfx.whoosh(); Camera.shake(5, .4); yield 1.4;
}
BOSSES.push({
  id: 'deep', name: 'Murkmaw the Deep', title: 'The Underwater Monster', world: 3, stars: 5, hp: 2300, par: 150, song: 'deep', arena: 'abyss', voice: .45, mode: 'water',
  intro: 'GLLRRBBB... a little light snack swims by...', quote: 'BLORP. Delicious.', color: '#3c8f8a',
  setup(st) { st.bounds.r = 690; for (const [x, y, w] of [[170, 360, 120], [420, 290, 110]]) st.solids.push({ x, y, w, h: 18, oneWay: true, draw: s => { blobPoly([s.x, s.y + 8, s.x + 20, s.y - 4, s.x + s.w - 20, s.y - 2, s.x + s.w, s.y + 10, s.x + s.w - 30, s.y + 26, s.x + 30, s.y + 24], '#6a7a7a', 3); } }); },
  init(b) { b.x = 800; b.y = 280; b.mouth = 0; b.mouthT = 0; b.lx = 640; b.ly = 120; b.lureFlash = 0; b.roll = 0; b.pull = 0; },
  phases: [
    { at: 1, name: 'Tentacle Tango', script: function* (b) { while (true) { yield* deepTentacles(b, b.cnt(2)); yield 1; yield* deepInk(b); yield 1.3; yield* deepTentacles(b, b.cnt(3)); yield 1.2; } } },
    { at: .66, name: 'Lights Out Below', trans: 1.8, enter(b) { b.st.darkT = .88; }, script: function* (b) { while (true) { yield* deepFish(b); yield .6; yield* deepLure(b); yield .8; yield* deepTentacles(b, 2); yield 1; } } },
    { at: .36, name: 'The Maw', trans: 1.6, enter(b) { b.st.darkT = 0; }, script: function* (b) { while (true) { yield* deepMaw(b); yield .8; yield* deepBubbles(b); yield .8; yield* deepInk(b); yield 1; } } },
    { at: .13, name: 'Abyssal Fury', trans: 1.6, enter(b) { b.st.darkT = .3; b.rage = true; b.st.tint = { c: '#600020', a: .12 }; }, script: function* (b) { b.run(function* () { while (true) { yield 1.6; b.ring(b.lx, b.ly, b.cnt(14), 160, { r: 9, col: '#ffb0c0', glow: 30 }, rnd(TAU), null, rndi(0, 13)); Sfx.zap(); } }); while (true) { yield* deepSweep(b); yield .5; yield* deepSweep(b); yield .6; yield* deepTentacles(b, 2); yield .8; } } }
  ],
  update(b, dt) {
    if (b.mouthT > 0) { b.mouthT -= dt; b.mouth = Math.min(1, b.mouth + dt * 4); } else b.mouth = Math.max(0, b.mouth - dt * 3);
    if (b.lureFlash > 0) b.lureFlash -= dt;
    if (b.pull > 0) { b.pull -= dt; for (const p of b.st.alive()) p.x += 115 * dt; if (frameNo % 2 === 0) FX.add({ k: 'line', x: rnd(0, 650), y: rnd(120, 460), dx: 30, dy: 0, life: .2, col: '#bfe8ff', w: 2 }); }
    const bob = Math.sin(b.t * 1.2) * 10; b.bob = bob;
    b.lx = 640 + Math.sin(b.t * 1.7) * 18; b.ly = 120 + bob + Math.cos(b.t * 2.1) * 10;
    b.st.lights.push({ x: b.lx, y: b.ly, r: 170 + (b.lureFlash > 0 ? 160 : 0) });
    if (b.rage) b.st.lights.push({ x: 760, y: 200 + bob, r: 80 });
    b.hurt = [{ x: 780, y: 270 + bob, r: 105 }]; b.hit = [{ x: 830, y: 300 + bob, r: 130 }];
    if (b.dead) { b.roll = Math.min(Math.PI, b.roll + dt * 1.5); b.y -= 20 * dt; b.st.darkT = 0; b.st.dark *= .9; }
  },
  draw(b) {
    const t = b.t, bob = (b.bob || 0) + (b.dead ? (b.y - 280) : 0);
    X.save(); X.translate(840, 290 + bob); if (b.dead) X.rotate(b.roll * .25); X.translate(-840, -290);
    // tentacles below (decor)
    for (let i = 0; i < 4; i++) { const x = 760 + i * 50, sw = Math.sin(t * 2 + i) * 20; X.beginPath(); X.moveTo(x - 14, 400); X.quadraticCurveTo(x + sw, 470, x + sw * 1.5 - 10, 545); X.lineTo(x + sw * 1.5 + 10, 545); X.quadraticCurveTo(x + sw + 20, 470, x + 14, 400); X.closePath(); fillStroke('#5a3a6a', 3); }
    // dorsal fin
    poly([780, 140, 810, 70, 840, 130, 880, 60, 900, 140], '#2a4a52', 3);
    // body
    ell(870, 290, 200, 175, 0, '#2c5a5a', 4.5);
    ell(880, 380, 150, 70, 0, '#5a8a7a', 0);
    for (const [x, y, r] of [[930, 200, 14], [980, 260, 10], [900, 240, 8], [960, 330, 12]]) circ(x, y, r, '#3f7a74', 0);
    // side fin
    X.save(); X.translate(940, 300); X.rotate(Math.sin(t * 3) * .2); poly([0, 0, 60, -40, 70, 10, 50, 40], '#2a4a52', 3); X.restore();
    // mouth
    const m = b.mouth, my = 310, mx = 700;
    X.beginPath(); X.moveTo(mx - 20, my - 30 - m * 50); X.quadraticCurveTo(mx + 80, my - 20 - m * 50, mx + 150, my - 10); X.quadraticCurveTo(mx + 80, my + 30 + m * 40, mx - 10, my + 20 + m * 40); X.closePath(); fillStroke('#4a1020', 4);
    if (m > .1) { const gr = X.createRadialGradient(mx + 60, my, 5, mx + 60, my, 80); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(mx - 20, my - 80, 170, 160); }
    for (let i = 0; i < 7; i++) { const tx = mx - 5 + i * 22; poly([tx, my - 26 - m * 46 + i * 2, tx + 10, my - 6 - m * 30 + i * 2, tx + 18, my - 24 - m * 44 + i * 2], C.white, 2); poly([tx + 4, my + 18 + m * 36 - i * 2, tx + 12, my - 2 + m * 20 - i * 2, tx + 20, my + 18 + m * 34 - i * 2], C.white, 2); }
    // eyes
    if (b.dead) { xEye(770, 200, 18); xEye(835, 190, 10); }
    else {
      pieEye(770, 200, 30, 34, -.8, .3, { pupilCol: b.rage ? '#a01020' : C.ink, brow: b.rage ? 1.6 : .4 });
      pieEye(838, 190, 14, 16, -.8, .3, { pupilCol: b.rage ? '#a01020' : C.ink });
    }
    // lure
    hose(800, 130, b.lx, b.ly, -40, 6, '#2a4a52');
    if (!b.dead || b.deadT < .6) {
      const f = b.lureFlash > 0 ? 1.6 : 1; const gr = X.createRadialGradient(b.lx, b.ly, 2, b.lx, b.ly, 50 * f); gr.addColorStop(0, 'rgba(255,240,160,.9)'); gr.addColorStop(1, 'rgba(255,240,160,0)'); X.fillStyle = gr; X.fillRect(b.lx - 60 * f, b.ly - 60 * f, 120 * f, 120 * f);
      drawBulbIcon(b.lx, b.ly, 14, true);
    }
    X.restore();
    if (b.dead && b.deadT > .6) { const k = b.deadT - .6; drawBulbIcon(640 + k * 40, 120 - k * 90, 14, true); }
  }
});

// ---------------------------------------------------------------- lab arena
ARENAS.lab = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#4a2e28', '#2e1c18');
    for (let y = 0; y < FLOOR; y += 22) for (let x = (y / 22 % 2) * 22 - 22; x < w; x += 44) { g.fillStyle = (x * y) % 3 ? 'rgba(140,70,50,.35)' : 'rgba(110,50,40,.35)'; g.fillRect(x + 2, y + 2, 40, 18); }
    blotches(g, w, FLOOR, '#000000', 16, .15);
    // arched window
    g.save(); rrect(360, 60, 240, 230, 110, '#24304a', 6); g.restore();
    line(480, 60, 480, 290, 5); line(360, 180, 600, 180, 5);
    // shelves
    for (const [x, y] of [[60, 140], [60, 230], [700, 150], [700, 240]]) { rrect(x, y, 190, 10, 2, '#6a4428', 2.5); for (let i = 0; i < 5; i++) { const cx = x + 20 + i * 36, c = ['#7ae0a0', '#e86a4a', '#9a7ad0', '#f2c230', '#6ac0f0'][i]; rrect(cx - 9, y - 30, 18, 30, 5, c, 2.2); rrect(cx - 5, y - 38, 10, 8, 2, '#c8b89a', 2); } }
    // pipes
    line(0, 330, w, 330, 14, C.ink); line(0, 330, w, 330, 9, '#9a7a4a'); for (let x = 40; x < w; x += 140) rrect(x, 320, 14, 20, 3, '#c9a35a', 2);
    g.fillStyle = '#4e4e56'; g.fillRect(0, FLOOR, w, h - FLOOR);
    for (let x = 0; x < w; x += 80) { line(x, FLOOR, x, h, 2, '#2a2a30'); circ(x + 8, FLOOR + 10, 2.5, '#9a9aa4', 1); circ(x + 72, FLOOR + 10, 2.5, '#9a9aa4', 1); }
    line(0, FLOOR, w, FLOOR, 3);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .45);
  },
  live(st, t) {
    const fl = (Math.sin(t * 1.3) > .97 || Math.random() < .004);
    X.save(); X.beginPath(); rrectPath(366, 66, 228, 218, 104); X.clip(); X.fillStyle = fl ? '#d8e4ff' : '#24304a'; X.fillRect(366, 66, 228, 218);
    if (fl) { X.beginPath(); X.moveTo(440, 66); X.lineTo(470, 140); X.lineTo(450, 150); X.lineTo(490, 284); X.lineWidth = 4; X.strokeStyle = '#ffffff'; X.stroke(); }
    X.restore(); rrect(360, 60, 240, 230, 110, null, 6); line(480, 60, 480, 290, 5); line(360, 180, 600, 180, 5);
    for (const x of [26, W - 26]) { rrect(x - 14, 200, 28, 270, 4, '#6a6a72', 3); for (let i = 0; i < 8; i++) ell(x, 220 + i * 30, 20, 6, 0, '#c9a35a', 2.2); circ(x, 190, 18, '#9aa0ae', 3); if (Math.random() < .3) { X.beginPath(); X.moveTo(x, 190); for (let k = 0; k < 4; k++) X.lineTo(x + rnd(-30, 30), 190 - k * 12 - rnd(4, 10)); X.lineWidth = 2; X.strokeStyle = '#bfe8ff'; X.stroke(); } }
    if (st.convey) { X.save(); X.globalAlpha = .55; const d = Math.sign(st.convey); for (let x = 0; x < W; x += 60) { const xx = ((x + t * st.convey) % W + W) % W; poly([xx, FLOOR + 22, xx + d * 16, FLOOR + 30, xx, FLOOR + 38], C.yellow, 2); } X.restore(); }
  }
};
// ---------------------------------------------------------------- 6. Dr. Ampere Voltmeyer
function drFlask(b) { X.translate(b.x, b.y); X.rotate(b.t * 9); const c = b.pink ? C.pink : b.col || '#7ae0a0'; X.beginPath(); X.moveTo(-4, -14); X.lineTo(-4, -4); X.lineTo(-12, 10); X.quadraticCurveTo(0, 16, 12, 10); X.lineTo(4, -4); X.lineTo(4, -14); X.closePath(); fillStroke('rgba(230,245,255,.85)', 2.2); X.beginPath(); X.moveTo(-9, 4); X.lineTo(-12, 10); X.quadraticCurveTo(0, 16, 12, 10); X.lineTo(9, 4); X.closePath(); fillStroke(c, 0); rrect(-5, -18, 10, 5, 2, '#c8b89a', 1.6); }
function drPuddle(b) { X.save(); X.globalAlpha *= Math.min(1, (b.life - b.t) * 2); ell(b.x, b.y + 4, b.w / 2, 8, 0, '#6ad08a', 2.5); for (let i = 0; i < 3; i++) circ(b.x - 20 + i * 20, b.y - 2 - ((b.t * 30 + i * 9) % 14), 3, '#a8f0c0', 1.5); X.restore(); }
function drZap(b) { const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2; X.save(); X.fillStyle = 'rgba(160,220,255,.35)'; X.fillRect(x0, b.y - b.h / 2 - 6, b.w, b.h + 12); for (let k = 0; k < 2; k++) { X.beginPath(); X.moveTo(x0, b.y); for (let x = x0; x <= x1; x += 24) X.lineTo(x, b.y + rnd(-b.h / 2, b.h / 2)); X.lineWidth = k ? 2 : 6; X.strokeStyle = k ? C.white : '#7ac8ff'; X.stroke(); } X.restore(); }
function drEorb(b) { const gr = X.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 2); gr.addColorStop(0, 'rgba(180,230,255,.8)'); gr.addColorStop(1, 'rgba(180,230,255,0)'); X.fillStyle = gr; X.fillRect(b.x - b.r * 2, b.y - b.r * 2, b.r * 4, b.r * 4); circ(b.x, b.y, b.r, b.pink ? C.pink : '#dff4ff', 2.5); X.beginPath(); for (let i = 0; i < 3; i++) { const a = b.t * 10 + i * 2; X.moveTo(b.x, b.y); X.lineTo(b.x + Math.cos(a) * b.r * 1.6, b.y + Math.sin(a) * b.r * 1.6); } X.lineWidth = 1.5; X.strokeStyle = '#3b8fd0'; X.stroke(); }
function drFist(b) { X.save(); X.translate(b.x, b.y); line(b.w / 2, 0, b.w / 2 + 400, 0, 8, '#6a6a72'); for (let i = 0; i < 6; i++) circ(b.w / 2 + 20 + i * 40, 0, 6, '#9aa0ae', 2); rrect(-b.w / 2, -b.h / 2, b.w, b.h, 10, '#9aa0ae', 3.5); for (let i = 0; i < 3; i++) line(-b.w / 2 + 8, -b.h / 2 + 10 + i * (b.h - 20) / 2, -b.w / 2 + 26, -b.h / 2 + 10 + i * (b.h - 20) / 2, 2.5); circ(b.w / 2 - 10, 0, 5, C.red, 2); X.restore(); }
function drLaser(b) { X.save(); X.globalAlpha *= .9; line(b.x1, b.y1, b.x2, b.y2, b.w + 8, 'rgba(255,80,80,.5)'); line(b.x1, b.y1, b.x2, b.y2, b.w * .5, '#ffe0e0'); X.restore(); }
function drRivet(b) { circ(b.x, b.y, b.r, b.pink ? C.pink : '#bfc4cc', 2.2); circ(b.x, b.y, b.r * .4, '#6a6a72', 0); }
function drPanel(b) { X.save(); X.fillStyle = 'rgba(160,220,255,.5)'; X.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); for (let k = 0; k < 3; k++) { X.beginPath(); X.moveTo(b.x - b.w / 2, b.y + b.h / 2); for (let x = b.x - b.w / 2; x <= b.x + b.w / 2; x += 16) X.lineTo(x, b.y + b.h / 2 - rnd(0, b.h)); X.lineWidth = 2; X.strokeStyle = k ? C.white : '#3b8fd0'; X.stroke(); } X.restore(); }
function drStrike(b) { X.save(); const x = b.x; X.fillStyle = 'rgba(200,230,255,.4)'; X.fillRect(x - b.w / 2, 0, b.w, FLOOR); X.beginPath(); X.moveTo(x, 0); let y = 0, xx = x; while (y < FLOOR) { y += rnd(30, 60); xx = x + rnd(-18, 18); X.lineTo(xx, Math.min(y, FLOOR)); } X.lineWidth = 7; X.strokeStyle = '#7ac8ff'; X.stroke(); X.lineWidth = 3; X.strokeStyle = C.white; X.stroke(); X.restore(); }
function* docFlasks(b) { b.setPose('throw', .5); for (let i = 0; i < b.cnt(3); i++) { const p = b.st.target(), tx = clamp(p.x + rnd(-50, 50), 30, 700); const pk = i === 1; b.lob(b.x - 30, b.y - 60, tx, FLOOR - 8, 1, { r: 12, g: 900, dr: drFlask, col: pick(['#7ae0a0', '#9a7ad0', '#f2c230']), pink: pk, floorDie: true, onFloor: (q, st) => { Sfx.splash(); FX.puffs(q.x, FLOOR - 8, 3, 9, '#a8f0c0'); if (!q.pink) st.bullet({ x: q.x, y: FLOOR - 7, w: 84, h: 14, shape: 'rect', dr: drPuddle, life: 2.2, keep: true, under: true }); } }); Sfx.whoosh(); yield .45; } }
function* docTesla(b) {
  for (let k = 0; k < b.cnt(2); k++) {
    const low = Math.random() < .55, y = low ? FLOOR - 18 : FLOOR - 82, h = low ? 36 : 28;
    warnRect(b.st, W / 2, y, W - 60, h, .9, { col: '#7ac8ff', ix: 60, iy: y - 30 }); Sfx.warn(); yield .9;
    b.st.bullet({ x: W / 2, y, w: W - 50, h, shape: 'rect', dr: drZap, life: .38, keep: true }); Sfx.zap(); Camera.shake(4, .2); yield .7;
  }
}
function* docRivets(b) { for (let i = 0; i < 3; i++) { const x = b.x - 60, y = b.y - 150; b.fan(x, y, b.aimAt(x, y), b.cnt(3), .4, 380, { r: 8, dr: drRivet }, i === 1 ? 1 : -1); Sfx.shoot('spark'); yield .35; } }
function* docFist(b) {
  const low = Math.random() < .5, y = low ? FLOOR - 20 : FLOOR - 50, h = low ? 40 : 30;
  b.fistCharge = 1; warnRect(b.st, 380, y, 700, h, .8, { col: '#ff6040', ix: 80, iy: y - 32 }); Sfx.warn(); yield .8;
  b.fistOut = true; Sfx.boom(.6); Camera.shake(5, .2);
  const f = b.st.bullet({ x: 700, y, w: 70, h, shape: 'rect', vx: -1100 * b.D.spd, dr: drFist, keep: true, life: 3, upd: q => { if (q.x < 60 && q.vx < 0) { q.vx = 0; q.back = q.t; Camera.shake(4, .15); Sfx.thud(); } if (q.back && q.t - q.back > .35) q.vx = 900; if (q.vx > 0 && q.x > 720) { q.dead = true; } } });
  b.fistCharge = 0; yield 1.4; b.fistOut = false;
}
function* docLaser(b) {
  const ex = b.x - 10, ey = b.y - 250; const p = b.st.target(); const a = angTo(ex, ey, p.x, p.cy); const L = 1200;
  const w = warnLine(b.st, ex, ey, ex + Math.cos(a) * L, ey + Math.sin(a) * L, .8, { col: '#ff4040', lw: 3 }); Sfx.warn(); yield .8;
  b.st.bullet({ shape: 'line', x: ex, y: ey, x1: ex, y1: ey, x2: ex + Math.cos(a) * L, y2: ey + Math.sin(a) * L, w: 20, dr: drLaser, life: .38, keep: true }); Sfx.zap(); yield .6;
}
function* docPanels(b) {
  const odd = Math.random() < .5; const xs = []; for (let i = 0; i < 6; i++) if ((i % 2 === 0) === odd) xs.push(60 + i * 120);
  for (const x of xs) warnRect(b.st, x, FLOOR - 12, 116, 24, .9, { col: '#ffe040', iy: FLOOR - 40 }); Sfx.warn(); yield .9;
  for (const x of xs) b.st.bullet({ x, y: FLOOR - 14, w: 116, h: 28, shape: 'rect', dr: drPanel, life: 1.1, keep: true, under: true }); Sfx.zap(); yield 1.2;
}
function* docPsy(b) { for (let k = 0; k < 2; k++) { const n = 16, gap = rndi(0, n - 1); b.ring(b.x, b.y - 110, n, 150, { r: 9, col: '#e0b0ff', glowC: 'rgba(220,170,255,.6)' }, rnd(TAU), i => Math.abs(i - gap) <= 1, (gap + 8) % n); Sfx.zap(); yield 1; } }
function* docOrbs(b) {
  const orbs = []; for (let i = 0; i < b.cnt(4); i++) orbs.push(b.st.bullet({ x: b.x, y: b.y - 110, r: 12, dr: drEorb, pink: i === 2, keep: true, life: 7, a: i * TAU / b.cnt(4), upd: (q, dt) => { if (!q.go) { q.a += dt * 3; q.x = b.x + Math.cos(q.a) * 80; q.y = b.y - 110 + Math.sin(q.a) * 80; } } }));
  yield 1.4; for (const o of orbs) { if (o.dead) continue; const p = b.st.target(o), a = angTo(o.x, o.y, p.x, p.cy); o.go = true; o.keep = false; o.vx = Math.cos(a) * 330 * b.D.spd; o.vy = Math.sin(a) * 330 * b.D.spd; Sfx.zap(); yield .35; }
}
function* docStrikes(b) { for (let i = 0; i < b.cnt(4); i++) { const p = b.st.target(), x = clamp(p.x, 30, W - 30); warnRect(b.st, x, FLOOR / 2, 60, FLOOR, .7, { col: '#7ac8ff', iy: 40 }); yield .7; b.st.bullet({ x, y: FLOOR / 2, w: 50, h: FLOOR, shape: 'rect', dr: drStrike, life: .3, keep: true }); Sfx.zap(); Camera.shake(5, .2); b.st.flash = .08; yield .25; } }
BOSSES.push({
  id: 'doc', name: 'Dr. Ampere Voltmeyer', title: 'The Mad Scientist', world: 4, stars: 6, hp: 2500, par: 160, song: 'doc', arena: 'lab', voice: 1.2,
  intro: 'Mwa-ha-ha! You shall be my GREATEST experiment!', quote: 'Fascinating! Let\'s try that again, ja?', color: '#3b8fd0',
  setup(st) { st.bounds = { l: 48, r: W - 48 }; },
  init(b) { b.x = 790; b.y = 330; b.mode = 'console'; b.robot = false; b.float = false; b.brain = 0; b.fistCharge = 0; b.fistOut = false; },
  phases: [
    { at: 1, name: 'Experiment No. 1', script: function* (b) { while (true) { yield* docFlasks(b); yield 1; yield* docTesla(b); yield .8; yield* docRivets(b); yield 1; } } },
    {
      at: .66, name: 'Frankenbolt!', trans: 2.2,
      enter(b, instant) { const go = () => { b.robot = true; b.x = 790; b.y = FLOOR; }; if (instant) { go(); return; } b.run(function* () { b.setPose('laugh', 1); yield .6; FX.boom(790, 300, 1); go(); Camera.shake(10, .5); }); },
      script: function* (b) { b.run(function* () { let d = 1; while (true) { b.st.convey = 0; yield .8; d = -d; b.st.convey = 85 * d * b.D.spd; Sfx.warn(); yield 5.5; } }); while (true) { yield* docFist(b); yield .5; yield* docLaser(b); yield .4; yield* docFist(b); yield .6; yield* docRivets(b); yield .8; } }
    },
    {
      at: .36, name: 'Mind Over Matter', trans: 2,
      enter(b, instant) { b.st.convey = 0; const go = () => { b.robot = false; b.float = true; b.x = 770; b.y = 330; }; if (instant) { go(); return; } b.run(function* () { FX.boom(790, 350, 1.4); FX.boom(760, 250, 1); yield .2; go(); for (let i = 0; i < 8; i++) FX.add({ k: 'debris', x: 790, y: 330, vx: rnd(-300, 300), vy: rnd(-600, -200), g: 1200, r: rnd(8, 16), col: '#9aa0ae', vr: rnd(-8, 8), life: 1.6, floor: FLOOR }); }); },
      script: function* (b) { while (true) { yield* docPanels(b); yield .3; yield* docPsy(b); yield .6; yield* docPanels(b); yield .3; yield* docOrbs(b); yield .8; } }
    },
    { at: .13, name: 'Overload', trans: 1.8, enter(b) { b.float = true; b.robot = false; b.brainBig = true; b.st.tint = { c: '#3060ff', a: .08 }; }, script: function* (b) { b.run(function* () { let a = 0; while (true) { for (let i = 0; i < 3; i++) b.shot(b.x, b.y - 150, a + i * TAU / 3, 160, { r: 9, col: '#e0b0ff', pink: Math.random() < .04 }); a += .24; yield .22; } }); while (true) { yield* docStrikes(b); yield 1; } } }
  ],
  update(b, dt) {
    if (b.float && !b.dead) { b.x = 770 + Math.sin(b.t * .8) * 40; b.y = 330 + Math.sin(b.t * 1.6) * 30; }
    if (b.brainBig) b.brain = Math.min(1, b.brain + dt);
    if (b.robot) { b.hurt = [{ x: b.x, y: b.y - 150, r: 80 }, { x: b.x - 10, y: b.y - 270, r: 40 }]; b.hit = [{ x: b.x, y: b.y - 120, r: 70 }]; }
    else { b.hurt = [{ x: b.x, y: b.y - 50, r: 36 }, { x: b.x, y: b.y - 110 - b.brain * 30, r: 34 + b.brain * 30 }]; b.hit = b.float ? [{ x: b.x, y: b.y - 60, r: 26 }] : []; }
    if (b.dead) { b.y = Math.min(FLOOR, b.y + 400 * dt); b.float = false; }
  },
  draw(b) {
    const t = b.t;
    if (b.robot && !b.dead) this.drawRobot(b);
    else {
      if (b.mode === 'console' && !b.float && !b.dead) { X.save(); X.translate(b.x, b.y); rrect(-70, 0, 140, 40, 8, '#6a6a72', 3.5); for (let i = 0; i < 4; i++) circ(-45 + i * 30, 20, 7, ['#e86a4a', '#7ae0a0', '#f2c230', '#6ac0f0'][i], 2); for (let i = 0; i < 3; i++) { const fl = Math.sin(t * 20 + i) * 6; poly([-40 + i * 40, 40, -48 + i * 40, 58 + fl, -32 + i * 40, 58 + fl], '#ffb040', 2); } X.restore(); }
      this.drawDoc(b, b.x, b.y);
    }
  },
  drawDoc(b, x, y) {
    const t = b.t; X.save(); X.translate(x, y);
    const bob = Math.sin(t * 5) * 2;
    if (b.float && !b.dead) { X.save(); X.globalAlpha = .4; ell(0, 6, 30, 6, 0, '#bfe8ff', 0); X.restore(); }
    // legs
    hose(-8, -26, -12, -2, 4, 5); hose(8, -26, 12, -2, -4, 5); shoe(-12, 0, -1, 1.1, C.ink); shoe(12, 0, 1, 1.1, C.ink);
    // coat
    poly([-20, -80 + bob, 20, -80 + bob, 28, -20, -28, -20], C.white, 3); line(0, -80 + bob, 0, -22, 2);
    rrect(-8, -76 + bob, 16, 20, 3, '#5a8ab0', 2);
    // arms
    const thr = b.pose === 'throw', laugh = b.pose === 'laugh';
    const ha = thr ? [-44, -110] : laugh ? [-30, -96 + Math.sin(t * 24) * 4] : [-34, -60 + bob];
    hose(-16, -74 + bob, ha[0], ha[1], 6, 5); glove(ha[0], ha[1], 7, Math.PI, 'open', '#f2c230');
    if (thr) drFlask({ x: ha[0] - 6, y: ha[1] - 14, t: 0 });
    hose(16, -74 + bob, 34, -60 + bob, -6, 5); glove(34, -60 + bob, 7, .3, 'open', '#f2c230');
    // head
    const hy = -104 + bob;
    if (b.dead) { // soot and afro
      for (let i = 0; i < 9; i++) circ(-24 + (i % 5) * 12, hy - 22 - Math.floor(i / 5) * 12, 14, '#2a2420', 2);
      circ(0, hy, 22, '#5a4a40', 3); xEye(-8, hy - 2, 5); xEye(8, hy - 2, 5);
      if (frameNo % 20 === 0) FX.add({ k: 'puff', x: x + rnd(-20, 20), y: y + hy - 40, vy: -40, r: 8, life: 1, col: '#6a6060' });
      X.restore(); return;
    }
    // wild hair
    const hair = b.brainBig ? 0 : 1;
    if (hair) for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; cloudPuff(Math.cos(a) * 22, hy + Math.sin(a) * 20 - 4, 10 + Math.sin(t * 6 + i) * 1.5, C.white, 1.6); }
    if (b.brain > 0) { const s = 1 + b.brain * 1.4, by = hy - 18 - b.brain * 26; X.save(); X.translate(0, by); X.scale(s, s); blobPoly([-24, 4, -26, -12, -14, -24, 0, -26, 14, -24, 26, -12, 24, 4, 0, 10], '#f0a0b8', 2.5); for (const [x1, y1, x2, y2] of [[-14, -18, -6, -4], [0, -24, 2, -6], [12, -18, 6, -2], [-20, -6, -8, 2], [20, -6, 10, 2]]) hose(x1, y1, x2, y2, 4, 1.6, '#a05070'); X.restore(); if (Math.random() < .3) { X.beginPath(); let px = rnd(-30, 30) * s, py = by - 20; X.moveTo(px, py); for (let k = 0; k < 4; k++) { px += rnd(-14, 14); py -= rnd(6, 14); X.lineTo(px, py); } X.lineWidth = 2; X.strokeStyle = '#bfe8ff'; X.stroke(); } }
    circ(0, hy, 22, '#f2d0b0', 3);
    if (b.float) { rrect(-20, hy - 20, 40, 8, 3, '#9aa0ae', 2); line(-12, hy - 20, -18, hy - 40, 2); line(12, hy - 20, 18, hy - 40, 2); circ(-18, hy - 42, 4, C.red, 1.5); circ(18, hy - 42, 4, C.red, 1.5); }
    else { rrect(-20, hy - 18, 40, 9, 4, '#7a5a3a', 2); circ(-9, hy - 14, 6, '#bfe8ff', 2); circ(9, hy - 14, 6, '#bfe8ff', 2); }
    circ(-8, hy - 1, 7, '#e8f6ff', 2.5); circ(8, hy - 1, 7, '#e8f6ff', 2.5); line(-1, hy - 1, 1, hy - 1, 2);
    pieEye(-8, hy - 1, 4, 5, -.5, 0, { white: false }); pieEye(8, hy - 1, 4, 5, -.5, 0, { white: false });
    X.beginPath(); X.moveTo(-12, hy + 9); X.quadraticCurveTo(0, hy + 5, 12, hy + 9); X.lineWidth = 4; X.strokeStyle = C.white; X.stroke(); X.lineWidth = 1.5; X.strokeStyle = C.ink; X.stroke();
    X.beginPath(); X.arc(0, hy + 12, 7, 0, Math.PI); X.closePath(); fillStroke(laugh ? '#5a1a12' : C.white, 2); if (!laugh) rrect(-2, hy + 12, 4, 3, 1, C.ink, 0);
    X.restore();
  },
  drawRobot(b) {
    const t = b.t, x = b.x, y = b.y, st = Math.sin(t * 3) * 3;
    X.save(); X.translate(x, y);
    for (const sx of [-1, 1]) { rrect(sx * 44 - 16, -70, 32, 64, 6, '#6a6a72', 3); rrect(sx * 44 - 28, -12, 56, 14, 4, '#4a4a52', 3); }
    // boiler body
    rrect(-80, -240 + st, 160, 180, 22, '#8a8e98', 4);
    for (let i = 0; i < 3; i++) line(-80, -200 + i * 50 + st, 80, -200 + i * 50 + st, 3, '#5a5e68');
    for (let i = 0; i < 7; i++) { circ(-70 + i * 23, -232 + st, 3, '#c0c4cc', 1.5); circ(-70 + i * 23, -70 + st, 3, '#c0c4cc', 1.5); }
    rrect(-30, -160 + st, 60, 40, 6, '#3a2a20', 3); const fl = .6 + Math.sin(t * 14) * .3; X.save(); X.globalAlpha = fl; rrect(-24, -154 + st, 48, 28, 4, '#ff9040', 0); X.restore();
    // stack
    rrect(40, -290 + st, 22, 60, 3, '#5a5e68', 3); if (frameNo % 6 === 0) FX.add({ k: 'puff', x: x + 51, y: y - 300, vy: -60, vx: 20, r: 10, life: 1.2, col: '#d0ccc4' });
    // arms
    const ch = b.fistCharge; const ax = -100 - ch * 14;
    hose(-70, -200 + st, ax, -140, 14, 14, '#5a5e68'); hose(-70, -200 + st, ax, -140, 14, 9, '#9aa0ae');
    if (!b.fistOut) { rrect(ax - 34, -160, 40, 40, 10, '#9aa0ae', 3.5); if (ch) { X.save(); X.globalAlpha = .5 + Math.sin(t * 30) * .3; circ(ax - 14, -140, 30, '#ff6040', 0); X.restore(); } }
    hose(70, -200 + st, 104, -130, -14, 14, '#5a5e68'); hose(70, -200 + st, 104, -130, -14, 9, '#9aa0ae'); rrect(88, -140, 36, 36, 10, '#9aa0ae', 3.5);
    // dome with doctor
    X.save(); X.translate(0, -240 + st);
    X.beginPath(); X.arc(0, 0, 54, Math.PI, 0); X.closePath(); fillStroke('rgba(200,235,255,.35)', 4);
    X.restore();
    X.restore();
    this.drawDoc(b, x, y - 240 + st + 6 + 30);
    X.save(); X.translate(x, y - 240 + st); X.beginPath(); X.arc(0, 0, 54, Math.PI, 0); X.closePath(); X.fillStyle = 'rgba(220,245,255,.18)'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); ell(-24, -30, 8, 16, .5, 'rgba(255,255,255,.5)', 0);
    circ(-10, 10, 14, '#ffd0d0', 3); circ(-10, 10, 6, C.red, 0);
    X.restore();
  }
});

// ---------------------------------------------------------------- sky arena (auto-scroll)
ARENAS.sky = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#e6b77e', '#8c96a8');
    g.save(); g.globalAlpha = .45; circ(760, 120, 70, '#fff0c0', 0); g.restore();
    blotches(g, w, h, '#ffffff', 16, .1);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .35);
  },
  live(st, t) {
    const sp = t * 40; X.save(); X.globalAlpha = .55;
    for (let i = 0; i < 5; i++) { const x = ((i * 260 - sp * .6) % 1300 + 1300) % 1300 - 160; cloudPuff(x, 90 + (i % 3) * 60, 34, '#f8eedc', 2); }
    X.restore();
    // far city
    X.save(); X.fillStyle = '#6a6470';
    for (let i = 0; i < 14; i++) { const x = ((i * 90 - sp * 1.2) % 1260 + 1260) % 1260 - 150, hh = 60 + (i * 37 % 70); X.fillRect(x, H - hh, 70, hh); if (i % 3 === 0) { X.fillRect(x + 20, H - hh - 60, 14, 60); if (frameNo % 10 === i % 10) FX.add({ k: 'puff', x: x + 27, y: H - hh - 64, vx: -60, vy: -30, r: 12, life: 1.5, col: '#a8a098', lw: 0, a: .55 }); } }
    X.restore();
    X.save(); X.globalAlpha = .7; for (let i = 0; i < 4; i++) { const x = ((i * 340 - sp * 3) % 1360 + 1360) % 1360 - 200; cloudPuff(x, 420 + (i % 2) * 70, 40, '#efe4d0', 2.5); } X.restore();
    for (let i = 0; i < 6; i++) { const x = ((i * 200 - sp * 8) % 1200 + 1200) % 1200 - 120, y = 60 + i * 80; line(x, y, x + 60, y, 2, 'rgba(255,255,255,.4)'); }
  }
};
// ---------------------------------------------------------------- 7. The Iron Wyrm
function drGear(b) { X.translate(b.x, b.y); X.rotate(b.t * 4); X.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16, r = i % 2 ? b.r : b.r * .78; X.lineTo(Math.cos(a) * r, Math.sin(a) * r); } X.closePath(); fillStroke(b.pink ? C.pink : '#a08a60', 2.5); circ(0, 0, b.r * .35, '#5a4a30', 2); }
function drSeg(b) { X.save(); X.translate(b.x, b.y); circ(0, 0, b.r, '#6a6e78', 3.5); circ(0, 0, b.r * .6, '#8a8e98', 2.5); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + b.t; circ(Math.cos(a) * b.r * .8, Math.sin(a) * b.r * .8, 3, '#c0c4cc', 1); } poly([-b.r * .3, -b.r, 0, -b.r - 16, b.r * .3, -b.r], '#5a5e68', 2.5); X.restore(); }
function drMissile(b) { const a = Math.atan2(b.vy, b.vx); X.translate(b.x, b.y); X.rotate(a); rrect(-16, -7, 30, 14, 7, b.pink ? C.pink : '#c8382c', 2.5); poly([-16, -7, -24, -13, -20, 0, -24, 13, -16, 7], '#6a6e78', 2); poly([14, -6, 24, 0, 14, 6], '#6a6e78', 2); const f = rnd(6, 14); poly([-22, -4, -22 - f, 0, -22, 4], C.yellow, 1.5); }
function drFlame(b) { X.save(); const x0 = b.x - b.w / 2; const gr = X.createLinearGradient(0, b.y - b.h / 2, 0, b.y + b.h / 2); gr.addColorStop(0, 'rgba(255,120,40,.2)'); gr.addColorStop(.5, 'rgba(255,230,140,.95)'); gr.addColorStop(1, 'rgba(255,120,40,.2)'); X.fillStyle = gr; X.fillRect(x0, b.y - b.h / 2, b.w, b.h); for (let i = 0; i < 12; i++) { const xx = x0 + ((i * 80 + b.t * 900) % b.w); circ(xx, b.y + Math.sin(i + b.t * 20) * b.h * .3, b.h * .3, 'rgba(255,190,80,.6)', 0); } X.restore(); }
function* wyrmFire(b) { b.mouthT = .7; yield .3; const x = b.hx - 60, y = b.hy + 20; for (let k = 0; k < 2; k++) { b.fan(x, y, b.aimAt(x, y), b.cnt(5), .8, 320, { r: 12, dr: drFireball }, k === 1 ? 2 : -1); Sfx.boom(.3); yield .45; } }
function* wyrmGears(b) { for (let i = 0; i < b.cnt(6); i++) { const y0 = rnd(60, H - 60); b.st.bullet({ x: W + 30, y: y0, y0, vx: -220 * b.D.spd, r: 18, dr: drGear, pink: i === 3, hp: 6, upd: q => { q.y = q.y0 + Math.sin(q.t * 2.5) * 40; } }); yield .35; } }
function* wyrmCoil(b) {
  const lanes = [120, 270, 420]; const p = b.st.target(); const lane = lanes.reduce((a, c) => Math.abs(c - p.y) < Math.abs(a - p.y) ? c : a);
  warnRect(b.st, W / 2, lane, W, 110, 1.1, { col: '#ff6040', ix: W - 60 }); Sfx.warn(); Camera.shake(3, 1); yield 1.1;
  for (let i = 0; i < 12; i++) { b.st.bullet({ x: W + 50, y: lane, y0: lane, ph: i * .5, vx: -560 * b.D.spd, r: 36, dr: drSeg, margin: 120, upd: q => { q.y = q.y0 + Math.sin(q.t * 3 + q.ph) * 14; } }); yield .07; }
  yield .9;
}
function* wyrmMissiles(b) { for (let i = 0; i < b.cnt(3); i++) { b.st.bullet({ x: b.hx + 80, y: b.hy - 40, vx: -100, vy: -250, r: 13, hp: 10, pink: i === 2, dr: drMissile, life: 5.5, upd: (q, dt, st) => { const p = st.target(q), a = Math.atan2(q.vy, q.vx), ta = angTo(q.x, q.y, p.x, p.cy); const da = ((ta - a + Math.PI * 3) % TAU) - Math.PI, na = a + clamp(da, -2 * dt, 2 * dt), sp = Math.min(260 * b.D.spd, Math.hypot(q.vx, q.vy) + 200 * dt); q.vx = Math.cos(na) * sp; q.vy = Math.sin(na) * sp; if (frameNo % 3 === 0) FX.add({ k: 'puff', x: q.x - Math.cos(na) * 20, y: q.y - Math.sin(na) * 20, r: 6, life: .4, col: '#d0ccc4', lw: 1.5 }); } }); Sfx.whoosh(); yield .5; } }
function* wyrmHunt(b) { b.chase = true; while (true) { yield 2; b.ring(b.hx, b.hy, b.cnt(12), 190, { r: 10, dr: drRivet }, rnd(TAU), null, rndi(0, 11)); Sfx.shoot('spread'); } }
function* wyrmFlame(b) {
  const p = b.st.target(); const y = clamp(p.y, 80, H - 80);
  warnRect(b.st, W / 2 - 60, y, W - 120, 90, .9, { col: '#ff6040', ix: 60, iy: y - 60 }); b.mouthT = 1.6; Sfx.warn(); yield .9;
  b.st.bullet({ x: (b.hx - 60) / 2, y, w: b.hx - 60, h: 80, shape: 'rect', dr: drFlame, life: .8, keep: true }); Sfx.boom(1); Camera.shake(6, .6); yield 1;
}
BOSSES.push({
  id: 'wyrm', name: 'The Iron Wyrm', title: 'The Giant Mechanical Dragon', world: 4, stars: 7, hp: 2700, par: 165, song: 'wyrm', arena: 'sky', voice: .5, mode: 'plane',
  intro: 'SKREEE-CLANK! Full steam ahead... over YOU!', quote: 'Scrap metal. Next!', color: '#6a6e78',
  setup(st) { st.bounds = { l: 0, r: W }; },
  init(b) { b.x = 800; b.y = 250; b.hx = 800; b.hy = 250; b.mouthT = 0; b.chase = false; b.detached = false; b.core = false; b.fall = 0; },
  phases: [
    { at: 1, name: 'Smoke & Steam', script: function* (b) { while (true) { yield* wyrmFire(b); yield .8; yield* wyrmGears(b); yield .8; yield* wyrmCoil(b); yield .6; } } },
    { at: .66, name: 'Missile Barrage', trans: 1.6, script: function* (b) { while (true) { yield* wyrmMissiles(b); yield .6; yield* wyrmFire(b); yield .8; yield* wyrmCoil(b); yield .5; yield* wyrmGears(b); yield .6; } } },
    { at: .36, name: 'Head Hunter', trans: 1.8, enter(b) { b.detached = true; Sfx.boom(1); }, script: function* (b) { b.run(wyrmHunt); while (true) { yield 1.5; for (let i = 0; i < 3; i++) { const sy = 380 + i * 50; b.shot(900, sy, Math.PI, 300, { r: 8, dr: drRivet, pink: i === 1 && Math.random() < .5 }); } yield .5; yield* wyrmGears(b); } } },
    { at: .13, name: 'Core Meltdown', trans: 1.8, enter(b) { b.detached = false; b.chase = false; b.core = true; b.st.tint = { c: '#ff3010', a: .1 }; }, script: function* (b) { b.run(function* () { let a = 0; while (true) { b.shot(b.hx - 40, b.hy, a, 180, { r: 8, col: C.yellow }); b.shot(b.hx - 40, b.hy, a + Math.PI, 180, { r: 8, col: C.yellow }); a += .37; yield .16; } }); while (true) { yield* wyrmFlame(b); yield .6; } } }
  ],
  update(b, dt) {
    if (b.mouthT > 0) b.mouthT -= dt;
    if (b.dead) { b.fall += dt; b.hy += b.fall * 260 * dt; b.hx -= 30 * dt; b.hurt = [{ x: b.hx, y: b.hy, r: 60 }]; return; }
    if (b.chase) { const p = b.st.target({ x: b.hx, y: b.hy }); const a = angTo(b.hx, b.hy, p.x, p.y); const sp = 120 * b.D.spd; b.hx += Math.cos(a) * sp * dt; b.hy += Math.sin(a) * sp * dt + Math.sin(b.t * 3) * 30 * dt; b.hx = clamp(b.hx, 200, 860); b.hy = clamp(b.hy, 70, H - 70); }
    else { const tx = 790, ty = 250 + Math.sin(b.t * 1.3) * 60; b.hx += (tx - b.hx) * Math.min(1, dt * 2); b.hy += (ty - b.hy) * Math.min(1, dt * 2); }
    b.x = b.hx; b.y = b.hy;
    b.hurt = [{ x: b.hx, y: b.hy, r: 60 }]; if (b.core) b.hurt.push({ x: 880, y: 430, r: 40 });
    b.hit = [{ x: b.hx + 10, y: b.hy, r: 48 }];
  },
  draw(b) {
    const t = b.t;
    // neck segments
    if (!b.dead || b.deadT < .4) {
      const n = 9, ex = 1000, ey = 600, cx = b.detached ? 940 : b.hx + 120, cy = b.detached ? 360 : b.hy + 160;
      for (let i = n; i >= (b.detached ? 3 : 0); i--) { const k = i / n; const x = (1 - k) * (1 - k) * (b.detached ? 920 : b.hx + 40) + 2 * (1 - k) * k * cx + k * k * ex, y = (1 - k) * (1 - k) * (b.detached ? 330 : b.hy + 40) + 2 * (1 - k) * k * cy + k * k * ey; drSeg({ x, y: y + Math.sin(t * 3 + i) * 5, r: 40 - i * 1.5, t: t + i }); }
      if (b.core) { const gr = X.createRadialGradient(880, 430, 4, 880, 430, 60); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); X.fillStyle = gr; X.fillRect(820, 370, 120, 120); circ(880, 430, 26 + Math.sin(t * 10) * 3, '#ffcf60', 3.5); }
    }
    // head
    X.save(); X.translate(b.hx, b.hy); if (b.dead) X.rotate(b.fall * 2);
    if (b.chase) { for (let i = 0; i < 3; i++) poly([60, -10 + i * 10, 90 + rnd(10, 30), -6 + i * 10, 60, -2 + i * 10], C.yellow, 1.5); }
    const m = b.mouthT > 0 ? 1 : 0;
    poly([40, -50, 90, -90, 70, -30], '#5a5e68', 3); poly([10, -56, 40, -110, 50, -40], '#5a5e68', 3);
    X.beginPath(); X.moveTo(60, -50); X.quadraticCurveTo(70, 30, 30, 50); X.lineTo(-60, 30 + m * 26); X.quadraticCurveTo(-90, 20 + m * 20, -100, 6 + m * 16); X.lineTo(-40, 0); X.closePath(); fillStroke('#7a7e88', 4);
    X.beginPath(); X.moveTo(60, -50); X.quadraticCurveTo(20, -70, -40, -50); X.quadraticCurveTo(-90, -40, -104, -4); X.lineTo(-40, 0); X.closePath(); fillStroke('#8a8e98', 4);
    if (m) { const gr = X.createRadialGradient(-60, 8, 2, -60, 8, 50); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(1, 'rgba(255,100,20,.2)'); X.fillStyle = gr; X.beginPath(); X.moveTo(-100, -2); X.lineTo(-40, 2); X.lineTo(-60, 28); X.closePath(); X.fill(); }
    for (let i = 0; i < 5; i++) poly([-96 + i * 14, -4, -90 + i * 14, 6, -84 + i * 14, -4], C.white, 1.5);
    for (let i = 0; i < 5; i++) circ(-30 + i * 18, -40, 3, '#c0c4cc', 1.2);
    rrect(-20, -76, 16, 26, 3, '#4a4e58', 2.5); if (frameNo % 8 === 0 && !b.dead) FX.add({ k: 'puff', x: b.hx - 12, y: b.hy - 82, vy: -80, vx: 30, r: 9, life: 1, col: '#d0ccc4' });
    if (b.dead) { xEye(-10, -28, 10); } else pieEye(-10, -28, 13, 15, -.7, .2, { pupilCol: '#c8382c', brow: 1.4 });
    X.restore();
  }
});

// ---------------------------------------------------------------- gloom arena
ARENAS.gloom = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#1e0a16', '#5a1418');
    g.save(); g.globalAlpha = .55; circ(480, 210, 150, '#c8503a', 0); g.globalAlpha = .4; circ(480, 210, 190, '#a03030', 0); g.restore();
    blotches(g, w, h, '#000000', 22, .15);
    g.fillStyle = '#12060c'; g.beginPath(); g.moveTo(0, 380); for (let x = 0; x <= w; x += 60) g.lineTo(x + 30, 300 + Math.sin(x) * 40); g.lineTo(w, 380); g.lineTo(w, FLOOR); g.lineTo(0, FLOOR); g.closePath(); g.fill();
    for (const x of [40, 900]) { rrect(x - 24, 120, 48, 350, 4, '#3a2030', 3.5); for (let i = 0; i < 6; i++) line(x - 24, 150 + i * 55, x + 24, 150 + i * 55, 2, '#1e0a16'); rrect(x - 34, 104, 68, 20, 3, '#4a2838', 3); }
    g.fillStyle = '#3a2a30'; g.fillRect(0, FLOOR, w, h - FLOOR); for (let x = 0; x < w; x += 60) { line(x, FLOOR, x + 10, h, 2, '#1e1218'); } line(0, FLOOR + 20, w, FLOOR + 20, 2, '#1e1218'); line(0, FLOOR, w, FLOOR, 3);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .55);
  },
  live(st, t) {
    for (const x of [40, 900]) { const f = Math.sin(t * 12 + x) * 4; poly([x - 18, 104, x - 6, 70 + f, x, 50 - f, x + 8, 72 + f, x + 18, 104], '#ff7a2a', 2.5); poly([x - 8, 104, x, 80 - f, x + 8, 104], '#ffd35a', 0); }
    if (st.pit) { X.save(); X.fillStyle = '#0a0306'; X.fillRect(0, FLOOR - 40, W, H); const gr = X.createLinearGradient(0, FLOOR, 0, H); gr.addColorStop(0, 'rgba(255,90,30,0)'); gr.addColorStop(1, 'rgba(255,90,30,.6)'); X.fillStyle = gr; X.fillRect(0, FLOOR - 40, W, H); X.restore(); if (frameNo % 4 === 0) FX.add({ k: 'spark', x: rnd(W), y: H, vx: rnd(-20, 20), vy: -rnd(100, 220), col: '#ff9a40', life: 1.2, len: 6 }); }
    X.save(); X.globalAlpha = .5; for (let i = 0; i < 3; i++) { const x = (i * 380 + t * 30) % (W + 100) - 50, y = 80 + i * 40 + Math.sin(t + i) * 10; const fl = Math.sin(t * 20 + i) * 3; poly([x - 10, y, x, y - 8 + fl, x + 10, y], '#2a1a24', 0); } X.restore();
  }
};
// ---------------------------------------------------------------- 8. Baron Von Gloom
function drFSkull(b) { X.translate(b.x, b.y); X.rotate(b.t * 5); const f = Math.sin(b.t * 30) * 3; poly([-10, -8, -6, -26 - f, 0, -14, 6, -28 + f, 10, -8], b.pink ? C.pinkL : '#ff9a40', 2); circ(0, 0, b.r, b.pink ? C.pink : '#efe8d4', 2.5); circ(-4, -2, 3.2, C.ink, 0); circ(4, -2, 3.2, C.ink, 0); rrect(-5, 5, 10, 4, 1, C.ink, 0); }
function drBat(b) { X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1); const f = Math.sin(b.t * 22) * 10; poly([0, 0, 14, -10 - f, 22, -2, 18, 6], b.pink ? C.pink : '#2a1a24', 2); poly([0, 0, -14, -10 - f, -22, -2, -18, 6], b.pink ? C.pink : '#2a1a24', 2); circ(0, 0, 8, b.pink ? C.pink : '#3a2430', 2); circ(-3, -2, 1.6, '#ffd35a', 0); circ(3, -2, 1.6, '#ffd35a', 0); }
function drSpark7(b) { const gr = X.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 2.4); gr.addColorStop(0, b.c); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.globalAlpha *= .7; X.fillRect(b.x - b.r * 2.4, b.y - b.r * 2.4, b.r * 4.8, b.r * 4.8); X.globalAlpha = 1; star(b.x, b.y, b.r, 4, .45, b.pink ? C.pink : b.c, 2, b.t * 6); }
function drHand(b) { X.save(); X.translate(b.x, b.y + b.h / 2); const hh = b.h; X.beginPath(); X.moveTo(-18, 0); X.lineTo(-18, -hh + 40); X.lineTo(18, -hh + 40); X.lineTo(18, 0); X.closePath(); fillStroke('#1a0a14', 3); X.translate(0, -hh + 30); for (let i = 0; i < 4; i++) { X.save(); X.rotate(-.6 + i * .4); poly([-5, 0, 0, -36 + Math.sin(b.t * 10 + i) * 4, 5, 0], '#1a0a14', 2.5); X.restore(); } circ(0, 6, 22, '#1a0a14', 3); X.restore(); }
function drCane(b) { X.save(); X.globalAlpha *= .95; line(b.x1, b.y1, b.x2, b.y2, b.w + 10, 'rgba(180,60,255,.4)'); line(b.x1, b.y1, b.x2, b.y2, b.w * .55, '#f0d8ff'); X.restore(); }
function drShadowOrb(b) { const gr = X.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 2); gr.addColorStop(0, b.pink ? 'rgba(255,79,168,.9)' : 'rgba(120,40,160,.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(b.x - b.r * 2, b.y - b.r * 2, b.r * 4, b.r * 4); circ(b.x, b.y, b.r, b.pink ? C.pink : '#2a0a36', 2.5, b.pink ? C.ink : '#c080ff'); }
const SPARK_COLS = ['#ff5040', '#ff9a30', '#ffe040', '#60e070', '#50b0ff', '#8060ff', '#e070ff'];
function* gloomSkulls(b) { b.setPose('toss', .8); for (let i = 0; i < b.cnt(3); i++) { b.st.bullet({ x: b.x - 50, y: b.y - 200, vx: -rnd(230, 330) * b.D.spd, vy: -rnd(200, 420), g: 1000, r: 14, dr: drFSkull, pink: i === 1, bounceFloor: .78, life: 5, floorY: FLOOR }); Sfx.whoosh(); yield .35; } }
function* gloomBats(b, x, y) { for (let i = 0; i < b.cnt(6); i++) { const y0 = (y || b.y - 160) + rnd(-50, 50); b.st.bullet({ x: x || b.x - 40, y: y0, y0, vx: -240 * b.D.spd, r: 12, hp: 3, pink: i === 4, dr: drBat, ph: rnd(TAU), upd: q => { q.y = q.y0 + Math.sin(q.t * 6 + q.ph) * 40; } }); yield .22; } }
function* gloomCane(b) {
  b.setPose('cane', 1.4); const x = b.x - 70, y = b.y - 170; const p = b.st.target(); const a = angTo(x, y, p.x, p.cy), L = 1300;
  warnLine(b.st, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, .85, { col: '#c060ff', lw: 3 }); Sfx.warn(); yield .85;
  b.st.bullet({ shape: 'line', x, y, x1: x, y1: y, x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L, w: 22, dr: drCane, life: .4, keep: true }); Sfx.zap(); Camera.shake(4, .2); yield .6;
}
function* gloomSparks(b) {
  const orbs = SPARK_COLS.map((c, i) => b.st.bullet({ x: b.x, y: b.y, r: 13, c, dr: drSpark7, glow: 50, keep: true, life: 20, a: i * TAU / 7, pink: i === 3, upd: (q, dt) => { if (!q.go) { q.a += dt * 1.6; q.x = b.x + Math.cos(q.a) * 100; q.y = b.y - 20 + Math.sin(q.a) * 100; } } }));
  yield 1;
  for (const o of orbs) { if (o.dead) continue; const p = b.st.target(o), a = angTo(o.x, o.y, p.x, p.cy); o.go = true; o.keep = false; o.vx = Math.cos(a) * 300 * b.D.spd; o.vy = Math.sin(a) * 300 * b.D.spd; Sfx.zap(); yield 1.05; }
}
function* gloomHands(b) {
  const p = b.st.target(); const plats = b.st.solids.filter(s => s.gloomPlat); let pl = plats.find(s => p.x > s.x - 10 && p.x < s.x + s.w + 10) || pick(plats);
  if (!pl) return;
  const x = pl.x + pl.w / 2; warnRect(b.st, x, pl.y + 60, 80, 120, .9, { col: '#c060ff', iy: pl.y - 30 }); Sfx.warn(); yield .9;
  const top = pl.y - 80;
  b.st.bullet({ x, y: H, w: 46, h: 10, shape: 'rect', dr: drHand, keep: true, life: 2, upd: q => { const T = q.t, k = T < .3 ? T / .3 : T < 1.1 ? 1 : Math.max(0, 1 - (T - 1.1) / .4); const hh = (H - top) * k; q.h = Math.max(1, hh); q.y = H - q.h / 2; if (T > 1.5) q.dead = true; } });
  Sfx.whoosh(); yield .8;
}
function* gloomRain(b) { while (true) { yield 1.6; for (let i = 0; i < 2; i++) { const x = rnd(40, 700); b.st.bullet({ x, y: -20, vy: 260 * b.D.spd, r: 11, dr: drFireball, c1: '#c03030', c2: '#ffb050' }); yield .3; } } }
function* gloomEyes(b) { for (let i = 0; i < 6; i++) { const ex = 780 + (i % 2 ? 50 : -50) - 40, ey = 190; b.fan(ex, ey, b.aimAt(ex, ey), b.cnt(3), .3, 330, { r: 12, dr: drFireball }, i === 3 ? 1 : -1); b.eyeFlash = i % 2 ? 'r' : 'l'; Sfx.boom(.3); yield .4; } b.eyeFlash = null; }
function* gloomBreath(b) { b.mouthT = 2.6; yield .4; let a = Math.PI * 1.2; for (let i = 0; i < 32; i++) { b.shot(740, 320, a, 300, { r: 13, dr: drFireball }); a -= .015 + (i < 16 ? .002 : -.002); if (i === 16) a = Math.PI * .8; yield .07; } yield .3; }
BOSSES.push({
  id: 'gloom', name: 'Baron Von Gloom', title: 'Master of Shadows', world: 5, stars: 8, hp: 3000, par: 190, song: 'gloom', arena: 'gloom', voice: .55,
  intro: 'Welcome to MY show, little bulbs. Let\'s dim the lights...', quote: 'Lights out, little bulb. Forever.', color: '#8e2219',
  setup(st) { },
  init(b) { b.x = 800; b.y = FLOOR; b.face2 = false; b.mouthT = 0; b.shrink = 0; },
  phases: [
    { at: 1, name: 'Welcome to the Show', script: function* (b) { while (true) { yield* gloomSkulls(b); yield .9; yield* gloomBats(b); yield .9; yield* gloomCane(b); yield .8; yield* gloomCane(b); yield .9; } } },
    {
      at: .68, name: 'The Floor Show', trans: 2.4,
      enter(b, instant) {
        const st = b.st;
        const doIt = () => {
          st.solids = st.solids.filter(s => !s.floor); st.pit = true;
          const plats = [[70, 380, 130, 0], [290, 320, 110, 1], [520, 380, 120, 0], [360, 210, 90, 0]];
          for (const [x, y, w, mv] of plats) st.solids.push({ x, y, w, h: 18, oneWay: true, gloomPlat: true, bx: x, move: mv ? (s, t) => { s.x = s.bx + Math.sin(t * .9) * 60; } : null, draw: s => { rrect(s.x, s.y, s.w, s.h + 6, 4, '#4a3440', 3); for (let i = 0; i < 3; i++) poly([s.x + 15 + i * (s.w - 30) / 2, s.y + 24, s.x + 22 + i * (s.w - 30) / 2, s.y + 44, s.x + 29 + i * (s.w - 30) / 2, s.y + 24], '#3a2430', 2); } });
          for (const p of st.players) { p.safe = { x: 135, y: 380 }; }
          b.x = 800; b.y = 330; b.floating = true;
        };
        if (instant) { doIt(); return; }
        b.run(function* () { Camera.shake(10, 1.5); for (let i = 0; i < 16; i++) FX.add({ k: 'debris', x: rnd(W), y: FLOOR + 10, vx: rnd(-60, 60), vy: rnd(-200, 0), g: 900, r: rnd(12, 26), col: '#3a2a30', vr: rnd(-4, 4), life: 1.8 }); Sfx.boom(1.4); yield .3; doIt(); for (const p of st.players) if (!p.dead) { p.x = clamp(p.x, 80, 600); const pl = st.solids.find(s => s.gloomPlat && p.x > s.x && p.x < s.x + s.w); p.y = pl ? pl.y : 380; if (!pl) p.x = 135; p.vy = 0; } });
      },
      script: function* (b) { b.run(gloomRain); while (true) { yield* gloomSparks(b); yield .5; yield* gloomHands(b); yield .4; yield* gloomHands(b); yield .6; } }
    },
    { at: .38, name: 'The True Face', trans: 2.2, enter(b) { b.face2 = true; b.floating = false; }, script: function* (b) { while (true) { yield* gloomEyes(b); yield .6; yield* gloomBreath(b); yield .6; yield* gloomBats(b, 820, 120); yield .8; } } },
    {
      at: .12, name: 'LIGHTS OUT', trans: 2, enter(b) { b.face2 = true; b.st.darkT = .93; },
      script: function* (b) { b.run(function* () { while (true) { yield 1.2; for (let i = 0; i < 2; i++) { b.st.bullet({ x: 760, y: 250, vx: -80, vy: rnd(-100, 100), r: 14, glow: 50, dr: drShadowOrb, pink: Math.random() < .3, life: 5, upd: (q, dt, st) => { const p = st.target(q), a = angTo(q.x, q.y, p.x, p.cy), sp = 140 * b.D.spd; q.vx += (Math.cos(a) * sp - q.vx) * dt * .9; q.vy += (Math.sin(a) * sp - q.vy) * dt * .9; } }); yield .3; } } }); let off = 0; while (true) { b.ring(760, 250, b.cnt(16), 175, { r: 10, dr: drFireball, glow: 34, c1: '#ff3020' }, off, null, -1); off += .17; Sfx.boom(.3); yield 1.15; } }
    }
  ],
  update(b, dt) {
    if (b.mouthT > 0) b.mouthT -= dt;
    if (b.floating && !b.dead) { b.y = 330 + Math.sin(b.t * 1.5) * 22; b.x = 800 + Math.sin(b.t * .7) * 20; }
    if (b.face2) { b.st.lights.push({ x: 735, y: 190, r: 80 }, { x: 830, y: 190, r: 80 }); b.hurt = [{ x: 780, y: 230, r: 140 }]; b.hit = [{ x: 820, y: 260, r: 120 }]; }
    else if (b.floating) { b.hurt = [{ x: b.x, y: b.y - 40, r: 46 }, { x: b.x, y: b.y - 130, r: 34 }]; b.hit = [{ x: b.x, y: b.y - 50, r: 34 }]; b.st.lights.push({ x: b.x, y: b.y - 100, r: 120 }); }
    else { b.hurt = [{ x: b.x, y: b.y - 120, r: 46 }, { x: b.x, y: b.y - 220, r: 34 }]; b.hit = [{ x: b.x, y: b.y - 110, r: 34 }]; }
    if (b.dead) { b.st.darkT = 0; b.shrink = Math.min(1, b.deadT / 1.6); if (b.deadT > 2.4) b.impX = (b.impX ?? 780) - 260 * dt; }
  },
  onDie(b) { for (let i = 0; i < 7; i++) FX.add({ k: 'fn', x: 780, y: 240, life: 3, vx: rnd(-150, 150), vy: -rnd(200, 400), g: -40, c: SPARK_COLS[i], draw: p => star(p.x, p.y, 12, 4, .45, p.c, 2, p.t * 6) }); },
  draw(b) {
    const t = b.t;
    if (b.dead && b.deadT > 1.6) { // the tiny imp runs away
      const x = b.impX ?? 780, y = b.st.pit ? 380 : FLOOR; if (x < -40) return;
      X.save(); X.translate(x, y - Math.abs(Math.sin(t * 16)) * 8); circ(0, -16, 12, '#7a2a3a', 2.5); poly([-8, -26, -12, -38, -3, -28], C.ink, 0); poly([8, -26, 12, -38, 3, -28], C.ink, 0); pieEye(-4, -18, 3, 4, -1, 0, {}); pieEye(4, -18, 3, 4, -1, 0, {}); hose(-4, -4, -8 + Math.sin(t * 30) * 4, 0, 2, 3); hose(4, -4, 8 - Math.sin(t * 30) * 4, 0, -2, 3); X.restore();
      if (frameNo % 30 === 0) Voice.babble(2, 900, { syl: .06 });
      return;
    }
    const s = b.dead ? 1 - b.shrink * .9 : 1;
    if (b.face2) { this.drawFace(b, s); return; }
    X.save(); X.translate(b.x, b.y); X.scale(s, s);
    if (!b.floating) shadowAt(0, 0, 50, .4);
    const sway = Math.sin(t * 2) * 4;
    // cape
    const fl = Math.sin(t * 3) * 10;
    X.beginPath(); X.moveTo(-34, -210); X.quadraticCurveTo(-90 - fl, -100, -70 - fl, -10); X.lineTo(60 + fl * .5, -10); X.quadraticCurveTo(70, -120, 34, -210); X.closePath(); fillStroke('#1a0a14', 3.5);
    X.beginPath(); X.moveTo(-28, -200); X.quadraticCurveTo(-74 - fl, -100, -58 - fl, -20); X.lineTo(48, -20); X.quadraticCurveTo(56, -120, 28, -200); X.closePath(); fillStroke('#8e2219', 0);
    // tail
    hose(20, -70, 70, -20 + Math.sin(t * 4) * 10, -20, 4); poly([70, -20 + Math.sin(t * 4) * 10, 84, -30 + Math.sin(t * 4) * 10, 80, -10 + Math.sin(t * 4) * 10], C.ink, 0);
    if (!b.floating) { hose(-10, -80, -16, -6, 6, 6); hose(10, -80, 16, -6, -6, 6); shoe(-16, 0, -1, 1.4, '#1a0a14'); shoe(16, 0, 1, 1.4, '#1a0a14'); }
    else { X.save(); X.globalAlpha = .7; for (let i = 0; i < 3; i++) { X.beginPath(); X.moveTo(-26 + i * 10, -80); X.quadraticCurveTo(-30 + i * 14 + Math.sin(t * 4 + i) * 10, -40, -20 + i * 14, 0); X.lineWidth = 8; X.strokeStyle = '#1a0a14'; X.stroke(); } X.restore(); }
    // coat
    poly([-30, -200 + sway * .2, 30, -200 + sway * .2, 36, -76, 12, -70, 0, -90, -12, -70, -36, -76], '#2a1424', 3.5);
    poly([-10, -200, 10, -200, 0, -130], '#efe0d0', 2.5); poly([0, -192, -12, -200, -12, -184], '#8e2219', 2); poly([0, -192, 12, -200, 12, -184], '#8e2219', 2);
    // arms
    const pose = b.pose; const ha = pose === 'cane' ? [-80, -170] : pose === 'toss' ? [-50, -230] : [-46, -120 + sway];
    hose(-24, -190, ha[0], ha[1], 8, 6); glove(ha[0], ha[1], 9, Math.PI, 'fist', '#e8d8e8');
    X.save(); X.translate(ha[0], ha[1]); X.rotate(pose === 'cane' ? -1.6 + Math.PI : 0); rrect(-3, -10, 6, 80, 2, '#1a0a14', 2); circ(0, -16, 10, SPARK_COLS[Math.floor(t * 3) % 7], 2.5); X.restore();
    hose(24, -190, 50, -130 + sway, -8, 6); glove(50, -130 + sway, 9, .4, 'open', '#e8d8e8');
    // head
    const hy = -232 + sway * .5;
    X.beginPath(); X.moveTo(-22, hy - 10); X.quadraticCurveTo(-26, hy + 30, 0, hy + 36); X.quadraticCurveTo(26, hy + 30, 22, hy - 10); X.quadraticCurveTo(0, hy - 30, -22, hy - 10); fillStroke('#7a2a3a', 3);
    pieEye(-9, hy, 6, 8, -.6, .2, { whiteCol: '#ffd35a', brow: 1.3 }); pieEye(9, hy, 6, 8, -.6, .2, { whiteCol: '#ffd35a', brow: -1.3 });
    X.beginPath(); X.arc(9, hy, 9, 0, TAU); X.lineWidth = 2; X.strokeStyle = C.gold; X.stroke();
    X.beginPath(); X.moveTo(-14, hy + 16); X.quadraticCurveTo(0, hy + 30, 14, hy + 16); X.closePath(); fillStroke(C.white, 2.2); for (let i = -2; i <= 2; i++) line(i * 5, hy + 17, i * 5, hy + 22, 1.2);
    hose(-6, hy + 10, -20, hy + 14, 3, 2.5); hose(6, hy + 10, 20, hy + 14, -3, 2.5);
    // hat with horns
    X.save(); X.translate(0, hy - 22); ell(0, 0, 32, 7, 0, '#1a0a14', 3); rrect(-20, -60, 40, 60, 3, '#1a0a14', 3); rrect(-20, -14, 40, 8, 2, '#8e2219', 2);
    poly([-18, -40, -40, -78, -14, -54], '#efe0d0', 2.5); poly([18, -40, 40, -78, 14, -54], '#efe0d0', 2.5); X.restore();
    X.restore();
  },
  drawFace(b, s) {
    const t = b.t; X.save(); X.translate(780, 240 + Math.sin(t * 1.2) * 8); X.scale(s, s);
    // horns
    poly([-120, -110, -190, -230, -80, -150], '#efe0d0', 4); poly([120, -110, 190, -230, 80, -150], '#efe0d0', 4);
    X.beginPath(); X.moveTo(-150, -60); X.quadraticCurveTo(-170, 120, 0, 190); X.quadraticCurveTo(170, 120, 150, -60); X.quadraticCurveTo(0, -200, -150, -60); fillStroke('#7a2a3a', 5);
    ell(-70, 40, 30, 16, 0, 'rgba(255,90,90,.3)', 0); ell(70, 40, 30, 16, 0, 'rgba(255,90,90,.3)', 0);
    for (const [ex, side] of [[-50, 'l'], [50, 'r']]) { const glow = b.eyeFlash === side; ell(ex, -40, 34, 40, 0, glow ? '#fff8a0' : '#ffd35a', 4); ell(ex - 8, -34, 12, 22, 0, C.ink, 0); X.save(); X.globalAlpha = .5; circ(ex - 12, -46, 6, C.white, 0); X.restore(); }
    hose(-90, -90, -20, -64, 10, 7); hose(90, -90, 20, -64, -10, 7);
    const m = b.mouthT > 0 ? 1 : 0;
    X.beginPath(); X.moveTo(-90, 60); X.quadraticCurveTo(0, 130 + m * 40, 90, 60); X.quadraticCurveTo(0, 90 + m * 10, -90, 60); fillStroke(m ? '#2a0a10' : '#5a1020', 4);
    for (let i = -3; i <= 3; i++) poly([i * 22 - 8, 66 + Math.abs(i) * -2 + 8, i * 22, 84 + Math.abs(i) * -1, i * 22 + 8, 66 + Math.abs(i) * -2 + 8], C.white, 2);
    if (m) { const gr = X.createRadialGradient(0, 100, 4, 0, 100, 60); gr.addColorStop(0, 'rgba(255,200,80,.9)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); X.fillStyle = gr; X.fillRect(-60, 50, 120, 100); }
    if (b.dead) { X.save(); X.globalAlpha = .9; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t; line(0, 0, Math.cos(a) * 300, Math.sin(a) * 300, 10, 'rgba(255,240,180,.6)'); } X.restore(); }
    X.restore();
  }
});
