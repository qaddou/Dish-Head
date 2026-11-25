// =====================================================================
//  Menus & screens
// =====================================================================
class MenuList {
  constructor(items, o = {}) { this.items = items; this.o = o; this.i = Math.max(0, items.findIndex(it => !it.disabled)); this.t = 0; }
  move(d) { const n = this.items.length; let k = 0; do { this.i = (this.i + d + n) % n; k++; } while (this.items[this.i].disabled && k < n); Sfx.menu(); }
  update(dt) {
    this.t += dt; if (this.sub) { this.sub.update(dt); return; }
    const M = Input.menu();
    if (M.up) this.move(-1); if (M.down) this.move(1);
    const it = this.items[this.i];
    if (it && it.adjust && (M.left || M.right)) { it.adjust(M.right ? 1 : -1); Sfx.menu(); }
    else if (M.ok && it && !it.disabled && this.t > .1) { Sfx.select(); if (it.act) it.act(); else if (it.adjust) it.adjust(1); }
    if (M.back && this.o.onBack && this.t > .1) { Sfx.back(); this.o.onBack(); }
  }
  draw() {
    if (this.sub) { this.sub.draw(); return; }
    const o = this.o, n = this.items.length, ih = o.ih || 40, w = o.w || 340, h = (o.title ? 62 : 22) + n * ih + 18;
    const x = (o.x || W / 2) - w / 2, y = o.y ?? (H / 2 - h / 2);
    decoCard(x, y, w, h, { fill: o.fill });
    if (o.title) text(o.title, x + w / 2, y + 36, { size: o.titleSize || 28, col: C.red, maxW: w - 50 });
    this.items.forEach((it, i) => {
      const ap = clamp(this.t * 6 - i * .45, 0, 1); X.save(); X.globalAlpha *= ap; X.translate((1 - ease.outQ(ap)) * -36, 0);
      const yy = y + (o.title ? 64 : 24) + i * ih + ih / 2, sel = i === this.i;
      const label = it.label + (it.value ? '  ' + it.value() : '');
      const col = it.disabled ? '#a8977a' : sel ? C.red : C.ink;
      X.save(); if (sel) { X.translate(x + w / 2, yy); X.scale(1.06, 1.06); X.translate(-(x + w / 2), -yy); }
      text(label, x + w / 2, yy, { size: o.size || 20, col, font: FONT_D, maxW: w - 120 });
      X.restore();
      if (sel) { pointerGlove(x + 30, yy, this.t); if (it.adjust) { text('◀', x + 56, yy, { size: 14, col: C.red }); text('▶', x + w - 40, yy, { size: 14, col: C.red }); } }
      X.restore();
      Mouse.zone(x + 10, yy - ih / 2, w - 20, ih, () => { if (!it.disabled) this.i = i; }, () => { if (it.disabled) return; this.i = i; Sfx.select(); if (it.act) it.act(); else if (it.adjust) it.adjust(1); });
    });
    if (o.footer) text(o.footer, x + w / 2, y + h - 12, { size: 11, font: FONT_B, col: C.ink2 });
  }
}

// ---------------- shared backdrop ----------------
function drawStageBackdrop(t, dim = 0) {
  const bg = paintCached('arena_theatre', W, H, ARENAS.theatre.paint); blit(bg, 0, 0, W, H);
  ARENAS.theatre.live({}, t);
  ARENAS.theatre.fg({}, t);
  if (dim) { X.save(); X.globalAlpha = dim; X.fillStyle = '#120a08'; X.fillRect(0, 0, W, H); X.restore(); }
}
function drawLogo(x, y, s, t) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const flick = Math.sin(t * 13) > -.85 || Math.floor(t * 3) % 7 !== 0;
  drawBulbIcon(-270, -18, 30, flick);
  X.save(); X.globalAlpha = .9; text('LIGHTS OUT!', 6, 6, { size: 96, col: '#8e2219' }); X.restore();
  wavyText('LIGHTS OUT!', 0, 0, { size: 96, col: C.cream, stroke: 13, amp: 3, rot: .02 }, t);
  X.save(); X.translate(0, 74); X.rotate(-.02);
  poly([-200, -22, 200, -22, 220, 0, 200, 22, -200, 22, -220, 0], C.red, 4);
  text('The Bolt & Dot Show', 0, 2, { size: 30, font: FONT_M, col: C.cream, stroke: 4 });
  X.restore(); X.restore();
}
function dummyStage() { return { ctl: false, state: 'menu', cfg: {}, loadout: makeLoadout(), mode: 'normal', solids: [], bounds: { l: 0, r: W }, players: [], stats: {}, t: 0, alive() { return []; } }; }
function makeActor(i, x, y) { const p = new Player(dummyStage(), i, x, y); p.ground = true; return p; }

// ---------------- title ----------------
class TitleScene {
  constructor() { this.t = 0; this.a = [makeActor(0, 300, FLOOR), makeActor(1, 660, FLOOR)]; this.a[1].face = -1; }
  enter() { Music.play('title'); }
  update(dt) {
    this.t += dt;
    for (const p of this.a) { p.anim += dt; p.victory = Math.floor(this.t * 1.2 + p.i) % 3 === 0; p.vx = p.victory ? 0 : 0; }
    const M = Input.menu();
    if ((M.any || M.ok) && this.t > .4) { Sfx.select(); go(() => new MainMenu()); }
  }
  draw() {
    drawStageBackdrop(this.t);
    for (const p of this.a) { X.save(); X.translate(p.x, FLOOR); X.scale(1.7, 1.7); X.translate(-p.x, -FLOOR); p.draw(); X.restore(); }
    drawLogo(W / 2, 160, 1, this.t);
    if (Math.floor(this.t * 2) % 2 === 0) text(Input.touch.on ? 'TAP TO START' : 'PRESS ANY KEY', W / 2, 318, { size: 26, col: C.cream, stroke: 6 });
    text('An original cartoon in the spirit of the 1930s', W / 2, 352, { size: 13, font: FONT_B, col: '#e8d8b0', stroke: 3 });
    Mouse.zone(0, 0, W, H, null, () => { if (this.t > .4) { Sfx.select(); go(() => new MainMenu()); } });
  }
}

// ---------------- main menu ----------------
class MainMenu {
  constructor() {
    this.t = 0;
    this.menu = new MenuList([
      { label: 'PLAY', act: () => this.openPlay() },
      { label: 'BOSS RUSH', act: () => go(() => new RushScene()) },
      { label: 'PRACTICE', act: () => go(() => new PracticeScene()) },
      { label: 'ACHIEVEMENTS', act: () => go(() => new AchievementsScene(() => new MainMenu())) },
      { label: 'SETTINGS', act: () => go(() => new SettingsScene(() => new MainMenu())) },
      { label: 'CONTROLS', act: () => go(() => new ControlsScene(() => new MainMenu())) },
      { label: 'CREDITS', act: () => go(() => new CreditsScene(() => new MainMenu())) }
    ], { x: W / 2, y: 252, w: 320, ih: 33, onBack: () => go(() => new TitleScene()) });
  }
  enter() { Music.play('title'); }
  openPlay() {
    const has = Save.exists();
    const items = [
      { label: 'CONTINUE', disabled: !has, act: () => { Input.coop = Save.d.players === 2; go(() => new MapScene()); } },
      { label: 'NEW GAME', act: () => { if (has) this.menu.sub = new MenuList([{ label: 'YES, START OVER', act: () => this.newGame() }, { label: 'NO', act: () => { this.menu.sub = playMenu; } }], { title: 'ERASE YOUR SAVE?', x: W / 2, y: 250, w: 420, onBack: () => { this.menu.sub = playMenu; } }); else this.newGame(); } },
      { label: 'PLAYERS:', value: () => Save.d.players === 2 ? 'TWO' : 'ONE', adjust: () => { Save.d.players = Save.d.players === 2 ? 1 : 2; Save.write(); } },
      { label: 'BACK', act: () => { this.menu.sub = null; } }
    ];
    const playMenu = new MenuList(items, { title: 'PLAY', x: W / 2, y: 250, w: 360, ih: 38, onBack: () => { this.menu.sub = null; }, footer: has ? progressLine() : 'No saved show yet. Start a new game!' });
    this.menu.sub = playMenu;
  }
  newGame() { const pl = Save.d.players; Save.reset(); Save.d.players = pl; Save.write(); Input.coop = pl === 2; go(() => new StoryScene()); }
  update(dt) { this.t += dt; this.menu.update(dt); }
  draw() { drawStageBackdrop(this.t, .25); drawLogo(W / 2, 120, .78, this.t); this.menu.draw(); text('v1.0 · Saves automatically', W - 12, H - 12, { size: 11, font: FONT_B, col: '#c8b898', align: 'right' }); }
}
function progressLine() { const s = Save.d, beat = BOSSES.filter(b => s.bosses[b.id] && s.bosses[b.id].beat).length; return 'Bosses beaten ' + beat + '/8 · Coins ' + s.coins + ' · World ' + s.worlds; }

