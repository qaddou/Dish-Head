// =====================================================================
//  Upgrade pass 2: atmosphere, ambience, mini-bosses, achievements,
//  weapon tune-ups, loadout presets, film-leader transitions
// =====================================================================

// ---------------- atmosphere: color grade, key light, ambient particles ----------------
const ATMOS = {
  meadow: { top: 'rgba(255,214,140,.22)', bot: 'rgba(90,150,70,.16)', light: [170, 90, '255,236,170', .32], p: 'pollen', amb: 'wind' },
  theatre: { top: 'rgba(255,190,120,.14)', bot: 'rgba(90,10,30,.28)', light: [480, 10, '255,232,170', .28], p: 'dust', amb: 'crowd' },
  casino: { top: 'rgba(255,210,120,.16)', bot: 'rgba(20,60,40,.24)', light: [480, 60, '255,230,150', .28], p: 'dust', amb: 'crowd' },
  ship: { top: 'rgba(120,255,200,.10)', bot: 'rgba(10,30,40,.32)', light: [720, 110, '230,255,230', .26], p: 'mist', amb: 'water' },
  abyss: { top: 'rgba(120,220,255,.14)', bot: 'rgba(0,20,40,.32)', light: [480, -40, '200,250,255', .3], p: 'motes', amb: 'water' },
  lab: { top: 'rgba(140,200,255,.12)', bot: 'rgba(40,20,10,.28)', light: [480, 170, '200,225,255', .26], p: 'sparks', amb: 'hum' },
  sky: { top: 'rgba(255,200,140,.18)', bot: 'rgba(80,80,110,.2)', light: [760, 120, '255,240,200', .32], p: 'ash', amb: 'wind' },
  gloom: { top: 'rgba(130,40,130,.14)', bot: 'rgba(90,0,0,.32)', light: [480, 210, '255,120,80', .22], p: 'embers', amb: 'drone' },
  carnival: { top: 'rgba(255,190,140,.16)', bot: 'rgba(60,20,60,.22)', light: [700, 40, '255,220,160', .26], p: 'confetti', amb: 'crowd' },
  coral: { top: 'rgba(120,220,255,.14)', bot: 'rgba(0,20,40,.3)', light: [480, -40, '200,250,255', .3], p: 'motes', amb: 'water' },
  foundry: { top: 'rgba(255,190,120,.16)', bot: 'rgba(50,40,50,.26)', light: [600, 60, '255,220,170', .26], p: 'ash', amb: 'hum' }
};
function atmosOf(st) { return ATMOS[st.kind === 'boss' ? st.def.arena : st.lvl.theme] || ATMOS.meadow; }
function hiQ() { return Settings.d.quality !== 'low'; }
function updateAtmos(st, dt) {
  if (!hiQ()) return;
  const A = atmosOf(st); st.atmos = st.atmos || [];
  const rate = { pollen: .25, dust: .3, mist: .12, motes: .3, sparks: .2, ash: .35, embers: .45, confetti: .25 }[A.p] || .2;
  if (Math.random() < rate) {
    const p = { x: rnd(W), y: rnd(H), t: 0, life: rnd(3, 7), r: rnd(1, 3), ph: rnd(TAU), vx: 0, vy: 0 };
    if (A.p === 'pollen') { p.vx = rnd(8, 24); p.vy = rnd(-6, 6); p.c = '255,245,190'; }
    else if (A.p === 'dust') { p.vx = rnd(-6, 6); p.vy = rnd(-4, 4); p.c = '255,236,200'; p.r = rnd(.8, 2); }
    else if (A.p === 'mist') { p.vx = rnd(10, 30); p.y = rnd(300, 470); p.r = rnd(30, 70); p.c = '200,255,230'; p.soft = true; }
    else if (A.p === 'motes') { p.vy = rnd(-14, -4); p.c = '220,250,255'; }
    else if (A.p === 'sparks') { p.y = rnd(150, 470); p.vy = rnd(-50, -20); p.c = '180,220,255'; p.life = rnd(.6, 1.4); }
    else if (A.p === 'ash') { p.vx = rnd(-30, -10); p.vy = rnd(8, 20); p.c = '230,220,210'; }
    else if (A.p === 'embers') { p.y = H + 5; p.vy = rnd(-60, -25); p.vx = rnd(-10, 10); p.c = '255,150,70'; p.life = rnd(2, 5); }
    else if (A.p === 'confetti') { p.y = -5; p.vy = rnd(20, 40); p.vx = rnd(-10, 10); p.c = pick(['255,90,80', '255,210,80', '90,140,220', '120,200,120']); p.sq = true; }
    st.atmos.push(p);
  }
  for (const p of st.atmos) { p.t += dt; p.x += (p.vx + Math.sin(p.t * 1.5 + p.ph) * 6) * dt; p.y += p.vy * dt; }
  st.atmos = st.atmos.filter(p => p.t < p.life);
}
function drawAtmos(st) {
  if (!hiQ()) return;
  const A = atmosOf(st), t = st.t;
  X.save();
  for (const p of st.atmos || []) {
    const k = p.t / p.life, a = Math.sin(k * Math.PI);
    if (p.soft) { const g = X.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, 'rgba(' + p.c + ',' + (a * .12) + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)'); X.fillStyle = g; X.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
    else if (p.sq) { X.fillStyle = 'rgba(' + p.c + ',' + a * .8 + ')'; X.save(); X.translate(p.x, p.y); X.rotate(p.t * 4 + p.ph); X.fillRect(-3, -2, 6, 4); X.restore(); }
    else { X.fillStyle = 'rgba(' + p.c + ',' + a * .75 + ')'; X.beginPath(); X.arc(p.x, p.y, p.r, 0, TAU); X.fill(); }
  }
  // key light (screen) with a soft flicker
  const [lx, ly, lc, la] = A.light, fl = la * (.9 + Math.sin(t * 2.3) * .05 + Math.sin(t * 7.1) * .03);
  X.globalCompositeOperation = 'screen';
  const g = X.createRadialGradient(lx, ly, 10, lx, ly, 520); g.addColorStop(0, 'rgba(' + lc + ',' + fl + ')'); g.addColorStop(1, 'rgba(' + lc + ',0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  // color grade (soft light)
  X.globalCompositeOperation = 'soft-light';
  const gr = X.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, A.top); gr.addColorStop(1, A.bot);
  X.fillStyle = gr; X.fillRect(0, 0, W, H);
  X.restore();
}

