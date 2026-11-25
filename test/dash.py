import asyncio, os
from playwright.async_api import async_playwright
JS = """() => { const st = new LO.Stage({type:'boss',id:'bee',diff:'normal',practice:true,inf:true}); LO.setScene(st);
 const I=LO.Input, p=st.players[0]; const step=(k,n)=>{for(let i=0;i<n;i++){I.keys.clear(); for(const x of k) I.keys.add(x); tick(1/60);}};
 step([],10); const x0=p.x; step(['KeyL'],2); step([],30); const ground=Math.round(p.x-x0);
 step(['KeyJ'],10); const x1=p.x; step(['KeyL'],2); step([],30); const air=Math.round(p.x-x1);
 return {groundDash:ground, airDash:air, dashT:p.dashT}; }"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = await b.new_page()
        await pg.goto('file://' + os.path.abspath('dist/index.html')); await pg.wait_for_timeout(800)
        print(await pg.evaluate(JS)); await b.close()
asyncio.run(main())