// ---------------- story ----------------
const STORY = [
  { s: 'In cheerful Lanternville, every lamp glowed thanks to the Great Lantern and its eight magic Sparks.', art: 'town' },
  { s: 'But one dark night, the sinister Baron Von Gloom stole the Sparks and handed them out to his rowdy pals!', art: 'gloom' },
  { s: 'Now two plucky light bulbs, BOLT and DOT, must win back every Spark... before it\'s LIGHTS OUT for good!', art: 'heroes' }
];
const ENDING = [
  { s: 'With a squeak and a puff, Baron Von Gloom shrank into a tiny imp and scampered off into the night.', art: 'gloom' },
  { s: 'The eight Sparks flew home to the Great Lantern, and Lanternville shone brighter than ever before!', art: 'town' },
  { s: 'Bolt and Dot took a bow. THE END... or is it? Try every boss on Expert for an S rank!', art: 'heroes' }
];
function drawStoryArt(kind, t, lit = true) {
  X.save(); X.beginPath(); rrectPath(150, 70, 660, 280, 10); X.clip();
  if (kind === 'town' || kind === 'heroes') {
    skyGrad(X, W, 360, lit ? '#2a3a6a' : '#140c1a', lit ? '#e8a070' : '#2a1a2a');
    for (let i = 0; i < 30; i++) circ(150 + (i * 97) % 660, 80 + (i * 53) % 150, 1.5, '#fff6dc', 0);
    for (let i = 0; i < 9; i++) { const x = 170 + i * 72, h = 70 + (i * 37) % 60; rrect(x, 350 - h, 60, h, 4, '#3a2a3a', 3); poly([x - 4, 350 - h, x + 30, 350 - h - 30, x + 64, 350 - h], '#4a2a2a', 3); for (let k = 0; k < 2; k++) rrect(x + 10 + k * 26, 350 - h + 18, 14, 16, 2, lit ? '#ffd870' : '#2a2030', 2); }
    if (kind === 'town') { line(480, 350, 480, 170, 8, '#5a3a22'); drawBulbIcon(480, 140, 34, lit); for (let i = 0; i < 8; i++) { const a = t * .8 + i * TAU / 8; star(480 + Math.cos(a) * 80, 140 + Math.sin(a) * 40, 9, 4, .45, lit ? SPARK_COLS[i % 7] : '#3a3040', 2, t * 3); } }
    else { const a = makeActor(0, 400, 340), b = makeActor(1, 560, 340); a.anim = b.anim = t; a.victory = b.victory = true; b.face = -1; a.draw(); b.draw(); }
  } else {
    skyGrad(X, W, 360, '#1e0a16', '#5a1418'); circ(480, 200, 110, '#a03030', 0);
    X.save(); X.translate(480, 340); X.scale(1.1, 1.1); X.globalAlpha = .95;
    X.beginPath(); X.moveTo(-60, 0); X.quadraticCurveTo(-90, -160, 0, -230); X.quadraticCurveTo(90, -160, 60, 0); X.closePath(); fillStroke('#12060c', 0);
    pieEye(-16, -170, 9, 12, Math.sin(t) * .5, 0, { whiteCol: '#ffd35a' }); pieEye(16, -170, 9, 12, Math.sin(t) * .5, 0, { whiteCol: '#ffd35a' });
    X.restore();
    for (let i = 0; i < 7; i++) { const a = t + i; star(300 + i * 60, 120 + Math.sin(a * 2) * 20, 10, 4, .45, SPARK_COLS[i], 2, a); }
  }
  X.restore(); rrect(150, 70, 660, 280, 10, null, 5);
}
class StoryScene {
  constructor(pages = STORY, done = () => new MapScene(), song = 'title') { this.p = pages; this.i = 0; this.t = 0; this.done = done; this.song = song; }
  enter() { Music.play(this.song); }
  next() { Sfx.select(); this.i++; this.t = 0; if (this.i >= this.p.length) go(this.done); }
  update(dt) { this.t += dt; const M = Input.menu(); if ((M.ok || M.any) && this.t > .35 && this.i < this.p.length) this.next(); if (M.back) go(this.done); }
  draw() {
    X.fillStyle = '#efe0bb'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .5);
    const pg = this.p[Math.min(this.i, this.p.length - 1)];
    drawStoryArt(pg.art, this.t, this.p !== STORY || this.i !== 1);
    const shown = pg.s.slice(0, Math.floor(this.t * 60));
    wrapText(shown, W / 2, 392, 640, 26, { size: 19, col: C.ink });
    text((this.i + 1) + ' / ' + this.p.length + '   ·   press JUMP to continue   ·   ESC to skip', W / 2, H - 26, { size: 12, font: FONT_B, col: C.ink2 });
    Mouse.zone(0, 0, W, H, null, () => { if (this.t > .35) this.next(); });
  }
}

// ---------------- boss portraits ----------------
const Portraits = new Map();
const PORTRAIT_BOX = { bee: [630, 60, 220, 220], magic: [680, 190, 240, 290], slot: [650, 100, 280, 370], pirate: [690, 230, 220, 240], deep: [600, 60, 380, 380], doc: [700, 170, 200, 240], wyrm: [640, 120, 300, 260], gloom: [690, 130, 230, 340] };
function bossPortrait(def) {
  if (Portraits.has(def.id)) return Portraits.get(def.id);
  const full = document.createElement('canvas'); full.width = W; full.height = H; const g = full.getContext('2d'); g.lineJoin = g.lineCap = 'round';
  const fake = { target: () => ({ x: 300, y: 300, cx: 300, cy: 300 }), alive: () => [], lights: [], players: [], solids: [], hostile: [], bullet: () => ({}), hazards: [], bounds: { l: 0, r: W }, t: 1 };
  const b = Object.create(Boss.prototype);
  Object.assign(b, { st: fake, def, D: DIFF.normal, x: def.x ?? 760, y: def.y ?? FLOOR, t: 1.3, pose: '', poseT: 0, hurt: [], hit: [], scripts: [], phase: 0, flash: 0, trans: 0 });
  try {
    def.init(b); if (def.update) def.update(b, .016);
    const bg = paintCached('arena_' + def.arena, W, H, ARENAS[def.arena].paint);
    useCtx(g, () => { g.drawImage(bg, 0, 0, W, H); def.draw(b); });
  } catch (e) { console.warn('portrait', def.id, e); }
  let [bx, by, bw, bh] = PORTRAIT_BOX[def.id];
  if (bw / bh > 4 / 3) { const nh = bw * 3 / 4; by += (bh - nh) / 2; bh = nh; } else { const nw = bh * 4 / 3; bx += (bw - nw) / 2; bw = nw; }
  const out = document.createElement('canvas'); out.width = 240; out.height = 180; const o = out.getContext('2d');
  o.drawImage(full, bx, by, bw, bh, 0, 0, 240, 180);
  Portraits.set(def.id, out); return out;
}
function drawPortraitCard(def, x, y, w, h, o = {}) {
  X.save(); X.beginPath(); rrectPath(x, y, w, h, 10); X.clip();
  X.drawImage(bossPortrait(def), x, y, w, h);
  if (o.locked) { X.fillStyle = 'rgba(20,12,8,.82)'; X.fillRect(x, y, w, h); text('?', x + w / 2, y + h / 2, { size: h * .5, col: '#6a5a4a' }); }
  X.restore(); rrect(x, y, w, h, 10, null, o.sel ? 5 : 3, o.sel ? C.red : C.ink);
}
function drawStars(x, y, n, size = 10, max = 0) { const tot = Math.max(n, max); for (let i = 0; i < tot; i++) star(x - (tot - 1) * size * 1.1 + i * size * 2.2, y, size, 5, .45, i < n ? C.gold : '#5a4a3a', 2); }

