"""Dish Head — frame-by-frame run cycle (original character).

Each frame is its own keyed drawing: key poses (contact, down, passing, up,
flight) for one half-cycle, mirrored for the other leg.  Drawn as SVG with
tapered brush-ink limbs, cel shading and line boil, then rendered to PNG.

usage: python3 run_cycle.py OUT_DIR
"""
import math, os, random, subprocess, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT, exist_ok=True)

INK = '#1b120c'
CREAM = '#fffaf0'
GOLD = '#e3a623'
GOLD_D = '#a8740f'
GREEN = '#3f6324'
GREEN_D = '#2c4a17'
SHOE = '#4a2a18'
SILVER = '#c9ced6'
SILVER_D = '#8f96a6'
S = 400          # frame size
GY = 360         # ground line

# ---------------------------------------------------------------- key poses
# Half cycle, 6 frames.  Positions in px, x relative to pelvis, y = height above ground.
PELVIS = [116, 102, 108, 124, 136, 128]        # pelvis height (down on f1, up on f4)
LEAN = [.26, .31, .29, .24, .22, .24]          # forward lean (rad)
SQ = [1.0, .93, .97, 1.02, 1.05, 1.02]         # vertical squash of torso
# near leg A strikes on f0 and pushes off; far leg B swings through
LEG_A = [((44, 60), (64, 0)), ((44, 50), (26, 0)), ((28, 54), (-10, 0)),
         ((8, 62), (-44, 6)), ((-14, 70), (-74, 30)), ((-30, 84), (-82, 62))]
LEG_B = [((-26, 82), (-62, 70)), ((-4, 90), (-46, 92)), ((24, 98), (-18, 96)),
         ((52, 100), (14, 80)), ((64, 86), (54, 50)), ((60, 64), (72, 22))]
# arms swing opposite to legs: (elbow, hand) relative to shoulder, y down
ARM_N = [((-30, 22), (-62, 4)), ((-28, 28), (-54, 24)), ((-14, 34), (-22, 46)),
         ((2, 36), (22, 40)), ((14, 30), (52, 10)), ((24, 22), (60, -14))]
ARM_F = [((24, 22), (60, -14)), ((18, 28), (54, 6)), ((6, 34), (30, 32)),
         ((-10, 34), (-10, 46)), ((-24, 28), (-44, 30)), ((-30, 22), (-62, 8))]


def frame_pose(i):
    h = i % 6
    second = i >= 6
    leg_near, leg_far = (LEG_B[h], LEG_A[h]) if second else (LEG_A[h], LEG_B[h])
    arm_near, arm_far = (ARM_F[h], ARM_N[h]) if second else (ARM_N[h], ARM_F[h])
    return dict(pelvis=PELVIS[h], lean=LEAN[h], sq=SQ[h], leg_near=leg_near, leg_far=leg_far,
                arm_near=arm_near, arm_far=arm_far, h=h)


# ---------------------------------------------------------------- geometry
class Boil:
    def __init__(self, seed, amp=1.1):
        self.r = random.Random(seed); self.amp = amp
    def __call__(self, x, y):
        return x + self.r.uniform(-self.amp, self.amp), y + self.r.uniform(-self.amp, self.amp)


def catmull(pts, n=14):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for k in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[k - 1], P[k], P[k + 1], P[k + 2]
        for s in range(n):
            t = s / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3) for d in (0, 1)))
    out.append(pts[-1])
    return out


def tapered(pts, w0, w1, bulge=0.0, boil=None):
    """Closed polygon around a centre line: brush-like stroke, widths taper w0->w1, bulge mid."""
    c = catmull(pts)
    L, R = [], []
    for k, (x, y) in enumerate(c):
        t = k / (len(c) - 1)
        a = c[min(k + 1, len(c) - 1)]; b = c[max(k - 1, 0)]
        dx, dy = a[0] - b[0], a[1] - b[1]
        m = math.hypot(dx, dy) or 1
        nx, ny = -dy / m, dx / m
        w = (w0 + (w1 - w0) * t + bulge * math.sin(math.pi * t)) / 2
        L.append((x + nx * w, y + ny * w)); R.append((x - nx * w, y - ny * w))
    poly = L + R[::-1]
    if boil: poly = [boil(*p) for p in poly]
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in poly) + ' Z'


