import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = await b.new_page()
        pg.on('pageerror', lambda e: print('ERR', e, e.stack[:400] if hasattr(e,'stack') and e.stack else ''))
        await pg.goto('file://' + os.path.abspath('dist/index.html')); await pg.wait_for_timeout(1000); await b.close()
asyncio.run(main())
