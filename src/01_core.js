'use strict';
// =====================================================================
//  LIGHTS OUT!  The Bolt & Dot Show  —  core engine
// =====================================================================
const W = 960, H = 540, FLOOR = 470, DT = 1 / 60, TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const sgn = v => v < 0 ? -1 : 1;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const angTo = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const deg = d => d * Math.PI / 180;
const ease = {
  lin: t => t,
  outQ: t => 1 - (1 - t) * (1 - t),
  inQ: t => t * t,
  io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outEl: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
  outBounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; }
};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function fmtTime(s) { s = Math.max(0, s); const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
function rectsHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function circRect(cx, cy, r, x, y, w, h) { const nx = clamp(cx, x, x + w), ny = clamp(cy, y, y + h); return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < r * r; }
function segDist(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy || 1; const t = clamp(((px - x1) * dx + (py - y1) * dy) / l, 0, 1); return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)); }

// ---------- canvas ----------
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let RS = 1;
function fitCanvas() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const s = Math.min(vw / W, vh / H);
  cv.style.width = Math.floor(W * s) + 'px';
  cv.style.height = Math.floor(H * s) + 'px';
  const dpr = window.devicePixelRatio || 1;
  let lowQ = false; try { lowQ = Settings.d && Settings.d.quality === 'low'; } catch (e) { }
  RS = clamp(s * dpr, 1, lowQ ? 1 : 1.5);
  cv.width = Math.round(W * RS); cv.height = Math.round(H * RS);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
const BGS = 1.25; // resolution of pre-rendered paintings
function mkCanvas(w, h, s = BGS) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * s); c.height = Math.ceil(h * s);
  const g = c.getContext('2d'); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  c.g = g; c.lw = w; c.lh = h; return c;
}
function blit(c, x, y, w, h) { ctx.drawImage(c, x || 0, y || 0, w || c.lw, h || c.lh); }

// ---------- storage ----------
const Store = {
  mem: {},
  get(k) { try { const v = localStorage.getItem(k); if (v != null) return v; } catch (e) { } return this.mem[k] ?? null; },
  set(k, v) { this.mem[k] = v; try { localStorage.setItem(k, v); } catch (e) { } }
};

