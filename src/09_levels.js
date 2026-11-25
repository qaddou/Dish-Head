// =====================================================================
//  Worlds and Run 'n' Gun levels: enemies, hazards, coins, secrets
// =====================================================================
const WORLDS = [
  { n: 1, name: 'Buttercup Meadows', sub: 'A colorful countryside', level: 'hayride', bosses: ['bee'], theme: 'meadow', col: '#7aa84a', sky: ['#a9d3d6', '#f7e7b9'] },
  { n: 2, name: 'Hullabaloo Carnival', sub: 'A dangerous carnival', level: 'midway', bosses: ['magic', 'slot'], theme: 'carnival', col: '#c8382c', sky: ['#3a2a5a', '#e8a070'] },
  { n: 3, name: 'Kingdom of Coralia', sub: 'A mysterious underwater kingdom', level: 'coral', bosses: ['pirate', 'deep'], theme: 'coral', col: '#3c8f8a', sky: ['#3d7f92', '#0f2c3c'] },
  { n: 4, name: 'Cogsworth City', sub: 'A mechanical industrial city', level: 'foundry', bosses: ['doc', 'wyrm'], theme: 'foundry', col: '#7a7e88', sky: ['#e6b77e', '#6a6470'] },
  { n: 5, name: 'The Gloomlands', sub: 'A dark supernatural world', level: 'hollow', bosses: ['gloom'], theme: 'gloom', col: '#8e2219', sky: ['#1e0a16', '#5a1418'] }
];

// ---------------- builder ----------------
function LB() {
  const d = { g: [], p: [], m: [], c: [], e: [], coins: [], pinks: [], hz: [], sec: [] };
  const B = {
    d,
    ground(x0, x1, y = FLOOR, o = {}) { d.g.push(Object.assign({ x0, x1, y }, o)); return B; },
    plat(x, y, w) { d.p.push({ x, y, w }); return B; },
    mover(x, y, w, ax, ay, per, ph = 0) { d.m.push({ kind: 'line', x, y, w, ax, ay, per, ph }); return B; },
    wheel(cx, cy, r, n, per, w = 80) { for (let i = 0; i < n; i++) d.m.push({ kind: 'circle', cx, cy, r, per, ph: i / n * TAU, w }); return B; },
    crumble(x, y, w) { d.c.push({ x, y, w }); return B; },
    en(type, x, y, o) { d.e.push({ type, x, y, o }); return B; },
    coin(x, y) { d.coins.push({ x, y }); return B; },
    pink(x, y) { d.pinks.push({ x, y }); return B; },
    hz(type, x, o = {}) { d.hz.push(Object.assign({ type, x }, o)); return B; },
    secret(x, y, w, h, rx, ry) { d.sec.push({ x, y, w, h, rx, ry }); return B; }
  };
  return B;
}

const LEVELS = [
  {
    id: 'hayride', name: 'Hayride Hustle', world: 1, len: 6400, theme: 'meadow', song: 'w1', par: 150, goal: 6250,
    build(B) {
      B.ground(0, 1000).plat(400, 380, 100).plat(640, 320, 110).coin(695, 280).en('shroom', 520).en('shroom', 860).en('crow', 900, 260);
      B.ground(1160, 2200).ground(1500, 1700, FLOOR - 70).en('sunflower', 1620, FLOOR - 70).en('shroom', 1300).en('acorn', 1900).pink(1350, 330).hz('bale', 2150);
      B.mover(2280, 400, 100, 110, 0, 3.4).coin(2350, 280).en('crow', 2350, 220);
      B.ground(2500, 3600).plat(2700, 380, 100).plat(2850, 300, 100).plat(3000, 220, 100).coin(3050, 170).en('shroom', 2800).en('crow', 3100, 200).en('acorn', 3250).en('sunflower', 3330);
      B.plat(3400, FLOOR - 150, 160).secret(3400, FLOOR - 150, 160, 150, 3480, FLOOR - 40);
      B.ground(3760, 5000).plat(4150, 340, 100).coin(4200, 300).en('shroom', 3900).en('shroom', 4100).en('crow', 4300, 240).en('acorn', 4600).plat(4750, 360, 100).en('sunflower', 4800, 360).hz('bale', 4950).pink(4450, 320);
      B.mover(5040, 380, 90, 0, 80, 2.6).mover(5170, 330, 90, 0, 80, 2.6, Math.PI);
      B.ground(5300, 6400).en('shroom', 5500).en('crow', 5600, 220).plat(5700, 360, 90).coin(5800, 230).en('sunflower', 5950).pink(5450, 330).pink(5760, 300).en('acorn', 6050);
    }
  },
  {
    id: 'midway', name: 'Midway Mayhem', world: 2, len: 6600, theme: 'carnival', song: 'w2', par: 160, goal: 6450,
    build(B) {
      B.ground(0, 900).plat(500, 370, 100).en('clown', 600).en('balloon', 800, 260);
      B.wheel(1250, 300, 150, 4, 9, 86).coin(1250, 120).en('balloon', 1250, 200);
      B.ground(1600, 2600).hz('car', 1700, { x1: 2300 }).en('soldier', 2000).en('popcorn', 2450).pink(1900, 320).plat(2200, 340, 100);
      B.plat(2660, 380, 80);
      B.ground(2800, 3900).plat(3000, 360, 120).plat(3200, 290, 120).plat(3400, 220, 120).coin(3460, 170).en('clown', 3100).en('balloon', 3300, 180).en('soldier', 3600);
      B.plat(3700, FLOOR - 120, 200).secret(3700, FLOOR - 120, 200, 120, 3800, FLOOR - 20);
      B.mover(3960, 360, 100, 120, 0, 3.2).coin(4080, 250);
      B.ground(4200, 5200).plat(4550, 340, 100).en('popcorn', 4500).en('clown', 4700).en('soldier', 4900).en('balloon', 5000, 230).pink(4800, 300);
      B.wheel(5350, 330, 110, 2, 6, 86);
      B.ground(5500, 6600).en('clown', 5700).en('clown', 5900).en('balloon', 6000, 200).plat(5950, 300, 100).coin(6000, 200).en('popcorn', 6250).hz('car', 5600, { x1: 6100 });
    }
  },
  {
    id: 'coral', name: 'Coral Cavern Crawl', world: 3, len: 6200, theme: 'coral', song: 'w3', par: 160, goal: 6050, water: true,
    build(B) {
      B.ground(0, 6200);
      B.en('crab', 500).en('jelly', 700, 300).en('fish', 900, 250).hz('spikes', 900, { w: 220 }).plat(940, 360, 120).coin(1000, 200);
      for (const y of [100, 150, 200, 360, 410, 450]) B.hz('urchin', 1500, { y });
      B.en('puffer', 1700, 300).en('crab', 1850).en('jelly', 1950, 200).pink(1600, 270);
      B.hz('spikes', 2000, { w: 300 }).plat(2060, 380, 90).plat(2200, 320, 90).coin(2150, 120).en('fish', 2300, 200).en('fish', 2400, 360);
      for (const y of [100, 150, 200, 250, 400, 450]) B.hz('urchin', 2700, { y });
      B.en('jelly', 2900, 260).en('puffer', 3100, 380).en('crab', 3200).coin(2700, 325);
      B.hz('spikes', 3300, { w: 220 }).plat(3340, 360, 140).en('jelly', 3450, 220).pink(3400, 280);
      B.secret(3880, 300, 240, FLOOR - 300, 4000, 420);
      B.en('fish', 3700, 300).en('crab', 4300).en('puffer', 4450, 260).coin(4500, 140);
      for (const y of [80, 130, 180, 230, 280, 430]) B.hz('urchin', 4650, { y });
      B.hz('spikes', 4700, { w: 300 }).plat(4760, 380, 90).plat(4900, 330, 90).en('jelly', 4850, 220).en('fish', 5000, 300);
      B.en('crab', 5200).en('puffer', 5400, 300).en('jelly', 5600, 240).coin(5650, 380).pink(5500, 260).en('fish', 5800, 200);
    }
  },
  {
    id: 'foundry', name: 'Cogsworth Foundry', world: 4, len: 6600, theme: 'foundry', song: 'w4', par: 165, goal: 6450,
    build(B) {
      B.ground(0, 800).en('bot', 500).en('drone', 700, 240);
      B.ground(800, 1600, FLOOR, { conv: -90 }).hz('vent', 1000).hz('vent', 1350).en('bot', 1200).plat(1150, 330, 100).coin(1200, 290);
      B.mover(1650, 380, 90, 100, 0, 3);
      B.ground(1900, 3000).hz('crusher', 2200).hz('crusher', 2500).plat(2750, 340, 90).en('rturret', 2795, 340).en('drone', 2400, 220).en('drone', 2900, 260).coin(2350, 330).pink(2650, 300);
      B.mover(3060, 400, 90, 0, 90, 3).mover(3200, 340, 90, 0, 90, 3, Math.PI).coin(3200, 160);
      B.ground(3350, 4500).ground(3350, 3900, FLOOR, { conv: 90 }).hz('saw', 3500, { x1: 3850, y: FLOOR - 30 }).hz('vent', 4100).en('bot', 4000).en('bot', 4350).en('drone', 3700, 250);
      B.plat(4250, FLOOR - 130, 200).secret(4250, FLOOR - 130, 200, 130, 4350, FLOOR - 24).plat(4100, 300, 90).coin(4150, 250);
      B.mover(4540, 380, 90, 110, 0, 3.2);
      B.ground(4800, 6600).hz('crusher', 5100).hz('vent', 5400).en('rturret', 5700).en('bot', 5900).en('drone', 6000, 220).en('bot', 6200).pink(5250, 300).plat(5500, 330, 100).coin(5550, 280).hz('saw', 5800, { x1: 6100, y: FLOOR - 30 });
    }
  },
  {
    id: 'hollow', name: 'Shadow Hollow', world: 5, len: 6600, theme: 'gloom', song: 'w5', par: 170, goal: 6450,
    build(B) {
      B.ground(0, 700).en('ghost', 500, 340).en('bat', 650, 250);
      B.crumble(760, 380, 90).crumble(900, 330, 90).crumble(1040, 380, 90).crumble(1180, 330, 90).coin(970, 230).en('wisp', 1000, 200);
      B.ground(1300, 2300).hz('fire', 1500).en('skel', 1700).en('skel', 2000).en('wisp', 1800, 300).en('bat', 2100, 220).plat(1850, 330, 100).coin(1900, 280);
      B.mover(2360, 380, 90, 100, 0, 3).crumble(2580, 330, 90).mover(2740, 360, 90, 0, 70, 2.6).coin(2620, 200);
      B.ground(2900, 4000).hz('fire', 3300).hz('fire', 3600).en('ghost', 3100, 320).en('skel', 3400).en('wisp', 3500, 250).en('bat', 3800, 230);
      B.plat(3700, FLOOR - 120, 200).secret(3700, FLOOR - 120, 200, 120, 3800, FLOOR - 20);
      B.crumble(4060, 380, 90).crumble(4210, 330, 90).crumble(4360, 290, 90).crumble(4500, 360, 90).coin(4400, 160).en('bat', 4300, 200).en('wisp', 4450, 240);
      B.ground(4600, 6600).en('skel', 4900).en('ghost', 5100, 320).hz('fire', 5300).en('wisp', 5400, 250).en('skel', 5700).en('ghost', 5900, 300).en('bat', 6100, 220).hz('fire', 6000).plat(5550, 320, 100).coin(5600, 270).pink(5200, 300).pink(5800, 290);
    }
  }
];

