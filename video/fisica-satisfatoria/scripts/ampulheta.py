"""AMPULHETA · "Cada bola que passa pelo gargalo vira duas." (9:16, 1080×1920, 30 fps). Um formato só:
começa com 1 bola no bulbo de cima; toda bola que atravessa o gargalo vira duas; quando o bulbo de cima esvazia, a ampulheta vira
sozinha (cada virada dobra o total: 1 → 2 → 4 → … → 1.024). Cada geração tem uma cor, e o monte forma camadas de "areia" colorida.
Quando não cabe mais (o gargalo entope), a pressão sobe, o vidro trinca e explode; o último quadro volta a 1 bola (loop).
Física própria: paredes por SDF (dois círculos + gargalo) num referencial que gira; colisões bola × bola de gerar.py.
Saída: out/ampulheta-mudo.mp4 e out/eventos-ampulheta.json (som: scripts/som_ampulheta.py)."""
import json, math, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, CX, FPS, H, ROOT, SUB, W, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

R = np.random.default_rng(1024)
CY = 1000.0
RB, RBULB, C, NECK, G = 9.0, 255.0, 285.0, 21.0, 2300.0
NMAX = 1200
GEN = np.array([[255, 214, 64], [255, 172, 51], [255, 122, 61], [255, 77, 90], [255, 80, 170], [190, 85, 230], [130, 95, 240],
                [70, 120, 255], [46, 170, 241], [45, 210, 190], [80, 220, 120], [190, 230, 70]], np.float32)
EV = []

@njit(cache=True)
def sdf(u, v):
    d1 = math.hypot(u, v + C) - RBULB; d2 = math.hypot(u, v - C) - RBULB
    b = C - RBULB + 70; qx = abs(u) - NECK; qy = abs(v) - b
    d3 = math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0)
    # funil: paredes a 45° que levam ao gargalo (como numa ampulheta de verdade)
    d4 = max((abs(u) - NECK - abs(v)) * 0.7071, abs(v) - 150.0)
    return min(min(d1, d2), min(d3, d4))

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, th, dt, ldv):
    c, s = math.cos(th), math.sin(th)
    for i in range(n):
        if viva[i] != 1: continue
        vy[i] += G * dt; x[i] += vx[i] * dt; y[i] += vy[i] * dt
        dx, dy = x[i] - CX, y[i] - CY; u = c * dx + s * dy; v = -s * dx + c * dy
        d = sdf(u, v)
        if d > -RB:
            e = .7; gu = (sdf(u + e, v) - sdf(u - e, v)) / (2 * e); gv = (sdf(u, v + e) - sdf(u, v - e)) / (2 * e); gl = math.hypot(gu, gv) + 1e-9
            gu /= gl; gv /= gl; nx = c * gu - s * gv; ny = s * gu + c * gv
            x[i] -= nx * (d + RB); y[i] -= ny * (d + RB)
            vn = vx[i] * nx + vy[i] * ny
            if vn > 0:
                vx[i] -= 1.25 * vn * nx; vy[i] -= 1.25 * vn * ny; vx[i] *= .985; vy[i] *= .985
        vx[i] *= .9985; vy[i] *= .9985
        dx, dy = x[i] - CX, y[i] - CY; ldv[i] = -s * dx + c * dy

@njit(cache=True)
def vidro(img, th, alpha, crack):
    c, s = math.cos(th), math.sin(th); ext = C + RBULB + 40
    for yy in range(int(max(0, CY - ext)), int(min(img.shape[0], CY + ext))):
        for xx in range(int(max(0, CX - ext)), int(min(img.shape[1], CX + ext))):
            dx, dy = xx + .5 - CX, yy + .5 - CY; u = c * dx + s * dy; v = -s * dx + c * dy
            if abs(v) > C + RBULB + 30: continue
            d = sdf(u, v)
            if d < -1:  # leve brilho de vidro por dentro
                k = .035 * alpha * (1 - min(1.0, -d / 60))
                for q in range(3): img[yy, xx, q] = img[yy, xx, q] * (1 - k) + 230 * k
            sd = abs(d - 4) - 4
            if sd > 1: continue
            a = min(1.0, max(0.0, .5 - sd)) * alpha
            hl = .75 + .25 * math.sin(math.atan2(v, u) * 2 + th)
            for q in range(3): img[yy, xx, q] = img[yy, xx, q] * (1 - a) + (205 + 40 * hl) * (0.9 if q == 0 else 0.96 if q == 1 else 1.0) * a

