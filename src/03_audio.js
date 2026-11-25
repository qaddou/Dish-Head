// =====================================================================
//  Audio: synthesized 1930s band, sound effects, cartoon voices
// =====================================================================
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const AudioSys = {
  ac: null, ok: false,
  unlock() {
    if (!this.ac) {
      try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ac = new AC(); this.build(); } catch (e) { this.ac = null; return; }
    }
    if (this.ac.state === 'suspended') this.ac.resume().catch(() => { });
  },
  build() {
    const ac = this.ac;
    this.master = ac.createGain();
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 75;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6800; lp.Q.value = .4;
    const mid = ac.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1400; mid.gain.value = 3; mid.Q.value = .7;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
    this.master.connect(hp); hp.connect(mid); mid.connect(lp); lp.connect(comp); comp.connect(ac.destination);
    this.mus = ac.createGain(); this.sfx = ac.createGain();
    this.mus.connect(this.master); this.sfx.connect(this.master);
    // small hall reverb
    const len = ac.sampleRate * 1.5, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.rev = ac.createConvolver(); this.rev.buffer = ir;
    this.revIn = ac.createGain(); this.revIn.gain.value = .16; this.revIn.connect(this.rev); this.rev.connect(this.master);
    this.mus.connect(this.revIn);
    // noise
    this.noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = this.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    // vinyl crackle loop
    const cl = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), cd = cl.getChannelData(0);
    for (let i = 0; i < cd.length; i++) { cd[i] = (Math.random() * 2 - 1) * .012; if (Math.random() < .00035) { const a = rnd(.2, .8) * (Math.random() < .5 ? -1 : 1); for (let k = 0; k < 6 && i + k < cd.length; k++) cd[i + k] += a * Math.pow(.5, k); } }
    const cs = ac.createBufferSource(); cs.buffer = cl; cs.loop = true;
    const cf = ac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 2400; cf.Q.value = .5;
    this.crackle = ac.createGain(); this.crackle.gain.value = .5;
    cs.connect(cf); cf.connect(this.crackle); this.crackle.connect(this.mus); cs.start();
    this.ok = true; this.applyVol();
  },
  applyVol() {
    if (!this.ok) return; const s = Settings.d, t = this.ac.currentTime;
    this.master.gain.setTargetAtTime(s.master, t, .05);
    this.mus.gain.setTargetAtTime(s.music * .5, t, .05);
    this.sfx.gain.setTargetAtTime(s.sfx * .62, t, .05);
  },
  get t() { return this.ac ? this.ac.currentTime : 0; }
};

