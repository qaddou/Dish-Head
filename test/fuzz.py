import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
JS = """(a) => {
  const [kind, id, phase, diff, coop, secs] = a; const errs = [];
  let st;
  try { st = new LO.Stage(kind==='boss' ? {type:'boss', id, diff, startPhase: phase, coop, practice:true} : {type:'level', id, diff:'normal', coop, practice:true}); LO.setScene(st); } catch(e) { return ['ctor', String(e), e.stack]; }
  const I = LO.Input; const keys = ['KeyX','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ','KeyC','KeyV','KeyQ','ShiftRight','KeyF','KeyG','KeyH','KeyT','KeyA','KeyD','KeyW','KeyK','KeyL','Semicolon','KeyO'];
  let held = new Set(['KeyX']); let deaths = 0;
  for (let i = 0; i < secs * 60; i++) {
    if (i % 9 === 0) { held = new Set(['KeyX', 'KeyG', 'KeyL']); for (const k of keys) if (Math.random() < .18) held.add(k); if (kind==='level' && Math.random()<.7) { held.add('ArrowRight'); held.add('KeyD'); } }
    I.keys.clear(); for (const k of held) I.keys.add(k);
    try { tick(1/60); if (i % 2 === 0) { render(); } } catch (e) { errs.push(String(e) + ' @' + (e.stack||'').split('\\n')[1]); if (errs.length > 3) break; }
    if (LO.scene !== st) break;
    if (st.deathMenu) { deaths++; for (const p of st.players) { p.dead=false; p.hp=3; p.ghost=null; } st.deathMenu=null; st.state='play'; Music.play && 0; }
    if (st.pauseMenu) st.pauseMenu = null;
  }
  return {id, phase, diff, coop, errs, deaths, bossHp: st.boss ? Math.round(st.boss.hp) : null, state: st.state, hostile: st.hostile.length, fx: 0};
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('PAGEERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        bosses = ['bee','magic','slot','pirate','deep','doc','wyrm','gloom']
        for bid in bosses:
            for ph in (0, 3):
                for diff, coop in (('expert', False), ('easy', True)):
                    r = await pg.evaluate(JS, ['boss', bid, ph, diff, coop, 15])
                    if isinstance(r, list) or r['errs']: print(r)
            print('ok', bid)
        for lid in ['hayride','midway','coral','foundry','hollow']:
            for coop in (False, True):
                r = await pg.evaluate(JS, ['level', lid, 0, 'normal', coop, 40])
                if isinstance(r, list) or r['errs']: print(r)
                else: print('ok', lid, coop, r['state'])
        await b.close()
asyncio.run(main())