// ---------------- world map ----------------
const Notices = [];
class MapScene {
  constructor(world) { this.t = 0; this.w = clamp(world ?? Save.d.lastWorld ?? 0, 0, Save.d.worlds - 1); this.sel = 1; this.menu = null; this.notice = null; this.coinPop = 0; }
  enter() { Music.play('map'); Input.coop = Save.d.players === 2; }
  nodes() {
    const w = WORLDS[this.w], list = [{ k: 'level', id: w.level }];
    for (const b of w.bosses) list.push({ k: 'boss', id: b }); list.push({ k: 'shop' }, { k: 'equip' });
    const n = list.length; list.forEach((nd, i) => { nd.x = 130 + i * (700 / (n - 1)); nd.y = 300 + (i % 2 ? -60 : 0); });
    return list;
  }
  update(dt) {
    this.t += dt; if (this.coinPop > 0) this.coinPop -= dt;
    if (!this.notice && Notices.length) { this.notice = Notices.shift(); this.noticeT = 0; Music.jingle('unlock'); }
    const M = Input.menu();
    if (this.notice) { this.noticeT += dt; if ((M.ok || M.back) && this.noticeT > .5) { this.notice = null; Sfx.select(); } return; }
    if (this.menu) { this.menu.update(dt); return; }
    const nodes = this.nodes();
    if (M.left) { this.sel = (this.sel - 1 + nodes.length) % nodes.length; Sfx.menu(); }
    if (M.right) { this.sel = (this.sel + 1) % nodes.length; Sfx.menu(); }
    if (M.up && this.w > 0) { this.w--; this.sel = Math.min(this.sel, this.nodes().length - 1); Sfx.menu(); Save.d.lastWorld = this.w; }
    if (M.down && this.w < Save.d.worlds - 1) { this.w++; this.sel = Math.min(this.sel, this.nodes().length - 1); Sfx.menu(); Save.d.lastWorld = this.w; }
    if (M.ok) this.activate(nodes[this.sel]);
    if (M.back) { Sfx.back(); Save.write(); go(() => new MainMenu()); }
  }
  activate(nd) {
    Sfx.select();
    if (nd.k === 'level') startLevel(nd.id);
    else if (nd.k === 'shop') go(() => new ShopScene(this.w));
    else if (nd.k === 'equip') go(() => new EquipScene(() => new MapScene(this.w)));
    else if (nd.k === 'boss') {
      const rec = Save.d.bosses[nd.id] || { grades: {} }, def = BOSSES.find(b => b.id === nd.id);
      const g = d => rec.grades && rec.grades[d] ? '  [' + rec.grades[d] + ']' : '';
      this.menu = new MenuList([
        { label: 'EASY' + g('easy'), act: () => { this.menu = null; startBoss(nd.id, 'easy'); } },
        { label: 'NORMAL' + g('normal'), act: () => { this.menu = null; startBoss(nd.id, 'normal'); } },
        { label: 'EXPERT' + g('expert'), act: () => { this.menu = null; startBoss(nd.id, 'expert'); } },
        { label: 'BACK', act: () => { this.menu = null; } }
      ], { title: def.name.toUpperCase(), titleSize: 22, x: W / 2, y: 150, w: 440, onBack: () => { this.menu = null; }, footer: 'Easy is a gentler show. Expert unlocks the S grade.' });
      this.menu.i = 1;
    }
  }
  draw() {
    const w = WORLDS[this.w], T = THEMES[w.theme];
    X.fillStyle = '#2a1a12'; X.fillRect(0, 0, W, H);
    const px = 40, py = 84, pw = 880, ph = 310;
    X.save(); X.beginPath(); rrectPath(px, py, pw, ph, 14); X.clip();
    const far = paintCached('far_' + w.theme, W, H, T.far), mid = paintCached('mid_' + w.theme, W, H, T.mid);
    X.drawImage(far, px, py - 60, pw, ph * 1.6); X.drawImage(mid, px - 40, py - 40, pw + 80, ph * 1.4);
    X.restore(); rrect(px, py, pw, ph, 14, null, 5);
    const nodes = this.nodes();
    X.save(); X.setLineDash([6, 10]); X.beginPath(); nodes.forEach((n, i) => i ? X.lineTo(n.x, n.y) : X.moveTo(n.x, n.y)); X.lineWidth = 5; X.strokeStyle = C.cream; X.stroke(); X.restore();
    nodes.forEach((n, i) => this.drawNode(n, i === this.sel, i));
    // header
    decoCard(250, 14, 460, 58, {});
    text('WORLD ' + w.n + ' · ' + w.name.toUpperCase(), W / 2, 37, { size: 21, col: C.red, maxW: 420 });
    text(w.sub, W / 2, 59, { size: 12, font: FONT_B, col: C.ink2 });
    for (let i = 0; i < 5; i++) { const x = 60 + i * 34, y = 43, un = i < Save.d.worlds; circ(x, y, 13, i === this.w ? C.red : un ? C.cream : '#5a4a3a', 3); text(un ? String(i + 1) : '×', x, y + 1, { size: 13, col: i === this.w ? C.cream : C.ink }); if (un) Mouse.zone(x - 14, y - 14, 28, 28, null, () => { this.w = i; this.sel = Math.min(this.sel, this.nodes().length - 1); Save.d.lastWorld = i; Sfx.menu(); }); }
    text('▲▼ WORLD   ◀▶ STOP', 120, 70, { size: 10, font: FONT_M, col: '#c8b898' });
    // coins
    rrect(770, 22, 150, 42, 10, C.cream, 3); circ(796, 43, 13, C.gold, 2.5); text('$', 796, 44, { size: 14, col: '#a07010' });
    text('× ' + Save.d.coins, 860, 44, { size: 22, col: C.ink });
    // info card
    const nd = nodes[this.sel]; decoCard(140, 408, 680, 116, {});
    this.drawInfo(nd, 140, 408);
    if (this.menu) { X.save(); X.fillStyle = 'rgba(15,8,4,.55)'; X.fillRect(0, 0, W, H); X.restore(); this.menu.draw(); }
    if (this.notice) drawNotice(this.notice, this.noticeT);
    text('ESC: MAIN MENU', 60, H - 10, { size: 10, font: FONT_M, col: '#c8b898', align: 'left' });
  }
  drawNode(n, sel, i) {
    const bob = sel ? Math.sin(this.t * 6) * 4 : 0, x = n.x, y = n.y + bob;
    Mouse.zone(x - 50, y - 60, 100, 110, () => { this.sel = i; }, () => { if (this.sel === i) this.activate(n); else { this.sel = i; Sfx.menu(); } });
    if (sel) { const gr = X.createRadialGradient(x, y, 10, x, y, 80); gr.addColorStop(0, 'rgba(255,240,180,.55)'); gr.addColorStop(1, 'rgba(255,240,180,0)'); X.fillStyle = gr; X.fillRect(x - 80, y - 80, 160, 160); }
    if (n.k === 'boss') {
      const def = BOSSES.find(b => b.id === n.id), rec = Save.d.bosses[n.id];
      X.save(); X.beginPath(); X.arc(x, y - 6, 44, 0, TAU); X.clip(); X.drawImage(bossPortrait(def), x - 60, y - 51, 120, 90); X.restore();
      circ(x, y - 6, 44, null, sel ? 6 : 4, sel ? C.red : C.ink);
      text('★'.repeat(def.stars), x, y + 50, { size: 11, col: C.gold, stroke: 3 });
      if (rec && rec.beat) { const best = bestGrade(rec); rrect(x + 18, y - 52, 44, 26, 6, C.red, 2.5); text(best || '✓', x + 40, y - 38, { size: 15, col: C.cream }); }
    } else if (n.k === 'level') {
      line(x, y + 40, x, y - 30, 6, '#6a4428'); poly([x, y - 40, x + 50, y - 28, x, y - 14], C.red, 3); rrect(x - 40, y - 8, 80, 34, 6, C.cream, 3); text("RUN 'N' GUN", x, y + 9, { size: 11, font: FONT_M, col: C.ink });
      const rec = Save.d.levels[n.id]; if (rec) { const c = rec.coins.filter(Boolean).length; text(c + '/5 $', x, y + 54, { size: 12, col: C.gold, stroke: 3 }); if (rec.done) { rrect(x + 22, y - 54, 40, 24, 6, C.red, 2.5); text(rec.grade || '✓', x + 42, y - 41, { size: 13, col: C.cream }); } }
      if (Save.d.reels[n.id]) drawReelIcon(x - 40, y - 40, 10);
    } else if (n.k === 'shop') {
      poly([x - 46, y - 10, x, y - 50, x + 46, y - 10], '#c8382c', 3); for (let k = -2; k <= 2; k++) line(x + k * 14, y - 12, x, y - 48, 2, C.cream); rrect(x - 38, y - 10, 76, 46, 4, '#e8d0a0', 3); text('SHOP', x, y + 12, { size: 16, col: C.red });
    } else if (n.k === 'equip') {
      rrect(x - 34, y - 46, 68, 86, 6, '#8a5a34', 3); line(x, y - 46, x, y + 40, 2.5); circ(x - 8, y, 3, C.gold, 1.5); circ(x + 8, y, 3, C.gold, 1.5); rrect(x - 40, y + 6, 80, 28, 6, C.cream, 3); text('EQUIP', x, y + 21, { size: 14, col: C.ink });
    }
    if (sel) pointerGlove(x - 24, y - 74 + bob, this.t);
  }
  drawInfo(nd, x, y) {
    let title = '', lines = [], prompt = 'Press JUMP or ENTER';
    if (nd.k === 'boss') { const d = BOSSES.find(b => b.id === nd.id), rec = Save.d.bosses[nd.id]; title = d.name + ' — ' + d.title; lines.push('"' + d.intro + '"'); lines.push('Danger ' + '★'.repeat(d.stars) + '   ·   ' + (rec && rec.beat ? 'Best ' + (bestGrade(rec) || '-') + (rec.best ? ' in ' + fmtTime(rec.best) : '') : 'Not beaten yet') + '   ·   Challenges: ' + ['nohit', 'parry', 'speed'].map((m, i) => ['No-hit', '5 Parries', 'Under par'][i] + (rec && rec.medals && rec.medals[m] ? ' ✔' : ' ✘')).join('  ')); prompt = 'Press JUMP to fight'; }
    else if (nd.k === 'level') { const l = LEVELS.find(l => l.id === nd.id), rec = Save.d.levels[nd.id]; title = l.name + ' (Run \'n\' Gun)'; lines.push('Run, gun and grab 5 hidden coins. A secret film reel hides somewhere!'); lines.push(rec ? 'Coins ' + rec.coins.filter(Boolean).length + '/5  ·  Reel ' + (Save.d.reels[l.id] ? 'found' : 'missing') + (rec.grade ? '  ·  Best ' + rec.grade : '') : 'Not played yet'); }
    else if (nd.k === 'shop') { title = "Shelby's Sundries"; lines.push('Spend coins on new weapons, trinkets and upgrades.'); }
    else { title = 'Equip'; lines.push('Pick two shots, a super and one trinket.'); const L = Save.d.load; lines.push('Now: ' + WEAPONS[L.a].name + (L.b ? ' + ' + WEAPONS[L.b].name : '') + (L.sup ? ' · ' + SUPERS[L.sup].name : '') + (L.trinket ? ' · ' + TRINKETS[L.trinket].name : '')); }
    text(title, x + 340, y + 28, { size: 20, col: C.red, maxW: 620 });
    lines.forEach((l, i) => text(l, x + 340, y + 54 + i * 21, { size: 13, font: FONT_B, col: C.ink, maxW: 630 }));
    text(prompt, x + 340, y + 97, { size: 11, font: FONT_M, col: C.ink2 });
  }
}
function bestGrade(rec) { let b = null; for (const d in rec.grades) if (!b || GRADE_ORDER.indexOf(rec.grades[d]) > GRADE_ORDER.indexOf(b)) b = rec.grades[d]; return b; }
function drawReelIcon(x, y, r) { circ(x, y, r, C.gold, 2.5); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; circ(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5, r * .2, '#8a6010', 1); } }
function drawNotice(n, t) {
  X.save(); X.fillStyle = 'rgba(15,8,4,.6)'; X.fillRect(0, 0, W, H);
  const s = t < .3 ? ease.outBack(t / .3) : 1; X.translate(W / 2, H / 2); X.scale(s, s);
  decoCard(-260, -110, 520, 220, {});
  text(n.title, 0, -60, { size: 28, col: C.red, maxW: 420 });
  wrapText(n.body, 0, -18, 440, 24, { size: 16, col: C.ink });
  if (n.icon === 'bulb') drawBulbIcon(-215, -60, 16, true);
  text('Press JUMP', 0, 86, { size: 12, font: FONT_M, col: C.ink2 });
  X.restore();
}

