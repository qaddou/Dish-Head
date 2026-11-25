import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
JS = """() => {
  const st = new LO.Stage({type:'boss', id:'bee', diff:'normal', practice:true, inf:true});
  LO.setScene(st); const I = LO.Input; const out=[];
  for (let i=0;i<60*6;i++){ I.keys.clear(); I.keys.add('KeyX'); I.keys.add('ArrowUp'); I.keys.add('ArrowRight'); tick(1/60);
    if (i%60===0) { const p=st.players[0]; out.push([i, st.state, st.boss.vul, Math.round(st.boss.hp), st.pshots.length, p.aim.x.toFixed(2)+','+p.aim.y.toFixed(2), Math.round(p.x), p.fireCd.toFixed(2), st.targets().length]); } }
  return out; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        for r in await pg.evaluate(JS): print(r)
        await b.close()
asyncio.run(main())
