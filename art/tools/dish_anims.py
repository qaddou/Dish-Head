"""Dish animations: every frame is a keyed drawing (positions written by hand),
rendered through dish_rig.  Sequences: idle, run, jump, shoot, parry.

usage: python3 dish_anims.py OUT_DIR
Writes OUT_DIR/<anim>/<anim>_NN.png (2x) and OUT_DIR/meta.json (per-frame air
height for jump/parry so the game and the preview can lift the sprite).
"""
import json, math, os, subprocess, sys
import dish_rig as R

ROOT = 210
GY = R.GY


def chest_of(ph, lean, sq):
    px, py = ROOT, GY - ph
    L = 56 * sq
    return px + math.sin(lean) * L, py - math.cos(lean) * L


def P(ph, lean=.06, sq=1.0, legs=None, arms=None, head=None, fx=None, under=None):
    """Build a pose from heights above ground / offsets from pelvis & shoulders."""
    px, py = ROOT, GY - ph
    cx, cy = chest_of(ph, lean, sq)
    sh = {'n': (cx + 8, cy + 11), 'f': (cx - 12, cy + 11)}
    L = {}
    for s, ((kx, kh), (fx_, fh), ang) in legs.items():
        L[s] = ((px + kx, GY - kh), (px + fx_, GY - fh), ang)
    A = {}
    for s, ((ex, ey), (hx, hy), kind) in arms.items():
        A[s] = ((sh[s][0] + ex, sh[s][1] + ey), (sh[s][0] + hx, sh[s][1] + hy), kind)
    return {'pelvis': (px, py), 'lean': lean, 'sq': sq, 'legs': L, 'arms': A, 'head': head or {}, 'fx': fx or [], 'under': under or []}


def BALL(ph, spin, pink=False, fx=None):
    return {'pelvis': (ROOT, GY - ph), 'ball': spin, 'pink': pink, 'fx': fx or []}


def burst(x, y, r, col, n=8, w=6, rot0=0.0):
    out = []
    for k in range(n):
        a = rot0 + k * 2 * math.pi / n
        out.append(R.line((x + math.cos(a) * r * .45, y + math.sin(a) * r * .45), (x + math.cos(a) * r, y + math.sin(a) * r), w, col))
    return ''.join(out)


def star(x, y, r, col, rot0=0.0):
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * .42
        a = rot0 + k * math.pi / 5 - math.pi / 2
        pts.append((x + math.cos(a) * rr, y + math.sin(a) * rr))
    return f'<path d="{R.pd(pts)}" fill="{col}" stroke="{R.INK}" stroke-width="4" stroke-linejoin="round"/>'


def dust(x, y, k):
    out = []
    for i, (dx, r) in enumerate(((-46, 13), (-26, 10), (30, 11), (50, 14))):
        out.append(f'<path d="{R.ell(x + dx * (1 + k * .4), y - 8 - k * 6 - i % 2 * 4, r * (1 + k * .5), r * .8 * (1 + k * .5), 0)}" fill="#f3ead2" stroke="{R.INK}" stroke-width="3" opacity="{1 - k * .55:.2f}"/>')
    return ''.join(out)


# ------------------------------------------------------------------- IDLE
# 6 drawings held on twos -> 12 frames (0.5 s), rubbery 1930s bounce.
IDLE_H = [120, 118, 114, 112, 114, 118]
IDLE_SQ = [1.0, .985, .955, .94, .96, .99]
IDLE_HAT = [-.10, -.12, -.16, -.14, -.10, -.08]
IDLE_HDY = [0, 1, 3, 5, 4, 2]          # head lags the body by about a drawing


def idle_pose(d):
    h = IDLE_H[d]; bend = (120 - h) * 1.4
    sw = [0, 1, 3, 4, 3, 1][d]
    return P(h, .05, IDLE_SQ[d],
             legs={'n': ((22 + bend, 60), (20, 0), 0), 'f': ((-6 + bend, 62), (-18, 0), 0)},
             arms={'n': ((10, 30), (16 + sw, 58 - sw), 'fist'), 'f': ((-8, 30), (-14 - sw, 56 - sw), 'fist')},
             head={'dy': IDLE_HDY[d], 'tilt': .03 * math.sin(d), 'hat': IDLE_HAT[d], 'lift': [0, 0, -1, -2, -1, 0][d], 'mouth': .25})


# ------------------------------------------------------------------- RUN
# Half cycle of 6 keyed drawings (contact, down, down, passing, push, flight),
# mirrored for the other leg: 12 frames on ones.  Exaggerated lean & reach.
RUN_H = [116, 100, 106, 124, 138, 130]
RUN_LEAN = [.32, .38, .35, .30, .27, .29]
RUN_SQ = [1.0, .9, .96, 1.03, 1.07, 1.03]
LEG_A = [((48, 62), (70, 0)), ((48, 50), (28, 0)), ((30, 54), (-12, 0)),
         ((6, 64), (-50, 8)), ((-18, 74), (-84, 36)), ((-36, 90), (-92, 72))]