// ---------------- enemies ----------------
const ENEMY = {
  shroom: { beh: 'walk', hp: 12, w: 34, h: 38, spd: 70 },
  crow: { beh: 'swoop', hp: 8, w: 40, h: 26 },
  sunflower: { beh: 'turret', hp: 20, w: 40, h: 84, rate: 2.4, aim: true, shot: '#8a5a2a' },
  acorn: { beh: 'hop', hp: 10, w: 30, h: 34 },
  clown: { beh: 'hop', hp: 14, w: 36, h: 42 },
  balloon: { beh: 'float', hp: 6, w: 30, h: 40, pinkChance: .35 },
  popcorn: { beh: 'turret', hp: 22, w: 44, h: 60, rate: 2.6, lob: true, shot: '#fff6dc' },
  soldier: { beh: 'walk', hp: 16, w: 30, h: 54, spd: 55, shoot: 2.6 },
  crab: { beh: 'walk', hp: 14, w: 44, h: 28, spd: 80 },
  jelly: { beh: 'bob', hp: 8, w: 34, h: 40, pinkChance: .3 },
  puffer: { beh: 'puff', hp: 12, w: 36, h: 36 },
  fish: { beh: 'fly', hp: 6, w: 36, h: 22, spd: 120 },
  bot: { beh: 'walk', hp: 20, w: 34, h: 50, spd: 60, shoot: 2.2 },
  drone: { beh: 'swoop', hp: 10, w: 40, h: 24 },
  rturret: { beh: 'turret', hp: 24, w: 40, h: 40, rate: 1.8, aim: true, shot: '#bfc4cc' },
  ghost: { beh: 'chase', hp: 12, w: 34, h: 40, spd: 70, phase: true },
  skel: { beh: 'walk', hp: 16, w: 30, h: 54, spd: 50, bone: 2.4 },
  wisp: { beh: 'chase', hp: 5, w: 22, h: 22, spd: 85, pinkAlways: true },
  bat: { beh: 'fly', hp: 5, w: 30, h: 20, spd: 150 }
};
function groundAt(st, x, fromY = -1e9) {
  let best = null;
  for (const s of st.solids) if (!s.off && x >= s.x && x <= s.x + s.w && s.y >= fromY - 2) if (best === null || s.y < best) best = s.y;
  return best;
}
function buildLevel(st, lvl) {
  const B = LB(); lvl.build(B); const d = B.d, T = THEMES[lvl.theme];
  st.theme = T; st.bounds = { l: 0, r: lvl.len }; st.spawnX = 110; st.secrets = [];
  for (const g of d.g) st.solids.push({ x: g.x0, y: g.y, w: g.x1 - g.x0, h: H + 200 - g.y, ground: true, conv: g.conv || 0, draw: T.drawGround });
  for (const p of d.p) st.solids.push({ x: p.x, y: p.y, w: p.w, h: 16, oneWay: true, draw: T.drawPlat });
  for (const m of d.m) {
    if (m.kind === 'line') st.solids.push({ x: m.x, y: m.y, w: m.w, h: 16, oneWay: true, bx: m.x, by: m.y, m, move: (s, t) => { const k = Math.sin(t * TAU / s.m.per + s.m.ph); s.x = s.bx + k * s.m.ax; s.y = s.by + k * s.m.ay; }, draw: T.drawPlat });
    else st.solids.push({ x: m.cx, y: m.cy, w: m.w, h: 16, oneWay: true, m, move: (s, t) => { const a = t * TAU / s.m.per + s.m.ph; s.x = s.m.cx + Math.cos(a) * s.m.r - s.w / 2; s.y = s.m.cy + Math.sin(a) * s.m.r; }, draw: drGondola });
  }
  for (const c of d.c) st.solids.push({ x: c.x, y: c.y, w: c.w, h: 16, oneWay: true, crumble: true, ct: 0, offT: 0, onStand: s => { if (!s.ct) s.ct = .001; }, tick: (s, dt) => { if (s.ct > 0) { s.ct += dt; if (s.ct > .5) { s.off = true; s.ct = 0; s.offT = 2.6; for (let i = 0; i < 4; i++) FX.add({ k: 'debris', x: s.x + i * s.w / 4 + 10, y: s.y + 6, vx: rnd(-40, 40), vy: rnd(-50, 50), g: 900, r: 10, col: '#4a3440', vr: rnd(-6, 6), life: 1 }); Sfx.thud(); } } if (s.offT > 0) { s.offT -= dt; if (s.offT <= 0) s.off = false; } }, draw: drCrumble });
  d.coins.forEach((c, i) => { const got = !st.cfg.practice && Save.levelRec(lvl.id).coins[i]; st.items.push({ k: 'coin', x: c.x, y: c.y, idx: i, got: false, had: got, onGet: (it) => { st.gotCoins = st.gotCoins || []; st.gotCoins.push(it.idx); } }); });
  for (const p of d.pinks) st.items.push({ k: 'pinkorb', x: p.x, y: p.y, cd: 0 });
  for (const s of d.sec) { st.secrets.push({ x: s.x, y: s.y, w: s.w, h: s.h, a: 1 }); st.items.push({ k: 'reel', x: s.rx, y: s.ry, onGet: () => { st.gotReel = true; } }); }
  for (const e of d.e) {
    const def = ENEMY[e.type]; const y = e.y ?? groundAt(st, e.x) ?? FLOOR;
    st.enemies.push(Object.assign({ type: e.type, def, x: e.x, y, x0: e.x, y0: y, w: def.w, h: def.h, hp: def.hp, vx: 0, vy: 0, dir: -1, t: rnd(2), active: false, cd: rnd(.5, 1.5), pink: def.pinkAlways || (def.pinkChance && Math.random() < def.pinkChance) }, e.o || {}));
  }
  for (const h of d.hz) st.hazards.push(makeHazard(st, h));
  st.goal = lvl.goal;
  setupMini(st, lvl);
  st.solidAt = (x, y) => { for (const s of st.solids) if (!s.off && !s.oneWay && x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h) return true; return false; };
}
function makeHazard(st, h) {
  const gy = groundAt(st, h.x) ?? FLOOR;
  switch (h.type) {
    case 'spikes': return { type: 'spikes', x: h.x, w: h.w || 120, y: gy, draw: drSpikes, update: (o, dt, st) => { for (const p of st.alive()) if (rectsHit(p.rect, { x: o.x, y: o.y - 18, w: o.w, h: 18 })) p.hurt(); } };
    case 'urchin': return { type: 'urchin', x: h.x, y: h.y, r: 20, t: rnd(5), draw: drUrchin, update: (o, dt, st) => { o.t += dt; for (const p of st.alive()) if (circRect(o.x, o.y, o.r * .85, p.rect.x, p.rect.y, p.rect.w, p.rect.h)) p.hurt(); } };
    case 'bale': return { type: 'bale', x: h.x, cd: 1, update: (o, dt, st) => { o.cd -= dt; if (o.cd <= 0 && o.x > st.camX + 200 && o.x < st.camX + W + 300) { o.cd = 3.6; st.bullet({ x: o.x, y: gy - 26, r: 26, vx: -190, g: 1500, dr: drBale, margin: 400, keep: false, upd: (q, dt2, s2) => { const gyy = groundAt(s2, q.x, q.y - 10); if (gyy !== null && q.y + q.r >= gyy && q.vy >= 0) { q.y = gyy - q.r; q.vy = 0; } } }); } } };
    case 'car': return { type: 'car', x: h.x, x0: h.x, x1: h.x1, y: gy, dir: 1, t: 0, draw: drCar, update: (o, dt, st) => { o.t += dt; o.x += o.dir * 210 * dt; if (o.x > o.x1) o.dir = -1; if (o.x < o.x0) o.dir = 1; for (const p of st.alive()) if (rectsHit(p.rect, { x: o.x - 34, y: o.y - 40, w: 68, h: 40 })) p.hurt(); } };
    case 'vent': case 'fire': return { type: h.type, x: h.x, y: gy, t: rnd(3), draw: h.type === 'vent' ? drVent : drFirePit, update: (o, dt, st) => { o.t += dt; const c = o.t % 3.2; o.on = c > 1.4 && c < 2.6; o.warn = c > .8 && c <= 1.4; if (o.on) for (const p of st.alive()) if (rectsHit(p.rect, { x: o.x - 22, y: o.y - 170, w: 44, h: 170 })) p.hurt(); } };
    case 'crusher': return { type: 'crusher', x: h.x, y: gy, t: rnd(2), py: 0, draw: drCrusher, update: (o, dt, st) => { o.t += dt; const c = o.t % 3; let k; if (c < 1.4) k = 0; else if (c < 1.8) k = 0; else if (c < 1.95) k = (c - 1.8) / .15; else if (c < 2.5) k = 1; else k = 1 - (c - 2.5) / .5; o.shake = c > 1.4 && c < 1.8; const was = o.k; o.k = k; if (k >= 1 && was < 1) { Camera.shake(4, .15); Sfx.thud(); FX.puffs(o.x, o.y - 6, 4, 10); } const bottom = lerp(60, o.y, k); o.bottom = bottom; for (const p of st.alive()) if (rectsHit(p.rect, { x: o.x - 38, y: 0, w: 76, h: bottom })) p.hurt(); } };
    case 'saw': return { type: 'saw', x: h.x, x0: h.x, x1: h.x1, y: h.y, dir: 1, t: 0, draw: (o) => drSaw({ x: o.x, y: o.y, r: 26, t: o.t }), update: (o, dt, st) => { o.t += dt; o.x += o.dir * 170 * dt; if (o.x > o.x1) o.dir = -1; if (o.x < o.x0) o.dir = 1; for (const p of st.alive()) if (circRect(o.x, o.y, 22, p.rect.x, p.rect.y, p.rect.w, p.rect.h)) p.hurt(); } };
  }
  return { update() { } };
}
function enemyDie(st, e) {
  if (e.dead) return; e.dead = true; e.hp = 0; if (e.mini) miniDied(st, e);
  FX.puffs(e.x, e.y - e.h / 2, 6, 14); FX.stars(e.x, e.y - e.h / 2, 4, C.yellow); Sfx.pop();
  if (e.type === 'puffer' && !e.popped) for (let i = 0; i < 8; i++) st.bullet({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(i * TAU / 8) * 200, vy: Math.sin(i * TAU / 8) * 200, r: 7, col: '#e8c060', life: 1.2 });
}
function updateEnemy(st, e, dt) {
  const D = e.def, P = st.target({ x: e.x, y: e.y }); e.t += dt; if (e.flash > 0) e.flash -= dt;
  const water = st.mode === 'water';
  const ground = () => { const gy = groundAt(st, e.x, e.y - 30); if (gy !== null && e.y >= gy - 1 && e.vy >= 0) { e.y = gy; e.vy = 0; e.onG = true; } else e.onG = false; };
  switch (D.beh) {
    case 'walk': {
      e.vy += (water ? 900 : 2200) * dt; e.y += e.vy * dt; ground();
      if (e.onG) { const ahead = groundAt(st, e.x + e.dir * (e.w / 2 + 4), e.y - 4); if (ahead === null || Math.abs(ahead - e.y) > 6) e.dir *= -1; e.x += e.dir * D.spd * dt; }
      if (Math.abs(P.x - e.x) < 500) {
        if (D.shoot) { e.cd -= dt; if (e.cd <= 0) { e.cd = D.shoot; e.dir = P.x < e.x ? -1 : 1; st.bullet({ x: e.x + e.dir * 18, y: e.y - e.h * .6, vx: e.dir * 280, r: 6, col: e.type === 'bot' ? '#ff7050' : '#3a3a3a', pink: Math.random() < .15 }); Sfx.shoot('spark'); } }
        if (D.bone) { e.cd -= dt; if (e.cd <= 0) { e.cd = D.bone; const T = 1, g = 1100; st.bullet({ x: e.x, y: e.y - e.h, vx: (P.x - e.x) / T, vy: (P.cy - (e.y - e.h) - .5 * g * T * T) / T, g, r: 10, dr: drBone, pink: Math.random() < .2 }); Sfx.whoosh(); } }
      }
      break;
    }
    case 'hop': {
      e.vy += 2000 * dt; e.y += e.vy * dt; e.x += e.vx * dt; const was = e.onG; ground();
      if (e.onG) { e.vx = 0; e.cd -= dt; if (e.cd <= 0 && Math.abs(P.x - e.x) < 600) { e.cd = rnd(.9, 1.4); e.dir = P.x < e.x ? -1 : 1; e.vx = e.dir * 170; e.vy = -620; } }
      if (e.y > H + 100) e.dead = true;
      break;
    }
    case 'swoop': {
      if (!e.dive) { e.x = e.x0 + Math.sin(e.t * 1.5) * 40; e.y = e.y0 + Math.sin(e.t * 3) * 14; if (Math.abs(P.x - e.x) < 280) { e.dive = true; const a = angTo(e.x, e.y, P.x, P.cy); e.vx = Math.cos(a) * 320; e.vy = Math.sin(a) * 320; Sfx.whoosh(); } }
      else { e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > H + 60 || e.y < -60) e.dead = true; }
      break;
    }
    case 'turret': {
      if (Math.abs(P.x - e.x) < 620) { e.cd -= dt; if (e.cd <= 0) { e.cd = D.rate; e.fire = .25; const x = e.x, y = e.y - e.h * .8, pk = Math.random() < .2;
        if (D.lob) { const T = 1.1, g = 900; st.bullet({ x, y, vx: (P.x - x) / T, vy: (P.cy - y - .5 * g * T * T) / T, g, r: 9, col: D.shot, pink: pk, floorDie: false }); }
        else { const a = angTo(x, y, P.x, P.cy); st.bullet({ x, y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, r: 7, col: D.shot, pink: pk }); }
        Sfx.shoot('chaser'); } }
      if (e.fire > 0) e.fire -= dt;
      break;
    }
    case 'float': { e.x = e.x0 - e.t * 25; e.y = e.y0 + Math.sin(e.t * 2) * 30; break; }
    case 'bob': { e.y = e.y0 + Math.sin(e.t * 2.4) * 60; break; }
    case 'fly': { e.x -= D.spd * dt; e.y = e.y0 + Math.sin(e.t * 3) * 40; break; }
    case 'puff': {
      e.y = e.y0 + Math.sin(e.t * 2) * 20;
      if (!e.inflate && dist(e.x, e.y, P.x, P.cy) < 140) { e.inflate = .01; }
      if (e.inflate) { e.inflate += dt; if (e.inflate > .7) { e.popped = true; for (let i = 0; i < 8; i++) st.bullet({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(i * TAU / 8) * 220, vy: Math.sin(i * TAU / 8) * 220, r: 7, col: '#e8c060', life: 1.4, pink: i === 0 }); FX.puffs(e.x, e.y - 18, 5, 12); Sfx.pop(); e.dead = true; } }
      break;
    }
    case 'chase': {
      const a = angTo(e.x, e.y - e.h / 2, P.x, P.cy); e.x += Math.cos(a) * D.spd * dt; e.y += Math.sin(a) * D.spd * dt;
      if (D.phase) { e.ghostly = (e.t % 4) > 2.6; }
      break;
    }
  }
  // contact
  if (!e.ghostly && !e.dead) for (const p of st.alive()) {
    const r = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
    if (e.pink && p.parrying && rectsHit(r, { x: p.rect.x - 12, y: p.rect.y - 12, w: p.rect.w + 24, h: p.rect.h + 24 })) { p.onParry({ x: e.x, y: e.y - e.h / 2 }); enemyDie(st, e); break; }
    if (rectsHit(r, p.rect)) p.hurt();
  }
}
function levelUpdate(st, dt) {
  // camera
  const al = st.alive(); const ps = al.length ? al : st.players;
  const ax = ps.reduce((s, p) => s + p.x, 0) / ps.length;
  if (st.miniDef && !st.miniStarted && al.some(p => p.x > st.miniX + 120)) startMini(st);
  const target = st.camLock != null ? st.camLock : clamp(ax - W * .38, 0, st.lvl.len - W);
  st.camX += (target - st.camX) * Math.min(1, dt * (st.camLock != null ? 3 : 6));
  st.camX = Math.max(st.camX, 0);
  st.bounds = st.camLock != null ? { l: Math.max(st.camX, st.camLock) + 4, r: st.camLock + W - 4 } : { l: Math.max(0, st.camX + 4), r: Math.min(st.lvl.len, st.camX + W - 4) };
  if (st.players.length > 1 && al.length > 1) { const mn = Math.min(...al.map(p => p.x)), mx = Math.max(...al.map(p => p.x)); if (mx - mn > W - 80) for (const p of al) p.x = clamp(p.x, mx - (W - 80), mn + (W - 80)); }
  for (const e of st.enemies) {
    if (!e.active && e.x < st.camX + W + 80 && e.x > st.camX - 80) e.active = true;
    if (e.active && !e.dead) { if (e.mini) updateMini(st, e, dt); else updateEnemy(st, e, dt); }
    if (!e.mini && (e.x < st.camX - 500 || e.y > H + 200)) e.dead = true;
  }
  st.enemies = st.enemies.filter(e => !e.dead);
  for (const s of st.secrets) { const inside = st.alive().some(p => p.x > s.x && p.x < s.x + s.w && p.cy > s.y && p.cy < s.y + s.h); s.a += ((inside ? .12 : 1) - s.a) * Math.min(1, dt * 6); if (inside && !s.found) { s.found = true; Sfx.reel(); FX.pop(s.x + s.w / 2, s.y - 20, 'SECRET!', C.gold, 20); } }
  if (st.state === 'play' && (!st.miniDef || st.miniDone) && al.some(p => p.x >= st.goal)) st.onLevelClear();
}
function levelDrawBG(st) {
  const T = st.theme;
  const far = paintCached('far_' + st.lvl.theme, W, H, T.far), mid = paintCached('mid_' + st.lvl.theme, W, H, T.mid);
  const ox = -((st.camX * .15) % W); blit(far, Math.floor(ox), 0, W, H); blit(far, Math.floor(ox) + W - 1, 0, W, H);
  const mx = -((st.camX * .45) % W); blit(mid, Math.floor(mx), 0, W, H); blit(mid, Math.floor(mx) + W - 1, 0, W, H);
  if (T.live) T.live(st, st.t);
}
function levelDrawMid(st) {
  const gx = st.goal; if (gx > st.camX - 200 && gx < st.camX + W + 200) drGoal(gx, groundAt(st, gx) ?? FLOOR, st.t);
}
function levelDrawFG(st) {
  for (const s of st.secrets) if (s.x < st.camX + W && s.x + s.w > st.camX) { X.save(); X.globalAlpha = s.a; st.theme.cover(s, st.t); X.restore(); }
}
function levelHUD(st) {
  const x0 = W / 2 - 160, x1 = W / 2 + 160, y = 20;
  line(x0, y, x1, y, 4, C.ink); line(x0, y, x1, y, 2, C.cream);
  for (const p of st.players) { const k = clamp(p.x / st.goal, 0, 1); circ(lerp(x0, x1, k), y, 7, p.pal.shirt, 2.5); }
  text('THE END', x1 + 34, y + 1, { size: 11, font: FONT_M, col: C.cream, stroke: 3 });
  const coins = st.items.filter(i => i.k === 'coin');
  coins.forEach((c, i) => { const xx = W - 30 - (coins.length - 1 - i) * 24, yy = 24; const has = c.got || c.had; X.save(); X.globalAlpha = has ? 1 : .35; circ(xx, yy, 9, has ? C.gold : '#5a4636', 2.5); text('$', xx, yy + 1, { size: 11, col: has ? '#a07010' : C.cream }); X.restore(); });
}
function drawItem(it, st) {
  if (it.got) return;
  const y = it.y + Math.sin((it.t || 0) * 3) * 4;
  if (it.k === 'coin') { X.save(); X.translate(it.x, y); X.globalAlpha = it.had ? .45 : 1; X.scale(Math.abs(Math.cos((it.t || 0) * 3)) * .85 + .15, 1); circ(0, 0, 13, C.gold, 3); circ(0, 0, 8, '#f6d36a', 1.5); text('$', 0, 1, { size: 14, col: '#a07010' }); X.restore(); if (frameNo % 20 === 0) FX.add({ k: 'star', x: it.x + rnd(-14, 14), y: y + rnd(-14, 14), r: 4, life: .4, col: '#fff3b0' }); }
  else if (it.k === 'reel') { X.save(); X.translate(it.x, y); X.rotate((it.t || 0) * 2); circ(0, 0, 18, C.gold, 3); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; circ(Math.cos(a) * 9, Math.sin(a) * 9, 4, '#8a6010', 1.5); } circ(0, 0, 3, C.ink, 0); X.restore(); }
  else if (it.k === 'pinkorb') { X.save(); X.globalAlpha = it.cd > 0 ? .35 : 1; star(it.x, y, 16, 5, .5, C.pink, 2.5, (it.t || 0)); circ(it.x, y, 5, C.white, 0); X.restore(); }
}
function drGoal(x, y, t) {
  for (const sx of [-70, 70]) { rrect(x + sx - 7, y - 220, 14, 220, 3, '#7a4a2a', 3); circ(x + sx, y - 226, 10, C.gold, 2.5); }
  X.save(); X.translate(x, y - 180 + Math.sin(t * 2) * 3);
  X.beginPath(); X.moveTo(-74, -30); X.quadraticCurveTo(0, -46, 74, -30); X.lineTo(74, 26); X.quadraticCurveTo(0, 12, -74, 26); X.closePath(); fillStroke(C.cream, 3.5);
  text('THE END', 0, -4, { size: 26, col: C.red, font: FONT_D }); X.restore();
}
// ---------------- enemy art ----------------
function drawEnemy(e, st) {
  const t = e.t; X.save();
  if (e.ghostly) X.globalAlpha = .25;
  X.translate(e.x, e.y);
  if (e.scale) { const q = (e.squash || 0) * .25; X.scale(e.scale * (1 + q), e.scale * (1 - q)); shadowAt(0, 0, 16, .3); }
  if (e.flash > 0) X.scale(1.08, .94);
  const pk = e.pink;
  const face = (P => P ? (P.x < e.x ? -1 : 1) : -1)(st.target());
  switch (e.type) {
    case 'shroom': { X.scale(e.dir, 1); const w = Math.sin(t * 12) * 5; hose(-6, -14, -8 - w, 0, 3, 4); hose(6, -14, 8 + w, 0, -3, 4); shoe(-8 - w, 0, 1, .8, '#5a3420'); shoe(8 + w, 0, 1, .8, '#5a3420'); rrect(-11, -26, 22, 16, 6, '#f6ead0', 2.5); X.beginPath(); X.moveTo(-22, -22); X.quadraticCurveTo(-22, -46, 0, -46); X.quadraticCurveTo(22, -46, 22, -22); X.closePath(); fillStroke(C.red, 2.5); circ(-8, -36, 4, C.white, 0); circ(9, -33, 3, C.white, 0); circ(0, -42, 2.5, C.white, 0); pieEye(4, -20, 3, 4, .5, 0, { brow: 1.4 }); pieEye(-4, -20, 3, 4, .5, 0, { brow: -1.4 }); break; }
    case 'crow': { X.scale(e.dive ? (e.vx > 0 ? -1 : 1) : 1, 1); const f = Math.sin(t * 16) * 10; ell(0, -12, 16, 10, 0, '#2a2420', 2.5); poly([0, -14, 10, -30 - f, 18, -12], '#3a3430', 2); circ(-14, -18, 8, '#2a2420', 2.5); poly([-20, -20, -32, -16, -20, -13], C.yellow, 1.5); pieEye(-15, -20, 2.5, 3, -.5, 0, {}); poly([14, -12, 26, -16, 24, -6], '#2a2420', 2); break; }
    case 'sunflower': { const sw = Math.sin(t * 2) * 4; hose(0, 0, sw, -60, 6, 6, '#3f6324'); ell(-10, -26, 10, 5, .5, '#6a9a3b', 2); ell(10, -38, 10, 5, -.5, '#6a9a3b', 2); X.translate(sw, -68); for (let i = 0; i < 12; i++) { X.save(); X.rotate(i * TAU / 12 + t * .5); ell(0, -20, 6, 11, 0, C.yellow, 2); X.restore(); } circ(0, 0, 15, '#7a4a2a', 2.5); pieEye(face * 3 - 5, -2, 3, 4, face, 0, {}); pieEye(face * 3 + 5, -2, 3, 4, face, 0, {}); if (e.fire > 0) circ(face * 3, 7, 4, C.ink, 0); else line(face * 3 - 4, 7, face * 3 + 4, 7, 2); break; }
    case 'acorn': { const sq = e.onG ? 1 : 1.1; X.scale(1 / sq, sq); hose(-5, -6, -8, 0, 2, 3.5); hose(5, -6, 8, 0, -2, 3.5); ell(0, -16, 13, 15, 0, '#b0773e', 2.5); X.beginPath(); X.arc(0, -22, 15, Math.PI, 0); X.closePath(); fillStroke('#6a4628', 2.5); line(0, -37, 2, -42, 3); pieEye(-4, -14, 3, 4, face, 0, { brow: 1 }); pieEye(5, -14, 3, 4, face, 0, { brow: -1 }); break; }
    case 'clown': { const sq = e.onG ? 1 : 1.08; X.scale(1 / sq, sq); hose(0, -10, 0, 0, 0, 4); for (let i = 0; i < 3; i++) ell(0, -4 - i * 3, 10, 2, 0, null, 2); ell(0, -24, 18, 14, 0, '#3f6fa8', 2.5); for (let i = -2; i <= 2; i++) circ(i * 7, -34, 5, C.white, 1.5); circ(0, -44, 13, C.white, 2.5); circ(0, -42, 4, C.red, 1.5); pieEye(-5, -48, 2.5, 3.5, face, 0, {}); pieEye(5, -48, 2.5, 3.5, face, 0, {}); X.beginPath(); X.arc(0, -40, 7, .2, Math.PI - .2); X.lineWidth = 2; X.strokeStyle = C.red; X.stroke(); poly([-8, -55, 0, -72, 8, -55], C.yellow, 2); circ(0, -73, 3, C.red, 1.5); break; }
    case 'balloon': { line(0, -4, Math.sin(t * 3) * 4, 20, 1.5); X.translate(0, -24); ell(0, 0, 15, 19, 0, pk ? C.pink : '#e8a020', 2.5); poly([-3, 18, 3, 18, 0, 22], pk ? C.pink : '#e8a020', 1.5); pieEye(-5, -4, 2.5, 3.5, face, 0, {}); pieEye(5, -4, 2.5, 3.5, face, 0, {}); X.beginPath(); X.arc(0, 4, 5, .2, Math.PI - .2); X.lineWidth = 2; X.strokeStyle = C.ink; X.stroke(); ell(-6, -8, 3, 6, .4, 'rgba(255,255,255,.6)', 0); break; }
    case 'popcorn': { poly([-20, 0, -24, -50, 24, -50, 20, 0], C.white, 2.5); for (let i = 0; i < 4; i++) { X.fillStyle = C.red; X.fillRect(-20 + i * 11, -48, 5, 46); } poly([-20, 0, -24, -50, 24, -50, 20, 0], null, 2.5); for (let i = 0; i < 5; i++) cloudPuff(-16 + i * 8, -56 - (i % 2) * 6, 7, '#fff6dc', 1.5); pieEye(-6, -30, 3.5, 5, face, 0, { brow: 1.2 }); pieEye(6, -30, 3.5, 5, face, 0, { brow: -1.2 }); ell(0, -16, 5, e.fire > 0 ? 5 : 2, 0, C.ink, 0); break; }
    case 'soldier': { X.scale(e.dir, 1); const w = Math.sin(t * 8) * 4; line(-5, -18, -5 - w, 0, 4); line(5, -18, 5 + w, 0, 4); rrect(-10, -38, 20, 22, 4, '#2f5ea8', 2.5); line(-10, -30, 10, -30, 2, C.white); circ(0, -44, 7, '#f2d0b0', 2); rrect(-8, -66, 16, 18, 4, C.ink, 2); pieEye(2, -45, 2, 3, 1, 0, {}); circ(-3, -40, 2, C.red, 0); rrect(6, -34, 24, 4, 1, '#5a3a22', 1.5); break; }
    case 'crab': { const w = Math.sin(t * 14) * 4; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) hose(sx * 8, -8, sx * (16 + i * 4), 0 - (i === 1 ? w : -w) * .5, sx * 3, 3); ell(0, -14, 22, 12, 0, '#d8452e', 2.5); for (const sx of [-1, 1]) { hose(sx * 16, -18, sx * 26, -30, sx * -4, 3.5); X.save(); X.translate(sx * 28, -34); X.rotate(sx * (.3 + Math.abs(Math.sin(t * 6)) * .4)); ell(0, 0, 9, 6, 0, '#d8452e', 2); X.restore(); } line(-5, -24, -6, -32, 2); line(5, -24, 6, -32, 2); circ(-6, -34, 4, C.white, 1.5); circ(6, -34, 4, C.white, 1.5); circ(-6 + face, -34, 2, C.ink, 0); circ(6 + face, -34, 2, C.ink, 0); break; }
    case 'jelly': { X.translate(0, -24); X.save(); X.globalAlpha *= .85; const p = Math.sin(t * 5) * 3; for (let i = -2; i <= 2; i++) hose(i * 6, 8, i * 7 + Math.sin(t * 4 + i) * 6, 30, 3, 2.5, pk ? C.pinkD : '#b080d0'); X.beginPath(); X.moveTo(-18 - p, 8); X.quadraticCurveTo(-18 - p, -20, 0, -20); X.quadraticCurveTo(18 + p, -20, 18 + p, 8); X.closePath(); fillStroke(pk ? C.pink : 'rgba(200,160,240,.85)', 2.5); X.restore(); pieEye(-6, -4, 2.5, 3.5, face, 0, {}); pieEye(6, -4, 2.5, 3.5, face, 0, {}); break; }
    case 'puffer': { const inf = e.inflate ? 1 + Math.min(1, e.inflate * 1.6) * .5 : 1; X.translate(0, -18); X.scale(inf, inf); if (e.inflate) for (let i = 0; i < 10; i++) { const a = i * TAU / 10; poly([Math.cos(a - .15) * 16, Math.sin(a - .15) * 16, Math.cos(a) * 24, Math.sin(a) * 24, Math.cos(a + .15) * 16, Math.sin(a + .15) * 16], '#e8c060', 1.5); } circ(0, 0, 17, '#f2d070', 2.5); poly([15, 0, 24, -7, 24, 7], '#e8c060', 2); pieEye(-6, -4, 3, 4, face, 0, { brow: e.inflate ? 1.5 : 0 }); ell(-10, 6, 4, e.inflate ? 4 : 2, 0, C.ink, 0); break; }
    case 'fish': { X.scale(-1, 1); X.translate(0, -10); ell(0, 0, 18, 10, 0, '#e8823a', 2.5); poly([16, 0, 28, -9, 28, 9], '#e8823a', 2); for (let i = 0; i < 2; i++) line(-2 + i * 6, -8, -2 + i * 6, 8, 1.5, '#b0502a'); pieEye(-9, -2, 3, 4, 0, 0, {}); break; }
    case 'bot': { X.scale(e.dir, 1); const w = Math.sin(t * 9) * 3; rrect(-12, -12, 9, 12, 2, '#6a6a72', 2); rrect(3, -12, 9, 12, 2, '#6a6a72', 2); rrect(-15, -44 + w * .3, 30, 32, 5, '#9aa0ae', 2.5); circ(4, -32, 7, '#ffe0d0', 2); circ(5, -32, 3.5, C.red, 0); line(0, -44, 0, -54, 2); circ(0, -56, 3, C.red, 1.5); rrect(12, -30, 14, 6, 2, '#5a5e68', 2); break; }
    case 'drone': { const f = Math.abs(Math.cos(t * 40)) * 18 + 2; ell(-10, -26, f, 3, 0, '#c0c4cc', 1.5); ell(10, -26, f, 3, 0, '#c0c4cc', 1.5); line(-10, -24, -10, -18, 2); line(10, -24, 10, -18, 2); ell(0, -12, 18, 9, 0, '#7a7e88', 2.5); circ(0, -10, 5, '#ffe0d0', 2); circ(-1, -10, 2.5, C.red, 0); break; }
    case 'rturret': { rrect(-20, -16, 40, 16, 3, '#5a5e68', 2.5); X.beginPath(); X.arc(0, -16, 18, Math.PI, 0); fillStroke('#8a8e98', 2.5); const a = angTo(e.x, e.y - 30, st.target().x, st.target().cy); X.save(); X.translate(0, -22); X.rotate(a); rrect(0, -5, 26, 10, 3, '#4a4e58', 2); X.restore(); circ(0, -24, 4, C.red, 1.5); break; }
    case 'ghost': { X.translate(0, -20 + Math.sin(t * 3) * 4); X.scale(face < 0 ? 1 : -1, 1); X.beginPath(); X.moveTo(-16, 18); X.quadraticCurveTo(-20, -20, 0, -22); X.quadraticCurveTo(20, -20, 16, 18); for (let i = 0; i < 4; i++) X.quadraticCurveTo(12 - i * 8, 10 + (i % 2) * 8, 8 - i * 8, 18); X.closePath(); fillStroke('#eef0ff', 2.5); pieEye(-6, -6, 3, 5, -.6, 0, {}); pieEye(5, -6, 3, 5, -.6, 0, {}); ell(-1, 6, 4, 5, 0, C.ink, 0); break; }
    case 'skel': { X.scale(e.dir, 1); const w = Math.sin(t * 8) * 4; line(-4, -20, -4 - w, 0, 3, '#efe8d4'); line(4, -20, 4 + w, 0, 3, '#efe8d4'); line(0, -40, 0, -20, 3, '#efe8d4'); for (let i = 0; i < 3; i++) ell(0, -36 + i * 5, 8, 2, 0, null, 2); circ(0, -48, 10, '#efe8d4', 2.5); circ(-3, -49, 2.6, C.ink, 0); circ(4, -49, 2.6, C.ink, 0); line(-4, -42, 4, -42, 1.5); hose(0, -36, 12, -28, 3, 3, '#efe8d4'); break; }
    case 'wisp': { X.translate(0, -12); const f = Math.sin(t * 20) * 3; const gr = X.createRadialGradient(0, 0, 2, 0, 0, 26); gr.addColorStop(0, 'rgba(255,120,200,.7)'); gr.addColorStop(1, 'rgba(255,120,200,0)'); X.fillStyle = gr; X.fillRect(-26, -26, 52, 52); poly([-10, 4, -6, -16 - f, 0, -8, 6, -18 + f, 10, 4], C.pinkL, 2); circ(0, 2, 9, C.pink, 2.5); circ(-3, 1, 1.6, C.ink, 0); circ(3, 1, 1.6, C.ink, 0); break; }
    case 'bat': drBat({ x: 0, y: -10, vx: -1, t, pink: pk }); break;
  }
  X.restore();
}
function drBone(b) { X.translate(b.x, b.y); X.rotate(b.t * 12); rrect(-11, -2.5, 22, 5, 2, b.pink ? C.pink : '#efe8d4', 1.8); for (const sx of [-1, 1]) { circ(sx * 11, -3, 3.5, b.pink ? C.pink : '#efe8d4', 1.5); circ(sx * 11, 3, 3.5, b.pink ? C.pink : '#efe8d4', 1.5); } }
function drBale(b) { X.translate(b.x, b.y); X.rotate(b.t * -6); circ(0, 0, b.r, '#e8c060', 3); for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(0, 0, b.r * (.3 + i * .22), 0, TAU); X.lineWidth = 1.5; X.strokeStyle = '#a07a30'; X.stroke(); } line(-b.r, 0, b.r, 0, 2, '#7a5a20'); }
function drSpikes(o) { for (let x = o.x; x < o.x + o.w; x += 20) poly([x, o.y, x + 10, o.y - 20, x + 20, o.y], o.urchin ? '#3a2040' : '#6a3a5a', 2); }
function drUrchin(o) { X.save(); X.translate(o.x, o.y); X.rotate(o.t * .5); for (let i = 0; i < 14; i++) { const a = i * TAU / 14; line(0, 0, Math.cos(a) * o.r * 1.2, Math.sin(a) * o.r * 1.2, 3, '#2a1a3a'); } circ(0, 0, o.r * .65, '#5a3a6a', 2.5); X.restore(); }
function drCar(o) { X.save(); X.translate(o.x, o.y); X.scale(o.dir, 1); rrect(-34, -36, 68, 30, 12, '#3f6fa8', 3); rrect(-10, -50, 20, 16, 4, C.cream, 2); circ(-20, -4, 8, C.ink, 0); circ(20, -4, 8, C.ink, 0); rrect(-38, -16, 76, 8, 4, C.ink, 0); pieEye(26, -24, 4, 5, 1, 0, { brow: 1.4 }); X.restore(); }
function drVent(o) { rrect(o.x - 24, o.y - 12, 48, 12, 2, '#5a5e68', 2.5); if (o.warn) FX.add({ k: 'puff', x: o.x + rnd(-10, 10), y: o.y - 14, vy: -60, r: 6, life: .4, col: '#e8e4dc', lw: 1.5 }); if (o.on) { X.save(); X.globalAlpha = .85; for (let i = 0; i < 6; i++) cloudPuff(o.x + Math.sin(o.t * 20 + i) * 6, o.y - 20 - i * 28, 16 + i * 2, '#f2eee6', 2); X.restore(); } }
function drFirePit(o) { rrect(o.x - 26, o.y - 10, 52, 10, 2, '#3a2a30', 2.5); if (o.warn) FX.add({ k: 'spark', x: o.x + rnd(-14, 14), y: o.y - 12, vx: 0, vy: -150, col: '#ff9a40', life: .3 }); if (o.on) { for (let i = 0; i < 5; i++) { const f = Math.sin(o.t * 30 + i) * 6; poly([o.x - 20 + i * 2, o.y - 6, o.x - 8 + f, o.y - 90 - i * 18, o.x + 4 - f, o.y - 50, o.x + 12 + f, o.y - 120 - i * 10, o.x + 20 - i * 2, o.y - 6], i % 2 ? '#ff7a2a' : '#ffd35a', 2); } } }
function drCrusher(o) { const b = o.bottom || 60, sh = o.shake ? rnd(-2, 2) : 0; X.save(); X.translate(sh, 0); rrect(o.x - 12, -10, 24, b - 40, 3, '#6a6e78', 2.5); rrect(o.x - 38, b - 44, 76, 44, 6, '#8a8e98', 3.5); for (let i = 0; i < 4; i++) poly([o.x - 34 + i * 18, b, o.x - 25 + i * 18, b + 10, o.x - 16 + i * 18, b], '#5a5e68', 2); X.restore(); }
function drGondola(s) { const m = s.m; line(m.cx, m.cy, s.x + s.w / 2, s.y - 30, 3, '#7a5a3a'); if (m.ph === 0) { X.save(); X.beginPath(); X.arc(m.cx, m.cy, m.r, 0, TAU); X.lineWidth = 4; X.strokeStyle = 'rgba(122,90,58,.5)'; X.stroke(); circ(m.cx, m.cy, 12, C.gold, 3); X.restore(); } X.beginPath(); X.moveTo(s.x + s.w / 2, s.y - 30); X.lineTo(s.x + 6, s.y); X.moveTo(s.x + s.w / 2, s.y - 30); X.lineTo(s.x + s.w - 6, s.y); X.lineWidth = 2; X.strokeStyle = C.ink; X.stroke(); rrect(s.x, s.y, s.w, 20, 6, '#c8382c', 3); rrect(s.x + 4, s.y + 4, s.w - 8, 5, 2, C.cream, 1.5); }
function drCrumble(s) { if (s.off) return; const sh = s.ct > 0 ? rnd(-2, 2) : 0; X.save(); X.translate(sh, 0); rrect(s.x, s.y, s.w, s.h + 4, 3, '#4a3440', 3); for (let i = 1; i < 4; i++) line(s.x + i * s.w / 4, s.y + 2, s.x + i * s.w / 4 + 4, s.y + s.h + 2, 1.5); X.restore(); }

