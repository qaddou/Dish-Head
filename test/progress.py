import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('PAGEERR', e))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        async def k(key, ms=500): await pg.keyboard.press(key); await pg.wait_for_timeout(ms)
        await k('Enter', 1000); await k('Enter', 600)            # main -> play submenu
        await k('Enter', 1000)              # NEW GAME
        print('scene', await pg.evaluate("LO.scene.constructor.name"))
        await k('Escape', 1200)                                    # skip story
        print('scene', await pg.evaluate("LO.scene.constructor.name"), await pg.evaluate("LO.Save.d.started"))
        await k('Enter', 600)                                      # boss node -> difficulty menu
        await k('Enter', 5500)                                     # NORMAL
        print('scene', await pg.evaluate("LO.scene.constructor.name+' '+LO.scene.cfg.id+' '+LO.scene.diff"))
        await pg.evaluate("(()=>{const b=LO.scene.boss; b.hp=1; b.damage(5);})()"); await pg.wait_for_timeout(6500)
        print('scene', await pg.evaluate("LO.scene.constructor.name"))
        await k('Enter', 300); await k('Enter', 1500)
        print('scene', await pg.evaluate("LO.scene.constructor.name+' world '+(LO.scene.w+1)"), 'coins', await pg.evaluate("LO.Save.d.coins"), 'worlds', await pg.evaluate("LO.Save.d.worlds"), 'supers', await pg.evaluate("JSON.stringify(LO.Save.d.owned.supers)"))
        await pg.screenshot(path='test/shots/p_notice.png')
        await k('Enter', 600); await pg.screenshot(path='test/shots/p_notice2.png'); await k('Enter', 600)
        await pg.screenshot(path='test/shots/p_map_w2.png')
        stored = await pg.evaluate("localStorage.getItem('lightsout_save_v1')")
        print('saved bytes', len(stored or ''))
        await b.close()
asyncio.run(main())