// ---------------- ambient soundscapes ----------------
const Ambient = {
  nodes: [], timer: null,
  start(kind) {
    this.stop(); if (!AudioSys.ok || !kind) return;
    const ac = AudioSys.ac, out = ac.createGain(); out.gain.value = 0; out.gain.linearRampToValueAtTime(.32, ac.currentTime + 1.5); out.connect(AudioSys.sfx);
    const noise = (type, f, q) => { const s = ac.createBufferSource(); s.buffer = AudioSys.noise; s.loop = true; const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const g = ac.createGain(); s.connect(b); b.connect(g); g.connect(out); s.start(); this.nodes.push(s); return { s, b, g }; };
    const lfo = (param, rate, depth, base) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = rate; g.gain.value = depth; param.value = base; o.connect(g); g.connect(param); o.start(); this.nodes.push(o); };
    if (kind === 'wind') { const n = noise('lowpass', 420, .7); lfo(n.g.gain, .13, .25, .45); lfo(n.b.frequency, .09, 180, 420); }
    else if (kind === 'water') { const n = noise('lowpass', 700, .5); lfo(n.g.gain, .2, .2, .35); this.timer = setInterval(() => { if (Math.random() < .5) Sfx.tone('sine', rnd(500, 900), rnd(1100, 1600), .08, .025); }, 700); }
    else if (kind === 'crowd') { const n = noise('bandpass', 650, 1.5); lfo(n.g.gain, 3.1, .12, .3); const m = noise('bandpass', 1100, 2); lfo(m.g.gain, 4.3, .08, .15); }
    else if (kind === 'hum') { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55; const b = ac.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = 160; const g = ac.createGain(); g.gain.value = .12; o.connect(b); b.connect(g); g.connect(out); o.start(); this.nodes.push(o); const n = noise('lowpass', 300, .5); n.g.gain.value = .3; this.timer = setInterval(() => { if (Math.random() < .3) Sfx.noise(.12, .05, 'bandpass', 2500, 1200, 3); }, 900); }
    else if (kind === 'drone') { for (const f of [55, 82.4]) { const o = ac.createOscillator(); o.frequency.value = f; o.detune.value = rnd(-8, 8); const g = ac.createGain(); g.gain.value = .14; o.connect(g); g.connect(out); o.start(); this.nodes.push(o); lfo(g.gain, .07 + f / 900, .06, .12); } const n = noise('lowpass', 250, .5); n.g.gain.value = .25; }
    this.out = out;
  },
  stop() {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    const out = this.out, nodes = this.nodes; this.nodes = []; this.out = null;
    if (out && AudioSys.ok) { const t = AudioSys.t; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + .4); setTimeout(() => { for (const n of nodes) try { n.stop(); } catch (e) { } try { out.disconnect(); } catch (e) { } }, 600); }
  }
};

