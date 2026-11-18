"""Vídeo de "física satisfatória" (9:16, 1080×1920, 30 fps), três mecânicas originais em sequência:
  1/3 "CADA BATIDA = +1 BOLA"  · anel girando com uma abertura; cada batida no anel cria uma bola nova; elas fogem pela abertura; no fim o anel estoura.
  2/3 "SERÁ QUE ELA ESCAPA?"   · 10 anéis concêntricos girando, cada um com uma brecha; quando a bola passa, o anel se despedaça.
  3/3 "QUAL COR VENCE?"        · guerra de cores num hexágono girando; em cada colisão a bola mais rápida converte a outra.
Física própria (numba), desenho próprio (numba + PIL só para o texto), quadros enviados direto ao ffmpeg.
Os eventos (batidas, quebras, conversões) vão para out/eventos.json, que scripts/som.py usa para a trilha e os efeitos.
Uso: python3 scripts/gerar.py [--teste 0,5,12,...]  (sem --teste gera out/video-mudo.mp4)"""
import json, math, subprocess, sys
import numpy as np
from numba import njit
from PIL import Image, ImageDraw, ImageFont

ROOT = __file__.rsplit('/scripts/', 1)[0]
W, H, FPS, SUB = 1080, 1920, 30, 8
CX, CY = 540.0, 980.0
R = np.random.default_rng(2026)
PAL = np.array([[255, 77, 90], [255, 159, 28], [255, 210, 63], [61, 220, 132], [46, 196, 241], [58, 107, 255], [155, 93, 229], [255, 93, 162]], np.float32)
EV = []  # (t, tipo, valor)

# ── sprites de bola (esfera com luz) e fundo
def sprite(rgb, r):
    s = int(math.ceil(r)) * 2 + 4; c = s / 2; y, x = np.mgrid[0:s, 0:s] + .5
    d = np.hypot(x - c, y - c); a = np.clip(r - d + .5, 0, 1)
    lx, ly = (x - c + r * .35) / r, (y - c + r * .4) / r; hl = np.clip(1 - np.hypot(lx, ly) * 1.6, 0, 1) ** 2
    sh = np.clip(1 - (d / r) ** 2, 0, 1) ** .35
    col = np.array(rgb, np.float32)[None, None] * (.55 + .45 * sh)[..., None] + 255 * .55 * hl[..., None]
    out = np.zeros((s, s, 4), np.float32); out[..., :3] = np.clip(col, 0, 255); out[..., 3] = a; return out
def fundo():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    g = np.clip(1 - np.hypot((x - CX) / 900, (y - 900) / 1100), 0, 1)
    img = np.zeros((H, W, 3), np.float32); base = np.array([9, 11, 16], np.float32); top = np.array([24, 30, 44], np.float32)
    img[:] = base + (top - base) * g[..., None] ** 1.5; return img
BG = fundo()

@njit(cache=True)
def blit(img, spr, x, y, alpha):
    h, w = spr.shape[0], spr.shape[1]; x0 = int(x - w / 2); y0 = int(y - h / 2)
    for j in range(h):
        yy = y0 + j
        if yy < 0 or yy >= img.shape[0]: continue
        for i in range(w):
            xx = x0 + i
            if xx < 0 or xx >= img.shape[1]: continue
            a = spr[j, i, 3] * alpha
            if a <= 0: continue
            for c in range(3): img[yy, xx, c] = img[yy, xx, c] * (1 - a) + spr[j, i, c] * a

@njit(cache=True)
def wrap(a):
    while a > math.pi: a -= 2 * math.pi
    while a < -math.pi: a += 2 * math.pi
    return a

