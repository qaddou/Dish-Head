import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
JS = """() => {
  const st = new LO.Stage({type:'boss', id:'slot', diff:'normal', practice:true, coop:true}); LO.setScene(st);
  const I = LO.Input; const step = (keys, n) => { for (let i=0;i<n;i++){ I.keys.clear(); for (const k of keys) I.keys.add(k); tick(1/60);} };
  step([], 200);
  const a = st.players[0], d = st.players[1]; d.hp = 1; d.inv = 0; d.hurt();
  step([], 30);
  d.ghost.x = a.x; d.ghost.y = a.cy - 150;
  step(['KeyF'], 14); step([], 1); step(['KeyF'], 2); step([], 20);
  const parryTest = {};
  // parry a pink bullet deterministically
  step([], 60);
  step(['KeyF'], 2); step([], 10);
  st.bullet({x: a.x, y: a.cy - 40, r: 12, pink: true});
  step(['KeyF'], 2); step([], 10);
  return {revived: !d.dead, dHp: d.hp, parries: st.stats.parries, meter: a.meter.toFixed(2), aHp: a.hp};
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        print(await pg.evaluate(JS))
        await b.close()
asyncio.run(main())
