import asyncio, os
from playwright.async_api import async_playwright
JS = """() => { const st = new LO.Stage({type:'boss',id:'bee',diff:'normal',practice:true}); LO.setScene(st);
 const I=LO.Input, p=st.players[0]; const step=(k,n)=>{for(let i=0;i<n;i++){I.keys.clear(); for(const x of k) I.keys.add(x); tick(1/60);}};
 step([],200); step(['KeyJ'],20); st.bullet({x:p.x, y:p.cy-10, r:12, pink:true}); step(['KeyJ'],5);
 return {parries: st.stats.parries, hp: p.hp}; }"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = await b.new_page()
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto('file://' + os.path.abspath('dist/index.html')); await pg.wait_for_timeout(800)
        print(await pg.evaluate(JS)); await b.close()
asyncio.run(main())
