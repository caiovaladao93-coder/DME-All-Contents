"""GUERRA DE CORES · "6 cores. Só 1 sobrevive." (9:16, 1080×1920, 30 fps).
A arena tem um lado para cada cor viva: hexágono → pentágono → quadrado → triângulo → final num círculo.
A área da arena fica constante (o raio se ajusta a cada forma). Em cada colisão entre cores diferentes, a bola mais rápida pode
converter a outra (a probabilidade se ajusta para sair uma eliminação a cada ~8–12 s). Reaproveita a física e o desenho de gerar.py.
Saída: out/guerra-mudo.mp4 e out/eventos-guerra.json (som: scripts/som_guerra.py)."""
import json, math, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from gerar import BG, CX, CY, FPS, H, PAL, ROOT, SUB, W, Image, blit, colisoes, fmt, poe_texto, pop_in, segmento, sprite

R = np.random.default_rng(606)
CORES = [0, 1, 2, 3, 5, 6]; NOMES = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL', 'ROXO']
PER, RB, SPD, OM = 60, 13.0, 540.0, .32
N = PER * 6; AREA = 6 / 2 * 400 ** 2 * math.sin(2 * math.pi / 6)
def raio(n): return math.sqrt(AREA / math.pi) if n <= 2 else math.sqrt(AREA / (n / 2 * math.sin(2 * math.pi / n)))
def r_shape(theta, n):  # distância do centro até a borda na direção theta (polígono regular de n lados; n<=2 = círculo)
    if n <= 2: return np.full_like(theta, raio(n))
    a = 2 * math.pi / n; u = np.mod(theta, a) - a / 2; return raio(n) * math.cos(math.pi / n) / np.cos(u)
def normal(theta, n):
    if n <= 2: return np.cos(theta), np.sin(theta)
    a = 2 * math.pi / n; phi = (np.floor(np.mod(theta, 2 * math.pi) / a) + .5) * a; return np.cos(phi), np.sin(phi)
EV = []

