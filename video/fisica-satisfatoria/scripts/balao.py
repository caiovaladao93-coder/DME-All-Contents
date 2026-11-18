"""BALÃO ELÁSTICO · "Quantas bolas até estourar?" (9:16, 1080×1920, 30 fps). Um formato só:
1 bola dentro de um balão de borracha preso por um barbante. A borda é uma MEMBRANA (anel de nós ligados por molas), empurrada
pela pressão das bolas (P ∝ n / área) e pelos impactos; cada bola que bate na borda cria mais uma. A borracha estica, fica mais fina
e mais clara; no limite rasga no ponto mais esticado, a borracha se recolhe até o nó e as bolas voam. No fim, volta o balão murcho
com 1 bola (loop). Saída: out/balao-mudo.mp4 e out/eventos-balao.json (som: scripts/som_balao.py)."""
import json, math, subprocess, sys
import numpy as np
from numba import njit
from PIL import Image, ImageDraw
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

R = np.random.default_rng(77)
M, RB, G = 140, 7.5, 700.0
KX, KY = 540.0, 1450.0                 # nó do balão (fixo)
R0 = 150.0                            # raio inicial (murcho)
NMAX = 1500
STRETCH_POP = 2.55                     # estica até 255% do perímetro inicial e estoura
COLS = np.array([[255, 214, 64], [255, 255, 255], [46, 196, 241], [61, 220, 132], [255, 159, 28], [190, 120, 255]], np.float32)
EV = []
import os
RAPIDO = os.environ.get('RAPIDO') == '1'

@njit(cache=True)
def membrana(mx, my, mvx, mvy, n, L0, dt, rasgado, kp):
    Mn = mx.shape[0]
    fx = np.zeros(Mn); fy = np.zeros(Mn)
    area = 0.0
    for i in range(Mn):
        j = (i + 1) % Mn; area += mx[i] * my[j] - mx[j] * my[i]
    sg = 1.0 if area > 0 else -1.0
    area = abs(area) / 2 + 1.0
    P = kp * (n + 8.0) ** .77 / area
    for i in range(Mn):
        j = (i + 1) % Mn
        if rasgado >= 0 and i == rasgado: continue
        dx, dy = mx[j] - mx[i], my[j] - my[i]; l = math.sqrt(dx * dx + dy * dy) + 1e-9
        ks = 520.0 if rasgado < 0 else 2600.0
        if l > L0 or rasgado >= 0:
            f = ks * (l - L0 * (1.0 if rasgado < 0 else .05)); fx[i] += f * dx / l; fy[i] += f * dy / l; fx[j] -= f * dx / l; fy[j] -= f * dy / l
        if rasgado < 0:  # pressão: força para fora proporcional ao comprimento do segmento
            nx, ny = sg * dy, -sg * dx  # normal para fora (sinal pela orientação do polígono)
            fx[i] += P * nx / 2; fy[i] += P * ny / 2; fx[j] += P * nx / 2; fy[j] += P * ny / 2
    for i in range(Mn):  # suavização (rigidez à flexão) e empuxo leve
        a, b = (i - 1) % Mn, (i + 1) % Mn
        if rasgado < 0:
            fx[i] += 60.0 * ((mx[a] + mx[b]) / 2 - mx[i]); fy[i] += 60.0 * ((my[a] + my[b]) / 2 - my[i]) - 30.0
    for i in range(Mn):
        if i == 0: mvx[i] = 0; mvy[i] = 0; continue
        mvx[i] = (mvx[i] + fx[i] * dt) * .993; mvy[i] = (mvy[i] + fy[i] * dt) * .993
        mx[i] += mvx[i] * dt; my[i] += mvy[i] * dt
    return area

@njit(cache=True)
def bolas_borda(x, y, vx, vy, viva, n, mx, my, mvx, mvy, hits):
    Mn = mx.shape[0]; cx = 0.0; cy = 0.0
    sa = 0.0
    for i in range(Mn):
        cx += mx[i]; cy += my[i]; j = (i + 1) % Mn; sa += mx[i] * my[j] - mx[j] * my[i]
    sg = 1.0 if sa > 0 else -1.0
    cx /= Mn; cy /= Mn
    ang = np.empty(Mn)
    for i in range(Mn): ang[i] = math.atan2(my[i] - cy, mx[i] - cx)
    nh = 0
    kim = .03 / max(1.0, n) ** .8  # o empurrão total das bolas fica limitado; quem infla é a pressão
    for b in range(n):
        if viva[b] != 1: continue
        phi = math.atan2(y[b] - cy, x[b] - cx); seg = -1
        for i in range(Mn):
            j = (i + 1) % Mn; a0, a1 = ang[i], ang[j]; da = a1 - a0
            while da > math.pi: da -= 2 * math.pi
            while da < -math.pi: da += 2 * math.pi
            dp = phi - a0
            while dp > math.pi: dp -= 2 * math.pi
            while dp < -math.pi: dp += 2 * math.pi
            if (da >= 0 and 0 <= dp <= da) or (da < 0 and da <= dp <= 0): seg = i; break
        if seg < 0: continue
        i, j = seg, (seg + 1) % Mn
        ex, ey = mx[j] - mx[i], my[j] - my[i]; L = math.sqrt(ex * ex + ey * ey) + 1e-9; nx, ny = sg * ey / L, -sg * ex / L
        dist = (x[b] - mx[i]) * nx + (y[b] - my[i]) * ny   # >0 = fora da borda
        if dist > -RB:
            x[b] -= nx * (dist + RB); y[b] -= ny * (dist + RB)
            vn = vx[b] * nx + vy[b] * ny
            if vn > 0:
                vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
                if i != 0: mvx[i] += vn * nx * kim; mvy[i] += vn * ny * kim
                if j != 0: mvx[j] += vn * nx * kim; mvy[j] += vn * ny * kim
                if nh < hits.shape[0]: hits[nh] = b; nh += 1
    return nh