const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'dash', 'ex', 'swap', 'lock'];
const ACTION_NAMES = { left: 'Move Left', right: 'Move Right', up: 'Aim Up', down: 'Duck / Aim Down', jump: 'Jump / Parry', shoot: 'Shoot', dash: 'Dash', ex: 'EX / Super', swap: 'Swap Weapon', lock: 'Lock Aim' };
const DEFAULT_BINDS = [
  { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'KeyJ', shoot: 'KeyK', dash: 'KeyL', ex: 'KeyI', swap: 'KeyU', lock: 'KeyO' },
  { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', jump: 'Numpad1', shoot: 'Numpad2', dash: 'Numpad3', ex: 'Numpad0', swap: 'Numpad4', lock: 'Numpad5' }
];
// extra keys that also drive Player 1 when playing alone (no Shift: it triggers Sticky Keys on Windows)
const SOLO_ALT = { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'], jump: ['KeyZ', 'Space'], shoot: ['KeyX'], dash: ['KeyC'], ex: ['KeyV'], swap: ['KeyQ', 'Tab'], lock: ['KeyE'] };

const Settings = {
  d: null,
  defaults() { let rm = false; try { rm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { } return { quality: 'high', master: .8, music: .7, sfx: .8, grain: true, shake: !rm, filter: 'color', bossbar: true, announcer: true, touch: 'auto', binds: JSON.parse(JSON.stringify(DEFAULT_BINDS)) }; },
  load() {
    this.d = this.defaults();
    try { const s = JSON.parse(Store.get('lightsout_settings_v1') || 'null'); if (s) Object.assign(this.d, s); } catch (e) { }
    if (!this.d.binds || this.d.binds.length < 2 || this.d.bindsV !== 2) { this.d.binds = JSON.parse(JSON.stringify(DEFAULT_BINDS)); this.d.bindsV = 2; }
    for (let p = 0; p < 2; p++) for (const a in this.d.binds[p]) if (/^Shift/.test(this.d.binds[p][a])) this.d.binds[p][a] = DEFAULT_BINDS[p][a];
    for (let p = 0; p < 2; p++) for (const a of ACTIONS) if (!this.d.binds[p][a]) this.d.binds[p][a] = DEFAULT_BINDS[p][a];
    this.apply();
  },
  save() { Store.set('lightsout_settings_v1', JSON.stringify(this.d)); this.apply(); },
  apply() {
    const f = { color: 'sepia(.16) saturate(.92) contrast(1.04)', sepia: 'sepia(.78) saturate(.9) contrast(1.06) brightness(.98)', bw: 'grayscale(1) contrast(1.18) brightness(1.02)' }[this.d.filter] || '';
    cv.style.filter = f;
    try { AudioSys.applyVol(); } catch (e) { }
  }
};

// ---------- save game ----------
const Save = {
  d: null, KEY: 'lightsout_save_v1',
  fresh() {
    return {
      v: 1, started: false, coins: 0, players: 1,
      bosses: {}, levels: {}, reels: {},
      owned: { weapons: ['spark'], supers: [], trinkets: [], up: { hp: 0, dmg: 0, meter: 0 } },
      load: { a: 'spark', b: null, sup: null, trinket: null },
      worlds: 1, rush: null, ended: false, deaths: 0, parries: 0, playTime: 0, lastWorld: 0
    };
  },
  exists() { return !!(this.d && this.d.started); },
  load() {
    this.d = this.fresh();
    try { const s = JSON.parse(Store.get(this.KEY) || 'null'); if (s && s.v === 1) this.d = Object.assign(this.fresh(), s); } catch (e) { }
  },
  write() { try { Store.set(this.KEY, JSON.stringify(this.d)); } catch (e) { } },
  reset() { this.d = this.fresh(); this.d.started = true; this.write(); },
  bossRec(id) { return this.d.bosses[id] || (this.d.bosses[id] = { beat: false, grades: {}, times: {} }); },
  levelRec(id) { return this.d.levels[id] || (this.d.levels[id] = { done: false, coins: [false, false, false, false, false], grade: null }); }
};

// ---------- input ----------
const Input = {
  keys: new Set(), just: new Set(), st: [{}, {}], pv: [{}, {}], coop: false,
  padPrev: [], m: {}, rebind: null, lastDevice: 'kb', anyJust: false,
  touch: { on: false, ids: new Map(), act: {} },
  init() {
    window.addEventListener('keydown', e => {
      AudioSys.unlock();
      if (this.rebind) { e.preventDefault(); const cb = this.rebind; this.rebind = null; cb(e.code); return; }
      if (!this.keys.has(e.code)) this.just.add(e.code);
      this.keys.add(e.code); this.lastDevice = 'kb';
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.code) || e.code.startsWith('Numpad')) e.preventDefault();
      if (e.code === 'KeyF' && e.altKey) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); });
    const toCanvas = (cx, cy) => { const r = cv.getBoundingClientRect(); return { x: (cx - r.left) / r.width * W, y: (cy - r.top) / r.height * H }; };
    cv.addEventListener('pointerdown', e => {
      AudioSys.unlock();
      const p = toCanvas(e.clientX, e.clientY);
      if (e.pointerType === 'touch') { this.touch.on = true; this.lastDevice = 'touch'; }
      if (this.touch.on && Settings.d.touch !== 'off' && Touch.down(e.pointerId, p.x, p.y)) { e.preventDefault(); return; }
      Mouse.click(p.x, p.y);
    });
    cv.addEventListener('pointermove', e => {
      const p = toCanvas(e.clientX, e.clientY);
      if (this.touch.ids.has(e.pointerId)) Touch.move(e.pointerId, p.x, p.y); else Mouse.move(p.x, p.y);
    });
    const up = e => Touch.up(e.pointerId);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up);
    cv.addEventListener('contextmenu', e => e.preventDefault());
  },
  pads() { try { return navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : []; } catch (e) { return []; } },
  padState(pad) {
    const b = i => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .5));
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0, dz = .45;
    return {
      left: b(14) || ax < -dz, right: b(15) || ax > dz, up: b(12) || ay < -dz, down: b(13) || ay > dz,
      jump: b(0), shoot: b(2), ex: b(1), swap: b(3), dash: b(4) || b(7), lock: b(5) || b(6), start: b(9), back: b(8)
    };
  },
  poll() {
    const pads = this.pads(), binds = Settings.d.binds;
    const held = c => this.keys.has(c) || this.just.has(c);
    const padFor = [];
    if (this.coop) { if (pads.length === 1) padFor[1] = [pads[0]]; else { if (pads[0]) padFor[0] = [pads[0]]; if (pads[1]) padFor[1] = [pads[1]]; } }
    else padFor[0] = pads;
    const padStates = pads.map(p => this.padState(p));
    for (let p = 0; p < 2; p++) {
      this.pv[p] = this.st[p]; const s = {};
      for (const a of ACTIONS) {
        let v = held(binds[p][a]);
        if (!this.coop && p === 0) for (const c of SOLO_ALT[a]) v = v || held(c);
        if (padFor[p]) for (const pd of padFor[p]) { const ps = padStates[pads.indexOf(pd)]; if (ps && ps[a]) { v = true; this.lastDevice = 'pad'; } }
        if (p === 0 && this.touch.act[a]) v = true;
        s[a] = v;
      }
      this.st[p] = s;
    }
    // menu edges (any device)
    const m = { up: false, down: false, left: false, right: false, ok: false, back: false, pause: false, any: false };
    const J = c => this.just.has(c);
    m.up = J('ArrowUp') || J('KeyW'); m.down = J('ArrowDown') || J('KeyS');
    m.left = J('ArrowLeft') || J('KeyA'); m.right = J('ArrowRight') || J('KeyD');
    m.ok = J('Enter') || J('Space') || J('KeyZ') || J('KeyJ') || J('Numpad1') || J(binds[0].jump) || J(binds[1].jump) || J('NumpadEnter');
    m.back = J('Escape') || J('Backspace');
    m.pause = J('Escape') || J('Enter') || J('KeyP');
    padStates.forEach((ps, i) => {
      const pp = this.padPrev[i] || {}; const e = k => ps[k] && !pp[k];
      if (e('up')) m.up = true; if (e('down')) m.down = true; if (e('left')) m.left = true; if (e('right')) m.right = true;
      if (e('jump')) m.ok = true; if (e('ex') || e('back')) m.back = true; if (e('start')) { m.pause = true; m.ok = true; }
      for (const k in ps) if (e(k)) m.any = true;
    });
    this.padPrev = padStates;
    const T = Touch.edges(); for (const k in T) if (T[k]) m[k] = true;
    m.any = m.any || this.just.size > 0 || m.ok;
    this.m = m;
    this.just.clear();
  },
  down(p, a) { return !!this.st[p][a]; },
  pressed(p, a) { return !!this.st[p][a] && !this.pv[p][a]; },
  released(p, a) { return !this.st[p][a] && !!this.pv[p][a]; },
  menu() { return Trans.busy ? {} : this.m; },
  keyName(code) {
    if (!code) return '—';
    const map = { ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', ArrowUp: 'UP', ArrowDown: 'DOWN', Space: 'SPACE', Semicolon: ';', Comma: ',', Period: '.', Slash: '/', ShiftLeft: 'L-SHIFT', ShiftRight: 'R-SHIFT', ControlLeft: 'L-CTRL', ControlRight: 'R-CTRL', Enter: 'ENTER', Quote: "'", BracketLeft: '[', BracketRight: ']', Backslash: '\\', Minus: '-', Equal: '=', Tab: 'TAB', AltLeft: 'L-ALT', AltRight: 'R-ALT' };
    if (map[code]) return map[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6);
    return code.toUpperCase();
  }
};

