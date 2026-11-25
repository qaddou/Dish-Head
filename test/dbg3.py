import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.evaluate("LO.setScene(new LO.Stage({type:'boss',id:'slot',diff:'normal',practice:true,coop:true}))")
        await pg.wait_for_timeout(2900)
        await pg.evaluate("(()=>{const s=LO.scene; const p=s.players[1]; p.hp=1; p.inv=0; p.hurt();})()"); await pg.wait_for_timeout(500)
        for i in range(5):
            print(await pg.evaluate("(()=>{const s=LO.scene,a=s.players[0],d=s.players[1]; return [s.state, a.dead, Math.round(a.x),Math.round(a.cy), a.parryT.toFixed(2), d.dead, d.ghost&&Math.round(d.ghost.x), d.ghost&&Math.round(d.ghost.y+34)]})()"))
            if i==1: await pg.evaluate("(()=>{const s=LO.scene,a=s.players[0],g=s.players[1].ghost; a.x=g.x; a.y=g.y+34+23; a.vy=-100; a.parryT=.3;})()")
            await pg.wait_for_timeout(50)
        await b.close()
asyncio.run(main())
