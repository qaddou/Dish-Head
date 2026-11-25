// =====================================================================
//  Bosses 1-4: Queen Buzzeline, The Great Prestidigio, Jackpot Jimmy,
//  Captain Barnacle Bones
// =====================================================================

// ---------------------------------------------------------------- arenas
ARENAS.meadow = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#a9d3d6', '#f7e7b9');
    g.save(); g.globalAlpha = .5; circ(170, 92, 52, '#fff3b4', 0); g.globalAlpha = .25; circ(170, 92, 80, '#fff3b4', 0); g.restore();
    blotches(g, w, 300, '#ffffff', 18, .12);
    cloudPuff(320, 86, 30, '#fffaf0', 2.5); cloudPuff(600, 62, 36, '#fffaf0', 2.5); cloudPuff(470, 140, 20, '#fffaf0', 2);
    wash(g, gg => { gg.moveTo(0, 330); gg.quadraticCurveTo(200, 250, 420, 320); gg.quadraticCurveTo(650, 380, 960, 280); gg.lineTo(960, 480); gg.lineTo(0, 480); gg.closePath(); }, '#9cc27a', { alpha: .35 });
    wash(g, gg => { gg.moveTo(0, 400); gg.quadraticCurveTo(260, 330, 520, 400); gg.quadraticCurveTo(760, 450, 960, 380); gg.lineTo(960, 480); gg.lineTo(0, 480); gg.closePath(); }, '#76a44f', { alpha: .45 });
    // fence
    for (let x = 30; x < 330; x += 46) { rrect(x, 372, 10, 60, 3, '#e8d7b0', 2); }
    rrect(20, 386, 320, 8, 3, '#e8d7b0', 2); rrect(20, 408, 320, 8, 3, '#e8d7b0', 2);
    // tree + hive
    wash(g, gg => { gg.moveTo(905, 480); gg.quadraticCurveTo(890, 300, 912, 40); gg.lineTo(950, 40); gg.quadraticCurveTo(936, 300, 950, 480); gg.closePath(); }, '#8a5a34', { alpha: .6 });
    wash(g, gg => { gg.moveTo(915, 120); gg.quadraticCurveTo(820, 110, 760, 70); gg.lineTo(770, 60); gg.quadraticCurveTo(840, 92, 930, 100); gg.closePath(); }, '#8a5a34', { alpha: .6 });
    for (const [x, y, r] of [[930, 40, 70], [800, 40, 60], [700, 30, 55], [880, -10, 70]]) wash(g, gg => gg.arc(x, y, r, 0, TAU), '#6e9a44', { alpha: .45 });
    line(800, 76, 800, 100, 3, '#5a3a1c');
    for (let i = 0; i < 5; i++) ell(800, 120 + i * 18, 34 - Math.abs(i - 2) * 6, 11, 0, i % 2 ? '#e4b03c' : '#f0c75a', 2.5);
    ell(800, 178, 7, 5, 0, '#2a1a0a', 2);
    // flowers
    const R = mulberry32(5);
    for (let i = 0; i < 40; i++) { const x = R() * w, y = 380 + R() * 80; circ(x, y, 3 + R() * 3, ['#f6f0e0', '#f4c430', '#e86a4a', '#9a7ad0'][Math.floor(R() * 4)], 1.5); }
    // ground
    g.fillStyle = '#a5784b'; g.fillRect(0, FLOOR, w, h - FLOOR);
    g.fillStyle = '#7aa84a'; g.beginPath(); g.moveTo(0, FLOOR + 14); for (let x = 0; x <= w; x += 24) g.quadraticCurveTo(x + 12, FLOOR + 24, x + 24, FLOOR + 14); g.lineTo(w, FLOOR - 4); g.lineTo(0, FLOOR - 4); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, FLOOR); g.lineTo(w, FLOOR); g.stroke();
    for (let i = 0; i < 30; i++) ell(R() * w, FLOOR + 30 + R() * 35, 5 + R() * 6, 3, 0, '#8a6038', 1.5);
    Paper.apply(g, w, h, .35); vignetteOn(g, w, h, .3);
  },
  live(st, t) {
    for (let i = 0; i < 4; i++) { const x = 820 + Math.cos(t * (1 + i * .3) + i * 2) * (40 + i * 12), y = 140 + Math.sin(t * (1.6 + i * .2) + i) * (30 + i * 6); ell(x, y, 3, 2.5, 0, C.yellow, 1); X.save(); X.globalAlpha = .6; ell(x - 1, y - 3, 2.5, 1.5, 0, C.white, 0); X.restore(); }
    X.save(); X.globalAlpha = .5; for (let i = 0; i < 14; i++) { const x = (i * 97 + t * 14) % W, y = 200 + Math.sin(t + i) * 80 + i * 12; circ(x, y, 1.6, '#fff6c0', 0); } X.restore();
  },
  fg(st, t) {
    for (let x = -10; x < W + 20; x += 34) { const sw = Math.sin(t * 2 + x * .05) * 4; poly([x, H, x + 6 + sw, H - 26, x + 12, H], '#5d8c38', 2); poly([x + 10, H, x + 20 + sw, H - 18, x + 26, H], '#6d9c42', 2); }
  }
};
function drHexPlat(s) {
  const n = Math.round(s.w / 22);
  for (let i = 0; i < n; i++) { const cx = s.x + 11 + i * 22, cy = s.y + 9; poly([cx - 11, cy, cx - 5.5, cy - 9.5, cx + 5.5, cy - 9.5, cx + 11, cy, cx + 5.5, cy + 9.5, cx - 5.5, cy + 9.5], i % 2 ? '#f0c75a' : '#e4b03c', 2.2); }
  X.save(); X.globalAlpha = .6; for (let i = 0; i < 3; i++) ell(s.x + 20 + i * 35, s.y + 22 + Math.sin(st_t() * 3 + i) * 2, 3, 5, 0, '#e4a020', 0); X.restore();
}
function st_t() { return scene && scene.t || 0; }
function drWorkerBee(b) {
  X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1);
  X.save(); X.globalAlpha = .6; ell(3, -10, 6, 9 * Math.abs(Math.sin(b.t * 40)) + 2, .4, C.white, 1.5); X.restore();
  ell(0, 0, 13, 10, 0, b.pink ? C.pink : C.yellow, 2.5);
  X.save(); X.beginPath(); X.ellipse(0, 0, 13, 10, 0, 0, TAU); X.clip(); X.fillStyle = C.ink; X.fillRect(1, -10, 4, 20); X.fillRect(8, -10, 4, 20); X.restore();
  ell(0, 0, 13, 10, 0, null, 2.5); poly([12, 0, 19, -2, 12, 3], C.ink, 0);
  pieEye(-7, -2, 3, 4, -.5, 0, {});
}
function drHoney(b) { X.translate(b.x, b.y); const c = b.pink ? C.pink : '#f0a52a'; X.beginPath(); X.moveTo(0, -b.r * 1.7); X.quadraticCurveTo(b.r, -b.r * .3, b.r, b.r * .2); X.arc(0, b.r * .2, b.r, 0, Math.PI); X.quadraticCurveTo(-b.r, -b.r * .3, 0, -b.r * 1.7); fillStroke(c, 2.5); ell(-b.r * .35, 0, b.r * .2, b.r * .4, 0, 'rgba(255,255,255,.7)', 0); }
function drHexCol(b) {
  const x0 = b.x - b.w / 2, y0 = b.y - b.h / 2;
  X.save(); X.beginPath(); X.rect(x0 - 4, y0 - 4, b.w + 8, b.h + 8); X.clip();
  for (let r = 0; r < 14; r++) for (let c = 0; c < 3; c++) { const cx = x0 + 11 + c * 22, cy = y0 + 10 + r * 22 + (c % 2) * 11; poly([cx - 11, cy, cx - 5.5, cy - 10, cx + 5.5, cy - 10, cx + 11, cy, cx + 5.5, cy + 10, cx - 5.5, cy + 10], (r + c) % 3 ? '#e4b03c' : '#f0c75a', 2); }
  X.restore(); rrect(x0, y0, b.w, b.h, 4, null, 3);
}