// ---------- instruments ----------
const Inst = {
  osc(type, f, t, end, dst, det = 0) { const o = AudioSys.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det; o.connect(dst); o.start(t); o.stop(end); return o; },
  gain(dst, v = 1) { const g = AudioSys.ac.createGain(); g.gain.value = v; g.connect(dst); return g; },
  filt(dst, type, f, q = 1) { const b = AudioSys.ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dst); return b; },
  adsr(g, t, peak, a, d, sus, rel, len) {
    const p = g.gain; p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + a);
    p.exponentialRampToValueAtTime(Math.max(.0002, peak * sus), t + a + d);
    p.setValueAtTime(Math.max(.0002, peak * sus), t + Math.max(a + d, len)); p.exponentialRampToValueAtTime(.0001, t + Math.max(a + d, len) + rel);
    return t + Math.max(a + d, len) + rel + .02;
  },
  vib(o, t, depth = 14, rate = 5.5, delay = .12) {
    const ac = AudioSys.ac, l = ac.createOscillator(), g = ac.createGain();
    l.frequency.value = rate; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(depth, t + delay + .15);
    l.connect(g); g.connect(o.detune); l.start(t); return l;
  },
  piano(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0);
    const p = g.gain; p.setValueAtTime(.0001, t); p.linearRampToValueAtTime(v * .3, t + .005); p.exponentialRampToValueAtTime(v * .1, t + .16); p.exponentialRampToValueAtTime(.0001, t + .25 + d * 1.4);
    const end = t + .3 + d * 1.4;
    this.osc('triangle', f, t, end, g); this.osc('triangle', f, t, end, g, 11);
    const h = this.gain(g, .22); this.osc('sine', f * 2, t, end, h);
  },
  bass(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .55, .008, .2, .35, .12, Math.min(d, .4));
    const lp = this.filt(g, 'lowpass', 900, .8);
    this.osc('triangle', f, t, end, lp); this.osc('sine', f, t, end, lp);
  },
  tuba(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .38, .03, .12, .6, .08, d * .8);
    const lp = this.filt(g, 'lowpass', 520, 1.5); this.osc('sawtooth', f, t, end, lp); this.osc('square', f * .5, t, end, this.gain(lp, .3));
  },
  brass(t, m, d, v, dst, mute = true) {
    const ac = AudioSys.ac, f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .2, .035, .1, .75, .09, d);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = mute ? 6 : 2;
    lp.frequency.setValueAtTime(mute ? 500 : 900, t); lp.frequency.linearRampToValueAtTime(mute ? 2200 : 3200, t + .06); lp.frequency.exponentialRampToValueAtTime(mute ? 900 : 1600, t + Math.max(.12, d));
    lp.connect(g);
    const o = this.osc('sawtooth', f, t, end, lp); const o2 = this.osc('sawtooth', f, t, end, lp, 7);
    if (d > .2) { this.vib(o, t, 16, 5.6).stop(end); this.vib(o2, t, 16, 5.6).stop(end); }
  },
  clar(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .17, .03, .08, .8, .07, d);
    const lp = this.filt(g, 'lowpass', 2400, 1);
    const o = this.osc('square', f, t, end, lp); if (d > .18) this.vib(o, t, 18, 5.2, .1).stop(end);
    this.osc('sine', f, t, end, this.gain(g, .6));
  },
  sax(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .17, .04, .1, .8, .1, d);
    const bp = this.filt(g, 'lowpass', 1700, 3);
    const o = this.osc('sawtooth', f, t, end, bp); if (d > .18) this.vib(o, t, 22, 5, .14).stop(end);
  },
  xylo(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .35, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
    this.osc('sine', f, t, t + .4, g); this.osc('sine', f * 3.98, t, t + .1, this.gain(g, .25)); this.osc('triangle', f * 2, t, t + .2, this.gain(g, .2));
  },
  organ(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0), end = this.adsr(g, t, v * .09, .06, .1, .9, .2, d);
    for (const [mul, a] of [[1, 1], [2, .5], [3, .25], [.5, .5]]) this.osc('sine', f * mul, t, end, this.gain(g, a));
    const tr = AudioSys.ac.createOscillator(), tg = AudioSys.ac.createGain(); tr.frequency.value = 6; tg.gain.value = v * .03; tr.connect(tg); tg.connect(g.gain); tr.start(t); tr.stop(end);
  },
  banjo(t, m, d, v, dst) {
    const f = mtof(m), g = this.gain(dst, 0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .16, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
    const hp = this.filt(g, 'highpass', 500); this.osc('sawtooth', f, t, t + .25, hp); this.osc('square', f * 2, t, t + .1, this.gain(hp, .3));
  },
  noiseHit(t, v, dst, type, f, q, dur, pitchEnd) {
    const ac = AudioSys.ac, s = ac.createBufferSource(); s.buffer = AudioSys.noise;
    const b = ac.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, t); if (pitchEnd) b.frequency.exponentialRampToValueAtTime(pitchEnd, t + dur); b.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(dst); s.start(t, rnd(1.5)); s.stop(t + dur + .02);
  },
  kick(t, v, dst) { const ac = AudioSys.ac, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); g.gain.setValueAtTime(v * .7, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2); o.connect(g); g.connect(dst); o.start(t); o.stop(t + .22); },
  snare(t, v, dst, brush = true) { this.noiseHit(t, v * (brush ? .22 : .4), dst, 'bandpass', brush ? 3200 : 1800, brush ? .6 : .9, brush ? .16 : .12); if (!brush) { const ac = AudioSys.ac, o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 190; g.gain.setValueAtTime(v * .25, t); g.gain.exponentialRampToValueAtTime(.0001, t + .08); o.connect(g); g.connect(dst); o.start(t); o.stop(t + .1); } },
  hat(t, v, dst, open) { this.noiseHit(t, v * .1, dst, 'highpass', 7000, .8, open ? .18 : .04); },
  ride(t, v, dst) { this.noiseHit(t, v * .07, dst, 'bandpass', 8500, 1.6, .35); },
  crash(t, v, dst) { this.noiseHit(t, v * .18, dst, 'highpass', 4500, .5, 1.2); },
  wood(t, v, dst, hi) { const g = this.gain(dst, 0); g.gain.setValueAtTime(v * .3, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06); this.osc('sine', hi ? 1250 : 820, t, t + .07, g); },
  tom(t, v, dst, f = 110) { const ac = AudioSys.ac, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f, t + .1); g.gain.setValueAtTime(v * .45, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(dst); o.start(t); o.stop(t + .32); }
};