def main():
    x = np.zeros(N); y = np.zeros(N); vx = np.zeros(N); vy = np.zeros(N); viva = np.ones(N, np.int64); team = np.repeat(np.arange(6), PER)
    for tm in range(6):
        ac = -math.pi / 2 + tm * math.pi / 3; c0x, c0y = CX + 230 * math.cos(ac), CY + 230 * math.sin(ac)
        for q in range(PER):
            i = tm * PER + q; rq, aq = 78 * math.sqrt(R.random()), R.uniform(0, 2 * math.pi); x[i], y[i] = c0x + rq * math.cos(aq), c0y + rq * math.sin(aq)
            a = R.uniform(0, 2 * math.pi); vx[i], vy[i] = math.cos(a) * SPD, math.sin(a) * SPD
    sprs = [sprite(PAL[c], RB) for c in CORES]; ca = np.zeros(8192, np.int64); cb = np.zeros(8192, np.int64)
    out = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/guerra-mudo.mp4'], stdin=subprocess.PIPE)
    T_GO = 3.2; vivos = list(range(6)); n_ant, n_cur, t_morph = 6, 6, -9.0; t_elim = T_GO; elims = []; banner = None; fim = None; lider_ant = -1; f = 0
    while True:
        t = f / FPS
        if fim is not None and t > fim + 4.2: break
        rot = OM * t; km = min(1.0, (t - t_morph) / 1.0); km = km * km * (3 - 2 * km)
        if t >= T_GO and fim is None:
            alvo = 8.5 if len(vivos) > 2 else 7.5  # tempo-alvo até a próxima eliminação (a final dura mais)
            el = t - t_elim; pconv = float(np.clip(.10 * (el / alvo) ** 2.2, .015, .9))
            for _ in range(SUB):
                dt = 1 / FPS / SUB; x += vx * dt; y += vy * dt
                dx, dy = x - CX, y - CY; d = np.hypot(dx, dy) + 1e-9; th = np.arctan2(dy, dx) - rot
                rl = (r_shape(th, n_ant) * (1 - km) + r_shape(th, n_cur) * km) - RB
                m = d > rl
                if m.any():
                    nx1, ny1 = normal(th[m], n_ant); nx2, ny2 = normal(th[m], n_cur); nx_ = nx1 * (1 - km) + nx2 * km; ny_ = ny1 * (1 - km) + ny2 * km
                    nl = np.hypot(nx_, ny_) + 1e-9; nx_, ny_ = nx_ / nl, ny_ / nl; cr, sr = math.cos(rot), math.sin(rot)
                    gx, gy = nx_ * cr - ny_ * sr, nx_ * sr + ny_ * cr
                    vn = vx[m] * gx + vy[m] * gy; pos = vn > 0
                    vx[m] -= np.where(pos, 2 * vn * gx, 0); vy[m] -= np.where(pos, 2 * vn * gy, 0)
                    x[m] = CX + dx[m] / d[m] * rl[m]; y[m] = CY + dy[m] / d[m] * rl[m]
                sp0 = np.hypot(vx, vy)
                nc = colisoes(x, y, vx, vy, viva, N, RB, 2 * RB + 1, ca, cb)
                for q in range(nc):
                    i, j = ca[q], cb[q]
                    if team[i] != team[j] and R.random() < pconv:
                        w, l = (i, j) if sp0[i] >= sp0[j] else (j, i); team[l] = team[w]; EV.append((t, 'conv', int(team[w])))
                sp = np.hypot(vx, vy) + 1e-6; vx *= SPD / sp; vy *= SPD / sp
            cnt = np.bincount(team, minlength=6)
            for tm in list(vivos):
                if cnt[tm] == 0:
                    vivos.remove(tm); elims.append((tm, t)); EV.append((t, 'elim', tm)); t_elim = t
                    n_ant = n_cur if km >= 1 else n_ant; n_cur = len(vivos) if len(vivos) > 2 else 2; t_morph = t; banner = (tm, t)
                    if len(vivos) == 2: EV.append((t + .8, 'final', 0))
            lider = int(cnt.argmax())
            if lider != lider_ant and t > T_GO + 1: EV.append((t, 'lider', lider)); lider_ant = lider
            if len(vivos) == 1: fim = t; EV.append((t, 'vitoria', vivos[0]))
        cnt = np.bincount(team, minlength=6)
        # ── desenho
        img = BG.copy()
        ths = np.linspace(0, 2 * math.pi, 241); rr = r_shape(ths, n_ant) * (1 - km) + r_shape(ths, n_cur) * km
        px, py = CX + rr * np.cos(ths + rot), CY + rr * np.sin(ths + rot)
        for q in range(240): segmento(img, px[q], py[q], px[q + 1], py[q + 1], 14, 1.0, 1.0)
        for i in range(N): blit(img, sprs[team[i]], x[i], y[i], 1.0)
        poe_texto(img, '6 CORES. SÓ 1 SOBREVIVE.', 54, 540, 290, (255, 255, 255), 1, '800', 10, pop_in(t, 0))
        # placar: 6 colunas (em ordem de quantidade); eliminadas ficam apagadas
        for k_, tm in enumerate(range(6)):
            bx0 = 96 + k_ * 150; col = tuple(int(v) for v in PAL[CORES[tm]]); viv = tm in vivos or fim is None and cnt[tm] > 0
            img[360:440, bx0:bx0 + 130] = img[360:440, bx0:bx0 + 130] * .35 + np.array([30, 34, 44], np.float32) * .65
            hb = int(80 * cnt[tm] / N * 2.2); hb = min(80, hb); img[440 - hb:440, bx0:bx0 + 130] = np.array(col, np.float32) * (1 if viv else .3)
            poe_texto(img, fmt(cnt[tm]) if viv else '0', 38, bx0 + 65, 400, (255, 255, 255) if viv else (150, 150, 150), 1, '800', 7)
            poe_texto(img, NOMES[tm], 19, bx0 + 65, 462, col if viv else (110, 110, 110), 1, '600', 4)
        lados = {6: 'HEXÁGONO', 5: 'PENTÁGONO', 4: 'QUADRADO', 3: 'TRIÂNGULO', 2: 'FINAL NO CÍRCULO'}[n_cur]
        if t >= T_GO and fim is None: poe_texto(img, f'Arena: {lados}', 34, 540, 1530, (200, 210, 230), 1, '600', 6)
        if t < T_GO:
            poe_texto(img, 'Escolha a sua cor!', 64, 540, 560, (255, 210, 63), 1, '800', 10)
            poe_texto(img, 'A arena perde um lado', 40, 540, 1480, (220, 225, 235), 1, '600', 6)
            poe_texto(img, 'a cada cor eliminada', 40, 540, 1535, (220, 225, 235), 1, '600', 6)
            poe_texto(img, f'{int(T_GO - t) + 1}', 180, 540, 980, (255, 255, 255), 1, '800', 14, pop_in((t % 1), 0))
        if banner and t - banner[1] < 2.0 and fim is None:
            tm, tb = banner; k = min(1, (t - tb) * 5) * min(1, (2.0 - (t - tb)) * 4); col = tuple(int(v) for v in PAL[CORES[tm]])
            poe_texto(img, f'{NOMES[tm]}', 110, 540, 900, col, k, '800', 14, pop_in(t, tb))
            poe_texto(img, 'ELIMINADO!', 92, 540, 1020, (255, 255, 255), k, '800', 12)
        if len(vivos) == 2 and fim is None and banner and 2.0 <= t - banner[1] < 4.2:
            a_, b_ = vivos; k = min(1, (t - banner[1] - 2.0) * 5)
            poe_texto(img, 'FINAL', 120, 540, 880, (255, 255, 255), k, '800', 14, pop_in(t, banner[1] + 2.0))
            poe_texto(img, f'{NOMES[a_]} × {NOMES[b_]}', 60, 540, 1000, (255, 210, 63), k, '800', 10)
        if fim is not None:
            k = min(1, (t - fim) * 3); v_ = vivos[0]; col = tuple(int(c) for c in PAL[CORES[v_]]); img *= 1 - .45 * k
            poe_texto(img, NOMES[v_], 130, 540, 880, col, k, '800', 14, 1 + .3 * (1 - k))
            poe_texto(img, 'SOBREVIVEU!', 96, 540, 1010, (255, 255, 255), k, '800', 12)
            poe_texto(img, 'Qual cor você escolheu?', 50, 540, 1460, (255, 255, 255), min(1, max(0, (t - fim - .8) * 3)), '800', 8)
            poe_texto(img, 'Comenta!', 76, 540, 1550, (255, 210, 63), min(1, max(0, (t - fim - 1.1) * 3)), '800', 10)
        out.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if f % 300 == 0: print(round(t, 1), 's · vivas:', len(vivos), cnt.tolist(), flush=True)
        f += 1
        if t > 110: break
    out.stdin.close(); out.wait()
    json.dump({'dur': f / FPS, 'go': T_GO, 'elims': elims, 'eventos': EV}, open(f'{ROOT}/out/eventos-guerra.json', 'w'))
    print('fim', round(f / FPS, 2), 's · eliminações:', [(NOMES[a], round(b, 1)) for a, b in elims])

if __name__ == '__main__':
    main()
