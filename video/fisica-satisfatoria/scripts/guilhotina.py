"""GUILHOTINA · "Cada descida = ×2" (9:16, 1080×1920, 30 fps). Mesmo formato da série de cortantes, bolas MAIORES (raio 13):
uma guilhotina com trilhos dos dois lados do anel. A lâmina (fio inclinado) sobe devagar com catraca, segura no alto (suspense) e
DESCE de uma vez atravessando o anel inteiro: toda bola é cortada ao meio, então o total dobra exato a cada descida (1 → 512).
Na 10ª descida, com o anel lotado, a lâmina TRAVA no meio, racha e o anel explode. Loop: 1 bola de novo.
Saída: out/guilhotina-mudo.mp4 e out/eventos-guilhotina.json (som: scripts/som_guilhotina.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor
from tesoura import poligono

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(1010)
CX, CY, RA, RB = 540.0, 1085.0, 430.0, 13.0
SLOPE = .22                               # inclinação do fio
YTOP, YBOT = CY - RA - 55, CY + RA + 62   # posição do fio no alto e embaixo (no centro)
HB = 92.0                                # altura da lâmina acima do fio
XR = RA + 34                              # trilhos
CIC, T1, SUBIDA, PAUSA, QUEDA = 6.5, 2.6, 4.2, 1.0, .38
NDESC = 9                                 # descidas que cortam (2^9 = 512); a 10ª trava
VMIN, VMAX = 70.0, 140.0
COR = np.array([255, 92, 110], np.float32)
SPLIT = .4
EV = []

def lamina_y(t):
    """altura do fio (no centro) e fase: 'alto', 'cai', 'sobe'. Ciclo: cai (0,38 s) → embaixo (0,3 s) → sobe (4,2 s) → segura."""
    if t < T1: return YTOP, 'alto', 0
    k = int((t - T1) // CIC); u = (t - T1) - k * CIC
    if u < QUEDA: e = (u / QUEDA) ** 2; return YTOP + (YBOT - YTOP) * e, 'cai', k
    if u < QUEDA + .3: return YBOT, 'baixo', k
    if u < QUEDA + .3 + SUBIDA: e = (u - QUEDA - .3) / SUBIDA; return YBOT + (YTOP - YBOT) * (e * e * (3 - 2 * e)), 'sobe', k
    return YTOP, 'alto', k

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, yb0, yb1, corta, cut, t, cool, ativo):
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
        if corta and t - cool[b] > 1.0 and nc < cut.shape[0]:
            e0 = y[b] - (yb0 + SLOPE * (x[b] - CX)); e1 = y[b] - (yb1 + SLOPE * (x[b] - CX))
            if e0 > 0 and e1 <= 0: cut[nc] = b; nc += 1
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

def guilhotina(img, yb, alpha=1.0, trinca=0.0, dx=0.0, rot=0.0, so_lamina=False):
    x0, x1 = CX - XR + 14 + dx, CX + XR - 14 + dx
    if not so_lamina:   # trilhos e travessa
        for xs in (CX - XR, CX + XR):
            segmento_cor(img, xs, YTOP - HB - 70, xs, YBOT + 30, 16, (95, 100, 108), alpha)
            segmento_cor(img, xs - 4, YTOP - HB - 70, xs - 4, YBOT + 30, 3, (190, 196, 204), alpha)
        segmento_cor(img, CX - XR - 30, YTOP - HB - 78, CX + XR + 30, YTOP - HB - 78, 22, (95, 100, 108), alpha)
    c, s = math.cos(rot), math.sin(rot)
    def P(px, py): rx, ry = px - CX - dx, py - yb; return (CX + dx + rx * c - ry * s, yb + rx * s + ry * c)
    ya, yz = yb + SLOPE * (x0 - CX - dx), yb + SLOPE * (x1 - CX - dx)
    pts = [P(x0, ya), P(x1, yz), P(x1, yb - HB), P(x0, yb - HB)]
    xs = np.array([p[0] for p in pts]); ys = np.array([p[1] for p in pts])
    poligono(img, xs, ys, 150.0, 156.0, 165.0, alpha, 1.0)                    # aresta 0 = fio (claro)
    a, b = P(x0, yb - HB - 26), P(x1, yb - HB - 26)                            # peso em cima
    segmento_cor(img, a[0], a[1], b[0], b[1], 40, (70, 74, 82), alpha)
    for k in range(5):  # furos / rebites
        p = P(x0 + 60 + k * (x1 - x0 - 120) / 4, yb - HB + 34); segmento_cor(img, p[0] - 1, p[1], p[0] + 1, p[1], 12, (60, 64, 70), alpha)
    if trinca > 0:
        for q in range(int(1 + trinca * 6)):
            xq = x0 + 80 + q * 110; p0, p1 = P(xq, yb + SLOPE * (xq - CX - dx) - 4), P(xq + 18, yb - 60)
            segmento_cor(img, p0[0], p0[1], p1[0], p1[1], 2.5, (20, 20, 26), alpha * min(1, trinca * 2))

def main():
    NB = 2 ** NDESC + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    x[0], y[0], vx[0], vy[0], viva[0] = CX - 60, CY + 40, 90.0, 50.0, 1; n = 1
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64); cut = np.zeros(8192, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/guilhotina-mudo.mp4'], stdin=subprocess.PIPE)
    nrm = 1 / math.hypot(SLOPE, 1); NX, NY = -SLOPE * nrm, 1 * nrm        # normal do fio
    cortes = 0; t_trava = t_exp = None; f = 0; pedacos = []; desc_ant = -1; yb = YTOP; ultimo_x2 = -9.0
    while True:
        t = f / FPS
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; tt = t + _ * dt
            yb0 = yb; yb_, fase, k = lamina_y(tt)
            if k >= NDESC and fase == 'cai':   # 10ª descida: trava no meio
                yb_ = min(yb_, CY - 40 + 0 * yb_)
                if t_trava is None and yb_ >= CY - 41: t_trava = t; EV.append((t, 'trava', n))
            if t_trava is not None: yb_ = CY - 40
            yb = yb_
            corta = fase == 'cai' and k < NDESC
            nc = passo(x, y, vx, vy, viva, n, dt, yb0, yb, corta, cut, tt, cool, ativo)
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + NX * sg * (RB + .8), cy0 + NY * sg * (RB + .8)
                    vx[k_], vy[k_] = v0x * .5 + NX * sg * 70, v0y * .5 + NY * sg * 70
                    viva[k_] = 1; cool[k_] = tt; ts[k_] = tt; nang[k_] = math.atan2(NY, NX); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1; EV.append((tt, 'corte', 0))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        _, fase, k = lamina_y(t)
        if fase == 'cai' and k != desc_ant and t_trava is None: EV.append((T1 + k * CIC, 'desce', k)); desc_ant = k
        if fase == 'baixo' and (not EV or EV[-1][1] != 'baixo') and k < NDESC: EV.append((t, 'baixo', n)); ultimo_x2 = t
        if fase == 'sobe' and (not EV or EV[-1][1] not in ('sobe',)) and t_trava is None and k < NDESC: EV.append((t, 'sobe', k))
        if t_trava is not None and t_exp is None and t >= t_trava + 1.6:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(600, 1900, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for kk in range(16):
                a0 = kk * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
        if t_exp is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 60) | (y < -60) | (x < -60) | (x > W + 60))] = 0
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas ·', fase, k, flush=True)
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
                kx = t - t_exp
                for a0, pvx, pvy, rt in pedacos:
                    ox, oy = pvx * kx, pvy * kx + 450 * kx * kx; aa = a0 + rt * kx
                    for j in range(5):
                        b0, b1 = aa + j * (2 * math.pi / 16) / 5, aa + (j + 1) * (2 * math.pi / 16) / 5
                        segmento(img, CX + ox + (RA + 6) * math.cos(b0), CY + oy + (RA + 6) * math.sin(b0), CX + ox + (RA + 6) * math.cos(b1), CY + oy + (RA + 6) * math.sin(b1), 8, max(0, 1 - kx / 2.2), 1.2)
            # a lâmina subindo passa por trás das bolas; descendo, por cima
            atras = fase in ('sobe', 'baixo') and t_exp is None and t_trava is None
            if atras: guilhotina(img, yb, 1.0)
            for i in np.nonzero(viva > 0)[0]:
                u = (t - ts[i]) / SPLIT
                if 0 <= u < 1 and viva[i] == 1:
                    e_ = 1 - (1 - u) ** 3; px2, py2 = c0x[i] + (x[i] - c0x[i]) * e_, c0y[i] + (y[i] - c0y[i]) * e_
                    meia(img, px2, py2, RB, math.cos(nang[i]), math.sin(nang[i]), side[i], COR[0], COR[1], COR[2], 0.0)
                    if u > .6: blit(img, spr, x[i], y[i], (u - .6) / .4)
                else: blit(img, spr, x[i], y[i], 1.0)
            if t_exp is None and not atras:
                sh = (math.sin(t * 60) * 5 * min(1, (t - t_trava) / 1.6)) if t_trava is not None else 0.0
                guilhotina(img, yb, 1.0, (t - t_trava) / 1.6 if t_trava is not None else 0.0, dx=sh)
            elif t_exp is not None:
                kx = t - t_exp
                guilhotina(img, CY - 40 + 300 * kx + 1200 * kx * kx, max(0, 1 - kx / 2.5), 1.0, dx=150 * kx, rot=.9 * kx, so_lamina=True)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); guilhotina(tmp, YTOP)
            blit(tmp, spr, CX - 60, CY + 40, 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'GUILHOTINA', 104, 540, 270, (255, 255, 255), 1, '800', 12)
        if t < 3.4:
            poe_texto(img, 'Cada descida = ×2', 50, 540, 372, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até ela travar? Chuta!', 44, 540, 1700, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 72, 540, 372, (255, 214, 64), 1, '800', 10, 1 + .25 * max(0, 1 - (t - ultimo_x2) / .35))
            if t - ultimo_x2 < .9 and t_trava is None: poe_texto(img, '×2', 64, 760, 372, (255, 255, 255), min(1, (.9 - (t - ultimo_x2)) * 3), '800', 9, pop_in(t, ultimo_x2, .25))
            if t_exp is None:
                if t_trava is not None: poe_texto(img, 'TRAVOU NO MEIO!', 58, 540, 1700, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEBROU!', 170, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1700, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'eventos': EV, 'cic': CIC, 't1': T1, 'subida': SUBIDA, 'queda': QUEDA}, open(f'{ROOT}/out/eventos-guilhotina.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· trava', t_trava, '· explode', t_exp)

if __name__ == '__main__':
    main()
