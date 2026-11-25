// =====================================================================
//  Bolt & Dot — the players, weapons, EX moves and supers
// =====================================================================
const WEAPONS = {
  spark: { name: 'Spark Shot', short: 'SPARK', desc: 'Fast bolts with long range. A trusty all-rounder.', price: 0, rate: .115, dmg: 4, spd: 1150, col: '#ffd23f', ex: 'EX: Sparkler Ball pierces and hits three times.', stats: [3, 5, 4] },
  spread: { name: 'Fanfare Spread', short: 'SPREAD', desc: 'Five music notes fan out. Huge damage up close, short range.', price: 4, rate: .14, dmg: 1.6, spd: 900, life: .27, col: '#7fd3c4', ex: 'EX: Big Band Burst blasts notes in eight directions.', stats: [5, 1, 4] },
  chaser: { name: 'Homing Star', short: 'CHASER', desc: 'Little stars that find their own target. Low damage.', price: 4, rate: .1, dmg: 2.5, spd: 640, col: '#ffe27a', ex: 'EX: Star Swarm. Four big stars circle you, then hunt.', stats: [2, 4, 5] },
  charge: { name: 'Thunder Charge', short: 'CHARGE', desc: 'Hold to charge a mighty bolt. Tap for small shots.', price: 4, rate: .24, dmg: 4, big: 46, chargeT: .95, spd: 1000, col: '#8fd0ff', ex: 'EX: Triple Thunder fires three big bolts at once.', stats: [5, 5, 1] },
  bomb: { name: 'Kaboom Bomb', short: 'KABOOM', desc: 'Cartoon bombs that burst in a wide blast.', price: 5, rate: .36, dmg: 13, splash: 9, spd: 680, col: '#2b2420', ex: 'EX: Mega Kaboom. One huge bomb, one huge blast.', stats: [4, 3, 2] }
};
const SUPERS = {
  beam: { name: 'Thunder Beam', desc: 'A crackling beam of lightning that melts bosses.', unlock: 'Beat every boss in World 1' },
  glow: { name: 'Golden Glow', desc: 'Shine so bright that nothing can hurt you for 5 seconds.', unlock: 'Beat every boss in World 2' },
  bolt: { name: 'Big Bolt', desc: 'A giant ghost bulb charges through everything ahead.', unlock: 'Beat every boss in World 3' }
};
const TRINKETS = {
  heart: { name: 'Spare Heart', desc: '+1 HP. Your shots get a little weaker.', price: 3, world: 1 },
  coffee: { name: 'Coffee Can', desc: 'Your super meter slowly fills by itself.', price: 3, world: 1 },
  smoke: { name: 'Smoke Bomb', desc: 'You vanish while dashing and take no damage.', price: 3, world: 2 },
  glove: { name: 'Pink Glove', desc: 'Longer parry window. Parries also zap nearby foes.', price: 3, world: 2 },
  twin: { name: 'Twin Hearts', desc: '+2 HP. Your shots get much weaker.', price: 5, world: 3 },
  reel: { name: 'Golden Reel', desc: 'Secret reward: +10% damage and a golden trail.', price: 0, secret: true }
};
const UPGRADES = {
  hp: { name: 'Iron Heart', desc: '+1 max HP for good.', prices: [4, 6] },
  dmg: { name: 'Sharp Filament', desc: '+10% damage for good.', prices: [3, 5] },
  meter: { name: 'Battery Pack', desc: 'Super meter fills 20% faster.', prices: [4] }
};
const PHYS = {
  normal: { g: 2600, run: 300, jump: 930, djump: 780, fall: 1050, dash: 760, dashT: .2 },
  water: { g: 950, run: 245, jump: 480, djump: 430, fall: 270, dash: 600, dashT: .22, swim: true }
};
const PALS = [
  { shirt: '#d8452e', pants: '#34548a', shoe: '#5a3420', fil: '#ffb02e', glow: '255,180,60', name: 'BOLT' },
  { shirt: '#2f9d8f', pants: '#2f9d8f', shoe: '#b8322a', fil: '#7fe3ff', glow: '120,220,255', name: 'DOT' }
];

function makeLoadout(practice) {
  const s = Save.d, L = s.load, up = s.owned.up;
  const tr = L.trinket;
  let hpBonus = up.hp, dmgMul = 1 + .1 * up.dmg, meterMul = 1 + .2 * up.meter;
  if (tr === 'heart') { hpBonus += 1; dmgMul *= .95; }
  if (tr === 'twin') { hpBonus += 2; dmgMul *= .85; }
  if (tr === 'reel') dmgMul *= 1.1;
  return { a: L.a || 'spark', b: L.b, sup: L.sup, trinket: tr, hpBonus, dmgMul, meterMul };
}