// ---------- mouse (menus) ----------
const Mouse = {
  x: -1, y: -1, zones: [], clicked: null,
  move(x, y) { this.x = x; this.y = y; for (const z of this.zones) if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) { if (z.hover) z.hover(); break; } },
  click(x, y) { for (const z of this.zones) if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) { this.clicked = z; return; } },
  zone(x, y, w, h, hover, act) { this.zones.push({ x, y, w, h, hover, act }); },
  frame() { const c = this.clicked; this.clicked = null; if (c && c.act && !Trans.busy) c.act(); }
};

// ---------- touch overlay ----------
const Touch = {
  btns: [
    { id: 'jump', x: 880, y: 455, r: 42, label: 'JUMP' },
    { id: 'shoot', x: 785, y: 480, r: 38, label: 'SHOOT' },
    { id: 'dash', x: 895, y: 360, r: 32, label: 'DASH' },
    { id: 'ex', x: 800, y: 385, r: 32, label: 'EX' },
    { id: 'swap', x: 710, y: 500, r: 24, label: 'SWAP' },
    { id: 'lock', x: 715, y: 420, r: 24, label: 'LOCK' },
    { id: 'pause', x: 920, y: 36, r: 22, label: 'II' }
  ],
  stick: { x: 110, y: 440, r: 70, id: null, dx: 0, dy: 0 },
  pressedEdge: {},
  visible() { return Input.touch.on && Settings.d.touch !== 'off'; },
  inStage() { return typeof Stage !== 'undefined' && scene instanceof Stage && !scene.pauseMenu && !scene.deathMenu; },
  down(id, x, y) {
    if (!this.visible()) return false;
    if (!this.inStage()) { if (dist(x, y, 30, H - 28) < 26) { this.pressedEdge.back = true; return true; } return false; }
    const s = this.stick;
    if (x < 300 && y > 260) { Input.touch.ids.set(id, 'stick'); s.id = id; s.ox = x; s.oy = y; this.move(id, x, y); return true; }
    for (const b of this.btns) if (dist(x, y, b.x, b.y) < b.r + 14) { Input.touch.ids.set(id, b.id); Input.touch.act[b.id] = true; this.pressedEdge[b.id] = true; return true; }
    return false;
  },
  move(id, x, y) {
    if (Input.touch.ids.get(id) !== 'stick') return;
    const s = this.stick; const dx = x - s.x, dy = y - s.y, l = Math.hypot(dx, dy) || 1, k = Math.min(1, l / s.r);
    s.dx = dx / l * k; s.dy = dy / l * k;
    const A = Input.touch.act;
    A.left = s.dx < -.35; A.right = s.dx > .35; A.up = s.dy < -.45; A.down = s.dy > .5;
  },
  up(id) {
    const k = Input.touch.ids.get(id); if (!k) return;
    Input.touch.ids.delete(id);
    if (k === 'stick') { const A = Input.touch.act; A.left = A.right = A.up = A.down = false; this.stick.dx = this.stick.dy = 0; this.stick.id = null; }
    else Input.touch.act[k] = false;
  },
  edges() {
    const e = this.pressedEdge, r = { ok: !!e.jump || !!e.shoot, back: !!e.ex || !!e.back, pause: !!e.pause };
    const s = this.stick, prev = this.prevDir || {};
    const dir = { up: s.dy < -.5, down: s.dy > .5, left: s.dx < -.5, right: s.dx > .5 };
    for (const k in dir) if (dir[k] && !prev[k]) r[k] = true;
    this.prevDir = dir; this.pressedEdge = {};
    return r;
  },
  draw() {
    if (!this.visible()) return;
    if (window.innerHeight > window.innerWidth) { ctx.save(); ctx.fillStyle = 'rgba(15,8,4,.8)'; ctx.fillRect(0, H / 2 - 30, W, 60); text('Turn your phone sideways for a bigger stage', W / 2, H / 2, { size: 22, col: C.cream, font: FONT_M }); ctx.restore(); }
    if (!this.inStage()) { if (!(scene instanceof TitleScene)) { ctx.save(); ctx.globalAlpha = .8; circ(30, H - 28, 20, C.cream, 3); text("◀", 29, H - 27, { size: 18, col: C.ink }); ctx.restore(); } return; }
    ctx.save(); ctx.globalAlpha = .55;
    const s = this.stick;
    ctx.fillStyle = 'rgba(251,241,214,.35)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(s.x + s.dx * s.r * .6, s.y + s.dy * s.r * .6, 28, 0, TAU); ctx.fill(); ctx.stroke();
    for (const b of this.btns) {
      ctx.fillStyle = Input.touch.act[b.id] ? C.yellow : 'rgba(251,241,214,.6)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.stroke();
      text(b.label, b.x, b.y + 1, { size: b.r > 30 ? 13 : 10, font: FONT_M, col: C.ink });
    }
    ctx.restore();
  }
};

