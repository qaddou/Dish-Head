import asyncio, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
OUT='test/shots'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1200)
        # parry
        await pg.evaluate("LO.setScene(new LO.Stage({type:'boss',id:'bee',diff:'normal',practice:true}))")
        await pg.wait_for_timeout(3000)
        await pg.keyboard.down('KeyZ'); await pg.wait_for_timeout(120); await pg.keyboard.up('KeyZ'); await pg.wait_for_timeout(60)
        await pg.evaluate("(()=>{const s=LO.scene,p=s.players[0]; s.bullet({x:p.x, y:p.cy-6, r:12, pink:true, vx:0, vy:0});})()")
        await pg.keyboard.press('KeyZ'); await pg.wait_for_timeout(300)
        print('parries', await pg.evaluate("LO.scene.stats.parries"), 'meter', await pg.evaluate("LO.scene.players[0].meter.toFixed(2)"))
        # EX
        await pg.evaluate("LO.scene.players[0].meter=1.2"); await pg.wait_for_timeout(500)
        await pg.keyboard.press('KeyV'); await pg.wait_for_timeout(200)
        print('cards used', await pg.evaluate("LO.scene.stats.cards"))
        # pause
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT+'/f_pause.png')
        print('paused', await pg.evaluate("!!LO.scene.pauseMenu"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        print('unpaused', await pg.evaluate("!LO.scene.pauseMenu"))
        # death
        await pg.evaluate("(()=>{const p=LO.scene.players[0]; p.hp=1; p.inv=0; p.hurt();})()")
        await pg.wait_for_timeout(3600); await pg.screenshot(path=OUT+'/f_death.png')
        print('deathMenu', await pg.evaluate("!!LO.scene.deathMenu"))
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
        print('retried', await pg.evaluate("LO.scene.constructor.name+' '+LO.scene.state"))
        # coop
        await pg.evaluate("LO.setScene(new LO.Stage({type:'boss',id:'slot',diff:'normal',practice:true,coop:true,inf:true}))")
        await pg.wait_for_timeout(2900)
        await pg.keyboard.down('KeyG'); await pg.keyboard.down('KeyL'); await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(900)
        await pg.keyboard.up('ArrowRight'); await pg.keyboard.press('KeyK'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT+'/f_coop.png')
        await pg.keyboard.up('KeyG'); await pg.keyboard.up('KeyL')
        print('coop players', await pg.evaluate("LO.scene.players.map(p=>Math.round(p.x)+','+Math.round(p.y)).join(' | ')"))
        # coop death + revive
        await pg.evaluate("(()=>{const s=LO.scene; s.cfg.inf=false; const p=s.players[1]; p.hp=1; p.inv=0; p.hurt();})()"); await pg.wait_for_timeout(500)
        g = await pg.evaluate("JSON.stringify(LO.scene.players[1].ghost)")
        print('ghost', g)
        await pg.evaluate("(()=>{const s=LO.scene,a=s.players[0],g=s.players[1].ghost; a.x=g.x; a.y=g.y+34+20; a.ground=false; a.vy=0; a.parryT=.2;})()"); await pg.wait_for_timeout(100)
        print('revived', await pg.evaluate("!LO.scene.players[1].dead"))
        # touch
        ctx2 = await b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True)
        pm = await ctx2.new_page(); pm.on('pageerror', lambda e: errs.append(str(e)))
        await pm.goto(URL); await pm.wait_for_timeout(800)
        await pm.tap('canvas', position={'x':420,'y':200}); await pm.wait_for_timeout(1200)
        await pm.screenshot(path=OUT+'/f_touch_menu.png')
        await pm.evaluate("LO.setScene(new LO.Stage({type:'boss',id:'bee',diff:'easy',practice:true}))"); await pm.wait_for_timeout(2500)
        await pm.screenshot(path=OUT+'/f_touch_game.png')
        print('errors', errs[:5], len(errs))
        await b.close()
asyncio.run(main())