def main():
    th = np.pi / 2 + np.linspace(0, 2 * math.pi, M, endpoint=False)     # nó 0 embaixo (no barbante)
    cy0 = KY - R0 * 1.05
    mx = KX + R0 * np.cos(th); my = cy0 + R0 * np.sin(th) * 1.08; mx[0], my[0] = KX, KY
    mvx = np.zeros(M); mvy = np.zeros(M)
    per0 = np.hypot(np.diff(np.r_[mx, mx[0]]), np.diff(np.r_[my, my[0]])).sum(); L0 = per0 / M * .92
    x = np.zeros(NMAX); y = np.zeros(NMAX); vx = np.zeros(NMAX); vy = np.zeros(NMAX); viva = np.zeros(NMAX, np.int64); cor = np.zeros(NMAX, np.int64)
    x[0], y[0], viva[0] = KX, cy0, 1; n = 1
    sprs = [sprite(c, RB) for c in COLS]; ca = np.zeros(16384, np.int64); cb = np.zeros(16384, np.int64); hits = np.zeros(4096, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/balao-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = 1.0; t_cheio = None; kp = 26300.0; rasg = -1; t_pop = None; f = 0; stretch = 1.0; mx0, my0 = mx.copy(), my.copy()
    while True:
        t = f / FPS
        if t >= T0 and viva[0] == 1 and vx[0] == 0 and vy[0] == 0 and t_pop is None: vx[0], vy[0] = 420.0, -560.0; EV.append((t, 'solta', 0))
        if n >= NMAX and t_cheio is None: t_cheio = t
        # pressão controlada: a esticada segue uma curva-alvo pelo nº de bolas (e sobe devagar quando enche)
        s_alvo = 1 + 1.35 * (math.log(n) / math.log(NMAX)) ** 1.2 + (.04 * (t - t_cheio) if t_cheio is not None else 0)
        if t >= T0: kp = min(4e5, max(3000.0, kp * math.exp(5.0 * (s_alvo - stretch) / FPS)))
        for _ in range(SUB if t >= T0 else 0):
            dt = 1 / FPS / SUB
            membrana(mx, my, mvx, mvy, n, L0, dt, rasg, kp)
            m = viva >= 1; vy[m] += G * dt; x[m] += vx[m] * dt; y[m] += vy[m] * dt
            if t_pop is None:
                nh = bolas_borda(x, y, vx, vy, viva, n, mx, my, mvx, mvy, hits)
                for q in range(nh):
                    b = hits[q]; sp = math.hypot(vx[b], vy[b])
                    if sp < 650: vx[b] *= 650 / sp; vy[b] *= 650 / sp
                    EV.append((t, 'bate', int(cor[b])))
                    if n < min(NMAX, 2 ** ((t - T0) / 4.9 + .3)):
                        a = R.uniform(-.7, .7); c_, s_ = math.cos(a), math.sin(a)
                        x[n], y[n] = x[b], y[b]; vx[n], vy[n] = vx[b] * c_ - vy[b] * s_, vx[b] * s_ + vy[b] * c_
                        viva[n] = 1; cor[n] = R.integers(0, len(COLS)); n += 1
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        per = np.hypot(np.diff(np.r_[mx, mx[0]]), np.diff(np.r_[my, my[0]])).sum(); stretch = per / per0
        if t_pop is None and (stretch >= STRETCH_POP or t > 85):
            t_pop = t; segl = np.hypot(np.roll(mx, -1) - mx, np.roll(my, -1) - my); segl[0] = 0; segl[-1] = 0; rasg = int(np.argmax(segl))
            EV.append((t, 'estoura', n))
            m = viva == 1; cxm, cym = mx.mean(), my.mean(); dx, dy = x[m] - cxm, y[m] - cym; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(600, 1700, m.sum())
            vx[m] = dx / d * sp; vy[m] = dy / d * sp - 300; viva[m] = 2
        if t_pop is not None:
            viva[(viva == 2) & ((y > H + 80) | (x < -80) | (x > W + 80) | (y < -200))] = 3
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', n, 'bolas · esticado', round(stretch, 2), 'kp', int(kp), flush=True)
            f += 1
            if t_pop is not None and t > t_pop + 5.0: break
            continue
        # ── desenho
        img = BG.copy()
        loop = t_pop is not None and t > t_pop + 3.0
        sway = math.sin(t * 1.3) * 10
        segmento(img, KX, KY, KX + sway, H + 20, 3, 1.0, .75)                          # barbante
        if not loop:
            poly = list(zip(mx.tolist(), my.tolist()))
            if t_pop is None:
                mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(poly, fill=255); mk = np.asarray(mask, np.float32)[..., None] / 255
                a_fill = .42 / stretch ** .8; tint = np.array([235, 50, 70], np.float32) * (1 - .25 * (stretch - 1) / 1.6) + np.array([255, 200, 200], np.float32) * .25 * (stretch - 1) / 1.6
                img = img * (1 - mk * a_fill) + tint * mk * a_fill
            for i in np.nonzero((viva == 1) | (viva == 2))[0]: blit(img, sprs[cor[i]], x[i], y[i], 1.0)
            th_b = max(3.0, 13 / stretch ** 1.1); br = .9 + .1 * stretch
            col_r = min(1.0, .55 + .25 * (stretch - 1))
            for i in range(M):
                j = (i + 1) % M
                if i == rasg: continue
                segmento(img, mx[i], my[i], mx[j], my[j], th_b, 1.0 if t_pop is None else max(0, 1 - (t - t_pop) / 1.2), br)
            if t_pop is None:  # reflexo de borracha
                cxm, cym = mx.mean(), my.mean(); rr = math.sqrt(max(1, ((mx - cxm) ** 2 + (my - cym) ** 2).mean()))
                for q in range(8):
                    a1, a2 = -2.5 + q * .08, -2.5 + (q + 1) * .08
                    segmento(img, cxm + rr * .72 * math.cos(a1), cym + rr * .72 * math.sin(a1), cxm + rr * .72 * math.cos(a2), cym + rr * .72 * math.sin(a2), 9, .35 / stretch ** .5, 1.2)
            # nó
            segmento(img, KX - 14, KY + 4, KX + 14, KY + 4, 10, 1.0, .8)
        else:
            k = min(1.0, (t - t_pop - 3.0) / .8); img = img * (1 - k) + BG * k
            tmp = BG.copy(); segmento(tmp, KX, KY, KX, H + 20, 3, 1.0, .75)
            mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(list(zip(mx0.tolist(), my0.tolist())), fill=255); mk = np.asarray(mask, np.float32)[..., None] / 255
            tmp = tmp * (1 - mk * .42) + np.array([235, 50, 70], np.float32) * mk * .42
            for i in range(M): segmento(tmp, mx0[i], my0[i], mx0[(i + 1) % M], my0[(i + 1) % M], 13, 1.0, .9)
            blit(tmp, sprs[0], KX, cy0, 1.0); segmento(tmp, KX - 14, KY + 4, KX + 14, KY + 4, 10, 1.0, .8)
            img = img * (1 - k) + tmp * k
        # textos
        if t < 3.4:
            poe_texto(img, 'CADA BATIDA NA BORDA', 66, 540, 300, (255, 255, 255), 1, '800', 10, pop_in(t, 0))
            poe_texto(img, 'CRIA MAIS UMA BOLA', 66, 540, 385, (255, 214, 64), 1, '800', 10, pop_in(t, .15))
            poe_texto(img, 'Quantas até estourar? Chuta!', 44, 540, 1580, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(n), 130, 540, 290, (255, 255, 255), 1, '800', 14)
            if t_pop is None:
                pct = int(round(stretch * 100)); cor_t = (255, 214, 64) if stretch < 2.1 else (255, 77, 90)
                poe_texto(img, f'borracha esticada: {pct}%', 40, 540, 380, cor_t, 1, '800', 6, 1 + (.06 * math.sin(t * 20) if stretch > 2.2 else 0))
            else:
                poe_texto(img, 'POW!', 190, 540, 760, (255, 214, 64), min(1, (t - t_pop) * 6), '800', 16, pop_in(t, t_pop, .3))
                poe_texto(img, f'ESTOUROU COM {fmt(n)} BOLAS!', 58, 540, 940, (255, 255, 255), min(1, (t - t_pop - .3) * 4), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1580, (255, 255, 255), min(1, max(0, (t - t_pop - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas · esticado', round(stretch, 2), flush=True)
        f += 1
        if t_pop is not None and t > t_pop + 5.0: break
    if out: out.stdin.close(); out.wait()
    json.dump({'dur': f / FPS, 'n': n, 'eventos': EV}, open(f'{ROOT}/out/eventos-balao.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', n, 'bolas · estouro', t_pop)

if __name__ == '__main__':
    main()