// ---------- songs ----------
const QUAL = { '6': [0, 4, 7, 9], '7': [0, 4, 7, 10], 'maj': [0, 4, 7], 'm6': [0, 3, 7, 9], 'm7': [0, 3, 7, 10], 'd7': [0, 3, 6, 9], 'm': [0, 3, 7] };
const FORMS = {
  rag: { A: [[0, '6'], [0, '6'], [9, '7'], [9, '7'], [2, '7'], [7, '7'], [0, '6'], [7, '7']], B: [[5, '6'], [6, 'd7'], [0, '6'], [9, '7'], [2, '7'], [7, '7'], [0, '6'], [0, '6']] },
  minor: { A: [[0, 'm6'], [0, 'm6'], [5, 'm6'], [5, 'm6'], [7, '7'], [7, '7'], [0, 'm6'], [7, '7']], B: [[8, '7'], [8, '7'], [7, '7'], [7, '7'], [5, 'm6'], [2, 'd7'], [7, '7'], [7, '7']] },
  blues: { A: [[0, '7'], [5, '7'], [0, '7'], [0, '7'], [5, '7'], [5, '7'], [0, '7'], [0, '7']], B: [[7, '7'], [5, '7'], [0, '7'], [9, '7'], [2, '7'], [7, '7'], [0, '7'], [7, '7']] }
};
const SONGS = {
  title: { tempo: 184, key: 58, mode: 'maj', form: 'rag', style: 'stride', lead: 'clar', seed: 7 },
  map: { tempo: 128, key: 65, mode: 'maj', form: 'rag', style: 'swing', lead: 'piano', seed: 21 },
  shop: { tempo: 104, key: 67, mode: 'maj', form: 'rag', style: 'waltz', lead: 'xylo', seed: 33, bpb: 3 },
  w1: { tempo: 168, key: 62, mode: 'maj', form: 'rag', style: 'stride', lead: 'clar', seed: 41 },
  w2: { tempo: 196, key: 60, mode: 'maj', form: 'blues', style: 'hot', lead: 'brass', seed: 52 },
  w3: { tempo: 148, key: 57, mode: 'min', form: 'minor', style: 'swing', lead: 'sax', seed: 63 },
  w4: { tempo: 124, key: 58, mode: 'maj', form: 'rag', style: 'march', lead: 'brass', seed: 74 },
  w5: { tempo: 136, key: 55, mode: 'min', form: 'minor', style: 'spooky', lead: 'xylo', seed: 85 },
  bee: { tempo: 190, key: 63, mode: 'maj', form: 'rag', style: 'hot', lead: 'clar', seed: 101 },
  magic: { tempo: 172, key: 62, mode: 'min', form: 'minor', style: 'swing', lead: 'clar', seed: 202 },
  slot: { tempo: 206, key: 60, mode: 'maj', form: 'blues', style: 'hot', lead: 'brass', seed: 303 },
  pirate: { tempo: 148, key: 57, mode: 'min', form: 'minor', style: 'march', lead: 'brass', seed: 404 },
  deep: { tempo: 128, key: 55, mode: 'min', form: 'minor', style: 'swing', lead: 'sax', seed: 505 },
  doc: { tempo: 186, key: 58, mode: 'maj', form: 'rag', style: 'stride', lead: 'brass', seed: 606 },
  wyrm: { tempo: 198, key: 61, mode: 'min', form: 'minor', style: 'hot', lead: 'brass', seed: 707 },
  gloom: { tempo: 156, key: 53, mode: 'min', form: 'minor', style: 'spooky', lead: 'organ', seed: 808 },
  ending: { tempo: 116, key: 60, mode: 'maj', form: 'rag', style: 'swing', lead: 'clar', seed: 909 }
};
const RHY4 = [[2, 0, 1, 1, 2, 0, 2, 0], [1, 1, 1, 1, 2, 0, 2, 0], [3, 0, 0, 1, 2, 0, 2, 0], [2, 0, 2, 0, 1, 1, 2, 0], [1, 1, 2, 0, 1, 1, 2, 0], [0, 1, 1, 1, 0, 1, 2, 0], [2, 0, 0, 1, 0, 1, 2, 0], [1, 1, 1, 1, 1, 1, 2, 0], [0, 2, 0, 1, 1, 0, 2, 0], [3, 0, 0, 3, 0, 0, 2, 0]];
const RHY3 = [[2, 0, 2, 0, 2, 0], [1, 1, 2, 0, 2, 0], [4, 0, 0, 0, 2, 0], [2, 0, 1, 1, 2, 0], [0, 2, 0, 2, 2, 0]];

