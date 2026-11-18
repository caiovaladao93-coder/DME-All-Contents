"""ANEL MUSICAL · "Quantas bolas cabem aqui dentro?" (9:16, 1080×1920, 30 fps). Um formato só, do início ao fim:
começa com 1 bola dentro de um anel de 12 segmentos coloridos que gira devagar. Cada segmento é uma nota: quando uma bola bate nele,
o segmento acende, toca a nota e solta uma bola nova da cor dele (crescimento controlado, ~dobra a cada 4,8 s).
Quando o anel lota, a pressão sobe, os segmentos tremem e racham, e estouram um a um. No fim volta 1 bola no centro (loop).
Reaproveita física e desenho de gerar.py. Saída: out/anel-mudo.mp4 e out/eventos-anel.json (som: scripts/som_anel.py)."""
import json, math, subprocess, sys
import numpy as np
from numba import njit
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, CX, CY, FPS, H, ROOT, SUB, W, blit, colisoes, fmt, poe_texto, pop_in, sprite

R = np.random.default_rng(1212)
NSEG, RR, TH, RB, OM, G = 12, 430.0, 22.0, 9.5, .3, 900.0
NMAX, CAP = 1900, 1700           # CAP: a partir daqui a pressão racha o anel
T_LOOP_IN = 1.0                   # 1 bola parada no centro até aqui (igual ao último quadro)
HUE = np.array([[255, 77, 90], [255, 122, 61], [255, 172, 51], [255, 214, 64], [190, 230, 70], [80, 220, 120],
                [45, 210, 190], [46, 170, 241], [70, 120, 255], [130, 95, 240], [190, 85, 230], [255, 80, 170]], np.float32)
EV = []

@njit(cache=True)
def arco(img, cx, cy, rr, th, a0, a1, r, g, b, br, alpha):
    # segmento de anel entre os ângulos a0 e a1 (rad), com bordas arredondadas e sombreamento leve
    x0, x1 = int(max(0, cx - rr - th)), int(min(img.shape[1] - 1, cx + rr + th)); y0, y1 = int(max(0, cy - rr - th)), int(min(img.shape[0] - 1, cy + rr + th))
    am = (a0 + a1) / 2; ah = (a1 - a0) / 2
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            dx, dy = xx + .5 - cx, yy + .5 - cy; d = math.sqrt(dx * dx + dy * dy); sd = abs(d - rr) - th / 2
            if sd > 1: continue
            a = math.atan2(dy, dx) - am
            while a > math.pi: a -= 2 * math.pi
            while a < -math.pi: a += 2 * math.pi
            ea = (abs(a) - ah) * rr
            if ea > 1: continue
            cov = min(1.0, max(0.0, .5 - sd)) * min(1.0, max(0.0, .5 - ea)) * alpha
            if cov <= 0: continue
            lum = .7 + .3 * (1 - min(1.0, abs(d - rr) / (th / 2 + .01))) + .2 * (-math.sin(math.atan2(dy, dx)) * .5 + .5)
            lum *= br
            img[yy, xx, 0] = img[yy, xx, 0] * (1 - cov) + min(255.0, r * lum) * cov
            img[yy, xx, 1] = img[yy, xx, 1] * (1 - cov) + min(255.0, g * lum) * cov
            img[yy, xx, 2] = img[yy, xx, 2] * (1 - cov) + min(255.0, b * lum) * cov

