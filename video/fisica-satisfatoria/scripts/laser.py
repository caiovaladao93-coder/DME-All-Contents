"""LASER · "Cada corte = ×2" (9:16, 1080×1920, 30 fps). Mesmo formato da LÂMINA e da SERRA, com outro cortante: um emissor anda pela
borda do anel e dispara um feixe que REFLETE 4 vezes nas paredes (5 cordas), desenhando uma estrela que gira e "respira" (o ângulo do
feixe abre e fecha, então a estrela varre o anel inteiro). Toda bola que o feixe atravessa é cortada ao meio. Bolas de uma cor só,
sem efeitos. Com o anel lotado o laser SUPERAQUECE (feixe engrossa e pisca), QUEIMA e o anel explode. Loop: 1 bola de novo.
Saída: out/laser-mudo.mp4 e out/eventos-laser.json (som: scripts/som_laser.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite
from lamina import meia, segmento_cor

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(717)
CX, CY, RA, RB = 540.0, 1000.0, 430.0, 7.0
RL = RA - 2.0                            # raio onde o feixe reflete
NCORDAS = 3
OME = .28                                # rotação do emissor pela borda (rad/s)
NMAX = 2048; VMIN, VMAX = 130.0, 230.0
COR = np.array([255, 214, 64], np.float32)   # bolas: amarelo
LAS = (255, 50, 60)                          # feixe: vermelho
SPLIT = .38
EV = []

def beta_at(t): return math.radians(38 + 30 * math.sin(.2 * t))     # ângulo do feixe com a normal (abre e fecha)

def caminho(phi, beta):
    """vértices do feixe: começa no emissor (ângulo phi) e reflete; passo angular entre reflexões = pi - 2*beta"""
    d = math.pi - 2 * beta
    return [(CX + RL * math.cos(phi + k * d), CY + RL * math.sin(phi + k * d)) for k in range(NCORDAS + 1)]

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, px_, py_, cut, cnx, cny, t, cool, ativo, cortar):
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
        if cortar and t - cool[b] > 2.5 and nc < cut.shape[0]:
            for k in range(px_.shape[0] - 1):
                ax, ay, bx, by = px_[k], py_[k], px_[k + 1], py_[k + 1]
                ex, ey = bx - ax, by - ay; L2 = ex * ex + ey * ey + 1e-9
                u = ((x[b] - ax) * ex + (y[b] - ay) * ey) / L2
                if u < 0 or u > 1: continue
                dx, dy = x[b] - (ax + u * ex), y[b] - (ay + u * ey)
                if dx * dx + dy * dy < 16.0:
                    L = math.sqrt(L2); cut[nc] = b; cnx[nc] = -ey / L; cny[nc] = ex / L; nc += 1; break
        sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
        if sp < VMIN and sp > 1e-6: vx[b] *= VMIN / sp; vy[b] *= VMIN / sp
        if sp > VMAX: vx[b] *= VMAX / sp; vy[b] *= VMAX / sp
    return nc

def emissor(img, phi, alpha=1.0, quente=0.0):
    c, s = math.cos(phi), math.sin(phi); ex, ey = CX + (RA + 22) * c, CY + (RA + 22) * s
    # corpo de aço (bloco tangente ao anel) e lente
    segmento(img, ex - s * 26, ey + c * 26, ex + s * 26, ey - c * 26, 30, alpha, 1.0)
    segmento_cor(img, ex - s * 20, ey + c * 20, ex + s * 20, ey - c * 20, 4, (70, 75, 82), alpha)
    lx, ly = CX + (RA + 4) * c, CY + (RA + 4) * s
    segmento_cor(img, lx - s * 7, ly + c * 7, lx + s * 7, ly - c * 7, 10, (255, int(60 + 150 * quente), int(70 + 120 * quente)), alpha)

def feixe(img, pts, esp, alpha, fase):
    for k in range(len(pts) - 1):
        (ax, ay), (bx, by) = pts[k], pts[k + 1]
        segmento_cor(img, ax, ay, bx, by, esp * 3.2, LAS, .22 * alpha)
        segmento_cor(img, ax, ay, bx, by, esp, LAS, .9 * alpha)
        segmento_cor(img, ax, ay, bx, by, max(1.2, esp * .35), (255, 225, 225), alpha)
    for k in range(1, len(pts) - 1):   # ponto de reflexão
        bx, by = pts[k]; segmento_cor(img, bx - 1, by, bx + 1, by, 9 + 2 * math.sin(fase + k), (255, 200, 200), .8 * alpha)

def main():
    NB = NMAX + 64
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64)
    cool = np.full(NB, -9.0); ts = np.full(NB, -9.0); nang = np.zeros(NB); side = np.zeros(NB); c0x = np.zeros(NB); c0y = np.zeros(NB)
    p0 = caminho(math.pi / 2 + OME * .6, beta_at(1.4)); mx0, my0 = (p0[0][0] + p0[1][0]) / 2, (p0[0][1] + p0[1][1]) / 2
    x[0], y[0], vx[0], vy[0], viva[0] = mx0 + 40, my0 - 30, -120.0, 90.0, 1; n = 1   # perto do 1º trecho do feixe: corte logo no começo
    spr = sprite(COR, RB); ca = np.zeros(65536, np.int64); cb = np.zeros(65536, np.int64)
    cut = np.zeros(8192, np.int64); cnx = np.zeros(8192); cny = np.zeros(8192)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/laser-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = .8; phi0 = math.pi / 2; phi = phi0; cortes = 0; t_cheio = t_queima = t_exp = None; f = 0; pedacos = []; slashes = []; dobra = 1
    while True:
        t = f / FPS
        ligado = t >= T0 and t_exp is None
        ativo = t_exp is None
        for _ in range(SUB):
            dt = 1 / FPS / SUB
            if ligado and t_queima is None: phi += OME * dt * (1 if t_cheio is None else 1 + 3 * (t - t_cheio))
            pts = caminho(phi, beta_at(t)); px_ = np.array([p[0] for p in pts]); py_ = np.array([p[1] for p in pts])
            nc = passo(x, y, vx, vy, viva, n, dt, px_, py_, cut, cnx, cny, t, cool, ativo, ligado and t_cheio is None)
            for q in range(nc):
                b = cut[q]
                if n >= NB: break
                nx, ny = cnx[q], cny[q]; cx0, cy0 = x[b], y[b]; v0x, v0y = vx[b], vy[b]
                for k_, sg in ((b, 1.0), (n, -1.0)):
                    x[k_], y[k_] = cx0 + nx * sg * (RB + .6), cy0 + ny * sg * (RB + .6)
                    vx[k_], vy[k_] = v0x * .6 + nx * sg * 110, v0y * .6 + ny * sg * 110
                    viva[k_] = 1; cool[k_] = t; ts[k_] = t; nang[k_] = math.atan2(ny, nx); side[k_] = sg; c0x[k_], c0y[k_] = cx0, cy0
                n += 1; cortes += 1; EV.append((t, 'corte', 0))
                if len(slashes) < 60: slashes.append((cx0, cy0, math.atan2(nx, -ny), t))
            if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        while n >= dobra * 2: dobra *= 2; EV.append((t, 'dobrou', dobra))
        if n >= NMAX and t_cheio is None: t_cheio = t; EV.append((t, 'cheio', n))
        if t_cheio is not None and t_queima is None and t >= t_cheio + 2.6: t_queima = t; EV.append((t, 'queima', 0))
        if t_queima is not None and t_exp is None and t >= t_queima + 1.2:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(700, 2100, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 200; viva[m] = 2
            for k in range(16):
                a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100); pedacos.append([a0, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
            phi_q = phi
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
            if t_exp is None:
                anel(img, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0)
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
                quente = 0.0 if t_cheio is None else min(1.0, (t - t_cheio) / 2.6)
                if ligado:
                    esp = 4 + 10 * quente ** 2; pisca = 1.0 if quente < .5 else (.55 + .45 * (math.sin(t * 70) > -.2))
                    if t_queima is None: feixe(img, caminho(phi, beta_at(t)), esp, pisca * min(1.0, (t - T0) / .3), t * 9)
                    else:
                        fz = max(0.0, 1 - (t - t_queima) / .5); feixe(img, caminho(phi, beta_at(t)), esp, fz * (math.sin(t * 90) > 0), t * 9)
                sh = (math.sin(t * 60) * 4 * min(1, (t - t_queima) / 1.2)) if t_queima is not None else 0.0
                emissor(img, phi + sh * .002, 1.0, quente)
            else:
                k = t - t_exp; emissor(img, phi_q, max(0.0, 1 - k / 1.5), 1.0)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 8, 0.0, -1.0, 1.25, 1.0); emissor(tmp, phi0)
            blit(tmp, spr, mx0 + 40, my0 - 30, 1.0); img = img * (1 - k_) + tmp * k_
        poe_texto(img, 'LASER', 110, 540, 300, (255, 255, 255), 1, '800', 12)
        if t < 3.6:
            poe_texto(img, 'Cada corte = ×2', 54, 540, 410, (255, 214, 64), 1, '800', 8, pop_in(t, .1))
            poe_texto(img, 'Quantas até o laser queimar? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 76, 540, 410, (255, 214, 64), 1, '800', 10)
            if t_exp is None:
                if t_cheio is not None: poe_texto(img, 'QUEIMANDO...' if t_queima is not None else 'SUPERAQUECENDO...', 56, 540, 1560, (255, 77, 90), 1, '800', 9, 1 + .06 * math.sin(t * 22))
            else:
                poe_texto(img, 'QUEIMOU!', 170, 540, 800, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'{fmt(cortes)} CORTES!', 64, 540, 960, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 120: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': int(n), 'cortes': cortes, 'eventos': EV}, open(f'{ROOT}/out/eventos-laser.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · cortes', cortes, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