// ---------------------------------------------------------------- 1. Queen Buzzeline
function* beeHoney(b, n) {
  for (let i = 0; i < n; i++) {
    const x = 60 + (i + .5) * (600 / n) + rnd(-30, 30);
    b.st.bullet({ x, y: 6, r: 6, harmless: true, life: .75, keep: true, dr: q => { X.translate(q.x, q.y); const s = .4 + q.t * 1.2; X.scale(s, s); drHoney({ x: 0, y: 0, r: 10, t: 0, pink: q.pink }); }, pink: i === n - 1 && Math.random() < .5, onEnd: (q, st) => { st.bullet({ x: q.x, y: 14, r: 12, g: 1000 * b.D.spd, pink: q.pink, dr: drHoney, floorDie: true, onFloor: (h, st2) => { Sfx.splash(); FX.puffs(h.x, FLOOR - 6, 3, 8, '#f0c75a'); if (!h.pink) for (const d of [-1, 1]) st2.bullet({ x: h.x, y: FLOOR - 7, r: 7, vx: d * 150 * b.D.spd, life: 1.4, dr: drHoney }); } }); } });
    yield .2;
  }
}
function* beeSquad(b, n) {
  const pk = rndi(0, n - 1);
  for (let i = 0; i < n; i++) { const y0 = rnd(230, 440); b.st.bullet({ x: W + 30, y: y0, y0, vx: -230 * b.D.spd, r: 14, hp: 6, pink: i === pk, dr: drWorkerBee, upd: q => { q.y = q.y0 + Math.sin(q.t * 4) * 36; } }); Sfx.whoosh(); yield .5; }
}
function* beeStingers(b) {
  for (let k = 0; k < 3; k++) { b.setPose('point', .4); const x = b.x - 30, y = b.y + 10; b.fan(x, y, b.aimAt(x, y), b.cnt(3), .5, 330, { r: 8, dr: drStinger }, k === 2 ? 1 : -1); Sfx.shoot('chaser'); yield .6; }
}
function* beeKicks(b) {
  for (let i = 0; i < b.cnt(4); i++) {
    b.kick = 1; b.kickSide = i % 2; const p = b.st.target();
    b.lob(b.x - 30, b.y + 20, clamp(p.x + rnd(-50, 50), 30, 700), FLOOR - 6, 1.05, { r: 9, g: 900, dr: drStinger, pink: i === 2, floorDie: true });
    Sfx.whoosh(); yield .55;
  }
}
function* beePollen(b) {
  for (let k = 0; k < 2; k++) {
    const n = 12 + b.n * 2, gap = rndi(0, n - 1), off = rnd(TAU);
    b.setPose('point', .5); b.ring(b.x, b.y - 10, n, 165, { r: 9, col: '#ffd84a' }, off, i => i === gap || i === (gap + 1) % n, (gap + 5) % n);
    Sfx.pop(); yield 1.15;
  }
}
function* beeCharge(b) {
  b.mode = 'move'; b.pose = 'crouch'; Sfx.warn(); Voice.babble(2, 380, { vowel: 0 });
  warnRect(b.st, W / 2 - 60, FLOOR - 40, W - 120, 80, .85, { col: '#ffb020', ix: 120, iy: FLOOR - 100 });
  yield* tween(b, b.x + 20, FLOOR - 44, .25); yield .6;
  b.pose = 'charge'; const sp = 780 * b.D.spd; Sfx.whoosh();
  while (b.x > -140) { b.x -= sp * DT; if (frameNo % 3 === 0) FX.puffs(b.x + 50, FLOOR - 8, 1, 10, null, 20); yield 0; }
  b.pose = ''; b.x = W + 160; b.y = 160;
  yield* tween(b, 770, FLOOR - 62, 1.1, ease.outQ); b.mode = 'dance';
}
function* beeHex(b) {
  const base = rnd(40, 150), cols = []; for (let x = base; x < W - 30; x += 185) cols.push(x);
  for (const x of cols) warnRect(b.st, x, FLOOR - 150, 66, 300, .95, { col: '#ffb020', iy: 60 });
  Sfx.warn(); yield .95;
  for (const x of cols) b.st.bullet({ x, y: -200, w: 66, h: 300, shape: 'rect', vy: 1100, r: 40, dr: drHexCol, keep: true, life: 3.5, upd: (q) => { if (q.y >= FLOOR - 150) { q.y = FLOOR - 150; q.vy = 0; if (!q.landed) { q.landed = q.t; Camera.shake(4, .2); Sfx.thud(); FX.puffs(q.x, FLOOR - 6, 3, 12, '#f0c75a'); } if (q.t - q.landed > .7) { q.dead = true; FX.puffs(q.x, q.y, 6, 18, '#f0c75a'); } } } });
  yield 1.8;
}
function* beeHoming(b) {
  for (let i = 0; i < b.cnt(5); i++) {
    b.st.bullet({ x: b.x - 30, y: b.y, r: 13, hp: 5, pink: i === 3, dr: drWorkerBee, life: 6.5, vx: -120, upd: (q, dt, st) => { const p = st.target(q), a = angTo(q.x, q.y, p.x, p.cy), sp = 160 * b.D.spd; q.vx += (Math.cos(a) * sp - q.vx) * dt * 1.3; q.vy += (Math.sin(a) * sp - q.vy) * dt * 1.3; } });
    Sfx.whoosh(); yield .4;
  }
}
BOSSES.push({
  id: 'bee', name: 'Queen Buzzeline', title: 'The Dancing Queen Bee', world: 1, stars: 1, hp: 1300, par: 100, song: 'bee', arena: 'meadow', voice: 1.6,
  intro: 'Shall we dance, darling? Do try to keep up!', quote: 'Darling, you have two left feet!', color: '#f4c430',
  setup(st) {
    for (const [x, y, ph] of [[220, 340, 0], [480, 285, 2]]) st.solids.push({ x, y, w: 110, h: 18, oneWay: true, base: y, ph, move: (s, t) => { s.y = s.base + Math.sin(t * 1.2 + s.ph) * 14; }, draw: drHexPlat });
  },
  init(b) { b.x = 740; b.y = 200; b.mode = 'fly'; b.ax = b.x; b.ay = b.y; b.ft = 0; b.kick = 0; b.spin = 0; b.crownY = 0; b.vy2 = 0; },
  phases: [
    { at: 1, name: 'The Waltz', script: function* (b) { while (true) { yield* beeHoney(b, b.cnt(4)); yield 1.3; yield* beeSquad(b, b.cnt(3)); yield 1.5; yield* beeStingers(b); yield 1.2; } } },
    {
      at: .66, name: 'The Charleston', trans: 1.9,
      enter(b, instant) { if (instant) { b.x = 770; b.y = FLOOR - 62; b.mode = 'dance'; return; } b.mode = 'move'; b.run(function* () { yield* tween(b, 770, FLOOR - 62, 1.3, ease.io); b.mode = 'dance'; }); },
      script: function* (b) { while (true) { yield* beeKicks(b); yield 1; yield* beePollen(b); yield 1.1; yield* beeCharge(b); yield 1; } }
    },
    {
      at: .36, name: 'Hive Fever', trans: 1.7,
      enter(b, instant) { b.angry = true; if (instant) { b.x = 720; b.y = 190; b.mode = 'fly'; b.ax = b.x; b.ay = b.y; b.ft = 0; return; } b.mode = 'move'; b.run(function* () { yield* tween(b, 720, 190, 1.2, ease.io); b.mode = 'fly'; b.ax = b.x; b.ay = b.y; b.ft = 0; }); },
      script: function* (b) { b.run(function* () { while (true) { yield 2.6; yield* beeHoney(b, 3); } }); while (true) { yield* beeHex(b); yield 1.1; yield* beeHoming(b); yield 1.5; yield* beeStingers(b); yield 1; } }
    },
    {
      at: .13, name: 'Grand Finale', trans: 1.5,
      enter(b, instant) { b.angry = true; b.spinning = true; b.mode = 'bounce'; b.bvx = -170; b.bvy = 120; b.st.tint = { c: '#ffcc40', a: .1 }; if (instant) { b.x = 640; b.y = 220; } },
      script: function* (b) { let a = 0; while (true) { for (const arm of [0, Math.PI]) b.shot(b.x, b.y, a + arm, 205, { r: 8, dr: drStinger, pink: Math.random() < .05 }); a += .34; yield .17; } }
    }
  ],
  update(b, dt) {
    b.wing += dt; if (b.kick > 0) b.kick = Math.max(0, b.kick - dt * 3);
    if (!b.dead) {
      if (b.mode === 'fly') { b.ft += dt; b.x = b.ax + Math.sin(b.ft * .9) * 85; b.y = b.ay + Math.sin(b.ft * 1.8) * 42; }
      else if (b.mode === 'bounce') { b.x += b.bvx * dt; b.y += b.bvy * dt; if (b.x < 300 || b.x > 880) { b.bvx *= -1; b.x = clamp(b.x, 300, 880); } if (b.y < 120 || b.y > 320) { b.bvy *= -1; b.y = clamp(b.y, 120, 320); } b.spin += dt * 14; }
    }
    if (b.pose === 'charge' || b.pose === 'crouch') { b.hurt = [{ x: b.x, y: b.y, r: 42 }]; b.hit = b.pose === 'charge' ? [{ x: b.x, y: b.y + 4, r: 36 }] : []; }
    else { b.hurt = [{ x: b.x, y: b.y, r: 44 }, { x: b.x - 8, y: b.y - 62, r: 30 }]; b.hit = [{ x: b.x, y: b.y, r: 34 }, { x: b.x - 8, y: b.y - 62, r: 20 }]; }
  },
  dying(b, dt) { if (b.y < FLOOR - 44) { b.vy2 += 900 * dt; b.y = Math.min(FLOOR - 44, b.y + b.vy2 * dt); b.spin += dt * 10; } else { b.y = FLOOR - 44; b.spin *= .9; } b.crownY -= 260 * dt * (b.deadT < 1.5 ? 1 : 0); },
  draw(b) {
    const t = b.t;
    X.save(); X.translate(b.x, b.y);
    if (b.pose === 'charge' || b.pose === 'crouch') X.rotate(-.5);
    if (b.spinning && !b.dead) X.scale(Math.cos(b.spin) > 0 ? 1 : -1, 1);
    if (b.dead) X.rotate(Math.sin(b.spin) * .5);
    // wings
    X.save(); X.globalAlpha = .55;
    const fl = Math.sin(t * 38) * .35;
    ell(30, -40, 22, 44, .6 + fl, C.white, 2.5); ell(44, -24, 16, 32, 1 + fl, C.white, 2.5);
    X.restore();
    // stinger
    poly([22, 36, 48, 62, 14, 48], '#3a2a1a', 2.5);
    // legs
    const dance = b.mode === 'dance', k = b.kick;
    const legL = dance ? [-28 - k * 30 * (b.kickSide ? 0 : 1), 58 - k * 30 * (b.kickSide ? 0 : 1)] : [-16 + Math.sin(t * 3) * 4, 64];
    const legR = dance ? [12 + k * 30 * (b.kickSide ? 1 : 0), 62 - k * 30 * (b.kickSide ? 1 : 0)] : [10 - Math.sin(t * 3) * 4, 62];
    if (dance) { b.legBob = Math.abs(Math.sin(t * 7)) * 6; }
    hose(-10, 30, legL[0], legL[1], 6, 5); hose(6, 32, legR[0], legR[1], -6, 5);
    for (const [lx, ly] of [legL, legR]) { X.save(); X.translate(lx, ly); poly([-8, 0, 8, 0, 6, -6, -6, -8], '#c8382c', 2.2); line(5, 0, 7, 7, 2.5); X.restore(); }
    // body
    ell(0, 0, 40, 48, 0, '#f4c430', 3.5);
    X.save(); X.beginPath(); X.ellipse(0, 0, 40, 48, 0, 0, TAU); X.clip(); X.fillStyle = C.ink;
    for (const y of [-8, 14, 34]) { X.beginPath(); X.moveTo(-50, y); X.quadraticCurveTo(0, y + 8, 50, y); X.lineTo(50, y + 11); X.quadraticCurveTo(0, y + 19, -50, y + 11); X.closePath(); X.fill(); }
    X.restore(); ell(0, 0, 40, 48, 0, null, 3.5);
    ell(-14, -20, 7, 12, .4, 'rgba(255,255,255,.45)', 0);
    // pearls
    for (let i = -3; i <= 3; i++) circ(-6 + i * 7, -42 + Math.abs(i) * -1.4 + i * i * .6, 3.4, C.white, 1.6);
    // arms
    const pointing = b.pose === 'point';
    const hl = pointing ? [-74, -10] : [-46 + Math.sin(t * 5) * 6, -50 + Math.cos(t * 5) * 6];
    const hr = dance ? [44, -60 + Math.sin(t * 7) * 10] : [38, -12];
    hose(-30, -24, hl[0], hl[1], 8, 5); glove(hl[0], hl[1], 8, Math.PI + (pointing ? 0 : -.6), pointing ? 'point' : 'open');
    hose(30, -24, hr[0], hr[1], -8, 5); glove(hr[0], hr[1], 8, dance ? -1.2 : .3, 'open');
    // head
    X.save(); X.translate(-8, -62); if (dance) X.rotate(Math.sin(t * 7) * .1);
    hose(-10, -26, -26, -54, 8, 3.2); hose(8, -28, 18, -58, -8, 3.2);
    heartShape(-27, -58, 7, C.red, 2); heartShape(19, -61, 7, C.red, 2);
    circ(0, 0, 30, '#ffd77a', 3.5);
    ell(-18, 9, 6, 4, 0, '#f19a86', 0); ell(16, 9, 6, 4, 0, '#f19a86', 0);
    if (b.dead) { spiralEye(-10, -4, 8, t); spiralEye(10, -4, 8, -t); }
    else {
      const ang = b.angry ? 1 : 0, look = b.st.target ? clamp((b.st.target().x - b.x) / 300, -1, 1) : 0;
      pieEye(-10, -4, 8, 11, look, .2, { lid: b.angry ? .35 : .22, brow: b.angry ? 1.4 : -.3 }); pieEye(10, -4, 8, 11, look, .2, { lid: b.angry ? .35 : .22, brow: b.angry ? -1.4 : .3 });
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) line(sx * 10 + sx * (4 + i * 3), -13 - i * .5, sx * 10 + sx * (7 + i * 4), -18 - i * 1.5, 1.8);
    }
    if (b.angry || b.pose === 'charge') { ell(0, 16, 8, 6, 0, '#7a1a12', 2.5); line(-5, 13, 5, 13, 2, C.white); }
    else { heartShape(0, 15, 5.5, C.red, 2); }
    // crown
    X.save(); X.translate(4, -30 + b.crownY); X.rotate(.15 + (b.dead ? b.deadT * 3 : 0));
    poly([-18, 4, -20, -14, -10, -4, 0, -20, 10, -4, 20, -14, 18, 4], '#f2c230', 2.5); circ(0, -6, 3, C.red, 1.5); circ(-12, -3, 2.2, C.blue, 1.2); circ(12, -3, 2.2, C.blue, 1.2);
    X.restore();
    X.restore();
    if (b.spinning && !b.dead) { X.save(); X.globalAlpha = .5; for (let i = 0; i < 3; i++) { X.beginPath(); X.ellipse(0, 0, 70 + i * 8, 22 + i * 4, 0, b.spin + i, b.spin + i + 2.4); X.lineWidth = 3; X.strokeStyle = C.cream; X.stroke(); } X.restore(); }
    if (b.dead) for (let i = 0; i < 4; i++) { const a = t * 4 + i * TAU / 4; star(-8 + Math.cos(a) * 40, -110 + Math.sin(a) * 12, 7, 5, .45, C.yellow, 2); }
    X.restore();
  }
});

