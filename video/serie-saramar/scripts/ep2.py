"""SARAMAR · ep. 2 "A vila" v2 (9:16, 1080×1920, 30 fps). 50 seguidores. A vila é COMPACTA (cabanas 11×9, coladas, ruas
estreitas) para caber todo mundo que ainda vai chegar. Animação: os 48 novos chegam de barco, cortam as árvores (machado,
árvore tomba, toras vão para as pilhas), os dois mais antigos fincam as estacas das ruas, cada um espera no seu lote e constrói
a sua cabana (martelo, paredes subindo) e o @nick aparece quando a cabana fica pronta; poço cavado à pá e horta plantada.
A garrafa do ep. 1 traz o mapa verdadeiro (metas ×100). Usa a mesma ilha do ep. 1 (scripts/video.py).
Uso: python3 scripts/ep2.py                → out/saramar-ep2-mudo.mp4 e out/eventos-ep2.json
     python3 scripts/ep2.py 0,8,20 <pasta> → quadros de teste"""
import json, math, os, subprocess, sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mundo as M
import video as V                       # constrói a ilha do ep. 1 (V.BASE) e traz texto, fonte, brilho, VIN...
from mundo import P, WW, WH
from video import ease, lerp, texto, CREME, OURO, W, H, FPS

ROOT = V.ROOT
CX, CY = M.CAMP
PAL = json.load(open(f'{ROOT}/voz/ep2/palavras.json'))
def Wd(i): return PAL[i]['a']
DUR = round(PAL[-1]['b'] + 2.2, 2)
NICKS = json.load(open(f'{ROOT}/dados/moradores-ep2.json'))['nicks']
N_MOR = 50

# ── vila compacta ────────────────────────────────────────────────────────────────────────────────
CW, CH = 11, 9                                           # casinha: telhado 4 + parede 5
RY = [612 - 13 * k for k in range(6)]                    # 5 ruas ocupadas + 1 rua livre (para quem ainda vai chegar)
COLS = [176 + 12 * c for c in range(5)] + [246 + 12 * c for c in range(5)]
AV = 240                                                 # avenida central
LOTES = [(x, y) for y in RY for x in COLS]               # 60 lotes: 50 ocupados + 10 livres
LIVRES = LOTES[N_MOR:]
POCO = (264, 646)
HORTA = [(200, 628), (213, 628)]
PILHAS = [(186, 636), (292, 636)]

G, MORRO, AREIA = M.base()
cl = ((M.XX - CX) / 50) ** 2 + ((M.YY - (CY - 8)) / 30) ** 2 < 1
G[cl & M.TERRA & ~AREIA] = P['grama3']
M.lugares_base(G)
CLEAR = np.zeros((WH, WW), bool)
CLEAR[RY[-1] - 5:634, COLS[0] - 6:COLS[-1] + CW + 7] = True
CLEAR = CLEAR | (ndimage.distance_transform_edt(~CLEAR) < 2 + 4 * M.ruido(3, 14, 33))
CLEAR &= M.TERRA
GV = G.copy(); nz = M.ruido(2, 25, 91)
GV[CLEAR & ~AREIA] = P['grama3']; GV[CLEAR & ~AREIA & (nz > .45)] = P['grama']
BASE_W = V.BASE.copy()
BASE_W[CLEAR | cl] = GV[CLEAR | cl]                        # dentro da área, as árvores são objetos (podem cair)

# árvores da área (cada uma é cortada por um morador)
R = np.random.default_rng(50)
ARVS = []
for y in range(RY[-1] - 8, 630, 9):
    for x in range(COLS[0] - 4, COLS[-1] + CW + 2, 10):
        xx, yy = x + R.integers(-2, 3), y + R.integers(-2, 3)
        px, py = min(WW - 1, xx + 5), min(WH - 1, yy + 9)
        if CLEAR[py, px] and not cl[py, px] and not AREIA[py, px]:
            ARVS.append([xx, yy, [M.ARV, M.PINHO][R.integers(0, 2)]])
ARVS.sort(key=lambda a: -a[1])                            # de baixo (perto da praça) para cima
def rot(s, k):
    if k == 90: return np.rot90(s, -1).copy()
    im = Image.fromarray((s * [1, 1, 1, 255]).astype(np.uint8), 'RGBA').rotate(-45, resample=Image.NEAREST, expand=True)
    a = np.asarray(im).astype(np.float32); a[..., 3] /= 255; return a
