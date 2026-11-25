// =====================================================================
//  Boss framework: phase scripts run as generators
// =====================================================================
const ARENAS = {};
const BOSSES = [];
function* tween(b, x, y, dur, ef = ease.io) { const sx = b.x, sy = b.y; for (let e = 0; e < dur; e += DT) { const k = ef(Math.min(1, e / dur)); b.x = lerp(sx, x, k); b.y = lerp(sy, y, k); yield 0; } b.x = x; b.y = y; }
function* waitFrames(n) { for (let i = 0; i < n; i++) yield 0; }
let bossLayer = null, bossLayerRS = 0;
function getBossLayer() {
  if (!bossLayer || bossLayerRS !== RS) { bossLayer = document.createElement('canvas'); bossLayer.width = Math.round(W * RS); bossLayer.height = Math.round(H * RS); bossLayer.g = bossLayer.getContext('2d'); bossLayerRS = RS; }
  return bossLayer;
}
class Boss {
  constructor(st, def, D, cfg) {
    this.st = st; this.def = def; this.D = D;
    this.maxHp = def.hp * D.hp * (cfg.coop ? 1.4 : 1); this.hp = this.maxHp;
    this.x = def.x ?? 760; this.y = def.y ?? FLOOR; this.t = 0; this.scripts = []; this.flash = 0; this.hurt = []; this.hit = [];
    this.vul = false; this.dead = false; this.deadT = 0; this.introK = 0; this.react = 0; this.trans = 0; this.face = -1; this.pose = ''; this.poseT = 0; this.mode = 'idle';
    this.phase = cfg.startPhase || 0;
    if (this.phase > 0) this.hp = this.maxHp * def.phases[this.phase].at - 1;
    if (def.init) def.init(this);
    if (this.phase > 0) for (let i = 1; i <= this.phase; i++) if (def.phases[i].enter) { def.phases[i].enter(this, true); }
    if (this.phase > 0) this.scripts = [];
  }
  get n() { return this.D.n; }
  extraTargets() { return this.def.extraTargets && !this.dead ? this.def.extraTargets(this) : []; }
  begin() { this.vul = true; this.run(this.def.phases[this.phase].script); if (this.phase > 0) Music.setPhase(this.phase); }
  run(fn, ...args) { const g = typeof fn === 'function' ? fn(this, ...args) : fn; const s = { g, w: 0, done: false }; this.scripts.push(s); return s; }
  runScripts(dt) {
    for (const s of this.scripts) {
      if (s.done) continue; s.w -= dt; let guard = 0;
      while (s.w <= 0 && !s.done && guard++ < 60) {
        const r = s.g.next(); if (r.done) { s.done = true; break; }
        const v = r.value || 0; if (v <= 0) { s.w = 0; break; }
        s.w += v * this.D.cd * (1 - .22 * (1 - this.hp / this.maxHp));
      }
    }
    this.scripts = this.scripts.filter(s => !s.done);
  }
  update(dt) {
    this.t += dt; if (this.flash > 0) this.flash -= dt; if (this.react > 0) this.react = Math.max(0, this.react - dt); if (this.poseT > 0) { this.poseT -= dt; if (this.poseT <= 0) this.pose = ''; }
    if (this.dead) {
      this.deadT += dt;
      if (this.deadT < 2.6 && frameNo % 7 === 0 && this.hurt.length) { const h = pick(this.hurt); FX.boom(h.x + rnd(-h.r, h.r) * .8, h.y + rnd(-h.r, h.r) * .8, rnd(.4, .8), frameNo % 21 !== 0); }
      if (this.def.dying) this.def.dying(this, dt);
      if (this.def.update) this.def.update(this, dt);
      return;
    }
    this.runScripts(dt);
    if (this.trans > 0) { this.trans -= dt; if (this.trans <= 0) this.run(this.def.phases[this.phase].script); }
    if (this.def.update) this.def.update(this, dt);
    const nx = this.def.phases[this.phase + 1];
    if (this.vul && nx && this.trans <= 0 && this.hp / this.maxHp <= nx.at) this.nextPhase();
  }
  nextPhase() {
    const i = ++this.phase, ph = this.def.phases[i];
    this.scripts = []; this.trans = ph.trans ?? 1.6; this.pose = ''; this.poseT = 0; this.hidden = false;
    this.st.clearHostile(); this.st.hazards = this.st.hazards.filter(h => h.persist);
    Camera.shake(9, .5); this.st.flash = .22; this.flash = .3;
    Music.setPhase(i); Music.jingle('phase'); Voice.laugh(this.def.voice || 1);
    const last = i === this.def.phases.length - 1;
    this.st.banner = { s: ph.name.toUpperCase(), sub: last ? '— FINAL ACT —' : 'ACT ' + ['I', 'II', 'III', 'IV'][i], t: 0, dur: 2.4 };
    if (ph.enter) ph.enter(this, false);
  }
  damage(d) {
    if (!this.vul || this.dead || this.trans > 0 || this.hidden) return false;
    this.hp -= d; this.flash = .05; if (this.react < .03) this.react = Math.min(.1, .04 + d * .004);
    if (this.hp <= 0) { this.hp = 0; this.die(); }
    return true;
  }
  die() { this.dead = true; this.scripts = []; this.pose = 'dead'; this.st.onBossDead(); if (this.def.onDie) this.def.onDie(this); }
  draw() {
    if (this.hidden && !this.dead) { if (this.def.drawHidden) this.def.drawHidden(this); return; }
    const L = getBossLayer(), g = L.g;
    g.setTransform(RS, 0, 0, RS, 0, 0); g.clearRect(0, 0, W, H); g.lineJoin = 'round'; g.lineCap = 'round';
    useCtx(g, () => {
      g.save();
      if (frameNo % 4 === 0) this.jit = [rnd(-.5, .5), rnd(-.5, .5)];
      const j = this.jit || [0, 0]; g.translate(j[0], j[1]);
      if (this.introK < 1) { const k = 1 - this.introK; g.translate(k * 520, -k * 40 + Math.sin(k * 9) * 12 * k); }
      if (this.react > 0 && this.hurt[0]) { const h = this.hurt[0], q = this.react * .5; g.translate(h.x, h.y); g.scale(1 + q, 1 - q); g.translate(-h.x, -h.y); }
      this.def.draw(this);
      g.restore();
      if (this.flash > 0 && !this.dead) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,248,230,.42)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
    });
    ctx.drawImage(L, 0, 0, W, H);
    if (this.def.drawOver) this.def.drawOver(this);
  }
  // ---- attack helpers ----
  shot(x, y, a, spd, o = {}) { return this.st.bullet(Object.assign({ x, y, vx: Math.cos(a) * spd * this.D.spd, vy: Math.sin(a) * spd * this.D.spd }, o)); }
  fan(x, y, a, n, spread, spd, o = {}, pinkIdx = -1) { const out = []; for (let i = 0; i < n; i++) { const aa = a + (n > 1 ? (i / (n - 1) - .5) * spread : 0); out.push(this.shot(x, y, aa, spd, Object.assign({}, o, { pink: i === pinkIdx }))); } return out; }
  ring(x, y, n, spd, o = {}, off = 0, skip = null, pinkIdx = -1) { for (let i = 0; i < n; i++) { if (skip && skip(i)) continue; this.shot(x, y, off + i * TAU / n, spd, Object.assign({}, o, { pink: i === pinkIdx })); } }
  aimAt(x, y, p) { p = p || this.st.target({ x, y }); return angTo(x, y, p.x, p.cy); }
  lob(x, y, tx, ty, time, o = {}) { const g = (o.g || 900) * this.D.spd * this.D.spd, T = time / this.D.spd; return this.st.bullet(Object.assign({ x, y, vx: (tx - x) / T, vy: (ty - y - .5 * g * T * T) / T }, o, { g })); }
  cnt(base) { return Math.max(1, base + this.D.n); }
  setPose(p, t = .4) { this.pose = p; this.poseT = t; }
}