// ---------------- shop ----------------
class ShopScene {
  constructor(world) { this.world = world; this.t = 0; this.tab = 0; this.sel = 0; this.say = pick(['Welcome, welcome! Mind the shell.', 'Browse all ya like, kiddo!', 'Finest goods this side of Lanternville!']); this.sayT = 0; this.talk = .8; }
  enter() { Music.play('shop'); Voice.babble(5, 160, { syl: .1 }); }
  tabs() {
    const S = Save.d;
    const weapons = Object.keys(WEAPONS).filter(k => k !== 'spark').map(k => ({ kind: 'weapon', id: k, name: WEAPONS[k].name, desc: WEAPONS[k].desc + ' ' + WEAPONS[k].ex, price: WEAPONS[k].price, owned: S.owned.weapons.includes(k), locked: ({ spread: 1, chaser: 1, charge: 2, bomb: 3 })[k] > S.worlds }));
    const trinkets = Object.keys(TRINKETS).filter(k => !TRINKETS[k].secret).map(k => ({ kind: 'trinket', id: k, name: TRINKETS[k].name, desc: TRINKETS[k].desc, price: TRINKETS[k].price, owned: S.owned.trinkets.includes(k), locked: TRINKETS[k].world > S.worlds }));
    const ups = Object.keys(UPGRADES).map(k => { const u = UPGRADES[k], lv = S.owned.up[k]; return { kind: 'up', id: k, name: u.name + (u.prices.length > 1 ? ' ' + ['I', 'II', 'III'][Math.min(lv, u.prices.length - 1)] : ''), desc: u.desc, price: u.prices[lv], owned: lv >= u.prices.length, locked: false, lv, max: u.prices.length }; });
    if (!S.owned.wlv) S.owned.wlv = {};
    const tunes = S.owned.weapons.map(w => { const lv = wpnLevel(w); return { kind: 'tune', id: w, name: WEAPONS[w].name + ' Tune-up ' + ['I', 'II', 'MAX'][lv], desc: '+15% damage for the ' + WEAPONS[w].name + ' per level (now level ' + lv + ' of 2). Works on its EX too.', price: TUNE_PRICES[lv], owned: lv >= 2, locked: false, lv, max: 2 }; });
    return [weapons, trinkets, ups, tunes];
  }
  update(dt) {
    this.t += dt; this.sayT += dt; if (this.talk > 0) this.talk -= dt;
    const M = Input.menu(), T = this.tabs(), row = T[this.tab];
    if (M.up) { this.tab = (this.tab + 3) % 4; this.sel = Math.min(this.sel, T[this.tab].length - 1); Sfx.menu(); }
    if (M.down) { this.tab = (this.tab + 1) % 4; this.sel = Math.min(this.sel, T[this.tab].length - 1); Sfx.menu(); }
    if (M.left) { this.sel = (this.sel - 1 + row.length) % row.length; Sfx.menu(); }
    if (M.right) { this.sel = (this.sel + 1) % row.length; Sfx.menu(); }
    if (M.ok) this.buy(row[this.sel]);
    if (M.back) { Sfx.back(); go(() => new MapScene(this.world)); }
  }
  speak(s) { this.say = s; this.sayT = 0; this.talk = .8; Voice.babble(4, 160, { syl: .1 }); }
  buy(it) {
    const S = Save.d;
    if (it.owned) { Sfx.deny(); this.speak('Ya already own that one, sport!'); return; }
    if (it.locked) { Sfx.deny(); this.speak('Not in stock yet. Come back after the next world!'); return; }
    if (S.coins < it.price) { Sfx.deny(); this.speak('Ya need more coins than that, kiddo!'); return; }
    S.coins -= it.price;
    if (it.kind === 'weapon') { S.owned.weapons.push(it.id); if (!S.load.b) S.load.b = it.id; }
    else if (it.kind === 'trinket') { S.owned.trinkets.push(it.id); if (!S.load.trinket) S.load.trinket = it.id; }
    else if (it.kind === 'tune') { S.owned.wlv[it.id] = it.lv + 1; if (it.lv + 1 >= 2) Achieve.unlock('tune'); }
    else S.owned.up[it.id]++;
    Achieve.unlock('shop');
    Save.write(); Sfx.buy(); FX.confetti(W / 2, 220, 30); this.speak(pick(['Pleasure doin\' business!', 'A fine choice!', 'Use it in good health!']));
  }
  draw() {
    X.fillStyle = '#6a4428'; X.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 48) line(x, 0, x, H, 2, 'rgba(40,20,5,.35)');
    Paper.apply(X, W, H, .35);
    for (let r = 0; r < 4; r++) { rrect(40, 142 + r * 82, 660, 10, 3, '#4a2e18', 3); }
    // Shelby the tortoise, behind the counter
    const talk = this.talk > 0 ? Math.abs(Math.sin(this.t * 18)) : 0;
    X.save(); X.translate(830, 300 + Math.sin(this.t * 2) * 2);
    X.beginPath(); X.ellipse(40, 100, 100, 95, 0, Math.PI, 0); X.closePath(); fillStroke('#56732f', 4);
    for (const [hx, hy, r] of [[40, 40, 22], [-2, 64, 18], [82, 64, 18], [-40, 92, 14], [120, 92, 14], [40, 84, 16]]) poly([hx - r, hy, hx - r / 2, hy - r * .85, hx + r / 2, hy - r * .85, hx + r, hy, hx + r / 2, hy + r * .85, hx - r / 2, hy + r * .85], '#7a9a4a', 2.5);
    hose(-10, 80, -48, -6, 14, 30, C.ink); hose(-10, 80, -48, -6, 14, 24, '#8aa860');
    ell(-58, -34, 40, 33, 0, '#9ab870', 3.5);
    ell(-58, -66, 44, 8, 0, '#3a2a20', 3); X.beginPath(); X.ellipse(-58, -68, 28, 24, 0, Math.PI, 0); X.closePath(); fillStroke('#3a2a20', 3); rrect(-86, -74, 56, 6, 2, '#8e2219', 0);
    circ(-74, -36, 11, 'rgba(255,255,255,.5)', 2.5); circ(-46, -36, 11, 'rgba(255,255,255,.5)', 2.5); line(-63, -37, -57, -37, 2.5);
    pieEye(-74, -36, 5, 7, -.7, 0, { white: false }); pieEye(-46, -36, 5, 7, -.7, 0, { white: false });
    ell(-60, -12, 14, 3 + talk * 8, 0, '#5a1a12', 2.5); ell(-86, -20, 5, 3, 0, '#e8a090', 0);
    hose(-30, 60, -70, 96, 10, 7); glove(-74, 96, 10, 2.6, 'open'); hose(100, 60, 70, 96, -10, 7); glove(66, 96, 10, .5, 'open');
    X.restore();
    rrect(690, 396, 290, 160, 6, '#8a5a34', 4); line(690, 410, 980, 410, 3); text("SHELBY'S", 835, 448, { size: 24, col: C.gold, stroke: 5 }); text('SUNDRIES', 835, 478, { size: 16, font: FONT_M, col: C.cream, stroke: 3 });
    // bubble
    X.save(); const bw = 300; rrect(560, 40, bw, 70, 16, C.white, 3); poly([760, 108, 790, 140, 790, 108], C.white, 0); line(760, 108, 790, 140, 3); line(790, 140, 790, 109, 3);
    wrapText(this.say.slice(0, Math.floor(this.sayT * 50)), 560 + bw / 2, 66, bw - 30, 20, { size: 14, col: C.ink }); X.restore();
    // coins
    rrect(30, 20, 150, 42, 10, C.cream, 3); circ(56, 41, 13, C.gold, 2.5); text('$', 56, 42, { size: 14, col: '#a07010' }); text('× ' + Save.d.coins, 120, 42, { size: 22, col: C.ink });
    const T = this.tabs(); const names = ['WEAPONS', 'TRINKETS', 'UPGRADES', 'TUNE-UPS'];
    T.forEach((row, r) => {
      const y = 142 + r * 82;
      text((r === this.tab ? '▸ ' : '') + names[r], 50, y - 72, { size: 14, col: r === this.tab ? C.gold : C.cream, align: 'left', stroke: 4, font: FONT_M });
      row.forEach((it, i) => {
        const x = 60 + i * 128, sel = r === this.tab && i === this.sel, by = y - 60 + (sel ? Math.sin(this.t * 6) * 3 : 0);
        Mouse.zone(x, by, 110, 58, () => { this.tab = r; this.sel = i; }, () => { if (this.tab === r && this.sel === i) this.buy(it); else { this.tab = r; this.sel = i; Sfx.menu(); } });
        rrect(x, by, 110, 58, 8, it.owned ? '#cfe3b0' : it.locked ? '#8a7a6a' : C.cream, sel ? 4 : 2.5, sel ? C.red : C.ink);
        drawShopIcon(it, x + 26, by + 29, this.t);
        text(it.locked ? 'LOCKED' : it.owned ? 'OWNED' : '$' + it.price, x + 76, by + 30, { size: 14, maxW: 58, col: it.owned ? C.greenD : it.locked ? '#3a2a20' : C.red });
      });
    });
    const it = T[this.tab][this.sel];
    decoCard(40, 420, 640, 104, {});
    text(it.name, 360, 446, { size: 20, col: C.red, maxW: 580 });
    wrapText(it.desc, 360, 472, 590, 20, { size: 13, col: C.ink });
    text('◀▶ CHOOSE   ▲▼ SHELF   JUMP BUY   ESC LEAVE', 360, 510, { size: 10, font: FONT_M, col: C.ink2 });
    FX.update(1 / 60); FX.draw(0);
  }
}
function drawShopIcon(it, x, y, t) {
  X.save(); X.translate(x, y);
  if (it.kind === 'tune') { X.save(); X.scale(.65, .65); drawPshot({ x: 0, y: -4, vx: 1, vy: 0, t, k: { spark: 'spark', spread: 'note', chaser: 'starEX', charge: 'chargeL', bomb: 'bomb' }[it.id], r: 8 }); X.restore(); for (let i = 0; i < 2; i++) circ(-5 + i * 10, 18, 3, i < it.lv ? C.gold : '#5a4a3a', 1.5); }
  else if (it.kind === 'weapon') { const fake = { x: 0, y: 0, vx: 1, vy: 0, t, k: { spread: 'note', chaser: 'starEX', charge: 'chargeL', bomb: 'bomb' }[it.id], r: 8 }; X.scale(.8, .8); drawPshot(fake); }
  else if (it.kind === 'trinket') {
    if (it.id === 'heart' || it.id === 'twin') { heartShape(it.id === 'twin' ? -6 : 0, 0, 10, C.red, 2.5); if (it.id === 'twin') heartShape(8, 2, 9, C.red, 2.5); }
    else if (it.id === 'coffee') { rrect(-12, -12, 24, 26, 3, '#8a5a34', 2.5); rrect(-12, -6, 24, 8, 2, C.cream, 2); for (let i = 0; i < 2; i++) hose(-4 + i * 8, -14, -2 + i * 8, -24 + Math.sin(t * 4 + i) * 2, 3, 2, '#c8b8a0'); }
    else if (it.id === 'smoke') { circ(0, 4, 12, '#3a3a3a', 2.5); cloudPuff(6, -12, 8, '#e8e4dc', 1.5); }
    else if (it.id === 'glove') glove(0, 0, 12, -.5, 'open', C.pink);
  } else {
    if (it.id === 'hp') heartShape(0, 0, 12, '#9aa0ae', 3);
    else if (it.id === 'dmg') { X.beginPath(); X.moveTo(-10, 6); for (let i = 0; i <= 5; i++) X.lineTo(-10 + i * 4, 6 + (i % 2 ? -8 : 0)); X.lineWidth = 3; X.strokeStyle = C.orange; X.stroke(); drawBulbIcon(0, 0, 0.1, false); }
    else { rrect(-14, -9, 28, 18, 3, '#c8382c', 2.5); rrect(14, -4, 4, 8, 1, C.ink, 0); text('+', 0, 1, { size: 16, col: C.cream }); }
    if (it.max > 1) for (let i = 0; i < it.max; i++) circ(-10 + i * 10, 18, 3, i < it.lv ? C.gold : '#5a4a3a', 1.5);
  }
  X.restore();
}