function genMelody(song) {
  const R = mulberry32(song.seed), bpb = song.bpb || 4, spb = bpb * 2;
  const scale = song.mode === 'min' ? [0, 2, 3, 5, 7, 8, 11] : [0, 2, 4, 5, 7, 9, 11];
  const lo = -3, hi = 19; const tones = []; for (let v = lo; v <= hi; v++) if (scale.includes(((v % 12) + 12) % 12)) tones.push(v);
  const F = FORMS[song.form], RH = bpb === 3 ? RHY3 : RHY4;
  let cur = 7;
  const chordTone = (root, q, near) => { const pcs = QUAL[q].map(x => (root + x) % 12); let best = cur, bd = 99; for (let v = lo; v <= hi; v++) if (pcs.includes(((v % 12) + 12) % 12)) { const d = Math.abs(v - near) + R() * 1.5; if (d < bd) { bd = d; best = v; } } return best; };
  const stepScale = (n) => { let i = tones.indexOf(cur); if (i < 0) i = tones.findIndex(v => v >= cur); i = clamp(i + n, 0, tones.length - 1); return tones[i]; };
  const section = chords => {
    const bars = []; const rhy = [];
    for (let b = 0; b < 8; b++) {
      let r = b < 4 ? RH[Math.floor(R() * RH.length)] : rhy[b - 4];
      if (b === 7) r = bpb === 3 ? [6, 0, 0, 0, 0, 0] : [4, 0, 0, 0, 2, 0, 0, 0];
      if (b === 3 && R() < .5) r = bpb === 3 ? [4, 0, 0, 0, 2, 0] : [2, 0, 1, 1, 4, 0, 0, 0];
      rhy.push(r);
      const [root, q] = chords[b]; const ev = [];
      for (let s = 0; s < spb; s++) {
        if (!r[s]) continue;
        if (b === 7 && s === 0) cur = chordTone(root, q, R() < .5 ? 0 : 12);
        else if (s % 4 === 0) cur = chordTone(root, q, cur + Math.floor(R() * 7) - 3);
        else { const mv = [-2, -1, -1, 1, 1, 2, 3, -3][Math.floor(R() * 8)]; cur = stepScale(mv); if (cur > 15 && R() < .5) cur = stepScale(-3); if (cur < 2 && R() < .5) cur = stepScale(3); }
        ev.push({ s, m: cur, d: r[s] });
      }
      bars.push(ev);
    }
    return bars;
  };
  const A = section(F.A), B = section(F.B);
  const A2 = A.map((b, i) => i < 6 ? b : section(F.A)[i]);
  return { bars: [...A, ...A2, ...B, ...A], chords: [...F.A, ...F.A, ...F.B, ...F.A] };
}

