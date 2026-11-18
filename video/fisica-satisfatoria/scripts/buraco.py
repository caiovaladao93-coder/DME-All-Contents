"""BURACO NEGRO INVERTIDO · "Cada bola que cai no buraco volta em dobro" (9:16, 1080×1920, 30 fps). Um formato só:
1 bola orbita uma arena circular com um buraco negro no centro (gravidade radial + atrito leve, então as órbitas viram espirais).
Toda bola que cai no buraco some e VOLTA EM DOBRO pela borda da arena, em órbita. O buraco cresce a cada bola engolida.
Com a arena lotada (1.500 bolas), o buraco incha, implode e EXPLODE: o anel da arena se parte e as bolas voam. Loop: 1 bola de novo.
Saída: out/buraco-mudo.mp4 e out/eventos-buraco.json (som: scripts/som_buraco.py)."""
import json, math, os, subprocess, sys
import numpy as np
from numba import njit
from PIL import Image
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, FPS, H, ROOT, SUB, W, anel, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

RAPIDO = os.environ.get('RAPIDO') == '1'
R = np.random.default_rng(404)
CX, CY, RA, RB = 540.0, 1000.0, 440.0, 8.0
GM, SOFT, DRAG = 4.8e7, 40.0 ** 2, .6
NMAX = 1500
HUE = np.array([[255, 77, 90], [255, 122, 61], [255, 172, 51], [255, 214, 64], [190, 230, 70], [80, 220, 120],
                [45, 210, 190], [46, 170, 241], [70, 120, 255], [130, 95, 240], [190, 85, 230], [255, 80, 170]], np.float32)
EV = []

@njit(cache=True)
def passo(x, y, vx, vy, viva, n, dt, rh, ativo, absorvidos):
    na = 0
    for b in range(n):
        if viva[b] == 0: continue
        dx, dy = x[b] - CX, y[b] - CY; r2 = dx * dx + dy * dy; r = math.sqrt(r2) + 1e-9
        if viva[b] == 1:
            a = GM / (r2 + SOFT)
            vx[b] += -dx / r * a * dt; vy[b] += -dy / r * a * dt
            vx[b] *= 1 - DRAG * dt; vy[b] *= 1 - DRAG * dt
            sp = math.sqrt(vx[b] ** 2 + vy[b] ** 2)
            if sp > 1500: vx[b] *= 1500 / sp; vy[b] *= 1500 / sp
        x[b] += vx[b] * dt; y[b] += vy[b] * dt
        if viva[b] != 1 or not ativo: continue
        dx, dy = x[b] - CX, y[b] - CY; r = math.sqrt(dx * dx + dy * dy) + 1e-9
        if r < rh:                                   # engolida
            viva[b] = 0
            if na < absorvidos.shape[0]: absorvidos[na] = b; na += 1
        elif r > RA - RB:                            # parede da arena
            nx, ny = dx / r, dy / r; vn = vx[b] * nx + vy[b] * ny
            x[b] = CX + nx * (RA - RB); y[b] = CY + ny * (RA - RB)
            if vn > 0: vx[b] -= 2 * vn * nx; vy[b] -= 2 * vn * ny
    return na