class Player {
  constructor(st, i, x, y) {
    this.st = st; this.i = i; this.x = x; this.y = y ?? FLOOR; this.vx = 0; this.vy = 0; this.face = 1;
    const L = st.loadout;
    this.weapons = [L.a, L.b].filter(Boolean); this.wi = 0; this.sup = L.sup; this.trinket = L.trinket;
    this.maxHp = 3 + L.hpBonus; this.hp = this.maxHp; this.dmgMul = L.dmgMul; this.meterMul = L.meterMul;
    this.pal = PALS[i]; this.plane = st.mode === 'plane';
    this.ground = !this.plane; this.plat = null; this.coyote = 0; this.jumps = 1; this.airDash = true; this.dashT = 0; this.dashCd = 0; this.dashDir = 1;
    this.slideT = 0; this.duck = false; this.lock = false; this.aim = { x: 1, y: 0 }; this.fireCd = 0; this.charge = 0; this.alt = 0;
    this.inv = 0; this.hurtT = 0; this.parryT = 0; this.parryCd = 0; this.spin = 0; this.meter = 0; this.exT = 0; this.superT = 0; this.superKind = null; this.glowT = 0;
    this.dead = false; this.ghost = null; this.anim = rnd(5); this.run = 0; this.landT = 0; this.shootT = 0; this.victory = false; this.swimCd = 0; this.dropT = 0;
    this.safe = { x, y: this.y }; this.jit = { r: 0, x: 0 }; this.sway = 0; this.runT = 0; this.takeoffT = 0; this.wasGround = true; this.parryFlash = 0; this.trail = [];
  }
  get parrying() { return this.parryT > 0 || (!this.plane && !this.ground && !this.dead && this.st.ctl && Input.down(this.i, 'jump') && this.vy > -560); }
  get wname() { return this.weapons[this.wi] || 'spark'; }
  get hh() { return this.plane ? 22 : (this.duck || this.slideT > 0) ? 26 : 46; }
  get rect() { if (this.plane) return { x: this.x - 11, y: this.y - 11, w: 22, h: 22 }; return { x: this.x - 11, y: this.y - this.hh, w: 22, h: this.hh }; }
  get cx() { return this.x; }
  get cy() { return this.plane ? this.y : this.y - this.hh / 2; }
  get invuln() { return this.inv > 0 || this.glowT > 0 || (this.superT > 0 && this.superKind !== 'glow') || (this.trinket === 'smoke' && this.dashT > 0) || this.st.cfg.inf && false; }
  I(a) { return this.st.ctl && Input.down(this.i, a); }
  P(a) { return this.st.ctl && Input.pressed(this.i, a); }

  update(dt) {
    this.anim += dt;
    if (frameNo % 4 === 0) this.jit = { r: rnd(-.012, .012), x: rnd(-.4, .4) };
    if (this.dead) { this.updateGhost(dt); return; }
    for (const k of ['dashT', 'slideT', 'takeoffT', 'inv', 'hurtT', 'parryT', 'parryCd', 'exT', 'superT', 'glowT', 'fireCd', 'dashCd', 'coyote', 'landT', 'shootT', 'swimCd', 'dropT', 'parryFlash']) if (this[k] > 0) this[k] = Math.max(0, this[k] - dt);
    if (this.trinket === 'coffee') this.addMeter(dt * .055);
    if (this.trinket === 'reel' || this.glowT > 0) { if (frameNo % 3 === 0) FX.add({ k: 'star', x: this.cx + rnd(-10, 10), y: this.cy + rnd(-10, 10), r: rnd(3, 5), life: .4, col: C.gold, vy: -30 }); }
    if (this.victory) { this.vx = 0; this.physics(dt); return; }
    if (this.plane) this.updatePlane(dt); else this.updateWalker(dt);
    // swap weapon
    if (this.P('swap') && this.weapons.length > 1) { this.wi ^= 1; this.charge = 0; Sfx.menu(); FX.pop(this.x, this.y - (this.plane ? 30 : 86), WEAPONS[this.wname].short, C.cream, 15); }
    // EX / super
    if (this.P('ex') && this.exT <= 0 && this.superT <= 0 && this.st.state === 'play') {
      if (this.meter >= 5 && this.sup) this.doSuper(); else if (this.meter >= 1) this.doEX();
    }
    if (this.trinket === 'reel' || this.glowT > 0) { this.trail.push({ x: this.x, y: this.cy }); if (this.trail.length > 6) this.trail.shift(); }
  }