def moldura(img, th, alpha):
    # tampas e colunas de madeira (giram com a ampulheta)
    c, s = math.cos(th), math.sin(th)
    def P(u, v): return CX + c * u - s * v, CY + s * u + c * v
    for sg in (-1, 1):
        a = P(-300, sg * (C + RBULB + 22)); b = P(300, sg * (C + RBULB + 22)); segmento(img, *a, *b, 34, alpha, .55)
        for uu in (-285, 285):
            a = P(uu, -(C + RBULB + 10)); b = P(uu, C + RBULB + 10); segmento(img, *a, *b, 12, alpha, .45)

def main():
    x = np.zeros(NMAX); y = np.zeros(NMAX); vx = np.zeros(NMAX); vy = np.zeros(NMAX); viva = np.zeros(NMAX, np.int64); ger = np.zeros(NMAX, np.int64)
    ldv = np.zeros(NMAX); passou = -np.ones(NMAX, np.int64); x[0], y[0], viva[0] = CX, CY - C - 60, 1; n = 1
    sprs = [sprite(c, RB) for c in GEN]; ca = np.zeros(16384, np.int64); cb = np.zeros(16384, np.int64)
    th, th0, th1, t_flip, viradas = 0.0, 0.0, 0.0, -9.0, 0
    t_press = None; t_crack = None; t_exp = None; cracks = []; shards = []; ultimo_n, t_ultimo_cresc = 1, 0.0
    out = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/ampulheta-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = 1.0; f = 0; cima_ant, t_cima = -1, 0.0
    while True:
        t = f / FPS
        kf = min(1.0, (t - t_flip) / 1.4); kf = kf * kf * (3 - 2 * kf); th = th0 + (th1 - th0) * kf
        if t >= T0 and t_exp is None:
            for _ in range(SUB):
                dt = 1 / FPS / SUB; antes = ldv[:n].copy()
                passo(x, y, vx, vy, viva, n, th, dt, ldv)
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
                vx[:n] *= .997; vy[:n] *= .997
                cruzou = np.nonzero((np.sign(antes) != np.sign(ldv[:n])) & (antes != 0) & (viva[:n] == 1))[0]
                for i in cruzou:
                    if passou[i] == viradas: continue  # cada bola dobra uma vez por virada
                    passou[i] = viradas
                    if n < NMAX and t_press is None:
                        x[n], y[n] = x[i] + R.uniform(-4, 4), y[i] + R.uniform(-2, 2); vx[n], vy[n] = vx[i] + R.uniform(-30, 30), vy[i]
                        viva[n] = 1; ger[n] = min(len(GEN) - 1, viradas + 1); ldv[n] = ldv[i]; passou[n] = viradas; n += 1
                        EV.append((t, 'passa', int(ger[n - 1])))
        if n > ultimo_n: ultimo_n, t_ultimo_cresc = n, t
        # virada automática: o bulbo de cima (em relação à gravidade) esvaziou
        if t >= T0 + .8 and kf >= 1 and t_press is None:
            cima = int(((y[:n] < CY - 40) & (viva[:n] == 1)).sum())
            if cima != cima_ant: cima_ant, t_cima = cima, t
            if t - t_flip > 1.6 and (cima <= int(.015 * n) or (t - t_cima > 2.5 and n < 600)):
                th0, th1, t_flip = th, th + math.pi, t; viradas += 1; EV.append((t, 'vira', viradas))
        # entupiu: não cresce há 2,5 s com o bulbo de cima ainda cheio → pressão → trincas → explosão
        if t_press is None and n > 300 and t - t_ultimo_cresc > 2.5 and kf >= 1 and ((y[:n] < CY).sum() > 30): t_press = t; EV.append((t, 'pressao', n))
        if t_press is not None and t_crack is None and t - t_press > 2.2: t_crack = t; EV.append((t, 'trinca', 0))
        if t_crack is not None and t - t_crack < 2.4 and f % 4 == 0:
            a0 = R.uniform(0, 2 * math.pi); sgn = R.choice([-1, 1]); u0, v0 = RBULB * math.cos(a0), sgn * C + RBULB * math.sin(a0)
            pts = [(u0, v0)]
            for _ in range(5): pts.append((pts[-1][0] + R.uniform(-45, 45), pts[-1][1] + R.uniform(-45, 45)))
            cracks.append((pts, t)); EV.append((t, 'estalo', 0))
        if t_crack is not None and t_exp is None and t - t_crack > 2.4:
            t_exp = t; EV.append((t, 'explode', n))
            m = viva[:n] == 1; dx, dy = x[:n][m] - CX, y[:n][m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(800, 1900, m.sum())
            vx[:n][m] = dx / d * sp; vy[:n][m] = dy / d * sp - 500; viva[:n][m] = 2
            for q in range(70):
                aq = R.uniform(0, 2 * math.pi); sg = R.choice([-1, 1]); px, py = CX + RBULB * math.cos(aq), CY + sg * C + RBULB * math.sin(aq)
                shards.append([px, py, (px - CX) * R.uniform(2, 5), (py - CY) * R.uniform(1, 3) - 300, R.uniform(0, math.pi), R.uniform(-8, 8)])
        if t_exp is not None:
            m = viva[:n] == 2; vy[:n][m] += G * .6 / FPS; x[:n][m] += vx[:n][m] / FPS; y[:n][m] += vy[:n][m] / FPS
            for sh in shards: sh[3] += G * .6 / FPS; sh[0] += sh[2] / FPS; sh[1] += sh[3] / FPS; sh[4] += sh[5] / FPS
        # ── desenho
        img = BG.copy()
        loop = t_exp is not None and t > t_exp + 2.8
        if t_exp is None:
            moldura(img, th, 1.0); vidro(img, th, 1.0, 0)
            shake = 5 * math.sin(t * 70) * (min(1, (t - t_press) / 2) if t_press is not None else 0)
            for pts, tc in cracks:
                k = min(1.0, (t - tc) / .3); m_ = max(1, int(len(pts) * k)); c, s = math.cos(th), math.sin(th)
                for q in range(m_ - 1):
                    (u1, v1), (u2, v2) = pts[q], pts[q + 1]
                    segmento(img, CX + c * u1 - s * v1 + shake, CY + s * u1 + c * v1, CX + c * u2 - s * v2 + shake, CY + s * u2 + c * v2, 3, .9, 1.1)
        else:
            for sh in shards:
                age = t - t_exp; L = 18
                if age < 2.2: segmento(img, sh[0] - L * math.cos(sh[4]), sh[1] - L * math.sin(sh[4]), sh[0] + L * math.cos(sh[4]), sh[1] + L * math.sin(sh[4]), 4, max(0, 1 - age / 2.2), 1.1)
        for i in np.nonzero((viva[:n] == 1) | (viva[:n] == 2))[0]: blit(img, sprs[ger[i]], x[i], y[i], 1.0)
        if loop:
            k = min(1.0, (t - t_exp - 2.8) / .8); img = img * (1 - k) + BG * k
            tmp = BG.copy(); moldura(tmp, 0.0, 1.0); vidro(tmp, 0.0, 1.0, 0); blit(tmp, sprs[0], CX, CY - C - 60, 1.0); img = img * (1 - k) + tmp * k
        if t < 3.4:
            poe_texto(img, 'CADA BOLA QUE PASSA', 66, 540, 300, (255, 255, 255), 1, '800', 10, pop_in(t, 0))
            poe_texto(img, 'PELO GARGALO VIRA DUAS', 66, 540, 385, (255, 214, 64), 1, '800', 10, pop_in(t, .15))
            poe_texto(img, 'Quantas viradas até quebrar? Chuta!', 40, 540, 1700, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 130, 540, 290, (255, 255, 255), 1, '800', 14)
            poe_texto(img, ('bola' if n == 1 else 'bolas') + f' · virada {viradas}', 40, 540, 380, (200, 210, 230), 1, '600', 6, pop_in(t, t_flip) if viradas else 1)
            if t_press is not None and t_exp is None: poe_texto(img, 'ENTUPIU!' if t_crack is None else 'O VIDRO VAI QUEBRAR!', 62, 540, 1720, (255, 77, 90), 1, '800', 10, 1 + .08 * math.sin(t * 22))
            if t_exp is not None: poe_texto(img, f'QUEBROU NA VIRADA {viradas}!', 76, 540, 980, (255, 214, 64), min(1, (t - t_exp) * 4), '800', 12, pop_in(t, t_exp, .35))
            if t_exp is not None and t > t_exp + .8: poe_texto(img, 'Você acertou?', 56, 540, 1700, (255, 255, 255), min(1, (t - t_exp - .8) * 3), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas · virada', viradas, flush=True)
        f += 1
        if (t_exp is not None and t > t_exp + 3.8) or t > 90: break
    out.stdin.close(); out.wait()
    json.dump({'dur': f / FPS, 'n': n, 'viradas': viradas, 'eventos': EV}, open(f'{ROOT}/out/eventos-ampulheta.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · viradas', viradas, '· pressão', t_press, '· explosão', t_exp)

if __name__ == '__main__':
    main()