// ---------------------------------------------------------------- theatre arena
ARENAS.theatre = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#2a1420', '#4a2230');
    for (let x = 0; x < w; x += 40) { g.fillStyle = x % 80 ? 'rgba(120,30,40,.35)' : 'rgba(60,10,20,.35)'; g.fillRect(x, 0, 40, FLOOR); }
    blotches(g, w, FLOOR, '#000000', 20, .15);
    // painted backdrop: moon & stars
    g.save(); g.globalAlpha = .7; circ(480, 150, 70, '#f3e2a8', 3); circ(510, 135, 60, '#3a1a28', 0); g.restore();
    for (let i = 0; i < 18; i++) star(rnd(80, 880), rnd(40, 300), rnd(4, 9), 5, .45, '#e8d090', 1.5);
    // proscenium
    g.fillStyle = '#c99a35'; g.fillRect(0, 0, w, 34); line(0, 34, w, 34, 3);
    for (let x = 20; x < w; x += 60) circ(x, 17, 7, '#f0c75a', 2);
    // floor
    g.fillStyle = '#8a5a34'; g.fillRect(0, FLOOR, w, h - FLOOR);
    for (let y = FLOOR; y < h; y += 14) line(0, y, w, y, 1.5, 'rgba(40,20,5,.5)');
    for (let i = 0; i < 40; i++) { const y = FLOOR + Math.floor(rnd(0, 5)) * 14; line(rnd(w), y, 0, 0, 0); const x = rnd(w); line(x, y, x, y + 14, 1.5, 'rgba(40,20,5,.5)'); }
    line(0, FLOOR, w, FLOOR, 3);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .45);
  },
  live(st, t) {
    X.save(); X.globalAlpha = .12;
    for (const [x0, ph] of [[180, 0], [780, 2]]) { const tx = 480 + Math.sin(t * .7 + ph) * 300; X.beginPath(); X.moveTo(x0, 30); X.lineTo(tx - 90, FLOOR); X.lineTo(tx + 90, FLOOR); X.closePath(); X.fillStyle = '#fff3c0'; X.fill(); }
    X.restore();
  },
  fg(st, t) {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? 0 : W;
      X.beginPath(); X.moveTo(x0, 0); X.lineTo(x0 + s * -80, 0);
      for (let y = 0; y <= FLOOR; y += 40) X.quadraticCurveTo(x0 + s * -(70 + Math.sin(y * .05 + t) * 6), y + 20, x0 + s * -(58 + y * .04), y + 40);
      X.lineTo(x0, FLOOR + 40); X.closePath(); fillStroke('#9a1f24', 3.5);
      for (let i = 1; i < 4; i++) line(x0 + s * -i * 17, 0, x0 + s * -(i * 15 + 4), FLOOR + 20, 2, 'rgba(40,0,5,.5)');
    }
    X.beginPath(); X.moveTo(0, 30); for (let x = 0; x <= W; x += 80) X.quadraticCurveTo(x + 40, 74, x + 80, 30); X.lineTo(W, 0); X.lineTo(0, 0); X.closePath(); fillStroke('#9a1f24', 3.5);
    for (let x = 30; x < W; x += 90) { const gr = X.createRadialGradient(x, H - 12, 2, x, H - 12, 40); gr.addColorStop(0, 'rgba(255,230,150,.5)'); gr.addColorStop(1, 'rgba(255,230,150,0)'); X.fillStyle = gr; X.fillRect(x - 40, H - 52, 80, 52); ell(x, H - 8, 12, 8, 0, '#fff0b0', 2.5); }
    for (let x = 60; x < W; x += 120) { const bob = Math.sin(t * 2 + x) * 1.5; ell(x, H + 6 + bob, 26, 22, 0, '#1a0d0a', 0); ell(x + 50, H + 10 - bob, 22, 20, 0, '#1a0d0a', 0); }
  }
};
// ---------------------------------------------------------------- 2. The Great Prestidigio
function drRabbit(b) {
  X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1);
  ell(4, -18, 4, 12, -.3, C.white, 2); ell(-4, -18, 4, 12, .2, C.white, 2);
  ell(0, 2, 14, 11, 0, b.pink ? C.pink : C.white, 2.5); circ(-8, -6, 8, b.pink ? C.pink : C.white, 2.5);
  pieEye(-10, -8, 2.4, 3.4, -.5, 0, {}); circ(-15, -4, 1.8, '#e86a8a', 0); circ(12, 4, 4, C.white, 2);
}
function drDove(b) { X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1); const f = Math.sin(b.t * 18) * 8; ell(0, 0, 14, 8, 0, C.white, 2.5); poly([-2, -2, 6, -14 - f, 12, -2], C.white, 2); circ(-12, -3, 6, C.white, 2.5); poly([-17, -3, -22, -1, -17, 0], C.orange, 1.5); circ(-13, -4, 1.4, C.ink, 0); }
function drSaw(b) { X.translate(b.x, b.y); X.rotate(b.t * -14); X.beginPath(); for (let i = 0; i < 24; i++) { const a = i * TAU / 24, r = i % 2 ? b.r : b.r * .82; X.lineTo(Math.cos(a) * r, Math.sin(a) * r); } X.closePath(); fillStroke('#c9c4b8', 2.5); circ(0, 0, b.r * .5, '#9a948a', 2); circ(0, 0, 4, C.ink, 0); }
function drMagicStar(b) { star(b.x, b.y, b.r + 2, 5, .45, b.pink ? C.pink : '#ffe27a', 2.5, b.t * 8); }
function drRing(b) { X.beginPath(); X.arc(b.x, b.y, b.r, 0, TAU); X.lineWidth = 9; X.strokeStyle = C.ink; X.stroke(); X.lineWidth = 5; X.strokeStyle = b.pink ? C.pink : '#f2c230'; X.stroke(); }
function magicPoof(x, y) { FX.puffs(x, y, 10, 22, null, 120); FX.add({ k: 'flash', x, y, r: 80, life: .2 }); FX.stars(x, y, 6, '#ffe27a'); Sfx.whoosh(); }
function* magCards(b, from) {
  const src = from || b; b.setPose('throw', .5);
  const x = src.x - 40 * (src.face || -1) * -1, y = src.y - 130;
  const n = b.cnt(5);
  b.fan(x, y, b.aimAt(x, y), n, .9, 300, { r: 11, dr: drCard, suit: pick(['s', 'd']), spin: 8 }, rndi(0, n - 1));
  Sfx.whoosh(); yield .1;
}
function* magRabbits(b) {
  b.setPose('hat', 1.2); yield .4;
  for (let i = 0; i < b.cnt(3); i++) {
    const dir = b.face; b.st.bullet({ x: b.x + dir * 20, y: b.y - 230, vx: dir * 190 * b.D.spd, vy: -300, g: 1300, r: 14, hp: 7, pink: i === 1, dr: drRabbit, bounceFloor: 1, floorY: FLOOR, onBounce: q => { q.vy = -560; Sfx.tone && AudioSys.ok && Sfx.tone('sine', 500, 800, .06, .05); } });
    Sfx.pop(); yield .55;
  }
}
function* magDoves(b) {
  b.setPose('cast', .8);
  for (let i = 0; i < b.cnt(4); i++) { const y0 = rnd(150, 300); b.st.bullet({ x: b.x, y: b.y - 160, vx: b.face * 260 * b.D.spd, vy: -80, r: 13, hp: 4, dr: drDove, upd: (q, dt, st) => { if (q.t > .7 && !q.dive) { q.dive = true; const p = st.target(q); const a = angTo(q.x, q.y, p.x, p.cy); q.vx = Math.cos(a) * 320 * b.D.spd; q.vy = Math.sin(a) * 320 * b.D.spd; } } }); yield .32; }
}
function* magTeleport(b) {
  magicPoof(b.x, b.y - 120); b.hidden = true; yield .55;
  const p = b.st.target(); const spots = [160, 480, 800].filter(x => Math.abs(x - p.x) > 200); const x = pick(spots.length ? spots : [800]);
  b.x = x; b.face = x < 480 ? 1 : x > 480 ? -1 : (p.x < 480 ? -1 : 1); if (x === 480) b.face = p.x < 480 ? -1 : 1;
  magicPoof(b.x, b.y - 120); b.hidden = false; yield .35;
}
function* magSaws(b) {
  const fromRight = b.face < 0 ? b.x > 480 : b.x > 480; const dir = fromRight ? -1 : 1, sx = dir < 0 ? W + 40 : -40;
  warnRect(b.st, dir < 0 ? W - 70 : 70, FLOOR - 30, 120, 60, .7, { col: '#ff6040' }); Sfx.warn(); yield .7;
  for (let i = 0; i < b.cnt(2); i++) { b.st.bullet({ x: sx, y: FLOOR - 26, r: 26, vx: dir * 330 * b.D.spd, dr: drSaw, margin: 100, upd: q => { if (frameNo % 4 === 0) FX.add({ k: 'spark', x: q.x, y: FLOOR - 2, vx: -dir * rnd(100, 200), vy: rnd(-200, -60), life: .2, col: C.yellow }); } }); Sfx.zap(); yield .9; }
}
function* magStars(b) {
  b.setPose('cast', .6); const x = b.x + b.face * 30, y = b.y - 200;
  for (let k = 0; k < 2; k++) { b.fan(x, y, b.aimAt(x, y), 3, .7, 250, { r: 10, dr: drMagicStar, upd: (q, dt, st) => { if (q.t < 1.2) { const p = st.target(q), a = Math.atan2(q.vy, q.vx), ta = angTo(q.x, q.y, p.x, p.cy); const da = ((ta - a + Math.PI * 3) % TAU) - Math.PI, na = a + clamp(da, -1.2 * dt, 1.2 * dt), sp = Math.hypot(q.vx, q.vy); q.vx = Math.cos(na) * sp; q.vy = Math.sin(na) * sp; } } }, k === 1 ? 2 : -1); yield .5; }
}
function* magRings(b) {
  b.setPose('cast', 1.6); const rings = [];
  for (let i = 0; i < 3; i++) rings.push(b.st.bullet({ x: b.x, y: b.y - 150, r: 18, dr: drRing, pink: i === 2, keep: true, life: 6, ang: i * TAU / 3, upd: (q, dt) => { if (!q.go) { q.ang += dt * 4; q.x = b.x + Math.cos(q.ang) * 70; q.y = b.y - 150 + Math.sin(q.ang) * 70; } } }));
  yield 1.2;
  for (const r of rings) { if (r.dead) continue; const p = b.st.target(r); const a = angTo(r.x, r.y, p.x, p.cy); r.go = true; r.keep = false; r.vx = Math.cos(a) * 360 * b.D.spd; r.vy = Math.sin(a) * 360 * b.D.spd; Sfx.whoosh(); yield .45; }
}
function* magClones(b) {
  magicPoof(b.x, b.y - 120); b.hidden = true; yield .5;
  const xs = [300, 560, 820]; const realI = rndi(0, 2);
  b.clones = [];
  xs.forEach((x, i) => { if (i === realI) { b.x = x; b.face = x > 480 ? -1 : 1; } else b.clones.push({ x, y: FLOOR, face: x > 480 ? -1 : 1, hp: 26, t: 0 }); magicPoof(x, FLOOR - 120); });
  b.hidden = false;
  for (let k = 0; k < 3; k++) {
    yield 1.2;
    const all = [b, ...b.clones.filter(c => c.hp > 0)];
    for (const c of all) { const x = c.x + c.face * 40, y = c.y - 130; b.fan(x, y, b.aimAt(x, y), b.cnt(3), .6, 280, { r: 11, dr: drCard, suit: 's', spin: 8 }, c === b && k === 1 ? 1 : -1); }
    b.setPose('throw', .4); Sfx.whoosh();
  }
  yield 1;
  for (const c of b.clones) if (c.hp > 0) magicPoof(c.x, c.y - 120);
  b.clones = [];
}
function* magSawSweep(b) {
  const low = Math.random() < .5, y = low ? FLOOR - 32 : FLOOR - 92;
  warnRect(b.st, W / 2, y, W, 60, .9, { col: '#ff6040', ix: W - 60, iy: y - 40 }); Sfx.warn(); yield .9;
  b.st.bullet({ x: W + 50, y, r: 30, vx: -520 * b.D.spd, dr: drSaw, margin: 100 }); Sfx.zap();
  yield .8;
}
BOSSES.push({
  id: 'magic', name: 'The Great Prestidigio', title: 'The Crazy Magician', world: 2, stars: 2, hp: 1600, par: 115, song: 'magic', arena: 'theatre', voice: .9,
  intro: 'Pick a card, any card... and prepare to VANISH!', quote: 'And for my next trick... you disappear!', color: '#6b3f86',
  setup(st) { st.bounds = { l: 78, r: W - 78 }; for (const [x, ph] of [[230, 0], [520, 2]]) st.solids.push({ x, y: 330, w: 100, h: 16, oneWay: true, bx: x, ph, move: (s, t) => { s.x = s.bx + Math.sin(t * .8 + s.ph) * 60; }, draw: s => { rrect(s.x, s.y, s.w, s.h + 4, 4, C.white, 2.5); for (let i = 0; i < 4; i++) heartShape(s.x + 14 + i * 24, s.y + 10, 4, i % 2 ? C.red : C.ink, 0); } }); },
  init(b) { b.x = 800; b.y = FLOOR; b.face = -1; b.clones = []; b.capeT = 0; b.hatMode = false; b.vy2 = 0; },
  phases: [
    { at: 1, name: 'Pick a Card', script: function* (b) { while (true) { yield* magCards(b); yield .9; yield* magCards(b); yield 1.1; yield* magRabbits(b); yield 1.3; yield* magDoves(b); yield 1.4; } } },
    { at: .66, name: 'The Vanishing Act', trans: 1.6, enter(b) { b.setPose('laugh', 1.5); }, script: function* (b) { while (true) { yield* magTeleport(b); yield .5; yield* magStars(b); yield .8; yield* magSaws(b); yield .8; yield* magTeleport(b); yield .4; yield* magRings(b); yield 1; } } },
    { at: .36, name: 'The Grand Illusion', trans: 1.6, enter(b) { b.setPose('laugh', 1.5); }, script: function* (b) { while (true) { yield* magClones(b); yield .8; yield* magRabbits(b); yield 1; } } },
    {
      at: .13, name: 'The Big Top Hat', trans: 2,
      enter(b, instant) { b.clones = []; b.hidden = false; const go = () => { b.hatMode = true; b.x = 790; b.y = FLOOR; b.face = -1; }; if (instant) { go(); return; } b.run(function* () { magicPoof(b.x, b.y - 120); b.hidden = true; yield .6; go(); magicPoof(790, FLOOR - 120); Camera.shake(8, .4); b.hidden = false; }); },
      script: function* (b) {
        b.run(function* () { while (true) { yield 2.2; for (let i = 0; i < b.cnt(2); i++) { b.st.bullet({ x: rnd(80, 600), y: -30, vy: 100, g: 900, r: 14, hp: 6, dr: drRabbit, vx: -60, pink: Math.random() < .3, bounceFloor: 1, onBounce: q => { q.vy = -480; q.vx = -150; } }); yield .5; } } });
        let a = 0; while (true) { for (let i = 0; i < 26; i++) { for (const arm of [0, Math.PI]) b.shot(790, FLOOR - 250, a + arm, 190, { r: 11, dr: drCard, suit: 'd', spin: 8, pink: Math.random() < .04 }); a += .3; yield .14; } yield .6; yield* magSawSweep(b); yield* magSawSweep(b); yield .4; }
      }
    }
  ],
  extraTargets(b) { return b.clones.filter(c => c.hp > 0).map(c => ({ kind: 'custom', x: c.x, y: c.y - 130, r: 42, ref: c, hit: d => { c.hp -= d; if (c.hp <= 0) { magicPoof(c.x, c.y - 120); FX.confetti(c.x, c.y - 120, 20); Sfx.pop(); Voice.laugh(.9); } return false; } })); },
  update(b, dt) {
    b.capeT += dt;
    if (b.hatMode) { b.hurt = [{ x: 790, y: FLOOR - 255, r: 32 }, { x: 790, y: FLOOR - 110, r: 72 }]; b.hit = [{ x: 790, y: FLOOR - 90, r: 66 }]; }
    else { b.hurt = [{ x: b.x, y: b.y - 110, r: 40 }, { x: b.x, y: b.y - 185, r: 26 }, { x: b.x, y: b.y - 238, r: 20 }]; b.hit = [{ x: b.x, y: b.y - 100, r: 28 }]; }
    for (const c of b.clones) c.t += dt;
    if (b.dead) b.hurt = [{ x: b.x, y: b.y - 100, r: 60 }];
  },
  dying(b, dt) { if (b.deadT > .2 && !b.poofed) { b.poofed = true; magicPoof(b.x, b.y - 120); magicPoof(b.x, b.y - 60); } },
  draw(b) {
    if (b.dead && b.poofed) { // only the hat remains, with a bunny waving a flag
      const x = b.hatMode ? 790 : b.x, s = b.hatMode ? 1.6 : 1;
      X.save(); X.translate(x, FLOOR); X.scale(s, s);
      const pop = clamp((b.deadT - .8) * 3, 0, 1);
      if (pop > 0) { X.save(); X.translate(0, -50 - pop * 20); drRabbit({ x: 0, y: 0, vx: -1, t: 0 }); line(14, -6, 26, -40, 2.5); poly([26, -40, 46, -34 + Math.sin(b.deadT * 10) * 3, 26, -26], C.white, 2); X.restore(); }
      rrect(-26, -52, 52, 48, 4, '#1e1820', 3); rrect(-26, -22, 52, 10, 2, C.red, 2.5); ell(0, -2, 38, 8, 0, '#1e1820', 3);
      X.restore(); return;
    }
    if (b.hatMode) { this.drawHat(b); return; }
    for (const c of b.clones) if (c.hp > 0) { X.save(); X.globalAlpha = .62 + Math.sin(c.t * 9) * .18; this.drawMan(b, c.x + Math.sin(c.t * 31) * 1.5, c.y, c.face, true); X.restore(); }
    shadowAt(b.x, b.y, 40, .35);
    this.drawMan(b, b.x, b.y, b.face, false);
  },
  drawMan(b, x, y, face, clone) {
    const t = b.t, pose = b.pose;
    X.save(); X.translate(x, y); X.scale(-face, 1);
    const bob = Math.sin(t * 3) * 3;
    // cape
    const fl = Math.sin(b.capeT * 3) * 8;
    X.beginPath(); X.moveTo(-26, -160 + bob); X.quadraticCurveTo(-60 - fl, -90, -54 - fl, -30); X.lineTo(40 + fl * .4, -34); X.quadraticCurveTo(40, -100, 26, -160 + bob); X.closePath(); fillStroke('#a0202a', 3);
    X.beginPath(); X.moveTo(-26, -160 + bob); X.quadraticCurveTo(-50 - fl, -100, -44 - fl, -40); X.lineTo(30, -44); X.quadraticCurveTo(30, -110, 26, -160 + bob); X.closePath(); fillStroke('#20141c', 3);
    // legs
    hose(-8, -72, -14, -8, 6, 5.5); hose(8, -72, 14, -8, -6, 5.5);
    for (const sx of [-1, 1]) { X.save(); X.translate(sx * 14, 0); X.scale(-1, 1); shoe(0, 0, sx < 0 ? 1 : -1, 1.3, '#1e1820'); rrect(-6, -12, 14, 6, 2, C.white, 1.8); X.restore(); }
    // coat
    poly([-24, -160 + bob, 24, -160 + bob, 30, -70, 6, -62, 0, -80, -6, -62, -30, -70], '#5a2f78', 3);
    poly([-9, -160 + bob, 9, -160 + bob, 0, -105], C.white, 2.5);
    poly([0, -152 + bob, -12, -160 + bob, -12, -144 + bob], C.red, 2); poly([0, -152 + bob, 12, -160 + bob, 12, -144 + bob], C.red, 2); circ(0, -152 + bob, 3, C.red, 1.5);
    for (let i = 0; i < 3; i++) circ(12, -130 + i * 18 + bob, 2.5, C.gold, 1.5);
    // arms
    let hA = [-50, -110 + bob], hB = [44, -120 + bob];
    if (pose === 'throw') hA = [-72, -150]; if (pose === 'cast') hB = [36, -230]; if (pose === 'hat') hB = [10, -232]; if (pose === 'laugh') { hA = [-30, -100 + Math.sin(t * 20) * 4]; hB = [30, -100 - Math.sin(t * 20) * 4]; }
    hose(-20, -150 + bob, hA[0], hA[1], 10, 5); glove(hA[0], hA[1], 9, Math.PI, pose === 'throw' ? 'open' : 'open');
    if (pose === 'throw' && !clone) drCard({ x: hA[0] - 6, y: hA[1] - 10, t: 0, rot: .3, suit: 'h' });
    hose(20, -150 + bob, hB[0], hB[1], -10, 5); glove(hB[0], hB[1], 9, -.6, 'fist');
    X.save(); X.translate(hB[0], hB[1]); X.rotate(-.9); rrect(-3, -40, 6, 40, 2, C.ink, 0); rrect(-3, -40, 6, 9, 2, C.white, 1.5); if (pose === 'cast') star(0, -46, 9, 5, .45, '#ffe27a', 2, t * 6); X.restore();
    // head
    const hy = -188 + bob;
    ell(0, hy, 22, 28, 0, '#f2d0b0', 3);
    const ang = b.phase >= 2;
    pieEye(-8, hy - 6, 6, 9, -.6, 0, { brow: ang ? 1.6 : -1 }); pieEye(9, hy - 6, 6, 9, -.6, 0, { brow: ang ? -1.6 : 1 });
    X.beginPath(); X.arc(9, hy - 6, 10, 0, TAU); X.lineWidth = 2; X.strokeStyle = C.gold; X.stroke(); hose(19, hy - 4, 24, hy + 20, -4, 1.5, C.gold);
    X.beginPath(); X.moveTo(-4, hy); X.quadraticCurveTo(-28, hy + 6, -24, hy + 14); X.quadraticCurveTo(-12, hy + 12, -2, hy + 6); fillStroke('#eaa585', 2.5);
    for (const sx of [-1, 1]) { X.beginPath(); X.moveTo(-6, hy + 13); X.quadraticCurveTo(sx * 20 - 6, hy + 8, sx * 24 - 6, hy + 18); X.arc(sx * 22 - 6, hy + 14, 4, Math.PI / 2, sx > 0 ? -Math.PI : Math.PI * 2, sx < 0); X.lineWidth = 3.5; X.strokeStyle = C.ink; X.stroke(); }
    if (pose === 'laugh' || ang) { X.beginPath(); X.arc(0, hy + 18, 9, 0, Math.PI); X.closePath(); fillStroke(C.white, 2.5); line(-9, hy + 18, 9, hy + 18, 1.5); }
    else { X.beginPath(); X.arc(0, hy + 16, 8, .2, Math.PI - .2); X.lineWidth = 2.5; X.strokeStyle = C.ink; X.stroke(); }
    // hat
    X.save(); X.translate(0, hy - 26); if (pose === 'hat') X.rotate(-.5);
    ell(0, 0, 32, 7, 0, '#1e1820', 3); rrect(-20, -54, 40, 54, 3, '#1e1820', 3); rrect(-20, -16, 40, 10, 2, C.red, 2.5); ell(-10, -40, 3, 10, 0, 'rgba(255,255,255,.18)', 0);
    X.restore();
    X.restore();
  },
  drawHat(b) {
    const t = b.t, x = 790, y = FLOOR, sq = 1 + Math.sin(t * 4) * .03;
    X.save(); X.translate(x, y); X.scale(1 / sq, sq);
    // head peeking
    const hy = -262 + Math.sin(t * 3) * 4;
    ell(0, hy, 30, 36, 0, '#f2d0b0', 3.5);
    pieEye(-11, hy - 8, 9, 13, -.6, .2, { brow: 1.8 }); pieEye(12, hy - 8, 9, 13, -.6, .2, { brow: -1.8 });
    X.beginPath(); X.arc(0, hy + 20, 12, 0, Math.PI); X.closePath(); fillStroke(C.white, 2.5);
    for (const sx of [-1, 1]) { X.beginPath(); X.moveTo(-6, hy + 15); X.quadraticCurveTo(sx * 28 - 6, hy + 8, sx * 32 - 6, hy + 22); X.lineWidth = 4.5; X.strokeStyle = C.ink; X.stroke(); }
    glove(-56, -214, 12, -2.4, 'open'); glove(56, -214, 12, -.7, 'open');
    // giant hat body
    rrect(-90, -205, 180, 200, 8, '#1e1820', 4); rrect(-90, -70, 180, 30, 4, C.red, 3.5);
    ell(0, -205, 106, 18, 0, '#2c2430', 4); ell(0, -205, 82, 11, 0, '#0c080c', 0);
    ell(-50, -150, 10, 40, 0, 'rgba(255,255,255,.12)', 0);
    X.restore();
  }
});