@njit(cache=True)
def buraco(img, cx, cy, rh, br):
    # disco negro com borda suave e um anel fino (horizonte) levemente claro
    x0, x1 = int(max(0, cx - rh - 6)), int(min(img.shape[1] - 1, cx + rh + 6)); y0, y1 = int(max(0, cy - rh - 6)), int(min(img.shape[0] - 1, cy + rh + 6))
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            d = math.sqrt((xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2)
            k = min(1.0, max(0.0, rh - d + .5))
            if k > 0:
                for c in range(3): img[yy, xx, c] = img[yy, xx, c] * (1 - k)
            ring = max(0.0, 1 - abs(d - rh) / 2.5) * br
            if ring > 0:
                for c in range(3): img[yy, xx, c] = img[yy, xx, c] * (1 - ring) + 235 * ring

def nasce(x, y, vx, vy, viva, cor, n, gen):
    a = R.uniform(0, 2 * math.pi); r = RA - RB - 3
    x[n], y[n] = CX + r * math.cos(a), CY + r * math.sin(a)
    v = math.sqrt(GM / r) * R.uniform(.72, .9)                       # um pouco abaixo da órbita: desce em espiral
    vx[n], vy[n] = -math.sin(a) * v - math.cos(a) * 60, math.cos(a) * v - math.sin(a) * 60
    viva[n] = 1; cor[n] = gen % len(HUE)

def main():
    NB = NMAX + 400
    x = np.zeros(NB); y = np.zeros(NB); vx = np.zeros(NB); vy = np.zeros(NB); viva = np.zeros(NB, np.int64); cor = np.zeros(NB, np.int64)
    x[0], y[0], vx[0], vy[0], viva[0] = CX, CY - 300, 170.0, 0.0, 1; n = 1   # 1 bola no alto, com velocidade lateral
    sprs = [sprite(c, RB) for c in HUE]; ca = np.zeros(32768, np.int64); cb = np.zeros(32768, np.int64); absv = np.zeros(4096, np.int64)
    out = None if RAPIDO else subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/buraco-mudo.mp4'], stdin=subprocess.PIPE)
    T0 = 1.0; total = 0; rh = 22.0; t_cheio = t_imp = t_exp = None; f = 0; vivas = 1; pedacos = []
    trail = np.zeros((H, W, 3), np.float32); rips = []; ult_rip = -9.0; pulso = 0.0
    while True:
        t = f / FPS
        ativo = t_imp is None
        # raio do buraco: cresce com as bolas engolidas; depois de cheio, incha rápido até implodir
        if t_imp is None:
            alvo = 22 + 1.05 * math.sqrt(total if t_cheio is None else tot_cheio) + (22.0 * (t - t_cheio) if t_cheio is not None else 0)
            rh += (alvo - rh) * .15
        if t >= T0:
            for _ in range(SUB):
                dt = 1 / FPS / SUB
                na = passo(x, y, vx, vy, viva, n, dt, rh, ativo, absv)
                for q in range(na):
                    total += 1; gen = total // 45
                    cap = min(NMAX, 2 ** ((t - T0) / 4.8 + .3))
                    filhos = 2 if vivas + 1 <= cap else 1
                    if t_cheio is not None: filhos = 1
                    vivas -= 1
                    for _k in range(filhos):
                        # reaproveita posições livres antes de crescer o vetor
                        if n < NB: nasce(x, y, vx, vy, viva, cor, n, gen); n += 1; vivas += 1
                        if len(rips) < 40 and t - ult_rip > .02: rips.append((x[n - 1], y[n - 1], t, int(cor[n - 1]))); ult_rip = t
                    pulso = 1.0
                    EV.append((t, 'engole', filhos))
                if ativo: colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
                # compacta quando o vetor encher (mantém só as vivas)
                if n > NB - 8:
                    keep = np.nonzero(viva > 0)[0]; m = len(keep)
                    for arr in (x, y, vx, vy, viva, cor): arr[:m] = arr[keep]
                    viva[m:] = 0; n = m
        if vivas >= NMAX and t_cheio is None: t_cheio = t; tot_cheio = total; EV.append((t, 'cheio', vivas))
        if t_cheio is not None and t_imp is None and rh >= RA * .52:
            t_imp = t; EV.append((t, 'implode', vivas)); rh_imp = rh
        if t_imp is not None and t_exp is None:
            rh = rh_imp * max(0.0, 1 - (t - t_imp) / .7) ** 2
            m = viva == 1; dx, dy = CX - x[m], CY - y[m]; vx[m] += dx * 3.0 / FPS; vy[m] += dy * 3.0 / FPS   # tudo é puxado para o centro
            if t - t_imp >= .7:
                t_exp = t; EV.append((t, 'explode', vivas))
                m = viva == 1; dx, dy = x[m] - CX, y[m] - CY; d = np.hypot(dx, dy) + 1e-9; sp = R.uniform(900, 2600, m.sum())
                x[m] = CX + dx / d * R.uniform(5, 60, m.sum()); y[m] = CY + dy / d * R.uniform(5, 60, m.sum())
                vx[m] = dx / d * sp; vy[m] = dy / d * sp; viva[m] = 2
                for k in range(16):
                    a0 = k * 2 * math.pi / 16; am = a0 + math.pi / 16; spd = R.uniform(500, 1100)
                    pedacos.append([a0, am, math.cos(am) * spd, math.sin(am) * spd, R.uniform(-3, 3)])
        if t_exp is not None:
            m = viva == 2; vy[m] += 900 / FPS
            viva[(viva == 2) & ((y > H + 60) | (y < -60) | (x < -60) | (x > W + 60))] = 0
        if RAPIDO:
            if f % 150 == 0: print(round(t, 1), 's ·', vivas, 'bolas · engolidas', total, '· buraco', round(rh), flush=True)
            f += 1
            if t_exp is not None and t > t_exp + 4.6: break
            if t > 95: break
            continue
        # ── desenho
        loop = t_exp is not None and t > t_exp + 3.0
        # rastros: camada que se apaga devagar, somada ao fundo
        trail *= .80
        if not loop:
            for i in np.nonzero(viva > 0)[0]: blit(trail, sprs[cor[i]], x[i], y[i], .55)
        img = BG + trail * .9
        pulso *= .75
        if not loop:
            # disco de acreção: 3 braços em espiral girando em volta do buraco
            if rh > 8 and t_exp is None:
                for arm in range(4):
                    for q in range(26):
                        u0, u1 = q / 26, (q + 1) / 26
                        a0 = -t * 2.2 + arm * 1.5708 + u0 * 3.2; a1 = -t * 2.2 + arm * 1.5708 + u1 * 3.2
                        r0, r1 = rh * (1.15 + 1.6 * u0), rh * (1.15 + 1.6 * u1)
                        segmento(img, CX + r0 * math.cos(a0), CY + r0 * math.sin(a0), CX + r1 * math.cos(a1), CY + r1 * math.sin(a1), 3, .42 * (1 - u0), 1.0)
            if t_exp is None: anel(img, CX, CY, RA + 6, 12, 0.0, -1.0, 1.0, 1.0)
            else:
                k = t - t_exp
                for a0, am, pvx, pvy, rot in pedacos:
                    ox, oy = pvx * k, pvy * k + 450 * k * k; aa = a0 + rot * k
                    for j in range(5):
                        b0, b1 = aa + j * (2 * math.pi / 16) / 5, aa + (j + 1) * (2 * math.pi / 16) / 5
                        segmento(img, CX + ox + (RA + 6) * math.cos(b0), CY + oy + (RA + 6) * math.sin(b0), CX + ox + (RA + 6) * math.cos(b1), CY + oy + (RA + 6) * math.sin(b1), 12, max(0, 1 - k / 2.2), 1.0)
            # ondas onde as bolas voltam em dobro
            rips = [r_ for r_ in rips if t - r_[2] < .45]
            for rx, ry, rt, rc in rips:
                u = (t - rt) / .45; anel(img, rx, ry, 6 + 46 * u, 3, 0.0, -1.0, 1.0, .7 * (1 - u))
            for i in np.nonzero(viva > 0)[0]: blit(img, sprs[cor[i]], x[i], y[i], 1.0)
            if t_exp is None: buraco(img, CX, CY, rh * (1 + .07 * pulso), 1.0)
            if t_exp is not None and t - t_exp < .25: img = img + (255 - img) * (1 - (t - t_exp) / .25) * .8
        else:
            k_ = min(1.0, (t - t_exp - 3.0) / .8); tmp = BG.copy(); anel(tmp, CX, CY, RA + 6, 12, 0.0, -1.0, 1.0, 1.0); buraco(tmp, CX, CY, 22.0, 1.0)
            blit(tmp, sprs[0], CX, CY - 300, 1.0); img = img * (1 - k_) + tmp * k_
        # câmera: zoom lento enquanto o buraco incha e tremor na implosão
        z = 1.0; sx = sy = 0.0
        if t_cheio is not None and not loop: z = 1 + .08 * min(1.0, (t - t_cheio) / 6.0) * (1 - (min(1.0, (t - t_exp) / .5) if t_exp is not None else 0))
        if t_imp is not None and t_exp is None: a_ = 14 * (t - t_imp) / .7; sx, sy = R.uniform(-a_, a_), R.uniform(-a_, a_)
        if z > 1.001 or sx or sy:
            cw, ch = W / z, H / z; x0, y0 = CX - cw / 2 + sx, CY - ch * (CY / H) + sy
            img = np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch)), np.float32)
        # textos
        if t < 3.6:
            poe_texto(img, 'CADA BOLA QUE CAI NO BURACO', 56, 540, 300, (255, 255, 255), 1, '800', 9, pop_in(t, 0))
            poe_texto(img, 'VOLTA EM DOBRO', 92, 540, 395, (255, 214, 64), 1, '800', 11, pop_in(t, .15))
            poe_texto(img, 'Quanto o buraco aguenta? Chuta!', 44, 540, 1560, (255, 255, 255), 1, '800', 7)
        elif not loop:
            poe_texto(img, fmt(vivas), 140, 540, 300, (255, 255, 255), 1, '800', 14)
            if t_exp is None:
                pct = int(round(100 * rh / RA)); quente = t_cheio is not None
                poe_texto(img, f'buraco: {pct}% da arena', 40, 540, 400, (255, 77, 90) if quente else (255, 214, 64), 1, '800', 6, 1 + (.06 * math.sin(t * 20) if quente else 0))
                if quente and t_imp is None: poe_texto(img, 'O BURACO ESTÁ INCHANDO!', 52, 540, 1560, (255, 77, 90), 1, '800', 8, 1 + .05 * math.sin(t * 18))
                if t_imp is not None: poe_texto(img, 'IMPLODINDO...', 64, 540, 1560, (255, 255, 255), 1, '800', 9)
            else:
                poe_texto(img, 'BOOM!', 190, 540, 760, (255, 214, 64), min(1, (t - t_exp) * 6), '800', 16, pop_in(t, t_exp, .3))
                poe_texto(img, f'ENGOLIU {fmt(total)} BOLAS!', 58, 540, 940, (255, 255, 255), min(1, max(0, (t - t_exp - .3) * 4)), '800', 10)
                poe_texto(img, 'Você chutou quanto?', 52, 540, 1560, (255, 255, 255), min(1, max(0, (t - t_exp - .9) * 3)), '800', 8)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's ·', vivas, 'bolas · engolidas', total, '· buraco', round(rh), flush=True)
        f += 1
        if t_exp is not None and t > t_exp + 4.6: break
        if t > 95: break
    if out: out.stdin.close(); out.wait()
    if not RAPIDO: json.dump({'dur': f / FPS, 'n': vivas, 'total': total, 'eventos': EV}, open(f'{ROOT}/out/eventos-buraco.json', 'w'))
    print('fim', round(f / FPS, 2), 's ·', vivas, 'bolas · engolidas', total, '· cheio', t_cheio, '· explode', t_exp)

if __name__ == '__main__':
    main()
