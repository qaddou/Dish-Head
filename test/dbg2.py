import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.evaluate("LO.Save.reset(); LO.setScene(new LO.Stage({type:'level',id:'hollow',diff:'normal',practice:false,inf:true}))")
        await pg.wait_for_timeout(2600)
        await pg.evaluate("(()=>{const s=LO.scene; s.camX=s.goal-500; s.bounds={l:s.camX,r:s.camX+960}; for(const p of s.players){p.x=s.goal-150; p.y=200;} })()")
        for i in range(6):
            print(await pg.evaluate("(()=>{const s=LO.scene,p=s.players[0];return [s.constructor.name, s.state, Math.round(p.x),Math.round(p.y),p.ground,Math.round(s.camX), JSON.stringify(s.bounds), p.victory]})()"))
            await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(400); await pg.keyboard.up('ArrowRight')
        await pg.wait_for_timeout(3500)
        print(await pg.evaluate("LO.scene.constructor.name"))
        await b.close()
asyncio.run(main())