ROT = {id(s): (rot(s, 45), rot(s, 90)) for s in (M.ARV, M.PINHO)}

CORES = [(['camisa1', 'camisa2', 'telhado3', 'grama2', 'madeira', 'vela', 'pedra2'][R.integers(0, 7)], ['cabelo1', 'cabelo2'][R.integers(0, 2)]) for _ in range(N_MOR)]
SPR = [M.MOR_A, M.MOR_B] + [M.morador(c, h) for c, h in CORES[2:]]

# ── tempos (palavras da narração) ────────────────────────────────────────────────────────────────
T_CHEGA = (Wd(15) - .2, Wd(21) - .1)
T_JUNTA = (Wd(21), Wd(30))                    # "E dessa vez..." → todos na beira da mata, com machado
T_CORTE = (Wd(30), Wd(44) - .1)               # "Primeiro, abriram espaço... madeira pra uma casa."
T_RUAS = (Wd(44), Wd(52))                     # estacas
T_LOTES = (Wd(52), Wd(69))                    # lotes pequenos, um do lado do outro
T_CASAS = (Wd(69) + .9, Wd(103) - .2)         # cada um constrói a sua (pronta = nick)
T_PRACA, T_POCO, T_HORTA = Wd(88), Wd(92), Wd(97)
T_TUDO = (Wd(103), Wd(112) - .2)
T_SOBRA = Wd(107)
T_GARRAFA = (Wd(112) - .15, Wd(125) - .2)
T_MAPA = (Wd(125) - .2, Wd(168) - .2)
T_FIM = Wd(168) - .2
DT_CASA = (T_CASAS[1] - T_CASAS[0]) / N_MOR
T_PRONTA = [T_CASAS[0] + (i + 1) * DT_CASA for i in range(N_MOR)]
T_OBRA = 1.6                                  # cada cabana leva 1,6 s para subir

