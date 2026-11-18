"""ENGRENAGENS · "Cada dente que toca duplica a bola" (9:16, 1080×1920, 30 fps). Um formato só:
1 bola cai dentro de uma máquina com 3 engrenagens engrenadas (dentes de verdade, girando em sentidos opostos). A bola que toca a
ponta de um dente ganha uma cópia e é arremessada pela velocidade da superfície. A máquina enche, perde velocidade com a carga,
TRAVA, treme, trinca e EXPLODE: as engrenagens se partem em pedaços e as paredes voam. Loop: volta à máquina vazia com 1 bola.
Saída: out/engrenagens-mudo.mp4 e out/eventos-engrenagens.json (som: scripts/som_engrenagens.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
from PIL import Image, ImageDraw
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(31)
RB, G, NMAX = 8.0, 900.0, 2400
BX0, BX1, BY0, BY1 = 80.0, 1000.0, 480.0, 1600.0          # carcaça da máquina
HD = 20.0                                                  # altura do dente (± em volta do raio primitivo)
COLS = np.array([[255, 214, 64], [46, 196, 241], [255, 93, 162], [61, 220, 132], [255, 159, 28], [255, 255, 255]], np.float32)
GCOR = [(255, 196, 40), (46, 196, 241), (255, 93, 162)]
EV = []

def montar():
    """3 engrenagens: posição, nº de dentes, raio primitivo, razão de giro e fase para engrenar."""
    N = [14, 10, 14]; m = 21.0; rp = [m * k / 2 for k in N]
    c = [(330.0, 820.0)]; ang = [math.radians(38), math.radians(52)]
    for k in range(2):
        d = rp[k] + rp[k + 1] + 3; c.append((c[k][0] + d * math.cos(ang[k]), c[k][1] + d * math.sin(ang[k])))
    rho = [1.0]; phi = [0.0]
    for k in range(2):
        rho.append(-rho[k] * N[k] / N[k + 1]); a = ang[k]
        phi.append((N[k] * (a - phi[k]) + N[k + 1] * (a + math.pi) - math.pi) / N[k + 1])
    return (np.array([p[0] for p in c]), np.array([p[1] for p in c]), np.array(N, np.float64), np.array(rp), np.array(rho), np.array(phi))
GX, GY, GN, GR, GRHO, GPHI = montar()
GX += 540 - ((GX - GR).min() + (GX + GR).max()) / 2; GY += (BY0 + BY1) / 2 - 60 - ((GY - GR).min() + (GY + GR).max()) / 2

@njit(cache=True)
def perfil(u):  # forma do dente (onda quadrada suavizada), u = N·(θ − rot)
    v = 1.7 * math.cos(u)
    return max(-1.0, min(1.0, v)), (-1.7 * math.sin(u) if abs(v) < 1 else 0.0)

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, gx, gy, gn, gr, rot, om, dt, grav, hits, hd, rb, bx0, bx1, by0, by1, vmin, ativo):
    nh = 0
    for b in range(n):
        if viva[b] != 1 and viva[b] != 2: continue
        vy[b] += grav * dt; x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if not ativo or viva[b] != 1: continue
        # paredes
        if x[b] < bx0 + rb: x[b] = bx0 + rb; vx[b] = abs(vx[b])
        if x[b] > bx1 - rb: x[b] = bx1 - rb; vx[b] = -abs(vx[b])
        if y[b] < by0 + rb: y[b] = by0 + rb; vy[b] = abs(vy[b])
        if y[b] > by1 - rb: y[b] = by1 - rb; vy[b] = -abs(vy[b])
        for k in range(gx.shape[0]):
            dx, dy = x[b] - gx[k], y[b] - gy[k]; d = math.sqrt(dx * dx + dy * dy) + 1e-9
            if d > gr[k] + hd + rb + 1: continue
            th = math.atan2(dy, dx); u = gn[k] * (th - rot[k]); p, dp = perfil(u)
            rl = gr[k] + hd * p
            if d >= rl + rb: continue
            er_x, er_y = dx / d, dy / d; et_x, et_y = -er_y, er_x
            dr = hd * dp * gn[k] / d  # derivada do raio pelo ângulo, já dividida por d
            nx, ny = er_x - dr * et_x, er_y - dr * et_y; nl = math.sqrt(nx * nx + ny * ny); nx /= nl; ny /= nl
            pen = (rl + rb - d) / nl
            x[b] += nx * pen; y[b] += ny * pen
            sx, sy = -om[k] * dy, om[k] * dx            # velocidade da superfície da engrenagem
            rx, ry = vx[b] - sx, vy[b] - sy; vn = rx * nx + ry * ny
            if vn < 0:
                rx -= 2 * vn * nx; ry -= 2 * vn * ny; vx[b] = rx + sx; vy[b] = ry + sy
                if p > .4 and nh < hits.shape[0]: hits[nh, 0] = b; hits[nh, 1] = k; nh += 1
        sp = math.sqrt(vx[b] * vx[b] + vy[b] * vy[b])
        if sp < vmin and sp > 1e-6: vx[b] *= vmin / sp; vy[b] *= vmin / sp
        if sp > 2200: vx[b] *= 2200 / sp; vy[b] *= 2200 / sp
    return nh

def contorno(k, rot, npts=420):
    th = np.linspace(0, 2 * math.pi, npts, endpoint=False); v = np.clip(1.7 * np.cos(GN[k] * (th - rot)), -1, 1)
    r = GR[k] + HD * v; return th, r

def desenha_engrenagem(img, k, rot, cx, cy, alpha=1.0, fatia=None, giro=0.0, trinca=0.0):
    """Desenha a engrenagem k (ou só uma fatia angular dela, para os pedaços da explosão)."""
    th, r = contorno(k, rot)
    if fatia is not None:
        a0, a1 = fatia; m = ((th - a0) % (2 * math.pi)) < ((a1 - a0) % (2 * math.pi))
        th, r = th[m], r[m]
        pts = [(0.0, 0.0)] + list(zip((r * np.cos(th)).tolist(), (r * np.sin(th)).tolist()))
    else:
        pts = list(zip((r * np.cos(th)).tolist(), (r * np.sin(th)).tolist()))
    cg, sg = math.cos(giro), math.sin(giro); pts = [(cx + px * cg - py * sg, cy + px * sg + py * cg) for px, py in pts]
    s = int(GR[k] + HD + 12); x0, y0 = int(cx - s), int(cy - s)
    if fatia is not None: s = int(GR[k] + HD + 12) * 2; x0, y0 = int(cx - s), int(cy - s)
    lay = Image.new('RGBA', (2 * s, 2 * s), (0, 0, 0, 0)); dr = ImageDraw.Draw(lay)
    col = GCOR[k]; esc = tuple(int(c * .32) for c in col)
    dr.polygon([(px - x0, py - y0) for px, py in pts], fill=esc + (255,), outline=col + (255,), width=6)
    if fatia is None:
        cxl, cyl = cx - x0, cy - y0; rr = GR[k] * .62
        dr.ellipse([cxl - rr, cyl - rr, cxl + rr, cyl + rr], outline=col + (150,), width=4)
        for q in range(5):  # furos que mostram o giro
            a = rot + q * 2 * math.pi / 5; hx, hy = cxl + GR[k] * .4 * math.cos(a), cyl + GR[k] * .4 * math.sin(a); hr = GR[k] * .13
            dr.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=(14, 16, 22, 255), outline=col + (200,), width=3)
        hr = GR[k] * .14; dr.ellipse([cxl - hr, cyl - hr, cxl + hr, cyl + hr], fill=col + (255,))
        if trinca > 0:
            rq = np.random.default_rng(k * 7 + 1)
            for q in range(int(1 + trinca * 6)):
                a = rq.uniform(0, 2 * math.pi); px, py = cxl, cyl; seg = [(px, py)]
                for _ in range(5):
                    a += rq.uniform(-.5, .5); px += math.cos(a) * GR[k] * .2; py += math.sin(a) * GR[k] * .2; seg.append((px, py))
                dr.line(seg, fill=(255, 255, 255, int(230 * min(1, trinca * 2))), width=3)
    a = np.asarray(lay, np.float32); al = a[..., 3:4] / 255 * alpha
    ya, yb, xa, xb = max(0, y0), min(H, y0 + 2 * s), max(0, x0), min(W, x0 + 2 * s)
    if ya >= yb or xa >= xb: return
    sub = a[ya - y0:yb - y0, xa - x0:xb - x0]; sal = al[ya - y0:yb - y0, xa - x0:xb - x0]
    img[ya:yb, xa:xb] = img[ya:yb, xa:xb] * (1 - sal) + sub[..., :3] * sal

def carcaca(img, alpha=1.0, off=None):
    off = off or [(0, 0, 0)] * 4
    L = [(BX0, BY0, BX1, BY0), (BX1, BY0, BX1, BY1), (BX1, BY1, BX0, BY1), (BX0, BY1, BX0, BY0)]
    for (ax, ay, bx, by), (ox, oy, rg) in zip(L, off):
        mx_, my_ = (ax + bx) / 2 + ox, (ay + by) / 2 + oy; hx, hy = (bx - ax) / 2, (by - ay) / 2; c, s = math.cos(rg), math.sin(rg)
        segmento(img, mx_ - hx * c + hy * s, my_ - hx * s - hy * c, mx_ + hx * c - hy * s, my_ + hx * s + hy * c, 12, alpha, .85)
    if off[0] == (0, 0, 0):
        for px, py in [(BX0, BY0), (BX1, BY0), (BX0, BY1), (BX1, BY1)]: blit(img, PARAF, px, py, alpha)

PARAF = sprite(np.array([200, 205, 215], np.float32), 13)

def main():
    x = np.zeros(NMAX); y = np.zeros(NMAX); vx = np.zeros(NMAX); vy = np.zeros(NMAX); viva = np.zeros(NMAX, np.int64); cor = np.zeros(NMAX, np.int64)
    X0, Y0 = 540.0, 560.0; x[0], y[0], viva[0] = X0, Y0, 1; n = 1
    sprs = [sprite(c, RB) for c in COLS]; ca = np.zeros(32768, np.int64); cb = np.zeros(32768, np.int64); hits = np.zeros((4096, 2), np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/engrenagens-mudo.mp4'], stdin=subprocess.PIPE)
    T0, OM0 = 1.2, 1.25
    Th = 0.0; om_m = 0.0; t_cheio = t_trava = t_exp = None; f = 0; dente_ant = 0; pecas = []; paredes = None; vel = 1.0
    while True:
        t = f / FPS
        # velocidade da máquina: cai com a carga; depois de cheia, trava em 3 s
        if t < T0: vel = 0.0
        elif t_cheio is None: vel = 1 - .35 * (n / NMAX) ** 2
        else: vel = max(0.0, .65 * (1 - (t - t_cheio) / 3.0)) ** 1.4
        if t_cheio is not None and vel == 0 and t_trava is None: t_trava = t; EV.append((t, 'trava', 0))
        om_m = OM0 * vel; rot = GRHO * Th + GPHI; om = GRHO * om_m
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB
            Th += om_m * dt; rot = GRHO * Th + GPHI
            nh = passo(x, y, vx, vy, viva, n, GX, GY, GN, GR, rot, om, dt, (G if ativo else 1600.0) if t >= T0 else 0.0, hits, HD, RB, BX0, BX1, BY0, BY1, 420.0 if ativo else 0.0, ativo)
            if ativo and t >= T0:
                for q in range(nh):
                    b, k = hits[q]
                    if n < min(NMAX, 2 ** ((t - T0) / 4.7 + .4)):
                        a = R.uniform(-.8, .8); c_, s_ = math.cos(a), math.sin(a)
                        x[n], y[n] = x[b], y[b]; vx[n], vy[n] = vx[b] * c_ - vy[b] * s_, vx[b] * s_ + vy[b] * c_
                        viva[n] = 1; cor[n] = k if R.random() < .7 else R.integers(0, len(COLS)); n += 1
                        EV.append((t, 'dente', int(k)))
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
            elif not ativo:
                pass
        if n >= NMAX and t_cheio is None: t_cheio = t; EV.append((t, 'cheio', n))
        dn = int(math.floor(Th * GN[0] / (2 * math.pi)))
        if dn != dente_ant: EV.append((t, 'passo', 0)); dente_ant = dn
        if t_trava is not None and t_exp is None and t >= t_trava + 1.6:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; cxm, cym = (BX0 + BX1) / 2, (BY0 + BY1) / 2; dx, dy = x[m] - cxm, y[m] - cym; d = np.hypot(dx, dy) + 1e-9
            sp = R.uniform(700, 2000, m.sum()); vx[m] = dx / d * sp; vy[m] = dy / d * sp - 400; viva[m] = 2
            for k in range(3):
                for q in range(6):
                    a0 = q * math.pi / 3; am = a0 + math.pi / 6; spd = R.uniform(500, 1000)
                    pecas.append([k, (a0, a0 + math.pi / 3), GX[k], GY[k], math.cos(am) * spd + (GX[k] - 540) * 2, math.sin(am) * spd - 500, 0.0, R.uniform(-6, 6), rot[k]])
            paredes = [[0.0, 0.0, 0.0, R.uniform(-300, 300), -900, R.uniform(-2, 2)], [0, 0, 0, 900, R.uniform(-400, 0), R.uniform(-2, 2)],
                       [0, 0, 0, R.uniform(-300, 300), 700, R.uniform(-2, 2)], [0, 0, 0, -900, R.uniform(-400, 0), R.uniform(-2, 2)]]
        if t_exp is not None:
            dt = 1 / FPS
            viva[(viva == 2) & ((y > H + 80) | (x < -80) | (x > W + 80))] = 3
            for p in pecas: p[2] += p[4] * dt; p[3] += p[5] * dt; p[5] += 1400 * dt; p[6] += p[7] * dt
            for p in paredes: p[0] += p[3] * dt; p[1] += p[4] * dt; p[4] += 1400 * dt; p[2] += p[5] * dt
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas · vel', round(vel, 2), flush=True)
            f += 1
            if t_exp is not None and t > t_exp + 4.6: break
            if t > 100: break
            continue
        # ── desenho
        img = BG.copy()
        loop = t_exp is not None and t > t_exp + 3.0
        tremor = (0.0, 0.0)
        if t_trava is not None and t_exp is None: a_ = 4 + 10 * (t - t_trava); tremor = (R.uniform(-a_, a_), R.uniform(-a_, a_))
        elif t_cheio is not None and t_exp is None: a_ = 3 * (t - t_cheio); tremor = (R.uniform(-a_, a_), R.uniform(-a_, a_))
        if not loop:
            if t_exp is None:
                carcaca(img)
                for k in range(3):
                    tri = 0.0 if t_trava is None else (t - t_trava) / 1.6
                    desenha_engrenagem(img, k, rot[k], GX[k] + tremor[0], GY[k] + tremor[1], trinca=tri)
            else:
                ka = max(0.0, 1 - (t - t_exp) / 2.2)
                carcaca(img, ka, [(p[0], p[1], p[2]) for p in paredes])
                for p in pecas: desenha_engrenagem(img, p[0], p[8], p[2], p[3], ka, fatia=p[1], giro=p[6])
            for i in np.nonzero((viva == 1) | (viva == 2))[0]: blit(img, sprs[cor[i]], x[i] + (tremor[0] if viva[i] == 1 else 0), y[i] + (tremor[1] if viva[i] == 1 else 0), 1.0)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .7   # clarão
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); carcaca(tmp)
            for k in range(3): desenha_engrenagem(tmp, k, GPHI[k], GX[k], GY[k])
            blit(tmp, sprs[0], X0, Y0, 1.0); img = img * (1 - k_) + tmp * k_
        # textos
        if t < 3.6:
            poe_texto(img, 'CADA DENTE QUE TOCA', 64, 540, 285, (255, 255, 255), 1, '800', 10, pop_in(t, 0))
            poe_texto(img, 'DUPLICA A BOLA', 74, 540, 375, (255, 214, 64), 1, '800', 10, pop_in(t, .15))
            poe_texto(img, 'Quantas até a máquina travar? Chuta!', 42, 540, 1690, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 130, 540, 290, (255, 255, 255), 1, '800', 14)
            if t_exp is None:
                pct = int(round(vel * 100))
                if t_cheio is None: poe_texto(img, f'velocidade da máquina: {pct}%', 40, 540, 385, (255, 214, 64) if vel > .75 else (255, 77, 90), 1, '800', 6)
                else:
                    msg = 'TRAVANDO...' if t_trava is None else 'TRAVOU!'
                    poe_texto(img, msg, 64, 540, 395, (255, 77, 90), 1, '800', 10, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEBROU!', 160, 540, 820, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'TRAVOU COM {fmt(n)} BOLAS!', 58, 540, 980, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1690, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas · vel', round(vel, 2), flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 100: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': n, 'eventos': EV}, open(f'{ROOT}/out/eventos-engrenagens.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