def ell(cx, cy, rx, ry, rot=0, boil=None, n=40):
    pts = []
    cr, sr = math.cos(rot), math.sin(rot)
    for k in range(n):
        a = k / n * 2 * math.pi
        x, y = rx * math.cos(a), ry * math.sin(a)
        X, Y = cx + x * cr - y * sr, cy + x * sr + y * cr
        if boil: X, Y = boil(X, Y)
        pts.append((X, Y))
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z'


def path_d(pts, boil=None, close=True):
    if boil: pts = [boil(*p) for p in pts]
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + (' Z' if close else '')


def rot(px, py, cx, cy, a):
    c, s = math.cos(a), math.sin(a)
    dx, dy = px - cx, py - cy
    return cx + dx * c - dy * s, cy + dx * s + dy * c


# ---------------------------------------------------------------- parts
def shoe(x, y, ang, boil, dim=False):
    col = '#3a2012' if dim else SHOE
    body = ell(x + 10 * math.cos(ang), y - 9 + 10 * math.sin(ang), 24, 13, ang, boil)
    sole = ell(x + 10 * math.cos(ang), y - 2 + 10 * math.sin(ang), 23, 5, ang, boil)
    hx, hy = x + 16 * math.cos(ang) - 4, y - 15 + 16 * math.sin(ang)
    return (f'<path d="{sole}" fill="{INK}"/>'
            f'<path d="{body}" fill="{col}" stroke="{INK}" stroke-width="4.5" stroke-linejoin="round"/>'
            f'<path d="{ell(hx, hy, 7, 3.2, ang - .2)}" fill="#fff" opacity="{.25 if dim else .55}"/>')


def glove(x, y, ang, boil, dim=False, fist=True):
    col = '#e9e0cc' if dim else CREAM
    s = []
    # cuff
    cx, cy = x - 12 * math.cos(ang), y - 12 * math.sin(ang)
    s.append(f'<path d="{ell(cx, cy, 7, 11, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="3.5"/>')
    # palm + knuckles
    s.append(f'<path d="{ell(x, y, 13, 12, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="3.8"/>')
    for k in (-1, 0, 1):
        kx, ky = rot(x + 9, y + k * 6, x, y, ang)
        s.append(f'<path d="{ell(kx, ky, 5, 4, ang, boil, 16)}" fill="{col}" stroke="{INK}" stroke-width="2.6"/>')
    tx, ty = rot(x - 2, y - 11, x, y, ang)
    s.append(f'<path d="{ell(tx, ty, 6, 4, ang - .5, boil, 16)}" fill="{col}" stroke="{INK}" stroke-width="2.6"/>')
    # glove stitch lines
    for k in (-1, 1):
        a1 = rot(x - 6, y + k * 4, x, y, ang); a2 = rot(x + 2, y + k * 4, x, y, ang)
        s.append(f'<path d="M{a1[0]:.1f},{a1[1]:.1f} L{a2[0]:.1f},{a2[1]:.1f}" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>')
    return ''.join(s)


def limb(a, b, c, w0, w1, boil, dim=False):
    col = '#2a1a10' if dim else INK
    d = tapered([a, b, c], w0, w1, bulge=1.4, boil=boil)
    hl = tapered([(a[0] - 1.5, a[1] - 1.5), (b[0] - 1.5, b[1] - 1.5), (c[0] - 1.5, c[1] - 1.5)], 1.6, .4)
    return f'<path d="{d}" fill="{col}"/>' + ('' if dim else f'<path d="{hl}" fill="#6b5442" opacity=".7"/>')