@njit(cache=True)
def anel(img, cx, cy, rr, th, gap_c, gap_h, br, alpha):
    # anel metálico com uma brecha (gap_h = meia abertura em rad; <0 = sem brecha)
    x0, x1 = int(max(0, cx - rr - th)), int(min(img.shape[1] - 1, cx + rr + th)); y0, y1 = int(max(0, cy - rr - th)), int(min(img.shape[0] - 1, cy + rr + th))
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            dx, dy = xx + .5 - cx, yy + .5 - cy; d = math.sqrt(dx * dx + dy * dy)
            sd = abs(d - rr) - th / 2
            if sd > 1: continue
            cov = min(1.0, max(0.0, .5 - sd))
            ang = math.atan2(dy, dx)
            if gap_h > 0:
                da = abs(wrap(ang - gap_c)) - gap_h
                if da < 0: continue
                cov *= min(1.0, da * rr)
            if cov <= 0: continue
            lum = .62 + .38 * (-math.sin(ang) * .5 + .5) + .25 * (1 - min(1.0, abs(d - rr) / (th / 2 + .01)))
            v = 255 * min(1.0, lum * br); a = cov * alpha
            for c in range(3):
                tint = v * (0.92 if c == 0 else 0.96 if c == 1 else 1.0)
                img[yy, xx, c] = img[yy, xx, c] * (1 - a) + tint * a

@njit(cache=True)
def segmento(img, ax, ay, bx, by, th, alpha, br):
    x0, x1 = int(max(0, min(ax, bx) - th)), int(min(img.shape[1] - 1, max(ax, bx) + th)); y0, y1 = int(max(0, min(ay, by) - th)), int(min(img.shape[0] - 1, max(ay, by) + th))
    ex, ey = bx - ax, by - ay; L2 = ex * ex + ey * ey + 1e-9
    for yy in range(y0, y1 + 1):
        for xx in range(x0, x1 + 1):
            px, py = xx + .5 - ax, yy + .5 - ay; u = min(1.0, max(0.0, (px * ex + py * ey) / L2))
            qx, qy = px - ex * u, py - ey * u; sd = math.sqrt(qx * qx + qy * qy) - th / 2
            if sd > 1: continue
            a = min(1.0, max(0.0, .5 - sd)) * alpha; v = 255 * br * (.8 + .2 * (1 - abs(u - .5) * 2))
            for c in range(3): img[yy, xx, c] = img[yy, xx, c] * (1 - a) + v * (0.93 if c == 0 else 0.97 if c == 1 else 1.0) * a

# ── colisões bola × bola (grade uniforme), massas iguais, elásticas; devolve pares que colidiram
@njit(cache=True)
def colisoes(x, y, vx, vy, viva, n, rb, cell, conv_a, conv_b):
    nx, ny = int(W / cell) + 2, int(H / cell) + 2; head = -np.ones(nx * ny, np.int64); nxt = -np.ones(n, np.int64)
    for i in range(n):
        if viva[i] != 1: continue
        cxi, cyi = int(x[i] / cell), int(y[i] / cell)
        if cxi < 0 or cyi < 0 or cxi >= nx or cyi >= ny: continue
        k = cyi * nx + cxi; nxt[i] = head[k]; head[k] = i
    nc = 0; d0 = 2 * rb
    for i in range(n):
        if viva[i] != 1: continue
        cxi, cyi = int(x[i] / cell), int(y[i] / cell)
        for oy in range(-1, 2):
            for ox in range(-1, 2):
                gx, gy = cxi + ox, cyi + oy
                if gx < 0 or gy < 0 or gx >= nx or gy >= ny: continue
                j = head[gy * nx + gx]
                while j >= 0:
                    if j > i:
                        dx, dy = x[j] - x[i], y[j] - y[i]; dd = dx * dx + dy * dy
                        if dd < d0 * d0 and dd > 1e-6:
                            d = math.sqrt(dd); ux, uy = dx / d, dy / d; ov = (d0 - d) / 2
                            x[i] -= ux * ov; y[i] -= uy * ov; x[j] += ux * ov; y[j] += uy * ov
                            rv = (vx[j] - vx[i]) * ux + (vy[j] - vy[i]) * uy
                            if rv < 0:
                                vx[i] += rv * ux; vy[i] += rv * uy; vx[j] -= rv * ux; vy[j] -= rv * uy
                                if nc < conv_a.shape[0]: conv_a[nc] = i; conv_b[nc] = j; nc += 1
                    j = nxt[j]
    return nc

