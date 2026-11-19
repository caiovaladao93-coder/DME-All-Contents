"""TESOURA · "Cada corte = ×2" (9:16, 1080×1920, 30 fps). Mesmo formato da LÂMINA / SERRA / LASER, com outro cortante:
uma tesoura gigante no centro do anel gira devagar e dá um "SNIP" a cada 1 s (no tempo da música a 120 BPM): abre, segura e fecha
de uma vez. Toda bola varrida pelas lâminas enquanto elas fecham é cortada ao meio (corte coletivo, em ritmo). Bolas de uma cor só,
sem efeitos. Com o anel lotado, a tesoura EMPERRA (não fecha mais), o parafuso estoura, as lâminas se separam e o anel explode.
Saída: out/tesoura-mudo.mp4 e out/eventos-tesoura.json (som: scripts/som_tesoura.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(321)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 7.0
LB = 350.0                               # comprimento das lâminas (do pivô à ponta)
AMAX = math.radians(26)                  # abertura máxima de cada lâmina
PER = 1.0                                # um snip por segundo (120 BPM: um a cada 2 tempos)
OMR = .45                                # rotação lenta da tesoura (rad/s)
NMAX = 2048; VMIN, VMAX = 150.0, 260.0
COR = np.array([120, 230, 140], np.float32)   # bolas: verde-menta
SPLIT = .38
EV = []

def abertura(t, t0):
    """ângulo de abertura de cada lâmina: abre (0,6 s), segura (0,1 s) e fecha num estalo (0,3 s)"""
    if t < t0: return 0.0
    u = ((t - t0) % PER) / PER
    if u < .6: k = u / .6; return AMAX * (1 - (1 - k) ** 3)
    if u < .7: return AMAX
    k = (u - .7) / .3; return AMAX * (1 - k * k)

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, eixo, a, fecha, cut, cnx, cny, t, cool, ativo):
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
            qx, qy = x[b] - CX, y[b] - CY
        if fecha and t - cool[b] > .5 and nc < cut.shape[0]:
            for sg in (1.0, -1.0):
                th = eixo + sg * a; dx, dy = math.cos(th), math.sin(th)
                s = qx * dx + qy * dy
                if s < 30 or s > LB: continue
                e = -qx * dy + qy * dx
                if abs(e) < 5.0:
                    cut[nc] = b; cnx[nc] = -dy; cny[nc] = dx; nc += 1; break
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

@njit(cache=True)
def poligono(img, xs, ys, r, g, b, alpha, brilho):
    """polígono convexo com borda suave; brilho = faixa clara perto da primeira aresta (fio da lâmina)"""
    m = xs.shape[0]; x0, x1 = int(max(0, xs.min() - 2)), int(min(img.shape[1] - 1, xs.max() + 2)); y0, y1 = int(max(0, ys.min() - 2)), int(min(img.shape[0] - 1, ys.max() + 2))
    area = 0.0
    for i in range(m): j = (i + 1) % m; area += xs[i] * ys[j] - xs[j] * ys[i]
    sgn = 1.0 if area > 0 else -1.0
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            px, py = xx + .5, yy + .5; dmin = 1e9; d0 = 1e9
            for i in range(m):
                j = (i + 1) % m; ex, ey = xs[j] - xs[i], ys[j] - ys[i]; L = math.sqrt(ex * ex + ey * ey) + 1e-9
                d = sgn * (ex * (py - ys[i]) - ey * (px - xs[i])) / L
                if d < dmin: dmin = d
                if i == 0: d0 = d
            cov = min(1.0, max(0.0, dmin + .5)) * alpha
            if cov <= 0: continue
            k = brilho * max(0.0, 1 - d0 / 5.0)
            rr, gg, bb = r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k
            img[yy, xx, 0] = img[yy, xx, 0] * (1 - cov) + rr * cov; img[yy, xx, 1] = img[yy, xx, 1] * (1 - cov) + gg * cov; img[yy, xx, 2] = img[yy, xx, 2] * (1 - cov) + bb * cov

def lamina_tes(img, cx, cy, th, alpha=1.0, trinca=0.0):
    c, s = math.cos(th), math.sin(th); nx, ny = -s, c
    # lâmina afunilada (aço) do pivô até a ponta, com fio claro numa das bordas
    pts = [(cx + c * 18 + nx * 2, cy + s * 18 + ny * 2), (cx + c * LB, cy + s * LB), (cx + c * 40 - nx * 26, cy + s * 40 - ny * 26), (cx - c * 10 - nx * 18, cy - s * 10 - ny * 18)]
    xs = np.array([p[0] for p in pts]); ys = np.array([p[1] for p in pts])
    poligono(img, xs, ys, 170.0, 176.0, 184.0, alpha, 1.0)
    # haste e argola do cabo (lado oposto do pivô)
    hx, hy = cx - c * 95 - nx * 40, cy - s * 95 - ny * 40
    segmento_cor(img, cx - c * 8 - nx * 10, cy - s * 8 - ny * 10, hx + c * 30, hy + s * 30, 16, (215, 40, 55), alpha)
    for k in range(28):
        a0, a1 = k * 2 * math.pi / 28, (k + 1) * 2 * math.pi / 28
        segmento_cor(img, hx + 34 * math.cos(a0), hy + 30 * math.sin(a0), hx + 34 * math.cos(a1), hy + 30 * math.sin(a1), 13, (215, 40, 55), alpha)
    if trinca > 0:
        for q in range(int(1 + trinca * 5)):
            u = 90 + q * 45; w = (q % 3 - 1) * 5
            segmento_cor(img, cx + c * u + nx * w - nx * 8, cy + s * u + ny * w - ny * 8, cx + c * (u + 16) + nx * w, cy + s * (u + 16) + ny * w, 2, (25, 25, 30), alpha * min(1, trinca * 2))

def parafuso(img, cx, cy, alpha=1.0):
    for k in range(20):
        a0, a1 = k * 2 * math.pi / 20, (k + 1) * 2 * math.pi / 20
        segmento_cor(img, cx + 9 * math.cos(a0), cy + 9 * math.sin(a0), cx + 9 * math.cos(a1), cy + 9 * math.sin(a1), 9, (225, 228, 232), alpha)
    segmento_cor(img, cx - 6, cy, cx + 6, cy, 2.5, (60, 64, 70), alpha)

def main():
    NB = NMAX + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    eixo0 = -math.pi / 2; T0 = 1.0
    x[0], y[0], vx[0], vy[0], viva[0] = CX + 40, CY - 210, 60.0, -30.0, 1; n = 1      # dentro da abertura do primeiro snip
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64)
    cut = np.zeros(8192, np.int64); cnx = np.zeros(8192); cny = np.zeros(8192)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/tesoura-mudo.mp4'], stdin=subprocess.PIPE)
    eixo = eixo0; cortes = 0; t_cheio = t_trava = t_exp = None; f = 0; pedacos = []; slashes = []; dobra = 1; snip_ant = -1; a_prev = 0.0; n_snip = 0
    while True:
        t = f / FPS
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB; tt = t + _ * dt
            if t_cheio is None:
                if tt >= T0: eixo += OMR * dt
                a = abertura(tt, T0)
            else:   # emperra: não fecha mais que a abertura em que travou, e treme
                a = max(a_trava, abertura(tt, T0)) if t_trava is None else a_trava
            fecha = a < a_prev - 1e-6 and t_cheio is None
            nc = passo(x, y, vx, vy, viva, n, dt, eixo, a, fecha, cut, cnx, cny, t, cool, ativo)
            a_prev = a
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
        k_snip = int((t - T0 - .7 * PER) // PER) if t >= T0 + .7 * PER else -1
        if k_snip != snip_ant and k_snip >= 0 and t_cheio is None: EV.append((T0 + k_snip * PER + PER, 'snip', n)); snip_ant = k_snip; n_snip += 1
        while n >= dobra * 2: dobra *= 2; EV.append((t, 'dobrou', dobra))
        if n >= NMAX and t_cheio is None: t_cheio = t; a_trava = max(math.radians(14), abertura(t, T0)); EV.append((t, 'cheio', n))
        if t_cheio is not None and t_trava is None and t >= t_cheio + 2.4: t_trava = t; EV.append((t, 'trava', 0))
        if t_trava is not None and t_exp is None and t >= t_trava + 1.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(700, 2100, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
            eixo_q, a_q = eixo, a
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
                sh = (math.sin(t * 60) * 5 * min(1, (t - t_cheio) / 2.4)) if t_cheio is not None else 0.0
                tri = (t - t_trava) / 1.4 if t_trava is not None else 0.0
                lamina_tes(img, CX + sh, CY, eixo - a, 1.0, tri); lamina_tes(img, CX + sh, CY, eixo + a, 1.0, tri)
                parafuso(img, CX + sh, CY)
            else:
                k = t - t_exp
                for sg, pv in ((-1, (-600, -500, -5)), (1, (600, -650, 6))):
                    lamina_tes(img, CX + pv[0] * k, CY + pv[1] * k + 800 * k * k, eixo_q + sg * a_q + pv[2] * k, max(0, 1 - k / 2.5))
                parafuso(img, CX + 300 * k, CY - 900 * k + 900 * k * k, max(0, 1 - k / 2))
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
            lamina_tes(tmp, CX, CY, eixo0); lamina_tes(tmp, CX, CY, eixo0); parafuso(tmp, CX, CY)
            blit(tmp, spr, CX + 40, CY - 210, 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'TESOURA', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 54, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até ela emperrar? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is not None: poe_texto(img, 'EMPERROU...' if t_trava is not None else 'EMPERRANDO...', 60, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
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
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 't0': T0, 'per': PER, 'eventos': EV}, open(f'{ROOT}/out/eventos-tesoura.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· snips', n_snip, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