// ---------------------------------------------------------------- casino arena
ARENAS.casino = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#173a2c', '#2a5a40');
    g.save(); g.globalAlpha = .25; for (let x = -40; x < w + 40; x += 60) for (let y = 0; y < FLOOR; y += 60) poly([x, y - 22, x + 18, y, x, y + 22, x - 18, y], '#e3a623', 0); g.restore();
    blotches(g, w, FLOOR, '#000000', 20, .12);
    // giant roulette backdrop
    g.save(); g.globalAlpha = .55; circ(170, 230, 120, '#6a1a1a', 4); for (let i = 0; i < 18; i++) { const a = i * TAU / 18; g.beginPath(); g.moveTo(170, 230); g.arc(170, 230, 112, a, a + TAU / 36); g.closePath(); g.fillStyle = i % 2 ? '#1a1a1a' : '#a01e1e'; g.fill(); } circ(170, 230, 40, '#c99a35', 3); g.restore();
    // card suits
    heartShape(420, 140, 26, '#a01e1e', 3); star(560, 140, 28, 4, .4, '#1a1a1a', 3);
    // marquee sign
    rrect(330, 40, 300, 60, 10, '#3a1010', 4);
    text('JACKPOT', 480, 72, { size: 38, col: '#f2c230', stroke: 6 });
    // floor: red carpet
    g.fillStyle = '#8a1e22'; g.fillRect(0, FLOOR, w, h - FLOOR);
    g.save(); g.globalAlpha = .4; for (let x = 0; x < w; x += 40) poly([x, FLOOR + 30, x + 20, FLOOR + 14, x + 40, FLOOR + 30, x + 20, FLOOR + 46], '#e3a623', 0); g.restore();
    g.fillStyle = '#c99a35'; g.fillRect(0, FLOOR, w, 8); line(0, FLOOR, w, FLOOR, 3); line(0, FLOOR + 8, w, FLOOR + 8, 2);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .45);
  },
  live(st, t) {
    for (let i = 0; i < 19; i++) { const on = (Math.floor(t * 6) + i) % 3 === 0; const x = 336 + i * 16, y = 44; circ(x, y, 3.5, on ? '#fff3a0' : '#7a5a20', 1.2); circ(x, 96, 3.5, !on ? '#fff3a0' : '#7a5a20', 1.2); }
    X.save(); X.translate(170, 230); X.rotate(t * .4); X.globalAlpha = .3; for (let i = 0; i < 6; i++) { X.rotate(TAU / 6); line(0, 40, 0, 112, 3, '#e3a623'); } X.restore();
  }
};
// ---------------------------------------------------------------- 3. Jackpot Jimmy
const SLOT_SYMS = ['cherry', 'bell', 'seven'];
function drSym(s, x, y, r) {
  if (s === 'cherry') { hose(x - 4, y + 2, x + 2, y - r, 4, 2, '#3f6324'); hose(x + 5, y + 2, x + 2, y - r, -4, 2, '#3f6324'); circ(x - 5, y + 4, r * .45, C.red, 2); circ(x + 6, y + 5, r * .45, C.red, 2); }
  else if (s === 'bell') { X.beginPath(); X.moveTo(x - r * .7, y + r * .5); X.quadraticCurveTo(x - r * .6, y - r * .8, x, y - r * .8); X.quadraticCurveTo(x + r * .6, y - r * .8, x + r * .7, y + r * .5); X.closePath(); fillStroke(C.gold, 2); circ(x, y + r * .6, r * .2, C.gold, 1.5); }
  else if (s === 'seven') text('7', x, y + 1, { size: r * 2, col: C.red, stroke: 3 });
  else if (s === 'x') text('X', x, y + 1, { size: r * 1.8, col: C.ink });
}
function drCherry(b) { X.translate(b.x, b.y); X.rotate(b.t * 6); hose(0, -b.r, 6, -b.r - 12, 3, 2.2, '#3f6324'); circ(0, 0, b.r, b.pink ? C.pink : C.red, 2.5); circ(-b.r * .35, -b.r * .35, b.r * .25, 'rgba(255,255,255,.7)', 0); }
function drCoin(b) { X.translate(b.x, b.y); X.scale(Math.abs(Math.cos(b.t * 8)) * .8 + .2, 1); circ(0, 0, b.r, b.pink ? C.pink : C.gold, 2.5); text('$', 0, 1, { size: b.r * 1.3, col: b.pink ? C.white : '#a07010' }); }
function drBell(b) { X.translate(b.x, b.y); X.rotate(Math.sin(b.t * 12) * .3); drSym('bell', 0, 0, b.r); }
function drSeven(b) { X.translate(b.x, b.y); X.rotate(Math.sin(b.t * 6) * .3); text('7', 0, 0, { size: 40, col: b.pink ? C.pink : C.red, stroke: 5 }); }
function drWave(b) { X.save(); X.translate(b.x, b.y); X.scale(b.vx < 0 ? 1 : -1, 1); for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(10 + i * 7, 0, b.r - i * 4, Math.PI * .6, Math.PI * 1.4); X.lineWidth = 4; X.strokeStyle = i ? '#f2c230' : C.ink; X.stroke(); } X.restore(); }
function drDice(b) { X.translate(b.x, b.y); X.rotate(b.rot || 0); rrect(-b.r, -b.r, b.r * 2, b.r * 2, 8, b.pink ? C.pink : C.white, 3); const d = b.r * .45; for (const [dx, dy] of [[-d, -d], [d, d], [0, 0], [d, -d], [-d, d]]) circ(dx, dy, b.r * .13, C.ink, 0); }
function drChip(b) { X.translate(b.x, b.y); X.rotate(b.t * 12); X.scale(1, .55); circ(0, 0, b.r, b.pink ? C.pink : '#2f6fb0', 3); for (let i = 0; i < 6; i++) { X.save(); X.rotate(i * TAU / 6); rrect(-3, -b.r, 6, 7, 1, C.white, 0); X.restore(); } circ(0, 0, b.r * .55, C.white, 2); }
function drShock(b) { X.translate(b.x, b.y); X.beginPath(); X.moveTo(-b.w / 2, b.h / 2); X.quadraticCurveTo(0, -b.h * .9, b.w / 2, b.h / 2); X.closePath(); fillStroke('#f2c230', 3); }
function* slotPull(b) {
  b.lever = 1; Sfx.thud(); b.reels = [null, null, null]; b.spinning = true; yield .25;
  const sym = pick(SLOT_SYMS);
  for (let i = 0; i < 3; i++) { yield .35; b.reels[i] = sym; Inst.wood && AudioSys.ok && Inst.wood(AudioSys.t, .8, AudioSys.sfx, true); }
  b.spinning = false; yield .3;
  Sfx.bell(); b.setPose('open', 1);
  if (sym === 'cherry') { for (let i = 0; i < b.cnt(3); i++) { b.st.bullet({ x: b.x - 80, y: b.y - 120, vx: -rnd(200, 300) * b.D.spd, vy: -rnd(300, 500), g: 1100, r: 14, dr: drCherry, pink: i === 1, bounceFloor: .82, life: 5, onEnd: (q, st) => { } }); yield .35; } }
  else if (sym === 'bell') {
    const xs = []; for (let i = 0; i < b.cnt(3); i++) xs.push(rnd(60, 620));
    for (const x of xs) warnRect(b.st, x, 40, 40, 50, .7, { icon: true, col: '#ffd040' });
    yield .7;
    for (const x of xs) b.st.bullet({ x, y: -20, vy: 200, g: 1400, r: 18, dr: drBell, floorDie: true, onFloor: (q, st) => { Sfx.bell(); Camera.shake(3, .15); for (const d of [-1, 1]) st.bullet({ x: q.x, y: FLOOR - 14, r: 14, vx: d * 230 * b.D.spd, dr: drWave, life: 3 }); } });
    yield .5;
  } else {
    for (let i = 0; i < b.cnt(3); i++) { const y0 = rnd(240, 420); b.st.bullet({ x: b.x - 80, y: y0, y0, vx: -240 * b.D.spd, r: 18, dr: drSeven, pink: i === 2, upd: q => { q.y = q.y0 + Math.sin(q.t * 5) * 60; } }); yield .4; }
  }
  b.lever = 0;
}
function* slotCoins(b) { b.setPose('open', .9); for (let i = 0; i < b.cnt(3); i++) { const p = b.st.target(); b.lob(b.x - 70, b.y - 60, clamp(p.x + rnd(-60, 60), 30, 680), FLOOR - 8, 1, { r: 11, g: 1000, dr: drCoin, pink: i === 1, floorDie: true }); Sfx.coin(); yield .3; } }
function* slotDice(b) {
  b.hop = 1; yield .3;
  for (let i = 0; i < b.cnt(2); i++) { b.st.bullet({ x: b.x - 90, y: FLOOR - 30, r: 30, vx: -260 * b.D.spd, vy: -300, g: 1500, dr: drDice, bounceFloor: .9, floorY: FLOOR, spin: -6, margin: 80, onBounce: q => { Sfx.thud(); if (q.vy > -260) q.vy = -460; } }); Sfx.whoosh(); yield 1; }
}
function* slotChips(b) {
  for (let i = 0; i < b.cnt(2); i++) { const y = rnd(260, 400); b.st.bullet({ x: b.x - 80, y, r: 18, vx: -520 * b.D.spd, dr: drChip, pink: i === 1, life: 4, upd: (q, dt) => { q.vx += 520 * b.D.spd * dt * 1.1; } }); Sfx.whoosh(); yield .55; }
}
function* slotRoulette(b) {
  b.wheelOpen = true; yield .4; let a = Math.PI * .5;
  for (let i = 0; i < 34 + b.n * 6; i++) { b.shot(b.x - 20, b.y - 140, a, 230, { r: 9, col: C.white, pink: i % 11 === 5 }); a += .27; if (a > Math.PI * 1.5) a -= Math.PI; Sfx.tone && AudioSys.ok && i % 3 === 0 && Inst.wood(AudioSys.t, .5, AudioSys.sfx, true); yield .1; }
  b.wheelOpen = false;
}
function* slotCardWall(b) {
  const gap = rnd(80, 600); const xs = []; for (let x = 30; x < 760; x += 46) if (Math.abs(x - gap) > 70) xs.push(x);
  for (const x of xs) warnRect(b.st, x, 30, 30, 40, .7, { icon: false, col: '#ffd040' }); Sfx.warn(); yield .7;
  for (const x of xs) b.st.bullet({ x, y: -20, vy: 330 * b.D.spd, r: 12, dr: drCard, suit: 'd', spin: 6 });
  yield 1;
}
function* slotTilt(b) {
  for (let k = 0; k < 3; k++) {
    const p = b.st.target(); const tx = clamp(p.x, 120, 840);
    warnRect(b.st, tx, FLOOR - 10, 160, 20, .55, { col: '#ff5040', iy: FLOOR - 60 }); b.squash = 1; yield .5;
    const sx = b.x, T = .75; for (let e = 0; e < T; e += DT) { const k2 = e / T; b.x = lerp(sx, tx, k2); b.y = FLOOR - Math.sin(k2 * Math.PI) * 240; yield 0; }
    b.x = tx; b.y = FLOOR; Camera.shake(10, .3); Sfx.thud(); FX.puffs(b.x, FLOOR - 10, 8, 20);
    for (const d of [-1, 1]) b.st.bullet({ x: b.x + d * 80, y: FLOOR - 18, w: 40, h: 36, shape: 'rect', r: 20, vx: d * 340 * b.D.spd, dr: drShock });
    yield .45;
  }
  yield* tween(b, 780, FLOOR, .6, ease.io);
}
BOSSES.push({
  id: 'slot', name: 'Jackpot Jimmy', title: 'The Living Slot Machine', world: 2, stars: 3, hp: 1900, par: 130, song: 'slot', arena: 'casino', voice: .8,
  intro: 'Step right up! The house ALWAYS wins, see?', quote: 'Tough luck, pal! Insert another coin!', color: '#c8382c',
  setup(st) { },
  init(b) { b.x = 780; b.y = FLOOR; b.reels = ['seven', 'seven', 'seven']; b.lever = 0; b.hop = 0; b.squash = 0; b.wheelOpen = false; },
  phases: [
    { at: 1, name: "Feelin' Lucky", script: function* (b) { while (true) { yield* slotPull(b); yield 1.1; yield* slotCoins(b); yield 1.2; } } },
    {
      at: .66, name: 'Roll the Dice', trans: 1.6,
      enter(b) { for (const [x, ph] of [[180, 0], [380, 1.6], [580, 3.2]]) if (!b.st.solids.some(s => s.chip && s.x === x)) b.st.solids.push({ x, y: 360, w: 70, h: 16, oneWay: true, chip: true, ph, move: (s, t) => { s.y = 330 + Math.sin(t * 1.1 + s.ph) * 50; }, draw: s => { for (let i = 0; i < 3; i++) ell(s.x + 35, s.y + 8 + i * 9, 35, 9, 0, ['#2f6fb0', C.red, C.white][i], 2.5); } }); },
      script: function* (b) { while (true) { yield* slotDice(b); yield .9; yield* slotChips(b); yield 1; yield* slotCoins(b); yield 1; yield* slotPull(b); yield 1; } }
    },
    { at: .36, name: 'Roulette Rumble', trans: 1.6, script: function* (b) { while (true) { yield* slotRoulette(b); yield 1; yield* slotCardWall(b); yield .8; yield* slotChips(b); yield 1; } } },
    { at: .13, name: 'TILT!', trans: 1.6, enter(b) { b.tilt = true; b.st.tint = { c: '#ff2020', a: .08 }; }, script: function* (b) { b.run(function* () { while (true) { yield 1.4; for (let i = 0; i < 3; i++) { b.st.bullet({ x: rnd(40, 900), y: -20, vy: 150, g: 700, r: 10, dr: drCoin, floorDie: true, pink: Math.random() < .15 }); yield .2; } } }); while (true) { yield* slotTilt(b); yield 1; yield* slotCoins(b); yield .8; } } }
  ],
  update(b, dt) {
    if (b.hop > 0) b.hop = Math.max(0, b.hop - dt * 2); if (b.squash > 0) b.squash = Math.max(0, b.squash - dt * 2);
    const y = b.y - (b.hop > 0 ? Math.sin(b.hop * Math.PI) * 40 : 0);
    b.dy = y;
    b.hurt = [{ x: b.x, y: y - 150, r: 80 }, { x: b.x, y: y - 260, r: 50 }]; b.hit = [{ x: b.x, y: y - 120, r: 70 }];
  },
  dying(b, dt) { if (frameNo % 3 === 0 && b.deadT < 3) b.st.bullet({ x: b.x, y: b.y - 260, vx: rnd(-300, 300), vy: rnd(-600, -300), g: 1000, r: 8, harmless: true, dr: drCoin, life: 2 }); },
  draw(b) {
    const t = b.t, y0 = b.dy ?? b.y, sq = 1 - b.squash * .12 + (b.dead ? Math.sin(t * 40) * .02 : 0);
    shadowAt(b.x, FLOOR, 90, .35);
    X.save(); X.translate(b.x, y0); X.scale(1 / sq, sq); if (b.tilt && !b.dead) X.rotate(Math.sin(t * 5) * .06);
    // legs
    for (const sx of [-1, 1]) { hose(sx * 40, -30, sx * 50, -6, sx * 6, 7); shoe(sx * 50, 0, sx < 0 ? -1 : 1, 1.7, '#3a2418'); }
    // lever arm
    const la = b.lever ? 1.1 : -.4;
    hose(90, -180, 90 + Math.cos(-1.3 + la) * 70, -180 + Math.sin(-1.3 + la) * 70, -10, 6);
    const lx = 90 + Math.cos(-1.3 + la) * 70, ly = -180 + Math.sin(-1.3 + la) * 70; glove(lx, ly, 12, -1, 'fist'); circ(lx + 4, ly - 16, 13, C.red, 3);
    // other arm
    hose(-90, -170, -116, -110 + Math.sin(t * 4) * 8, 10, 6); glove(-116, -110 + Math.sin(t * 4) * 8, 12, 2, 'open');
    // cabinet
    rrect(-92, -300, 184, 280, 18, '#c8382c', 4);
    rrect(-80, -250, 160, 100, 10, '#e3a623', 3.5);
    // dome & eyes
    X.beginPath(); X.moveTo(-80, -296); X.quadraticCurveTo(0, -370, 80, -296); X.closePath(); fillStroke(C.gold, 4);
    const blink = (t % 4 < .1) || b.dead;
    if (b.dead) { xEye(-34, -310, 10); xEye(34, -310, 10); }
    else { pieEye(-30, -312, 14, 16, -.6, .2, { blink: blink ? 1 : 0, brow: b.tilt ? 1.5 : -.5 }); pieEye(30, -312, 14, 16, -.6, .2, { blink: blink ? 1 : 0, brow: b.tilt ? -1.5 : .5 }); }
    circ(0, -362, 10, (Math.floor(t * 5) % 2 || b.tilt) ? '#ff5040' : '#fff0a0', 3);
    // reels
    for (let i = 0; i < 3; i++) {
      const rx = -52 + i * 52; rrect(rx - 22, -240, 44, 80, 6, C.cream, 2.5);
      X.save(); X.beginPath(); X.rect(rx - 22, -240, 44, 80); X.clip();
      if (b.dead) drSym('x', rx, -200, 20);
      else if (b.spinning && !b.reels[i]) { const off = (t * 900) % 60; for (let k = -1; k < 2; k++) drSym(SLOT_SYMS[(k + 9 + Math.floor(t * 15)) % 3], rx, -200 + k * 60 + off - 30, 18); }
      else drSym(b.reels[i] || 'seven', rx, -200, 20);
      X.restore();
    }
    // mouth / coin tray
    const open = b.pose === 'open' || b.dead;
    rrect(-60, -130, 120, open ? 56 : 24, 10, '#3a0d0d', 3.5);
    if (open) { for (let i = 0; i < 5; i++) rrect(-50 + i * 20, -130, 16, 12, 3, C.gold, 2); X.fillStyle = '#7a1a1a'; ell(0, -90, 30, 10, 0, '#a02020', 0); }
    else line(-50, -118, 50, -118, 2, C.gold);
    rrect(-70, -60, 140, 30, 6, '#8e2219', 3); text(b.tilt ? 'TILT' : 'PLAY', 0, -45, { size: 18, col: b.tilt && Math.floor(t * 8) % 2 ? '#ff5040' : C.gold });
    if (b.wheelOpen) { X.save(); X.translate(-20, -140); circ(0, 0, 60, '#1a1a1a', 4); for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 8; X.beginPath(); X.moveTo(0, 0); X.arc(0, 0, 55, a, a + TAU / 24); X.closePath(); X.fillStyle = i % 2 ? '#a01e1e' : '#1a1a1a'; X.fill(); } circ(0, 0, 16, C.gold, 3); X.restore(); }
    if (b.dead && b.deadT > 1) { X.save(); X.translate(0, -200); X.rotate(-.12); rrect(-80, -22, 160, 44, 6, C.cream, 3); text('OUT OF ORDER', 0, 1, { size: 18, col: C.red }); X.restore(); }
    X.restore();
  }
});