# ── texto (PIL → RGBA), com contorno escuro
FONTS = {}
def fonte(sz, w='800'):
    k = (sz, w)
    if k not in FONTS: FONTS[k] = ImageFont.truetype(f'{ROOT}/fonts/sora-{w}.ttf', sz)
    return FONTS[k]
TXT = {}
def texto(s, sz, rgb=(255, 255, 255), w='800', stroke=10):
    k = (s, sz, rgb, w, stroke)
    if k not in TXT:
        f = fonte(sz, w); bb = f.getbbox(s, stroke_width=stroke); im = Image.new('RGBA', (bb[2] - bb[0] + 8, bb[3] - bb[1] + 8))
        ImageDraw.Draw(im).text((4 - bb[0], 4 - bb[1]), s, font=f, fill=rgb + (255,), stroke_width=stroke, stroke_fill=(8, 10, 14, 255))
        a = np.asarray(im).astype(np.float32); a[..., 3] /= 255; TXT[k] = a
    return TXT[k]
def poe_texto(img, s, sz, cx, cy, rgb=(255, 255, 255), alpha=1.0, w='800', stroke=10, escala=1.0):
    t = texto(s, int(sz * escala), rgb, w, stroke); blit(img, t, cx, cy, alpha)
def fmt(n): return f'{int(n):,}'.replace(',', '.')
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def pop_in(t, t0, d=.25):
    k = min(1, max(0, (t - t0) / d)); return 1 + .35 * math.sin(k * math.pi) * (1 - k) if k < 1 else 1.0

