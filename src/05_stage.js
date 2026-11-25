// =====================================================================
//  Stage: the play-field shared by boss fights and run 'n' gun levels
// =====================================================================
const DIFF = {
  easy: { hp: .72, spd: .84, cd: 1.3, n: -1, name: 'EASY', stars: 1 },
  normal: { hp: 1, spd: 1, cd: 1, n: 0, name: 'NORMAL', stars: 2 },
  expert: { hp: 1.3, spd: 1.16, cd: .8, n: 1, name: 'EXPERT', stars: 3 }
};

class Stage {
  constructor(cfg) {
    this.cfg = cfg; this.kind = cfg.type; this.diff = cfg.diff || 'normal'; this.D = DIFF[this.diff];
    this.t = 0; this.state = 'intro'; this.stateT = 0; this.ctl = true;
    this.players = []; this.pshots = []; this.hostile = []; this.enemies = []; this.solids = []; this.items = []; this.beams = []; this.lights = []; this.hazards = [];
    this.bounds = { l: 0, r: W }; this.camX = 0; this.dark = 0; this.darkT = 0; this.wind = 0; this.convey = 0; this.tint = null;
    this.stats = { time: 0, hits: 0, parries: 0, cards: 0, dmg: 0, coins: 0 };
    this.hitstop = 0; this.slowmo = 1; this.pauseMenu = null; this.deathMenu = null; this.banner = null; this.flash = 0;
    this.loadout = cfg.loadout || makeLoadout(cfg.practice);
    this.mode = 'normal';
    FX.clear();
    if (cfg.type === 'boss') {
      this.def = BOSSES.find(b => b.id === cfg.id); this.mode = this.def.mode || 'normal';
      this.arena = ARENAS[this.def.arena];
      this.bg = this.arena.paint ? paintCached('arena_' + this.def.arena, W, H, this.arena.paint) : null;
      this.solids.push({ x: -200, y: FLOOR, w: W + 400, h: 300, floor: true });
      if (this.mode === 'plane') this.solids = [];
      if (this.def.setup) this.def.setup(this);
      this.boss = new Boss(this, this.def, this.D, cfg);
      this.music = this.def.song;
    } else {
      this.lvl = LEVELS.find(l => l.id === cfg.id); this.mode = this.lvl.water ? 'water' : 'normal';
      buildLevel(this, this.lvl); this.music = this.lvl.song;
    }
    const n = cfg.coop ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const sx = (this.spawnX || 150) + i * 50, sy = this.mode === 'plane' ? 220 + i * 90 : (this.spawnY || FLOOR);
      const p = new Player(this, i, sx, sy);
      if (cfg.carry && cfg.carry[i]) { p.hp = Math.min(p.maxHp, cfg.carry[i].hp); p.meter = cfg.carry[i].meter; if (cfg.carry[i].dead) { p.hp = 1; } }
      this.players.push(p);
    }
    if (this.kind === 'boss') this.placePlayers();
    Input.coop = !!cfg.coop;
  }
  exit() { Ambient.stop(); }
  enter() { Music.play(this.music, this.cfg.startPhase || 0); Ambient.start(atmosOf(this).amb); if (this.kind === 'boss') { setTimeout(() => { Music.jingle('ready'); Voice.say('Ready?'); }, 1900); const v = this.def.voice || 1; setTimeout(() => Voice.babble(7, 190 * v, { syl: .09 }), 700); } }
  // ---------- spawning ----------
  pshot(o) {
    const s = Object.assign({ t: 0, life: 1, r: 8, g: 0, hits: new Map() }, o);
    const wn = o.owner && o.owner.wname; if (wn) { s.col = WEAPONS[wn].col; s.dmg *= 1 + .15 * wpnLevel(wn); }
    s.vx = Math.cos(o.a) * (o.spd || 0); s.vy = Math.sin(o.a) * (o.spd || 0) + (o.vyAdd || 0);
    if (s.owner && s.owner.plane && s.k === 'bomb') s.vy = 0;
    this.pshots.push(s); return s;
  }
  bullet(o) { const b = Object.assign({ t: 0, r: 10, k: 'orb', life: 14, vx: 0, vy: 0, g: 0 }, o); this.hostile.push(b); return b; }
  clearHostile(sparkle = true) {
    for (const b of this.hostile) if (sparkle && !b.harmless && b.x > this.camX - 20 && b.x < this.camX + W + 20) FX.add({ k: 'puff', x: b.x, y: b.y, r: 10, life: .35, col: C.cream });
    this.hostile = this.hostile.filter(b => b.persist);
  }
  alive() { return this.players.filter(p => !p.dead); }
  target(from) { const a = this.alive(); if (!a.length) return this.players[0]; if (from) { let best = a[0], bd = 1e9; for (const p of a) { const d = Math.abs(p.x - from.x) + Math.abs(p.cy - from.y) * .5; if (d < bd) { bd = d; best = p; } } return best; } return a[Math.floor(this.t * .37) % a.length]; }
  reviveAt(x) {
    if (this.mode === 'plane') return { x, y: 260 };
    let best = null;
    for (const s of this.solids) if (!s.off && !s.hazard && x > s.x && x < s.x + s.w && s.y > 80 && s.y < H) if (!best || s.y < best.y) best = s;
    if (best) return { x, y: best.y };
    let near = null, nd = 1e9;
    for (const s of this.solids) { if (s.off || s.move || s.crumble || s.hazard || s.y > H || s.y < 80) continue; const d = Math.abs(s.x + s.w / 2 - x); if (d < nd) { nd = d; near = s; } }
    if (near) return { x: near.x + near.w / 2, y: near.y };
    return { x, y: FLOOR };
  }
  placePlayers() {
    if (this.mode === 'plane') return;
    for (const p of this.players) { const r = this.reviveAt(p.x); p.x = r.x + p.i * 24; p.y = r.y; p.safe = { x: p.x, y: p.y }; }
  }
  // ---------- flow ----------
  onPlayerDied(p) {
    if (this.alive().length === 0 && !this.players.some(q => q.ghost)) {
      if (this.state === 'play' || this.state === 'intro') { this.state = 'dead'; this.stateT = 0; Music.stop(.6); Music.jingle('death'); this.slowmo = .5; }
    }
    if (this.alive().length === 0 && this.state !== 'dead' && this.state !== 'ko' && this.state !== 'clear') { this.state = 'dead'; this.stateT = 0; Music.stop(.6); Music.jingle('death'); }
  }
  onPit(p) {
    const wasInv = p.invuln;
    if (!wasInv) p.hurt(); else if (this.cfg.inf) { }
    if (p.dead) { if (p.ghost) p.ghost.y = H - 20; return; }
    p.x = p.safe.x; p.y = p.safe.y - 2; p.vy = 0; p.vx = 0; p.inv = Math.max(p.inv, 1.4);
    FX.puffs(p.x, p.y - 20, 5, 12);
  }
  onBossDead() {
    this.state = 'ko'; this.stateT = 0; this.clearHostile(true); this.hazards = [];
    this.slowmo = .3; this.hitstop = .25; Music.stop(.2); Music.jingle('ko'); Voice.say('Lights out!');
    Camera.shake(12, .8); this.flash = .6;
    for (const p of this.players) { p.charge = 0; }
  }
  onLevelClear() {
    if (this.state !== 'play') return;
    this.state = 'clear'; this.stateT = 0; this.clearHostile(true); Music.stop(.3); Music.jingle('win'); Voice.say('Bravo!');
    for (const p of this.players) if (!p.dead) { p.victory = true; Voice.yahoo(p.i ? 1.3 : 1); }
  }
  finish() {
    if (this.finished) return; this.finished = true;
    const best = Math.max(0, ...this.players.map(p => p.hp));
    const r = {
      type: this.kind, id: this.cfg.id, diff: this.diff, time: this.stats.time, hits: this.stats.hits, parries: this.stats.parries, cards: this.stats.cards,
      hp: best, coins: this.stats.coins, practice: !!this.cfg.practice, coop: !!this.cfg.coop, rush: this.cfg.rush,
      name: this.kind === 'boss' ? this.def.name : this.lvl.name, par: this.kind === 'boss' ? this.def.par : this.lvl.par,
      carry: this.players.map(p => ({ hp: p.hp, meter: p.meter, dead: p.dead }))
    };
    r.grade = computeGrade(r);
    onStageWon(r);
  }
  // ---------- update ----------
  update(dt) {
    if (Trans.busy && Trans.phase === 2 && Trans.t < (Trans.leader || 0)) return;
    const M = Input.menu();
    if (this.deathMenu) { this.deathMenu.update(dt); return; }
    if (this.pauseMenu) { const pm = this.pauseMenu; if (pm.sub) { pm.sub.update(dt); return; } pm.update(dt); if (this.pauseMenu === pm && !pm.sub && pm.t > .12 && (M.back || (M.pause && !M.ok))) { this.pauseMenu = null; Sfx.back(); } return; }
    if ((M.pause || (Input.m.back && !this.deathMenu)) && (this.state === 'play' || this.state === 'intro')) { this.openPause(); return; }
    this.stateT += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    if (this.slowmo < 1) this.slowmo = Math.min(1, this.slowmo + dt * (this.state === 'ko' ? .7 : 2));
    dt *= this.slowmo;
    this.t += dt;
    if (this.state === 'play') this.stats.time += dt;
    if (this.boss) this.boss.introK = this.state === 'intro' ? ease.outQ(clamp(this.stateT / 1.7, 0, 1)) : 1;
    if (this.boss && this.state === 'intro' && Math.abs(this.stateT - 1.2) < dt) { Camera.shake(7, .4); Sfx.thud(); FX.puffs(this.boss.x, FLOOR - 10, 8, 20); }
    if (this.state === 'intro' && this.stateT > (this.kind === 'boss' ? 3.4 : 2.0)) { this.state = 'play'; this.stateT = 0; if (this.boss) this.boss.begin(); }
    if (this.state === 'intro' && this.kind === 'boss' && Math.abs(this.stateT - 2.6) < dt) Voice.say('On with the show!');
    if (this.superCine) { this.superCine.t += dt; if (this.superCine.t > 1) this.superCine = null; }
    updateAtmos(this, dt);
    // solids
    for (const s of this.solids) {
      s.py = s.y; s.px = s.x;
      if (s.move) { s.move(s, this.t, dt); s.dx = s.x - s.px; s.dy = s.y - s.py; for (const p of this.players) if (p.plat === s && p.ground) { p.x += s.dx; p.y += s.dy; } }
      if (s.tick) s.tick(s, dt, this);
    }
    for (const p of this.players) p.update(dt);
    this.lights = [];
    if (this.boss) this.boss.update(dt);
    if (this.lvl) levelUpdate(this, dt);
    this.updateShots(dt);
    this.updateHostile(dt);
    this.updateItems(dt);
    for (const h of this.hazards) if (h.update) h.update(h, dt, this);
    this.hazards = this.hazards.filter(h => !h.dead);
    FX.update(dt);
    if (this.darkT !== undefined) this.dark += (this.darkT - this.dark) * Math.min(1, dt * 3);
    // ghosts revive
    for (const d of this.players) if (d.dead && d.ghost && !d.ghost.solo) for (const p of this.alive()) if (p.parrying && dist(d.ghost.x, d.ghost.y + 34, p.cx, p.cy) < 48) { p.onParry({ x: d.ghost.x, y: d.ghost.y + 34 }); d.revive(); }
    // state machine
    if (this.state === 'ko') {
      if (this.stateT > 1.2) for (const p of this.alive()) p.victory = true;
      if (this.stateT > 4.6) this.finish();
    } else if (this.state === 'clear') { if (this.stateT > 3) this.finish(); }
    else if (this.state === 'dead' && this.stateT > 1.8 && !this.deathMenu) this.deathMenu = new DeathMenu(this);
    if (this.banner) { this.banner.t += dt; if (this.banner.t > this.banner.dur) this.banner = null; }
  }
  openPause() {
    Sfx.back();
    const items = [
      { label: 'RESUME', act: () => { this.pauseMenu = null; } },
      { label: 'RETRY', act: () => retryStage(this) }
    ];
    if (this.cfg.practice || !this.cfg.rush) items.push({ label: 'EXIT TO ' + (this.cfg.practice ? 'MENU' : 'MAP'), act: () => exitStage(this) });
    else items.push({ label: 'QUIT BOSS RUSH', act: () => exitStage(this) });
    items.push({ label: 'CONTROLS', act: () => { this.pauseMenu.sub = new ControlsHelp(() => { this.pauseMenu.sub = null; }); } });
    this.pauseMenu = new MenuList(items, { title: 'PAUSED', x: W / 2, y: 210, w: 320 });
  }
  targets() {
    const T = [];
    if (this.boss && this.boss.vul && !this.boss.dead && this.boss.trans <= 0 && !this.boss.hidden) for (const h of this.boss.hurt) T.push({ kind: 'boss', x: h.x, y: h.y, r: h.r, ref: this.boss });
    for (const e of this.enemies) if (e.hp > 0 && e.active && !e.ghostly) T.push({ kind: 'enemy', x: e.x, y: e.y - e.h / 2, r: Math.max(e.w, e.h) * .5, ref: e });
    for (const b of this.hostile) if (b.hp > 0) T.push({ kind: 'hb', x: b.x, y: b.y, r: b.r + 2, ref: b });
    if (this.boss && this.boss.extraTargets) for (const e of this.boss.extraTargets()) T.push(e);
    return T;
  }
  damageTarget(tg, d, owner, x, y) {
    let ok = true;
    if (tg.kind === 'boss') ok = tg.ref.damage(d);
    else if (tg.kind === 'enemy') { tg.ref.hp -= d; tg.ref.flash = .08; if (tg.ref.hp <= 0) enemyDie(this, tg.ref); }
    else if (tg.kind === 'hb') { tg.ref.hp -= d; tg.ref.flash = .08; if (tg.ref.hp <= 0) { tg.ref.dead = true; FX.puffs(tg.ref.x, tg.ref.y, 4, 10); Sfx.pop(); if (tg.ref.onKill) tg.ref.onKill(tg.ref, this); } }
    else if (tg.kind === 'custom') ok = tg.hit(d);
    if (ok && owner) { owner.addMeter(d * .0085); this.stats.dmg += d; }
    return ok;
  }
  explode(x, y, r, dmg, owner, s = 1) {
    FX.boom(x, y, s);
    for (const tg of this.targets()) if (dist(x, y, tg.x, tg.y) < r + tg.r) this.damageTarget(tg, dmg * (owner ? owner.dmgMul : 1), owner, x, y);
  }
  zap(p, x, y) {
    let best = null, bd = 260;
    for (const tg of this.targets()) { const d = dist(x, y, tg.x, tg.y); if (d < bd) { bd = d; best = tg; } }
    if (best) { this.damageTarget(best, 14 * p.dmgMul, p); FX.add({ k: 'fn', x, y, life: .2, draw: (q) => { X.beginPath(); X.moveTo(x, y); for (let i = 1; i < 6; i++) X.lineTo(lerp(x, best.x, i / 6) + rnd(-8, 8), lerp(y, best.y, i / 6) + rnd(-8, 8)); X.lineWidth = 3; X.strokeStyle = C.pink; X.stroke(); } }); }
  }
  updateShots(dt) {
    const T = this.targets();
    const offL = this.camX - 120, offR = this.camX + W + 120;
    for (const s of this.pshots) {
      s.t += dt;
      for (const [k, v] of s.hits) { if (v - dt <= 0) s.hits.delete(k); else s.hits.set(k, v - dt); }
      if (s.orbit) {
        const o = s.orbit; o.t += dt; o.ang += dt * 9;
        if (o.t < o.dur) { s.x = o.p.cx + Math.cos(o.ang) * 42; s.y = o.p.cy + Math.sin(o.ang) * 42; continue; }
        if (!s.launched) { s.launched = true; s.vx = Math.cos(o.ang + Math.PI / 2) * 600; s.vy = Math.sin(o.ang + Math.PI / 2) * 600; }
      }
      if (s.home && T.length) {
        let best = null, bd = 1e9; for (const tg of T) { const d = dist(s.x, s.y, tg.x, tg.y); if (d < bd) { bd = d; best = tg; } }
        if (best) { const sp = Math.hypot(s.vx, s.vy) || 600; let a = Math.atan2(s.vy, s.vx); const ta = angTo(s.x, s.y, best.x, best.y); let da = ((ta - a + Math.PI * 3) % TAU) - Math.PI; a += clamp(da, -s.home * dt, s.home * dt); s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; }
      }
      s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.k === 'chargeL' || s.k === 'sparkEX' || s.k === 'ghost') { if (frameNo % 2 === 0) FX.add({ k: 'spark', x: s.x, y: s.y, vx: -s.vx * .1 + rnd(-60, 60), vy: -s.vy * .1 + rnd(-60, 60), life: .2, col: s.k === 'ghost' ? '#cfefff' : WEAPONS[s.k === 'sparkEX' ? 'spark' : 'charge'].col }); }
      if (s.t > s.life || s.x < offL || s.x > offR || s.y < -150 || s.y > H + 100) { if (s.boom && s.t > s.life) this.explode(s.x, s.y, s.boom.r, s.boom.dmg, s.owner, s.k === 'bombEX' ? 1.5 : .8); s.dead = true; continue; }
      for (const tg of T) {
        if (s.hits.has(tg.ref)) continue;
        if (dist(s.x, s.y, tg.x, tg.y) < s.r + tg.r) {
          const ok = this.damageTarget(tg, s.dmg * s.owner.dmgMul, s.owner, s.x, s.y);
          FX.add({ k: 'ball', x: s.x, y: s.y, r: s.r * .9, life: .12, col: C.cream, lw: 1.5 }); FX.sparks(s.x, s.y, 3, s.col || C.yellow, 200);
          const big = s.dmg * s.owner.dmgMul >= 9;
          if (big && ok) { this.hitstop = Math.max(this.hitstop, .05); Camera.shake(3.5, .15); FX.add({ k: 'ring', x: s.x, y: s.y, r: 6, grow: 46, w: 5, life: .22, col: C.cream }); FX.stars(s.x, s.y, 4, s.col || C.yellow, 240); Sfx.thud(); }
          if (ok && tg.kind === 'enemy') { tg.ref.x += Math.sign(s.vx || 1) * 2.5; }
          if (ok && tg.kind === 'boss') Sfx.hit(s.k);
          if (s.boom) { this.explode(s.x, s.y, s.boom.r, s.boom.dmg, s.owner, s.k === 'bombEX' ? 1.5 : .8); s.dead = true; break; }
          if (s.pierce) { s.pierce--; s.hits.set(tg.ref, s.hitCd || .2); if (s.pierce <= 0) s.dead = true; }
          else { s.dead = true; break; }
        }
      }
      if (!s.dead && this.solidAt && this.solidAt(s.x, s.y)) { if (s.boom) this.explode(s.x, s.y, s.boom.r, s.boom.dmg, s.owner, .8); else FX.add({ k: 'ball', x: s.x, y: s.y, r: 6, life: .1 }); s.dead = true; }
    }
    this.pshots = this.pshots.filter(s => !s.dead);
    // super beams
    for (const bm of this.beams) {
      bm.t += dt; const p = bm.p; if (p.dead) bm.t = bm.dur;
      const m = p.muzzle(); bm.x = m.x; bm.y = m.y; bm.dir = p.face;
      const x0 = p.face > 0 ? m.x : this.camX - 50, x1 = p.face > 0 ? this.camX + W + 50 : m.x;
      for (const tg of T) if (tg.x + tg.r > x0 && tg.x - tg.r < x1 && Math.abs(tg.y - m.y) < 40 + tg.r) this.damageTarget(tg, bm.dps * dt * p.dmgMul, null);
      if (frameNo % 3 === 0) FX.sparks(lerp(x0, x1, Math.random()), m.y + rnd(-30, 30), 1, '#bfe9ff', 300);
    }
    this.beams = this.beams.filter(b => b.t < b.dur);
  }
  hitPlayerShape(b, p, grow = 0) {
    const r = p.rect; const R = { x: r.x - grow, y: r.y - grow, w: r.w + grow * 2, h: r.h + grow * 2 };
    if (b.shape === 'rect') return rectsHit({ x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h }, R);
    if (b.shape === 'line') return segDist(clamp(b.x1, R.x, R.x + R.w) * 0 + p.cx, p.cy, b.x1, b.y1, b.x2, b.y2) < b.w / 2 + Math.min(R.w, R.h) / 2;
    return circRect(b.x, b.y, b.r * (b.hitScale || .85), R.x, R.y, R.w, R.h);
  }
  updateHostile(dt) {
    const players = this.alive();
    for (const b of this.hostile) {
      b.t += dt; if (b.flash > 0) b.flash -= dt;
      if (b.upd) b.upd(b, dt, this);
      if (b.dead) continue;
      if (b.acc) { b.vx *= 1 + b.acc * dt; b.vy *= 1 + b.acc * dt; }
      b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.spin) b.rot = (b.rot || 0) + b.spin * dt;
      if (b.bounceFloor && b.y > (b.floorY || FLOOR) - b.r && b.vy > 0) { b.y = (b.floorY || FLOOR) - b.r; b.vy = -b.vy * b.bounceFloor; if (b.onBounce) b.onBounce(b, this); }
      if (b.floorDie && b.vy > 0 && b.y >= (b.floorY || FLOOR) - b.r * .4) { b.dead = true; if (b.onFloor) b.onFloor(b, this); else FX.puffs(b.x, b.y - 4, 2, 8); continue; }
      const m = b.margin ?? 160;
      if (b.t > b.life || (!b.keep && (b.x < this.camX - m || b.x > this.camX + W + m || b.y > H + m || b.y < -m - 200))) { b.dead = true; if (b.onEnd) b.onEnd(b, this); continue; }
      if (b.harmless || (b.armT && b.t < b.armT)) continue;
      for (const p of players) {
        if (b.pink && p.parrying && this.hitPlayerShape(b, p, 14)) { p.onParry(b); if (!b.pinkStay) { b.dead = true; if (b.onParry) b.onParry(b, this); } break; }
        if (this.hitPlayerShape(b, p)) { if (p.hurt() && b.breakOnHit) { b.dead = true; FX.puffs(b.x, b.y, 3, 8); } }
      }
    }
    this.hostile = this.hostile.filter(b => !b.dead);
    if (this.boss && !this.boss.dead) for (const h of this.boss.hit) for (const p of players) if (circRect(h.x, h.y, h.r, p.rect.x, p.rect.y, p.rect.w, p.rect.h)) p.hurt();
  }
  updateItems(dt) {
    for (const it of this.items) {
      it.t = (it.t || 0) + dt;
      if (it.cd > 0) it.cd -= dt;
      for (const p of this.alive()) {
        const r = p.rect;
        if (it.k === 'coin' || it.k === 'reel') {
          if (!it.got && circRect(it.x, it.y + Math.sin(it.t * 3) * 4, 16, r.x, r.y, r.w, r.h)) {
            it.got = true; this.stats.coins += it.k === 'coin' ? 1 : 0; it.onGet && it.onGet(it, this);
            if (it.k === 'coin') { Sfx.coin(); FX.pop(it.x, it.y - 20, '+1 COIN', C.gold, 16); } else { Sfx.reel(); FX.pop(it.x, it.y - 30, 'SECRET FILM REEL!', C.gold, 18); FX.confetti(it.x, it.y, 30); }
            FX.stars(it.x, it.y, 8, C.gold);
          }
        } else if (it.k === 'pinkorb' && it.cd <= 0) {
          if (p.parrying && circRect(it.x, it.y, 22, r.x - 12, r.y - 12, r.w + 24, r.h + 24)) { p.onParry(it); it.cd = 1; }
        }
      }
    }
  }
  // ---------- draw ----------
  draw() {
    X = ctx;
    ctx.save(); ctx.translate(Camera.x, Camera.y);
    if (this.state === 'ko' && this.stateT < 1.6 && this.boss && this.boss.hurt[0]) { const h = this.boss.hurt[0], z = 1 + .09 * Math.sin(Math.PI * this.stateT / 1.6); ctx.translate(h.x, h.y); ctx.scale(z, z); ctx.translate(-h.x, -h.y); }
    if (this.kind === 'boss') { if (this.bg) blit(this.bg, 0, 0, W, H); if (this.arena.live) this.arena.live(this, this.t); }
    else levelDrawBG(this);
    ctx.save(); ctx.translate(-Math.round(this.camX), 0);
    for (const s of this.solids) if (s.draw && !s.off) s.draw(s, this);
    for (const h of this.hazards) if (h.draw) h.draw(h, this);
    if (this.lvl) levelDrawMid(this);
    for (const it of this.items) drawItem(it, this);
    if (this.boss) this.boss.draw();
    for (const e of this.enemies) if (e.active) drawEnemy(e, this);
    for (const b of this.hostile) if (b.under) drawHostile(b);
    for (const bm of this.beams) drawBeam(bm, this);
    for (const p of this.players) p.draw();
    for (const s of this.pshots) drawPshot(s);
    for (const b of this.hostile) if (!b.under) drawHostile(b);
    FX.draw(0);
    if (this.lvl) levelDrawFG(this);
    ctx.restore();
    if (this.kind === 'boss' && this.arena.fg) this.arena.fg(this, this.t);
    drawAtmos(this);
    if (this.dark > .02) this.drawDark();
    if (this.tint) { ctx.save(); ctx.globalAlpha = this.tint.a; ctx.fillStyle = this.tint.c; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (this.flash > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, this.flash * 1.6); ctx.fillStyle = '#fff8e4'; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.restore(); }
    ctx.save(); ctx.translate(-Math.round(this.camX), 0); FX.draw(1); ctx.restore();
    ctx.restore();
    this.drawHUD();
    this.drawCards();
    if (this.pauseMenu) { ctx.save(); ctx.fillStyle = 'rgba(15,8,4,.55)'; ctx.fillRect(0, 0, W, H); ctx.restore(); if (this.pauseMenu.sub) this.pauseMenu.sub.draw(); else this.pauseMenu.draw(); }
    if (this.deathMenu) this.deathMenu.draw();
  }
  drawDark() {
    if (!this.darkC) this.darkC = mkCanvas(W, H, .5);
    const c = this.darkC, g = c.g;
    g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(4,3,12,' + this.dark.toFixed(3) + ')'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    const L = this.lights.slice();
    for (const p of this.alive()) L.push({ x: p.cx - this.camX, y: p.cy, r: 120 });
    for (const b of this.hostile) if (b.glow) L.push({ x: b.x - this.camX, y: b.y, r: b.glow });
    for (const l of L) { const gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.6, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); }
    g.globalCompositeOperation = 'source-over';
    ctx.drawImage(c, 0, 0, W, H);
  }
  drawHUD() {
    X = ctx;
    if (this.kind === 'boss' && this.state === 'intro' && this.stateT < 2.6) return;
    const top = Touch.visible();
    this.players.forEach((p, i) => {
      const x = 16 + i * 200, y = top ? 14 : H - 50;
      const low = p.hp === 1 && !p.dead;
      const blinkOn = !low || Math.floor(this.t * 4) % 2 === 0;
      rrect(x, y, 64, 34, 6, p.dead ? C.gray : low && blinkOn ? C.red : C.cream, 3);
      text(p.dead ? 'DEAD' : 'HP ' + p.hp, x + 32, y + 18, { size: p.dead ? 14 : 18, col: low && blinkOn ? C.cream : C.ink });
      text(p.pal.name, x + 32, y - 7, { size: 10, font: FONT_M, col: C.cream, stroke: 3 });
      for (let k = 0; k < 5; k++) {
        const cx = x + 74 + k * 20, fill = clamp(p.meter - k, 0, 1), full = fill >= 1;
        X.save(); X.translate(cx + 8, y + 17);
        if (full) X.rotate(Math.sin(this.t * 6 + k) * .08);
        rrect(-8, -15, 16, 30, 3, full ? C.cream : '#5a4636', 2.2);
        if (!full && fill > 0) { X.save(); rrectPath(-8, -15, 16, 30, 3); X.clip(); X.fillStyle = C.gold; X.fillRect(-8, 15 - 30 * fill, 16, 30 * fill); X.restore(); rrect(-8, -15, 16, 30, 3, null, 2.2); }
        if (full) { poly([-1, -9, 4, -1, 0, 0, 3, 9, -4, 0, 0, -1], p.meter >= 5 ? C.red : C.gold, 1.5); }
        X.restore();
      }
      const wn = WEAPONS[p.wname];
      text(wn.short + (p.weapons.length > 1 ? '  ⇄' : ''), x + 122, y - 8, { size: 11, font: FONT_M, col: C.cream, stroke: 3 });
    });
    if (this.boss && Settings.d.bossbar && !this.boss.dead && this.state !== 'intro') {
      const b = this.boss, bw = 360, bx = W / 2 - bw / 2, by = 18, k = b.hp / b.maxHp;
      text(b.def.name.toUpperCase(), W / 2, by - 2, { size: 12, font: FONT_M, col: C.cream, stroke: 3 });
      rrect(bx, by + 8, bw, 12, 6, '#3a2418', 2.5);
      X.save(); rrectPath(bx, by + 8, bw, 12, 6); X.clip(); X.fillStyle = b.trans > 0 ? C.cream : C.red; X.fillRect(bx, by + 8, bw * k, 12); X.restore();
      rrect(bx, by + 8, bw, 12, 6, null, 2.5);
      for (const ph of b.def.phases.slice(1)) line(bx + bw * ph.at, by + 6, bx + bw * ph.at, by + 22, 2.5, C.ink);
    }
    if (this.lvl) levelHUD(this);
    if (this.mini) { const e = this.mini, bw = 300, bx = W / 2 - bw / 2, by = 46, k = Math.max(0, e.hp) / e.maxHp; text(e.mini.name.toUpperCase(), W / 2, by - 4, { size: 11, font: FONT_M, col: C.cream, stroke: 3 }); rrect(bx, by + 4, bw, 10, 5, '#3a2418', 2.5); X.save(); rrectPath(bx, by + 4, bw, 10, 5); X.clip(); X.fillStyle = C.orange; X.fillRect(bx, by + 4, bw * k, 10); X.restore(); rrect(bx, by + 4, bw, 10, 5, null, 2.5); }
    if (this.cfg.practice) text('PRACTICE' + (this.cfg.inf ? ' · ∞ HP' : ''), W - 12, H - 14, { size: 12, font: FONT_M, col: C.cream, stroke: 3, align: 'right' });
    if (this.cfg.rush) text('BOSS RUSH ' + (this.cfg.rush.i + 1) + '/' + this.cfg.rush.list.length + '  ·  ' + fmtTime(this.cfg.rush.time + this.stats.time), W - 12, H - 14, { size: 12, font: FONT_M, col: C.cream, stroke: 3, align: 'right' });
    if (this.banner) {
      const bn = this.banner, k = bn.t / bn.dur, a = k < .15 ? k / .15 : k > .8 ? (1 - k) / .2 : 1;
      X.save(); X.globalAlpha = a; text(bn.s, W / 2, 92, { size: 26, col: C.cream, stroke: 7, shadow: 3, maxW: 560 }); if (bn.sub) text(bn.sub, W / 2, 122, { size: 14, font: FONT_M, col: C.cream, stroke: 4 }); X.restore();
    }
  }
  drawCards() {
    const t = this.stateT;
    if (this.superCine) { const k = this.superCine.t; X.save(); X.globalAlpha = Math.sin(Math.PI * Math.min(1, k)) * .9; X.translate(W / 2, H / 2 + 60); X.rotate(-.05); rrect(-230, -30, 460, 60, 8, C.red, 4); text(SUPERS[this.superCine.kind].name.toUpperCase() + '!', 0, 2, { size: 34, col: C.cream, stroke: 6, maxW: 420 }); X.restore(); }
    if (this.kind === 'boss' && this.state === 'intro') { const bar = 54 * (t < 2.4 ? ease.outQ(Math.min(1, t * 3)) : Math.max(0, 1 - (t - 2.4) * 2)); X.fillStyle = '#0d0907'; X.fillRect(0, 0, W, bar); X.fillRect(0, H - bar, W, bar);
      if (t > .3 && t < 2.3) { const k = Math.min(1, (t - .3) * 3), out = t > 2 ? (t - 2) / .3 : 0; X.save(); X.globalAlpha = 1 - out; X.translate((1 - ease.outBack(k)) * -500, 0); decoCard(40, 360, 470, 92, {}); text(this.def.name.toUpperCase(), 275, 392, { size: 26, col: C.red, maxW: 420 }); text(this.def.title + '  ·  ' + '★'.repeat(this.def.stars), 275, 424, { size: 13, font: FONT_M, col: C.ink2, maxW: 420 }); X.restore(); } }
    if (this.state === 'intro') {
      if (this.kind === 'boss') {
        if (t > 1.9 && t < 2.6) titleCard('READY?', t - 1.9, .7, 64);
        else if (t >= 2.6 && t < 3.4) titleCard('ON WITH THE SHOW!', t - 2.6, .8, 54);
        if (t > .6 && t < 2.3) { X.save(); X.globalAlpha = clamp(Math.min(t - .6, 2.3 - t) * 3, 0, 1); const s = this.def.intro.slice(0, Math.floor((t - .6) * 40)); rrect(560, 90, 360, 70, 16, C.white, 3); poly([840, 158, 860, 186, 870, 158], C.white, 0); line(840, 158, 860, 186, 3); line(860, 186, 870, 159, 3); wrapText(s, 740, 116, 330, 18, { size: 13, col: C.ink }); X.restore(); }
      } else {
        if (t < 2) { titleCard(this.lvl.name.toUpperCase(), t, 2, 46); X.save(); X.globalAlpha = clamp(2 - t, 0, 1) * clamp(t * 3, 0, 1); text("RUN 'N' GUN · " + WORLDS[this.lvl.world - 1].name, W / 2, H / 2 + 44, { size: 16, font: FONT_M, col: C.cream, stroke: 4 }); X.restore(); }
      }
    }
    if (this.state === 'ko') {
      if (t < 3.2) {
        const s = t < .3 ? ease.outBack(t / .3) * 1.2 : 1.2 - Math.min(.2, (t - .3) * .3);
        X.save(); X.globalAlpha = t > 2.7 ? (3.2 - t) / .5 : 1; X.translate(W / 2, H / 2 - 10); X.scale(s, s);
        drawBulbIcon(-245, -6, 26, Math.floor(t * 10) % 3 !== 0 && t < 1.2);
        wavyText('LIGHTS OUT!', 20, 0, { size: 84, col: C.cream, stroke: 12, shadow: 6 }, t);
        X.restore();
      }
    }
    if (this.state === 'clear' && t < 2.6) titleCard('BRAVO!', t, 2.6, 80);
  }
}
function titleCard(s, t, dur, size) {
  const k = t / dur; const a = k > .8 ? (1 - k) / .2 : 1; const sc = t < .25 ? ease.outBack(t / .25) : 1;
  X.save(); X.globalAlpha = clamp(a, 0, 1); X.translate(W / 2, H / 2 - 20); X.scale(sc, sc);
  wavyText(s, 0, 0, { size, col: C.cream, stroke: size * .16, shadow: 5, amp: 3 }, t);
  X.restore();
}
function drawBulbIcon(x, y, r, lit) {
  if (lit) { const gr = X.createRadialGradient(x, y, 2, x, y, r * 2.4); gr.addColorStop(0, 'rgba(255,220,120,.8)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); X.fillStyle = gr; X.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5); }
  for (let i = 0; i < 3; i++) ell(x, y + r * .95 + i * r * .22, r * .42, r * .13, 0, '#bbb5a8', 2.5);
  circ(x, y, r, lit ? '#fff1b8' : '#8a8276', 4);
  X.beginPath(); X.moveTo(x - r * .4, y - r * .2); for (let i = 0; i <= 5; i++) X.lineTo(x - r * .4 + i * r * .16, y - r * .2 + (i % 2 ? -r * .25 : 0)); X.lineWidth = 3; X.strokeStyle = lit ? C.orange : C.ink2; X.stroke();
}
function drawBeam(bm, st) {
  const x0 = bm.dir > 0 ? bm.x : st.camX - 50, x1 = bm.dir > 0 ? st.camX + W + 50 : bm.x, y = bm.y;
  const k = bm.t / bm.dur, h = 52 * (k < .1 ? k / .1 : k > .85 ? (1 - k) / .15 : 1) + Math.sin(bm.t * 60) * 4;
  X.save();
  X.fillStyle = 'rgba(140,210,255,.5)'; X.fillRect(x0, y - h / 2 - 8, x1 - x0, h + 16);
  rrect(x0, y - h / 2, x1 - x0, h, h / 2, '#dff4ff', 3);
  X.beginPath(); X.moveTo(x0, y); for (let x = x0; x < x1; x += 22) X.lineTo(x, y + rnd(-h / 2.5, h / 2.5)); X.lineWidth = 3; X.strokeStyle = '#3b8fd0'; X.stroke();
  X.restore();
}
function drawPshot(s) {
  const a = Math.atan2(s.vy, s.vx);
  X.save(); X.translate(s.x, s.y);
  switch (s.k) {
    case 'spark':
      X.rotate(a); ell(-6, 0, 14, 4.5, 0, '#ffd23f', 2); ell(-3, 0, 7, 2.2, 0, C.white, 0);
      X.beginPath(); X.moveTo(-22, 0); X.lineTo(-17, -4); X.lineTo(-12, 3); X.lineTo(-8, -2); X.lineWidth = 2; X.strokeStyle = '#ffb02e'; X.stroke(); break;
    case 'note': case 'noteEX': {
      const sc = s.k === 'noteEX' ? 1.7 : 1; X.scale(sc, sc); X.rotate(Math.sin(s.t * 20) * .3);
      ell(0, 4, 5.5, 4.2, -.4, '#7fd3c4', 2); line(4.5, 3, 4.5, -10, 2.2); X.beginPath(); X.moveTo(4.5, -10); X.quadraticCurveTo(11, -7, 9, -2); X.lineWidth = 2.2; X.strokeStyle = C.ink; X.stroke(); break;
    }
    case 'star': star(0, 0, 8, 5, .45, '#ffe27a', 2, s.t * 12); break;
    case 'starEX': star(0, 0, 15, 5, .45, '#ffe27a', 2.5, s.t * 10); circ(0, 0, 4, C.white, 0); break;
    case 'chargeS': circ(0, 0, 6, '#8fd0ff', 2); circ(-1.5, -1.5, 2, C.white, 0); break;
    case 'chargeL': { X.rotate(a); ell(-10, 0, 28, 16, 0, 'rgba(143,208,255,.45)', 0); circ(0, 0, 18, '#bfe6ff', 3); circ(0, 0, 10, C.white, 0); X.beginPath(); for (let i = 0; i < 4; i++) { const aa = i * 1.6 + s.t * 20; X.moveTo(0, 0); X.lineTo(Math.cos(aa) * 24, Math.sin(aa) * 24); } X.lineWidth = 2; X.strokeStyle = '#3b8fd0'; X.stroke(); break; }
    case 'bomb': case 'bombEX': {
      const sc = s.k === 'bombEX' ? 1.9 : 1; X.scale(sc, sc); X.rotate(s.t * 8);
      circ(0, 0, 10, '#2b2420', 2.5); circ(-3, -3, 3, '#6a5e55', 0); rrect(-3, -14, 6, 5, 1, '#6a5e55', 2);
      hose(0, -14, 5, -20, 3, 2, '#7a5a30'); star(6, -21, 4 + Math.sin(s.t * 40) * 1.5, 6, .4, C.yellow, 1); break;
    }
    case 'sparkEX': { X.rotate(s.t * 9); for (let i = 0; i < 8; i++) { const aa = i * TAU / 8; line(0, 0, Math.cos(aa) * 32, Math.sin(aa) * 32, 3, '#ffb02e'); } circ(0, 0, 20, '#ffe680', 3); circ(0, 0, 10, C.white, 0); break; }
    case 'ghost': {
      X.globalAlpha = .82; X.scale(s.vx < 0 ? -1 : 1, 1);
      const r = 46; ell(-30, 10, 40, 24, 0, 'rgba(200,235,255,.5)', 0);
      X.beginPath(); X.moveTo(-r * .4, r * .8); X.bezierCurveTo(-r * 1.3, r * .3, -r * 1.1, -r * 1.2, 0, -r * 1.2); X.bezierCurveTo(r * 1.1, -r * 1.2, r * 1.3, r * .3, r * .4, r * .8); X.closePath(); fillStroke('#e8f7ff', 4);
      pieEye(6, -24, 9, 13, .6, 0, {}); pieEye(28, -24, 9, 13, .6, 0, {}); X.beginPath(); X.arc(18, -2, 14, .1, Math.PI - .1); X.fillStyle = '#5a1a12'; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); break;
    }
  }
  X.restore();
}
function drawHostile(b) {
  X.save();
  if (b.alpha != null) X.globalAlpha = b.alpha;
  if (b.dr) b.dr(b);
  else if (b.k === 'orb') {
    const col = b.pink ? C.pink : (b.col || C.cream);
    if (b.glowC) { const gr = X.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 2.2); gr.addColorStop(0, b.glowC); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(b.x - b.r * 2.2, b.y - b.r * 2.2, b.r * 4.4, b.r * 4.4); }
    circ(b.x, b.y, b.r, col, 2.5); circ(b.x - b.r * .3, b.y - b.r * .3, b.r * .3, 'rgba(255,255,255,.7)', 0);
  } else if (b.k === 'warn') drawWarn(b);
  else if (b.k === 'rect') rrect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 6, b.col || C.red, 3);
  if (b.flash > 0) { X.globalAlpha = .5; circ(b.x, b.y, b.r, C.white, 0); }
  X.restore();
}
function drawWarn(b) {
  const blink = Math.floor(b.t * 12) % 2 === 0, a = .35 + (blink ? .3 : 0);
  X.save(); X.globalAlpha *= a;
  if (b.shape === 'rect' || b.w) { X.fillStyle = b.col || '#ff5040'; X.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); X.globalAlpha = .9; X.setLineDash([10, 8]); X.lineWidth = 3; X.strokeStyle = C.cream; X.strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); X.setLineDash([]); }
  else if (b.line) { X.setLineDash([12, 10]); line(b.x1, b.y1, b.x2, b.y2, b.lw || 4, b.col || '#ff5040'); X.setLineDash([]); }
  else { circ(b.x, b.y, b.r, b.col || '#ff5040', 0); }
  X.restore();
  if (b.icon !== false && !b.line) { X.save(); X.globalAlpha = blink ? 1 : .6; text('!', b.ix ?? b.x, b.iy ?? (b.y - (b.h || b.r * 2) / 2 - 16), { size: 22, col: C.yellow, stroke: 5 }); X.restore(); }
}
function warnRect(st, x, y, w, h, dur, o = {}) { return st.bullet(Object.assign({ k: 'warn', harmless: true, shape: 'rect', x, y, w, h, life: dur, keep: true }, o)); }
function warnLine(st, x1, y1, x2, y2, dur, o = {}) { return st.bullet(Object.assign({ k: 'warn', harmless: true, line: true, x: x1, y: y1, x1, y1, x2, y2, life: dur, keep: true }, o)); }