const Music = {
  song: null, id: null, mel: null, step: 0, next: 0, phase: 0, pend: null, vol: 1, out: null, fillNext: false,
  PH: [{ tm: 1, tr: 0 }, { tm: 1.04, tr: 0 }, { tm: 1.09, tr: 2 }, { tm: 1.16, tr: 3 }],
  play(id, phase = 0) {
    if (!AudioSys.ok) { this.wantId = id; this.wantPhase = phase; return; }
    if (this.id === id && this.out) { this.setPhase(phase); return; }
    this.stop(.25);
    const s = SONGS[id]; if (!s) return;
    this.id = id; this.song = s; this.mel = genMelody(s); this.step = 0; this.phase = phase; this.pend = null;
    this.out = AudioSys.ac.createGain(); this.out.gain.value = .0001; this.out.gain.linearRampToValueAtTime(1, AudioSys.t + .3); this.out.connect(AudioSys.mus);
    this.next = AudioSys.t + .08;
  },
  stop(fade = .3) {
    if (this.out) { const o = this.out, t = AudioSys.t; o.gain.cancelScheduledValues(t); o.gain.setValueAtTime(o.gain.value, t); o.gain.linearRampToValueAtTime(.0001, t + fade); setTimeout(() => { try { o.disconnect(); } catch (e) { } }, fade * 1000 + 600); }
    this.out = null; this.id = null; this.song = null; this.wantId = null;
  },
  duck(v = .35, t = .5) { if (!this.out) return; const g = this.out.gain, n = AudioSys.t; g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(v, n + .05); g.linearRampToValueAtTime(1, n + t); },
  setPhase(p) { if (p !== this.phase) { this.pend = p; this.fillNext = true; } },
  update() {
    if (!AudioSys.ok) return;
    if (this.wantId && !this.out) { const w = this.wantId; this.wantId = null; this.play(w, this.wantPhase || 0); }
    if (!this.out || !this.song) return;
    const now = AudioSys.t;
    if (this.next < now - .05) this.next = now + .05;
    let guard = 0;
    while (this.next < now + .14 && guard++ < 16) this.sched();
  },
  sched() {
    const s = this.song, bpb = s.bpb || 4, spb = bpb * 2;
    const sIn = this.step % spb, barIdx = Math.floor(this.step / spb) % 32;
    if (sIn === 0 && this.pend != null) { this.phase = this.pend; this.pend = null; }
    const ph = this.PH[Math.min(3, this.phase)], P = this.phase;
    const bd = 60 / (s.tempo * ph.tm), swing = s.style === 'march' ? .5 : .62;
    const t = this.next, dur = (sIn % 2 === 0) ? bd * swing : bd * (1 - swing);
    this.next += dur;
    this.step++;
    const o = this.out, key = s.key + ph.tr;
    const [root, q] = this.mel.chords[barIdx]; const ch = QUAL[q];
    const beat = sIn >> 1, off = sIn & 1, st = s.style;
    const I = Inst;
    // ---- drums ----
    if (st === 'stride' || st === 'hot') {
      if (!off && (beat % 2 === 0 || (st === 'hot' && P >= 1))) I.kick(t, .7, o);
      if (!off && beat % 2 === 1) I.snare(t, P >= 2 ? .9 : .7, o, P < 2);
      if (off && P >= 1) I.hat(t, .7, o); if (!off && P >= 1) I.ride(t, .6, o);
      if (P >= 3) { if (off) I.snare(t, .25, o, true); if (sIn === 0) I.crash(t, .5, o); }
    } else if (st === 'swing') {
      if (!off) { I.ride(t, .8, o); I.kick(t, .25, o); } if (off && (beat === 1 || beat === 3)) I.ride(t, .5, o);
      if (!off && beat % 2 === 1) I.hat(t, .9, o);
      if (P >= 1 && off && Math.random() < .3) I.snare(t, .5, o, true);
      if (P >= 2 && !off && beat % 2 === 1) I.snare(t, .7, o, false);
      if (P >= 3 && sIn === 0) I.crash(t, .45, o);
    } else if (st === 'march') {
      if (!off && beat % 2 === 0) I.kick(t, .8, o);
      if (off || (P >= 1 && Math.random() < .25)) I.snare(t, .45, o, false);
      if (!off && beat % 2 === 1 && P >= 1) I.crash(t, .2, o);
      if (P >= 3 && !off) I.tom(t, .4, o, 90 + beat * 15);
    } else if (st === 'waltz') {
      if (sIn === 0) I.kick(t, .5, o); else if (!off) I.hat(t, .7, o, true);
    } else if (st === 'spooky') {
      if (!off) I.wood(t, .55, o, beat % 2 === 0);
      if (sIn === 0) I.kick(t, .7, o); if (!off && beat === 2) I.tom(t, .6, o, 80);
      if (P >= 1 && !off && beat % 2 === 1) I.snare(t, .5, o, true);
      if (P >= 2 && off) I.hat(t, .6, o);
      if (P >= 3) { if (!off) I.kick(t, .5, o); if (sIn === 0) I.crash(t, .5, o); }
    }
    if (this.fillNext && sIn >= spb - 4) { I.snare(t, .8, o, false); if (sIn === spb - 1) { this.fillNext = false; } }
    // ---- bass / comping ----
    const bassRoot = key - 24 + root;
    const chordNotes = (base) => ch.map(x => base + ((root + x) % 12));
    if (st === 'stride' || st === 'hot') {
      if (!off && beat % 2 === 0) I.piano(t, bassRoot + (beat === 2 ? 7 : 0) + 12, bd * .8, .55, o);
      if (!off && beat % 2 === 1) for (const n of chordNotes(key - 2)) I.piano(t, n, bd * .5, .3, o);
      if (P >= 1 && !off) I.bass(t, bassRoot + [0, 4, 7, 9][beat % 4] - (q.startsWith('m') && beat === 1 ? 1 : 0), bd, .7, o);
      if (st === 'hot' && !off && beat % 2 === 1) for (const n of chordNotes(key + 2)) I.banjo(t, n, .1, .6, o);
    } else if (st === 'swing') {
      if (!off) { const nextRoot = this.mel.chords[(barIdx + 1) % 32][0]; const walk = [0, ch[1], ch[2], ((nextRoot - root + 13) % 12) - 1]; I.bass(t, bassRoot + walk[beat % 4], bd * .9, .75, o); }
      if ((sIn === 3 && Math.random() < .8) || (sIn === 6 && Math.random() < .6) || (P >= 1 && sIn === 0)) for (const n of chordNotes(key - 2)) I.piano(t, n, bd * .35, .22, o);
    } else if (st === 'march') {
      if (!off && beat % 2 === 0) I.tuba(t, bassRoot + (beat === 2 ? 7 : 0), bd * .7, .7, o);
      if (!off && beat % 2 === 1) for (const n of chordNotes(key - 2)) I.brass(t, n, bd * .3, .25, o, false);
    } else if (st === 'waltz') {
      if (sIn === 0) I.bass(t, bassRoot, bd, .6, o);
      if (!off && beat > 0) for (const n of chordNotes(key - 2)) I.piano(t, n, bd * .4, .2, o);
    } else if (st === 'spooky') {
      if (sIn === 0) for (const n of chordNotes(key - 2)) I.organ(t, n, bd * bpb * .95, .8, o);
      if (!off && beat % 2 === 0) I.bass(t, bassRoot + (beat ? 12 : 0), bd, .7, o);
      if (P >= 1 && off) I.xylo(t, key + 12 + ch[beat % ch.length] + root, .1, .25, o);
    }
    // ---- melody ----
    const bar = this.mel.bars[barIdx];
    for (const e of bar) if (e.s === sIn) {
      const m = key + 12 + e.m, d = e.d * bd * .5 * .95, lead = (P >= 1 && s.lead === 'clar' && st !== 'swing') ? 'brass' : s.lead;
      const v = .8;
      if (lead === 'piano') I.piano(t, m, d, .5, o); else if (lead === 'brass') I.brass(t, m, d, v, o, true);
      else if (lead === 'clar') I.clar(t, m, d, v, o); else if (lead === 'sax') I.sax(t, m, d, v, o);
      else if (lead === 'xylo') I.xylo(t, m, d, .7, o); else if (lead === 'organ') I.organ(t, m, d, 1.3, o);
      if (P >= 2) I.clar(t, m + 12, d, .35, o);
      if (P >= 1 && lead !== 'xylo' && Math.random() < .15) I.xylo(t, m + 12, d, .3, o);
    }
    // stabs in late phases
    if (P >= 3 && !off && beat % 2 === 1) for (const n of chordNotes(key + 2)) I.brass(t, n, bd * .25, .32, o, false);
  },
  jingle(name) {
    if (!AudioSys.ok) return;
    const t0 = AudioSys.t + .02, o = AudioSys.mus, I = Inst;
    const seq = (inst, notes, step, v = .9, start = 0) => notes.forEach((n, i) => { if (n != null) I[inst](t0 + start + i * step, n, step * .9, v, o); });
    if (name === 'ko') { I.crash(t0, 1, o); I.kick(t0, 1, o); seq('brass', [70, 74, 77, 82], .09, 1); [70, 74, 77, 82].forEach(n => I.brass(t0 + .45, n, 1.1, .8, o, false)); I.snare(t0 + .4, 1, o, false); I.crash(t0 + .45, .8, o); }
    else if (name === 'win') { seq('clar', [72, 76, 79, 84, 79, 84], .12, .9); [60, 64, 67, 72].forEach(n => I.piano(t0 + .72, n, .9, .6, o)); I.crash(t0 + .72, .5, o); }
    else if (name === 'death') { [[62, .45], [61, .45], [60, .45], [59, 1.3]].reduce((tt, [n, d]) => { I.brass(tt, n - 12, d, 1.1, o, true); return tt + d * .95; }, t0 + .1); }
    else if (name === 'phase') { I.crash(t0, .7, o); seq('brass', [65, 68, 71, 74], .06, .7); I.tom(t0 + .25, .8, o, 70); }
    else if (name === 'ready') { for (let i = 0; i < 10; i++) I.snare(t0 + i * .05, .3 + i * .05, o, false); I.crash(t0 + .55, .6, o); I.kick(t0 + .55, .8, o); }
    else if (name === 'unlock') { seq('xylo', [72, 76, 79, 84, 88], .08, .8); }
    else if (name === 'grade') { I.crash(t0, .6, o); seq('brass', [67, 72], .1, .8); }
  }
};