# ═══ CENA 1 · CADA BATIDA = +1 BOLA ═════════════════════════════════════════
def cena1(T0, DUR):
    NMAX, RB, RR, TH, GAPH, OM, G = 1300, 12.0, 420.0, 16.0, .2, .55, 1500.0
    x = np.zeros(NMAX); y = np.zeros(NMAX); vx = np.zeros(NMAX); vy = np.zeros(NMAX); viva = np.zeros(NMAX, np.int64); cor = np.zeros(NMAX, np.int64)
    x[0], y[0], vx[0], vy[0], viva[0] = CX, CY - 150, 380, -200, 1; n = 1; fug = 0
    sprs = [sprite(c, RB) for c in PAL]; ca = np.zeros(4096, np.int64); cb = np.zeros(4096, np.int64)
    T_BURST = DUR - 2.4; frags = []
    for f in range(int(DUR * FPS)):
        t = f / FPS; gap = OM * t - math.pi / 2 + 1.2
        for _ in range(SUB):
            dt = 1 / FPS / SUB; act = viva == 1
            vy[viva > 0] += G * dt; x[viva > 0] += vx[viva > 0] * dt; y[viva > 0] += vy[viva > 0] * dt
            if t < T_BURST:
                dx, dy = x - CX, y - CY; d = np.hypot(dx, dy)
                hit = act & (d > RR - TH / 2 - RB)
                for i in np.nonzero(hit)[0]:
                    ang = math.atan2(dy[i], dx[i]); dg = abs((ang - gap + math.pi) % (2 * math.pi) - math.pi)
                    if dg < GAPH - RB / RR:
                        if d[i] > RR + TH: viva[i] = 2; fug += 1
                        continue
                    ux, uy = dx[i] / d[i], dy[i] / d[i]; vn = vx[i] * ux + vy[i] * uy
                    if vn > 0:
                        vx[i] -= 2 * vn * ux; vy[i] -= 2 * vn * uy
                        sp = math.hypot(vx[i], vy[i])
                        if sp < 900: vx[i] *= 900 / sp; vy[i] *= 900 / sp
                        if n < min(NMAX, 2 ** (t / 1.6) + 1):
                            a = R.uniform(-.6, .6); c, s = math.cos(a), math.sin(a)
                            x[n], y[n] = x[i] - ux * 3, y[i] - uy * 3; vx[n], vy[n] = (vx[i] * c - vy[i] * s) * .95, (vx[i] * s + vy[i] * c) * .95
                            viva[n] = 1; cor[n] = (cor[i] + 1) % len(PAL); n += 1
                        EV.append((T0 + t, 'bate1', int(cor[i])))
                    x[i], y[i] = CX + ux * (RR - TH / 2 - RB), CY + uy * (RR - TH / 2 - RB)
                colisoes(x, y, vx, vy, viva, n, RB, 2 * RB + 1, ca, cb)
            viva[(viva == 2) & (y > H + 60)] = 3
        if T_BURST <= t < T_BURST + 1 / FPS:  # estouro: todas para fora, anel em pedaços
            for i in np.nonzero(viva == 1)[0]:
                dx, dy = x[i] - CX, y[i] - CY; d = math.hypot(dx, dy) + 1e-6; sp = R.uniform(900, 2200)
                vx[i], vy[i] = dx / d * sp + R.uniform(-200, 200), dy / d * sp - 600; viva[i] = 2
            for k in range(36):
                a0 = k / 36 * 2 * math.pi; frags.append([CX + RR * math.cos(a0), CY + RR * math.sin(a0), math.cos(a0) * R.uniform(500, 1100), math.sin(a0) * R.uniform(500, 1100) - 500, a0])
            EV.append((T0 + t, 'estouro', 0))
        for fr in frags: fr[3] += G * .6 / FPS; fr[0] += fr[2] / FPS; fr[1] += fr[3] / FPS
        img = BG.copy()
        if t < T_BURST: anel(img, CX, CY, RR, TH, gap, GAPH, 1.0, 1.0)
        for fr in frags: segmento(img, fr[0] - 22 * math.sin(fr[4]), fr[1] + 22 * math.cos(fr[4]), fr[0] + 22 * math.sin(fr[4]), fr[1] - 22 * math.cos(fr[4]), 14, max(0, 1 - (t - T_BURST) / 1.6), 1.0)
        for i in np.nonzero((viva == 1) | (viva == 2))[0]: blit(img, sprs[cor[i]], x[i], y[i], 1.0)
        vivas = int((viva == 1).sum()) if t < T_BURST else n
        poe_texto(img, '1/3', 30, 120, 270, (150, 160, 180), 1, '600', 6)
        poe_texto(img, 'CADA BATIDA = +1 BOLA', 58, 540, 330)
        poe_texto(img, f'{fmt(n)} bola{"s" if n > 1 else ""}', 104, 540, 455, (255, 210, 63), 1, '800', 12, pop_in(t, 0))
        poe_texto(img, f'fugiram: {fmt(fug)}', 46, 540, 1500, (200, 210, 230), 1 if t > 2 else 0, '600', 8)
        if t >= T_BURST: poe_texto(img, 'LOTOU!', 150, 540, 960, (255, 77, 90), min(1, (t - T_BURST) * 4), '800', 14, 1 + .3 * max(0, 1 - (t - T_BURST) * 3))
        yield img, {'bolas': n, 'vivas': vivas}

