"""Preview reel for Dish's animations on a painted backdrop (24 fps).
usage: python3 make_reel.py ANIM_DIR OUT_PREFIX
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AD, OUT = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(AD, 'meta.json')))
W, H, GROUND = 1280, 720, 650
SC = 1                                   # frames rendered at 2x, shown at 1x
FONT = ImageFont.truetype('/usr/share/texmf/fonts/opentype/public/tex-gyre/texgyrebonum-bold.otf', 46)
rng = np.random.default_rng(7)

def load(name):
    fw, fh = meta['size']
    return [Image.open(os.path.join(AD, name, f'{name}_{i:02d}.png')).convert('RGBA').resize((fw, fh), Image.LANCZOS) for i in range(meta[name]['frames'])]
A = {k: load(k) for k in ('idle', 'run', 'jump', 'shoot', 'parry')}

# painted paper sky
n = rng.normal(0, 1, (H // 4, W // 4)); n = (n - n.min()) / np.ptp(n)
n = np.array(Image.fromarray((n * 255).astype('uint8')).resize((W, H), Image.BICUBIC)) / 255.
base = np.ones((H, W, 3)) * np.array([239, 224, 187]) * (0.94 + 0.08 * n)[..., None]
yy = np.linspace(0, 1, H)[:, None, None]
base = base * (1 - .35 * (1 - yy)) + np.array([169, 211, 214]) * .35 * (1 - yy)
SKY = Image.fromarray(np.clip(base, 0, 255).astype('uint8'))
grain = [Image.fromarray((rng.random((H, W)) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6)) for _ in range(3)]
Y, X = np.ogrid[:H, :W]
VIG = Image.fromarray((np.clip((X - W / 2) ** 2 / (W * .62) ** 2 + (Y - H / 2) ** 2 / (H * .7) ** 2, 0, 1) ** 1.6 * 150).astype('uint8'))

def hills(img, off, y0, amp, col, k):
    d = ImageDraw.Draw(img)
    pts = [(x, y0 + amp * np.sin((x + off) * k) + 10 * np.sin((x + off) * k * 3.1)) for x in range(-20, W + 40, 20)]
    d.polygon(pts + [(W + 40, H), (-20, H)], fill=col); d.line(pts, fill=(27, 18, 12), width=5, joint='curve')

def backdrop(scroll):
    img = SKY.copy()
    hills(img, scroll * .15, 480, 40, (134, 179, 88), .006)
    hills(img, scroll * .4, 550, 26, (111, 158, 70), .011)
    d = ImageDraw.Draw(img)
    d.rectangle([0, GROUND, W, H], fill=(176, 122, 68)); d.line([(0, GROUND), (W, GROUND)], fill=(27, 18, 12), width=6)
    off = scroll % 160
    for x in range(-160, W + 160, 160): d.line([(x - off, GROUND + 6), (x - off - 14, H)], fill=(122, 74, 36), width=3)
    return img

def put(img, spr, x, air):
    fw, fh = meta['size']; g = meta['ground']; rx = meta['root_x']
    # ground shadow, shrinking with height
    s = max(.35, 1 - air / 260)
    d = ImageDraw.Draw(img, 'RGBA'); d.ellipse([x - 50 * s, GROUND - 8 * s, x + 50 * s, GROUND + 8 * s], fill=(27, 18, 12, int(60 * s)))
    img.paste(spr, (int(x - rx * SC), int(GROUND - g * SC - air * SC)), spr)

def label(img, txt):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([40, 34, 60 + d.textlength(txt, font=FONT) + 24, 104], 16, fill=(255, 250, 240), outline=(27, 18, 12), width=5)
    d.text((62, 40), txt, font=FONT, fill=(200, 56, 44))

def film(img, t):
    g = grain[t % 3]; img = Image.blend(img, Image.merge('RGB', (g, g, g)), .05)
    img = Image.composite(Image.new('RGB', (W, H), (40, 20, 5)), img, VIG)
    fl = 1 + .03 * np.sin(t * 1.7) * np.sin(t * .63)
    return img.point(lambda v: min(255, int(v * fl)))

frames = []   # list of (backdrop scroll, [(sprite, x, air)], extra draw fn, label)
CX = W // 2 - 40
for t in range(48): frames.append((0, [(A['idle'][t % 12], CX, 0)], None, 'IDLE'))
for t in range(48): frames.append((t * 29 * SC, [(A['run'][t % 12], CX, 0)], None, 'RUN'))
jair = meta['jump']['air']
for rep in range(2):
    for i, spr in enumerate(A['jump']): frames.append((0, [(spr, CX, jair[i])], None, 'JUMP'))
    for i in range(7): frames.append((0, [(A['idle'][i], CX, 0)], None, 'JUMP'))
# shoot: bullets are game objects, drawn here for the preview
shots = []
for t in range(48):
    spr = A['shoot'][t % 4]
    if t % 2 == 0: shots.append(CX + 130)
    shots = [s + 48 for s in shots if s < W + 60]
    def bullets(img, ss=tuple(shots)):
        d = ImageDraw.Draw(img)
        for s in ss:
            y = GROUND - meta['ground'] + 271
            d.ellipse([s - 16, y - 7, s + 16, y + 7], fill=(227, 166, 35), outline=(27, 18, 12), width=4)
            d.line([(s - 44, y - 4), (s - 24, y - 4)], fill=(227, 166, 35), width=4); d.line([(s - 40, y + 4), (s - 22, y + 4)], fill=(227, 166, 35), width=4)
    frames.append((0, [(spr, CX, 0)], bullets, 'SHOOT'))
pair = meta['parry']['air']
for rep in range(2):
    seq = [(A['jump'][i], jair[i]) for i in range(0, 6)] + [(A['parry'][i], pair[i]) for i in range(len(A['parry']))] + [(A['jump'][i], max(0, jair[i])) for i in range(13, 17)]
    for k, (spr, air) in enumerate(seq):
        def orb(img, k=k):
            if 6 <= k < 8:   # the pink thing waiting to be slapped (drawn in-frame from parry_02 on)
                x = CX - meta['root_x'] + 286; y = GROUND - meta['ground'] - pair[2] + 104
                d = ImageDraw.Draw(img); d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=(255, 95, 168), outline=(27, 18, 12), width=5)
        frames.append((0, [(spr, CX, air)], orb, 'PARRY'))
    for i in range(8): frames.append((0, [(A['idle'][i], CX, 0)], None, 'PARRY'))

os.makedirs(OUT + '_frames', exist_ok=True)
for t, (scroll, sprites, extra, lab) in enumerate(frames):
    img = backdrop(scroll)
    if extra: extra(img)
    for spr, x, air in sprites: put(img, spr, x, air)
    label(img, lab)
    film(img, t).save(f'{OUT}_frames/{t:04d}.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{OUT}_frames/%04d.png', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', OUT + '.mp4'], check=True)
print('reel ok', len(frames), 'frames')