// ---------- sound effects ----------
const Sfx = {
  last: {},
  ok(name, gap) { const t = performance.now(); if (this.last[name] && t - this.last[name] < gap) return false; this.last[name] = t; return AudioSys.ok; },
  tone(type, f0, f1, dur, vol, o = {}) {
    const ac = AudioSys.ac, t = AudioSys.t + (o.delay || 0), osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    let dst = AudioSys.sfx;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.connect(dst); dst = f; }
    osc.connect(g); g.connect(dst); osc.start(t); osc.stop(t + dur + .02);
    if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibD || 40; l.connect(lg); lg.connect(osc.detune); l.start(t); l.stop(t + dur); }
    return osc;
  },
  noise(dur, vol, type = 'bandpass', f0 = 1000, f1, q = 1, delay = 0) { Inst.noiseHit(AudioSys.t + delay, vol, AudioSys.sfx, type, f0, q, dur, f1); },
  shoot(kind) {
    if (!this.ok('shoot', 55)) return;
    if (kind === 'spark') { this.tone('square', 1400, 500, .06, .07); this.noise(.04, .1, 'highpass', 3000); }
    else if (kind === 'spread') { this.tone('triangle', 880, 660, .08, .1); this.tone('triangle', 1320, 990, .06, .05); }
    else if (kind === 'chaser') { this.tone('sine', 900, 1800, .07, .09); }
    else if (kind === 'charge') { this.tone('square', 600, 300, .07, .07); }
    else if (kind === 'bomb') { this.tone('sine', 300, 120, .12, .2); this.noise(.08, .15, 'lowpass', 900); }
  },
  bigShot() { if (!AudioSys.ok) return; this.tone('sawtooth', 220, 60, .35, .25, { lp: 1500 }); this.noise(.3, .3, 'lowpass', 2000, 200); },
  chargeHum(k) { if (!this.ok('charge', 90)) return; this.tone('sine', 300 + k * 700, 320 + k * 720, .1, .04 + k * .04); },
  jump() { if (!AudioSys.ok) return; this.tone('sine', 380, 820, .14, .12, { vib: 18, vibD: 30 }); },
  djump() { if (!AudioSys.ok) return; this.tone('sine', 560, 1180, .13, .1, { vib: 20, vibD: 30 }); },
  land() { if (!this.ok('land', 80)) return; this.noise(.06, .12, 'lowpass', 500); },
  dash() { if (!AudioSys.ok) return; this.noise(.2, .22, 'bandpass', 600, 3000, 1.2); },
  parry() { if (!AudioSys.ok) return; this.tone('sine', 1568, 1568, .5, .22); this.tone('sine', 2349, 2349, .4, .12); this.tone('triangle', 3136, 3136, .25, .06); this.noise(.05, .2, 'highpass', 5000); },
  hurt() { if (!AudioSys.ok) return; this.tone('square', 520, 140, .3, .12, { lp: 1800 }); this.noise(.12, .25, 'bandpass', 1200); },
  hit(k) { if (!this.ok('hit', 65)) return; const f = { spark: 300, note: 420, star: 520, chargeS: 260, chargeL: 160, bomb: 120, sparkEX: 180, noteEX: 380, starEX: 480, bombEX: 100, ghost: 140 }[k] || 240; this.tone('triangle', f * rnd(.92, 1.08), f * .55, .06, .07); this.noise(.03, .05, 'highpass', 2500); },
  pop() { if (!this.ok('pop', 40)) return; this.tone('sine', 700, 120, .12, .2); this.noise(.07, .2, 'bandpass', 1500); },
  boom(s = 1) { if (!this.ok('boom', 60)) return; this.noise(.45 * s + .1, .45, 'lowpass', 1800, 120, .8); this.tone('sine', 110, 35, .4, .4); },
  coin() { if (!AudioSys.ok) return; this.tone('square', 1976, 1976, .07, .06); this.tone('square', 2637, 2637, .25, .06, { delay: .07 }); },
  menu() { if (!AudioSys.ok) return; Inst.wood(AudioSys.t, .7, AudioSys.sfx, true); },
  select() { if (!AudioSys.ok) return; Inst.xylo(AudioSys.t, 84, .1, .9, AudioSys.sfx); Inst.xylo(AudioSys.t + .07, 91, .1, .8, AudioSys.sfx); },
  back() { if (!AudioSys.ok) return; Inst.wood(AudioSys.t, .7, AudioSys.sfx, false); },
  buy() { if (!AudioSys.ok) return; this.tone('square', 1046, 1046, .08, .07); this.tone('square', 1318, 1318, .08, .07, { delay: .08 }); this.tone('square', 2093, 2093, .3, .07, { delay: .16 }); this.noise(.2, .15, 'highpass', 6000, null, 1, .16); },
  deny() { if (!AudioSys.ok) return; this.tone('square', 200, 160, .25, .1, { lp: 900 }); },
  ex() { if (!AudioSys.ok) return; this.tone('sawtooth', 300, 900, .2, .12, { lp: 2500 }); this.noise(.25, .25, 'bandpass', 800, 4000); },
  super() { if (!AudioSys.ok) return; this.tone('sawtooth', 120, 600, .7, .2, { lp: 2000 }); this.noise(.8, .3, 'bandpass', 300, 5000, .8); Inst.crash(AudioSys.t + .2, .8, AudioSys.sfx); },
  warn() { if (!this.ok('warn', 120)) return; this.tone('square', 880, 880, .07, .05); this.tone('square', 660, 660, .07, .05, { delay: .09 }); },
  zap() { if (!this.ok('zap', 80)) return; this.noise(.3, .3, 'bandpass', 3000, 800, 2); this.tone('sawtooth', 80, 60, .3, .12); },
  whoosh() { if (!this.ok('whoosh', 100)) return; this.noise(.35, .18, 'bandpass', 300, 1800, 1.5); },
  splash() { if (!this.ok('splash', 90)) return; this.noise(.3, .25, 'bandpass', 1800, 400, .7); },
  bell() { if (!this.ok('bell', 90)) return; [523, 1046, 1568].forEach((f, i) => this.tone('sine', f, f, 1.2, .12 / (i + 1))); },
  laugh(p = 1) { if (!AudioSys.ok) return; Voice.laugh(p); },
  slide() { if (!AudioSys.ok) return; this.tone('sine', 900, 300, .3, .12, { vib: 9, vibD: 20 }); },
  thud() { if (!this.ok('thud', 60)) return; this.tone('sine', 90, 40, .25, .35); this.noise(.15, .2, 'lowpass', 400); },
  reel() { if (!AudioSys.ok) return; Music.jingle('unlock'); }
};