# ═══ CENA 2 · SERÁ QUE ELA ESCAPA? (10 anéis) ═══════════════════════════════
def cena2(T0, DUR_MAX):
    K, RB, G = 10, 15.0, 1100.0
    rr = np.array([105 + k * 36 for k in range(K)], float); TH = 9.0
    om = np.array([(.7 + .13 * k) * (1 if k % 2 == 0 else -1) for k in range(K)]); a0 = R.uniform(0, 2 * math.pi, K)
    bx, by, bvx, bvy = CX, CY - 20, 520.0, -380.0; k = 0; t_ring = 0.0; frags = []; trail = []; spr = sprite(PAL[2], RB); livre = None
    f = 0
    while True:
        t = f / FPS
        if livre is not None and t > livre + 2.2: break
        if t > DUR_MAX: break
        for _ in range(SUB):
            dt = 1 / FPS / SUB; bvy += G * dt; bx += bvx * dt; by += bvy * dt
            if k < K:
                dx, dy = bx - CX, by - CY; d = math.hypot(dx, dy) + 1e-9
                gh = .3 + .6 * max(0, (t - t_ring - 1.0)) / 1.5  # a brecha alarga se a bola demorar
                gap = a0[k] + om[k] * t
                if d > rr[k] - TH / 2 - RB:
                    ang = math.atan2(dy, dx); dg = abs((ang - gap + math.pi) % (2 * math.pi) - math.pi)
                    if dg < gh - RB / rr[k]:
                        if d > rr[k] + TH + RB:  # passou: o anel quebra
                            for q in range(40):
                                aq = gap + math.pi * 2 * q / 40; sp = R.uniform(200, 700)
                                frags.append([CX + rr[k] * math.cos(aq), CY + rr[k] * math.sin(aq), math.cos(aq) * sp, math.sin(aq) * sp - 300, aq, t, rr[k]])
                            EV.append((T0 + t, 'quebra', k)); k += 1; t_ring = t
                            sp = math.hypot(bvx, bvy) * 1.04; ang2 = math.atan2(bvy, bvx); bvx, bvy = math.cos(ang2) * sp, math.sin(ang2) * sp
                            if k == K: livre = t; EV.append((T0 + t, 'livre', 0))
                    else:
                        ux, uy = dx / d, dy / d; vn = bvx * ux + bvy * uy
                        if vn > 0:
                            bvx -= 2 * vn * ux; bvy -= 2 * vn * uy; aj = R.uniform(-.35, .35); bvx, bvy = bvx * math.cos(aj) - bvy * math.sin(aj), bvx * math.sin(aj) + bvy * math.cos(aj); sp = math.hypot(bvx, bvy)
                            if sp < 950: bvx *= 950 / sp; bvy *= 950 / sp
                            EV.append((T0 + t, 'bate2', k))
                        bx, by = CX + ux * (rr[k] - TH / 2 - RB), CY + uy * (rr[k] - TH / 2 - RB)
            elif by > H + 200: bvy = -abs(bvy) * .2
        trail.append((bx, by)); trail = trail[-14:]
        for fr in frags: fr[3] += G * .7 / FPS; fr[0] += fr[2] / FPS; fr[1] += fr[3] / FPS
        img = BG.copy()
        for j in range(k, K):
            gh = .3 + .6 * max(0, (t - t_ring - 1.0)) / 1.5 if j == k else .3
            anel(img, CX, CY, rr[j], TH, a0[j] + om[j] * t, gh, .75 + .25 * (j == k), 1.0)
        for fr in frags:
            age = t - fr[5]
            if age < 1.6: segmento(img, fr[0] - 8 * math.sin(fr[4]), fr[1] + 8 * math.cos(fr[4]), fr[0] + 8 * math.sin(fr[4]), fr[1] - 8 * math.cos(fr[4]), 8, max(0, 1 - age / 1.6), .9)
        for q, (tx, ty) in enumerate(trail[:-1]): blit(img, spr, tx, ty, .06 + .3 * q / len(trail))
        blit(img, spr, bx, by, 1.0)
        poe_texto(img, '2/3', 30, 120, 270, (150, 160, 180), 1, '600', 6)
        poe_texto(img, 'SERÁ QUE ELA ESCAPA?', 58, 540, 330)
        if livre is None: poe_texto(img, f'{K - k} ' + ('anel' if K - k == 1 else 'anéis'), 104, 540, 455, (46, 196, 241), 1, '800', 12, pop_in(t, t_ring) if k else 1)
        else: poe_texto(img, 'LIVRE!', 150, 540, 455, (61, 220, 132), 1, '800', 14, pop_in(t, livre, .35))
        yield img, {}
        f += 1

