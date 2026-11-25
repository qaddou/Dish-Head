"""Dish rig: draws one keyed drawing of Dish (original character) as SVG.

A pose is a dict of explicit joint positions in frame space (no formulas),
so every frame is authored like a drawing.  Frame: FW x FH, ground at GY.
Frames carry no ground shadow: the game (or preview) draws it, so the same
drawing works on the ground and in the air.

pose keys
  pelvis (x, y)      lean (rad, + = forward)      sq (torso squash, 1 = rest)
  legs {'n': (knee, foot, foot_angle|None), 'f': ...}      n = near side, f = far side
  arms {'n': (elbow, hand, kind), 'f': ...}  kind: fist | point | open | pink
  head {'dx','dy','tilt','hat','lift','mouth' 0..1 or 'grit'|'o','eyes': open|squint|wide}
  ball  None or spin angle (rad) -> tucked spinning ball centred on pelvis
  fx   list of extra svg strings drawn on top
"""
import math, random

FW, FH, GY = 440, 440, 400
INK = '#1b120c'
CREAM = '#fffaf0'
GOLD, GOLD_D = '#e3a623', '#a8740f'
GREEN, GREEN_D = '#3f6324', '#2c4a17'
SHOE = '#4a2a18'
SILVER, SILVER_D = '#c9ced6', '#8f96a6'
PINK, PINK_D = '#ff5fa8', '#c2307a'

DEFS = f'''<defs>
<radialGradient id="plate" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="{CREAM}"/><stop offset="1" stop-color="#e9dcbf"/></radialGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f6"/><stop offset=".5" stop-color="{SILVER}"/><stop offset="1" stop-color="{SILVER_D}"/></linearGradient>
</defs>'''


class Boil:
    """Small seeded jitter, re-seeded every two frames (line boil on twos)."""
    def __init__(self, seed, amp=1.2):
        self.r = random.Random(seed); self.amp = amp
    def __call__(self, x, y):
        return x + self.r.uniform(-self.amp, self.amp), y + self.r.uniform(-self.amp, self.amp)


def rot(px, py, cx, cy, a):
    c, s = math.cos(a), math.sin(a)
    dx, dy = px - cx, py - cy
    return cx + dx * c - dy * s, cy + dx * s + dy * c


def catmull(pts, n=14):
    out, P = [], [pts[0]] + list(pts) + [pts[-1]]
    for k in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[k - 1], P[k], P[k + 1], P[k + 2]
        for s in range(n):
            t = s / n; t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3) for d in (0, 1)))
    out.append(tuple(pts[-1]))
    return out


def tapered(pts, w0, w1, bulge=0.0, boil=None):
    c = catmull(pts); L, R = [], []
    for k, (x, y) in enumerate(c):
        t = k / (len(c) - 1)
        a, b = c[min(k + 1, len(c) - 1)], c[max(k - 1, 0)]
        dx, dy = a[0] - b[0], a[1] - b[1]; m = math.hypot(dx, dy) or 1
        nx, ny = -dy / m, dx / m
        w = (w0 + (w1 - w0) * t + bulge * math.sin(math.pi * t)) / 2
        L.append((x + nx * w, y + ny * w)); R.append((x - nx * w, y - ny * w))
    poly = L + R[::-1]
    if boil: poly = [boil(*p) for p in poly]
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in poly) + ' Z'


def ell(cx, cy, rx, ry, rot_=0, boil=None, n=40):
    cr, sr, pts = math.cos(rot_), math.sin(rot_), []
    for k in range(n):
        a = k / n * 2 * math.pi; x, y = rx * math.cos(a), ry * math.sin(a)
        X, Y = cx + x * cr - y * sr, cy + x * sr + y * cr
        if boil: X, Y = boil(X, Y)
        pts.append((X, Y))
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z'


def pd(pts, boil=None, close=True):
    if boil: pts = [boil(*p) for p in pts]
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + (' Z' if close else '')


def line(a, b, w=3, col=INK, op=1):
    return f'<path d="M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" opacity="{op}"/>'