def main():
    DUR = 75.0
    x = np.zeros(NMAX); y = np.zeros(NMAX); vx = np.zeros(NMAX); vy = np.zeros(NMAX); viva = np.zeros(NMAX, np.int64); cor = np.zeros(NMAX, np.int64)
    x[0], y[0], viva[0], cor[0] = CX, CY, 1, 0; n = 1
    sprs = [sprite(c, RB) for c in HUE]; spr_big = sprite(HUE[0], RB * 2.2); ca = np.zeros(16384, np.int64); cb = np.zeros(16384, np.int64)
    luz = np.zeros(NSEG); crack = np.zeros(NSEG); t_estouro = None; seg_t = [None] * NSEG; segs_fly = []
    out = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/anel-mudo.mp4'], stdin=subprocess.PIPE)
    T_FIM_EXPL = None
    for f in range(int(DUR * FPS)):
        t = f / FPS; rot = OM * t; seglen = 2 * math.pi / NSEG
        if t >= T_LOOP_IN and viva[0] == 1 and vx[0] == 0 and vy[0] == 0: vx[0], vy[0] = 330.0, -520.0; EV.append((t, 'solta', 0))
        cheio = n >= CAP
        if cheio and t_estouro is None:
            if 'cheio' not in [e[1] for e in EV]: EV.append((t, 'cheio', 0)); t_cheio = t
            if t - t_cheio > 5.5: t_estouro = t; EV.append((t, 'estouro', 0))
        for _ in range(SUB if t >= T_LOOP_IN else 0):
            dt = 1 / FPS / SUB; m = viva >= 1
            vy[m] += G * dt; x[m] += vx[m] * dt; y[m] += vy[m] * dt
            if t_estouro is None:
                dx, dy = x - CX, y - CY; d = np.hypot(dx, dy) + 1e-9
                hit = (viva == 1) & (d > RR - TH / 2 - RB)
                for i in np.nonzero(hit)[0]:
                    ux, uy = dx[i] / d[i], dy[i] / d[i]; vn = vx[i] * ux + vy[i] * uy
                    if vn > 0:
                        vx[i] -= 2 * vn * ux; vy[i] -= 2 * vn * uy; sp = math.hypot(vx[i], vy[i])
                        if sp < 820: vx[i] *= 820 / sp; vy[i] *= 820 / sp
                        k = int(((math.atan2(uy, ux) - rot) % (2 * math.pi)) / seglen) % NSEG
                        luz[k] = 1.0; EV.append((t, 'nota', k))
                        if n < min(NMAX, 2 ** ((t - T_LOOP_IN) / 4.8 + .4)):
                            a = R.uniform(-.7, .7); c_, s_ = math.cos(a), math.sin(a)
                            x[n], y[n] = x[i] - ux * 4, y[i] - uy * 4; vx[n], vy[n] = vx[i] * c_ - vy[i] * s_, vx[i] * s_ + vy[i] * c_
                            viva[n] = 1; cor[n] = k; n += 1
                    x[i], y[i] = CX + ux * (RR - TH / 2 - RB), CY + uy * (RR - TH / 2 - RB)
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
            else:
                # segmentos se soltam um a um; bolas atrás de um segmento solto escapam com impulso
                dx, dy = x - CX, y - CY; d = np.hypot(dx, dy) + 1e-9
                ang = (np.arctan2(dy, dx) - rot) % (2 * math.pi); ks = (ang / seglen).astype(np.int64) % NSEG
                aberto = np.array([seg_t[k] is not None for k in range(NSEG)])
                hit = (viva == 1) & (d > RR - TH / 2 - RB)
                fecha = hit & ~aberto[ks]
                if fecha.any():
                    ux, uy = dx[fecha] / d[fecha], dy[fecha] / d[fecha]; vn = vx[fecha] * ux + vy[fecha] * uy; pos = vn > 0
                    vx[fecha] -= np.where(pos, 2 * vn * ux, 0); vy[fecha] -= np.where(pos, 2 * vn * uy, 0)
                    x[fecha], y[fecha] = CX + ux * (RR - TH / 2 - RB), CY + uy * (RR - TH / 2 - RB)
                livre = hit & aberto[ks]
                viva[livre & (d > RR + TH)] = 2
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
        if t_estouro is not None:
            for k in range(NSEG):  # ordem do estouro: a partir do segmento de baixo, alternando os lados
                ordem = sorted(range(NSEG), key=lambda q: abs(((q + .5) * seglen + rot - math.pi / 2 + math.pi) % (2 * math.pi) - math.pi))
                kk = ordem[k]
                if seg_t[kk] is None and t >= t_estouro + k * .16:
                    seg_t[kk] = t; EV.append((t, 'segmento', kk)); am = (kk + .5) * seglen + rot
                    segs_fly.append([CX + RR * math.cos(am), CY + RR * math.sin(am), math.cos(am) * 900, math.sin(am) * 900 - 400, kk, am, t])
                    # pressão: as bolas perto do segmento são empurradas para fora
                    dx, dy = x - CX, y - CY; d = np.hypot(dx, dy) + 1e-9; ang = np.arctan2(dy, dx)
                    perto = (viva == 1) & (np.abs(np.angle(np.exp(1j * (ang - am)))) < seglen) & (d > RR * .55)
                    vx[perto] += dx[perto] / d[perto] * 700; vy[perto] += dy[perto] / d[perto] * 700
            if all(s is not None for s in seg_t) and T_FIM_EXPL is None:
                T_FIM_EXPL = t
                m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9
                sp = R.uniform(700, 1600, m.sum()); vx[m] = dx / d * sp; vy[m] = dy / d * sp - 400; viva[m] = 2; EV.append((t, 'explode', 0))
        viva[(viva == 2) & ((y > H + 80) | (x < -80) | (x > W + 80))] = 3
        for s in segs_fly: s[3] += G * .8 / FPS; s[0] += s[2] / FPS; s[1] += s[3] / FPS
        luz *= .82
        pres = 0.0 if not cheio else min(1.0, (t - t_cheio) / 5.5)
        # ── desenho
        img = BG.copy()
        loop = T_FIM_EXPL is not None and t > T_FIM_EXPL + 2.6
        shake = (math.sin(t * 71) * 6 * pres) if t_estouro is None else 0
        for k in range(NSEG):
            if seg_t[k] is not None: continue
            a0 = k * seglen + rot + .025; a1 = (k + 1) * seglen + rot - .025; c = HUE[k]
            br = .62 + .9 * luz[k] + .15 * pres * (math.sin(t * 30 + k) > 0)
            arco(img, CX + shake, CY + shake * .6, RR, TH, a0, a1, c[0], c[1], c[2], br, 1.0)
        for s in segs_fly:
            age = t - s[6]
            if age < 1.6:
                c = HUE[s[4]]; arco(img, s[0] - (RR) * math.cos(s[5]), s[1] - (RR) * math.sin(s[5]), RR, TH, s[5] - seglen / 2 + .03, s[5] + seglen / 2 - .03, c[0], c[1], c[2], 1.0, max(0, 1 - age / 1.6))
        for i in np.nonzero((viva == 1) | (viva == 2))[0]: blit(img, sprs[cor[i]], x[i], y[i], 1.0)
        if loop:  # volta ao início: anel inteiro e 1 bola no centro (igual ao quadro 0)
            k = min(1.0, (t - T_FIM_EXPL - 2.6) / .8); img = img * (1 - k) + BG * k
            for q in range(NSEG): arco(img, CX, CY, RR, TH, q * seglen + rot + .025, (q + 1) * seglen + rot - .025, HUE[q][0], HUE[q][1], HUE[q][2], .62, k)
            blit(img, sprs[0], CX, CY, k)
        # textos
        if t < 3.4:
            poe_texto(img, 'QUANTAS BOLAS', 78, 540, 330, (255, 255, 255), 1, '800', 10, pop_in(t, 0))
            poe_texto(img, 'CABEM AQUI DENTRO?', 78, 540, 430, (255, 255, 255), 1, '800', 10, pop_in(t, .15))
            poe_texto(img, 'Chuta nos comentários!', 46, 540, 1530, (255, 214, 64), 1, '800', 8)
        elif not loop:
            poe_texto(img, fmt(n), 150, 540, 380, (255, 255, 255), 1, '800', 14, 1 + .06 * luz.max())
            poe_texto(img, 'bola' if n == 1 else 'bolas', 46, 540, 480, (200, 210, 230), 1, '600', 6)
            if cheio and t_estouro is None: poe_texto(img, 'PRESSÃO', 44, 540, 1500, (255, 77, 90), 1, '800', 8, 1 + .1 * math.sin(t * 20)); img[1540:1556, 240:840] = img[1540:1556, 240:840] * .4; img[1540:1556, 240:240 + int(600 * pres)] = np.array([255, 77, 90], np.float32)
            if t_estouro is not None and T_FIM_EXPL is not None: poe_texto(img, 'ESTOUROU!', 120, 540, 960, (255, 214, 64), min(1, (t - T_FIM_EXPL) * 4), '800', 14, pop_in(t, T_FIM_EXPL, .35))
            if T_FIM_EXPL is not None and t > T_FIM_EXPL + .8: poe_texto(img, 'Você chutou quanto?', 52, 540, 1530, (255, 255, 255), min(1, (t - T_FIM_EXPL - .8) * 3), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', n, 'bolas', flush=True)
        if T_FIM_EXPL is not None and t > T_FIM_EXPL + 3.6: break
    out.stdin.close(); out.wait()
    json.dump({'dur': (f + 1) / FPS, 'n': n, 'eventos': EV}, open(f'{ROOT}/out/eventos-anel.json', 'w'))
    print('fim', round((f + 1) / FPS, 2), 's ·', n, 'bolas · estouro', t_estouro, 'explosão', T_FIM_EXPL)

if __name__ == '__main__':
    main()