// ---------------------------------------------------------------- ghost ship arena
ARENAS.ship = {
  paint(g, w, h) {
    skyGrad(g, w, h, '#16202e', '#3d5a5e');
    for (let i = 0; i < 40; i++) circ(rnd(w), rnd(260), rnd(.8, 2), '#f6efd6', 0);
    g.save(); g.globalAlpha = .9; circ(720, 110, 56, '#f3ecc8', 3); circ(700, 100, 10, '#d8cfa6', 0); circ(735, 125, 7, '#d8cfa6', 0); g.restore();
    cloudPuff(640, 150, 22, '#3a4a58', 2); cloudPuff(820, 90, 18, '#3a4a58', 2);
    wash(g, gg => { gg.rect(0, 300, w, 120); }, '#24414a', { alpha: .6, edge: false });
    // mast & sail
    rrect(470, 20, 20, 360, 4, '#5a3a22', 3); rrect(370, 70, 220, 10, 3, '#5a3a22', 3);
    wash(g, gg => { gg.moveTo(380, 80); gg.quadraticCurveTo(480, 120, 580, 80); gg.lineTo(570, 240); gg.lineTo(530, 220); gg.lineTo(500, 250); gg.lineTo(450, 225); gg.lineTo(420, 250); gg.lineTo(390, 230); gg.closePath(); }, '#cfc6a8', { alpha: .5 });
    g.save(); g.globalAlpha = .7; circ(480, 150, 26, '#2a2a2a', 0); circ(472, 146, 5, '#cfc6a8', 0); circ(488, 146, 5, '#cfc6a8', 0); g.restore();
    for (const [x1, y1, x2, y2] of [[480, 30, 120, 380], [480, 30, 860, 380], [480, 70, 260, 380], [480, 70, 700, 380]]) line(x1, y1, x2, y2, 1.5, 'rgba(30,20,10,.7)');
    // rail
    g.fillStyle = '#4a2e1c'; g.fillRect(0, 380, w, 14); line(0, 380, w, 380, 3); for (let x = 10; x < w; x += 36) rrect(x, 394, 10, 76, 2, '#5a3a22', 2);
    // deck
    g.fillStyle = '#6a4428'; g.fillRect(0, FLOOR, w, h - FLOOR);
    for (let y = FLOOR; y < h; y += 16) line(0, y, w, y, 1.5, 'rgba(30,15,5,.6)');
    for (let i = 0; i < 30; i++) { const y = FLOOR + Math.floor(rnd(0, 5)) * 16, x = rnd(w); line(x, y, x, y + 16, 1.5, 'rgba(30,15,5,.6)'); circ(x + 6, y + 8, 1.4, '#2a1a0a', 0); }
    line(0, FLOOR, w, FLOOR, 3);
    Paper.apply(g, w, h, .3); vignetteOn(g, w, h, .5);
  },
  live(st, t) {
    X.save(); X.globalAlpha = .5; for (let k = 0; k < 2; k++) { X.beginPath(); X.moveTo(0, 340 + k * 20); for (let x = 0; x <= W; x += 40) X.quadraticCurveTo(x + 20, 330 + k * 20 + Math.sin(t * 2 + x * .02 + k) * 8, x + 40, 340 + k * 20); X.lineWidth = 2; X.strokeStyle = '#8fb8b4'; X.stroke(); } X.restore();
    for (const x of [130, 830]) { const f = .7 + Math.sin(t * 9 + x) * .15; const gr = X.createRadialGradient(x, 300, 2, x, 300, 60); gr.addColorStop(0, 'rgba(120,255,170,' + .45 * f + ')'); gr.addColorStop(1, 'rgba(120,255,170,0)'); X.fillStyle = gr; X.fillRect(x - 60, 240, 120, 120); line(x, 260, x, 284, 2); rrect(x - 9, 284, 18, 26, 4, 'rgba(160,255,190,.8)', 2.5); }
    if (st.rain) { X.save(); X.globalAlpha = .45; for (let i = 0; i < 60; i++) { const x = (i * 71 + t * 600) % (W + 100) - 50, y = (i * 137 + t * 900) % H; line(x, y, x - 8, y + 20, 1.5, '#cfe8ff'); } X.restore(); if (Math.random() < .006) st.flash = .25; }
  }
};
// ---------------------------------------------------------------- 4. Captain Barnacle Bones
function drPellet(b) { circ(b.x, b.y, b.r, b.pink ? C.pink : '#bfe8c8', 2.2); }
function drCannon(b) { circ(b.x, b.y, b.r, b.pink ? C.pink : '#2a2a2a', 3); circ(b.x - b.r * .35, b.y - b.r * .35, b.r * .25, '#6a6a6a', 0); }
function drSkull(b) { X.translate(b.x, b.y); X.save(); X.globalAlpha *= .9; X.beginPath(); X.moveTo(-12, 0); X.quadraticCurveTo(0, 30 + Math.sin(b.t * 10) * 4, 12, 0); X.fillStyle = 'rgba(140,255,180,.5)'; X.fill(); X.restore(); circ(0, 0, b.r, b.pink ? C.pink : '#d8f8e0', 2.5); circ(-4, -1, 3.5, C.ink, 0); circ(4, -1, 3.5, C.ink, 0); rrect(-5, 6, 10, 5, 1, C.white, 1.5); }
function drParrot(b) {
  X.translate(b.x, b.y); X.scale(b.vx > 0 ? -1 : 1, 1); X.globalAlpha *= .9; const f = Math.sin(b.t * 16) * 10;
  ell(0, 0, 18, 12, -.2, b.pink ? C.pink : '#7ce0a0', 2.5); poly([4, -4, 14, -22 - f, 20, -2], b.pink ? C.pinkL : '#5ac080', 2); circ(-14, -8, 10, b.pink ? C.pink : '#7ce0a0', 2.5);
  poly([-22, -10, -32, -4, -22, -2], '#f2c230', 2); pieEye(-16, -10, 3, 4, -.6, 0, {}); poly([16, 2, 30, 8, 28, -2], b.pink ? C.pinkL : '#5ac080', 2);
}
function drAnchor(b) { X.translate(b.x, b.y); line(0, -b.h, 0, -40, 4, '#6a6a6a'); X.beginPath(); X.moveTo(0, -40); X.lineTo(0, 30); X.moveTo(-34, 6); X.quadraticCurveTo(0, 50, 34, 6); X.lineWidth = 10; X.strokeStyle = C.ink; X.stroke(); X.lineWidth = 6; X.strokeStyle = '#8a8a8a'; X.stroke(); circ(0, -46, 9, null, 5); rrect(-20, -26, 40, 8, 3, '#8a8a8a', 2.5); }
function drCutlass(b) { X.translate(b.x, b.y); X.rotate(b.t * 14); X.beginPath(); X.moveTo(-30, 0); X.quadraticCurveTo(0, -14, 34, -2); X.lineTo(30, 4); X.quadraticCurveTo(0, -4, -30, 6); X.closePath(); fillStroke('#d8d8d0', 2.5); rrect(-38, -4, 10, 12, 2, C.gold, 2); }
function drGWave(b) { X.save(); X.globalAlpha *= .85; X.translate(b.x, b.y); X.beginPath(); X.moveTo(-b.w / 2, b.h / 2); X.quadraticCurveTo(-b.w / 2, -b.h / 2, 0, -b.h / 2); X.quadraticCurveTo(b.w / 2, -b.h / 2, b.w / 2 - 10, -b.h / 2 + 18); X.quadraticCurveTo(b.w / 2 + 10, b.h / 4, b.w / 2, b.h / 2); X.closePath(); fillStroke('rgba(120,240,190,.75)', 3); for (let i = 0; i < 3; i++) circ(-20 + i * 18, -b.h / 2 + 6, 5, '#e0fff0', 1.5); X.restore(); }
function* pirBlunder(b) { for (let k = 0; k < 2; k++) { b.setPose('aim', .5); yield .35; const x = b.x - 90, y = b.y - 120; b.fan(x, y, b.aimAt(x, y), b.cnt(5), .7, 360, { r: 8, dr: drPellet }, k === 1 ? 2 : -1); Sfx.boom(.4); FX.puffs(x, y, 4, 12, '#cfc6a8'); yield .7; } }
function* pirCannons(b) {
  for (let i = 0; i < b.cnt(3); i++) { const p = b.st.target(), tx = clamp(p.x + rnd(-40, 40), 30, 700); warnRect(b.st, tx, FLOOR - 6, 70, 12, 1.1, { col: '#ff5040', iy: FLOOR - 40 }); b.lob(900, 380, tx, FLOOR - 14, 1.1, { r: 16, g: 900, dr: drCannon, floorDie: true, onFloor: (q, st) => { FX.boom(q.x, q.y, .7); } }); Sfx.boom(.5); FX.puffs(900, 380, 4, 14); yield .55; }
}
function* pirParrot(b) {
  const p0 = b.st.target(); b.parrotOut = true;
  b.st.bullet({ x: b.x - 30, y: b.y - 190, vx: -100, vy: -200, r: 16, pink: true, dr: drParrot, life: 4.5, keep: true, upd: (q, dt, st) => { if (q.t < .9) { q.vy += 300 * dt; } else if (!q.dove) { q.dove = true; const p = st.target(q); const a = angTo(q.x, q.y, p.x, p.cy); q.vx = Math.cos(a) * 420 * b.D.spd; q.vy = Math.sin(a) * 420 * b.D.spd; Voice.babble(2, 700, { vowel: 2 }); } if (q.x < -40 || q.y > H + 40) q.dead = true; }, onEnd: () => { b.parrotOut = false; }, onParry: () => { b.parrotOut = false; } });
  yield 1.6; b.parrotOut = false;
}
function* pirSkulls(b) { for (let i = 0; i < b.cnt(4); i++) { const x = rnd(80, 640); b.st.bullet({ x, y: FLOOR + 10, x0: x, vy: -70 * b.D.spd, r: 14, hp: 5, dr: drSkull, pink: i === 2, life: 9, upd: (q, dt, st) => { const p = st.target(q); q.x0 += clamp(p.x - q.x0, -1, 1) * 45 * dt; q.x = q.x0 + Math.sin(q.t * 3) * 30; } }); FX.puffs(x, FLOOR, 2, 10, '#bfe8c8'); yield .5; } }
function* pirAnchors(b) {
  for (let i = 0; i < b.cnt(3); i++) {
    const p = b.st.target(), x = clamp(p.x, 40, 720);
    warnRect(b.st, x, FLOOR - 60, 76, 120, .8, { col: '#ff5040', iy: 60 }); Sfx.warn(); yield .8;
    b.st.bullet({ x, y: -60, w: 66, h: 80, shape: 'rect', vy: 1300, r: 30, dr: q => drAnchor({ x: q.x, y: q.y, h: q.y + 80 }), keep: true, life: 3.2, upd: (q) => { const by = FLOOR - 40; if (!q.up && q.y >= by) { q.y = by; q.vy = 0; if (!q.hitT) { q.hitT = q.t; Camera.shake(7, .25); Sfx.thud(); FX.puffs(q.x, FLOOR - 4, 5, 14); } if (q.t - q.hitT > .8) { q.up = true; q.vy = -900; } } if (q.up && q.y < -100) q.dead = true; } });
    yield .6;
  }
}
function* pirCutlass(b) { for (let i = 0; i < 2; i++) { const y = rnd(280, 420); b.st.bullet({ x: b.x - 60, y, r: 22, vx: -560 * b.D.spd, dr: drCutlass, pink: i === 1, life: 4, upd: (q, dt) => { q.vx += 560 * b.D.spd * 1.15 * dt; } }); Sfx.whoosh(); yield .6; } }
function* pirHook(b) {
  const p = b.st.target(), x = clamp(p.x, 60, 700);
  warnRect(b.st, x, FLOOR - 140, 120, 280, .8, { col: '#60ffb0', iy: 40 }); yield .8;
  b.hook = { x, t: 0 }; Sfx.whoosh();
  b.st.bullet({ x, y: -140, w: 90, h: 200, shape: 'rect', vy: 1500, harmlessDraw: true, dr: () => { }, keep: true, life: 1.4, upd: q => { if (b.hook) b.hook.y = q.y; if (q.y > FLOOR - 100) { q.y = FLOOR - 100; q.vy = 0; if (!q.hitT) { q.hitT = q.t; Camera.shake(8, .3); Sfx.thud(); } } } });
  yield 1.3; b.hook = null;
}
function* pirWave(b) { warnRect(b.st, W - 60, FLOOR - 40, 100, 80, .7, { col: '#60ffb0' }); Sfx.splash(); yield .7; b.st.bullet({ x: W + 60, y: FLOOR - 32, w: 90, h: 64, shape: 'rect', vx: -300 * b.D.spd, dr: drGWave, margin: 120 }); yield 1.2; }
function* pirBarrage(b) { const xs = []; for (let i = 0; i < b.cnt(5); i++) xs.push(40 + i * (680 / b.cnt(5)) + rnd(0, 60)); for (const x of xs) warnRect(b.st, x, FLOOR - 6, 60, 12, 1, { col: '#ff5040', iy: FLOOR - 40 }); yield 1; for (const x of xs) { b.st.bullet({ x, y: -20, vy: 700, r: 16, dr: drCannon, floorDie: true, onFloor: q => FX.boom(q.x, q.y, .6) }); yield .12; } yield .6; }
BOSSES.push({
  id: 'pirate', name: 'Captain Barnacle Bones', title: 'The Haunted Pirate', world: 3, stars: 4, hp: 2100, par: 140, song: 'pirate', arena: 'ship', voice: .6,
  intro: 'Yo ho ho! Ye be walkin\' the plank, matey!', quote: 'Arr! Off to Davy\'s locker with ye!', color: '#3c8f8a',
  setup(st) { st.solids.push({ x: 220, y: 386, w: 90, h: 84, draw: s => { rrect(s.x, s.y, s.w, s.h, 4, '#8a5a34', 3); line(s.x, s.y + 28, s.x + s.w, s.y + 28, 2); line(s.x, s.y + 56, s.x + s.w, s.y + 56, 2); } }); st.solids.push({ x: 470, y: 320, w: 90, h: 16, oneWay: true, draw: s => { rrect(s.x, s.y, s.w, s.h + 8, 4, '#7a4a2a', 3); line(s.x + 10, s.y + 24, s.x + 10, FLOOR, 4, '#5a3a22'); line(s.x + s.w - 10, s.y + 24, s.x + s.w - 10, FLOOR, 4, '#5a3a22'); } }); },
  init(b) { b.x = 790; b.y = FLOOR; b.giant = false; b.parrotOut = false; b.hook = null; b.jaw = 0; },
  phases: [
    { at: 1, name: 'Fire in the Hole', script: function* (b) { while (true) { yield* pirBlunder(b); yield .8; yield* pirCannons(b); yield 1; yield* pirParrot(b); yield .8; } } },
    { at: .66, name: 'All Hands on Deck', trans: 1.6, script: function* (b) { b.run(function* () { while (true) { yield 2.5; yield* pirSkulls(b); } }); while (true) { yield* pirAnchors(b); yield 1; yield* pirCutlass(b); yield 1; yield* pirBlunder(b); yield 1; } } },
    { at: .36, name: "Davy's Wrath", trans: 2.2, enter(b, instant) { b.giantT = instant ? 1 : 0; b.giant = true; }, script: function* (b) { while (true) { yield* pirHook(b); yield .6; yield* pirWave(b); yield .4; yield* pirBarrage(b); yield .6; yield* pirHook(b); yield .5; yield* pirWave(b); yield .8; } } },
    { at: .13, name: 'Ghost Ship Gale', trans: 1.6, enter(b) { b.giant = true; b.giantT = 1; b.st.rain = true; b.st.tint = { c: '#103a30', a: .18 }; }, script: function* (b) { b.run(function* () { while (true) { yield 3; b.pull = 2.2; yield 2.4; b.pull = 0; } }); let a = Math.PI * .6; while (true) { for (let i = 0; i < 3; i++) b.shot(700, 260, a + i * .5, 200, { r: 13, dr: drSkull, pink: Math.random() < .08 }); a += .23; if (a > Math.PI * 1.3) a = Math.PI * .6; yield .32; } } }
  ],
  update(b, dt) {
    b.jaw = Math.abs(Math.sin(b.t * 9)) * 4;
    if (b.giant) b.giantT = Math.min(1, (b.giantT || 0) + dt * .8);
    if (b.pull > 0) { b.pull -= dt; for (const p of b.st.alive()) p.x += clamp(600 - p.x, -1, 1) * 95 * dt; if (frameNo % 2 === 0) { const sx = rnd(W); FX.add({ k: 'spark', x: sx, y: rnd(250, 460), vx: 260 * Math.sign(600 - sx), vy: 0, col: '#bfe8c8', life: .4 }); } }
    if (b.giant && b.giantT > .5) { b.hurt = [{ x: 720, y: 220, r: 90 }]; b.hit = []; if (b.hook && b.hook.y) b.hit = [{ x: b.hook.x, y: b.hook.y + 30, r: 36 }]; }
    else { b.hurt = [{ x: b.x, y: b.y - 90, r: 46 }, { x: b.x - 5, y: b.y - 170, r: 32 }]; b.hit = [{ x: b.x, y: b.y - 80, r: 34 }]; }
  },
  dying(b, dt) { },
  draw(b) {
    const t = b.t;
    if (b.giant) {
      const k = b.giantT || 0;
      X.save(); X.globalAlpha = .35 + k * .45; X.translate(720, 230 + Math.sin(t * 1.5) * 8); X.scale(.4 + k * .6, .4 + k * .6);
      const gr = X.createRadialGradient(0, 0, 20, 0, 0, 220); gr.addColorStop(0, 'rgba(120,255,180,.5)'); gr.addColorStop(1, 'rgba(120,255,180,0)'); X.fillStyle = gr; X.fillRect(-220, -220, 440, 440);
      X.beginPath(); X.moveTo(-150, 260); X.quadraticCurveTo(-180, 0, -110, -80); X.quadraticCurveTo(0, -150, 110, -80); X.quadraticCurveTo(180, 0, 150, 260); X.closePath(); fillStroke('rgba(150,240,200,.55)', 4);
      this.drawSkull(b, 0, -40, 2.6, true);
      X.restore();
      if (b.hook && b.hook.y) { X.save(); line(b.hook.x + 30, 0, b.hook.x + 30, b.hook.y - 40, 8, 'rgba(150,240,200,.6)'); X.translate(b.hook.x, b.hook.y + 20); X.beginPath(); X.moveTo(30, -60); X.lineTo(30, 0); X.arc(0, 0, 30, 0, Math.PI * .9); X.lineWidth = 14; X.strokeStyle = C.ink; X.stroke(); X.lineWidth = 9; X.strokeStyle = '#c8d0d0'; X.stroke(); X.restore(); }
      if (k > .5 && !b.dead) return;
    }
    if (b.dead && b.deadT > .6) { // pile of bones with hat on top
      X.save(); X.translate(b.giant ? 640 : b.x, FLOOR);
      for (let i = 0; i < 7; i++) { X.save(); X.translate(-40 + i * 13, -6 - (i % 3) * 5); X.rotate(i * .9); rrect(-14, -3, 28, 6, 3, '#efe8d4', 2); circ(-14, 0, 4, '#efe8d4', 1.5); circ(14, 0, 4, '#efe8d4', 1.5); X.restore(); }
      this.drawSkull(b, 0, -26, .9, false, true);
      X.save(); X.translate(4, -48); poly([-34, 6, 0, -18, 34, 6, 0, 0], '#22263a', 2.5); X.restore();
      X.restore(); return;
    }
    X.save(); X.translate(b.x, b.y);
    shadowAt(0, 0, 44, .35);
    const sway = Math.sin(t * 2) * 4;
    // aura
    const gr = X.createRadialGradient(0, -110, 10, 0, -110, 130); gr.addColorStop(0, 'rgba(120,255,180,.25)'); gr.addColorStop(1, 'rgba(120,255,180,0)'); X.fillStyle = gr; X.fillRect(-130, -240, 260, 260);
    // legs: peg + boot
    line(10, -60, 14, 0, 9, C.ink); line(10, -60, 14, 0, 5, '#8a5a34'); hose(-14, -60, -20, -8, 6, 6); shoe(-20, 0, -1, 1.5, '#2a1a10');
    // coat
    poly([-36, -150 + sway * .3, 36, -150 + sway * .3, 48, -50, 20, -46, 0, -64, -20, -46, -48, -50], '#22263a', 3.5);
    poly([-12, -150, 12, -150, 6, -80, -6, -80], '#efe8d4', 2.5); for (let i = 0; i < 4; i++) line(-6, -140 + i * 16, 6, -140 + i * 16, 2, '#9a9080');
    rrect(-40, -86, 80, 12, 2, '#5a3a22', 2.5); rrect(-8, -88, 16, 16, 2, C.gold, 2.5);
    for (let i = 0; i < 3; i++) { circ(-26, -136 + i * 18, 3, C.gold, 1.5); circ(26, -136 + i * 18, 3, C.gold, 1.5); }
    // arms
    const aim = b.pose === 'aim';
    hose(-30, -140, aim ? -70 : -50, aim ? -122 : -96, 8, 7, '#e9e2cf'); hose(-30, -140, aim ? -70 : -50, aim ? -122 : -96, 8, 3, C.ink);
    X.save(); X.translate(aim ? -70 : -50, aim ? -122 : -96); X.rotate(aim ? b.aimAt(b.x - 90, b.y - 120) + Math.PI : 2.4);
    X.scale(1, -1); rrect(-6, -6, 54, 12, 3, '#5a3a22', 2.5); poly([44, -10, 64, -14, 64, 14, 44, 10], '#8a8a8a', 2.5); glove(0, 0, 8, 0, 'fist', '#efe8d4'); X.restore();
    hose(30, -140, 54, -100 + sway, -8, 6); X.save(); X.translate(54, -100 + sway); X.beginPath(); X.arc(0, 10, 12, -Math.PI * .5, Math.PI * .8); X.lineWidth = 7; X.strokeStyle = C.ink; X.stroke(); X.lineWidth = 4; X.strokeStyle = '#d0d4d4'; X.stroke(); X.restore();
    // head
    this.drawSkull(b, -4, -178 + sway * .5, 1, false);
    // parrot on shoulder
    if (!b.parrotOut) { X.save(); X.translate(30, -168 + Math.sin(t * 3) * 2); X.scale(.8, .8); drParrot({ x: 0, y: 0, vx: -1, t: t * .3 }); X.restore(); }
    X.restore();
  },
  drawSkull(b, x, y, s, giant, deadF) {
    const t = b.t; X.save(); X.translate(x, y); X.scale(s, s);
    // hat
    X.save(); X.translate(0, -26); poly([-54, 8, -30, -26, 0, -16, 30, -26, 54, 8, 0, 0], '#22263a', 3); circ(0, -10, 8, C.white, 2); line(-6, -4, 6, -16, 2); line(6, -4, -6, -16, 2); X.restore();
    // skull
    X.beginPath(); X.moveTo(-28, 10); X.quadraticCurveTo(-34, -30, 0, -32); X.quadraticCurveTo(34, -30, 28, 10); X.quadraticCurveTo(20, 20, 14, 18); X.lineTo(-14, 18); X.quadraticCurveTo(-20, 20, -28, 10); X.closePath(); fillStroke('#efe8d4', 3);
    if (deadF || b.dead) { xEye(-11, -4, 6); xEye(11, -4, 6); }
    else {
      ell(-11, -4, 10, 11, 0, C.ink, 0); ell(11, -4, 10, 11, 0, C.ink, 0);
      circ(-11 - 2, -4, 3.5, '#90ffb8', 0); X.save(); X.globalAlpha = .5 + Math.sin(t * 6) * .3; circ(11 - 2, -4, 5, '#90ffb8', 0); X.restore();
      line(-24, -14, 6, -20, 3); // eyepatch strap
    }
    poly([0, 4, -4, 10, 4, 10], C.ink, 0);
    const jaw = giant ? Math.abs(Math.sin(t * 4)) * 6 : b.jaw;
    rrect(-16, 14 + jaw, 32, 12, 4, '#efe8d4', 3); for (let i = -1; i <= 1; i++) line(i * 7, 14 + jaw, i * 7, 22 + jaw, 1.5);
    for (let i = -2; i <= 2; i++) rrect(i * 6 - 2.5, 13, 5, 6, 1, C.white, 1.2);
    X.restore();
  }
});