// ---------- camera shake / transitions ----------
const Camera = {
  amt: 0, t: 0, x: 0, y: 0,
  shake(a, t = .3) { if (!Settings.d.shake) return; this.amt = Math.max(this.amt, a); this.t = Math.max(this.t, t); },
  update(dt) { if (this.t > 0) { this.t -= dt; const a = this.amt * clamp(this.t * 4, 0, 1); this.x = rnd(-a, a); this.y = rnd(-a, a); } else { this.amt = 0; this.x = this.y = 0; } }
};

const Trans = {
  busy: false, phase: 0, t: 0, cb: null, dur: .42, cx: W / 2, cy: H / 2,
  iris(cb, cx = W / 2, cy = H / 2) { if (this.busy) return; this.busy = true; this.phase = 1; this.t = 0; this.cb = cb; this.cx = cx; this.cy = cy; },
  update(dt) {
    if (!this.busy) return;
    this.t += dt;
    if (this.phase === 1 && this.t >= this.dur) { this.phase = 2; this.t = 0; const c = this.cb; this.cb = null; if (c) c(); this.cx = W / 2; this.cy = H / 2; this.leader = (typeof Stage !== 'undefined' && scene instanceof Stage) ? .9 : 0; }
    else if (this.phase === 2 && this.t >= this.dur + .1 + (this.leader || 0)) { this.busy = false; this.phase = 0; }
  },
  draw() {
    if (!this.busy) return;
    const maxR = 620;
    if (this.phase === 2 && this.t < (this.leader || 0)) { drawLeader(this.t, this.leader); return; }
    let r = this.phase === 1 ? maxR * (1 - ease.inQ(clamp(this.t / this.dur, 0, 1))) : maxR * ease.outQ(clamp((this.t - .1 - (this.leader || 0)) / this.dur, 0, 1));
    ctx.save(); ctx.fillStyle = '#0d0907';
    ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); ctx.arc(this.cx, this.cy, Math.max(0, r), 0, TAU, true); ctx.fill('evenodd');
    ctx.restore();
  }
};

