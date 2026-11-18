"""LÂMINA · "Cada corte = +1 bola" (9:16, 1080×1920, 30 fps). Formato do estilo "anel + arma girando", com arte e mecânica próprias:
1 bola quica num anel branco; no centro, uma lâmina (cabo vermelho, lâmina de aço) gira cada vez mais rápido, com rastro.
Cada vez que a lâmina acerta uma bola, ela é CORTADA em duas (a metade nova sai pelo lado de trás da lâmina). Com 1.500 bolas,
a lâmina começa a travar, para, racha e QUEBRA; o anel explode e as bolas voam. Loop: 1 bola de novo.
Saída: out/lamina-mudo.mp4 e out/eventos-lamina.json (som: scripts/som_lamina.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(808)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 8.0
L, LH, BT = 395.0, 95.0, 7.0            # comprimento total, cabo, meia espessura da lâmina
NMAX = 1500; VMIN = 380.0
HUE = np.array([[255, 77, 90], [255, 122, 61], [255, 172, 51], [255, 214, 64], [190, 230, 70], [80, 220, 120],
                [45, 210, 190], [46, 170, 241], [70, 120, 255], [130, 95, 240], [190, 85, 230], [255, 80, 170]], np.float32)
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, th, om, hits, ativo):
    dxb, dyb = math.cos(th), math.sin(th); nh = 0
    for b in range(n):
        if viva[b] == 0: continue
        x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if viva[b] != 1 or not ativo: continue
        px, py = x[b] - CX, y[b] - CY; r = math.sqrt(px * px + py * py) + 1e-9
        if r > RA - RB:   # anel
            nx, ny = px / r, py / r; vn = vx[b] * nx + vy[b] * ny
            x[b] = CX + nx * (RA - RB); y[b] = CY + ny * (RA - RB)
            if vn > 0: vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
            px, py = x[b] - CX, y[b] - CY
        s = px * dxb + py * dyb
        if s < 0: s = 0.0
        if s > L: s = L
        qx, qy = dxb * s, dyb * s; ex, ey = px - qx, py - qy; d = math.sqrt(ex * ex + ey * ey)
        if d < RB + BT:
            if d < 1e-6: ex, ey, d = -dyb, dxb, 1.0
            nx, ny = ex / d, ey / d
            x[b] = CX + qx + nx * (RB + BT); y[b] = CY + qy + ny * (RB + BT)
            svx, svy = -om * qy, om * qx                       # velocidade da lâmina no ponto
            rvx, rvy = vx[b] - svx, vy[b] - svy; vn = rvx * nx + rvy * ny
            if vn < 0:
                rvx -= 2 * vn * nx; rvy -= 2 * vn * ny; vx[b] = rvx + svx; vy[b] = rvy + svy
                if s > LH and nh < hits.shape[0]: hits[nh, 0] = b; hits[nh, 1] = int(s); nh += 1
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > 1800: vx[b] *= 1800 / sp; vy[b] *= 1800 / sp
    return nh

def lamina(img, th, alpha, trinca=0.0, cx=CX, cy=CY, l0=0.0, l1=L):
    c, s = math.cos(th), math.sin(th)
    # cabo vermelho com faixas, guarda e lâmina de aço com fio claro
    a0, a1 = max(l0, 0), min(l1, LH)
    if a1 > a0:
        segmento_cor(img, cx + c * a0, cy + s * a0, cx + c * a1, cy + s * a1, 9, (200, 30, 45), alpha)
        for k in range(int(a0 // 14), int(a1 // 14)):
            u = k * 14 + 7; segmento_cor(img, cx + c * u - s * 9, cy + s * u + c * 9, cx + c * u + s * 9, cy + s * u - c * 9, 2.5, (30, 10, 14), alpha)
    if l0 <= LH <= l1: segmento_cor(img, cx + c * LH - s * 15, cy + s * LH + c * 15, cx + c * LH + s * 15, cy + s * LH - c * 15, 6, (205, 200, 185), alpha)
    b0, b1 = max(l0, LH + 4), l1
    if b1 > b0:
        segmento(img, cx + c * b0, cy + s * b0, cx + c * b1, cy + s * b1, 12, alpha, 1.15)
        segmento_cor(img, cx + c * b0 - s * 3, cy + s * b0 + c * 3, cx + c * (b1 - 8) - s * 3, cy + s * (b1 - 8) + c * 3, 2, (255, 255, 255), alpha)
    if trinca > 0:
        rq = np.random.default_rng(3)
        for q in range(int(1 + trinca * 7)):
            u = rq.uniform(LH + 30, L - 20); w = rq.uniform(-1, 1) * 8
            segmento_cor(img, cx + c * u - s * w, cy + s * u + c * w, cx + c * (u + 14) + s * w, cy + s * (u + 14) - c * w, 2, (20, 20, 24), alpha * min(1, trinca * 2))

@njit(cache=True)
def _seg(img, ax, ay, bx, by, th, r, g, b, alpha):
    x0, x1 = int(max(0, min(ax, bx) - th)), int(min(img.shape[1] - 1, max(ax, bx) + th)); y0, y1 = int(max(0, min(ay, by) - th)), int(min(img.shape[0] - 1, max(ay, by) + th))
    ex, ey = bx - ax, by - ay; L2 = ex * ex + ey * ey + 1e-9
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            px, py = xx + .5 - ax, yy + .5 - ay; u = min(1.0, max(0.0, (px * ex + py * ey) / L2))
            dx, dy = px - u * ex, py - u * ey; d = math.sqrt(dx * dx + dy * dy)
            cov = min(1.0, max(0.0, th / 2 - d + .5)) * alpha
            if cov > 0:
                img[yy, xx, 0] = img[yy, xx, 0] * (1 - cov) + r * cov; img[yy, xx, 1] = img[yy, xx, 1] * (1 - cov) + g * cov; img[yy, xx, 2] = img[yy, xx, 2] * (1 - cov) + b * cov
def segmento_cor(img, ax, ay, bx, by, th, rgb, alpha): _seg(img, ax, ay, bx, by, th, rgb[0], rgb[1], rgb[2], alpha)

def main():
    NB = NMAX + 10
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64); cor = np.zeros(NB, np.int64); ult = np.full(NB, -9.0)
    x[0], y[0], vx[0], vy[0], viva[0] = CX - 250, CY + 230, 330.0, -420.0, 1; n = 1
    sprs = [sprite(c, RB) for c in HUE]; ca = np.zeros(32768, np.int64); cb = np.zeros(32768, np.int64); hits = np.zeros((4096, 2), np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/lamina-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = .6; th = -.5; om = 0.0; cortes = 0; t_cheio = t_trava = t_exp = None; f = 0; trail = np.zeros((H, W, 3), np.float32); rips = []; ultr = -9.0; hist = []; pedacos = []; om_pico = 0.0
    while True:
        t = f / FPS
        if t_cheio is None: om = 0 if t < T0 else min(7.5, 2.0 + .095 * (t - T0))          # gira cada vez mais rápido
        else: om = om_pico * max(0.0, 1 - (t - t_cheio) / 3.6) ** 1.5                          # trava com a carga
        if t_cheio is not None and om <= .02 and t_trava is None: t_trava = t; EV.append((t, 'trava', 0))
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; th += om * dt
            nh = passo(x, y, vx, vy, viva, n, dt, th, om, hits, ativo)
            if t >= T0 and ativo:
                for q in range(nh):
                    b, s = hits[q]
                    if n < min(NMAX, 2 ** ((t - T0) / 5.0 + .4)) and t - ult[b] > .2:
                        c_, s_ = math.cos(th), math.sin(th); px, py = x[b] - CX, y[b] - CY
                        side = 1.0 if (c_ * py - s_ * px) > 0 else -1.0; nx, ny = -s_ * side, c_ * side
                        qx, qy = c_ * s, s_ * s
                        x[n], y[n] = CX + qx - nx * (RB + BT + 1), CY + qy - ny * (RB + BT + 1)    # metade nova atrás da lâmina
                        vn = vx[b] * nx + vy[b] * ny; vx[n], vy[n] = vx[b] - 2 * vn * nx, vy[b] - 2 * vn * ny
                        g = (cortes // 30 + 1) % len(HUE); cor[b] = g; cor[n] = g
                        viva[n] = 1; ult[b] = ult[n] = t; n += 1; cortes += 1; EV.append((t, 'corte', int(s)))
                        if len(rips) < 40 and t - ultr > .02: rips.append((CX + qx, CY + qy, t)); ultr = t
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        if n >= NMAX and t_cheio is None: t_cheio = t; om_pico = om; EV.append((t, 'cheio', n))
        if t_trava is not None and t_exp is None and t >= t_trava + 1.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(800, 2300, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
            th_q = th; lam = [[0, LH, -300, -500, -4], [LH, 220, 200, -700, 5], [220, 310, -150, -900, -6], [310, L, 400, -600, 7]]
        if t_exp is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 60) | (y < -60) | (x < -60) | (x > W + 60))] = 0
        hist.append(th); hist = hist[-6:]
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas · ω', round(om, 2), flush=True)
            f += 1
            if t_exp is not None and t > t_exp + 4.6: break
            if t > 95: break
            continue
        # ── desenho
        loop = t_exp is not None and t > t_exp + 3.0
        trail *= .80
        if not loop:
            for i in np.nonzero(viva > 0)[0]: blit(trail, sprs[cor[i]], x[i], y[i], .55)
        img = BG + trail * .9
        if not loop:
            if t_exp is None:
                anel(img, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
                # rastro da lâmina: cópias apagadas nos ângulos anteriores (quanto mais rápida, mais longo)
                for k in range(1, 6):
                    ang = th - om * k / FPS * .5
                    segmento(img, CX + math.cos(ang) * (LH + 6), CY + math.sin(ang) * (LH + 6), CX + math.cos(ang) * L, CY + math.sin(ang) * L, 12, .16 * (1 - k / 6) * min(1, om / 3), 1.0)
                rips = [r_ for r_ in rips if t - r_[2] < .35]
                for rx, ry, rt in rips: u = (t - rt) / .35; anel(img, rx, ry, 5 + 34 * u, 3, 0.0, -1.0, 1.2, .8 * (1 - u))
            else:
                k = t - t_exp
                for a0, pvx, pvy, rot in pedacos:
                    ox, oy = pvx * k, pvy * k + 450 * k * k; aa = a0 + rot * k
                    for j in range(5):
                        b0, b1 = aa + j * (2 * math.pi / 16) / 5, aa + (j + 1) * (2 * math.pi / 16) / 5
                        segmento(img, CX + ox + (RA + 6) * math.cos(b0), CY + oy + (RA + 6) * math.sin(b0), CX + ox + (RA + 6) * math.cos(b1), CY + oy + (RA + 6) * math.sin(b1), 8, max(0, 1 - k / 2.2), 1.2)
            for i in np.nonzero(viva > 0)[0]: blit(img, sprs[cor[i]], x[i], y[i], 1.0)
            if t_exp is None:
                sh = (math.sin(t * 60) * 5 * min(1, (t - t_trava) / 1.4)) if t_trava is not None else 0.0
                lamina(img, th, 1.0, trinca=(t - t_trava) / 1.4 if t_trava is not None else 0.0, cx=CX + sh, cy=CY)
            else:
                k = t - t_exp
                for l0, l1, pvx, pvy, rot in lam:
                    mid = (l0 + l1) / 2; mx, my = CX + math.cos(th_q) * mid + pvx * k, CY + math.sin(th_q) * mid + pvy * k + 700 * k * k
                    ang = th_q + rot * k; cx_, cy_ = mx - math.cos(ang) * mid, my - math.sin(ang) * mid
                    lamina(img, ang, max(0, 1 - k / 2.5), cx=cx_, cy=cy_, l0=l0, l1=l1)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); lamina(tmp, -.5, 1.0)
            blit(tmp, sprs[0], CX - 250, CY + 230, 1.0); img = img * (1 - k_) + tmp * k_
        # textos
        poe_texto(img, 'LÂMINA', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = +1 bola', 50, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até a lâmina quebrar? Chuta!', 42, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is not None: poe_texto(img, 'TRAVANDO...' if t_trava is None else 'VAI QUEBRAR!', 60, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEBROU!', 170, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas · ω', round(om, 2), flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 95: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': n, 'cortes': cortes, 'eventos': EV}, open(f'{ROOT}/out/eventos-lamina.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