# corte: cada morador (2..49) derruba até 3 árvores; queda escalonada de baixo para cima
NA = min(len(ARVS), 48 * 3)
ARVS = ARVS[:NA]
QUEDA = [T_CORTE[0] + .9 + (i // 48) * (T_CORTE[1] - T_CORTE[0] - 1.6) / 3 + (i % 48) / 48 * .7 for i in range(NA)]
DONO = [2 + i % 48 for i in range(NA)]

# ── desenho ──────────────────────────────────────────────────────────────────────────────────────
ROW_COR = [('telhado', 'telhado3', 'telhado2'), ('pedra2', 'pedra3', 'pedra4'), ('madeira2', 'madeira3', 'tronco2')]
def casinha(img, x, y, row, s=1.0, janela=False):
    tc = [P[c] for c in ROW_COR[row % 3]]
    linhas = int(round(5 * min(1.0, s * 1.5)))
    for r in range(linhas):
        yy = y + CH - 1 - r
        img[yy, x + 1:x + CW - 1] = P['madeira'] if r % 2 == 0 else P['madeira2']
        img[yy, x] = P['madeira3']; img[yy, x + CW - 1] = P['madeira3']
    if s < .66 and linhas > 0:                       # andaime
        img[y + CH - linhas - 1:y + CH, x - 1] = P['tronco2']; img[y + CH - linhas - 1:y + CH, x + CW] = P['tronco2']
    if s >= .66:
        img[y + 6:y + 9, x + 4:x + 6] = P['tronco2']
        img[y + 5:y + 7, x + 7:x + 9] = P['luz'] if janela else P['madeira2'] * .7
        for r in range(4):
            m = 3 - r
            img[y + r, x - 1 + max(0, m - 2):x + CW + 1 - max(0, m - 2)] = tc[0] if r % 2 else tc[1]
        img[y + 3, x - 1:x + CW + 1] = tc[2]

def tracejado(img, x, y, cor=None):
    c = P['branco'] * .85 if cor is None else cor
    for k in range(0, CW + 2, 2): img[y - 1, x - 1 + k] = c; img[y + CH, x - 1 + k] = c
    for k in range(0, CH + 2, 2): img[y - 1 + k, x - 1] = c; img[y - 1 + k, x + CW] = c

def ferramenta(img, x, y, t, tipo, fase):
    """machado/martelo/pá na mão direita do morador (x,y = canto do sprite)"""
    hx, hy = int(x + 5), int(y + 5)
    up = math.sin(fase) > 0
    if tipo == 'machado':
        if up: img[hy - 4:hy, hx + 1] = P['madeira3']; img[hy - 5:hy - 3, hx + 2] = P['pedra3']
        else: img[hy, hx + 1:hx + 4] = P['madeira3']; img[hy - 1:hy + 1, hx + 4] = P['pedra3']
    elif tipo == 'martelo':
        if up: img[hy - 3:hy, hx] = P['madeira3']; img[hy - 4, hx - 1:hx + 2] = P['pedra2']
        else: img[hy, hx:hx + 3] = P['madeira3']; img[hy - 1:hy + 1, hx + 3] = P['pedra2']
    elif tipo == 'pa':
        d = 0 if up else 1
        img[hy - 2:hy + 3, hx + 1] = P['madeira3']; img[hy + 3 - d:hy + 5 - d, hx:hx + 3] = P['pedra3']

def arvores(img, t):
    for i, (x, y, s) in enumerate(ARVS):
        tf = QUEDA[i]
        if t < tf - .8:
            M.blit(img, s, x, y)
        elif t < tf:
            M.blit(img, s, x + (1 if int(t * 14) % 2 else 0), y)       # treme com as machadadas
            for c in range(3):                                         # lascas
                ph = (t * 3 + c / 3) % 1; img[int(y + 9 - ph * 4), int(x + 3 - c - ph * 3)] = P['madeira3']
        elif t < tf + .25:
            M.blit(img, ROT[id(s)][0], x + 1, y + 2)
        elif t < tf + .7:
            M.blit(img, ROT[id(s)][1], x + 2, y + 6)
        if tf <= t < T_RUAS[0]:
            img[y + 9:y + 11, x + 4:x + 6] = P['tronco2']               # toco
        if tf + .7 <= t < tf + .9:
            M.blit(img, M.TORA, x + 1, y + 7)

def pilhas(img, t):
    n = sum(1 for tf in QUEDA if t >= tf + 1.9)
    n -= int(max(0, min(1, (t - T_CASAS[0]) / (T_CASAS[1] - T_CASAS[0]))) * n)   # a madeira vai sendo usada nas cabanas
    for k, (px, py) in enumerate(PILHAS):
        m = n // 2 + (k < n % 2)
        for j in range(min(m, 24)):
            M.blit(img, M.TORA, px + (j % 3) * 2 - 3, py - (j // 3) * 2)

def ruas(img, t):
    u = (t - T_RUAS[0]) / (T_RUAS[1] - T_RUAS[0])
    if u <= 0: return
    terra = t >= T_LOTES[0] + .4
    segs = [((AV, 632), (AV, RY[-1] - 3))] + [((COLS[0] - 3, y + CH + 1), (COLS[-1] + CW + 2, y + CH + 1)) for y in RY]
    for k, ((ax, ay), (bx, by)) in enumerate(segs):
        v = min(1.0, max(0.0, u * len(segs) * .6 - k * .5))
        if v <= 0: continue
        L = max(abs(bx - ax), abs(by - ay)); n = int(L * v)
        for j in range(n + 1):
            px, py = int(ax + (bx - ax) * j / L), int(ay + (by - ay) * j / L)
            if terra:
                w = 2 if k == 0 else 1
                img[py - w + (k > 0):py + w + 1, px - w:px + w + 1] = P['areia2'] if (px + py) % 5 else P['areia3']
            else:
                if j % 2 == 0: img[py, px] = P['branco'] * .9
                if j % 8 == 0: img[py - 2:py + 1, px] = P['madeira2']
    ul = (t - T_LOTES[0]) / (T_LOTES[1] - T_LOTES[0] - 1.0)
    if ul > 0:
        for i, (x, y) in enumerate(LOTES):
            if i / len(LOTES) > ul: break
            if i < N_MOR and t >= T_PRONTA[i] - T_OBRA: continue
            tracejado(img, x, y)

def praca(img, t, fim=False):
    if t >= T_PRACA:
        k = min(1.0, (t - T_PRACA) / .5)
        m = (((M.XX - CX) / (32 * k + 1)) ** 2 + ((M.YY - (CY - 6)) / (16 * k + 1)) ** 2 < 1) & M.TERRA
        img[m & ((M.XX.astype(int) + M.YY.astype(int)) % 3 != 0)] = P['areia2']
    px, py = POCO
    if t >= T_POCO - .6:
        g = min(1.0, (t - T_POCO + .6) / 1.4)
        img[py - 3:py + 4, px - 4:px + 5] = P['tronco2'] * (1 - g) + P['pedra'] * g
        if g >= 1:
            img[py - 2:py + 3, px - 3:px + 4] = P['mar0']; img[py - 3, px - 4:px + 5] = P['pedra3']
            img[py - 7:py - 2, px - 4] = P['madeira2']; img[py - 7:py - 2, px + 4] = P['madeira2']; img[py - 8, px - 5:px + 6] = P['telhado']
    for k, (hx, hy) in enumerate(HORTA):
        if t >= T_HORTA - .4:
            img[hy:hy + 14, hx:hx + 11] = P['tronco2'] * .9
            g = min(1.0, (t - T_HORTA - k * .3) / .8)
            for r in range(hy + 2, hy + 13, 3):
                for c in range(hx + 1, hx + 10, 2):
                    if g > (r - hy) / 14: img[r:r + 2, c] = P['grama3'] if (r + c) % 2 else P['palma']
    M.cabana(img, CX - 11, CY - 26, prog=2.0, t=t, janela=fim)
    M.pilha(img, CX + 16, CY - 12, 4)
    M.fogueira(img, CX, CY, t)

# ── moradores: onde cada um está a cada instante ─────────────────────────────────────────────────
PRAIA_Y = M.costa_sul(CX) - 4
def frente_lote(i): x, y = LOTES[i]; return x + 3, y + CH + 1
def espera_mata(k): return COLS[0] + (k % 24) * 5.6, 628 + (k // 24) * 4
def chegada_fim(k): return CX - 40 + ((k - 2) % 10) * 8, CY + 4 + ((k - 2) // 10) * 5
POS_ANTIGO = [(CX - 10, CY - 5), (CX + 6, CY - 5)]

def pos_morador(k, t):
    """(x, y, andando, ferramenta, fase)"""
    if k < 2 and t < T_RUAS[0] - .6: return (*POS_ANTIGO[k], False, None, 0)
    if k < 2 and t < T_RUAS[1]:     # fincam estacas: A sobe a avenida, B percorre as ruas
        u = (t - T_RUAS[0] + .6) / (T_RUAS[1] - T_RUAS[0] + .6)
        if k == 0: return AV - 3, lerp(632, RY[-1], u) - 8, True, 'martelo', t * 12
        r = min(5, int(u * 6)); v = (u * 6) % 1
        return lerp(COLS[0], COLS[-1] + CW, v if r % 2 == 0 else 1 - v), RY[r] + CH - 7, True, 'martelo', t * 12
    if k >= 2 and t < T_JUNTA[0] + .2:
        u = (t - T_CHEGA[0]) / (T_CHEGA[1] - T_CHEGA[0] + 1.5); v = min(1.0, max(0.0, u * 1.6 - (k - 2) / 48 * .9))
        sx, sy = CX - 60 + ((k - 2) % 12) * 10, PRAIA_Y + 10; ex, ey = chegada_fim(k)
        return lerp(sx, ex, ease(v)), lerp(sy, ey, ease(v)), 0 < v < 1, None, 0
    if k >= 2 and t < T_CORTE[0] + .1:
        a = chegada_fim(k); b = espera_mata(k - 2)
        u = ease((t - T_JUNTA[0] - .2) / 2.0); return lerp(a[0], b[0], u), lerp(a[1], b[1], u), 0 < u < 1, 'machado' if u >= 1 else None, 0
    if k >= 2 and t < T_LOTES[0]:
        prev = espera_mata(k - 2)
        for i in [i for i in range(NA) if DONO[i] == k]:
            tf = QUEDA[i]; x, y = ARVS[i][0], ARVS[i][1]; arv = (x - 5, y + 3)
            if t < tf - .8:
                u = ease((t - (tf - 1.6)) / .8) if t > tf - 1.6 else 0
                return lerp(prev[0], arv[0], u), lerp(prev[1], arv[1], u), 0 < u < 1, 'machado', 0
            if t < tf: return arv[0], arv[1], False, 'machado', t * 18
            pil = PILHAS[0] if x < AV else PILHAS[1]
            if t < tf + .9: return arv[0], arv[1], False, None, 0
            if t < tf + 1.9:
                u = ease(t - tf - .9); return lerp(arv[0], pil[0], u), lerp(arv[1], pil[1] - 8, u), True, 'tora', 0
            prev = (pil[0], pil[1] - 8)
        return prev[0], prev[1], False, None, 0
    # cada um vai para o seu lote, espera e constrói
    fx, fy = frente_lote(k)
    tp = T_PRONTA[k]; ini = tp - T_OBRA
    if t < T_LOTES[1]:
        if k < 2: pr = POS_ANTIGO[k]
        else:
            pr = PILHAS[0] if LOTES[k][0] < AV else PILHAS[1]; pr = (pr[0], pr[1] - 8)
        u = ease((t - T_LOTES[0] - (k % 10) * .08) / 2.2); return lerp(pr[0], fx, u), lerp(pr[1], fy - 2, u), 0 < u < 1, None, 0
    if t < ini: return fx, fy - 2, False, 'martelo', 0
    if t < tp: return LOTES[k][0] + CW + 1, LOTES[k][1] + 1, False, 'martelo', t * 16
    if k < 2 and T_POCO - .9 <= t < T_POCO + .9:      # os mais antigos cavam o poço
        return POCO[0] - 9 + k * 12, POCO[1] - 6, False, 'pa', t * 10
    if k in (2, 3) and T_HORTA - .5 <= t < T_HORTA + 1.2:
        hx, hy = HORTA[k - 2]; return hx + 3, hy + 2 + ((t * 6) % 8), False, None, 0
    bal = 1.5 * math.sin(t * .9 + k * 1.7)
    return fx + bal, fy - 2, abs(math.cos(t * .9 + k * 1.7)) > .4, None, 0

def moradores(img, t):
    vis = []
    for k in range(N_MOR):
        if k >= 2 and t < T_CHEGA[0]: continue
        x, y, anda, fer, fase = pos_morador(k, t)
        vis.append((y, k, x, anda, fer, fase))
    for y, k, x, anda, fer, fase in sorted(vis, key=lambda v: (v[0], v[1])):
        M.blit(img, SPR[k][int(t * 8 + k) % 4 if anda else 0], x, y)
        if fer == 'tora': M.blit(img, M.TORA, x - 1, y - 3)
        elif fer: ferramenta(img, x, y, t, fer, fase)

def barcos(img, t):
    u = (t - T_CHEGA[0]) / 3.0; praia_y = M.costa_sul(CX)
    for k, bx in enumerate((CX - 70, CX - 20, CX + 40)):
        M.barco(img, bx, praia_y + 6 + max(0, 30 * (1 - min(1, u + k * .1))), t, k)

# ── quadro do mundo ──────────────────────────────────────────────────────────────────────────────
def agua(img, t):
    on = np.sin(t * V.DSP * 1.6 + V.DPH) > .55
    for k in range(3): img[V.DY[on], V.DX[on] + k] = P['onda']
    esp = V.ESP & (M.DIST_MAR < 1.6 + 1.3 * np.sin(t * 1.3 + M.XX * .07 + M.YY * .05))
    img[esp] = P['espuma']

ONDAS_M = [(x, y) for y in range(20, WH - 20, 26) for x in range(10 + (y // 26 % 2) * 20, WW - 20, 40)]
def sombra_tinta(img):
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

def mundo(t, estado=None):
    img = BASE_W.copy()
    agua(img, t)
    M.cachoeira(img, t); M.templo(img, t, .5); M.circulo(img, t, 0); M.arvore_gigante(img, t, .3); M.tesouro(img, t)
    M.navio(img, t, .6); M.farol(img, M.ILHEU[0], M.ILHEU[1] + 6, aceso=0.0, alto=20)
    if estado == 'mapa': sombra_tinta(img)
    ruas(img, t)
    praca(img, t, fim=t >= T_FIM)
    pilhas(img, t)
    for i in range(N_MOR):
        if t >= T_PRONTA[i] - T_OBRA:
            casinha(img, *LOTES[i], i // 10, min(1.0, (t - T_PRONTA[i] + T_OBRA) / T_OBRA), janela=t >= T_FIM)
    if t >= T_TUDO[0] or estado == 'mapa':
        for x, y in LIVRES: tracejado(img, x, y)
        M.placa(img, LIVRES[0][0] + 2, LIVRES[0][1] + 8, t)
    arvores(img, t)
    if T_GARRAFA[0] <= t < T_GARRAFA[1]:
        moradores(img, t)
        gx, gy = V.PRAIA[0] + 12, V.PRAIA[1] + 12
        u = (t - T_GARRAFA[0] - .3) / 1.3
        ax, ay = lerp(CX - 10, gx - 5, ease(u)), lerp(CY - 5, gy - 6, ease(u))
        M.blit(img, M.MOR_A[int(t * 8) % 4 if 0 < u < 1 else 0], ax, ay)
        if u < 1.15: M.blit(img, M.GARRAFA, gx, gy + math.sin(t * 2.4))
        else:
            lev = min(1.0, (u - 1.15) * 3); M.blit(img, M.GARRAFA, ax + 1, ay - 2 - 3 * lev)
            if t >= Wd(120) - .1: img[int(ay - 8 - 3 * lev):int(ay - 5 - 3 * lev), int(ax + 3)] = P['vela']
        return img
    moradores(img, t)
    if T_CHEGA[0] <= t < T_JUNTA[1]: barcos(img, t)
    if t < T_GARRAFA[0]: M.blit(img, M.GARRAFA, V.PRAIA[0] + 12, V.PRAIA[1] + 12 + math.sin(t * 2.4))
    return img

def iluminar(img, t):
    if t >= T_FIM:
        k = min(1, (t - T_FIM) / .8); amb = tuple(lerp(1, a, k) for a in (.9, .74, .66)); gf = .9 * k
    else: amb, gf = (1, 1, 1), 0.0
    org = img.copy(); emis = np.zeros((WH, WW), bool)
    for c in ('luz', 'fogo1', 'fogo2', 'fogo3', 'runa'): emis |= np.abs(img - P[c]).sum(-1) < 30
    img = img * np.array(amb, np.float32)
    lum = V.GLOW_F * gf
    img = img * (1 + lum[..., None] * .45 * V.QUENTE) + lum[..., None] * 22 * V.QUENTE
    img[emis] = org[emis] * 1.08
    return img

# ── câmera ───────────────────────────────────────────────────────────────────────────────────────
VCX, VCY = 241, 596                           # centro da vila
CAM_K = [(0, 240, 455, 3.15), (Wd(5) - .3, 240, 455, 3.3), (Wd(8), CX, CY - 12, 9.5), (Wd(15) - .2, CX, CY - 8, 10.0),
         (T_CHEGA[0] + .8, CX - 4, CY + 4, 6.5), (T_JUNTA[0] + .3, CX - 2, CY - 4, 6.5), (T_JUNTA[1], VCX, VCY + 10, 7.0),
         (T_CORTE[1], VCX, VCY + 6, 7.3), (T_RUAS[1], VCX, VCY + 4, 7.3), (T_LOTES[1] - 1.5, VCX, VCY + 6, 7.2),
         (T_CASAS[0] + 2, VCX, VCY + 12, 7.1), (T_PRACA, VCX, VCY + 20, 7.0), (T_TUDO[0], VCX, VCY + 16, 7.0),
         (T_SOBRA - .1, VCX, VCY + 10, 6.4), (T_SOBRA + 1.6, 250, 470, 2.75), (T_GARRAFA[0], 250, 470, 2.7)]
def camera(t):
    if T_GARRAFA[0] <= t < T_GARRAFA[1]:
        u = ease((t - T_GARRAFA[0]) / 1.4)
        return lerp(CX + 2, V.PRAIA[0] + 8, u), lerp(CY + 4, V.PRAIA[1] + 4, u), lerp(11, 14, u)
    if T_MAPA[0] <= t < T_MAPA[1]: return camera_mapa(t)
    if t >= T_FIM:
        x, y = LIVRES[0]; u = ease((t - T_FIM) / 3.0)
        return lerp(VCX, x + 20, u), lerp(VCY + 10, y + 12, u), lerp(5.0, 9.5, u)
    for a, b in zip(CAM_K, CAM_K[1:]):
        if a[0] <= t < b[0]:
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return CAM_K[-1][1:]

MAPA_CAM0 = (255, 470, 2.65)
def camera_mapa(t):
    ks = [(T_MAPA[0], *MAPA_CAM0), (Wd(148) - .3, *MAPA_CAM0), (Wd(148) + .5, M.CACHOEIRA[0], M.CACHOEIRA[1] + 10, 5.0), (Wd(152) - .3, M.CACHOEIRA[0], M.CACHOEIRA[1] + 10, 5.2),
          (Wd(152) + .5, M.ROSTO[0], M.ROSTO[1] + 6, 5.0), (Wd(158) - .3, M.ROSTO[0], M.ROSTO[1] + 6, 5.2), (Wd(158) + .6, M.SOMBRA[0] - 10, M.SOMBRA[1] - 10, 4.4),
          (Wd(166) + .3, M.SOMBRA[0] - 10, M.SOMBRA[1] - 10, 4.6), (T_MAPA[1], *MAPA_CAM0)]
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
    lum = np.floor(lum * 5) / 5
    out = TINTA + (PAPEL - TINTA) * np.clip(.25 + lum * 1.35, 0, 1) + PAPEL_RUIDO
    return out * (.72 + .28 * BORDA)

METAS = [('1.000', M.CACHOEIRA), ('2.500', M.TESOURO), ('5.000', M.LAGOA), ('10.000', M.PEDRAS), ('25.000', M.ARVORE),
         ('50.000', M.NAVIO), ('100.000', M.ROSTO), ('???', (M.SOMBRA[0] + 14, M.SOMBRA[1] - 26))]
TINTA_T = (82, 52, 30); VERMELHO = (150, 36, 28)
T_PINO = [Wd(136) + .1 + k * .42 for k in range(len(METAS))]

def pinos_mapa(d, t, cam):
    cx, cy, z = cam
    def tela(x, y): return (x - cx) * z + W / 2, (y - cy) * z + H / 2
    sx, sy = tela(VCX, VCY); a = min(1, (t - T_MAPA[0] - .6) / .3)
    if a > 0:
        d.ellipse((sx - 26, sy - 26, sx + 26, sy + 26), outline=(40, 110, 40, int(255 * a)), width=6)
        texto(d, sx, sy - 58, [('50 OK', (60, 140, 60))], 44, a)
    for k, (rt, (x, y)) in enumerate(METAS):
        u = t - T_PINO[k]
        if u < 0: continue
        s = min(1.0, u / .18); sx, sy = tela(x, y); r = int(22 * s)
        foco = (k == 0 and Wd(148) <= t < Wd(152)) or (k == 6 and Wd(152) <= t < Wd(158)) or (k == 7 and t >= Wd(158))
        cor = VERMELHO if foco else TINTA_T
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(226, 204, 160, 230), outline=cor + (255,), width=5)
        if s > .6:
            d.rectangle((sx - 8, sy - 2, sx + 8, sy + 10), fill=cor + (255,))
            d.rectangle((sx - 5, sy - 10, sx + 5, sy - 2), outline=cor + (255,), width=4)
            texto(d, sx, sy - 54, [(rt, OURO if foco else CREME)], 52 if foco else 40, min(1, (u - .1) / .15) if u > .1 else 0)

def mapa_quadro(t):
    cam = camera_mapa(t)
    img = iluminar(mundo(t, 'mapa'), 0)
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = sepia(img[ys][:, xs])
    u = ease((t - T_MAPA[0]) / .7); meia = int(H / 2 * u)
    out = np.zeros_like(fr) + np.array([20, 16, 12], np.float32)
    out[H // 2 - meia:H // 2 + meia] = fr[H // 2 - meia:H // 2 + meia]
    if meia < H // 2:
        for yy in (H // 2 - meia, H // 2 + meia - 1): out[max(0, yy - 14):yy + 14] = np.array([180, 150, 105], np.float32)
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
        if T_CORTE[0] <= t < T_RUAS[0] + .3:
            n = sum(1 for tf in QUEDA if t >= tf)
            al = min(1, (t - T_CORTE[0]) / .3) * min(1, (T_RUAS[0] + .3 - t) / .3)
            texto(d, 540, 290, [('ÁRVORES', CREME), (f'{n}', OURO)], 56, al)
        if T_CASAS[0] - .2 <= t < T_TUDO[1] + .3:
            n = sum(1 for tp in T_PRONTA if t >= tp)
            al = min(1, (t - T_CASAS[0] + .2) / .3) * min(1, (T_TUDO[1] + .3 - t) / .3)
            texto(d, 540, 290, [('CABANAS', CREME), (f'{n}/50', OURO)], 56, al)
        if T_CASAS[0] <= t < T_TUDO[0] + 1.0:
            VIDA = 3 * DT_CASA - .02
            for i, tp in enumerate(T_PRONTA):
                u = t - tp
                if not (0 <= u < VIDA): continue
                x, y = LOTES[i]; sx = (x + CW / 2 - cx) * z + W / 2; sy = (y - cy) * z + H / 2 - 34 - (i % 3) * 54
                nk = nick_de(i); al = min(1, u / .06) * min(1, (VIDA - u) / .1)
                rt, cor, sz = (f'@{nk}', CREME, 38) if nk else ('+1', OURO, 42)
                larg = V.fonte(sz).getlength(rt); sx = min(max(sx, 70 + larg / 2), W - 70 - larg / 2)
                texto(d, sx, sy - u * 12, [(rt, cor)], sz, al)
        if t >= T_FIM + 1.2:
            x, y = LIVRES[0]; sx = (x + CW / 2 - cx) * z + W / 2; sy = (y - cy) * z + H / 2 - 70
            larg = V.fonte(46).getlength('@SEU_NOME_AQUI?'); sx = min(max(sx, 70 + larg / 2), W - 70 - larg / 2)
            texto(d, sx, sy, [('@SEU_NOME_AQUI?', OURO)], 46, min(1, (t - T_FIM - 1.2) / .4))
    for a0, b0, ws, ch in LEG:
        if a0 <= t < b0:
            al = min(1, (t - a0) / .08) * min(1, (b0 - t) / .08)
            texto(d, 540, 1500 if not mapa else 1640, [(w, OURO if j == ch else CREME) for j, w in enumerate(ws)], 64, al)
    return Image.alpha_composite(base, camada).convert('RGB')

def quadro(t):
    if T_MAPA[0] <= t < T_MAPA[1]:
        return sobrepor(mapa_quadro(t), t, camera_mapa(t), mapa=True)
    cam = camera(t)
    img = iluminar(mundo(t), t)
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = img[ys][:, xs] * V.VIN
    for tc in (T_GARRAFA[0], T_FIM):
        if tc <= t < tc + .1: fr = fr * .55 + 255 * .45 * (1 - (t - tc) / .1)
    if t > DUR - .6: fr *= max(0, (DUR - t) / .6) * .3 + .7
    return sobrepor(Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).convert('RGBA'), t, cam)

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
    json.dump({'dur': DUR, 'fim_voz': PAL[-1]['b'], 'casas': T_PRONTA, 'obra': T_OBRA, 'quedas': QUEDA, 'chegada': T_CHEGA, 'junta': T_JUNTA,
               'corte': T_CORTE, 'ruas': T_RUAS, 'lotes': T_LOTES, 'praca': T_PRACA, 'poco': T_POCO, 'horta': T_HORTA, 'tudo': T_TUDO,
               'sobra': T_SOBRA, 'garrafa': T_GARRAFA, 'rolha': Wd(120), 'mapa': T_MAPA, 'pinos': T_PINO, 'fim': T_FIM,
               'focos': [Wd(148), Wd(152), Wd(158)], 'legendas': [(a, b, ' '.join(ws)) for a, b, ws, _ in LEG]},
              open(f'{ROOT}/out/eventos-ep2.json', 'w'), ensure_ascii=False, indent=1)
    print('fim', n, 'quadros')

if __name__ == '__main__':
    main()