// ---------------- equip ----------------
class EquipScene {
  constructor(back) { this.back = back; this.t = 0; this.row = 0; this.actor = makeActor(0, 700, 400); }
  enter() { Music.play('map'); }
  options(r) {
    const S = Save.d, L = S.load;
    if (r === 0) return S.owned.weapons.filter(w => w !== L.b);
    if (r === 1) return [null, ...S.owned.weapons.filter(w => w !== L.a)];
    if (r === 2) return [null, ...S.owned.supers];
    if (r === 4) return [0, 1, 2];
    return [null, ...S.owned.trinkets];
  }
  key(r) { return ['a', 'b', 'sup', 'trinket', 'preset'][r]; }
  switchPreset(d) { const S = Save.d; S.presets = S.presets || [null, null, null]; S.preset = S.preset || 0; S.presets[S.preset] = JSON.parse(JSON.stringify(S.load)); S.preset = (S.preset + d + 3) % 3; const p = S.presets[S.preset], own = S.owned; if (p) S.load = { a: own.weapons.includes(p.a) ? p.a : 'spark', b: p.b && own.weapons.includes(p.b) && p.b !== p.a ? p.b : null, sup: p.sup && own.supers.includes(p.sup) ? p.sup : null, trinket: p.trinket && own.trinkets.includes(p.trinket) ? p.trinket : null }; Sfx.select(); Save.write(); }
  update(dt) {
    this.t += dt; this.actor.anim += dt;
    const M = Input.menu();
    if (M.up) { this.row = (this.row + 4) % 5; Sfx.menu(); }
    if (M.down) { this.row = (this.row + 1) % 5; Sfx.menu(); }
    if (M.left || M.right || M.ok) this.cycle(M.left ? -1 : 1);
    if (M.back) { Sfx.back(); Save.write(); go(this.back); }
  }
  cycle(d) { if (this.row === 4) { this.switchPreset(d); return; } const o = this.options(this.row), k = this.key(this.row), L = Save.d.load; if (o.length < 2) { Sfx.deny(); return; } let i = o.indexOf(L[k]); i = (i + d + o.length) % o.length; L[k] = o[i]; Sfx.menu(); Save.write(); }
  draw() {
    X.fillStyle = '#3a2418'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .3);
    text('EQUIP', W / 2, 40, { size: 38, col: C.cream, stroke: 7, shadow: 3 });
    const L = Save.d.load, labels = ['SHOT A', 'SHOT B', 'SUPER', 'TRINKET', 'BUILD'];
    const val = r => { if (r === 4) return 'BUILD ' + ((Save.d.preset || 0) + 1) + ' OF 3'; const v = L[this.key(r)]; if (!v) return 'NONE'; return r < 2 ? WEAPONS[v].name : r === 2 ? SUPERS[v].name : TRINKETS[v].name; };
    for (let r = 0; r < 5; r++) {
      const y = 80 + r * 70, sel = r === this.row;
      Mouse.zone(40, y, 480, 60, () => { this.row = r; }, () => { this.row = r; this.cycle(1); });
      rrect(40, y, 480, 60, 10, sel ? C.cream : '#d8c8a0', sel ? 5 : 3, sel ? C.red : C.ink);
      text(labels[r], 70, y + 16, { size: 13, font: FONT_M, col: C.ink2, align: 'left' });
      text(val(r), 280, y + 39, { size: 21, col: sel ? C.red : C.ink, maxW: 380 });
      if (sel) { text('◀', 66, y + 39, { size: 18, col: C.red }); text('▶', 494, y + 39, { size: 18, col: C.red }); }
      const n = this.options(r).length; text(r === 4 ? 'saved loadouts' : n > 1 ? n + ' choices' : 'buy more in the shop', 500, y + 15, { size: 10, font: FONT_B, col: C.ink2, align: 'right' });
    }
    // detail panel
    decoCard(560, 92, 370, 330, {});
    const k = this.key(this.row), v = L[k];
    let title = 'Nothing equipped', desc = 'Choose something with ◀ ▶.', stats = null;
    if (v) { if (this.row < 2) { const w = WEAPONS[v]; title = w.name; desc = w.desc + ' ' + w.ex; stats = w.stats; } else if (this.row === 2) { title = SUPERS[v].name; desc = SUPERS[v].desc + ' Costs a full super meter (5 cards).'; } else { title = TRINKETS[v].name; desc = TRINKETS[v].desc; } }
    if (this.row === 4) { title = 'Builds'; desc = 'Keep up to three loadouts and swap between them here. Each build remembers its shots, super and trinket.'; stats = null; }
    else if (this.row === 2 && !Save.d.owned.supers.length) desc = 'Supers unlock as you clear worlds. ' + SUPERS.beam.unlock + ' for the Thunder Beam.';
    text(title, 745, 128, { size: 22, col: C.red, maxW: 330 });
    wrapText(desc, 745, 160, 320, 20, { size: 13, col: C.ink });
    if (stats) ['DAMAGE', 'RANGE', 'SPEED'].forEach((s, i) => { const y = 226 + i * 26; text(s, 600, y, { size: 12, font: FONT_M, col: C.ink, align: 'left' }); for (let k2 = 0; k2 < 5; k2++) rrect(700 + k2 * 36, y - 9, 30, 18, 4, k2 < stats[i] ? C.red : '#cdbf9e', 2); });
    this.actor.x = 745; this.actor.y = 412; this.actor.weapons = [L.a]; this.actor.trinket = null; X.save(); X.translate(745, 412); X.scale(1.2, 1.2); X.translate(-745, -412); this.actor.draw(); X.restore();
    text('▲▼ SLOT   ◀▶ CHANGE   ESC DONE', W / 2, H - 22, { size: 12, font: FONT_M, col: '#c8b898' });
  }
}

// ---------------- settings ----------------
class SettingsScene {
  constructor(back) {
    this.back = back; this.t = 0; const S = Settings.d;
    const vol = (k, lab) => ({ label: lab + ':', value: () => Math.round(S[k] * 100) + '%', adjust: d => { S[k] = clamp(Math.round(S[k] * 10 + d) / 10, 0, 1); Settings.save(); } });
    const tog = (k, lab) => ({ label: lab, value: () => S[k] ? 'ON' : 'OFF', adjust: () => { S[k] = !S[k]; Settings.save(); } });
    const filters = ['color', 'sepia', 'bw'], fnames = { color: 'VINTAGE COLOR', sepia: 'SEPIA', bw: 'BLACK & WHITE' };
    this.menu = new MenuList([
      vol('master', 'MASTER'), vol('music', 'MUSIC'), vol('sfx', 'SOUND FX'),
      { label: 'FILM LOOK:', value: () => fnames[S.filter], adjust: d => { S.filter = filters[(filters.indexOf(S.filter) + d + 3) % 3]; Settings.save(); } },
      { label: 'GRAPHICS:', value: () => S.quality === 'low' ? 'FAST' : 'FANCY', adjust: () => { S.quality = S.quality === 'low' ? 'high' : 'low'; Settings.save(); fitCanvas(); } },
      tog('grain', 'FILM GRAIN:'), tog('shake', 'SCREEN SHAKE:'), tog('bossbar', 'BOSS HEALTH BAR:'), tog('announcer', 'ANNOUNCER VOICE:'),
      { label: 'TOUCH BUTTONS:', value: () => S.touch === 'off' ? 'OFF' : 'AUTO', adjust: () => { S.touch = S.touch === 'off' ? 'auto' : 'off'; Settings.save(); } },
      { label: 'FULL SCREEN', act: () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { } } },
      { label: 'ERASE SAVE DATA', act: () => { this.menu.sub = new MenuList([{ label: 'YES, ERASE IT', act: () => { Save.d = Save.fresh(); Save.write(); this.menu.sub = null; Sfx.boom(.5); } }, { label: 'NO', act: () => { this.menu.sub = null; } }], { title: 'ERASE EVERYTHING?', x: W / 2, y: 200, w: 420, onBack: () => { this.menu.sub = null; } }); } },
      { label: 'BACK', act: () => go(this.back) }
    ], { title: 'SETTINGS', x: W / 2, y: 22, w: 560, ih: 31, size: 17, onBack: () => go(this.back) });
  }
  update(dt) { this.t += dt; this.menu.update(dt); }
  draw() { drawStageBackdrop(this.t, .45); this.menu.draw(); }
}

