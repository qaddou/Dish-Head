import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
SIM = """
(id) => {
  const st = new LO.Stage({type:'boss', id, diff:'normal', practice:true, inf:true});
  LO.setScene(st); st.enter && st.enter(); if (id==='pirate') { st.players[0].x = 400; }
  const I = LO.Input; let t = 0; const phaseT = [];
  let lastPh = 0;
  while (t < 420 && !(st.boss.dead)) {
    const p = st.players[0], b = st.boss;
    I.keys.clear();
    if (b.hurt.length) {
      const h = b.hurt[0]; const dx = h.x - p.x, dy = h.y - p.cy;
      if (st.mode === 'plane') { I.keys.add('KeyX'); if (dy < -15) I.keys.add('ArrowUp'); else if (dy > 15) I.keys.add('ArrowDown'); if (p.x > 300) I.keys.add('ArrowLeft'); }
      else {
        I.keys.add('KeyX');
        const ady = Math.abs(dy); let tx = ady < 50 ? Math.min(p.x, h.x - 200) : h.x - ady; tx = Math.max(60, Math.min(st.bounds.r - 40, tx));
        if (Math.abs(p.x - tx) > 14) I.keys.add(p.x < tx ? 'ArrowRight' : 'ArrowLeft');
        else { I.keys.add('ShiftRight'); I.keys.add('ArrowRight'); if (ady >= 50) I.keys.add(dy < 0 ? 'ArrowUp' : 'ArrowDown'); }
      }
    }
    tick(1/60); t += 1/60;
    if (b.phase !== lastPh) { phaseT.push(Math.round(t)); lastPh = b.phase; }
  }
  I.keys.clear();
  return {id, dead: st.boss.dead, time: Math.round(t), phases: phaseT, hpLeft: Math.round(st.boss.hp)};
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        for bid in sys.argv[1:]:
            r = await pg.evaluate(SIM, bid)
            print(r)
        await b.close()
asyncio.run(main())