LEG_B = [((-30, 88), (-72, 80)), ((-6, 96), (-52, 100)), ((26, 104), (-20, 104)),
         ((58, 106), (16, 86)), ((72, 90), (62, 52)), ((66, 66), (80, 22))]
ARM_N = [((-34, 18), (-70, -4)), ((-32, 26), (-62, 20)), ((-16, 34), (-26, 48)),
         ((4, 36), (26, 42)), ((18, 28), (60, 8)), ((28, 18), (68, -22))]
ARM_F = [((28, 18), (68, -22)), ((22, 26), (62, 2)), ((8, 34), (34, 32)),
         ((-12, 34), (-12, 48)), ((-28, 26), (-52, 28)), ((-34, 18), (-70, 4))]


def run_pose(i):
    h = i % 6; second = i >= 6
    ln, lf = (LEG_B[h], LEG_A[h]) if second else (LEG_A[h], LEG_B[h])
    an, af = (ARM_F[h], ARM_N[h]) if second else (ARM_N[h], ARM_F[h])
    vy = RUN_H[h] - RUN_H[(h - 1) % 6]
    fx = [dust(ROOT + ln[1][0], GY, .2)] if h == 0 else []
    return P(RUN_H[h], RUN_LEAN[h], RUN_SQ[h],
             legs={'n': (ln[0], ln[1], None), 'f': (lf[0], lf[1], None)},
             arms={'n': (an[0], an[1], 'fist'), 'f': (af[0], af[1], 'fist')},
             head={'dy': (RUN_H[(h - 1) % 6] - 118) * -.3, 'tilt': .12 + (.04 if h in (1, 2) else -.02),
                   'hat': -.2 - vy * .022, 'lift': max(0, vy) * .25, 'mouth': .4 + .6 * (h in (3, 4)), 'eyes': 'open'},
             fx=fx)


# ------------------------------------------------------------------- JUMP
def jump_frames():
    F, air = [], []
    F.append(idle_pose(0)); air.append(0)
    # anticipation: crouch, arms swing back
    for h, sq in ((100, .88), (90, .82)):
        F.append(P(h, .16, sq, legs={'n': ((40, 48), (22, 0), 0), 'f': ((18, 50), (-18, 0), 0)},
                   arms={'n': ((-24, 26), (-44, 46), 'fist'), 'f': ((-30, 22), (-54, 36), 'fist')},
                   head={'dy': 6, 'hat': .06, 'lift': -2, 'mouth': 'grit', 'eyes': 'squint'})); air.append(0)
    # takeoff stretch: long body, arms up, hat left behind
    F.append(P(150, .02, 1.2, legs={'n': ((6, 96), (10, 40), None), 'f': ((-6, 94), (-6, 44), None)},
               arms={'n': ((30, -50), (52, -104), 'open'), 'f': ((-26, -48), (-44, -100), 'open')},
               head={'dy': -4, 'hat': -.28, 'lift': 14, 'mouth': 'o', 'eyes': 'wide'},
               fx=[dust(ROOT, GY, .5)])); air.append(30)
    F.append(P(150, .04, 1.1, legs={'n': ((24, 112), (16, 84), None), 'f': ((8, 108), (-10, 82), None)},
               arms={'n': ((34, -36), (60, -76), 'fist'), 'f': ((-24, -34), (-40, -74), 'fist')},
               head={'dy': -2, 'hat': -.18, 'lift': 8, 'mouth': 'o', 'eyes': 'wide'})); air.append(70)
    # tucked spin: 8 drawings, 45 degrees apart
    arc = [100, 122, 136, 142, 140, 130, 114, 92]
    for k in range(8):
        F.append(BALL(150, k * math.pi / 4)); air.append(arc[k])
    # untuck, falling: legs reach for the ground, hat lifts (lags upward)
    F.append(P(150, .0, 1.06, legs={'n': ((14, 100), (16, 52), None), 'f': ((-4, 98), (-14, 50), None)},
               arms={'n': ((26, -10), (52, -34), 'open'), 'f': ((-26, -8), (-48, -30), 'open')},
               head={'dy': -2, 'hat': .2, 'lift': 12, 'mouth': 'o', 'eyes': 'wide'})); air.append(50)
    # land: big squash, hat slams down, dust
    F.append(P(82, .08, .78, legs={'n': ((44, 40), (34, 0), 0), 'f': ((-22, 42), (-34, 0), 0)},
               arms={'n': ((26, 20), (52, 34), 'open'), 'f': ((-26, 20), (-50, 34), 'open')},
               head={'dy': 10, 'hat': .02, 'lift': -6, 'mouth': 'grit', 'eyes': 'squint'},
               fx=[dust(ROOT, GY, .1)])); air.append(0)
    F.append(P(106, .06, .93, legs={'n': ((30, 54), (26, 0), 0), 'f': ((-8, 56), (-24, 0), 0)},
               arms={'n': ((14, 28), (28, 52), 'fist'), 'f': ((-12, 28), (-22, 52), 'fist')},
               head={'dy': 4, 'hat': -.06, 'lift': -2, 'mouth': .3},
               fx=[dust(ROOT, GY, .6)])); air.append(0)
    F.append(idle_pose(1)); air.append(0)
    return F, air