// ---------------- controls ----------------
class ControlsScene {
  constructor(back) { this.back = back; this.t = 0; this.r = 0; this.c = 0; this.wait = false; }
  update(dt) {
    this.t += dt; if (this.wait) return;
    const M = Input.menu(), n = ACTIONS.length + 2;
    if (M.up) { this.r = (this.r - 1 + n) % n; Sfx.menu(); } if (M.down) { this.r = (this.r + 1) % n; Sfx.menu(); }
    if (M.left || M.right) { this.c ^= 1; Sfx.menu(); }
    if (M.ok) this.activate();
    if (M.back) { Sfx.back(); go(this.back); }
  }
  activate() {
    Sfx.select();
    if (this.r === ACTIONS.length) { Settings.d.binds = JSON.parse(JSON.stringify(DEFAULT_BINDS)); Settings.save(); return; }
    if (this.r === ACTIONS.length + 1) { go(this.back); return; }
    this.wait = true; const a = ACTIONS[this.r], p = this.c;
    setTimeout(() => { Input.rebind = code => { this.wait = false; if (code === 'Escape') return; const B = Settings.d.binds; for (let q = 0; q < 2; q++) for (const k of ACTIONS) if (B[q][k] === code && !(q === p && k === a)) B[q][k] = B[p][a]; B[p][a] = code; Settings.save(); Sfx.select(); }; }, 80);
  }
  draw() {
    X.fillStyle = '#2a1a12'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .25);
    text('CONTROLS', W / 2, 34, { size: 34, col: C.cream, stroke: 7 });
    decoCard(110, 62, 740, 410, {});
    text('ACTION', 250, 88, { size: 14, font: FONT_M, col: C.ink2 }); text('PLAYER 1 (BOLT)', 520, 88, { size: 14, font: FONT_M, col: C.ink2 }); text('PLAYER 2 (DOT)', 720, 88, { size: 14, font: FONT_M, col: C.ink2 });
    const B = Settings.d.binds;
    ACTIONS.forEach((a, i) => {
      const y = 116 + i * 29, sel = this.r === i;
      if (sel) { X.save(); X.globalAlpha = .25; rrect(130, y - 13, 700, 26, 6, C.gold, 0); X.restore(); }
      text(ACTION_NAMES[a], 250, y, { size: 15, font: FONT_B, col: C.ink });
      for (let p = 0; p < 2; p++) { const s = sel && this.c === p; const lab = this.wait && s ? 'PRESS A KEY...' : Input.keyName(B[p][a]); rrect(p ? 640 : 440, y - 12, 160, 24, 6, s ? C.red : C.cream, 2); text(lab, (p ? 640 : 440) + 80, y + 1, { size: 13, col: s ? C.cream : C.ink }); Mouse.zone(p ? 640 : 440, y - 12, 160, 24, () => { if (!this.wait) { this.r = i; this.c = p; } }, () => { if (!this.wait) { this.r = i; this.c = p; this.activate(); } }); }
    });
    const extra = ['RESET TO DEFAULTS', 'BACK'];
    extra.forEach((e, k) => { const y = 116 + (ACTIONS.length + k) * 29 + 6, sel = this.r === ACTIONS.length + k; text(e, W / 2, y, { size: 16, col: sel ? C.red : C.ink }); if (sel) pointerGlove(W / 2 - 130, y, this.t); Mouse.zone(W / 2 - 120, y - 12, 240, 24, () => { this.r = ACTIONS.length + k; }, () => { this.r = ACTIONS.length + k; this.activate(); }); });
    wrapText('Playing alone? Player 1 can use WASD + J jump, K shoot, L dash, I EX, U swap, O lock. Or ARROWS + Z/SPACE jump, X shoot, C dash, V EX, Q swap, E lock. Gamepads: A jump, X shoot, B EX, Y swap, LB/RT dash, RB/LT lock, START pause. In the air, press JUMP again to double jump and to PARRY pink things.', W / 2, 484, 760, 17, { size: 12, col: '#e8d8b0' });
  }
}
class ControlsHelp {
  constructor(onClose) { this.onClose = onClose; this.t = 0; }
  update(dt) { this.t += dt; const M = Input.menu(); if ((M.back || M.ok || M.pause) && this.t > .15) { Sfx.back(); this.onClose(); } }
  draw() {
    decoCard(150, 50, 660, 440, {});
    text('HOW TO PLAY', W / 2, 88, { size: 28, col: C.red });
    const B = Settings.d.binds, rows = ACTIONS.map(a => [ACTION_NAMES[a], Input.keyName(B[0][a]) + (Input.coop ? '' : ' / ' + Input.keyName(SOLO_ALT[a][0])), Input.keyName(B[1][a])]);
    rows.forEach((r, i) => { const y = 128 + i * 26; text(r[0], 330, y, { size: 14, font: FONT_B, col: C.ink }); text(r[1], 540, y, { size: 13, col: C.ink }); text(r[2], 700, y, { size: 13, col: C.ink2 }); });
    wrapText('Double jump and PARRY with JUMP in mid-air. Parry anything PINK to fill a super card. EX costs 1 card. With a super equipped, EX on a full meter fires it. Hold LOCK to stand and aim in 8 directions. DASH while ducking to slide.', W / 2, 400, 600, 18, { size: 13, col: C.ink });
    text('Press any button to go back', W / 2, 470, { size: 11, font: FONT_M, col: C.ink2 });
  }
}

// ---------------- practice ----------------
class PracticeScene {
  constructor() { this.t = 0; this.i = 0; this.menu = null; this.opts = { diff: 'normal', phase: 0, inf: false }; }
  enter() { Music.play('map'); }
  cards() { return [...BOSSES.map(b => ({ k: 'boss', def: b })), ...LEVELS.map(l => ({ k: 'level', lvl: l }))]; }
  update(dt) {
    this.t += dt; if (this.menu) { this.menu.update(dt); return; }
    const M = Input.menu(), n = this.cards().length;
    if (M.left) { this.i = (this.i - 1 + n) % n; Sfx.menu(); } if (M.right) { this.i = (this.i + 1) % n; Sfx.menu(); }
    if (M.up) { this.i = this.i >= 8 ? Math.min(this.i - 8, 7) : this.i >= 4 ? this.i - 4 : this.i; Sfx.menu(); }
    if (M.down) { this.i = this.i < 4 ? this.i + 4 : this.i < 8 ? Math.min(8 + (this.i - 4), 12) : this.i; Sfx.menu(); }
    if (M.ok) this.open(this.cards()[this.i]);
    if (M.back) { Sfx.back(); go(() => new MainMenu()); }
  }
  open(c) {
    Sfx.select(); const o = this.opts, diffs = ['easy', 'normal', 'expert'];
    const items = [];
    if (c.k === 'boss') {
      items.push({ label: 'DIFFICULTY:', value: () => DIFF[o.diff].name, adjust: d => { o.diff = diffs[(diffs.indexOf(o.diff) + d + 3) % 3]; } });
      items.push({ label: 'START AT:', value: () => 'ACT ' + ['I', 'II', 'III', 'IV'][o.phase] + ' · ' + c.def.phases[o.phase].name.toUpperCase(), adjust: d => { o.phase = (o.phase + d + 4) % 4; } });
    }
    items.push({ label: 'INFINITE HP:', value: () => o.inf ? 'ON' : 'OFF', adjust: () => { o.inf = !o.inf; } });
    items.push({ label: 'PLAYERS:', value: () => Save.d.players === 2 ? 'TWO' : 'ONE', adjust: () => { Save.d.players = Save.d.players === 2 ? 1 : 2; Save.write(); } });
    items.push({ label: 'START!', act: () => { this.menu = null; const cfg = { practice: true, inf: o.inf, coop: Save.d.players === 2 }; if (c.k === 'boss') startBoss(c.def.id, o.diff, Object.assign(cfg, { startPhase: o.phase })); else startLevel(c.lvl.id, cfg); } });
    items.push({ label: 'BACK', act: () => { this.menu = null; } });
    this.menu = new MenuList(items, { title: (c.k === 'boss' ? c.def.name : c.lvl.name).toUpperCase(), titleSize: 22, x: W / 2, y: 120, w: 620, ih: 38, size: 17, onBack: () => { this.menu = null; }, footer: 'Practice runs give no coins or grades.' });
    this.menu.i = items.length - 2;
  }
  draw() {
    X.fillStyle = '#2a1a12'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .25);
    text('PRACTICE', W / 2, 36, { size: 34, col: C.cream, stroke: 7 });
    text('Every boss and level is open here. Pick one to rehearse.', W / 2, 66, { size: 13, font: FONT_B, col: '#e8d8b0' });
    this.cards().forEach((c, i) => {
      let x, y, w = 200, h = 120;
      if (i < 8) { x = 60 + (i % 4) * 215; y = 86 + Math.floor(i / 4) * 150; } else { w = 160; h = 86; x = 50 + (i - 8) * 175; y = 400; }
      const sel = i === this.i; const bob = sel ? Math.sin(this.t * 6) * 3 : 0;
      Mouse.zone(x, y, w, h, () => { this.i = i; }, () => { this.i = i; this.open(c); });
      if (c.k === 'boss') { drawPortraitCard(c.def, x, y + bob, w, h, { sel }); rrect(x, y + h - 26 + bob, w, 26, 0, 'rgba(27,18,12,.75)', 0); text(c.def.name, x + w / 2, y + h - 12 + bob, { size: 13, font: FONT_M, col: C.cream, maxW: w - 14 }); text('★'.repeat(c.def.stars), x + w - 10, y + 14 + bob, { size: 11, col: C.gold, stroke: 3, align: 'right' }); }
      else { const far = paintCached('far_' + c.lvl.theme, W, H, THEMES[c.lvl.theme].far); X.save(); X.beginPath(); rrectPath(x, y + bob, w, h, 10); X.clip(); X.drawImage(far, x, y + bob, w, h); X.restore(); rrect(x, y + bob, w, h, 10, null, sel ? 5 : 3, sel ? C.red : C.ink); text(c.lvl.name, x + w / 2, y + h / 2 + bob, { size: 13, font: FONT_M, col: C.cream, stroke: 4, maxW: w - 14 }); text('W' + c.lvl.world, x + 16, y + 14 + bob, { size: 12, col: C.cream, stroke: 3 }); }
    });
    if (this.menu) { X.save(); X.fillStyle = 'rgba(15,8,4,.6)'; X.fillRect(0, 0, W, H); X.restore(); this.menu.draw(); }
  }
}