def head(cx, cy, tilt, hat_rot, boil, mouth_open):
    g = [f'<g transform="rotate({math.degrees(tilt):.2f} {cx:.1f} {cy:.1f})">']
    rx, ry = 48, 52
    # hat behind-the-rim part is drawn after plate (sits on top edge)
    # plate body with radial light
    g.append(f'<path d="{ell(cx, cy, rx, ry, 0, boil)}" fill="url(#plate)" stroke="{INK}" stroke-width="5"/>')
    # heavier ink on the shadow side (bottom-left)
    g.append(f'<path d="M{cx - rx + 2:.1f},{cy + 6:.1f} A{rx},{ry} 0 0 0 {cx + 12:.1f},{cy + ry - 1:.1f}" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    # gold rim band
    g.append(f'<path d="{ell(cx + 3, cy, rx - 8, ry - 8, 0, boil)}" fill="none" stroke="{GOLD}" stroke-width="7"/>')
    g.append(f'<path d="{ell(cx + 3, cy, rx - 12, ry - 12, 0)}" fill="none" stroke="{GOLD_D}" stroke-width="1.6"/>')
    # well: slightly darker, crescent shadow top-left
    g.append(f'<path d="{ell(cx + 5, cy + 2, rx - 15, ry - 16, 0, boil)}" fill="#fbf3df" stroke="{INK}" stroke-width="1.6"/>')
    g.append(f'<path d="M{cx - 22:.1f},{cy - 14:.1f} A28,30 0 0 1 {cx + 14:.1f},{cy - 30:.1f} A26,28 0 0 0 {cx - 18:.1f},{cy - 8:.1f} Z" fill="#e8dcc0" opacity=".9"/>')
    # specular glint on the rim
    g.append(f'<path d="M{cx - 34:.1f},{cy - 16:.1f} A40,44 0 0 1 {cx - 16:.1f},{cy - 38:.1f}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>')
    # face (turned 3/4 toward running direction)
    fx = cx + 9
    for ex, sc in ((fx - 10, .92), (fx + 13, 1.0)):
        ey = cy - 3
        g.append(f'<path d="{ell(ex, ey, 6.6 * sc, 10.5 * sc, 0, boil, 24)}" fill="{INK}"/>')
        g.append(f'<path d="M{ex:.1f},{ey:.1f} L{ex:.1f},{ey - 9.5 * sc:.1f} A{9.5 * sc:.1f},{9.5 * sc:.1f} 0 0 1 {ex + 5.5 * sc:.1f},{ey - 7.5 * sc:.1f} Z" fill="{CREAM}"/>')
    # determined brows
    g.append(f'<path d="M{fx - 18:.1f},{cy - 18:.1f} Q{fx - 10:.1f},{cy - 21:.1f} {fx - 3:.1f},{cy - 16:.1f}" stroke="{INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="M{fx + 6:.1f},{cy - 17:.1f} Q{fx + 14:.1f},{cy - 22:.1f} {fx + 22:.1f},{cy - 17:.1f}" stroke="{INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="{ell(fx - 22, cy + 14, 7, 4, 0)}" fill="#f19a86" opacity=".9"/>')
    g.append(f'<path d="{ell(fx + 25, cy + 13, 6, 4, 0)}" fill="#f19a86" opacity=".9"/>')
    mo = mouth_open
    g.append(f'<path d="M{fx - 9:.1f},{cy + 14:.1f} Q{fx + 2:.1f},{cy + 22 + mo * 8:.1f} {fx + 14:.1f},{cy + 13:.1f} Q{fx + 3:.1f},{cy + 17:.1f} {fx - 9:.1f},{cy + 14:.1f} Z" fill="#5a1a12" stroke="{INK}" stroke-width="2.6" stroke-linejoin="round"/>')
    if mo > .4:
        g.append(f'<path d="{ell(fx + 3, cy + 19 + mo * 3, 5, 2.6, 0)}" fill="#e0706a"/>')
    # serving cloche hat, pivoting on the plate's top edge with follow-through
    hx, hy = cx + 2, cy - ry + 6
    g.append(f'<g transform="rotate({math.degrees(hat_rot):.2f} {hx:.1f} {hy:.1f})">')
    dome = []
    for k in range(25):
        a = math.pi + k / 24 * math.pi
        dome.append((hx + 38 * math.cos(a), hy - 4 + 34 * math.sin(a)))
    dome = [boil(*p) for p in dome]
    g.append(f'<path d="{path_d(dome)}" fill="url(#silver)" stroke="{INK}" stroke-width="4.5" stroke-linejoin="round"/>')
    g.append(f'<path d="M{hx - 27:.1f},{hy - 18:.1f} Q{hx - 22:.1f},{hy - 32:.1f} {hx - 8:.1f},{hy - 36:.1f}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95"/>')
    g.append(f'<path d="{path_d([(hx - 46, hy - 6), (hx + 46, hy - 6), (hx + 44, hy + 4), (hx - 44, hy + 4)], boil)}" fill="{SILVER_D}" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>')
    g.append(f'<path d="{ell(hx, hy - 41, 7, 6, 0, boil, 18)}" fill="{SILVER_D}" stroke="{INK}" stroke-width="3.2"/>')
    g.append('</g></g>')
    return ''.join(g)


def torso(px, py, lean, sq, boil):
    # chest point along lean
    L = 52 * sq
    cx, cy = px + math.sin(lean) * L, py - math.cos(lean) * L
    pts = [(-25, 4), (-28, -14), (-23, -L + 4), (-17, -L - 3), (17, -L - 3), (23, -L + 4), (30, -16), (26, 4), (0, 9)]
    pp = [rot(px + x, py + y, px, py, lean) for x, y in pts]
    s = [f'<path d="{path_d(pp, boil)}" fill="{GREEN}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>']
    # back-side shading
    shade = [rot(px + x, py + y, px, py, lean) for x, y in [(-21, 4), (-23, -14), (-19, -L + 4), (-12, -L), (-10, -10), (-8, 6)]]
    s.append(f'<path d="{path_d(shade)}" fill="{GREEN_D}" opacity=".75"/>')
    # shirt V and buttons
    v = [rot(px + x, py + y, px, py, lean) for x, y in [(-9, -L - 1), (3, -L + 16), (12, -L - 1)]]
    s.append(f'<path d="{path_d(v, boil)}" fill="{CREAM}" stroke="{INK}" stroke-width="2.6" stroke-linejoin="round"/>')
    for yy in (-L + 22, -L + 36):
        bx, by = rot(px + 6, py + yy, px, py, lean)
        s.append(f'<path d="{ell(bx, by, 3, 3, 0, boil, 12)}" fill="{GOLD}" stroke="{INK}" stroke-width="1.6"/>')
    # pocket stitch
    a, b = rot(px - 14, py - 20, px, py, lean), rot(px - 4, py - 20, px, py, lean)
    s.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>')
    return ''.join(s), (cx, cy)


def smear(prev, cur, boil):
    """Dry-brush smear behind a fast-moving foot."""
    (x0, y0), (x1, y1) = prev, cur
    if math.hypot(x1 - x0, y1 - y0) < 34: return ''
    out = []
    for k, a in enumerate((.18, .3, .45)):
        t = (k + 1) / 4
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        out.append(f'<path d="{ell(x + 8, y - 9, 22, 9, math.atan2(y1 - y0, x1 - x0), boil, 20)}" fill="{SHOE}" opacity="{a}"/>')
    out.append(f'<path d="M{x0:.1f},{y0 - 9:.1f} L{x1 - 8:.1f},{y1 - 9:.1f}" stroke="{INK}" stroke-width="2" opacity=".5" stroke-dasharray="6 5"/>')
    return ''.join(out)


DEFS = f'''<defs>
<radialGradient id="plate" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="{CREAM}"/><stop offset="1" stop-color="#e9dcbf"/></radialGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f6"/><stop offset=".5" stop-color="{SILVER}"/><stop offset="1" stop-color="{SILVER_D}"/></linearGradient>
</defs>'''


def draw_frame(i, prev_feet):
    P = frame_pose(i)
    boil = Boil(1000 + (i // 2) * 17)        # boil on twos
    root = 190
    py = GY - P['pelvis']
    hips = (root, py)
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">', DEFS]
    # ground shadow squashes with height
    sh = 1 - (P['pelvis'] - 106) / 80
    s.append(f'<path d="{ell(root + 6, GY + 2, 58 * sh, 9 * sh, 0)}" fill="{INK}" opacity=".18"/>')
    feet = {}
    def leg(spec, near):
        (kx, ky), (fx, fy) = spec
        hip = (root + (5 if near else -5), py)
        knee = (root + kx, GY - ky)
        foot = (root + fx, GY - fy)
        shin = math.atan2(foot[1] - knee[1], foot[0] - knee[0])
        ang = shin - math.pi / 2 + (.25 if fy > 10 else 0)
        if fy < 3: ang = 0  # planted flat
        key = 'n' if near else 'f'
        feet[key] = foot
        out = ''
        if prev_feet and key in prev_feet: out += smear(prev_feet[key], foot, boil)
        return out + limb(hip, knee, foot, 11, 9, boil, dim=not near) + shoe(foot[0], foot[1], ang, boil, dim=not near)
    tor, chest = torso(root, py, P['lean'], P['sq'], boil)
    def arm(spec, near):
        (ex, ey), (hx, hy) = spec
        sh_ = (chest[0] + (6 if near else -10), chest[1] + 10)
        el = (sh_[0] + ex, sh_[1] + ey)
        hd = (sh_[0] + hx, sh_[1] + hy)
        ang = math.atan2(hd[1] - el[1], hd[0] - el[0])
        return limb(sh_, el, hd, 9, 7, boil, dim=not near) + glove(hd[0], hd[1], ang, boil, dim=not near)
    # back limbs, torso, front leg, head, front arm
    s.append(arm(P['arm_far'], False))
    s.append(leg(P['leg_far'], False))
    s.append(tor)
    s.append(leg(P['leg_near'], True))
    # head lags the body by a frame: use previous frame's pelvis delta for bob
    hprev = PELVIS[(P['h'] - 1) % 6]
    hcx = chest[0] + 10 + math.sin(P['lean']) * 30
    hcy = chest[1] - 50 - (hprev - 118) * .35
    tilt = P['lean'] * .35 + (.03 if P['h'] in (1, 2) else -.02)
    # hat follow-through: trails behind vertical motion
    vy = PELVIS[P['h']] - PELVIS[(P['h'] - 1) % 6]
    hat_rot = -.16 - vy * .02
    s.append(head(hcx, hcy, tilt, hat_rot, boil, mouth_open=.4 + .6 * (P['h'] in (3, 4))))
    s.append(arm(P['arm_near'], True))
    # speed lines behind the runner
    r = random.Random(i)
    for k in range(3):
        yy = 150 + k * 60 + r.uniform(-8, 8); x0 = 70 + r.uniform(-10, 10)
        s.append(f'<path d="M{x0:.1f},{yy:.1f} L{x0 - 40 - r.uniform(0, 30):.1f},{yy:.1f}" stroke="{INK}" stroke-width="3" stroke-linecap="round" opacity=".35"/>')
    s.append('</svg>')
    return ''.join(s), feet


def main():
    prev = None
    first = None
    for i in range(12):
        svg, feet = draw_frame(i, prev)
        if first is None: first = feet
        prev = feet
        p = os.path.join(OUT, f'run_{i:02d}.svg')
        open(p, 'w').write(svg)
        subprocess.run(['rsvg-convert', '-w', str(S * 2), '-h', str(S * 2), p, '-o', p[:-4] + '.png'], check=True)
    print('frames ok')

main()
