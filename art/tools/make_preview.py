"""Compose run-cycle frames onto a painted 1930s backdrop and write a preview video.
usage: python3 make_preview.py FRAMES_DIR OUT_PREFIX
"""
import sys, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFilter

FR, OUT = sys.argv[1], sys.argv[2]
W, H = 1280, 720
frames = [Image.open(os.path.join(FR, f'run_{i:02d}.png')).convert('RGBA') for i in range(12)]
rng = np.random.default_rng(7)

def paper():
    base = np.ones((H, W, 3)) * np.array([239, 224, 187])
    n = rng.normal(0, 1, (H // 4, W // 4))
    n = np.array(Image.fromarray(((n - n.min()) / (np.ptp(n)) * 255).astype('uint8')).resize((W, H), Image.BICUBIC)) / 255.
    base *= (0.94 + 0.08 * n)[..., None]
    return base

sky = paper()
yy = np.linspace(0, 1, H)[:, None, None]
sky = sky * (1 - .35 * (1 - yy)) + np.array([169, 211, 214]) * .35 * (1 - yy)
bg = Image.fromarray(np.clip(sky, 0, 255).astype('uint8'))

def hills(img, off, y0, amp, col, k):
    d = ImageDraw.Draw(img)
    pts = [(x, y0 + amp * np.sin((x + off) * k) + 10 * np.sin((x + off) * k * 3.1)) for x in range(-20, W + 40, 20)]
    d.polygon(pts + [(W + 40, H), (-20, H)], fill=col)
    d.line(pts, fill=(27, 18, 12), width=5, joint='curve')

GROUND = 640
speed_px = 29 * 2   # ground travel per frame at render scale (planted foot stays put)
grain = [Image.fromarray((rng.random((H, W)) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6)) for _ in range(3)]
vig = np.zeros((H, W)); Y, X = np.ogrid[:H, :W]
vig = np.clip(((X - W / 2) ** 2 / (W * .62) ** 2 + (Y - H / 2) ** 2 / (H * .7) ** 2), 0, 1)
vig = Image.fromarray((vig ** 1.6 * 150).astype('uint8'))

os.makedirs(OUT + '_frames', exist_ok=True)
N = 96
for t in range(N):
    img = bg.copy()
    hills(img, t * speed_px * .15, 470, 40, (134, 179, 88), .006)
    hills(img, t * speed_px * .4, 540, 26, (111, 158, 70), .011)
    d = ImageDraw.Draw(img)
    d.rectangle([0, GROUND, W, H], fill=(176, 122, 68)); d.line([(0, GROUND), (W, GROUND)], fill=(27, 18, 12), width=6)
    off = (t * speed_px) % 160
    for x in range(-160, W + 160, 160):
        d.line([(x - off, GROUND + 6), (x - off - 14, H)], fill=(122, 74, 36), width=3)
    f = frames[t % 12]
    img.paste(f, (W // 2 - f.width // 2 - 40, GROUND - 720 + 20), f)
    # film: grain, flicker, vignette, occasional scratch
    g = grain[t % 3]
    img = Image.blend(img, Image.merge('RGB', (g, g, g)), .05)
    dark = Image.new('RGB', (W, H), (40, 20, 5)); img = Image.composite(dark, img, vig)
    fl = 1 + .03 * np.sin(t * 1.7) * np.sin(t * .63)
    img = img.point(lambda v: min(255, int(v * fl)))
    if t % 7 == 3:
        d = ImageDraw.Draw(img); x = int(rng.random() * W); d.line([(x, 0), (x + 4, H)], fill=(60, 40, 20), width=1)
    img.save(f'{OUT}_frames/{t:03d}.png')

subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{OUT}_frames/%03d.png', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', OUT + '.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{OUT}_frames/%03d.png', '-frames:v', '24', '-vf', 'scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer', OUT + '.gif'], check=True)
print('preview ok')