// ---------------- boss rush ----------------
class RushScene {
  constructor() { this.t = 0; this.diff = 'normal'; const diffs = ['easy', 'normal', 'expert'];
    this.menu = new MenuList([
      { label: 'DIFFICULTY:', value: () => DIFF[this.diff].name, adjust: d => { this.diff = diffs[(diffs.indexOf(this.diff) + d + 3) % 3]; } },
      { label: 'PLAYERS:', value: () => Save.d.players === 2 ? 'TWO' : 'ONE', adjust: () => { Save.d.players = Save.d.players === 2 ? 1 : 2; Save.write(); } },
      { label: 'START THE RUSH!', act: () => startRush(this.diff) },
      { label: 'BACK', act: () => go(() => new MainMenu()) }
    ], { x: W / 2, y: 330, w: 460, ih: 38, onBack: () => go(() => new MainMenu()) }); this.menu.i = 2; }
  enter() { Music.play('map'); }
  update(dt) { this.t += dt; this.menu.update(dt); }
  draw() {
    X.fillStyle = '#2a1a12'; X.fillRect(0, 0, W, H); Paper.apply(X, W, H, .25);
    text('BOSS RUSH', W / 2, 40, { size: 38, col: C.cream, stroke: 7 });
    wrapText('Fight all eight bosses back to back. Your health and super meter carry over, and you heal 1 HP between shows.', W / 2, 76, 700, 20, { size: 14, col: '#e8d8b0' });
    BOSSES.forEach((b, i) => drawPortraitCard(b, 60 + (i % 4) * 215, 112 + Math.floor(i / 4) * 102, 190, 92, {}));
    const r = Save.d.rush; text(r ? 'Best: ' + fmtTime(r.time) + ' on ' + DIFF[r.diff].name + ' (' + r.grade + ')' : 'No completed rush yet', W / 2, 316, { size: 14, font: FONT_M, col: C.gold, stroke: 3 });
    this.menu.draw();
  }
}

// ---------------- results ----------------
class ResultsScene {
  constructor(r, next, extra = {}) {
    this.r = r; this.next = next; this.t = 0; this.extra = extra;
    const D = DIFF[r.diff];
    this.rows = [
      ['TIME', fmtTime(r.time) + ' / ' + fmtTime(r.par)],
      ['HP BONUS', String(Math.min(3, r.hp)) + ' / 3'],
      ['PARRY', String(Math.min(3, r.parries)) + ' / 3'],
      r.type === 'boss' ? ['SUPER METER', String(Math.min(6, r.cards)) + ' / 6'] : ['COINS', r.coins + ' / 5'],
      ['DAMAGE TAKEN', String(r.hits)],
      ['SKILL LEVEL', '★'.repeat(D.stars) + '☆'.repeat(3 - D.stars)]
    ];
    if (extra.rushTotal != null) this.rows.unshift(['RUSH TOTAL', fmtTime(extra.rushTotal)]);
    this.done = false;
  }
  enter() { Music.play('ending'); }
  update(dt) {
    this.t += dt; const n = this.rows.length, end = .6 + n * .4 + .8;
    for (let i = 0; i < n; i++) if (Math.abs(this.t - (.6 + i * .4)) < dt * .6) Sfx.menu();
    if (!this.stamped && this.t > end - .2) { this.stamped = true; Music.jingle('grade'); Camera.shake(6, .3); }
    const M = Input.menu();
    if (M.ok || M.any) { if (this.t < end) this.t = end; else if (this.t > end + .3) { Sfx.select(); go(this.next); } }
  }
  draw() {
    drawStageBackdrop(this.t, .55);
    decoCard(150, 26, 660, 490, {});
    text(this.r.practice ? 'PRACTICE RESULTS' : this.r.type === 'boss' ? 'KNOCKOUT RESULTS' : 'SHOW RESULTS', W / 2, 62, { size: 30, col: C.red });
    text(this.r.name + ' · ' + DIFF[this.r.diff].name, W / 2, 92, { size: 15, font: FONT_M, col: C.ink2, maxW: 600 });
    this.rows.forEach((row, i) => {
      const y = 130 + i * 40, k = clamp((this.t - .6 - i * .4) / .3, 0, 1); if (k <= 0) return;
      X.save(); X.globalAlpha = k;
      text(row[0], 200, y, { size: 17, col: C.ink, align: 'left' });
      X.save(); X.setLineDash([2, 6]); line(200 + textW(row[0], 17) + 12, y + 6, 600 - textW(row[1], 17) - 12, y + 6, 2, C.ink2); X.restore();
      text(row[1], 600, y, { size: 17, col: C.red, align: 'right' });
      X.restore();
    });
    const n = this.rows.length, end = .6 + n * .4 + .8;
    if (this.t > end - .2) {
      const k = clamp((this.t - end + .2) / .25, 0, 1), s = 2.4 - ease.outBack(k) * 1.4;
      X.save(); X.translate(700, 230); X.scale(s, s); X.rotate(-.12);
      circ(0, 0, 66, null, 6, C.red); circ(0, 0, 56, null, 2, C.red);
      text(this.r.grade, 0, 4, { size: this.r.grade.length > 1 ? 54 : 64, col: C.red });
      X.restore();
      text('GRADE', 700, 320, { size: 15, font: FONT_M, col: C.ink2 });
      const msgs = this.extra.msgs || [];
      msgs.forEach((m, i) => text(m, W / 2, 400 + i * 24, { size: 15, col: C.greenD, maxW: 600 }));
      text('Press JUMP to continue', W / 2, 490, { size: 13, font: FONT_M, col: C.ink2 });
    }
    Mouse.zone(0, 0, W, H, null, () => { const n2 = this.rows.length, e = .6 + n2 * .4 + .8; if (this.t < e) this.t = e; else go(this.next); });
  }
}

// ---------------- death ----------------
class DeathMenu {
  constructor(st) {
    this.st = st; this.t = 0;
    const items = [{ label: 'RETRY', act: () => retryStage(st) }];
    items.push({ label: st.cfg.practice ? 'EXIT TO MENU' : st.cfg.rush ? 'QUIT BOSS RUSH' : 'EXIT TO MAP', act: () => exitStage(st) });
    this.menu = new MenuList(items, { x: W / 2, y: 360, w: 300, ih: 38 });
    if (st.kind === 'boss') setTimeout(() => Voice.laugh(st.def.voice || 1), 900);
    this.quote = st.kind === 'boss' ? st.def.quote : pick(['The show must go on... try again!', 'Even stars stumble. Back on stage!', 'Curtain call! One more take?']);
    if (st.boss) this.prog = 1 - st.boss.hp / st.boss.maxHp; else this.prog = clamp(Math.max(...st.players.map(p => p.x)) / st.goal, 0, 1);
  }
  update(dt) { this.t += dt; if (this.t > 1) this.menu.update(dt); }
  draw() {
    const k = ease.outQ(clamp(this.t / .8, 0, 1)), cw = W / 2 * k;
    for (const s of [0, 1]) { X.save(); const x0 = s ? W - cw : 0; X.fillStyle = '#9a1f24'; X.fillRect(x0, 0, cw, H); for (let x = 0; x < cw; x += 30) line(x0 + x, 0, x0 + x + 6, H, 3, 'rgba(40,0,5,.45)'); X.restore(); }
    if (this.t < .8) return;
    const a = clamp((this.t - .8) * 3, 0, 1); X.save(); X.globalAlpha = a;
    decoCard(200, 70, 560, 270, {});
    wavyText('CURTAINS!', W / 2, 128, { size: 60, col: C.red, stroke: 0, amp: 2 }, this.t);
    text('“' + this.quote + '”', W / 2, 186, { size: 15, font: FONT_B, col: C.ink, maxW: 510 });
    // progress
    const x0 = 270, x1 = 690, y = 260;
    line(x0, y, x1, y, 6, C.ink); line(x0, y, x0 + (x1 - x0) * this.prog, y, 3, C.red);
    if (this.st.boss) for (const ph of this.st.def.phases.slice(1)) circ(x0 + (x1 - x0) * (1 - ph.at), y, 6, C.cream, 2.5);
    const px = x0 + (x1 - x0) * this.prog; drawBulbIcon(px, y - 24, 11, false);
    if (this.st.boss) { X.save(); X.beginPath(); X.arc(x1 + 26, y, 22, 0, TAU); X.clip(); X.drawImage(bossPortrait(this.st.def), x1 + 4 - 8, y - 24, 60, 45); X.restore(); circ(x1 + 26, y, 22, null, 3); }
    else text('THE END', x1 + 40, y, { size: 12, col: C.ink });
    text(Math.round(this.prog * 100) + '% of the way there!', W / 2, 300, { size: 14, font: FONT_M, col: C.ink2 });
    X.restore();
    if (this.t > 1) this.menu.draw();
  }
}