// ---------------- level themes ----------------
function tileHills(g, w, h, y, amp, col, k, a = .45) { wash(g, gg => { gg.moveTo(0, h); gg.lineTo(0, y); for (let x = 0; x <= w; x += 20) gg.lineTo(x, y - Math.sin(x / w * TAU * k) * amp - Math.sin(x / w * TAU * (k * 2 + 1)) * amp * .3); gg.lineTo(w, h); gg.closePath(); }, col, { alpha: a, jit: 0, passes: 3 }); }
const THEMES = {
  meadow: {
    far(g, w, h) { skyGrad(g, w, h, '#a9d3d6', '#f7e7b9'); for (const [x, y, s] of [[120, 90, 30], [420, 60, 36], [760, 120, 26]]) cloudPuff(x, y, s, '#fffaf0', 2.5); tileHills(g, w, h, 330, 40, '#9cc27a', 2); Paper.apply(g, w, h, .3); },
    mid(g, w, h) { tileHills(g, w, h, 400, 30, '#76a44f', 3, .55); for (let i = 0; i < 4; i++) { const x = 60 + i * 240; line(x, 400, x, 330, 8, '#6a4428'); circ(x, 310, 34, '#5d8c38', 3); circ(x - 20, 330, 22, '#6d9c42', 2.5); } },
    drawGround(s, st) { if (s.x > st.camX + W + 10 || s.x + s.w < st.camX - 10) return; X.fillStyle = '#a5784b'; X.fillRect(s.x, s.y, s.w, H - s.y + 10); X.fillStyle = '#7aa84a'; X.beginPath(); X.moveTo(s.x, s.y + 12); for (let x = s.x; x < s.x + s.w; x += 24) X.quadraticCurveTo(x + 12, s.y + 22, Math.min(x + 24, s.x + s.w), s.y + 12); X.lineTo(s.x + s.w, s.y - 2); X.lineTo(s.x, s.y - 2); X.closePath(); X.fill(); rrect(s.x, s.y, s.w, H - s.y + 20, 6, null, 3); for (let x = s.x + 20; x < s.x + s.w - 10; x += 70) ell(x, s.y + 40 + (x % 3) * 12, 6, 4, 0, '#8a6038', 1.5); },
    drawPlat(s) { rrect(s.x, s.y, s.w, 14, 4, '#b07a44', 3); for (let x = s.x + 14; x < s.x + s.w; x += 26) circ(x, s.y + 7, 1.8, C.ink, 0); },
    cover(s, t) { blobPoly([s.x - 8, s.y + s.h, s.x - 4, s.y + 30, s.x + 20, s.y - 6, s.x + s.w / 2, s.y - 14, s.x + s.w - 20, s.y - 6, s.x + s.w + 4, s.y + 30, s.x + s.w + 8, s.y + s.h], '#e8c060', 3); for (let i = 0; i < 8; i++) line(s.x + 10 + i * s.w / 8, s.y + 10, s.x + 14 + i * s.w / 8, s.y + s.h - 6, 1.5, '#a07a30'); X.save(); X.globalAlpha *= .5 + Math.sin(t * 3) * .3; star(s.x + s.w - 20, s.y + s.h - 30, 5, 4, .4, C.white, 0); X.restore(); },
    live(st, t) { }
  },
  carnival: {
    far(g, w, h) { skyGrad(g, w, h, '#3a2a5a', '#e8a070'); for (let i = 0; i < 30; i++) circ(rnd(w), rnd(200), rnd(.8, 1.8), '#fff6dc', 0); for (let i = 0; i < 3; i++) { const x = 140 + i * 320; poly([x - 90, 420, x, 260, x + 90, 420], i % 2 ? '#8e2219' : '#c8382c', 3); for (let k = -2; k <= 2; k++) line(x + k * 18, 420, x, 262, 2, 'rgba(255,240,220,.5)'); } Paper.apply(g, w, h, .3); },
    mid(g, w, h) { for (let i = 0; i < 2; i++) { const cx = 240 + i * 480; g.save(); g.globalAlpha = .5; g.beginPath(); g.arc(cx, 260, 130, 0, TAU); g.lineWidth = 6; g.strokeStyle = '#4a2a3a'; g.stroke(); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; line(cx, 260, cx + Math.cos(a) * 130, 260 + Math.sin(a) * 130, 3, '#4a2a3a'); } g.restore(); } g.save(); for (let x = 0; x < w; x += 40) { const y = 140 + Math.sin(x / w * TAU) * 10; poly([x, y, x + 40, y, x + 20, y + 26], ['#c8382c', '#f2c230', '#3f6fa8'][(x / 40) % 3], 2); } g.restore(); },
    drawGround(s, st) { if (s.x > st.camX + W + 10 || s.x + s.w < st.camX - 10) return; X.fillStyle = '#7a3a2a'; X.fillRect(s.x, s.y, s.w, H - s.y + 10); for (let x = s.x; x < s.x + s.w; x += 40) { X.fillStyle = (Math.floor(x / 40) % 2) ? '#c8382c' : '#f6ead0'; X.fillRect(x, s.y, Math.min(40, s.x + s.w - x), 14); } rrect(s.x, s.y, s.w, H - s.y + 20, 4, null, 3); line(s.x, s.y + 14, s.x + s.w, s.y + 14, 2); },
    drawPlat(s) { rrect(s.x, s.y, s.w, 14, 6, '#f2c230', 3); for (let x = s.x + 6; x < s.x + s.w - 6; x += 16) circ(x + 4, s.y + 7, 3, (Math.floor(x / 16) + Math.floor(st_t() * 4)) % 2 ? '#fff3a0' : '#a07010', 1); },
    cover(s, t) { rrect(s.x - 6, s.y - 20, s.w + 12, s.h + 20, 6, '#c8382c', 3); for (let x = s.x; x < s.x + s.w; x += 30) { X.fillStyle = '#f6ead0'; X.fillRect(x, s.y - 18, 14, s.h + 16); } rrect(s.x - 6, s.y - 20, s.w + 12, s.h + 20, 6, null, 3); text('FUN HOUSE', s.x + s.w / 2, s.y + 10, { size: 16, col: C.gold, stroke: 4 }); },
    live(st, t) { }
  },
  coral: {
    far(g, w, h) { skyGrad(g, w, h, '#3d7f92', '#0f2c3c'); tileHills(g, w, h, 380, 50, '#1d3c48', 2, .5); for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha = .25; const x = 160 + i * 320; rrect(x - 30, 200, 60, 200, 30, '#2a4a58', 0); poly([x - 40, 200, x, 120, x + 40, 200], '#2a4a58', 0); g.restore(); } Paper.apply(g, w, h, .25); },
    mid(g, w, h) { const R = mulberry32(11); for (let i = 0; i < 9; i++) { const x = R() * w, c = ['#e86a4a', '#f4a0a0', '#e8c060', '#9a7ad0'][i % 4]; for (let k = 0; k < 5; k++) hose(x, 470, x + (k - 2) * 14, 400 - R() * 40, (k - 2) * 6, 7, c); } for (let i = 0; i < 6; i++) { const x = 80 + i * 160; hose(x, 470, x + 10, 260, 20, 8, '#3f6a3a'); } },
    drawGround(s, st) { if (s.x > st.camX + W + 10 || s.x + s.w < st.camX - 10) return; X.fillStyle = '#c9b27a'; X.fillRect(s.x, s.y, s.w, H - s.y + 10); for (let x = s.x + 10; x < s.x + s.w; x += 50) ell(x, s.y + 24 + (x % 3) * 10, 8, 3, 0, '#a89058', 0); rrect(s.x, s.y, s.w, H - s.y + 20, 4, null, 3); },
    drawPlat(s) { blobPoly([s.x, s.y + 8, s.x + 16, s.y - 3, s.x + s.w - 16, s.y - 2, s.x + s.w, s.y + 9, s.x + s.w - 24, s.y + 22, s.x + 24, s.y + 20], '#6a7a7a', 3); },
    cover(s, t) { for (let i = 0; i < 10; i++) { const x = s.x + i * s.w / 9, sw = Math.sin(t * 1.5 + i) * 8; X.beginPath(); X.moveTo(x - 12, s.y + s.h); X.quadraticCurveTo(x + sw, s.y + s.h / 2, x + sw - 4, s.y - 10); X.quadraticCurveTo(x + 14 + sw, s.y + s.h / 2, x + 12, s.y + s.h); X.closePath(); fillStroke(i % 2 ? '#4f8a3a' : '#3f7a32', 2.5); } },
    live(st, t) { X.save(); X.globalAlpha = .1; for (let i = 0; i < 4; i++) { const x = 150 + i * 240 + Math.sin(t * .3 + i) * 40; X.beginPath(); X.moveTo(x, 0); X.lineTo(x + 50, 0); X.lineTo(x + 100, FLOOR); X.lineTo(x - 80, FLOOR); X.closePath(); X.fillStyle = '#e8fbff'; X.fill(); } X.restore(); if (frameNo % 10 === 0) FX.add({ k: 'bubble', x: st.camX + rnd(W), y: FLOOR, vy: -rnd(40, 90), r: rnd(2, 6), life: 6 }); }
  },
  foundry: {
    far(g, w, h) { skyGrad(g, w, h, '#e6b77e', '#8c96a8'); g.fillStyle = '#7a7480'; for (let i = 0; i < 10; i++) { const x = i * 100, hh = 120 + (i * 53 % 120); g.fillRect(x, 440 - hh, 80, hh); if (i % 2) g.fillRect(x + 30, 440 - hh - 80, 16, 80); } Paper.apply(g, w, h, .3); },
    mid(g, w, h) { for (let i = 0; i < 4; i++) { const x = 100 + i * 240; g.save(); g.globalAlpha = .6; g.beginPath(); for (let k = 0; k < 12; k++) { const a = k * TAU / 12, r = k % 2 ? 60 : 50; g.lineTo(x + Math.cos(a) * r, 250 + Math.sin(a) * r); } g.closePath(); g.fillStyle = '#5a5460'; g.fill(); g.restore(); } line(0, 360, w, 360, 12, '#5a5460'); },
    drawGround(s, st) { if (s.x > st.camX + W + 10 || s.x + s.w < st.camX - 10) return; X.fillStyle = '#4e4e56'; X.fillRect(s.x, s.y, s.w, H - s.y + 10); if (s.conv) { rrect(s.x, s.y, s.w, 18, 9, '#2a2a30', 3); const off = (st.t * s.conv) % 30; for (let x = s.x + 10; x < s.x + s.w - 10; x += 30) { const xx = s.x + 10 + ((x - s.x + off) % (s.w - 20) + (s.w - 20)) % (s.w - 20); circ(xx, s.y + 9, 5, '#8a8e98', 1.5); } } for (let x = s.x + 10; x < s.x + s.w; x += 60) circ(x, s.y + 28, 2.5, '#9a9aa4', 1); rrect(s.x, s.y, s.w, H - s.y + 20, 2, null, 3); },
    drawPlat(s) { rrect(s.x, s.y, s.w, 14, 2, '#8a8e98', 3); for (let x = s.x; x < s.x + s.w - 10; x += 18) { line(x + 2, s.y + 2, x + 16, s.y + 12, 1.5); } },
    cover(s, t) { rrect(s.x - 4, s.y - 4, s.w + 8, s.h + 8, 4, '#7a5a4a', 3); for (let y = s.y; y < s.y + s.h; y += 20) for (let x = s.x + ((y - s.y) / 20 % 2) * 20; x < s.x + s.w; x += 40) rrect(x, y + 2, 36, 16, 2, '#8a6a58', 1.5); text('BOILER', s.x + s.w / 2, s.y + 30, { size: 14, col: C.cream, stroke: 4 }); },
    live(st, t) { if (frameNo % 12 === 0) FX.add({ k: 'puff', x: st.camX + rnd(W), y: 120, vy: -20, vx: -30, r: 14, life: 2, col: '#cfc8bc', a: .5 }); }
  },
  gloom: {
    far(g, w, h) { skyGrad(g, w, h, '#1e0a16', '#5a1418'); g.save(); g.globalAlpha = .55; circ(700, 160, 70, '#e8d0a0', 0); g.restore(); tileHills(g, w, h, 360, 60, '#12060c', 3, .8); Paper.apply(g, w, h, .3); },
    mid(g, w, h) { for (let i = 0; i < 5; i++) { const x = 80 + i * 200; line(x, 470, x + 10, 330, 7, '#1a0a10'); hose(x + 8, 360, x + 50, 320, -10, 4, '#1a0a10'); hose(x + 6, 380, x - 40, 340, 10, 4, '#1a0a10'); } for (let i = 0; i < 6; i++) { const x = 40 + i * 170; rrect(x, 430, 30, 40, 14, '#3a2a30', 2.5); line(x + 15, 440, x + 15, 460, 2); line(x + 8, 447, x + 22, 447, 2); } },
    drawGround(s, st) { if (s.x > st.camX + W + 10 || s.x + s.w < st.camX - 10) return; X.fillStyle = '#3a2a30'; X.fillRect(s.x, s.y, s.w, H - s.y + 10); for (let x = s.x; x < s.x + s.w; x += 50) line(x, s.y, x + 6, s.y + 70, 2, '#1e1218'); rrect(s.x, s.y, s.w, H - s.y + 20, 2, null, 3); X.fillStyle = '#4a2a3a'; X.fillRect(s.x, s.y, s.w, 6); },
    drawPlat(s) { rrect(s.x, s.y, s.w, 16, 3, '#4a3440', 3); },
    cover(s, t) { rrect(s.x - 4, s.y - 30, s.w + 8, s.h + 30, 4, '#3a2a36', 3); X.beginPath(); X.moveTo(s.x - 4, s.y - 30); X.lineTo(s.x + s.w / 2, s.y - 70); X.lineTo(s.x + s.w + 4, s.y - 30); X.closePath(); fillStroke('#2a1a26', 3); text('R.I.P.', s.x + s.w / 2, s.y + 20, { size: 18, col: '#9a8a90', stroke: 3 }); },
    live(st, t) { }
  }
};
