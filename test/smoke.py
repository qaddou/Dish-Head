import asyncio, sys, os, json
from playwright.async_api import async_playwright

URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'index.html'))
OUT = os.path.join(os.path.dirname(__file__), 'shots')
os.makedirs(OUT, exist_ok=True)

async def main(which):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.type + ' ' + m.text) if m.type in ('error', 'warning') else None)
        await pg.goto(URL)
        await pg.wait_for_timeout(1200)
        async def shot(name):
            await pg.screenshot(path=os.path.join(OUT, name + '.png'))
        async def hold(keys, ms):
            for k in keys: await pg.keyboard.down(k)
            await pg.wait_for_timeout(ms)
            for k in keys: await pg.keyboard.up(k)
        if 'menus' in which:
            await shot('00_title')
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1200); await shot('01_main')
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500); await shot('02_play')
            await pg.evaluate("LO.Save.reset(); LO.Save.d.coins=30; LO.Save.d.worlds=5; LO.setScene(new LO.MapScene(1))")
            await pg.wait_for_timeout(800); await shot('03_map')
            await pg.evaluate("LO.setScene(new LO.ShopScene(1))"); await pg.wait_for_timeout(900); await shot('04_shop')
            await pg.evaluate("LO.setScene(new LO.EquipScene(()=>new LO.MapScene()))"); await pg.wait_for_timeout(600); await shot('05_equip')
            await pg.evaluate("LO.setScene(new LO.SettingsScene(()=>new LO.MainMenu()))"); await pg.wait_for_timeout(600); await shot('06_settings')
            await pg.evaluate("LO.setScene(new LO.ControlsScene(()=>new LO.MainMenu()))"); await pg.wait_for_timeout(600); await shot('07_controls')
            await pg.evaluate("LO.setScene(new LO.PracticeScene())"); await pg.wait_for_timeout(900); await shot('08_practice')
            await pg.evaluate("LO.setScene(new LO.RushScene())"); await pg.wait_for_timeout(600); await shot('09_rush')
            await pg.evaluate("LO.setScene(new LO.StoryScene())"); await pg.wait_for_timeout(2500); await shot('10_story')
            await pg.evaluate("LO.setScene(new LO.ResultsScene({type:'boss',name:'Queen Buzzeline',diff:'normal',time:95,par:100,hp:2,parries:3,cards:4,hits:1,coins:0,grade:'A'},()=>new LO.MainMenu(),{msgs:['+2 COINS']}))"); await pg.wait_for_timeout(4500); await shot('11_results')
            await pg.evaluate("LO.setScene(new LO.CreditsScene(()=>new LO.MainMenu()))"); await pg.wait_for_timeout(1500); await shot('12_credits')
        for item in which:
            if item.startswith('boss:'):
                _, bid, ph = item.split(':')
                await pg.evaluate(f"LO.setScene(new LO.Stage({{type:'boss',id:'{bid}',diff:'normal',startPhase:{ph},practice:true,inf:true}}))")
                await pg.wait_for_timeout(600); await shot(f'b_{bid}_{ph}_intro')
                await pg.wait_for_timeout(2400)
                await hold(['KeyX'], 1500)
                await hold(['KeyX', 'ArrowRight'], 700)
                await pg.keyboard.press('KeyZ'); await pg.wait_for_timeout(150); await pg.keyboard.press('KeyZ')
                await hold(['KeyX', 'ArrowUp'], 1500)
                await shot(f'b_{bid}_{ph}_fight')
                await hold(['KeyX', 'ArrowLeft'], 1500)
                await shot(f'b_{bid}_{ph}_fight2')
            if item.startswith('kill:'):
                _, bid = item.split(':')
                await pg.evaluate(f"LO.setScene(new LO.Stage({{type:'boss',id:'{bid}',diff:'normal',practice:false,inf:true}}))")
                await pg.wait_for_timeout(3200)
                for ph in range(4):
                    await pg.evaluate("(()=>{const b=LO.scene.boss; const nx=b.def.phases[b.phase+1]; b.hp = nx ? b.maxHp*nx.at-1 : 0; if(!nx){b.hp=1; b.damage(5);} })()")
                    await pg.wait_for_timeout(2600)
                    await shot(f'k_{bid}_{ph}')
                await pg.wait_for_timeout(5000); await shot(f'k_{bid}_results')
            if item.startswith('level:'):
                _, lid = item.split(':')
                await pg.evaluate(f"LO.Save.reset(); LO.setScene(new LO.Stage({{type:'level',id:'{lid}',diff:'normal',practice:false,inf:true}}))")
                await pg.wait_for_timeout(2600)
                for i in range(6):
                    await hold(['ArrowRight', 'KeyX'], 900)
                    await pg.keyboard.down('KeyZ'); await pg.wait_for_timeout(200); await pg.keyboard.up('KeyZ')
                await shot(f'l_{lid}_a')
                await pg.evaluate("(()=>{const s=LO.scene; s.camX=s.lvl.len/2-300; s.bounds={l:s.camX,r:s.camX+960}; for(const p of s.players){p.x=s.lvl.len/2; p.y=200;} })()")
                await pg.wait_for_timeout(800); await shot(f'l_{lid}_b')
                await pg.evaluate("(()=>{const s=LO.scene; s.camX=s.goal-500; s.bounds={l:s.camX,r:s.camX+960}; for(const p of s.players){p.x=s.goal-150; p.y=200;} })()")
                await hold(['ArrowRight'], 1500); await pg.wait_for_timeout(3500); await shot(f'l_{lid}_end')
        perf = await pg.evaluate("LO.perf()")
        print('render ms avg', round(perf, 2))
        await b.close()
        seen = set()
        for e in errs:
            if e in seen: continue
            seen.add(e); print(e[:400])
        print('errors:', len(errs))

asyncio.run(main(sys.argv[1:]))
