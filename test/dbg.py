import asyncio, sys, os, json
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.evaluate("LO.setScene(new LO.Stage({type:'level',id:'foundry',diff:'normal',practice:true,inf:true}))")
        await pg.wait_for_timeout(2600)
        for i in range(8):
            await pg.keyboard.down('ArrowRight'); await pg.keyboard.down('KeyX'); await pg.wait_for_timeout(900); await pg.keyboard.up('ArrowRight'); await pg.keyboard.up('KeyX')
            await pg.keyboard.down('KeyZ'); await pg.wait_for_timeout(200); await pg.keyboard.up('KeyZ')
            print(await pg.evaluate("(()=>{const s=LO.scene,p=s.players[0];return [Math.round(p.x),Math.round(p.y),p.ground,Math.round(s.camX),p.dead, p.inv.toFixed(2), JSON.stringify(p.safe)]})()"))
        await b.close()
asyncio.run(main())