// ---------- voices ----------
const VOWELS = [[800, 1200], [400, 2000], [300, 2300], [500, 900], [350, 800], [650, 1700]];
const Voice = {
  babble(n = 3, pitch = 200, o = {}) {
    if (!AudioSys.ok) return; const ac = AudioSys.ac; let t = AudioSys.t + (o.delay || 0);
    for (let i = 0; i < n; i++) {
      const d = (o.syl || .11) * rnd(.8, 1.3), f = pitch * rnd(.85, 1.25) * (o.rise ? 1 + i * .08 : 1);
      const src = ac.createOscillator(); src.type = o.type || 'sawtooth'; src.frequency.setValueAtTime(f, t); src.frequency.linearRampToValueAtTime(f * (o.bend || .9), t + d);
      const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(o.vol || .16, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      const v = o.vowel != null ? VOWELS[o.vowel] : pick(VOWELS);
      for (const [fq, a] of [[v[0], 1], [v[1], .6]]) { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fq * (o.formant || 1); b.Q.value = 7; const bg = ac.createGain(); bg.gain.value = a * 3; src.connect(b); b.connect(bg); bg.connect(g); }
      g.connect(AudioSys.sfx); src.start(t); src.stop(t + d + .02); t += d + .015;
    }
  },
  laugh(p = 1) { this.babble(5, 180 * p, { syl: .09, vowel: 0, bend: .7, vol: .14 }); },
  hurt(p = 1) { this.babble(1, 330 * p, { syl: .16, vowel: 3, bend: .6, vol: .12 }); },
  yahoo(p = 1) { this.babble(1, 300 * p, { syl: .12, vowel: 0, bend: 1.3, vol: .12 }); this.babble(1, 420 * p, { syl: .3, vowel: 4, bend: .8, vol: .12, delay: .14 }); },
  ohno(p = 1) { this.babble(2, 280 * p, { syl: .2, vowel: 3, bend: .7, vol: .12 }); },
  say(textStr) {
    if (!Settings.d.announcer) return;
    try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(textStr); u.pitch = .55; u.rate = .92; u.volume = Settings.d.master * Settings.d.sfx; const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); const pref = vs.find(v => /daniel|george|male|david|fred|ralph/i.test(v.name)) || vs[0]; if (pref) u.voice = pref; speechSynthesis.speak(u); } catch (e) { }
  }
};
