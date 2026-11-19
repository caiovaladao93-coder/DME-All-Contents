"""PÊNDULO · "Cada corte = ×2" (9:16, 1080×1920, 30 fps). Mesmo formato da LÂMINA / SERRA / LASER / TESOURA, outro cortante:
um pêndulo de relógio gigante, preso no topo do anel, balança de um lado para o outro (ida = 1 s, no tempo da música) com uma lâmina
em meia-lua na ponta. Toda bola que a lâmina atravessa é cortada ao meio. Bolas de uma cor só, sem efeitos. Com o anel lotado, o
balanço perde força até parar, a haste se solta, a lâmina cai e o anel explode. Loop: 1 bola de novo.
Saída: out/pendulo-mudo.mp4 e out/eventos-pendulo.json (som: scripts/som_pendulo.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor
from tesoura import poligono

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(606)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 7.0
PX, PY = CX, CY - RA + 14                # pivô no alto do anel
L = 560.0                                # comprimento até o meio da lâmina
RIN, ROUT, WANG = L - 48, L + 34, .17    # lâmina: faixa radial e meia largura angular
PSI = math.radians(50); TP = 2.0         # amplitude e período (ida + volta = 2 s)
NMAX = 2048; VMIN, VMAX = 150.0, 260.0
COR = np.array([255, 150, 60], np.float32)   # bolas: laranja
SPLIT = .38
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, psi, dpsi, cut, cnx, cny, t, cool, ativo, cortar):
    nc = 0
    for b in range(n):
        if viva[b] == 0: continue
        x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if viva[b] != 1 or not ativo: continue
        qx, qy = x[b] - CX, y[b] - CY; r = math.sqrt(qx * qx + qy * qy) + 1e-9
        if r > RA - RB:
            nx, ny = qx / r, qy / r; vn = vx[b] * nx + vy[b] * ny
            x[b] = CX + nx * (RA - RB); y[b] = CY + ny * (RA - RB)
            if vn > 0: vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
        if cortar and abs(dpsi) > .05 and t - cool[b] > .8 and nc < cut.shape[0]:
            dx, dy = x[b] - PX, y[b] - PY; rr = math.sqrt(dx * dx + dy * dy)
            if RIN - RB < rr < ROUT + RB:
                phi = math.atan2(dx, dy)
                if abs(phi - psi) < WANG:
                    tx, ty = math.cos(psi), -math.sin(psi)          # direção do balanço (tangente)
                    cut[nc] = b; cnx[nc] = tx; cny[nc] = ty; nc += 1
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

def pendulo(img, psi, px=PX, py=PY, alpha=1.0, trinca=0.0, haste=True):
    s, c = math.sin(psi), math.cos(psi)
    pt = lambda r, a=0.0: (px + r * math.sin(psi + a), py + r * math.cos(psi + a))
    if haste:
        a0, a1 = pt(0), pt(RIN + 4)
        segmento_cor(img, a0[0], a0[1], a1[0], a1[1], 14, (120, 126, 134), alpha)
        segmento_cor(img, a0[0], a0[1], a1[0], a1[1], 5, (200, 205, 212), alpha)
    # lâmina em meia-lua: corda reta em cima, fio curvo embaixo (convexa)
    arco = [pt(ROUT - 14 * (k / 8) ** 2, WANG * k / 8) for k in range(8, -9, -1)]
    pts = arco + [pt(RIN, -WANG * .9), pt(RIN, WANG * .9)]
    xs = np.array([p[0] for p in pts]); ys = np.array([p[1] for p in pts])
    poligono(img, xs, ys, 168.0, 174.0, 182.0, alpha, 0.0)
    for k in range(16):   # fio claro
        p0, p1 = arco[k], arco[k + 1]; segmento_cor(img, p0[0], p0[1], p1[0], p1[1], 3, (245, 248, 252), alpha)
    m = pt(RIN + 6); segmento_cor(img, m[0] - 26 * c, m[1] + 26 * s, m[0] + 26 * c, m[1] - 26 * s, 10, (150, 30, 40), alpha)   # braçadeira
    if trinca > 0:
        for q in range(int(1 + trinca * 5)):
            a = (q - 2) * .06; p0, p1 = pt(RIN + 10, a), pt(RIN + 50, a + .03)
            segmento_cor(img, p0[0], p0[1], p1[0], p1[1], 2, (25, 25, 30), alpha * min(1, trinca * 2))

def suporte(img, alpha=1.0):
    segmento_cor(img, PX - 60, PY - 30, PX + 60, PY - 30, 14, (110, 116, 124), alpha)
    segmento_cor(img, PX - 12, PY - 30, PX, PY, 10, (110, 116, 124), alpha); segmento_cor(img, PX + 12, PY - 30, PX, PY, 10, (110, 116, 124), alpha)
    for k in range(18):
        a0, a1 = k * 2 * math.pi / 18, (k + 1) * 2 * math.pi / 18
        segmento_cor(img, PX + 9 * math.cos(a0), PY + 9 * math.sin(a0), PX + 9 * math.cos(a1), PY + 9 * math.sin(a1), 7, (225, 228, 232), alpha)

def main():
    NB = NMAX + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    T0 = .5; x0b, y0b = PX + (L - 7) * math.sin(.45), PY + (L - 7) * math.cos(.45)     # no caminho da primeira passada
    x[0], y[0], vx[0], vy[0], viva[0] = x0b, y0b, -40.0, 30.0, 1; n = 1
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64)
    cut = np.zeros(8192, np.int64); cnx = np.zeros(8192); cny = np.zeros(8192)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/pendulo-mudo.mp4'], stdin=subprocess.PIPE)
    cortes = 0; t_cheio = t_para = t_exp = None; f = 0; pedacos = []; slashes = []; dobra = 1; amp = 0.0; fase = 0.0; ext_ant = 0; psi_q = 0.0
    while True:
        t = f / FPS
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; tt = t + _ * dt
            if tt < T0: amp = PSI * (tt / T0)
            elif t_cheio is None: amp = PSI
            else: amp = PSI * max(0.0, 1 - (tt - t_cheio) / 4.0) ** 1.2      # perde força com o anel lotado
            fase = 2 * math.pi * tt / TP
            psi = amp * math.sin(fase); dpsi = amp * math.cos(fase) * 2 * math.pi / TP
            nc = passo(x, y, vx, vy, viva, n, dt, psi, dpsi, cut, cnx, cny, t, cool, ativo, t_cheio is None and tt >= T0)
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                nx, ny = cnx[q], cny[q]; cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + nx * sg * (RB + .6), cy0 + ny * sg * (RB + .6)
                    vx[k_], vy[k_] = v0x * .6 + nx * sg * 110, v0y * .6 + ny * sg * 110
                    viva[k_] = 1; cool[k_] = t; ts[k_] = t; nang[k_] = math.atan2(ny, nx); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1; EV.append((t, 'corte', 0))
                if len(slashes) < 80: slashes.append((cx0, cy0, math.atan2(nx, -ny), t))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        ext = int((2 * t / TP) + .5)
        if ext != ext_ant and t >= T0 and t_para is None: EV.append((t, 'tique', ext % 2)); ext_ant = ext
        while n >= dobra * 2: dobra *= 2; EV.append((t, 'dobrou', dobra))
        if n >= NMAX and t_cheio is None: t_cheio = t; EV.append((t, 'cheio', n))
        if t_cheio is not None and t_para is None and t >= t_cheio + 4.0: t_para = t; psi_q = psi; EV.append((t, 'para', 0))
        if t_para is not None and t_exp is None and t >= t_para + 1.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(700, 2100, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
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
                    e_ = 1 - (1 - u) ** 3; px2, py2 = c0x[i] + (x[i] - c0x[i]) * e_, c0y[i] + (y[i] - c0y[i]) * e_
                    nn = nang[i]; meia(img, px2, py2, RB, math.cos(nn), math.sin(nn), side[i], COR[0], COR[1], COR[2], 0.0)
                    if u > .6: blit(img, spr, x[i], y[i], (u - .6) / .4)
                else: blit(img, spr, x[i], y[i], 1.0)
            slashes = [s__ for s__ in slashes if t - s__[3] < .22]
            for sx_, sy_, sth, st in slashes:
                u = (t - st) / .22; c_, s_ = math.cos(sth), math.sin(sth); h = RB * 2.6
                segmento_cor(img, sx_ - c_ * h, sy_ - s_ * h, sx_ + c_ * h, sy_ + s_ * h, 2.5, (255, 255, 255), 1 - u)
            if t_exp is None:
                # rastro leve do balanço
                for k in range(1, 5):
                    pr = amp * math.sin(2 * math.pi * (t - k / FPS * .6) / TP)
                    a1 = (PX + ROUT * math.sin(pr), PY + ROUT * math.cos(pr)); a0 = (PX + RIN * math.sin(pr), PY + RIN * math.cos(pr))
                    segmento(img, a0[0], a0[1], a1[0], a1[1], 8, .08 * (1 - k / 5) * (amp / PSI), 1.0)
                sh = (math.sin(t * 60) * 4 * min(1, (t - t_para) / 1.4)) if t_para is not None else 0.0
                psi_d = psi if t_para is None else psi_q
                pendulo(img, psi_d, PX + sh, PY, 1.0, (t - t_para) / 1.4 if t_para is not None else 0.0)
                suporte(img)
            else:
                k = t - t_exp
                pendulo(img, psi_q + 1.5 * k, PX + 200 * k, PY + 300 * k + 1100 * k * k, max(0, 1 - k / 2.5), 0.0, True)
                suporte(img, max(0, 1 - k / 1.0))
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); pendulo(tmp, 0.0); suporte(tmp)
            blit(tmp, spr, x0b, y0b, 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'PÊNDULO', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 54, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até ele parar? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is not None: poe_texto(img, 'PAROU...' if t_para is not None else 'PERDENDO FORÇA...', 56, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'SE SOLTOU!', 150, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'tp': TP, 't0': T0, 'eventos': EV}, open(f'{ROOT}/out/eventos-pendulo.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