# ═══ CENA 3 · QUAL COR VENCE? ═══════════════════════════════════════════════
def cena3(T0, DUR_MAX):
    TEAMS = [0, 5, 3, 2]; NOMES = ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO']; PER = 95; N = PER * 4; RB, RH, OM, SPD = 15.0, 440.0, .35, 520.0
    x = np.zeros(N); y = np.zeros(N); vx = np.zeros(N); vy = np.zeros(N); viva = np.ones(N, np.int64); team = np.zeros(N, np.int64)
    for tm in range(4):
        ac = math.pi / 4 + tm * math.pi / 2; cx0, cy0 = CX + 210 * math.cos(ac), CY + 210 * math.sin(ac)
        for q in range(PER):
            i = tm * PER + q; rq, aq = 95 * math.sqrt(R.random()), R.uniform(0, 2 * math.pi)
            x[i], y[i] = cx0 + rq * math.cos(aq), cy0 + rq * math.sin(aq); a = R.uniform(0, 2 * math.pi); vx[i], vy[i] = math.cos(a) * SPD, math.sin(a) * SPD; team[i] = tm
    sprs = [sprite(PAL[c], RB) for c in TEAMS]; ca = np.zeros(8192, np.int64); cb = np.zeros(8192, np.int64)
    fim = None; venc = None; f = 0; T_GO = 3.0; ultimo_lider = -1
    while True:
        t = f / FPS
        if fim is not None and t > fim + 3.6: break
        rot = OM * t; verts = [(CX + RH * math.cos(rot + q * math.pi / 3), CY + RH * math.sin(rot + q * math.pi / 3)) for q in range(6)]
        if t >= T_GO and fim is None:
            for _ in range(SUB):
                dt = 1 / FPS / SUB; x += vx * dt; y += vy * dt
                for q in range(6):  # paredes do hexágono (normal para dentro)
                    ax, ay = verts[q]; bx_, by_ = verts[(q + 1) % 6]; ex, ey = bx_ - ax, by_ - ay; L = math.hypot(ex, ey); nx_, ny_ = -ey / L, ex / L
                    if (CX - ax) * nx_ + (CY - ay) * ny_ < 0: nx_, ny_ = -nx_, -ny_
                    dist = (x - ax) * nx_ + (y - ay) * ny_; m = dist < RB
                    if m.any():
                        vn = vx[m] * nx_ + vy[m] * ny_; neg = vn < 0
                        vx[m] -= np.where(neg, 2 * vn * nx_, 0); vy[m] -= np.where(neg, 2 * vn * ny_, 0)
                        x[m] += (RB - dist[m]) * nx_; y[m] += (RB - dist[m]) * ny_
                sp0 = np.hypot(vx, vy)
                nc = colisoes(x, y, vx, vy, viva, N, RB, 2 * RB + 1, ca, cb)
                for q in range(nc):
                    i, j = ca[q], cb[q]
                    if team[i] != team[j] and R.random() < .22:  # nem toda batida converte: a disputa dura mais
                        if sp0[i] >= sp0[j]: team[j] = team[i]; EV.append((T0 + t, 'conv', int(team[i])))
                        else: team[i] = team[j]; EV.append((T0 + t, 'conv', int(team[j])))
                sp = np.hypot(vx, vy) + 1e-6; vx *= SPD / sp; vy *= SPD / sp
            cnt = np.bincount(team, minlength=4)
            lider = int(cnt.argmax())
            if lider != ultimo_lider and t > T_GO + .5: EV.append((T0 + t, 'lider', lider)); ultimo_lider = lider
            if cnt.max() >= N - 2 or t > DUR_MAX: fim = t; venc = lider; EV.append((T0 + t, 'vitoria', lider))
        cnt = np.bincount(team, minlength=4)
        img = BG.copy()
        for q in range(6): segmento(img, *verts[q], *verts[(q + 1) % 6], 16, 1.0, 1.0)
        for i in range(N): blit(img, sprs[team[i]], x[i], y[i], 1.0)
        poe_texto(img, '3/3', 30, 120, 270, (150, 160, 180), 1, '600', 6)
        poe_texto(img, 'ESCOLHA UMA COR!' if t < T_GO else 'QUAL COR VENCE?', 58, 540, 330, (255, 255, 255), 1, '800', 10, pop_in(t, 0) if t < T_GO else pop_in(t, T_GO))
        for tm in range(4):  # placar: quatro barras
            bx0 = 120 + tm * 220; frac = cnt[tm] / N; col = tuple(int(v) for v in PAL[TEAMS[tm]])
            img[420:500, bx0:bx0 + 190] = img[420:500, bx0:bx0 + 190] * .4 + np.array([30, 34, 44], np.float32) * .6
            hb = int(80 * frac); img[500 - hb:500, bx0:bx0 + 190] = np.array(col, np.float32)
            poe_texto(img, fmt(cnt[tm]), 40, bx0 + 95, 460, (255, 255, 255), 1, '800', 7)
            poe_texto(img, NOMES[tm], 22, bx0 + 95, 525, col, 1, '600', 4)
        if t < T_GO: poe_texto(img, f'{int(T_GO - t) + 1}', 160, 540, 980, (255, 255, 255), 1, '800', 14, pop_in(t % 1, 0))
        if fim is not None:
            k = min(1, (t - fim) * 3); col = tuple(int(v) for v in PAL[TEAMS[venc]])
            img *= 1 - .45 * k
            poe_texto(img, f'{NOMES[venc]}', 130, 540, 900, col, k, '800', 14, 1 + .3 * (1 - k))
            poe_texto(img, 'VENCEU!', 110, 540, 1040, (255, 255, 255), k, '800', 12)
            poe_texto(img, 'Qual cor você escolheu?', 50, 540, 1460, (255, 255, 255), min(1, max(0, (t - fim - .8) * 3)), '800', 8)
            poe_texto(img, 'Comenta!', 76, 540, 1550, (255, 210, 63), min(1, max(0, (t - fim - 1.1) * 3)), '800', 10)
        yield img, {'cnt': cnt.tolist()}
        f += 1