// ---------------- credits ----------------
class CreditsScene {
  constructor(back, ending) { this.back = back; this.t = 0; this.ending = ending; }
  enter() { Music.play('ending'); }
  update(dt) { this.t += dt; const M = Input.menu(); if ((M.back || M.ok) && this.t > .5) { Sfx.back(); go(this.back); } }
  draw() {
    drawStageBackdrop(this.t, .6);
    const lines = [['LIGHTS OUT!', 44], ['The Bolt & Dot Show', 22], ['', 20], ['STARRING', 16], ['Bolt  &  Dot', 22], ['', 12], ['FEATURING', 16], ...BOSSES.map(b => [b.name + ' · ' + b.title, 15]), ['', 12], ['Shelby the Tortoise as the Shopkeeper', 15], ['', 16], ['Drawn, animated, scored & coded with Claude', 16], ['Every picture is painted live in code.', 14], ['Every note is played live by a little synth band.', 14], ['', 16], ['Thanks for watching the show!', 20]];
    let y = H + 20 - (this.t * 40) % (lines.length * 34 + H + 60);
    for (const [s, sz] of lines) { if (s) text(s, W / 2, y, { size: sz, col: sz > 20 ? C.cream : '#f0e2c0', stroke: sz > 20 ? 6 : 3, font: sz >= 20 ? FONT_D : FONT_M }); y += 34; }
    text('ESC to return', W - 14, H - 14, { size: 11, font: FONT_M, col: '#c8b898', align: 'right' });
  }
}

// ---------------- flow ----------------
function startBoss(id, diff, extra = {}) { const cfg = Object.assign({ type: 'boss', id, diff, coop: Save.d.players === 2 }, extra); go(() => new Stage(cfg)); }
function startLevel(id, extra = {}) { const cfg = Object.assign({ type: 'level', id, diff: 'normal', coop: Save.d.players === 2 }, extra); go(() => new Stage(cfg)); }
function startRush(diff) { const rush = { list: BOSSES.map(b => b.id), i: 0, time: 0, diff, stats: { hits: 0, parries: 0, cards: 0 } }; startBoss(rush.list[0], diff, { rush }); }
function retryStage(st) { const cfg = Object.assign({}, st.cfg); go(() => new Stage(cfg)); }
function exitStage(st) { Music.stop(.3); if (st.cfg.practice) go(() => new PracticeScene()); else if (st.cfg.rush) go(() => new MainMenu()); else go(() => new MapScene(st.lvl ? st.lvl.world - 1 : st.def.world - 1)); }
function onStageWon(r) {
  const S = Save.d;
  if (r.practice) { go(() => new ResultsScene(r, () => new PracticeScene())); return; }
  if (r.rush) {
    const R = r.rush; R.time += r.time; R.stats.hits += r.hits; R.stats.parries += r.parries; R.stats.cards += r.cards;
    if (R.i < R.list.length - 1) {
      const carry = r.carry.map(c => ({ hp: Math.min(9, (c.dead ? 1 : c.hp) + 1), meter: c.meter }));
      const nextRush = Object.assign({}, R, { i: R.i + 1 }); const nextDef = BOSSES.find(b => b.id === R.list[R.i + 1]);
      go(() => new ResultsScene(r, () => new Stage({ type: 'boss', id: nextDef.id, diff: R.diff, coop: r.coop, rush: nextRush, carry }), { msgs: ['NEXT UP: ' + nextDef.name.toUpperCase(), 'You heal 1 HP.'] }));
      return;
    }
    const total = { type: 'boss', name: 'Boss Rush', diff: R.diff, time: R.time, par: BOSSES.reduce((s, b) => s + b.par, 0), hp: r.hp, parries: R.stats.parries, cards: R.stats.cards, hits: R.stats.hits, coins: 0 };
    total.grade = computeGrade(total);
    const msgs = []; const best = S.rush;
    Achieve.unlock('rush');
    if (!best) { S.coins += 5; msgs.push('First rush cleared! +5 COINS'); }
    if (!best || total.time < best.time) { S.rush = { time: total.time, diff: R.diff, grade: total.grade }; msgs.push('New best rush time!'); }
    Save.write();
    go(() => new ResultsScene(total, () => new MainMenu(), { msgs, rushTotal: R.time }));
    return;
  }
  const msgs = []; let ending = false;
  if (r.type === 'boss') {
    const rec = Save.bossRec(r.id), def = BOSSES.find(b => b.id === r.id);
    rec.beat = true;
    if (!rec.grades[r.diff] || GRADE_ORDER.indexOf(r.grade) > GRADE_ORDER.indexOf(rec.grades[r.diff])) rec.grades[r.diff] = r.grade;
    if (!rec.best || r.time < rec.best) rec.best = r.time;
    const tier = { easy: 1, normal: 2, expert: 3 }[r.diff]; const pay = tier - (rec.paid || 0);
    rec.medals = rec.medals || {}; const md = rec.medals;
    if (r.hits === 0 && !md.nohit) { md.nohit = 1; msgs.push('Challenge: UNTOUCHED!'); } if (r.parries >= 5 && !md.parry) { md.parry = 1; msgs.push('Challenge: PARRY PRO!'); } if (r.time <= r.par && !md.speed) { md.speed = 1; msgs.push('Challenge: UNDER PAR!'); }
    Achieve.unlock('first'); if (r.diff === 'expert') Achieve.unlock('expert'); if (r.grade === 'S') Achieve.unlock('srank'); if (r.hits === 0) Achieve.unlock('nohit'); if (r.parries >= 5) Achieve.unlock('parry5'); if (r.time <= r.par) Achieve.unlock('speed'); if (r.coop) Achieve.unlock('coop');
    if (BOSSES.every(b => S.bosses[b.id] && S.bosses[b.id].beat)) Achieve.unlock('allb'); if (r.id === 'gloom') Achieve.unlock('gloom');
    if (pay > 0) { S.coins += pay; rec.paid = tier; msgs.push('+' + pay + ' COIN' + (pay > 1 ? 'S' : '') + ' for winning on ' + DIFF[r.diff].name + '!'); }
    const w = WORLDS[def.world - 1];
    if (w.bosses.every(id => S.bosses[id] && S.bosses[id].beat)) {
      const sup = ['beam', 'glow', 'bolt'][w.n - 1];
      if (sup && !S.owned.supers.includes(sup)) { S.owned.supers.push(sup); if (!S.load.sup) S.load.sup = sup; Notices.push({ title: 'NEW SUPER!', body: SUPERS[sup].name + ': ' + SUPERS[sup].desc + ' Fill all 5 cards and press EX.', icon: 'bulb' }); }
      if (w.n < 5 && S.worlds < w.n + 1) { S.worlds = w.n + 1; S.lastWorld = w.n; Notices.push({ title: 'WORLD ' + (w.n + 1) + ' UNLOCKED!', body: WORLDS[w.n].name + ' awaits. ' + WORLDS[w.n].sub + '. New goods are in the shop, too!', icon: 'bulb' }); msgs.push('World ' + (w.n + 1) + ' unlocked!'); }
      if (w.n === 5 && !S.ended) { S.ended = true; ending = true; }
    }
  } else {
    const rec = Save.levelRec(r.id); rec.done = true;
    const st = scene; let got = 0;
    for (const idx of (st.gotCoins || [])) if (!rec.coins[idx]) { rec.coins[idx] = true; S.coins++; got++; }
    if (got) msgs.push('+' + got + ' COIN' + (got > 1 ? 'S' : '') + ' banked!');
    if (st.gotReel && !S.reels[r.id]) { S.reels[r.id] = true; msgs.push('Secret film reel found! (' + Object.keys(S.reels).length + '/5)'); if (Object.keys(S.reels).length >= 5 && !S.owned.trinkets.includes('reel')) { S.owned.trinkets.push('reel'); Notices.push({ title: 'ALL 5 REELS!', body: 'You unlocked the secret Golden Reel trinket. Equip it for +10% damage and a golden trail!', icon: 'bulb' }); } }
    if (!rec.grade || GRADE_ORDER.indexOf(r.grade) > GRADE_ORDER.indexOf(rec.grade)) rec.grade = r.grade;
    if (rec.coins.every(Boolean)) Achieve.unlock('coins5'); if (S.reels[r.id]) Achieve.unlock('reel'); if (Object.keys(S.reels).length >= 5) Achieve.unlock('reels'); if (r.coop) Achieve.unlock('coop');
  }
  Save.write();
  const world = r.type === 'boss' ? BOSSES.find(b => b.id === r.id).world - 1 : LEVELS.find(l => l.id === r.id).world - 1;
  const after = ending ? () => new StoryScene(ENDING, () => new CreditsScene(() => new MapScene(4)), 'ending') : () => new MapScene(Notices.length && S.lastWorld != null ? S.lastWorld : world);
  go(() => new ResultsScene(r, after, { msgs }));
}
