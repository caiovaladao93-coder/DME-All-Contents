"""SARAMAR · ep. 2 "A vila" (9:16, 1080×1920, 30 fps). 50 seguidores: a vila cresce planejada (ruas, lotes, uma cabana por morador,
com o nick do dono), praça, poço e horta; a garrafa do ep. 1 traz o mapa antigo com as metas verdadeiras (×100).
Usa o mundo do ep. 1 (mesma ilha, mesmas árvores) e os utilitários de scripts/video.py.
Uso: python3 scripts/ep2.py                → out/saramar-ep2-mudo.mp4 e out/eventos-ep2.json
     python3 scripts/ep2.py 0,8,20 <pasta> → quadros de teste"""
import json, math, os, subprocess, sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mundo as M
M.ARVORE = (262, 436)                    # no mapa verdadeiro a árvore fica um pouco mais ao norte (a vila ocupa o lugar antigo)
import video as V                       # constrói a ilha do ep. 1 (V.BASE) e traz texto, fonte, brilho, VIN...
from mundo import P, WW, WH
from video import ease, lerp, texto, CREME, OURO, CONTORNO, VERDE, W, H, FPS

ROOT = V.ROOT
CX, CY = M.CAMP
PAL = json.load(open(f'{ROOT}/voz/ep2/palavras.json'))
def Wd(i): return PAL[i]['a']
DUR = round(PAL[-1]['b'] + 2.2, 2)
NICKS = json.load(open(f'{ROOT}/dados/moradores-ep2.json'))['nicks']
N_MOR = 50

# ── chão sem árvores (o mesmo do ep. 1 antes das árvores) e a área da vila ─────────────────────────────
G, MORRO, AREIA = M.base()
cl = ((M.XX - CX) / 50) ** 2 + ((M.YY - (CY - 8)) / 30) ** 2 < 1
G[cl & M.TERRA & ~AREIA] = P['grama3']
M.lugares_base(G)
RY = [598 - 22 * k for k in range(6)]                   # topo das casas de cada rua (de baixo para cima)
COLS = [160, 178, 196, 214, 252, 270, 288, 306, 324]
AV = (233, 247)                                          # avenida central
VILA = np.zeros((WH, WW), bool)
for y in RY:
    VILA[y - 4:y + 20, COLS[0] - 6:COLS[-1] + 20] = True
VILA[RY[-1] - 8:640, 228:252] = True
VILA |= cl | ((M.XX >= 112) & (M.XX <= 150) & (M.YY >= 492) & (M.YY <= 586))      # + praça + horta
VILA = VILA | (ndimage.distance_transform_edt(~VILA) < 5 + 6 * M.ruido(3, 14, 33))     # borda irregular, sem parede reta
VILA_D = ndimage.binary_dilation(VILA, iterations=3)
BASE_A = V.BASE                                          # ilha como no fim do ep. 1
BASE_B = BASE_A.copy()
GV = G.copy(); GV[VILA_D & M.TERRA & ~AREIA] = P['grama3']
nz = M.ruido(2, 25, 91)
GV[VILA_D & M.TERRA & ~AREIA & (nz > .45)] = P['grama']
BASE_B[VILA_D] = GV[VILA_D]
# borda: algumas árvores do contorno ficam (corte limpo, mas sem parede reta)
DISSOLVE = np.random.default_rng(4).random((WH, WW))

# lotes (ordem: da praça para cima; esquerda → direita)
LOTES = [(x, y) for y in RY for x in COLS]
CASA_W, CASA_H = 14, 12
ROW_COR = [('telhado', 'telhado3', 'telhado2'), ('pedra2', 'pedra3', 'pedra4'), ('madeira2', 'madeira3', 'tronco2')]
R = np.random.default_rng(50)
CORES_MOR = [(['camisa1', 'camisa2', 'telhado3', 'grama2', 'madeira', 'vela', 'pedra2'][R.integers(0, 7)], ['cabelo1', 'cabelo2'][R.integers(0, 2)]) for _ in range(N_MOR)]
SPR_MOR = [M.morador(c, h) for c, h in CORES_MOR]