// paint cache
const PaintCache = new Map();
function paintCached(key, w, h, fn) {
  if (PaintCache.has(key)) return PaintCache.get(key);
  const c = mkCanvas(w, h); useCtx(c.g, () => fn(c.g, w, h));
  PaintCache.set(key, c);
  if (PaintCache.size > 6) { const k0 = PaintCache.keys().next().value; PaintCache.delete(k0); }
  return c;
}

// ---------- grading ----------
function computeGrade(r) {
  let pts = 0;
  pts += r.time <= r.par ? 2 : r.time <= r.par * 1.45 ? 1 : 0;
  pts += Math.min(3, r.hp);
  pts += Math.min(3, r.parries);
  if (r.type === 'boss') pts += Math.min(3, Math.floor(r.cards / 2)); else pts += Math.min(3, Math.floor(r.coins * .6));
  pts += DIFF[r.diff].stars;
  r.points = pts;
  if (r.diff === 'expert' && pts >= 14) return 'S';
  const table = [[13, 'A+'], [12, 'A+'], [11, 'A'], [10, 'A-'], [9, 'B+'], [8, 'B'], [7, 'B-'], [6, 'C+'], [5, 'C'], [4, 'C-']];
  for (const [p, g] of table) if (pts >= p) return g;
  return 'D';
}
const GRADE_ORDER = ['D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S'];
