"""SERRA · "Cada corte = ×2" (9:16, 1080×1920, 30 fps). Mesmo formato da LÂMINA (anel branco, título no topo), outro cortante:
um DISCO DE SERRA girando em alta rotação anda e ricocheteia dentro do anel. Toda bola em que os dentes encostam é cortada ao meio
(as metades se abrem dos dois lados do caminho da serra). Bolas de uma cor só, sem efeitos. Com o anel lotado, a serra perde
rotação, trava, racha e se parte em 4; o anel explode. Loop: 1 bola de novo.
Saída: out/serra-mudo.mp4 e out/eventos-serra.json (som: scripts/som_serra.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(909)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 7.0
RS, NT = 88.0, 26                        # raio da serra (ponta dos dentes) e nº de dentes
VS = 470.0                               # velocidade de deslocamento da serra
SPIN = 26.0                              # rotação (rad/s)
NMAX = 2048; VMIN, VMAX = 120.0, 240.0
COR = np.array([60, 200, 255], np.float32)  # uma cor só (azul-gelo, contrasta com o aço)
SPLIT = .38
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, sx, sy, svx, svy, cut, t, cool, ativo, cortar):
    nc = 0; sp_ = math.sqrt(svx * svx + svy * svy) + 1e-9
    for b in range(n):
        if viva[b] == 0: continue
        x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if viva[b] != 1 or not ativo: continue
        px, py = x[b] - CX, y[b] - CY; r = math.sqrt(px * px + py * py) + 1e-9
        if r > RA - RB:
            nx, ny = px / r, py / r; vn = vx[b] * nx + vy[b] * ny
            x[b] = CX + nx * (RA - RB); y[b] = CY + ny * (RA - RB)
            if vn > 0: vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
        dx, dy = x[b] - sx, y[b] - sy
        if cortar and dx * dx + dy * dy < (RS - 4) ** 2 and t - cool[b] > 1.0 and nc < cut.shape[0]:
            cut[nc] = b; nc += 1
        if not cortar:   # serra travada: vira obstáculo
            d = math.sqrt(dx * dx + dy * dy) + 1e-9
            if d < RS + RB: x[b] = sx + dx / d * (RS + RB); y[b] = sy + dy / d * (RS + RB)
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

@njit(cache=True)
def disco(img, cx, cy, rot, blur, alpha, trinca, a0, a1):
    """disco de serra: dentes inclinados (desfocados pela rotação), corpo de aço com reflexo, furos de alívio e cubo.
    a0..a1 = fatia angular desenhada (para os pedaços da quebra)"""
    rmax = RS + 2; x0, x1 = int(max(0, cx - rmax)), int(min(img.shape[1] - 1, cx + rmax)); y0, y1 = int(max(0, cy - rmax)), int(min(img.shape[0] - 1, cy + rmax))
    tp = 2 * math.pi / NT
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            dx, dy = xx + .5 - cx, yy + .5 - cy; d = math.sqrt(dx * dx + dy * dy)
            if d > rmax: continue
            ang = math.atan2(dy, dx)
            rel = (ang - a0) % (2 * math.pi)
            if rel > (a1 - a0) % (2 * math.pi + 1e-9) and (a1 - a0) < 2 * math.pi - 1e-6: continue
            # dentes: perfil dente-de-serra, média sobre a rotação do quadro (desfoque de movimento)
            cov = 0.0
            for k in range(5):
                u = ((ang - rot + blur * k / 5) % tp) / tp
                re = RS - 14 + 14 * (1 - u) ** 1.5
                cov += min(1.0, max(0.0, re - d + .5))
            cov /= 5
            body = min(1.0, max(0.0, RS - 13 - d + .5))
            a = max(cov, body) * alpha
            if a <= 0: continue
            # aço: gradiente por ângulo (reflexo que gira junto) e anel interno
            refl = .55 + .45 * math.cos(2 * (ang - rot * .2)) ** 2
            v = 150 + 90 * refl
            if d > RS - 13: v = 205 + 40 * refl            # dentes mais claros
            if abs(d - 52) < 2: v -= 60                     # anel gravado
            # furos de alívio (3) e cubo
            for h in range(3):
                ha = rot + h * 2.094; hx, hy = math.cos(ha) * 34, math.sin(ha) * 34
                if (dx - hx) ** 2 + (dy - hy) ** 2 < 81: a = 0.0
            if d < 15: v = 90 + 60 * refl
            if d < 6: a = 0.0
            if trinca > 0:
                for q in range(int(1 + trinca * 5)):
                    ta = q * 1.37 + 0.4
                    lx, ly = math.cos(ta), math.sin(ta)
                    pr = dx * lx + dy * ly
                    if pr > 18 and pr < RS - 10 and abs(-dx * ly + dy * lx + .15 * pr * math.sin(q)) < 1.4: v = 25.0
            img[yy, xx, 0] = img[yy, xx, 0] * (1 - a) + v * a; img[yy, xx, 1] = img[yy, xx, 1] * (1 - a) + v * a; img[yy, xx, 2] = img[yy, xx, 2] * (1 - a) + (v + 8) * a

def main():
    NB = NMAX + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    x[0], y[0], vx[0], vy[0], viva[0] = CX + 180, CY - 230, -120.0, 90.0, 1; n = 1
    sx, sy = CX - 150, CY + 180; a = -1.05; svx, svy = math.cos(a) * VS, math.sin(a) * VS
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64); cut = np.zeros(8192, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/serra-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = .5; rot = 0.0; spin = 0.0; cortes = 0; t_cheio = t_trava = t_exp = None; f = 0; pedacos = []; slashes = []; dobra = 1; vel = 1.0
    while True:
        t = f / FPS
        if t < T0: spin, vel = SPIN * t / T0, 0.0
        elif t_cheio is None: spin, vel = SPIN, 1.0
        else: k = max(0.0, 1 - (t - t_cheio) / 2.4) ** 1.3; spin, vel = SPIN * k, k
        if t_cheio is not None and spin <= .05 and t_trava is None: t_trava = t; EV.append((t, 'trava', 0))
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; rot += spin * dt
            if ativo and vel > 0:
                sx += svx * vel * dt; sy += svy * vel * dt
                px, py = sx - CX, sy - CY; r = math.hypot(px, py)
                if r > RA - RS:   # a serra ricocheteia no anel
                    nx, ny = px / r, py / r; vn = svx * nx + svy * ny; sx, sy = CX + nx * (RA - RS), CY + ny * (RA - RS)
                    if vn > 0: svx -= 2 * vn * nx; svy -= 2 * vn * ny; EV.append((t, 'ricochete', 0))
            nc = passo(x, y, vx, vy, viva, n, dt, sx, sy, svx, svy, cut, t, cool, ativo, t_cheio is None and t >= T0)
            sp_ = math.hypot(svx, svy) + 1e-9; ux, uy = svx / sp_, svy / sp_; nx, ny = -uy, ux     # o corte segue o caminho da serra
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + nx * sg * (RB + .6), cy0 + ny * sg * (RB + .6)
                    vx[k_], vy[k_] = v0x * .6 + nx * sg * 110, v0y * .6 + ny * sg * 110
                    viva[k_] = 1; cool[k_] = t; ts[k_] = t; nang[k_] = math.atan2(ny, nx); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1; EV.append((t, 'corte', 0))
                if len(slashes) < 60: slashes.append((cx0, cy0, math.atan2(uy, ux), t))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        while n >= dobra * 2: dobra *= 2; EV.append((t, 'dobrou', dobra))
        if n >= NMAX and t_cheio is None: t_cheio = t; EV.append((t, 'cheio', n))
        if t_trava is not None and t_exp is None and t >= t_trava + 1.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(700, 2100, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
            sx_q, sy_q, rot_q = sx, sy, rot
            quarto = [[k * math.pi / 2, math.cos(k * math.pi / 2 + math.pi / 4) * 700, math.sin(k * math.pi / 2 + math.pi / 4) * 700 - 400, R.uniform(-6, 6)] for k in range(4)]
        if t_exp is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 60) | (y < -60) | (x < -60) | (x > W + 60))] = 0
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
            f += 1
            if t_exp is not None and t > t_exp + 4.6: break
            if t > 120: break
            continue
        # ── desenho
        loop = t_exp is not None and t > t_exp + 3.0
        img = BG.copy()
        if not loop:
            if t_exp is None: anel(img, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
            else:
                k = t - t_exp
                for a0, pvx, pvy, rt in pedacos:
                    ox, oy = pvx * k, pvy * k + 450 * k * k; aa = a0 + rt * k
                    for j in range(5):
                        b0, b1 = aa + j * (2 * math.pi / 16) / 5, aa + (j + 1) * (2 * math.pi / 16) / 5
                        segmento(img, CX + ox + (RA + 6) * math.cos(b0), CY + oy + (RA + 6) * math.sin(b0), CX + ox + (RA + 6) * math.cos(b1), CY + oy + (RA + 6) * math.sin(b1), 8, max(0, 1 - k / 2.2), 1.2)
            for i in np.nonzero(viva > 0)[0]:
                u = (t - ts[i]) / SPLIT
                if 0 <= u < 1 and viva[i] == 1:
                    e_ = 1 - (1 - u) ** 3; px_, py_ = c0x[i] + (x[i] - c0x[i]) * e_, c0y[i] + (y[i] - c0y[i]) * e_
                    nn = nang[i]; meia(img, px_, py_, RB, math.cos(nn), math.sin(nn), side[i], COR[0], COR[1], COR[2], 0.0)
                    if u > .6: blit(img, spr, x[i], y[i], (u - .6) / .4)
                else: blit(img, spr, x[i], y[i], 1.0)
            slashes = [s__ for s__ in slashes if t - s__[3] < .22]
            for sx_, sy_, sth, st in slashes:
                u = (t - st) / .22; c_, s_ = math.cos(sth), math.sin(sth); h = RB * 2.6
                segmento_cor(img, sx_ - c_ * h, sy_ - s_ * h, sx_ + c_ * h, sy_ + s_ * h, 2.5, (255, 255, 255), 1 - u)
            if t_exp is None:
                sh = (math.sin(t * 60) * 5 * min(1, (t - t_trava) / 1.4)) if t_trava is not None else 0.0
                disco(img, sx + sh, sy, rot, min(.24, spin / FPS), 1.0, (t - t_trava) / 1.4 if t_trava is not None else 0.0, 0.0, 2 * math.pi)
            else:
                k = t - t_exp
                for a0, pvx, pvy, rt in quarto:
                    disco(img, sx_q + pvx * k, sy_q + pvy * k + 800 * k * k, rot_q + rt * k, 0.0, max(0, 1 - k / 2.5), 1.0, a0 + rot_q + rt * k, a0 + rot_q + rt * k + math.pi / 2)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); disco(tmp, CX - 150, CY + 180, 0.0, 0.0, 1.0, 0.0, 0.0, 2 * math.pi)
            blit(tmp, spr, CX + 180, CY - 230, 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'SERRA', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 54, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até a serra travar? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is not None: poe_texto(img, 'TRAVOU...' if t_trava is not None else 'TRAVANDO...', 60, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEBROU!', 170, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'spin': SPIN, 'eventos': EV}, open(f'{ROOT}/out/eventos-serra.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