# ── tempos ───────────────────────────────────────────────────────────────────────────────────────
T_CHEGA = (Wd(15) - .2, Wd(21) - .1)        # "Agora, chegaram mais quarenta e oito."
T_LIMPA = (Wd(21), Wd(29) + .4)             # "E dessa vez, ninguém ia construir de qualquer jeito." → as árvores saem
T_RUAS = (Wd(30), Wd(38) - .2)              # "Primeiro, ... marcaram as ruas."
T_LOTES = (Wd(38), Wd(46) - .1)             # "Depois, dividiram os lotes. Um pra cada morador."
T_CASAS = (Wd(46) + .1, Wd(73) + .6)        # cabanas sobem (com os nicks)
T_PRACA, T_POCO, T_HORTA = Wd(62), Wd(66), Wd(68)
T_TUDO = (Wd(73), Wd(81) - .2)              # "Cinquenta moradores. Cinquenta cabanas. Nada fora do lugar."
T_GARRAFA = (Wd(81) - .15, Wd(94) - .2)     # "Mas lembra da garrafa..." / "Dentro dela, tinha um mapa."
T_MAPA = (Wd(94) - .2, Wd(137) - .2)        # mapa antigo
T_FIM = Wd(137) - .2
DT_CASA = (T_CASAS[1] - T_CASAS[0]) / N_MOR
T_CASA = [T_CASAS[0] + i * DT_CASA for i in range(N_MOR)]
LOTE_EXTRA = LOTES[N_MOR]                    # o próximo lote, vazio, com a placa "?"

# ── desenho da vila ──────────────────────────────────────────────────────────────────────────────
def casinha(img, x, y, row, s=1.0, janela=False):
    """casinha 14×12 (telhado 5 + parede 7); s<1 = subindo"""
    tc = [P[c] for c in ROW_COR[row % 3]]
    hp = 7; linhas = int(round(hp * min(1, s * 1.6)))
    for r in range(linhas):
        yy = y + CASA_H - 1 - r
        img[yy, x + 1:x + CASA_W - 1] = P['madeira'] if r % 2 == 0 else P['madeira2']
        img[yy, x] = P['madeira3']; img[yy, x + CASA_W - 1] = P['madeira3']
    if s >= .62:
        img[y + 8:y + 12, x + 6:x + 8] = P['tronco2']
        img[y + 7:y + 9, x + 10:x + 12] = P['luz'] if janela else P['madeira2'] * .7
        for r in range(5):
            m = 4 - r
            img[y + r, x - 1 + max(0, m - 3):x + CASA_W + 1 - max(0, m - 3)] = tc[0] if r % 2 else tc[1]
        img[y + 4, x - 1:x + CASA_W + 1] = tc[2]

