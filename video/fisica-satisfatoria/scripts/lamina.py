"""LÂMINA v2 · "Cada volta da lâmina = ×2" (9:16, 1080×1920, 30 fps). Estilo "anel + arma girando", arte e mecânica próprias.
Versão calma (pedido do usuário): a lâmina gira DEVAGAR e constante; toda bola que ela atravessa é CORTADA ao meio e vira duas
(as duas metades se abrem na linha do corte e se afastam devagar). Como a lâmina varre o anel inteiro a cada volta, as bolas
DOBRAM a cada volta: 1, 2, 4 … 2.048. Bolas de uma cor só, sem rastro, devagar. Com o anel lotado a lâmina trava, racha e quebra.
Saída: out/lamina-mudo.mp4 e out/eventos-lamina.json (som: scripts/som_lamina.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(808)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 7.0
L, LH, BT = 424.0, 70.0, 6.0             # lâmina vai até quase o anel
OM = 2 * math.pi / 5.4                   # uma volta a cada 5,4 s
NMAX = 2048; VMIN, VMAX = 55.0, 140.0
COR = np.array([255, 96, 70], np.float32)  # uma cor só
SPLIT = .38                              # duração da abertura das metades
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, th, cut, t, cool, ativo, cortar):
    dxb, dyb = math.cos(th), math.sin(th); nc = 0
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
        if s < 0: continue
        e = px * (-dyb) + py * dxb                 # distância assinada até a linha da lâmina
        if s < LH:                                  # cabo: empurra devagar
            if abs(e) < RB + 9:
                sg = 1.0 if e >= 0 else -1.0; x[b] += -dyb * sg * (RB + 9 - abs(e)); y[b] += dxb * sg * (RB + 9 - abs(e))
            continue
        if cortar and s < L and abs(e) < 3.5 and t - cool[b] > 1.0 and nc < cut.shape[0]:
            cut[nc] = b; nc += 1
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

@njit(cache=True)
def meia(img, cx, cy, r, nx, ny, side, cr, cg, cb, gap):
    # meio disco: só os pixels do lado "side" da linha de corte (normal n), com borda suave
    x0, x1 = int(max(0, cx - r - 2)), int(min(img.shape[1] - 1, cx + r + 2)); y0, y1 = int(max(0, cy - r - 2)), int(min(img.shape[0] - 1, cy + r + 2))
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            dx, dy = xx + .5 - cx, yy + .5 - cy; d = math.sqrt(dx * dx + dy * dy)
            a = min(1.0, max(0.0, r - d + .5)) * min(1.0, max(0.0, (dx * nx + dy * ny) * side - gap + .5))
            if a > 0:
                img[yy, xx, 0] = img[yy, xx, 0] * (1 - a) + cr * a; img[yy, xx, 1] = img[yy, xx, 1] * (1 - a) + cg * a; img[yy, xx, 2] = img[yy, xx, 2] * (1 - a) + cb * a

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

def lamina(img, th, alpha, trinca=0.0, cx=CX, cy=CY, l0=0.0, l1=L):
    c, s = math.cos(th), math.sin(th)
    a0, a1 = max(l0, 0), min(l1, LH)
    if a1 > a0:
        segmento_cor(img, cx + c * a0, cy + s * a0, cx + c * a1, cy + s * a1, 9, (200, 30, 45), alpha)
        for k in range(int(a0 // 14), int(a1 // 14)):
            u = k * 14 + 7; segmento_cor(img, cx + c * u - s * 9, cy + s * u + c * 9, cx + c * u + s * 9, cy + s * u - c * 9, 2.5, (30, 10, 14), alpha)
    if l0 <= LH <= l1: segmento_cor(img, cx + c * LH - s * 15, cy + s * LH + c * 15, cx + c * LH + s * 15, cy + s * LH - c * 15, 6, (205, 200, 185), alpha)
    b0, b1 = max(l0, LH + 4), l1
    if b1 > b0:
        segmento(img, cx + c * b0, cy + s * b0, cx + c * b1, cy + s * b1, 10, alpha, 1.15)
        segmento_cor(img, cx + c * b0 - s * 2.5, cy + s * b0 + c * 2.5, cx + c * (b1 - 8) - s * 2.5, cy + s * (b1 - 8) + c * 2.5, 2, (255, 255, 255), alpha)
    if trinca > 0:
        rq = np.random.default_rng(3)
        for q in range(int(1 + trinca * 7)):
            u = rq.uniform(LH + 30, L - 20); w = rq.uniform(-1, 1) * 7
            segmento_cor(img, cx + c * u - s * w, cy + s * u + c * w, cx + c * (u + 14) + s * w, cy + s * (u + 14) - c * w, 2, (20, 20, 24), alpha * min(1, trinca * 2))

def main():
    NB = NMAX + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    a = R.uniform(0, 2 * math.pi); x[0], y[0], vx[0], vy[0], viva[0] = CX + 250, CY + 120, math.cos(a) * 90, math.sin(a) * 90, 1; n = 1
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64); cut = np.zeros(8192, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/lamina-mudo.mp4'], stdin=subprocess.PIPE)
    th0 = -2.2; th = th0; cortes = 0; t_cheio = t_trava = t_exp = None; f = 0; pedacos = []; slashes = []; volta_ant = 0; om = OM
    while True:
        t = f / FPS
        om = OM if t_cheio is None else OM * max(0.0, 1 - (t - t_cheio) / 2.2) ** 1.4
        if t_cheio is not None and om <= .01 and t_trava is None: t_trava = t; EV.append((t, 'trava', 0))
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; th += om * dt
            nc = passo(x, y, vx, vy, viva, n, dt, th, cut, t, cool, ativo, t_cheio is None)
            c_, s_ = math.cos(th), math.sin(th); nx, ny = -s_, c_
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + nx * sg * (RB + .6), cy0 + ny * sg * (RB + .6)
                    vx[k_], vy[k_] = v0x * .6 + nx * sg * 60, v0y * .6 + ny * sg * 60
                    viva[k_] = 1; cool[k_] = t; ts[k_] = t; nang[k_] = math.atan2(ny, nx); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1; EV.append((t, 'corte', 0))
                if len(slashes) < 60: slashes.append((cx0, cy0, th, t))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        volta = int((th - th0) // (2 * math.pi))
        if volta != volta_ant and t_cheio is None: EV.append((t, 'volta', n)); volta_ant = volta
        if n >= NMAX and t_cheio is None:
            # termina a volta em curso e trava
            t_cheio = t; EV.append((t, 'cheio', n))
        if t_trava is not None and t_exp is None and t >= t_trava + 1.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(700, 2100, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
            th_q = th; lam = [[0, LH, -300, -500, -4], [LH, 200, 200, -700, 5], [220, 320, -150, -900, -6], [320, L, 400, -600, 7]]
        if t_exp is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 60) | (y < -60) | (x < -60) | (x > W + 60))] = 0
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas · volta', volta, flush=True)
            f += 1
            if t_exp is not None and t > t_exp + 4.6: break
            if t > 120: break
            continue
        # ── desenho
        loop = t_exp is not None and t > t_exp + 3.0
        img = BG.copy()
        if not loop:
            if t_exp is None:
                anel(img, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
                for k in range(1, 6):   # rastro discreto da lâmina
                    ang = th - om * k / FPS * 1.2
                    segmento(img, CX + math.cos(ang) * (LH + 6), CY + math.sin(ang) * (LH + 6), CX + math.cos(ang) * L, CY + math.sin(ang) * L, 10, .10 * (1 - k / 6), 1.0)
            else:
                k = t - t_exp
                for a0, pvx, pvy, rot in pedacos:
                    ox, oy = pvx * k, pvy * k + 450 * k * k; aa = a0 + rot * k
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
            # risco branco do corte
            slashes = [s__ for s__ in slashes if t - s__[3] < .22]
            for sx_, sy_, sth, st in slashes:
                u = (t - st) / .22; c_, s_ = math.cos(sth), math.sin(sth); h = RB * 2.6
                segmento_cor(img, sx_ - c_ * h, sy_ - s_ * h, sx_ + c_ * h, sy_ + s_ * h, 2.5, (255, 255, 255), 1 - u)
            if t_exp is None:
                sh = (math.sin(t * 60) * 5 * min(1, (t - t_trava) / 1.4)) if t_trava is not None else 0.0
                lamina(img, th, 1.0, trinca=(t - t_trava) / 1.4 if t_trava is not None else 0.0, cx=CX + sh, cy=CY)
            else:
                k = t - t_exp
                for l0, l1, pvx, pvy, rot in lam:
                    mid = (l0 + l1) / 2; mx, my = CX + math.cos(th_q) * mid + pvx * k, CY + math.sin(th_q) * mid + pvy * k + 700 * k * k
                    ang = th_q + rot * k; lamina(img, ang, max(0, 1 - k / 2.5), cx=mx - math.cos(ang) * mid, cy=my - math.sin(ang) * mid, l0=l0, l1=l1)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); lamina(tmp, th0, 1.0)
            blit(tmp, spr, CX + 250, CY + 120, 1.0); img = img * (1 - k_) + tmp * k_
        # textos
        poe_texto(img, 'LÂMINA', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 54, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até ela quebrar? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is None: poe_texto(img, f'volta {volta}', 40, 540, 1560, (200, 210, 230), 1, '600', 6)
                else: poe_texto(img, 'TRAVOU...' if t_trava is not None else 'TRAVANDO...', 60, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEBROU!', 170, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas · volta', volta, flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'om': OM, 'th0': th0, 'eventos': EV}, open(f'{ROOT}/out/eventos-lamina.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