# ------------------------------------------------------------------- SHOOT
# Finger-gun stance, 4 drawings on ones: fire, recoil, settle, recoil.
def shoot_frames():
    F = []
    for k in range(4):
        rec = k % 2 == 1
        hx = 66 if not rec else 56
        fx = []
        if k in (0, 2):
            # muzzle flash just past the fingertip
            sx, sy = chest_of(114, .04, 1.0)
            mx, my = sx + 8 + hx + 40, sy + 11 - 2
            fx = [burst(mx, my, 26, R.GOLD, 8, 6, k * .2), f'<path d="{R.ell(mx, my, 12, 9, 0)}" fill="#fff4c8" stroke="{R.INK}" stroke-width="3"/>']
        F.append(P(114 - (1 if rec else 0), .04, 1.0 - (.015 if rec else 0),
                   legs={'n': ((30, 58), (34, 0), 0), 'f': ((-10, 60), (-24, 0), 0)},
                   arms={'n': ((36 - (6 if rec else 0), 2), (hx, -2), 'point'), 'f': ((-4, 28), (18, 18), 'fist')},
                   head={'dx': -2 if rec else 0, 'dy': 1 if rec else 0, 'tilt': .02, 'hat': -.1 + (.05 if rec else 0), 'mouth': 'grit', 'eyes': 'open'},
                   fx=fx))
    return F


# ------------------------------------------------------------------- PARRY
def parry_frames():
    F, air = [], []
    for k in range(2):
        F.append(BALL(150, k * math.pi / 4)); air.append(90 + k * 14)
    ox, oy = ROOT + 62, GY - 288   # where the pink thing is in frame space
    F.append(P(150, -.08, 1.06, legs={'n': ((26, 114), (8, 84), None), 'f': ((-8, 104), (-26, 80), None)},
               arms={'n': ((34, -44), (66, -88), 'pink'), 'f': ((-30, 8), (-54, 18), 'fist')},
               head={'dy': -2, 'tilt': -.08, 'hat': -.2, 'lift': 6, 'mouth': 'o', 'eyes': 'wide'},
               under=[f'<path d="{R.ell(ox + 14, oy - 8, 22, 22, 0)}" fill="{R.PINK}" stroke="{R.INK}" stroke-width="4.5"/>'])); air.append(114)
    for big in (0, 1):   # SLAP + hold (hitstop)
        F.append(P(150, -.1, 1.08, legs={'n': ((28, 116), (10, 86), None), 'f': ((-8, 106), (-26, 82), None)},
                   arms={'n': ((40, -50), (74, -96), 'pink'), 'f': ((-30, 6), (-56, 14), 'fist')},
                   head={'dy': -3, 'tilt': -.1, 'hat': -.26, 'lift': 10, 'mouth': 'grit', 'eyes': 'squint'},
                   under=[star(ox + 18, oy - 12, 46 + big * 14, R.PINK, big * .3), burst(ox + 18, oy - 12, 74 + big * 12, R.PINK_D, 10, 6, .15)],
                   fx=[f'<path d="{R.ell(ox + 18, oy - 10, 26, 12, -.3)}" fill="{R.PINK}" stroke="{R.INK}" stroke-width="4"/>'])); air.append(118)
    for k in range(5):   # bounce away spinning, sparkles fade
        sp = [star(ROOT + 60 - k * 10, GY - 270 + k * 16, 12 - k * 2, R.PINK, k), star(ROOT - 50 + k * 6, GY - 250 + k * 10, 9 - k, '#ffd0e6', k)] if k < 4 else []
        F.append(BALL(150, k * math.pi / 4, pink=k < 2, fx=sp)); air.append(130 + k * 8)
    return F, air


def render(name, poses, out, seed):
    d = os.path.join(out, name); os.makedirs(d, exist_ok=True)
    for i, p in enumerate(poses):
        svg = R.draw(p, i, seed)
        f = os.path.join(d, f'{name}_{i:02d}.svg')
        open(f, 'w').write(svg)
        subprocess.run(['rsvg-convert', '-w', str(R.FW * 2), '-h', str(R.FH * 2), f, '-o', f[:-4] + '.png'], check=True)
        os.remove(f)
    return len(poses)


def main(out):
    os.makedirs(out, exist_ok=True)
    idle = [idle_pose(i // 2) for i in range(12)]          # on twos
    run = [run_pose(i) for i in range(12)]
    jump, jair = jump_frames()
    shoot = shoot_frames()
    parry, pair = parry_frames()
    meta = {}
    for seed, (name, poses) in enumerate((('idle', idle), ('run', run), ('jump', jump), ('shoot', shoot), ('parry', parry))):
        meta[name] = {'frames': render(name, poses, out, seed), 'fps': 24}
    meta['jump']['air'] = jair; meta['parry']['air'] = pair
    meta['size'] = [R.FW, R.FH]; meta['ground'] = R.GY; meta['root_x'] = ROOT
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), indent=1)
    print(json.dumps({k: v['frames'] for k, v in meta.items() if isinstance(v, dict)}))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