def ruas(img, t, mostra_estacas=True):
    """estacas e cordas (planta) → ruas de terra; lotes marcados"""
    u = (t - T_RUAS[0]) / (T_RUAS[1] - T_RUAS[0])
    if u <= 0: return
    # avenida + ruas horizontais, desenhadas em sequência
    segs = [((240, 628), (240, RY[-1] - 4))] + [((COLS[0] - 4, y + 15), (COLS[-1] + 18, y + 15)) for y in RY]
    segs[1 + 0] = ((COLS[0] - 4, RY[0] + 15), (COLS[-1] + 18, RY[0] + 15))
    for k, ((ax, ay), (bx, by)) in enumerate(segs):
        v = min(1.0, max(0.0, u * len(segs) * .55 - k * .45))
        if v <= 0: continue
        n = int(max(abs(bx - ax), abs(by - ay)) * v)
        terra = t >= T_LOTES[0] + .3
        for j in range(0, n + 1):
            px = int(ax + (bx - ax) * j / max(1, abs(bx - ax) + abs(by - ay)) * (abs(bx - ax) + abs(by - ay)) / max(1, max(abs(bx - ax), abs(by - ay))) if False else ax + (bx - ax) * (j / max(1, max(abs(bx - ax), abs(by - ay)))))
            py = int(ay + (by - ay) * (j / max(1, max(abs(bx - ax), abs(by - ay)))))
            if terra:
                w = 3 if k == 0 else 2
                img[py - w:py + w + 1, px - w:px + w + 1] = P['areia2'] if (px + py) % 5 else P['areia3']
            elif j % 2 == 0:
                img[py, px] = P['branco'] * .9
            if not terra and j % 10 == 0: img[py - 2:py + 1, px] = P['madeira2']
    # lotes: contornos tracejados
    ul = (t - T_LOTES[0]) / (T_LOTES[1] - T_LOTES[0] - .6)
    if ul > 0:
        for i, (x, y) in enumerate(LOTES):
            if i / len(LOTES) > ul: break
            if t >= T_CASA[i] if i < N_MOR else False: continue
            for k in range(0, CASA_W + 2, 2): img[y - 1, x - 1 + k] = P['branco'] * .85; img[y + CASA_H, x - 1 + k] = P['branco'] * .85
            for k in range(0, CASA_H + 2, 2): img[y - 1 + k, x - 1] = P['branco'] * .85; img[y - 1 + k, x + CASA_W] = P['branco'] * .85

def praca(img, t, fim=False):
    """praça de terra em volta da fogueira, cabana antiga, poço e horta"""
    if t >= T_PRACA:
        k = min(1.0, (t - T_PRACA) / .5)
        m = (((M.XX - CX) / (34 * k + 1)) ** 2 + ((M.YY - (CY - 6)) / (18 * k + 1)) ** 2 < 1) & M.TERRA
        img[m & ((M.XX.astype(int) + M.YY.astype(int)) % 3 != 0)] = P['areia2']
    if t >= T_POCO:
        px, py = CX - 30, CY - 10
        img[py - 3:py + 4, px - 4:px + 5] = P['pedra']; img[py - 2:py + 3, px - 3:px + 4] = P['mar0']
        img[py - 3, px - 4:px + 5] = P['pedra3']; img[py - 7:py - 2, px - 4] = P['madeira2']; img[py - 7:py - 2, px + 4] = P['madeira2']
        img[py - 8, px - 5:px + 6] = P['telhado']
    if t >= T_HORTA:
        for k in range(3):
            hx, hy = 116, 498 + k * 30
            img[hy:hy + 24, hx:hx + 30] = P['tronco2'] * .9
            for r in range(hy + 2, hy + 23, 4):
                for c in range(hx + 2, hx + 29, 3):
                    g = min(1.0, (t - T_HORTA - k * .15) / .6)
                    if g > 0: img[r:r + 2, c] = P['grama3'] if (r + c) % 2 else P['palma']
    M.cabana(img, CX - 11, CY - 26, prog=2.0, t=t, janela=fim)
    M.pilha(img, CX + 16, CY - 12, 4)
    M.fogueira(img, CX, CY, t)