# ------------------------------------------------------------------ parts
def limb(a, b, c, w0, w1, boil, dim=False):
    col = '#2a1a10' if dim else INK
    d = tapered([a, b, c], w0, w1, bulge=2.4, boil=boil)
    out = f'<path d="{d}" fill="{col}"/>'
    if not dim:
        hl = tapered([(p[0] - 2.2, p[1] - 2.2) for p in (a, b, c)], 2.6, .6)
        out += f'<path d="{hl}" fill="#6b5442" opacity=".75"/>'
    return out


def shoe(x, y, ang, boil, dim=False):
    col = '#3a2012' if dim else SHOE
    cx, cy = x + 12 * math.cos(ang), y - 11 + 12 * math.sin(ang)
    sx, sy = x + 12 * math.cos(ang), y - 2 + 12 * math.sin(ang)
    hx, hy = x + 19 * math.cos(ang) - 4, y - 18 + 19 * math.sin(ang)
    return (f'<path d="{ell(sx, sy, 28, 6, ang, boil)}" fill="{INK}"/>'
            f'<path d="{ell(cx, cy, 29, 15, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
            f'<path d="{ell(hx, hy, 8.5, 3.8, ang - .2)}" fill="#fff" opacity="{.25 if dim else .55}"/>')


def glove(x, y, ang, boil, kind='fist', dim=False):
    pink = kind == 'pink'
    col = PINK if pink else ('#e9e0cc' if dim else CREAM)
    s = []
    cx, cy = x - 15 * math.cos(ang), y - 15 * math.sin(ang)
    s.append(f'<path d="{ell(cx, cy, 8.5, 13.5, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="4"/>')
    if kind in ('open', 'pink'):
        for k, a in enumerate((-.75, -.25, .25, .75)):
            fx_, fy_ = rot(x + 18, y, x, y, ang + a)
            s.append(f'<path d="{tapered([(x, y), (fx_, fy_)], 11, 9)}" fill="{col}" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>')
        s.append(f'<path d="{ell(x, y, 15, 14, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="4.2"/>')
        tx, ty = rot(x - 3, y - 15, x, y, ang)
        s.append(f'<path d="{ell(tx, ty, 7.5, 5, ang - .7, boil, 18)}" fill="{col}" stroke="{INK}" stroke-width="3"/>')
        return ''.join(s)
    s.append(f'<path d="{ell(x, y, 16, 15, ang, boil)}" fill="{col}" stroke="{INK}" stroke-width="4.2"/>')
    if kind == 'point':
        tip = rot(x + 30, y - 2, x, y, ang)
        s.append(f'<path d="{tapered([rot(x + 8, y - 3, x, y, ang), tip], 11, 9)}" fill="{col}" stroke="{INK}" stroke-width="3.4" stroke-linejoin="round"/>')
        tx, ty = rot(x + 2, y - 16, x, y, ang)
        s.append(f'<path d="{ell(tx, ty, 5.5, 8, ang + .3, boil, 18)}" fill="{col}" stroke="{INK}" stroke-width="3"/>')
        for k in (3, 9):
            kx, ky = rot(x + 10, y + k, x, y, ang)
            s.append(f'<path d="{ell(kx, ky, 6, 4.5, ang, boil, 16)}" fill="{col}" stroke="{INK}" stroke-width="2.6"/>')
    else:
        for k in (-1, 0, 1):
            kx, ky = rot(x + 11, y + k * 7.5, x, y, ang)
            s.append(f'<path d="{ell(kx, ky, 6.5, 5, ang, boil, 16)}" fill="{col}" stroke="{INK}" stroke-width="2.8"/>')
        tx, ty = rot(x - 2, y - 14, x, y, ang)
        s.append(f'<path d="{ell(tx, ty, 7.5, 5, ang - .5, boil, 16)}" fill="{col}" stroke="{INK}" stroke-width="2.8"/>')
    for k in (-1, 1):
        a1, a2 = rot(x - 8, y + k * 5, x, y, ang), rot(x + 2, y + k * 5, x, y, ang)
        s.append(line(a1, a2, 1.8))
    return ''.join(s)


