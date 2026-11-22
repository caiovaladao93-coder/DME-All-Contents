"""FIO DE AÇO · "Cada corte = ×2" (9:16, 1080×1920, 30 fps). Série de cortantes, bolas AINDA MAIORES (raio 18):
um fio de aço esticado atravessa o anel de ponta a ponta, preso em duas roldanas na borda, e gira devagar (meia volta a cada 7 s).
A cada meia volta ele varre o anel inteiro: toda bola é cortada ao meio e o total dobra (1 → 256). O fio é uma CORDA: cada corte
faz ele vibrar e tocar uma nota. Com o anel lotado, o fio enverga como um arco sob a pressão das bolas e ARREBENTA; o anel explode.
Saída: out/fio-mudo.mp4 e out/eventos-fio.json (som: scripts/som_fio.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(1818)
CX, CY, RA, RB = 540.0, 1040.0, 430.0, 18.0
OM = math.pi / 7.0                        # meia volta a cada 7 s
TH0 = -1.15                               # ângulo inicial do fio
NDOB = 8                                  # 2^8 = 256
VMIN, VMAX = 55.0, 110.0
COR = np.array([90, 200, 255], np.float32)
SPLIT = .45
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, th0, th1, corta, cut, t, cool, ativo):
    nc = 0; c0, s0, c1, s1 = math.cos(th0), math.sin(th0), math.cos(th1), math.sin(th1)
    for b in range(n):
        if viva[b] == 0: continue
        x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if viva[b] != 1 or not ativo: continue
        qx, qy = x[b] - CX, y[b] - CY; r = math.sqrt(qx * qx + qy * qy) + 1e-9
        if r > RA - RB:
            nx, ny = qx / r, qy / r; vn = vx[b] * nx + vy[b] * ny
            x[b] = CX + nx * (RA - RB); y[b] = CY + ny * (RA - RB)
            if vn > 0: vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
            qx, qy = x[b] - CX, y[b] - CY
        if corta and t - cool[b] > 1.5 and nc < cut.shape[0]:
            e0 = -qx * s0 + qy * c0; e1 = -qx * s1 + qy * c1         # distância assinada à linha do fio
            if (e0 > 0) != (e1 > 0): cut[nc] = b; nc += 1
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

def roldana(img, th, alpha=1.0):
    px, py = CX + (RA + 6) * math.cos(th), CY + (RA + 6) * math.sin(th)
    for k in range(20):
        a0, a1 = k * 2 * math.pi / 20, (k + 1) * 2 * math.pi / 20
        segmento_cor(img, px + 15 * math.cos(a0), py + 15 * math.sin(a0), px + 15 * math.cos(a1), py + 15 * math.sin(a1), 9, (205, 210, 216), alpha)
    segmento_cor(img, px - 1, py, px + 1, py, 9, (70, 74, 80), alpha)

def desenha_fio(img, th, desloc, alpha=1.0, partes=None):
    """fio da roldana A à B com deslocamento perpendicular desloc(s), s em [0,1]. partes: [(s0, s1)] para o fio arrebentado."""
    c, s = math.cos(th), math.sin(th); nx, ny = -s, c; L = 2 * RA + 12
    ax, ay = CX - c * (RA + 6), CY - s * (RA + 6)
    M = 60; pts = []
    for k in range(M + 1):
        u = k / M; d = desloc(u); pts.append((ax + c * L * u + nx * d, ay + s * L * u + ny * d, u))
    for k in range(M):
        u0 = pts[k][2]
        if partes is not None and not any(a <= u0 <= b for a, b in partes): continue
        segmento_cor(img, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 3.5, (215, 220, 228), alpha)
        segmento_cor(img, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 1.3, (255, 255, 255), alpha)

def main():
    NB = 2 ** NDOB + 32
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    a0 = TH0 + .35; x[0], y[0], vx[0], vy[0], viva[0] = CX + 200 * math.cos(a0), CY + 200 * math.sin(a0), 40.0, -40.0, 1; n = 1   # logo à frente do fio
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64); cut = np.zeros(4096, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/fio-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = .8; th = TH0; cortes = 0; t_cheio = t_snap = None; f = 0; pedacos = []; plucks = []; dobra = 1; ult_x2 = -9.0; meia_ant = 0; om = 0.0
    while True:
        t = f / FPS
        ativo = t_snap is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; tt = t + _ * dt
            om = 0.0 if tt < T0 else (OM if t_cheio is None else OM * max(0.0, 1 - (tt - t_cheio) / 1.2))
            th0 = th; th += om * dt
            nc = passo(x, y, vx, vy, viva, n, dt, th0, th, t_cheio is None and tt >= T0, cut, tt, cool, ativo)
            c, s = math.cos(th), math.sin(th); NX, NY = -s, c
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + NX * sg * (RB + 1), cy0 + NY * sg * (RB + 1)
                    vx[k_], vy[k_] = v0x * .5 + NX * sg * 60, v0y * .5 + NY * sg * 60
                    viva[k_] = 1; cool[k_] = tt; ts[k_] = tt; nang[k_] = math.atan2(NY, NX); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1
                pos = ((cx0 - CX) * c + (cy0 - CY) * s + RA + 6) / (2 * RA + 12)
                plucks.append((tt, pos)); EV.append((tt, 'corte', round(pos, 3)))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        mv = int((th - TH0) // math.pi)
        if mv != meia_ant and t_cheio is None: EV.append((t, 'meia', mv)); meia_ant = mv
        while n >= dobra * 2: dobra *= 2; ult_x2 = t; EV.append((t, 'dobrou', dobra))
        if n >= 2 ** NDOB and t_cheio is None: t_cheio = t; EV.append((t, 'cheio', n))
        if t_cheio is not None and t_snap is None and t >= t_cheio + 3.6:
            t_snap = t; th_q = th; EV.append((t, 'arrebenta', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(600, 1800, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for kk in range(16):
                a0_ = kk * 2 * math.pi / 16; am = a0_ + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0_, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
        if t_snap is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 80) | (y < -80) | (x < -80) | (x > W + 80))] = 0
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
            f += 1
            if t_snap is not None and t > t_snap + 4.6: break
            if t > 120: break
            continue
        # ── desenho
        loop = t_snap is not None and t > t_snap + 3.0
        img = BG.copy()
        plucks = [p for p in plucks if t - p[0] < 1.2]
        if not loop:
            if t_snap is None: anel(img, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
            else:
                kx = t - t_snap
                for a0_, pvx, pvy, rt in pedacos:
                    ox, oy = pvx * kx, pvy * kx + 450 * kx * kx; aa = a0_ + rt * kx
                    for j in range(5):
                        b0, b1 = aa + j * (2 * math.pi / 16) / 5, aa + (j + 1) * (2 * math.pi / 16) / 5
                        segmento(img, CX + ox + (RA + 6) * math.cos(b0), CY + oy + (RA + 6) * math.sin(b0), CX + ox + (RA + 6) * math.cos(b1), CY + oy + (RA + 6) * math.sin(b1), 8, max(0, 1 - kx / 2.2), 1.2)
            for i in np.nonzero(viva > 0)[0]:
                u = (t - ts[i]) / SPLIT
                if 0 <= u < 1 and viva[i] == 1:
                    e_ = 1 - (1 - u) ** 3; px2, py2 = c0x[i] + (x[i] - c0x[i]) * e_, c0y[i] + (y[i] - c0y[i]) * e_
                    meia(img, px2, py2, RB, math.cos(nang[i]), math.sin(nang[i]), side[i], COR[0], COR[1], COR[2], 0.0)
                    if u > .6: blit(img, spr, x[i], y[i], (u - .6) / .4)
                else: blit(img, spr, x[i], y[i], 1.0)
            if t_snap is None:
                arco = 0.0 if t_cheio is None else 95 * min(1.0, (t - t_cheio) / 3.4) ** 1.5
                tremor = 0.0 if t_cheio is None else 3 * math.sin(t * 70) * min(1.0, (t - t_cheio) / 3.4)
                def desloc(u, t=t):
                    d = (arco + tremor) * math.sin(math.pi * u)
                    for tp, pos in plucks:   # cada corte belisca a corda: vibração que se apaga
                        k = t - tp; d += 7 * math.exp(-k * 4) * math.sin(2 * math.pi * 11 * k) * (u / pos if u < pos else (1 - u) / max(1e-3, 1 - pos))
                    return max(-24, min(24, d)) if t_cheio is None else d
                desenha_fio(img, th, desloc)
                roldana(img, th); roldana(img, th + math.pi)
            else:
                kx = t - t_snap
                if kx < 1.0:   # as duas pontas chicoteiam de volta às roldanas
                    rec = min(1.0, kx / .35)
                    def desloc2(u, kx=kx):
                        return 95 * math.sin(math.pi * u) * (1 - rec) + 40 * math.sin(kx * 40 + u * 9) * (1 - rec) * (1 - kx)
                    desenha_fio(img, th_q, desloc2, max(0, 1 - kx), partes=[(0, .5 * (1 - rec)), (1 - .5 * (1 - rec), 1)])
                roldana(img, th_q, max(0, 1 - kx / 1.5)); roldana(img, th_q + math.pi, max(0, 1 - kx / 1.5))
            if t_snap is not None and t - t_snap < .25: img = img + (255 - img) * (1 - (t - t_snap) / .25) * .8
        else:
            k_ = min(1.0, (t - t_snap - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
            desenha_fio(tmp, TH0, lambda u: 0.0); roldana(tmp, TH0); roldana(tmp, TH0 + math.pi)
            blit(tmp, spr, CX + 200 * math.cos(TH0 + .35), CY + 200 * math.sin(TH0 + .35), 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'FIO DE AÇO', 104, 540, 290, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 50, 540, 395, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até o fio arrebentar? Chuta!', 42, 540, 1620, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 395, (255, 214, 64), 1, '800', 10, 1 + .25 * max(0, 1 - (t - ult_x2) / .35))
            if t - ult_x2 < .9 and t_cheio is None and n > 1: poe_texto(img, '×2', 60, 760, 395, (255, 255, 255), min(1, (.9 - (t - ult_x2)) * 3), '800', 9, pop_in(t, ult_x2, .25))
            if t_snap is None:
                if t_cheio is not None: poe_texto(img, 'O FIO ESTÁ ENVERGANDO...', 52, 540, 1620, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'ARREBENTOU!', 140, 540, 820, (255, 214, 64), min(1, (t - t_snap) * 6), '800', 16, pop_in(t, t_snap, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 980, (255, 255, 255), min(1, max(0, (t - t_snap - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1620, (255, 255, 255), min(1, max(0, (t - t_snap - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        f += 1
        if t_snap is not None and t > t_snap + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'eventos': EV}, open(f'{ROOT}/out/eventos-fio.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· arrebenta', t_snap)

if __name__ == '__main__':
    main()