// ---------- scenes ----------
let scene = null;
function setScene(s) { if (scene && scene.exit) scene.exit(); if (!(s instanceof Stage)) FX.clear(); scene = s; if (s.enter) s.enter(); }
function go(s, cx, cy) { Trans.iris(() => setScene(typeof s === 'function' ? s() : s), cx, cy); }

let frameNo = 0, perfAvg = 16;
function tick(dt) {
  frameNo++;
  Input.poll();
  Music.update();
  if (scene) scene.update(dt);
  Mouse.frame();
  Trans.update(dt);
  Camera.update(dt);
  Film.update(dt);
}
function render() {
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = '#120c08'; ctx.fillRect(0, 0, W, H);
  Mouse.zones = [];
  X = ctx;
  if (scene) scene.draw();
  Touch.draw();
  Toasts.draw();
  Film.draw();
  Trans.draw();
}
let lastT = 0, acc = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (!lastT) lastT = now;
  let d = (now - lastT) / 1000; lastT = now;
  if (d > .25) d = .25;
  acc += d; let n = 0;
  while (acc >= DT && n < 4) { tick(DT); acc -= DT; n++; }
  if (n >= 4) acc = 0;
  const t0 = performance.now();
  render();
  perfAvg = perfAvg * .95 + (performance.now() - t0) * .05;
}