def head(cx, cy, H, boil):
    tilt, hat_rot, lift = H.get('tilt', 0), H.get('hat', -.12), H.get('lift', 0)
    mouth, eyes = H.get('mouth', .3), H.get('eyes', 'open')
    g = [f'<g transform="rotate({math.degrees(tilt):.2f} {cx:.1f} {cy:.1f})">']
    rx, ry = 48, 52
    g.append(f'<path d="{ell(cx, cy, rx, ry, 0, boil)}" fill="url(#plate)" stroke="{INK}" stroke-width="5.5"/>')
    g.append(f'<path d="M{cx - rx + 2:.1f},{cy + 6:.1f} A{rx},{ry} 0 0 0 {cx + 12:.1f},{cy + ry - 1:.1f}" fill="none" stroke="{INK}" stroke-width="3.4" stroke-linecap="round"/>')
    g.append(f'<path d="{ell(cx + 3, cy, rx - 8, ry - 8, 0, boil)}" fill="none" stroke="{GOLD}" stroke-width="7.5"/>')
    g.append(f'<path d="{ell(cx + 3, cy, rx - 12.5, ry - 12.5, 0)}" fill="none" stroke="{GOLD_D}" stroke-width="1.8"/>')
    g.append(f'<path d="{ell(cx + 5, cy + 2, rx - 16, ry - 17, 0, boil)}" fill="#fbf3df" stroke="{INK}" stroke-width="1.8"/>')
    g.append(f'<path d="M{cx - 24:.1f},{cy - 15:.1f} A30,32 0 0 1 {cx + 15:.1f},{cy - 32:.1f} A28,30 0 0 0 {cx - 19:.1f},{cy - 8:.1f} Z" fill="#e8dcc0" opacity=".9"/>')
    g.append(f'<path d="M{cx - 37:.1f},{cy - 17:.1f} A43,47 0 0 1 {cx - 17:.1f},{cy - 41:.1f}" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round"/>')
    fx = cx + 10
    for ex, sc in ((fx - 11, .92), (fx + 14, 1.0)):
        ey = cy - 3
        if eyes == 'squint':
            g.append(f'<path d="M{ex - 7:.1f},{ey:.1f} Q{ex:.1f},{ey - 7:.1f} {ex + 7:.1f},{ey:.1f}" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>')
            continue
        k = 1.18 if eyes == 'wide' else 1.0
        g.append(f'<path d="{ell(ex, ey, 7 * sc * k, 11.5 * sc * k, 0, boil, 24)}" fill="{INK}"/>')
        r = 10.5 * sc * k
        g.append(f'<path d="M{ex:.1f},{ey:.1f} L{ex:.1f},{ey - r:.1f} A{r:.1f},{r:.1f} 0 0 1 {ex + r * .6:.1f},{ey - r * .8:.1f} Z" fill="{CREAM}"/>')
    by = -24 if eyes == 'wide' else -19
    g.append(f'<path d="M{fx - 20:.1f},{cy + by + 1:.1f} Q{fx - 11:.1f},{cy + by - 3:.1f} {fx - 3:.1f},{cy + by + 3:.1f}" stroke="{INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="M{fx + 6:.1f},{cy + by + 2:.1f} Q{fx + 15:.1f},{cy + by - 4:.1f} {fx + 24:.1f},{cy + by + 2:.1f}" stroke="{INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="{ell(fx - 24, cy + 15, 7.5, 4.3, 0)}" fill="#f19a86" opacity=".9"/>')
    g.append(f'<path d="{ell(fx + 27, cy + 14, 6.5, 4.3, 0)}" fill="#f19a86" opacity=".9"/>')
    if mouth == 'grit':
        g.append(f'<path d="{pd([(fx - 10, cy + 13), (fx + 15, cy + 12), (fx + 13, cy + 22), (fx - 8, cy + 22)], boil)}" fill="{CREAM}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
        g.append(line((fx - 9, cy + 17.5), (fx + 14, cy + 17), 2))
    elif mouth == 'o':
        g.append(f'<path d="{ell(fx + 3, cy + 18, 7, 8, 0, boil, 20)}" fill="#5a1a12" stroke="{INK}" stroke-width="3"/>')
    else:
        mo = float(mouth)
        g.append(f'<path d="M{fx - 10:.1f},{cy + 15:.1f} Q{fx + 2:.1f},{cy + 24 + mo * 9:.1f} {fx + 15:.1f},{cy + 14:.1f} Q{fx + 3:.1f},{cy + 18:.1f} {fx - 10:.1f},{cy + 15:.1f} Z" fill="#5a1a12" stroke="{INK}" stroke-width="2.8" stroke-linejoin="round"/>')
        if mo > .4: g.append(f'<path d="{ell(fx + 3, cy + 21 + mo * 3, 5.5, 2.8, 0)}" fill="#e0706a"/>')
    # serving-cloche hat, pivoting on the top edge, with follow-through
    hx, hy = cx + 2, cy - ry + 7 - lift
    g.append(f'<g transform="rotate({math.degrees(hat_rot):.2f} {hx:.1f} {hy:.1f})">')
    dome = [boil(hx + 41 * math.cos(math.pi + k / 24 * math.pi), hy - 4 + 37 * math.sin(math.pi + k / 24 * math.pi)) for k in range(25)]
    g.append(f'<path d="{pd(dome)}" fill="url(#silver)" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>')
    g.append(f'<path d="M{hx - 29:.1f},{hy - 19:.1f} Q{hx - 24:.1f},{hy - 34:.1f} {hx - 9:.1f},{hy - 39:.1f}" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="{pd([(hx - 50, hy - 6), (hx + 50, hy - 6), (hx + 48, hy + 5), (hx - 48, hy + 5)], boil)}" fill="{SILVER_D}" stroke="{INK}" stroke-width="4.4" stroke-linejoin="round"/>')
    g.append(f'<path d="{ell(hx, hy - 45, 7.5, 6.5, 0, boil, 18)}" fill="{SILVER_D}" stroke="{INK}" stroke-width="3.4"/>')
    g.append('</g></g>')
    return ''.join(g)


def torso(px, py, lean, sq, boil):
    L = 56 * sq
    wid = 1 + (1 - sq) * .6
    cx, cy = px + math.sin(lean) * L, py - math.cos(lean) * L
    pts = [(-27, 4), (-31, -15), (-25, -L + 4), (-18, -L - 3), (18, -L - 3), (25, -L + 4), (33, -16), (29, 4), (0, 10)]
    pp = [rot(px + x * wid, py + y, px, py, lean) for x, y in pts]
    s = [f'<path d="{pd(pp, boil)}" fill="{GREEN}" stroke="{INK}" stroke-width="5.5" stroke-linejoin="round"/>']
    shade = [rot(px + x * wid, py + y, px, py, lean) for x, y in [(-27, 4), (-31, -15), (-25, -L + 4), (-13, -L), (-11, -10), (-9, 7)]]
    s.append(f'<path d="{pd(shade)}" fill="{GREEN_D}" opacity=".75"/>')
    v = [rot(px + x, py + y, px, py, lean) for x, y in [(-10, -L - 1), (3, -L + 17), (13, -L - 1)]]
    s.append(f'<path d="{pd(v, boil)}" fill="{CREAM}" stroke="{INK}" stroke-width="2.8" stroke-linejoin="round"/>')
    for yy in (-L + 24, -L + 39):
        bx, by = rot(px + 7, py + yy, px, py, lean)
        s.append(f'<path d="{ell(bx, by, 3.4, 3.4, 0, boil, 12)}" fill="{GOLD}" stroke="{INK}" stroke-width="1.8"/>')
    a, b = rot(px - 16, py - 21, px, py, lean), rot(px - 5, py - 21, px, py, lean)
    s.append(line(a, b, 2.2))
    return ''.join(s), (cx, cy)


def ball(px, py, spin, boil, pink=False):
    """Jump tuck: spinning ball. Hat stays clamped on; limbs tucked."""
    g = [f'<g transform="rotate({math.degrees(spin):.1f} {px:.1f} {py:.1f})">']
    for i, (r, a0) in enumerate(((66, 2.2), (76, 2.5))):
        g.append(f'<path d="M{px + r * math.cos(-a0):.1f},{py + r * math.sin(-a0):.1f} A{r},{r} 0 0 1 {px + r * math.cos(-a0 + 1.1):.1f},{py + r * math.sin(-a0 + 1.1):.1f}" stroke="{CREAM}" stroke-width="{6 - i * 2}" fill="none" stroke-linecap="round" opacity=".9"/>')
    g.append(limb((px - 10, py + 16), (px - 26, py + 30), (px - 30, py + 44), 12, 10, boil, dim=True) + shoe(px - 36, py + 52, -.6, boil, dim=True))
    g.append(f'<path d="{ell(px - 6, py + 14, 31, 27, -.3, boil)}" fill="{GREEN}" stroke="{INK}" stroke-width="5.5"/>')
    g.append(f'<path d="{ell(px - 14, py + 20, 18, 14, -.3)}" fill="{GREEN_D}" opacity=".6"/>')
    g.append(limb((px + 10, py + 20), (px + 26, py + 34), (px + 18, py + 48), 12, 10, boil) + shoe(px + 14, py + 56, .3, boil))
    g.append(head(px + 8, py - 18, {'tilt': .1, 'hat': -.05, 'mouth': 'grit', 'eyes': 'squint'}, boil))
    g.append(glove(px - 40, py + 6, 3.2, boil, 'fist', dim=True))
    g.append(glove(px + 46, py + 8, .2, boil, 'pink' if pink else 'fist'))
    g.append('</g>')
    return ''.join(g)


def draw(pose, frame_index, seed=0):
    boil = Boil(1000 + seed * 101 + (frame_index // 2) * 17)
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{FW}" height="{FH}" viewBox="0 0 {FW} {FH}">', DEFS]
    s += pose.get('under', [])
    px, py = pose['pelvis']
    if pose.get('ball') is not None:
        s.append(ball(px, py, pose['ball'], boil, pose.get('pink', False)))
        s += pose.get('fx', []); s.append('</svg>'); return ''.join(s)
    lean, sq = pose.get('lean', 0), pose.get('sq', 1)
    tor, chest = torso(px, py, lean, sq, boil)

    def leg(side):
        knee, foot, ang = pose['legs'][side]
        near = side == 'n'
        hip = (px + (7 if near else -7), py)
        if ang is None:
            shin = math.atan2(foot[1] - knee[1], foot[0] - knee[0])
            ang = 0 if foot[1] >= GY - 3 else shin - math.pi / 2 + .25
        return limb(hip, knee, foot, 15, 12, boil, dim=not near) + shoe(foot[0], foot[1], ang, boil, dim=not near)

    def arm(side):
        el, hd, kind = pose['arms'][side]
        near = side == 'n'
        sh = (chest[0] + (8 if near else -12), chest[1] + 11)
        if near and hd[1] < chest[1] - 30: sh = (chest[0] + 22, chest[1] + 6)
        ang = math.atan2(hd[1] - el[1], hd[0] - el[0])
        return limb(sh, el, hd, 12, 10, boil, dim=not near) + glove(hd[0], hd[1], ang, boil, kind, dim=not near)

    s.append(arm('f')); s.append(leg('f')); s.append(tor); s.append(leg('n'))
    H = pose.get('head', {})
    hcx = chest[0] + 10 + math.sin(lean) * 32 + H.get('dx', 0)
    hcy = chest[1] - 54 + H.get('dy', 0)
    # a raised near arm goes behind the head so it never crosses the face
    raised = pose['arms']['n'][1][1] < chest[1] - 30
    if raised: s.append(arm('n'))
    s.append(head(hcx, hcy, H, boil))
    if not raised: s.append(arm('n'))
    s += pose.get('fx', [])
    s.append('</svg>')
    return ''.join(s)