  updateWalker(dt) {
    const PH = this.st.mode === 'water' ? PHYS.water : PHYS.normal;
    const L = this.I('left'), R = this.I('right'), U = this.I('up'), D = this.I('down');
    const busy = this.exT > 0 || (this.superT > 0 && this.superKind !== 'glow');
    this.lock = this.I('lock') && !busy;
    // dash / slide
    if (this.P('dash') && this.dashCd <= 0 && this.dashT <= 0 && this.slideT <= 0 && !busy && (this.ground || this.airDash)) {
      const mx = (R ? 1 : 0) - (L ? 1 : 0); if (mx) this.face = mx;
      if (this.ground && D) { this.slideT = .38; Sfx.slide(); FX.puffs(this.x, this.y - 4, 3, 8); }
      else { this.dashT = PH.dashT; this.dashDir = this.face; this.vy = 0; if (!this.ground) this.airDash = false; Sfx.dash(); FX.puffs(this.x - this.face * 10, this.y - 24, 3, 9, null, 30); }
    }
    let mx = (R ? 1 : 0) - (L ? 1 : 0);
    this.duck = this.ground && D && !this.lock && this.dashT <= 0 && this.slideT <= 0 && !busy;
    if (this.dashT > 0) { this.vx = this.dashDir * PH.dash; this.vy = 0; if (this.dashT <= dt + .0001) this.dashCd = .12; if (frameNo % 2 === 0) FX.add({ k: 'line', x: this.x - this.face * 14, y: this.y - rnd(10, 44), dx: -this.face * rnd(20, 40), dy: 0, life: .15, w: 2 }); }
    else if (this.slideT > 0) { this.vx = this.face * PH.dash * .78 * (this.slideT / .38 + .3); }
    else if (busy) { this.vx = 0; if (mx && this.superT <= 0) this.face = mx; }
    else {
      if (mx) this.face = mx;
      this.vx = (this.lock || this.duck) ? 0 : mx * PH.run;
    }
    // jump & parry
    if (this.P('jump') && this.dashT <= 0 && !busy) {
      if (this.ground || this.coyote > 0) {
        if (this.duck && this.plat && this.plat.oneWay) { this.dropT = .25; this.y += 3; this.ground = false; }
        else { this.vy = -PH.jump; this.ground = false; this.coyote = 0; this.slideT = 0; this.takeoffT = .12; Sfx.jump(); FX.puffs(this.x, this.y - 3, 3, 7, null, 40); }
      } else {
        this.parryT = this.trinket === 'glove' ? .34 : .22; this.spin = 0;
        if (PH.swim) { if (this.swimCd <= 0) { this.vy = -PH.djump; this.swimCd = .14; Sfx.djump(); FX.add({ k: 'bubble', x: this.x, y: this.y - 10, vy: -60, r: 4, life: .8 }); } }
        else if (this.jumps > 0) { this.jumps--; this.vy = -PH.djump; Sfx.djump(); FX.add({ k: 'ring', x: this.x, y: this.y, r: 4, grow: 26, w: 3, life: .25 }); }
      }
    }
    if (!this.I('jump') && this.vy < -340 && !PH.swim) this.vy = -340;
    if (this.parryT > 0) this.spin += dt * 30;
    // gravity
    if (this.dashT <= 0) { this.vy += PH.g * dt; if (this.exT > 0 && !this.ground) this.vy = Math.min(this.vy, 30); }
    this.vy = Math.min(this.vy, PH.fall);
    this.physics(dt);
    this.updateAim(); this.updateShooting(dt);
  }