// shared projectile painters
function drStinger(b) { const a = Math.atan2(b.vy, b.vx); X.translate(b.x, b.y); X.rotate(a); poly([12, 0, -8, -4, -12, 0, -8, 4], b.pink ? C.pink : '#5a3a1c', 2); line(-12, 0, -18, 0, 2); }
function drCard(b) {
  X.translate(b.x, b.y); X.rotate(b.rot || b.t * 10); X.scale(1, Math.abs(Math.cos(b.t * 6)) * .5 + .5);
  rrect(-10, -14, 20, 28, 3, b.pink ? C.pink : C.white, 2.2);
  if (b.pink || b.suit === 'h') heartShape(0, -1, 5.5, b.pink ? C.white : C.red, 1.2);
  else if (b.suit === 's') { star(0, 0, 7, 4, .4, C.ink, 0); } else poly([0, -7, 6, 0, 0, 7, -6, 0], C.red, 1.2);
}
function drFireball(b) {
  const a = Math.atan2(b.vy, b.vx); X.translate(b.x, b.y); X.rotate(a);
  const c1 = b.pink ? C.pink : (b.c1 || '#ff7a2a'), c2 = b.pink ? C.pinkL : (b.c2 || '#ffd35a');
  X.beginPath(); X.moveTo(-b.r * 2.4, 0); X.quadraticCurveTo(-b.r, -b.r * 1.2, b.r, -b.r * .2); X.arc(0, 0, b.r, -.2 * Math.PI / 2, .2 * Math.PI / 2); X.quadraticCurveTo(-b.r, b.r * 1.2, -b.r * 2.4, 0); fillStroke(c1, 2);
  circ(0, 0, b.r, c1, 2); circ(1, 0, b.r * .55, c2, 0);
}