def moradores(img, t, n_vis, modo):
    """modo: 'fogo' (só os 2 antigos), 'chegada' (48 subindo da praia), 'vila' (cada um na sua rua)"""
    if modo == 'fogo':
        M.blit(img, M.MOR_A[0], CX - 10, CY - 5); M.blit(img, M.MOR_B[0], CX + 6, CY - 5); return
    if modo == 'chegada':
        M.blit(img, M.MOR_A[0], CX - 10, CY - 5); M.blit(img, M.MOR_B[0], CX + 6, CY - 5)
        u = (t - T_CHEGA[0]) / (T_CHEGA[1] - T_CHEGA[0] + 1.5)
        praia_y = M.costa_sul(CX) - 4
        for k in range(48):
            v = min(1.0, max(0.0, u * 1.6 - k / 48 * .9))
            sx = CX - 60 + (k % 12) * 10; sy = praia_y + 10
            ex = CX - 40 + (k % 10) * 8; ey = CY + 4 + (k // 10) * 5
            x, y = lerp(sx, ex, ease(v)), lerp(sy, ey, ease(v))
            if v > 0: M.blit(img, SPR_MOR[k + 2][int(t * 8 + k) % 4 if 0 < v < 1 else 0], x, y)
        return
    for i in range(N_MOR):
        if i >= n_vis: break
        x, y = LOTES[i]
        # cada um anda de leve pela frente da própria casa (na rua)
        d = 4 * math.sin(t * .9 + i * 1.7)
        M.blit(img, SPR_MOR[i][int(t * 6 + i) % 4 if abs(math.cos(t * .9 + i * 1.7)) > .3 else 0], x + 5 + d, y + 11)

def barcos(img, t):
    u = (t - T_CHEGA[0]) / 3.0
    praia_y = M.costa_sul(CX)
    for k, bx in enumerate((CX - 70, CX - 20, CX + 40)):
        by = praia_y + 6 + max(0, 30 * (1 - min(1, u + k * .1)))
        M.barco(img, bx, by, t, k)

# ── quadro do mundo ──────────────────────────────────────────────────────────────────────────────
def agua(img, t):
    on = np.sin(t * V.DSP * 1.6 + V.DPH) > .55
    for k in range(3): img[V.DY[on], V.DX[on] + k] = P['onda']
    esp = V.ESP & (M.DIST_MAR < 1.6 + 1.3 * np.sin(t * 1.3 + M.XX * .07 + M.YY * .05))
    img[esp] = P['espuma']

def mundo(t, estado):
    if t < T_LIMPA[0]: img = BASE_A.copy()
    elif t < T_LIMPA[1]:
        u = (t - T_LIMPA[0]) / (T_LIMPA[1] - T_LIMPA[0])
        img = np.where(((DISSOLVE < u) & VILA_D)[..., None], BASE_B, BASE_A)
    else: img = BASE_B.copy()
    agua(img, t)
    M.cachoeira(img, t); M.templo(img, t, .5); M.circulo(img, t, 0); M.arvore_gigante(img, t, .3); M.tesouro(img, t)
    M.navio(img, t, .6); M.farol(img, M.ILHEU[0], M.ILHEU[1] + 6, aceso=0.0, alto=20)
    if estado == 'mapa':
        sombra_tinta(img)
    ruas(img, t)
    praca(img, t, fim=t >= T_FIM)
    nv = sum(1 for tc in T_CASA if t >= tc)
    for i in range(min(N_MOR, nv)):
        x, y = LOTES[i]; s = min(1.0, (t - T_CASA[i]) / .25)
        casinha(img, x, y, i // 8, s, janela=t >= T_FIM)
    if t >= T_FIM or estado == 'mapa':
        x, y = LOTE_EXTRA
        for k in range(0, CASA_W + 2, 2): img[y - 1, x - 1 + k] = P['branco'] * .85; img[y + CASA_H, x - 1 + k] = P['branco'] * .85
        for k in range(0, CASA_H + 2, 2): img[y - 1 + k, x - 1] = P['branco'] * .85; img[y - 1 + k, x + CASA_W] = P['branco'] * .85
        M.placa(img, x + 3, y + 10, t)
    if T_GARRAFA[0] <= t < T_GARRAFA[1]:
        moradores(img, t, nv, 'vila')
        gx, gy = V.PRAIA[0] + 12, V.PRAIA[1] + 12
        u = (t - T_GARRAFA[0] - .3) / 1.3
        ax, ay = lerp(CX - 10, gx - 5, ease(u)), lerp(CY - 5, gy - 6, ease(u))
        M.blit(img, M.MOR_A[int(t * 8) % 4 if 0 < u < 1 else 0], ax, ay); M.blit(img, M.MOR_B[0], CX + 6, CY - 5)
        if u < 1.15: M.blit(img, M.GARRAFA, gx, gy + math.sin(t * 2.4))
        else:
            lev = min(1.0, (u - 1.15) * 3)
            M.blit(img, M.GARRAFA, ax + 1, ay - 2 - 3 * lev)
            if t >= Wd(89) - .1:   # rolha sai e o papel aparece
                img[int(ay - 8 - 3 * lev):int(ay - 5 - 3 * lev), int(ax + 3)] = P['vela']
        return img
    if t < T_CHEGA[0]: moradores(img, t, 0, 'fogo')
    elif t < T_CASAS[0]: moradores(img, t, 0, 'chegada'); barcos(img, t)
    else:
        moradores(img, t, nv, 'vila')
        M.blit(img, M.MOR_A[0], CX - 10, CY - 5); M.blit(img, M.MOR_B[0], CX + 6, CY - 5)
    if t < T_GARRAFA[0]: M.blit(img, M.GARRAFA, V.PRAIA[0] + 12, V.PRAIA[1] + 12 + math.sin(t * 2.4))
    return img

ONDAS_M = [(x, y) for y in range(20, WH - 20, 26) for x in range(10 + (y // 26 % 2) * 20, WW - 20, 40)]
def sombra_tinta(img):
    """no mapa antigo: ondinhas de tinta no mar e a criatura desenhada como corcovas"""
    for x, y in ONDAS_M:
        if M.DIST_MAR[y, x] > 14:
            for k in range(6): img[y + (1 if k in (2, 3) else 0), x + k] = P['mar0'] * .5
    x0, y0 = M.SOMBRA
    for k in range(4):
        cx = x0 - 30 + k * 15; rr = 7 - abs(k - 1.5)
        for a in np.linspace(math.pi, 2 * math.pi, 30):
            for e in (0, 1):
                img[int(y0 + (rr + e) * math.sin(a)), int(cx + (rr + 1 + e) * math.cos(a))] = (20, 20, 20)
    img[y0 - 4, x0 + 31:x0 + 33] = (20, 20, 20)

# ── luz ──────────────────────────────────────────────────────────────────────────────────────────
GLOW_F = V.GLOW_F
def iluminar(img, t):
    if t >= T_FIM:
        amb, gf = (.9, .74, .66), .9 * min(1, (t - T_FIM) / .8)
        amb = tuple(lerp(1, a, min(1, (t - T_FIM) / .8)) for a in amb)
    else: amb, gf = (1, 1, 1), 0.0
    org = img.copy(); emis = np.zeros((WH, WW), bool)
    for c in ('luz', 'fogo1', 'fogo2', 'fogo3', 'runa'): emis |= np.abs(img - P[c]).sum(-1) < 30
    img = img * np.array(amb, np.float32)
    lum = GLOW_F * gf
    img = img * (1 + lum[..., None] * .45 * V.QUENTE) + lum[..., None] * 22 * V.QUENTE
    img[emis] = org[emis] * 1.08
    return img

# ── câmera ───────────────────────────────────────────────────────────────────────────────────────
VY_M = (RY[0] + RY[-1]) / 2 + 20
def camera(t):
    k = [(0, 240, 455, 3.15), (Wd(5) - .3, 240, 455, 3.3), (Wd(8), CX, CY - 12, 9.5), (Wd(15) - .2, CX, CY - 8, 10.0),
         (T_CHEGA[0] + .8, CX - 4, CY + 4, 6.5), (T_LIMPA[0], CX, CY - 30, 5.5), (T_LIMPA[1], 240, VY_M, 4.2),
         (T_RUAS[1], 240, VY_M, 4.2), (T_LOTES[1], 240, VY_M + 4, 4.4)]
    # cabanas: a câmera sobe rua por rua (zoom 6.2) e depois se afasta para mostrar praça, poço e horta
    for r in range(7):
        k.append((T_CASA[min(N_MOR - 1, r * 8)] + .05, 240, RY[r] + 8, 6.2))
        if r * 8 >= 30: break
    k += [(T_PRACA, 230, VY_M + 40, 4.0), (T_HORTA + .6, 222, VY_M + 20, 3.7), (T_TUDO[0], 232, VY_M + 10, 3.6), (T_TUDO[1], 236, VY_M + 10, 3.3)]
    k = [x for x in k if x[0] < T_TUDO[1] + .01]
    k.sort(key=lambda a: a[0])
    if t >= T_GARRAFA[0] and t < T_GARRAFA[1]:
        u = ease((t - T_GARRAFA[0]) / 1.4)
        return lerp(CX + 2, V.PRAIA[0] + 8, u), lerp(CY + 4, V.PRAIA[1] + 4, u), lerp(11, 14, u)
    if t >= T_MAPA[0] and t < T_MAPA[1]: return camera_mapa(t)
    if t >= T_FIM:
        x, y = LOTE_EXTRA; u = ease((t - T_FIM) / 3.0)
        return lerp(240, x + 7, u), lerp(VY_M + 10, y + 10, u), lerp(3.4, 9.0, u)
    for a, b in zip(k, k[1:]):
        if a[0] <= t < b[0]:
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return k[-1][1:] if t >= k[-1][0] else k[0][1:]

MAPA_CAM0 = (255, 470, 2.65)
def camera_mapa(t):
    ks = [(T_MAPA[0], *MAPA_CAM0), (Wd(117) - .3, *MAPA_CAM0), (Wd(117) + .5, M.CACHOEIRA[0], M.CACHOEIRA[1] + 10, 5.0), (Wd(121) - .3, M.CACHOEIRA[0], M.CACHOEIRA[1] + 10, 5.2),
          (Wd(121) + .5, M.ROSTO[0], M.ROSTO[1] + 6, 5.0), (Wd(127) - .3, M.ROSTO[0], M.ROSTO[1] + 6, 5.2), (Wd(127) + .6, M.SOMBRA[0] - 10, M.SOMBRA[1] - 10, 4.4),
          (Wd(135) + .3, M.SOMBRA[0] - 10, M.SOMBRA[1] - 10, 4.6), (T_MAPA[1], *MAPA_CAM0)]
    for a, b in zip(ks, ks[1:]):
        if a[0] <= t < b[0]:
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return MAPA_CAM0

# ── mapa antigo (sépia) ──────────────────────────────────────────────────────────────────────────
PAPEL = np.array([226, 204, 160], np.float32); TINTA = np.array([82, 52, 30], np.float32)
PAPEL_RUIDO = (np.random.default_rng(9).random((H, W)) * 14 - 7).astype(np.float32)[..., None]
PY_, PX_ = np.mgrid[0:H, 0:W]
BORDA = np.clip(np.minimum.reduce([PX_, W - PX_, PY_, H - PY_]) / 90, 0, 1).astype(np.float32)[..., None]
def sepia(fr):
    lum = (fr[..., 0] * .3 + fr[..., 1] * .55 + fr[..., 2] * .15)[..., None] / 255
    lum = np.floor(lum * 5) / 5                                     # gravura em 5 tons
    out = TINTA + (PAPEL - TINTA) * np.clip(.25 + lum * 1.35, 0, 1) + PAPEL_RUIDO
    return out * (.72 + .28 * BORDA)

METAS = [('1.000', M.CACHOEIRA), ('2.500', M.TESOURO), ('5.000', M.LAGOA), ('10.000', M.PEDRAS), ('25.000', M.ARVORE),
         ('50.000', M.NAVIO), ('100.000', M.ROSTO), ('???', (M.SOMBRA[0] + 14, M.SOMBRA[1] - 26))]
TINTA_T = (82, 52, 30); VERMELHO = (150, 36, 28)
T_PINO = [Wd(105) + .1 + k * .42 for k in range(len(METAS))]

def pinos_mapa(d, t, cam):
    cx, cy, z = cam
    def tela(x, y): return (x - cx) * z + W / 2, (y - cy) * z + H / 2
    # vila (50 ✓)
    sx, sy = tela(240, VY_M)
    a = min(1, (t - T_MAPA[0] - .6) / .3)
    if a > 0:
        d.ellipse((sx - 26, sy - 26, sx + 26, sy + 26), outline=(40, 110, 40, int(255 * a)), width=6)
        texto(d, sx, sy - 58, [('50 OK', (60, 140, 60))], 44, a)
    for k, (rot, (x, y)) in enumerate(METAS):
        u = t - T_PINO[k]
        if u < 0: continue
        s = min(1.0, u / .18); sx, sy = tela(x, y); r = int(22 * s)
        foco = (k == 0 and Wd(117) <= t < Wd(121)) or (k == 6 and Wd(121) <= t < Wd(127)) or (k == 7 and t >= Wd(127))
        cor = VERMELHO if foco else TINTA_T
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(226, 204, 160, 230), outline=cor + (255,), width=5)
        if s > .6:
            d.rectangle((sx - 8, sy - 2, sx + 8, sy + 10), fill=cor + (255,))
            d.rectangle((sx - 5, sy - 10, sx + 5, sy - 2), outline=cor + (255,), width=4)
            texto(d, sx, sy - 54, [(rot, OURO if foco else CREME)], 52 if foco else 40, min(1, (u - .1) / .15) if u > .1 else 0)

def mapa_quadro(t):
    cam = camera_mapa(t)
    img = mundo(t, 'mapa'); img = iluminar(img, 0)
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = sepia(img[ys][:, xs])
    # desenrolar: o papel abre do centro para cima e para baixo
    u = ease((t - T_MAPA[0]) / .7); meia = int(H / 2 * u)
    out = np.zeros_like(fr) + np.array([20, 16, 12], np.float32)
    out[H // 2 - meia:H // 2 + meia] = fr[H // 2 - meia:H // 2 + meia]
    if meia < H // 2:
        for yy in (H // 2 - meia, H // 2 + meia - 1):
            out[max(0, yy - 14):yy + 14] = np.array([180, 150, 105], np.float32)
    im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA'); cam_ = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(cam_)
    if u > .9:
        texto(d, 540, 210, [('SARAMAR', TINTA_T)], 76, min(1, (u - .9) * 10))
        texto(d, 540, 290, [('O MAPA VERDADEIRO', VERMELHO)], 40, min(1, (u - .9) * 10))
        pinos_mapa(d, t, cam)
    return Image.alpha_composite(im, cam_)

# ── legendas e sobreposições ─────────────────────────────────────────────────────────────────────
def pedacos():
    ch, cur = [], []
    for i, p in enumerate(PAL):
        cur.append(p); prox = PAL[i + 1] if i + 1 < len(PAL) else None
        if p['w'][-1] in '.,?…' or prox is None or prox['a'] - p['b'] > .28 or len(cur) >= 3 or sum(len(q['w']) for q in cur) >= 14:
            ch.append(cur); cur = []
    out = []
    for i, c in enumerate(ch):
        a = c[0]['a']; b = ch[i + 1][0]['a'] if i + 1 < len(ch) else DUR
        b = min(b, c[-1]['b'] + .9); ws = [q['w'].strip('.,?…').upper() for q in c]
        out.append((a - .05, b, ws, max(range(len(ws)), key=lambda j: len(ws[j]))))
    return out
LEG = pedacos()

def nick_de(i): return NICKS[i] if i < len(NICKS) else None

def sobrepor(base, t, cam, mapa=False):
    camada = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(camada)
    cx, cy, z = cam
    if not mapa:
        a = min(1, t / .3) * (1 - ease((t - Wd(5) + .2) / .4))
        if a > 0:
            texto(d, 540, 300, [('ESSA PÁGINA TEM', CREME)], 58, a); texto(d, 540, 430, [('50', OURO)], 190, a); texto(d, 540, 560, [('SEGUIDORES', CREME)], 58, a)
        # contador de cabanas
        if T_CASAS[0] - .2 <= t < T_TUDO[1] + .3:
            n = sum(1 for tc in T_CASA if t >= tc)
            al = min(1, (t - T_CASAS[0] + .2) / .3) * min(1, (T_TUDO[1] + .3 - t) / .3)
            texto(d, 540, 290, [('CABANAS', CREME), (f'{n}/50', OURO)], 56, al)
        # nick de cada morador quando a cabana fica pronta (3 alturas alternadas para não encavalar)
        if T_CASAS[0] <= t < T_TUDO[0] + 1.0:
            for i, tc in enumerate(T_CASA):
                u = t - tc
                if not (0 <= u < .95): continue
                x, y = LOTES[i]; sx = (x + 7 - cx) * z + W / 2; sy = (y - cy) * z + H / 2 - 30 - (i % 3) * 46
                nk = nick_de(i); al = min(1, u / .08) * min(1, (.95 - u) / .2)
                rot, cor, sz = (f'@{nk}', CREME, 34) if nk else ('+1', OURO, 40)
                f = V.fonte(sz); larg = f.getlength(rot)
                sx = min(max(sx, 70 + larg / 2), W - 70 - larg / 2)
                texto(d, sx, sy - u * 18, [(rot, cor)], sz, al)
        if t >= T_FIM + 1.2:
            x, y = LOTE_EXTRA; sx = (x + 7 - cx) * z + W / 2; sy = (y - cy) * z + H / 2 - 70
            texto(d, sx, sy, [('@SEU_NOME_AQUI?', OURO)], 46, min(1, (t - T_FIM - 1.2) / .4))
    for a0, b0, ws, ch in LEG:
        if a0 <= t < b0:
            al = min(1, (t - a0) / .08) * min(1, (b0 - t) / .08)
            texto(d, 540, 1500 if not mapa else 1640, [(w, OURO if j == ch else CREME) for j, w in enumerate(ws)], 64, al)
    return Image.alpha_composite(base, camada).convert('RGB')

def quadro(t):
    if T_MAPA[0] <= t < T_MAPA[1]:
        im = mapa_quadro(t); return sobrepor(im, t, camera_mapa(t), mapa=True)
    cam = camera(t)
    img = iluminar(mundo(t, None), t)
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = img[ys][:, xs] * V.VIN
    for tc in (T_GARRAFA[0], T_FIM):                 # piscada nos cortes
        if tc <= t < tc + .1: fr = fr * .55 + 255 * .45 * (1 - (t - tc) / .1)
    if t > DUR - .6: fr *= max(0, (DUR - t) / .6) * .3 + .7
    # garrafa: a rolha sai e o papel aparece (close)
    im = Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).convert('RGBA')
    return sobrepor(im, t, cam)

def main():
    if len(sys.argv) > 1:
        pasta = sys.argv[2] if len(sys.argv) > 2 else f'{ROOT}/out/testes'; os.makedirs(pasta, exist_ok=True)
        for s in sys.argv[1].split(','):
            quadro(float(s)).save(f'{pasta}/e2_{float(s):05.1f}.png'); print('quadro', s, flush=True)
        return
    n = int(DUR * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/saramar-ep2-mudo.mp4'], stdin=subprocess.PIPE)
    for f in range(n):
        ff.stdin.write(np.asarray(quadro(f / FPS)).tobytes())
        if f % 150 == 0: print(round(f / FPS, 1), 's', flush=True)
    ff.stdin.close(); ff.wait()
    json.dump({'dur': DUR, 'fim_voz': PAL[-1]['b'], 'casas': T_CASA, 'chegada': T_CHEGA, 'limpa': T_LIMPA, 'ruas': T_RUAS, 'lotes': T_LOTES,
               'praca': T_PRACA, 'poco': T_POCO, 'horta': T_HORTA, 'tudo': T_TUDO, 'garrafa': T_GARRAFA, 'mapa': T_MAPA, 'pinos': T_PINO, 'fim': T_FIM,
               'focos': [Wd(117), Wd(121), Wd(127)], 'legendas': [(a, b, ' '.join(ws)) for a, b, ws, _ in LEG]},
              open(f'{ROOT}/out/eventos-ep2.json', 'w'), ensure_ascii=False, indent=1)
    print('fim', n, 'quadros')

if __name__ == '__main__':
    main()