  physics(dt) {
    const st = this.st;
    let vx = this.vx + (st.wind || 0);
    if (this.ground && this.plat && this.plat.conv) vx += this.plat.conv;
    if (st.convey && this.ground && this.y >= FLOOR - 1) vx += st.convey;
    const preVy = this.vy; this.moveX(vx * dt); this.moveY(this.vy * dt);
    this.sway += (clamp(-this.vx / 300 - this.vy / 1400, -1.4, 1.4) - this.sway) * Math.min(1, dt * 7);
    if (this.y - this.hh < 22) { this.y = 22 + this.hh; if (this.vy < 0) this.vy = 0; }
    if (this.ground && !this.wasGround) { this.landT = clamp(preVy / 1050 * .14, .05, .15); if (preVy > 900) { Camera.shake(2, .1); } this.jumps = 1; this.airDash = true; Sfx.land(); FX.puffs(this.x, this.y - 3, 2, 6, null, 50); }
    if (!this.ground && this.wasGround && this.vy >= 0) this.coyote = .08;
    if (this.ground) { this.jumps = 1; this.airDash = true; const pl = this.plat; if (pl && !pl.crumble && !pl.hazard && !pl.move && this.x - 16 > pl.x && this.x + 16 < pl.x + pl.w) this.safe = { x: this.x, y: this.y }; }
    this.wasGround = this.ground;
    if (this.y > H + 90) st.onPit(this);
    const sp = Math.abs(this.vx);
    if (this.ground && sp > 10) { this.run += dt * sp * .045; this.runT += dt; } else { this.run = 0; this.runT = 0; }
  }
  moveX(dx) {
    this.x += dx;
    const hh = this.hh;
    for (const s of this.st.solids) {
      if (s.oneWay || s.off) continue;
      if (this.x + 11 > s.x && this.x - 11 < s.x + s.w && this.y > s.y + 1 && this.y - hh < s.y + s.h) {
        if (this.x < s.x + s.w / 2) this.x = s.x - 11.01; else this.x = s.x + s.w + 11.01;
        if (Math.sign(dx) === Math.sign(this.vx)) this.vx = 0; if (this.dashT > 0) this.dashT = 0;
      }
    }
    const b = this.st.bounds; this.x = clamp(this.x, b.l + 12, b.r - 12);
  }
  moveY(dy) {
    const prev = this.y; this.y += dy; this.ground = false; let best = null;
    if (dy >= 0) {
      for (const s of this.st.solids) {
        if (s.off) continue;
        if (this.x + 10 > s.x && this.x - 10 < s.x + s.w) {
          const pTop = s.py ?? s.y;
          if (prev <= pTop + 4 && this.y >= s.y) { if (s.oneWay && this.dropT > 0) continue; if (!best || s.y < best.y) best = s; }
        }
      }
      if (best) { this.y = best.y; this.vy = 0; this.ground = true; this.plat = best; if (best.onStand) best.onStand(this); } else this.plat = null;
    } else {
      this.plat = null;
      for (const s of this.st.solids) {
        if (s.oneWay || s.off) continue;
        if (this.x + 10 > s.x && this.x - 10 < s.x + s.w && this.y - this.hh < s.y + s.h && prev - this.hh >= s.y + s.h - 2) { this.y = s.y + s.h + this.hh; this.vy = 0; }
      }
    }
  }
  updateAim() {
    const L = this.I('left'), R = this.I('right'), U = this.I('up'), D = this.I('down');
    let ax, ay;
    if (this.lock) { ax = (R ? 1 : 0) - (L ? 1 : 0); ay = (D ? 1 : 0) - (U ? 1 : 0); if (ax) this.face = ax; if (!ax && !ay) ax = this.face; }
    else if (this.duck) { ax = this.face; ay = 0; }
    else { ay = U ? -1 : (!this.ground && D ? 1 : 0); ax = (L || R) ? this.face : (ay ? 0 : this.face); }
    const l = Math.hypot(ax, ay) || 1; this.aim = { x: ax / l, y: ay / l };
  }
  muzzle() {
    if (this.plane) return { x: this.x + 30, y: this.y + 2 };
    const low = this.duck ? 14 : 0;
    return { x: this.x + this.aim.x * 26 + this.face * 2, y: this.y - 31 + low + this.aim.y * 24 };
  }
  canShoot() { return this.dashT <= 0 && this.slideT <= 0 && this.exT <= 0 && !(this.superT > 0 && this.superKind !== 'glow') && this.st.state !== 'ko' && this.st.state !== 'clear'; }
  updateShooting(dt) {
    const w = this.wname, Wd = WEAPONS[w];
    if (w === 'charge') {
      if (this.I('shoot') && this.canShoot()) {
        this.charge += dt; Sfx.chargeHum(Math.min(1, this.charge / Wd.chargeT));
        if (this.charge >= Wd.chargeT && frameNo % 3 === 0) { const m = this.muzzle(); FX.add({ k: 'spark', x: m.x, y: m.y, vx: rnd(-90, 90), vy: rnd(-90, 90), col: Wd.col, life: .15 }); }
      } else if (this.charge > 0) {
        if (this.canShoot()) { if (this.charge >= Wd.chargeT) this.fireCharged(); else if (this.fireCd <= 0) { this.fire(); this.fireCd = Wd.rate; } }
        this.charge = 0;
      }
      return;
    }
    if (this.I('shoot') && this.fireCd <= 0 && this.canShoot()) { this.fire(); this.fireCd = Wd.rate; }
  }
  fire() {
    const w = this.wname, Wd = WEAPONS[w], m = this.muzzle(), a = Math.atan2(this.aim.y, this.aim.x), st = this.st;
    this.shootT = .1; this.alt ^= 1;
    const base = { owner: this, x: m.x, y: m.y };
    if (w === 'spark') st.pshot(Object.assign({}, base, { y: m.y + (this.alt ? -3 : 3) * Math.abs(this.aim.x), a, spd: Wd.spd, dmg: Wd.dmg, k: 'spark', r: 8, life: 1.1 }));
    else if (w === 'spread') for (const d of [-.34, -.15, 0, .15, .34]) st.pshot(Object.assign({}, base, { a: a + d, spd: Wd.spd * rnd(.94, 1.06), dmg: Wd.dmg, k: 'note', r: 8, life: Wd.life }));
    else if (w === 'chaser') st.pshot(Object.assign({}, base, { a: a + (this.alt ? .25 : -.25), spd: Wd.spd, dmg: Wd.dmg, k: 'star', r: 7, life: 2.4, home: 9 }));
    else if (w === 'charge') st.pshot(Object.assign({}, base, { a, spd: Wd.spd, dmg: Wd.dmg, k: 'chargeS', r: 7, life: 1 }));
    else if (w === 'bomb') st.pshot(Object.assign({}, base, { a, spd: Wd.spd, dmg: Wd.dmg, k: 'bomb', r: 10, life: .85, g: this.plane ? 0 : 480, vyAdd: this.aim.y === 0 ? -150 : 0, boom: { r: 72, dmg: Wd.splash } }));
    Sfx.shoot(w);
    FX.add({ k: 'flash', x: m.x, y: m.y, r: w === 'bomb' ? 26 : 18, life: .07, col: '#fff3c0' });
    if (this.plane) return;
    if (this.ground && !this.lock && this.aim.x !== 0) this.x -= this.face * .4;
  }
  fireCharged() {
    const Wd = WEAPONS.charge, m = this.muzzle(), a = Math.atan2(this.aim.y, this.aim.x);
    this.st.pshot({ owner: this, x: m.x, y: m.y, a, spd: Wd.spd, dmg: Wd.big, k: 'chargeL', r: 20, life: 1.2 });
    this.shootT = .2; Sfx.bigShot(); Camera.shake(3, .12); FX.add({ k: 'flash', x: m.x, y: m.y, r: 50, life: .12, col: '#cfeaff' });
    if (this.ground && !this.plane) this.vx = -this.face * 200;
  }
  addMeter(v) { if (this.dead) return; const before = Math.floor(this.meter); this.meter = Math.min(5, this.meter + v * this.meterMul); if (Math.floor(this.meter) > before && this.meter < 5.001) { Sfx.tone && AudioSys.ok && Sfx.tone('triangle', 1200 + before * 150, 1200 + before * 150, .12, .05); } }
  doEX() {
    this.meter -= 1; this.exT = .36; this.st.stats.cards++; Sfx.ex(); Camera.shake(3, .15);
    const w = this.wname, m = this.muzzle(), a = Math.atan2(this.aim.y, this.aim.x), st = this.st, o = { owner: this, x: m.x, y: m.y };
    if (w === 'spark') st.pshot(Object.assign(o, { a, spd: 760, dmg: 9.5, k: 'sparkEX', r: 24, life: 1.6, pierce: 3, hitCd: .14 }));
    else if (w === 'spread') for (let i = 0; i < 8; i++) st.pshot(Object.assign({}, o, { x: this.cx, y: this.cy, a: i * TAU / 8, spd: 720, dmg: 4.4, k: 'noteEX', r: 13, life: .55 }));
    else if (w === 'chaser') for (let i = 0; i < 4; i++) st.pshot(Object.assign({}, o, { x: this.cx, y: this.cy, a: 0, spd: 0, dmg: 7.6, k: 'starEX', r: 12, life: 3.2, orbit: { t: 0, dur: .8, ang: i * TAU / 4, p: this }, home: 7 }));
    else if (w === 'charge') for (const d of [-.2, 0, .2]) st.pshot(Object.assign({}, o, { a: a + d, spd: 1000, dmg: 11.5, k: 'chargeL', r: 18, life: 1.1 }));
    else if (w === 'bomb') st.pshot(Object.assign(o, { a, spd: 560, dmg: 14, k: 'bombEX', r: 18, life: 1.1, g: this.plane ? 0 : 380, vyAdd: this.aim.y === 0 ? -140 : 0, boom: { r: 135, dmg: 22 } }));
    FX.add({ k: 'flash', x: m.x, y: m.y, r: 60, life: .12 }); FX.add({ k: 'ring', x: m.x, y: m.y, r: 8, grow: 50, life: .25, col: WEAPONS[w].col });
    if (this.ground && !this.plane) this.vx = 0;
  }
  doSuper() {
    this.meter = 0; this.st.stats.cards += 5; Sfx.super(); this.st.hitstop = .35; this.st.flash = .2; this.st.superCine = { t: 0, p: this, kind: this.sup }; if (!this.st.cfg.practice) Achieve.unlock('super'); Music.duck(.4, 1.6); Camera.shake(6, .4);
    this.superKind = this.sup; const st = this.st;
    FX.add({ k: 'flash', x: this.cx, y: this.cy, r: 160, life: .3 });
    FX.add({ k: 'ring', x: this.cx, y: this.cy, r: 10, grow: 200, w: 10, life: .5, col: C.gold });
    if (this.sup === 'beam') { this.superT = 1.4; st.beams.push({ p: this, t: 0, dur: 1.3, dps: 175 }); }
    else if (this.sup === 'glow') { this.superT = .45; this.glowT = 5; Voice.yahoo(this.i ? 1.3 : 1); }
    else if (this.sup === 'bolt') { this.superT = .55; st.pshot({ owner: this, x: this.x + this.face * 20, y: this.plane ? this.y : this.y - 40, a: this.face > 0 ? 0 : Math.PI, spd: 470, dmg: 36, k: 'ghost', r: 54, life: 2.4, pierce: 4, hitCd: .3 }); }
  }
  // ---------- plane ----------
  updatePlane(dt) {
    const sp = 360, L = this.I('left'), R = this.I('right'), U = this.I('up'), D = this.I('down');
    let mx = (R ? 1 : 0) - (L ? 1 : 0), my = (D ? 1 : 0) - (U ? 1 : 0); const l = Math.hypot(mx, my) || 1;
    const k = this.dashT > 0 ? 2.1 : 1;
    if (this.P('dash') && this.dashCd <= 0) { this.dashT = .18; this.dashCd = .45; Sfx.dash(); FX.puffs(this.x - 20, this.y, 3, 8); }
    this.vx = mx / l * sp * k; this.vy = my / l * sp * k;
    if (this.exT > 0) { this.vx *= .2; this.vy *= .2; }
    this.x = clamp(this.x + this.vx * dt, 30, W - 40); this.y = clamp(this.y + this.vy * dt, 30, H - 30);
    if (this.P('jump') && this.parryCd <= 0) { this.parryT = this.trinket === 'glove' ? .38 : .26; this.parryCd = .45; this.spin = 0; Sfx.whoosh(); }
    if (this.parryT > 0) this.spin += dt * 26;
    this.aim = { x: 1, y: 0 }; this.face = 1;
    if (this.I('shoot') && this.fireCd <= 0 && this.canShoot() && this.wname !== 'charge') { this.fire(); this.fireCd = WEAPONS[this.wname].rate; }
    if (this.wname === 'charge') this.updateShooting(dt);
    if (frameNo % 5 === 0) FX.add({ k: 'puff', x: this.x - 30, y: this.y + 2, vx: -120, vy: rnd(-10, 10), r: 5, life: .4, col: '#e8e0cc', lw: 1.5 });
  }
  // ---------- damage ----------
  hurt() {
    if (this.dead || this.invuln || this.st.state !== 'play' && this.st.state !== 'intro') return false;
    if (this.st.cfg.inf) { this.inv = 1.2; this.hurtT = .3; Sfx.hurt(); FX.stars(this.cx, this.cy, 5, C.cream); return true; }
    this.hp--; this.inv = 1.6; this.hurtT = .35; this.st.stats.hits++;
    this.st.hitstop = .07; Sfx.hurt(); Voice.hurt(this.i ? 1.35 : 1); Camera.shake(6, .25);
    FX.stars(this.cx, this.cy, 7, C.cream); FX.add({ k: 'flash', x: this.cx, y: this.cy, r: 50, life: .12 });
    if (!this.plane) { this.vy = Math.min(this.vy, -380); this.dashT = 0; this.slideT = 0; }
    this.charge = 0;
    if (this.hp <= 0) this.die();
    return true;
  }
  die() {
    this.dead = true; this.hp = 0; Voice.ohno(this.i ? 1.3 : 1); FX.boom(this.cx, this.cy, .7, true); Sfx.pop();
    Save.d.deaths++;
    const alive = this.st.players.filter(p => !p.dead);
    this.ghost = { x: this.x, y: this.cy, t: 0, solo: !alive.length };
    this.st.onPlayerDied(this);
  }
  updateGhost(dt) {
    if (!this.ghost) return;
    const g = this.ghost; g.t += dt; g.y -= 38 * dt; g.x += Math.sin(g.t * 2) * 30 * dt;
    if (g.y < -60) { this.ghost = null; this.st.onPlayerDied(this); }
  }
  revive() {
    this.dead = false; this.hp = 1; this.inv = 2; this.x = clamp(this.ghost.x, 40, this.st.bounds.r - 40); this.ghost = null;
    if (this.plane) this.y = clamp(this.ghost ? this.ghost.y : this.y, 60, H - 60); else { const r = this.st.reviveAt(this.x); this.x = r.x; this.y = r.y; this.vy = -500; this.safe = { x: r.x, y: r.y }; }
    Sfx.parry(); Voice.yahoo(this.i ? 1.3 : 1); FX.stars(this.cx, this.cy, 12, C.pink);
  }
  onParry(obj) {
    this.parryT = 0; this.parryFlash = .25; this.st.stats.parries++; Save.d.parries++;
    this.addMeter(1 / this.meterMul);
    if (!this.plane) { const PH = this.st.mode === 'water' ? PHYS.water : PHYS.normal; this.vy = -PH.djump * 1.05; this.jumps = 1; this.airDash = true; }
    this.st.hitstop = .1; Sfx.parry(); FX.pop(obj.x, obj.y - 26, 'PARRY!', C.pink, 22); if (Save.d.parries >= 100) Achieve.unlock('parry100'); FX.stars(obj.x, obj.y, 9, C.pink, 300); FX.add({ k: 'ring', x: obj.x, y: obj.y, r: 6, grow: 60, w: 6, life: .3, col: C.pink });
    if (this.trinket === 'glove') this.st.zap(this, obj.x, obj.y);
  }