def main():
    teste = None
    if '--teste' in sys.argv: teste = set(round(float(v) * FPS) for v in sys.argv[sys.argv.index('--teste') + 1].split(','))
    out = None
    if teste is None:
        out = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/video-mudo.mp4'], stdin=subprocess.PIPE)
    gf = 0; marcos = {}
    def roda(gen, nome):
        nonlocal gf
        marcos[nome] = gf / FPS; prev = None
        for k, (img, info) in enumerate(gen):
            # transição: 6 quadros de fusão com o fim da cena anterior
            if k < 6 and LAST[0] is not None: img = img * (k / 6) + LAST[0] * (1 - k / 6)
            fr = np.clip(img, 0, 255).astype(np.uint8)
            if out: out.stdin.write(fr.tobytes())
            if teste is not None and gf in teste: Image.fromarray(fr).save(f'{ROOT}/out/testes/f{gf:05d}.png')
            prev = img; gf += 1
            if gf % 150 == 0: print(nome, round(gf / FPS, 1), 's', flush=True)
        LAST[0] = prev
    LAST = [None]
    roda(cena1(0.0, 22.5), 'cena1')
    roda(cena2(gf / FPS, 26.0), 'cena2')
    roda(cena3(gf / FPS, 21.0), 'cena3')
    if out: out.stdin.close(); out.wait()
    json.dump({'dur': gf / FPS, 'marcos': marcos, 'eventos': EV}, open(f'{ROOT}/out/eventos.json', 'w'))
    print('fim', round(gf / FPS, 2), 's', marcos, len(EV), 'eventos')

if __name__ == '__main__':
    main()
