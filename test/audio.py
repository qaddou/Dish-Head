import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('ERR', e))
        pg.on('console', lambda m: print('CONSOLE', m.type, m.text) if m.type=='error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.keyboard.press('KeyA'); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("[LO.AudioSys.ok, LO.AudioSys.ac && LO.AudioSys.ac.state, LO.Music.id, LO.Music.step]"))
        await pg.evaluate("LO.setScene(new LO.Stage({type:'boss',id:'gloom',diff:'normal',practice:true,inf:true}))"); await pg.wait_for_timeout(3000)
        print(await pg.evaluate("[LO.Music.id, LO.Music.step, LO.Music.phase]"))
        await pg.evaluate("(()=>{const b=LO.scene.boss; b.hp=b.maxHp*.6;})()"); await pg.wait_for_timeout(4000)
        print('after phase change', await pg.evaluate("[LO.Music.id, LO.Music.step, LO.Music.phase, LO.scene.boss.phase]"))
        await b.close()
asyncio.run(main())