  // ---------- drawing ----------
  draw() {
    if (this.dead) { this.drawGhost(); return; }
    X.save();
    if (this.inv > 0 && this.glowT <= 0 && Math.floor(this.inv * 16) % 2 === 0) X.globalAlpha = .4;
    if (this.trinket === 'smoke' && this.dashT > 0) X.globalAlpha = .25;
    if (this.trail.length) { X.save(); this.trail.forEach((p, i) => { X.globalAlpha = .08 * i; circ(p.x, p.y, 16, C.gold, 0); }); X.restore(); }
    if (this.glowT > 0) { const gr = X.createRadialGradient(this.cx, this.cy, 4, this.cx, this.cy, 60); gr.addColorStop(0, 'rgba(255,215,90,.7)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); X.fillStyle = gr; X.fillRect(this.cx - 60, this.cy - 60, 120, 120); }
    if (this.plane) this.drawPlane(); else this.drawWalker();
    X.restore();
  }
  drawBulbHead(hx, hy, o = {}) {
    const pal = this.pal, t = this.anim;
    const bright = this.hurtT > 0 ? .25 : (this.shootT > 0 || this.charge > 0 ? 1 : .65 + Math.sin(t * 3) * .1);
    // glow
    const gr = X.createRadialGradient(hx, hy - 4, 4, hx, hy - 4, 40);
    gr.addColorStop(0, 'rgba(' + pal.glow + ',' + (.38 * bright) + ')'); gr.addColorStop(1, 'rgba(' + pal.glow + ',0)');
    X.fillStyle = gr; X.fillRect(hx - 40, hy - 44, 80, 80);
    // screw base
    for (let i = 0; i < 3; i++) ell(hx, hy + 15 + i * 4, 7 - i * .6, 2.6, 0, i % 2 ? '#a9a49a' : '#cfc9bc', 2);
    // glass
    X.beginPath(); X.moveTo(hx - 6, hy + 14); X.bezierCurveTo(hx - 20, hy + 6, hx - 18, hy - 22, hx, hy - 22); X.bezierCurveTo(hx + 18, hy - 22, hx + 20, hy + 6, hx + 6, hy + 14); X.closePath();
    const gg = X.createRadialGradient(hx - 5, hy - 10, 2, hx, hy - 4, 22); gg.addColorStop(0, '#ffffff'); gg.addColorStop(.6, this.hurtT > 0 ? '#d9d2c0' : '#fff4cf'); gg.addColorStop(1, this.hurtT > 0 ? '#b8b0a0' : '#f3dfa5');
    fillStroke(gg, 3);
    // filament hair
    X.save(); X.globalAlpha = .5 + bright * .5;
    const sw = (this.sway || 0) * 4 + Math.sin(t * 9) * .6;
    X.beginPath(); X.moveTo(hx - 7, hy - 13); for (let i = 0; i <= 6; i++) X.lineTo(hx - 7 + i * 2.4 + sw * i / 6, hy - 13 + (i % 2 ? -4 : 0) - Math.abs(sw) * i / 12); X.lineWidth = 2.6; X.strokeStyle = pal.fil; X.stroke(); X.restore();
    line(hx - 7, hy - 13, hx - 9, hy - 6, 1.4, '#8a8478'); line(hx + 7.4, hy - 13, hx + 9, hy - 6, 1.4, '#8a8478');
    // gloss
    X.save(); X.globalAlpha = .7; ell(hx - 9, hy - 9, 3, 6, .4, C.white, 0); X.restore();
    // face
    const blink = (t % 3.7 < .12) ? 1 : 0;
    const fx = hx + 3 + (this.look || 0) * 2;
    if (this.victory) { hose(fx - 7, hy - 3, fx - 1, hy - 3, -3, 2.4); hose(fx + 2, hy - 3, fx + 8, hy - 3, -3, 2.4); }
    else if (this.hurtT > 0) { xEye(fx - 4, hy - 3, 3); xEye(fx + 5, hy - 3, 3); }
    else { pieEye(fx - 4, hy - 3, 3.6, 5.4, this.aim.x * .4, this.aim.y * .5, { blink }); pieEye(fx + 5, hy - 3, 3.6, 5.4, this.aim.x * .4, this.aim.y * .5, { blink }); }
    if (this.i === 1) { line(fx + 8, hy - 8, fx + 11, hy - 10, 1.6); line(fx - 7, hy - 8, fx - 10, hy - 10, 1.6); }
    ell(fx + 10, hy + 4, 2.6, 1.8, 0, '#f19a86', 0);
    if (this.hurtT > 0 || o.shout) ell(fx + 1, hy + 7, 3, 3.6, 0, '#5a1a12', 2);
    else { X.beginPath(); X.arc(fx + 1, hy + 4, 5, .2, Math.PI - .2); X.lineWidth = 2.4; X.strokeStyle = C.ink; X.stroke(); if (this.shootT > 0 || this.victory) { X.fillStyle = '#5a1a12'; X.fill(); } }
    if (this.i === 1) { // Dot's bow
      X.save(); X.translate(hx + 2, hy - 22); X.rotate(Math.sin(t * 4) * .1);
      poly([0, 0, -13, -8, -13, 8], '#c8382c', 2.2); poly([0, 0, 13, -8, 13, 8], '#c8382c', 2.2); circ(0, 0, 3.5, '#c8382c', 2.2);
      circ(-8, -1, 1.4, C.white, 0); circ(8, 2, 1.4, C.white, 0); X.restore();
    }
  }
  drawWalker() {
    const t = this.anim, pal = this.pal, f = this.face;
    const air = !this.ground, dash = this.dashT > 0, slide = this.slideT > 0, duck = this.duck;
    if (this.ground) shadowAt(this.x, this.y, 16);
    X.save(); X.translate(this.x + this.jit.x, this.y); X.rotate(this.jit.r);
    let sx = 1, sy = 1;
    if (this.landT > 0) { sx = 1 + this.landT * 1.8; sy = 1 - this.landT * 1.8; }
    else if (this.takeoffT > .06) { sx = 1.22; sy = .8; }
    else if (this.takeoffT > 0) { sx = .82; sy = 1.2; }
    else if (air && this.vy < -200) { sx = .93; sy = 1.08; }
    else if (air && this.vy > 500) { sx = .95; sy = 1.06; }
    if (dash) { sx = 1.2; sy = .86; }
    if (this.parryT > 0 && air) X.rotate(Math.sin(this.spin) * .25 * f);
    X.scale(sx * f * 1.12, sy * 1.12);
    const run = this.run, sp = Math.abs(this.vx);
    let bob = 0, lean = 0, low = 0;
    let feet, hands;
    const shooting = this.shootT > 0 || (this.I('shoot') && this.canShoot()) || this.charge > 0;
    if (this.victory) {
      const j = Math.abs(Math.sin(t * 6)) * 10; bob = -j;
      feet = [[-6, -j * .5], [8, -j]]; hands = [[-14, -40 + bob], [12, -58 + bob]];
    } else if (dash) {
      lean = .3; feet = [[-20, -10], [-8, -4]]; hands = [[-18, -30], [-10, -22]];
    } else if (slide) {
      low = 16; lean = -.25; feet = [[14, -2], [22, -6]]; hands = [[-12, -10], [6, -24]];
    } else if (duck) {
      low = 14; feet = [[-11, 0], [11, 0]]; hands = [[-12, -10], [10, -12]];
      bob = Math.sin(t * 4) * 1;
    } else if (air) {
      if (this.vy < 0) { feet = [[-9, -9], [8, -13]]; hands = [[-15, -44], [13, -46]]; }
      else { const w = Math.sin(t * 22) * 3; feet = [[-7, 2 + w], [7, -1 - w]]; hands = [[-17, -42 - w], [15, -40 + w]]; }
    } else if (sp > 10) {
      const walk = this.runT < .2, st = walk ? .6 : 1; lean = walk ? .06 : .16; bob = -Math.abs(Math.sin(run)) * 3.5 * st;
      feet = [0, 1].map(k => { const ph = run + k * Math.PI; return [Math.sin(ph) * 13 * st, -Math.max(0, Math.cos(ph)) * 11 * st]; });
      hands = [0, 1].map(k => { const ph = run + k * Math.PI; return [-Math.sin(ph) * 13 - 2, -23 + bob - Math.cos(ph) * 2]; });
    } else {
      bob = Math.sin(t * 4) * 1.3;
      feet = [[-7, 0], [7, 0]]; hands = [[-13, -21 + bob], [13, -22 - bob]];
      const it = t % 6; if (it > 4.6) { feet[1] = [8, -Math.abs(Math.sin(t * 13)) * 5]; hands[0] = [-12, -14]; this.look = Math.sin(t * 2.5); } else this.look = 0;
    }
    const hipY = -20 + low * .6, torsoY = -27 + low + bob, headY = -55 + low + bob + clamp(this.vy * .006, -3, 4);
    X.save(); X.rotate(lean);
    // back leg & arm
    const leg = (hx, ft, w) => { hose(hx, hipY, ft[0], ft[1] - 3, (ft[0] - hx) * -.35 + 3, 4.6); shoe(ft[0], ft[1], 1, .95, pal.shoe); };
    const armTo = (sx_, sy_, hx, hy, kind, a) => { hose(sx_, sy_, hx, hy, (hx - sx_) * .25 + 3, 4); glove(hx, hy, 5.2, a || 0, kind); };
    leg(-4, feet[0]);
    armTo(-5, torsoY - 3, hands[0][0], hands[0][1], 'open', Math.PI * .6);
    // torso
    if (this.i === 0) {
      ell(0, torsoY + 1, 11, 10, 0, pal.shirt, 3);
      rrect(-10, torsoY + 3, 20, 9, 4, pal.pants, 2.6);
      line(-5, torsoY - 7, -5, torsoY + 4, 2, '#2a3d63'); line(5, torsoY - 7, 5, torsoY + 4, 2, '#2a3d63');
      circ(-5, torsoY + 6, 1.8, C.yellow, 1.2); circ(5, torsoY + 6, 1.8, C.yellow, 1.2);
    } else {
      poly([-7, torsoY - 8, 7, torsoY - 8, 13, torsoY + 12, -13, torsoY + 12], pal.shirt, 3);
      circ(-4, torsoY - 1, 1.6, C.white, 0); circ(4, torsoY + 6, 1.6, C.white, 0); circ(-7, torsoY + 8, 1.6, C.white, 0); circ(5, torsoY - 4, 1.4, C.white, 0);
    }
    leg(4, feet[1]);
    // head
    this.drawBulbHead(1, headY, {});
    // front arm (aims when shooting)
    if ((shooting || this.exT > 0) && !this.victory && !dash) {
      const ax = this.aim.x * f, ay = this.aim.y, shx = 4, shy = torsoY - 4;
      const rec = this.shootT > .06 ? -3 : 0;
      const hx = shx + ax * (17 + rec), hy = shy + ay * (17 + rec);
      hose(shx, shy, hx, hy, 2, 4);
      glove(hx, hy, 5.6, Math.atan2(ay, ax), 'point');
      if (this.exT > 0) { glove(hx - ax * 3, hy - ay * 3 + 5, 5, Math.atan2(ay, ax), 'fist'); }
      if (this.charge > 0) { const k = Math.min(1, this.charge / WEAPONS.charge.chargeT); circ(hx + ax * 12, hy + ay * 12, 4 + k * 9, k >= 1 ? '#e8f7ff' : '#8fd0ff', 2); }
    } else armTo(5, torsoY - 3, hands[1][0], hands[1][1], this.victory ? 'fist' : 'open', -.4);
    X.restore();
    if (this.parryFlash > 0) { X.save(); X.globalAlpha = this.parryFlash * 3; star(0, -40, 26, 5, .45, C.pink, 2.5, this.anim * 6); X.restore(); }
    X.restore();
  }
  drawPlane() {
    const pal = this.pal, t = this.anim;
    X.save(); X.translate(this.x, this.y); X.rotate(clamp(this.vy / 2000, -.18, .18) + (this.parryT > 0 ? Math.sin(this.spin) * .5 : 0));
    const body = this.i ? '#2f8fa0' : '#c8382c';
    poly([-34, -4, -40, -16, -30, -16, -24, -4], body, 2.5); // tail
    rrect(-12, -20, 30, 6, 3, shade(body, .2), 2.5); // top wing
    ell(0, 0, 32, 10, 0, body, 3);
    rrect(-14, 4, 34, 7, 3, shade(body, -.15), 2.5); // low wing
    line(-6, -14, -6, 4, 2); line(12, -14, 12, 4, 2);
    circ(4, 13, 4, C.ink, 0);
    circ(32, 0, 5, C.gray, 2);
    X.save(); X.globalAlpha = .7; ell(34, 0, 3, 16 * Math.abs(Math.cos(t * 40)) + 2, 0, '#d9d2c0', 1.5); X.restore();
    X.save(); X.scale(.62, .62); this.drawBulbHead(-6, -34); X.restore();
    if (this.parryFlash > 0) { X.globalAlpha = this.parryFlash * 3; star(0, 0, 30, 5, .45, C.pink, 2.5, t * 6); }
    X.restore();
  }
  drawGhost() {
    const g = this.ghost; if (!g) return;
    X.save(); X.globalAlpha = .75;
    const y = g.y + Math.sin(g.t * 3) * 4;
    X.save(); X.translate(g.x, y);
    poly([-14, 0, -12, 26, -6, 20, 0, 28, 6, 20, 12, 26, 14, 0], 'rgba(230,245,255,.8)', 2.5);
    ell(0, -4, 16, 18, 0, 'rgba(240,250,255,.9)', 2.5);
    X.globalAlpha = .9; ell(0, -28, 12, 3.5, 0, null, 2.5, C.gold);
    pieEye(-5, -6, 3, 4.5, 0, -.5, {}); pieEye(5, -6, 3, 4.5, 0, -.5, {});
    X.restore();
    if (!g.solo && this.st.alive().length) { X.globalAlpha = 1; heartShape(g.x, y + 34, 9 + Math.sin(g.t * 8) * 1.5, C.pink, 2.5); text('PARRY TO REVIVE', g.x, y + 54, { size: 10, font: FONT_M, col: C.cream, stroke: 3 }); }
    X.restore();
  }
}