// ---------------- achievements ----------------
const ACH = [
  ['first', 'Opening Night', 'Defeat your first boss.'],
  ['allb', 'Standing Ovation', 'Defeat all eight bosses.'],
  ['gloom', 'Lights Back On', 'Defeat Baron Von Gloom.'],
  ['expert', 'Showstopper', 'Defeat any boss on Expert.'],
  ['srank', 'Perfect Picture', 'Earn an S grade.'],
  ['nohit', 'Untouchable', 'Defeat a boss without taking a hit.'],
  ['parry5', 'Pink Panther', 'Parry 5 times in one fight.'],
  ['parry100', 'Slap Happy', 'Parry 100 times in total.'],
  ['speed', 'Quick Change', 'Defeat a boss under its par time.'],
  ['mini', 'Supporting Act', 'Defeat a mini-boss.'],
  ['coins5', 'Penny Pincher', 'Bank all 5 coins in a level.'],
  ['reel', 'Lost Footage', 'Find a secret film reel.'],
  ['reels', 'Film Archivist', 'Find all 5 secret film reels.'],
  ['shop', 'Window Shopper', 'Buy something at Shelby\'s.'],
  ['tune', 'Fine Tuned', 'Fully tune up a weapon.'],
  ['super', 'Star Power', 'Unleash a super.'],
  ['rush', 'Marathon', 'Finish the Boss Rush.'],
  ['coop', 'Double Act', 'Win a fight with two players.']
];
const Toasts = {
  q: [], cur: null, t: 0,
  push(title, body) { this.q.push({ title, body }); },
  draw() {
    if (!this.cur && this.q.length) { this.cur = this.q.shift(); this.t = 0; Music.jingle('unlock'); }
    if (!this.cur) return;
    this.t += 1 / 60; const T = 3.2, k = this.t < .35 ? ease.outBack(this.t / .35) : this.t > T - .35 ? (T - this.t) / .35 : 1;
    X = ctx; X.save(); X.translate(W - 170, -60 + k * 112);
    rrect(-160, -40, 320, 74, 12, C.cream, 4); rrect(-152, -32, 304, 58, 8, null, 1.5, C.ink2);
    circ(-120, -3, 22, C.gold, 3); star(-120, -3, 13, 5, .45, C.cream, 2, this.t * 2);
    text(this.cur.title, 20, -14, { size: 15, col: C.red, maxW: 230 }); text(this.cur.body, 20, 10, { size: 11, font: FONT_B, col: C.ink, maxW: 230 });
    X.restore();
    if (this.t > T) this.cur = null;
  }
};
const Achieve = {
  has(id) { return !!(Save.d.ach && Save.d.ach[id]); },
  unlock(id) { Save.d.ach = Save.d.ach || {}; if (Save.d.ach[id]) return; const a = ACH.find(x => x[0] === id); if (!a) return; Save.d.ach[id] = Date.now(); Save.write(); Toasts.push('ACHIEVEMENT: ' + a[1], a[2]); }
};
class AchievementsScene {
  constructor(back) { this.back = back; this.t = 0; }
  update(dt) { this.t += dt; const M = Input.menu(); if ((M.back || M.ok) && this.t > .3) { Sfx.back(); go(this.back); } }
  draw() {
    drawStageBackdrop(this.t, .55);
    const got = ACH.filter(a => Achieve.has(a[0])).length;
    text('ACHIEVEMENTS', W / 2, 36, { size: 34, col: C.cream, stroke: 7 });
    text(got + ' / ' + ACH.length + ' unlocked', W / 2, 66, { size: 14, font: FONT_M, col: C.gold, stroke: 3 });
    ACH.forEach((a, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 70 + col * 420, y = 86 + row * 48, has = Achieve.has(a[0]);
      const ap = clamp(this.t * 6 - i * .25, 0, 1); X.save(); X.globalAlpha = ap;
      rrect(x, y, 400, 42, 8, has ? C.cream : '#5a4a3a', 2.5);
      circ(x + 22, y + 21, 14, has ? C.gold : '#3a2a20', 2.5); if (has) star(x + 22, y + 21, 8, 5, .45, C.cream, 1.5); else text('?', x + 22, y + 22, { size: 14, col: '#8a7a6a' });
      text(a[1], x + 46, y + 14, { size: 14, col: has ? C.red : '#c8b898', align: 'left', maxW: 340 });
      text(a[2], x + 46, y + 31, { size: 11, font: FONT_B, col: has ? C.ink : '#a8977a', align: 'left', maxW: 340 });
      X.restore();
    });
    Mouse.zone(0, 0, W, H, null, () => go(this.back));
  }
}

