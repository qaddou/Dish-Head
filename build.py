import glob, os, base64
F=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts') + '/'
def b64(path): return base64.b64encode(open(F+path,'rb').read()).decode()
FONTS = ''.join("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');}\n" % (n, w, b64(f)) for n, w, f in [('Ultra', 400, 'ultra-latin-400-normal.woff2'), ('Limelight', 400, 'limelight-latin-400-normal.woff2'), ('Libre Baskerville', 400, 'libre-baskerville-latin-400-normal.woff2')])
src = sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'src', '*.js')))
js = '\n'.join(open(f, encoding='utf-8').read() for f in src)
html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lights Out! The Bolt &amp; Dot Show</title>
<style>
''' + FONTS + ''':root {
  /* one visual world: a 1930s cartoon theatre */
  --ink: #1b120c; --paper: #efe0bb; --curtain: #9a1f24; --gold: #e3a623; --night: #0d0907;
  --display: 'Ultra', 'Rockwell', Georgia, serif; --body: 'Libre Baskerville', Georgia, serif;
  color-scheme: dark;
}
html, body { height: 100%; margin: 0; background: var(--night); overflow: hidden; }
body { display: flex; align-items: center; justify-content: center; font-family: var(--body); color: var(--paper); }
canvas { display: block; touch-action: none; outline: none; -webkit-tap-highlight-color: transparent; user-select: none; }
canvas:focus-visible { box-shadow: 0 0 0 3px var(--gold); }
noscript { padding: 24px; }
</style>
</head>
<body>
<canvas id="cv" tabindex="0" aria-label="Lights Out! The Bolt and Dot Show, a cartoon run and gun game. Press any key to start."></canvas>
<noscript>This game needs JavaScript to run.</noscript>
<script>
''' + js + '''
</script>
</body>
</html>
'''
os.makedirs(os.path.join(os.path.dirname(__file__), 'dist'), exist_ok=True)
out = os.path.join(os.path.dirname(__file__), 'dist', 'index.html')
open(out, 'w', encoding='utf-8').write(html)
print(out, len(html) // 1024, 'KB', sum(1 for _ in js.splitlines()), 'lines')