// ---------------- weapon tune-ups ----------------
const TUNE_PRICES = [3, 5];
function wpnLevel(w) { return (Save.d.owned.wlv || {})[w] || 0; }

// ---------------- film leader (shown while a stage loads) ----------------
function drawLeader(t, dur) {
  X = ctx; X.save(); X.fillStyle = '#d9cba6'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .5);
  const n = 3 - Math.min(2, Math.floor(t / (dur / 3))), k = (t % (dur / 3)) / (dur / 3);
  line(W / 2, 0, W / 2, H, 3, C.ink2); line(0, H / 2, W, H / 2, 3, C.ink2);
  circ(W / 2, H / 2, 150, null, 6); circ(W / 2, H / 2, 130, null, 3);
  X.beginPath(); X.moveTo(W / 2, H / 2); X.arc(W / 2, H / 2, 128, -Math.PI / 2, -Math.PI / 2 + k * TAU); X.closePath(); X.fillStyle = 'rgba(27,18,12,.35)'; X.fill();
  text(String(n), W / 2, H / 2 + 8, { size: 150, col: C.ink });
  X.restore();
}

// ---------------- mini-bosses ----------------
const MINIS = {
  hayride: { name: 'King Toadstool', skin: 'shroom', s: 2.7, hp: 230, pat: 'hop', col: C.red },
  midway: { name: 'Bozo the Bouncer', skin: 'clown', s: 2.5, hp: 250, pat: 'hop', throwBalls: true },
  coral: { name: 'Sir Pinchington', skin: 'crab', s: 2.7, hp: 270, pat: 'charge' },
  foundry: { name: 'Rivet Rex', skin: 'bot', s: 2.7, hp: 290, pat: 'turret' },
  hollow: { name: 'The Phantom Usher', skin: 'ghost', s: 2.7, hp: 310, pat: 'phase' }
};
function setupMini(st, lvl) {
  const M = MINIS[lvl.id]; if (!M) return;
  const x0 = lvl.goal - 900;
  st.miniDef = M; st.miniX = x0;
  // clear the arena so the duel is clean
  st.enemies = st.enemies.filter(e => e.x < x0 - 80 || e.x > lvl.goal + 100);
  st.hazards = st.hazards.filter(h => h.x < x0 - 80 || h.x > lvl.goal + 100);
  st.items = st.items.filter(i => i.k !== 'pinkorb' || i.x < x0 - 80);
}
function startMini(st) {
  const M = st.miniDef, x = st.miniX + 700, def = ENEMY[M.skin];
  st.miniStarted = true; st.camLock = st.miniX;
  const gy = groundAt(st, x) ?? FLOOR;
  const e = { type: M.skin, def, mini: M, scale: M.s, x, y: M.pat === 'phase' ? gy - 80 : -60, x0: x, y0: gy, gy, w: def.w * M.s * .8, h: def.h * M.s * .85, hp: M.hp, maxHp: M.hp, vx: 0, vy: 0, dir: -1, t: 0, active: true, cd: 1.6, st: 'drop' };
  st.enemies.push(e); st.mini = e;
  st.banner = { s: 'MINI-BOSS: ' + M.name.toUpperCase(), sub: 'The stage is locked until it falls!', t: 0, dur: 2.6 };
  Music.setPhase(2); Music.jingle('phase'); Camera.shake(6, .4); Voice.laugh(.8);
}
function updateMini(st, e, dt) {
  const M = e.mini, P = st.target({ x: e.x, y: e.y }); e.t += dt; if (e.flash > 0) e.flash -= dt;
  const L = st.miniX + 50, R = st.miniX + W - 50;
  const land = () => { const gy = groundAt(st, e.x, e.y - 40) ?? e.gy; if (e.y >= gy && e.vy >= 0) { e.y = gy; e.vy = 0; return true; } return false; };
  e.squash = Math.max(0, (e.squash || 0) - dt * 3);
  if (e.st === 'drop') { e.vy += 2400 * dt; e.y += e.vy * dt; if (M.pat === 'phase') { e.y = Math.min(e.y, e.gy - 80); if (e.y >= e.gy - 80) e.st = 'idle'; } else if (land()) { e.st = 'idle'; e.squash = 1; Camera.shake(10, .4); Sfx.thud(); FX.puffs(e.x, e.y - 6, 10, 18); } }
  else if (M.pat === 'hop') {
    e.vy += 2200 * dt; e.y += e.vy * dt; e.x += e.vx * dt; e.x = clamp(e.x, L, R);
    const g = land();
    if (g && e.st === 'air') { e.st = 'idle'; e.vx = 0; e.squash = 1; e.cd = .9; Camera.shake(8, .3); Sfx.thud(); FX.puffs(e.x, e.y - 6, 6, 14); for (const d of [-1, 1]) st.bullet({ x: e.x + d * 60, y: e.y - 18, w: 40, h: 36, shape: 'rect', r: 20, vx: d * 330, dr: drShock }); }
    if (e.st === 'idle') { e.cd -= dt; e.dir = P.x < e.x ? -1 : 1; if (e.cd <= 0) { e.st = 'wind'; e.wt = .55; warnRect(st, clamp(P.x, L, R), e.gy - 8, 120, 16, .55, { col: '#ff5040' }); e.tx = clamp(P.x, L, R); } }
    else if (e.st === 'wind') { e.wt -= dt; e.squash = .6; if (e.wt <= 0) { e.st = 'air'; e.vy = -900; e.vx = (e.tx - e.x) / .82; Sfx.jump(); e.hops = (e.hops || 0) + 1; if (e.hops % 2 === 0) { const n = 5; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - 2) * .38; st.bullet({ x: e.x, y: e.y - e.h, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, g: 500, r: 9, col: M.throwBalls ? pick(['#3f6fa8', '#e8a020', C.red]) : '#e8dcc0', pink: i === 2 }); } Sfx.pop(); } } }
  }
  else if (M.pat === 'charge') {
    e.vy += 1500 * dt; e.y += e.vy * dt; land();
    if (e.st === 'idle') { e.cd -= dt; e.dir = P.x < e.x ? -1 : 1; if (e.cd <= 0) { e.st = 'wind'; e.wt = .8; warnRect(st, (L + R) / 2, e.gy - 30, R - L, 60, .8, { col: '#ff5040', ix: e.dir < 0 ? L + 30 : R - 30 }); Sfx.warn(); } }
    else if (e.st === 'wind') { e.wt -= dt; e.squash = .5; e.x += Math.sin(e.t * 60) * 1.5; if (e.wt <= 0) { e.st = 'run'; Sfx.whoosh(); } }
    else if (e.st === 'run') { e.x += e.dir * 560 * dt; if (frameNo % 3 === 0) FX.puffs(e.x - e.dir * 30, e.y - 6, 1, 10); if (e.x < L || e.x > R) { e.x = clamp(e.x, L, R); e.st = 'idle'; e.cd = 1.1; e.squash = 1; Camera.shake(7, .3); Sfx.thud(); const n = 10, gap = rndi(0, n - 1); for (let i = 0; i < n; i++) if (Math.abs(i - gap) > 1) st.bullet({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(i * TAU / n) * 170, vy: Math.sin(i * TAU / n) * 170, r: 11, dr: drBubbleH, pink: i === (gap + 5) % n }); } }
  }
  else if (M.pat === 'turret') {
    e.vy += 1800 * dt; e.y += e.vy * dt; land(); e.dir = P.x < e.x ? -1 : 1;
    e.cd -= dt; if (e.cd <= 0) {
      e.burst = (e.burst || 0) + 1;
      if (e.burst % 3) { const x = e.x + e.dir * 40, y = e.y - e.h * .65, a = angTo(x, y, P.x, P.cy); for (const d of [-.18, 0, .18]) st.bullet({ x, y, vx: Math.cos(a + d) * 330, vy: Math.sin(a + d) * 330, r: 8, dr: drRivet, pink: d === 0 && e.burst % 4 === 1 }); Sfx.shoot('spark'); e.squash = .4; e.cd = .9; }
      else { const tx = clamp(P.x, L, R); warnRect(st, tx, e.gy - 6, 90, 12, 1, { col: '#ff5040' }); const T = 1, g = 900, x = e.x, y = e.y - e.h; st.bullet({ x, y, vx: (tx - x) / T, vy: (e.gy - 10 - y - .5 * g * T * T) / T, g, r: 13, dr: q => drawPshot({ x: q.x, y: q.y, vx: 1, vy: 0, t: q.t, k: 'bomb', r: 10 }), floorDie: true, floorY: e.gy, onFloor: q => FX.boom(q.x, q.y, .9) }); Sfx.whoosh(); e.cd = 1.4; }
    }
  }
  else if (M.pat === 'phase') {
    e.ghostly = e.st === 'fade';
    if (e.st === 'idle') { e.x += clamp(P.x - e.x, -1, 1) * 60 * dt; e.y = e.gy - 90 + Math.sin(e.t * 2) * 20; e.cd -= dt; if (e.cd <= 0) { e.st = 'fade'; e.wt = 1; Sfx.whoosh(); } }
    else if (e.st === 'fade') { e.wt -= dt; if (e.wt <= 0) { e.x = clamp(P.x + (Math.random() < .5 ? -1 : 1) * 220, L, R); e.st = 'idle'; e.cd = 2.2; const n = 12, off = rnd(TAU); for (let i = 0; i < n; i++) st.bullet({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(off + i * TAU / n) * 160, vy: Math.sin(off + i * TAU / n) * 160, r: 10, dr: drShadowOrb, pink: i === 0 }); FX.puffs(e.x, e.y - 40, 8, 16, '#e8e8ff'); Sfx.zap(); } }
  }
  if (!e.ghostly && e.st !== 'drop') for (const p of st.alive()) { const r = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h }; if (rectsHit(r, p.rect)) p.hurt(); }
}
function miniDied(st, e) {
  st.miniDone = true; st.camLock = null; st.mini = null;
  for (let i = 0; i < 6; i++) setTimeout(() => FX.boom(e.x + rnd(-60, 60), e.y - rnd(20, 120), rnd(.6, 1.1)), i * 120);
  st.hitstop = .2; st.flash = .3; FX.confetti(e.x, e.y - 80, 40);
  st.banner = { s: 'BRAVO! THE WAY IS CLEAR', sub: 'Head for THE END!', t: 0, dur: 2.4 };
  Music.setPhase(1); if (!st.cfg.practice) Achieve.unlock('mini');
}
