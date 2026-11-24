"""SARAMAR · ep. 3 "A árvore" (9:16, 1080×1920, 30 fps). 100 seguidores.
Parte da vila exatamente como o ep. 2 terminou (importa ep2.py e pega o quadro em que todas as cabanas estão prontas).
Chegam 50 moradores de barco; a rua vazia enche; duas ruas novas sobem mata adentro até a árvore gigante, que ninguém
tem coragem de cortar (a fechadura acende); a vila desvia pela esquerda; 100 cabanas. Depois vêm o píer, os barcos e
as redes; na ponta da praia sobe uma construção diferente: um farol com a casa do faroleiro, ainda sem dono (o
comentário mais curtido do vídeo vai morar lá). Anoitece, uma luz pisca atrás da cachoeira e o mapa verdadeiro mostra
"100 OK" e a cachoeira a 1.000. As cabanas novas saem sem nome ("+1").
Uso: python3 scripts/ep3.py                → out/saramar-ep3-mudo.mp4 e out/eventos-ep3.json
     python3 scripts/ep3.py 0,8,20 <pasta> → quadros de teste"""
import json, math, os, subprocess, sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mundo as M
import video as V
import ep2 as E                          # a vila do ep. 2 (lotes, cabanas, árvores, ferramentas, mapa em sépia)
from mundo import P, WW, WH
from video import ease, lerp, texto, CREME, OURO, W, H, FPS

ROOT = V.ROOT
CX, CY = M.CAMP
PAL = json.load(open(f'{ROOT}/voz/ep3/palavras.json'))
def Wd(i): return PAL[i]['a']
DUR = round(PAL[-1]['b'] + 2.2, 2)
CW, CH, COLS, AV = E.CW, E.CH, E.COLS, E.AV
N_ANT, N_MOR = 50, 100

# ── a vila do fim do ep. 2, sem moradores, sem lotes vazios e sem a garrafa ────────────────────────
_trac, _placa, _garrafa, _fog = E.tracejado, M.placa, M.GARRAFA, M.fogueira
E.tracejado = lambda *a, **k: None
M.placa = lambda *a, **k: None
M.GARRAFA = np.zeros((1, 1, 4), np.float32)
M.fogueira = lambda img, x, y, t, forte=1.0: M.blit(img, M.spr(['b.....b', '.bbbbb.', 'b.....b'], {'b': P['brasa']}), x - 3, y)
_mor, _agua = E.moradores, E.agua
E.moradores = lambda img, t: None
E.agua = lambda img, t: None
B0 = E.mundo(E.T_TUDO[1] + .2).astype(np.float32)
E.tracejado, M.placa, M.GARRAFA, M.fogueira, E.moradores, E.agua = _trac, _placa, _garrafa, _fog, _mor, _agua

# ── lotes novos ──────────────────────────────────────────────────────────────────────────────────
LOT5 = list(E.LIVRES)                                              # a rua vazia do ep. 2 (10 lotes)
ROW_A = [(x, y) for y in (534, 521) for x in COLS]                 # duas ruas novas, mata adentro (20)
ROW_B = [(x, y) for y in (508, 495, 482, 469) for x in COLS[:5]]   # a vila desvia da árvore pela esquerda (20)
NOVOS = LOT5 + ROW_A + ROW_B
LOTES = list(E.LOTES[:N_ANT]) + NOVOS                              # índice k = morador k = cabana k + 1
LIVRES = [(x, 456) for x in COLS[:5]]                              # lotes vazios para o ep. 4
def rua_de(y): return (612 - y) // 13

# ── chão: clareiras novas sem árvores (as árvores daí viram objetos que caem) ──────────────────────
AX, AY = M.ARVORE
PERTO_ARVORE = ((M.XX - AX) / 30) ** 2 + ((M.YY - (AY - 4)) / 30) ** 2 < 1
def retangulo(x0, y0, x1, y1):
    m = np.zeros((WH, WW), bool); m[y0:y1, x0:x1] = True; return m
CL_A = retangulo(COLS[0] - 6, 514, COLS[-1] + CW + 7, 546)
CL_B = retangulo(COLS[0] - 6, 450, 239, 514)
borda = 2 + 4 * M.ruido(3, 14, 47)
CL_A = (CL_A | (ndimage.distance_transform_edt(~CL_A) < borda)) & M.TERRA & ~E.AREIA & ~PERTO_ARVORE
CL_B = (CL_B | (ndimage.distance_transform_edt(~CL_B) < borda)) & M.TERRA & ~E.AREIA & ~PERTO_ARVORE & ~(M.XX > 239)
FX, FY = M.FAROL
CASA_F = (FX + 7, FY - 14)                                         # casa do faroleiro, à direita do farol
CL_F = (((M.XX - (FX + 10)) / 26) ** 2 + ((M.YY - (FY - 6)) / 16) ** 2 < 1) & M.TERRA & ~E.AREIA
nz = M.ruido(2, 25, 93)
GV = E.G.copy(); GV[nz > .45] = P['grama']; GV[nz <= .45] = P['grama3']
B3 = B0.copy()
for m in (CL_A, CL_B, CL_F): B3[m] = GV[m]

R = np.random.default_rng(300)
def arvores_em(m, passo_x=10, passo_y=9):
    ys, xs = np.nonzero(m); out = []
    for y in range(ys.min() - 8, ys.max(), passo_y):
        for x in range(xs.min() - 4, xs.max(), passo_x):
            xx, yy = x + R.integers(-2, 3), y + R.integers(-2, 3)
            px, py = min(WW - 1, xx + 5), min(WH - 1, yy + 9)
            if m[py, px]: out.append([xx, yy, [M.ARV, M.PINHO][R.integers(0, 2)]])
    out.sort(key=lambda a: -a[1]); return out
ARV_A = arvores_em(CL_A); ARV_B = arvores_em(CL_B)
ARVS = ARV_A + ARV_B

# ── tempos (palavras da narração) ────────────────────────────────────────────────────────────────
T_CHEGA = (Wd(18) - .3, Wd(22) - .1)            # "Agora, chegaram mais cinquenta."
T_CASA5 = (Wd(22) + .1, Wd(28) - .1)            # "A rua de cima encheu primeiro."
T_CORTE_A = (Wd(29) - .2, Wd(33) + .2)          # "abriram mais duas ruas. Mata adentro."
T_RUAS_A = Wd(33)
T_CASA_A = (Wd(33) + .3, Wd(36) + .3)
T_ARVORE = Wd(38)                               # "Até chegar na árvore."
T_PORTA = Wd(39)                                # "A da porta." (a fechadura acende)
T_MACHADO = (Wd(42), Wd(46) + .2)               # "Ninguém teve coragem de cortar." (ergue o machado e desiste)
T_CORTE_B = (Wd(47) + .2, Wd(51))               # "Então, a vila desviou dela."
T_RUAS_B = Wd(50)
T_CASA_B = (Wd(51) - .3, Wd(55) + .1)           # até "Cem cabanas."
T_CEM = Wd(52)
T_PIER = (Wd(61), Wd(64) + .7)                  # "Então veio o píer."
T_BARCOS, T_REDES = Wd(65), Wd(67)
T_FAROL = (Wd(77) - .9, Wd(78) + .5)            # "Um farol."
T_CASAF = (Wd(79) - .2, Wd(82) + .1)            # "Com uma casa embaixo."
T_SEMDONO = Wd(83)
T_NOITE = Wd(86) - .4                           # "Na primeira noite..."
T_LUZ = Wd(95)                                  # "alguém viu uma luz..."
T_MAPA = (Wd(99) - .25, Wd(104) - .3)           # "Faltam novecentos seguidores pra cachoeira."
T_CTA = Wd(104) - .3                            # "O comentário mais curtido..."
T_FIM = Wd(114) - .1                            # "Segue a página."
T_OBRA = .8

def janela_tempos(ini, fim, n):
    d = (fim - ini) / n; return [ini + (i + 1) * d for i in range(n)]
T_PRONTA = janela_tempos(*T_CASA5, 10) + janela_tempos(*T_CASA_A, 20) + janela_tempos(*T_CASA_B, 20)

# quedas: cada morador novo da rua A (k 60..79) derruba as árvores de A; os da rua B (80..99), as de B
def quedas(lista, janela, donos):
    n = len(lista); a, b = janela
    return [a + .5 + (i % len(donos)) / len(donos) * (b - a - 1.0) * .5 + (i // len(donos)) * (b - a - 1.0) * .5 / max(1, (n - 1) // len(donos)) for i in range(n)], \
           [donos[i % len(donos)] for i in range(n)]
QA, DA = quedas(ARV_A, T_CORTE_A, list(range(60, 80)))
QB, DB = quedas(ARV_B, T_CORTE_B, list(range(80, 100)))
QUEDA, DONO = QA + QB, DA + DB

# ── moradores ────────────────────────────────────────────────────────────────────────────────────
RC = np.random.default_rng(3)
CORES = [(['camisa1', 'camisa2', 'telhado3', 'grama2', 'madeira', 'vela', 'pedra2'][RC.integers(0, 7)], ['cabelo1', 'cabelo2'][RC.integers(0, 2)]) for _ in range(50)]
SPR = list(E.SPR) + [M.morador(c, h) for c, h in CORES]
def frente(k): x, y = LOTES[k]; return x + 3, y + CH - 1
PRAIA_Y = M.costa_sul(CX) - 4
def espera(k): j = k - 50; return CX - 46 + (j % 13) * 7, CY + 2 + (j // 13) * 5
PESCADORES = list(range(2, 8))
PIER_X, PIER_Y = M.PIER_X, M.PIER_Y
def lugar_pier(j): return (PIER_X - 8 if j % 2 == 0 else PIER_X + 4), PIER_Y + 6 + (j // 2) * 10
MACHADEIRO = 75
ARV_POS = (AX - 15, AY + 6)

def sway(k, t, x, y):
    return x + 1.5 * math.sin(t * .9 + k * 1.7), y, abs(math.cos(t * .9 + k * 1.7)) > .4

def pos_morador(k, t):
    """(x, y, andando, ferramenta, fase) ou None se ainda não chegou"""
    fx, fy = frente(k)
    if k < N_ANT:
        if k in PESCADORES and t >= T_PIER[0] - .6:
            j = PESCADORES.index(k); dx, dy = lugar_pier(j)
            u = ease((t - T_PIER[0] + .6) / 1.6)
            if u < 1: return lerp(fx, dx, u), lerp(fy, dy, u), True, None, 0
            return dx + .5 * math.sin(t * 1.3 + j), dy, False, None, 0
        return sway(k, t, fx, fy) + (None, 0)
    if t < T_CHEGA[0]: return None
    j = k - 50
    sx, sy = CX - 70 + (j % 10) * 14, PRAIA_Y + 12
    ex, ey = espera(k)
    if t < T_CHEGA[1] + .6:
        u = min(1.0, max(0.0, (t - T_CHEGA[0]) / (T_CHEGA[1] - T_CHEGA[0] + .4) * 1.5 - j / 50 * .5))
        return lerp(sx, ex, ease(u)), lerp(sy, ey, ease(u)), 0 < u < 1, None, 0
    prev = (ex, ey)
    # cortar as árvores (grupos A e B)
    mins = [i for i in range(len(ARVS)) if DONO[i] == k]
    for i in mins:
        tf = QUEDA[i]; x, y = ARVS[i][0], ARVS[i][1]; alvo = (x - 5, y + 3)
        if t < tf - .8:
            u = ease((t - (tf - 1.7)) / .9) if t > tf - 1.7 else 0
            return lerp(prev[0], alvo[0], u), lerp(prev[1], alvo[1], u), 0 < u < 1, 'machado', 0
        if t < tf: return alvo[0], alvo[1], False, 'machado', t * 18
        prev = alvo
    ini = T_PRONTA[j] - T_OBRA
    if t < ini:
        u = ease((t - (ini - 1.0)) / .9) if t > ini - 1.0 else 0
        return lerp(prev[0], fx, u), lerp(prev[1], fy, u), 0 < u < 1, None, 0
    if t < T_PRONTA[j]: return LOTES[k][0] + CW + 1, LOTES[k][1] + 1, False, 'martelo', t * 16
    if k == MACHADEIRO and T_PRONTA[j] < t < T_MACHADO[1] + 1.6:
        a0 = T_ARVORE - .4
        if t < a0: return fx, fy, False, None, 0
        if t < a0 + 1.0:
            u = ease(t - a0); return lerp(fx, ARV_POS[0], u), lerp(fy, ARV_POS[1], u), True, 'machado', 0
        if t < T_MACHADO[0]: return ARV_POS[0], ARV_POS[1], False, 'machado', 0
        if t < T_MACHADO[1]: return ARV_POS[0], ARV_POS[1], False, 'ergue', 0
        u = ease((t - T_MACHADO[1]) / 1.5); return lerp(ARV_POS[0], fx, u), lerp(ARV_POS[1], fy, u), True, None, 0
    return sway(k, t, fx, fy) + (None, 0)

def moradores(img, t):
    vis = []
    for k in range(N_MOR):
        p = pos_morador(k, t)
        if p: vis.append((p[1], k) + p)
    for _, k, x, y, anda, fer, fase in sorted(vis, key=lambda v: (v[0], v[1])):
        M.blit(img, SPR[k][int(t * 8 + k) % 4 if anda else 0], x, y)
        if fer == 'ergue':                                # machado erguido, parado, e a mão que hesita
            hx, hy = int(x + 5), int(y + 5); img[hy - 6:hy, hx + 1] = P['madeira3']; img[hy - 7:hy - 5, hx + 2] = P['pedra3']
        elif fer: E.ferramenta(img, x, y, t, fer, fase)

def barcos_chegada(img, t):
    u = (t - T_CHEGA[0]) / 2.6; py = M.costa_sul(CX)
    if not (T_CHEGA[0] - .2 <= t < T_CHEGA[1] + 1.2): return
    for k, bx in enumerate((CX - 96, CX - 60, CX - 24, CX + 12, CX + 48, CX + 84)):
        M.barco(img, bx, py + 6 + max(0, 34 * (1 - min(1, u + k * .08))), t, k)

# ── árvores dos lotes novos ──────────────────────────────────────────────────────────────────────
def arvores(img, t):
    for i, (x, y, s) in enumerate(ARVS):
        tf = QUEDA[i]
        if t < tf - .8: M.blit(img, s, x, y)
        elif t < tf:
            M.blit(img, s, x + (1 if int(t * 14) % 2 else 0), y)
            for c in range(3):
                ph = (t * 3 + c / 3) % 1; img[int(y + 9 - ph * 4), int(x + 3 - c - ph * 3)] = P['madeira3']
        elif t < tf + .25: M.blit(img, E.ROT[id(s)][0], x + 1, y + 2)
        elif t < tf + .7: M.blit(img, E.ROT[id(s)][1], x + 2, y + 6)
        elif t < tf + 1.6: img[y + 9:y + 11, x + 4:x + 6] = P['tronco2']

# ── ruas, lotes e cabanas novas ──────────────────────────────────────────────────────────────────
def terra(img, x0, y0, x1, y1):
    for py in range(y0, y1):
        for px in range(x0, x1):
            img[py, px] = P['areia2'] if (px + py) % 5 else P['areia3']
def ruas(img, t):
    if t >= T_RUAS_A:
        for y in (534, 521): terra(img, COLS[0] - 4, y + CH + 1, COLS[-1] + CW + 3, y + CH + 3)
        terra(img, AV - 2, 518, AV + 3, 548)
    if t >= T_RUAS_B:
        for y in (508, 495, 482, 469, 456): terra(img, COLS[0] - 4, y + CH + 1, COLS[4] + CW + 3, y + CH + 3)
        terra(img, COLS[4] + CW + 1, 453, COLS[4] + CW + 3, 520)

def lotes_e_cabanas(img, t, noite):
    for j, (x, y) in enumerate(NOVOS):
        tp = T_PRONTA[j]
        if t >= tp - T_OBRA:
            E.casinha(img, x, y, rua_de(y), min(1.0, (t - tp + T_OBRA) / T_OBRA), janela=noite > .5)
        elif (j < 10) or (j < 30 and t >= T_RUAS_A + .2) or (t >= T_RUAS_B + .2):
            E.tracejado(img, x, y)
    if t >= T_CEM + .5:
        for x, y in LIVRES: E.tracejado(img, x, y)
        M.placa(img, LIVRES[0][0] + 2, LIVRES[0][1] + 8, t)
    if noite > .5:                                        # janelas das cabanas antigas acesas
        for x, y in E.LOTES[:N_ANT]: img[y + 5:y + 7, x + 7:x + 9] = P['luz']

# ── píer, barcos, redes, farol e a casa do faroleiro ─────────────────────────────────────────────
def porto(img, t):
    if t >= T_PIER[0]:
        comp = int(46 * min(1.0, (t - T_PIER[0]) / (T_PIER[1] - T_PIER[0])))
        if comp > 0: M.pier(img, PIER_X, PIER_Y - 2, comp)
    if t >= T_BARCOS - .3:
        for k, (bx, by) in enumerate([(PIER_X + 7, PIER_Y + 14), (PIER_X - 19, PIER_Y + 24), (PIER_X + 7, PIER_Y + 34)]):
            if t >= T_BARCOS - .3 + k * .25: M.barco(img, bx, by, t, k)
    if t >= T_REDES - .3:
        for k, (vx, vy) in enumerate([(PIER_X - 40, PIER_Y - 14), (PIER_X + 18, PIER_Y - 16)]):
            if t >= T_REDES - .3 + k * .3: M.varal(img, vx, vy)

def casa_farol(img, x, y, prog, janela):
    """casa de pedra do faroleiro (16×13), telhado azul: diferente das cabanas de madeira"""
    w, hp, ht = 16, 8, 5
    linhas = int(hp * min(1.0, prog * 1.6))
    for r in range(linhas):
        yy = y + ht + hp - 1 - r
        for xx in range(x, x + w):
            img[yy, xx] = P['pedra3'] if (xx // 3 + r) % 2 else P['pedra']
        img[yy, x] = P['pedra2']; img[yy, x + w - 1] = P['pedra2']
    if prog >= .66:
        img[y + ht + 3:y + ht + hp, x + 6:x + 10] = P['mar0']; img[y + ht + 2, x + 6:x + 10] = P['pedra2']   # porta azul
        img[y + ht + 2:y + ht + 4, x + 12:x + 14] = P['luz'] if janela else P['mar0'] * .8
        for r in range(ht + 1):
            m = ht - r
            img[y + r, x - 1 + m:x + w + 1 - m] = P['mar1'] if r % 2 else P['mar2']
            img[y + r, x - 1 + m] = P['mar0']; img[y + r, x + w - m] = P['mar0']

def farol(img, t, noite):
    if t >= T_FAROL[0]:
        alto = max(1, int(22 * min(1.0, (t - T_FAROL[0]) / (T_FAROL[1] - T_FAROL[0]))))
        M.farol(img, FX, FY, aceso=min(1.0, noite * 1.2), alto=alto)
    if t >= T_CASAF[0]:
        casa_farol(img, *CASA_F, (t - T_CASAF[0]) / (T_CASAF[1] - T_CASAF[0]), noite > .5)
    if t >= T_SEMDONO - .2:
        M.placa(img, CASA_F[0] + 18, CASA_F[1] + 12, t)

def facho(img, t, noite):
    """o facho do farol girando à noite"""
    if noite <= 0 or t < T_FAROL[1]: return
    a = t * 1.6; lx, ly = FX, FY - 24
    for r in range(4, 70):
        for e in (-1, 0, 1):
            aa = a + e * .05 * (1 + r / 40)
            px, py = int(lx + r * math.cos(aa)), int(ly + r * math.sin(aa) * .6)
            if 0 <= px < WW and 0 <= py < WH:
                k = noite * .45 * (1 - r / 70)
                img[py, px] = img[py, px] * (1 - k) + P['luz'] * k

def luz_caverna(img, t):
    if t < T_LUZ - .2: return
    x, y = M.CACHOEIRA
    k = min(1.0, (t - T_LUZ + .2) / .3) * (.65 + .35 * math.sin(t * 9) * math.sin(t * 3.3))   # acende e tremula, como chama
    for dx in (-8, 6):                                                                    # nas bordas da caverna
        img[y + 7:y + 12, x + dx:x + dx + 3] = img[y + 7:y + 12, x + dx:x + dx + 3] * (1 - k) + P['luz'] * k
    sub = img[y + 4:y + 12, x - 5:x + 6]                                                   # e através da água
    sub[:] = sub * (1 - .45 * k) + P['luz'] * .45 * k
    for r in range(2, 7):                                                                  # halo na pedra em volta
        a = .10 * k * (1 - r / 7)
        img[y + 7 - r:y + 12 + r, x - 8 - r:x + 9 + r] = img[y + 7 - r:y + 12 + r, x - 8 - r:x + 9 + r] * (1 - a) + P['luz'] * a

# ── luz: dia → noite ─────────────────────────────────────────────────────────────────────────────
def noite_de(t):
    if t < T_NOITE: return 0.0
    return min(1.0, (t - T_NOITE) / .9)
def iluminar(img, t):
    k = noite_de(t)
    if k <= 0: return img
    amb = np.array([lerp(1, .42, k), lerp(1, .48, k), lerp(1, .74, k)], np.float32)
    org = img.copy(); emis = np.zeros((WH, WW), bool)
    for c in ('luz', 'fogo1', 'fogo2', 'fogo3', 'runa'): emis |= np.abs(img - P[c]).sum(-1) < 30
    img = img * amb
    lum = V.GLOW_F * .9 * k
    img = img * (1 + lum[..., None] * .45 * V.QUENTE) + lum[..., None] * 22 * V.QUENTE
    img[emis] = org[emis] * 1.08
    return img

# ── o mundo a cada quadro ────────────────────────────────────────────────────────────────────────
def mundo(t, estado=None):
    img = B3.copy(); nt = 0.0 if estado == 'site' else noite_de(t)
    E.agua(img, t)
    M.cachoeira(img, t)
    if t >= T_PORTA - .2: M.arvore_gigante(img, t, luz=1.0)
    if estado == 'mapa': E.sombra_tinta(img)
    ruas(img, t)
    lotes_e_cabanas(img, t, nt)
    porto(img, t)
    farol(img, t, nt)
    arvores(img, t)
    M.fogueira(img, CX, CY, t)
    moradores(img, t)
    barcos_chegada(img, t)
    if estado == 'site': return img                        # o site mostra o dia (scripts/export_episodio.py)
    img = iluminar(img, t)
    luz_caverna(img, t)                                   # depois da noite: a luz não escurece
    facho(img, t, nt)
    return img

# ── câmera ───────────────────────────────────────────────────────────────────────────────────────
VCX, VCY = 241, 596
LX, LY = LIVRES[0]
CAM_K = [(0, 240, 455, 3.15), (Wd(5) - .3, 240, 455, 3.3), (Wd(8), VCX, VCY + 4, 7.0), (Wd(13), VCX, 566, 7.6), (T_CHEGA[0], VCX, 562, 7.6),
         (T_CHEGA[0] + .7, CX - 6, CY + 10, 5.4), (T_CHEGA[1], CX - 6, CY + 6, 5.6), (T_CASA5[0] + .6, VCX, 572, 6.9), (T_CASA5[1], VCX, 566, 6.9),
         (T_CORTE_A[0] + .5, VCX, 540, 6.5), (Wd(35), VCX, 538, 6.5), (T_ARVORE, AX - 6, AY + 8, 9.0), (T_CORTE_B[0] - .2, AX - 8, AY + 8, 9.4),
         (T_CORTE_B[0] + .6, 214, 492, 7.0), (T_CEM - .1, 214, 496, 6.8), (T_CEM + .8, VCX - 10, 548, 4.5), (Wd(56) - .1, VCX - 10, 552, 4.4),
         (T_PIER[0] - .2, PIER_X - 6, PIER_Y + 12, 7.4), (Wd(69) - .1, PIER_X - 8, PIER_Y + 14, 7.1), (Wd(69) + .7, FX + 8, FY - 6, 8.2),
         (T_NOITE, FX + 8, FY - 8, 8.6), (T_NOITE + 1.0, FX + 8, FY - 8, 8.0), (T_LUZ - .5, 205, 300, 5.2), (Wd(96), M.CACHOEIRA[0], M.CACHOEIRA[1] + 6, 10.5),
         (T_MAPA[0], M.CACHOEIRA[0], M.CACHOEIRA[1] + 6, 11.0)]
def camera(t):
    if T_MAPA[0] <= t < T_MAPA[1]: return camera_mapa(t)
    if t >= T_FIM:
        u = ease((t - T_FIM) / 2.4); return lerp(FX + 8, LX + 20, u), lerp(FY - 8, LY + 12, u), lerp(9.2, 9.5, u)
    if t >= T_CTA:
        u = ease((t - T_CTA) / 3.0); return FX + 8, FY - 8, lerp(8.6, 9.4, u)
    for a, b in zip(CAM_K, CAM_K[1:]):
        if a[0] <= t < b[0]:
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return CAM_K[-1][1:]

MAPA_CAM0 = (255, 470, 2.65)
def camera_mapa(t):
    ks = [(T_MAPA[0], *MAPA_CAM0), (Wd(100) - .2, *MAPA_CAM0), (Wd(101) + .3, M.CACHOEIRA[0], M.CACHOEIRA[1] + 14, 4.6), (T_MAPA[1], M.CACHOEIRA[0], M.CACHOEIRA[1] + 14, 4.9)]
    for a, b in zip(ks, ks[1:]):
        if a[0] <= t < b[0]:
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return ks[-1][1:]

# ── mapa verdadeiro: "100 OK" e a cachoeira a 1.000 ──────────────────────────────────────────────
TINTA_T, VERMELHO, VERDE = (82, 52, 30), (150, 36, 28), (60, 140, 60)
T_PINO = [T_MAPA[0] + .7 + k * .12 for k in range(len(E.METAS))]
def pinos_mapa(d, t, cam):
    cx, cy, z = cam
    def tela(x, y): return (x - cx) * z + W / 2, (y - cy) * z + H / 2
    sx, sy = tela(VCX, 560); a = min(1, (t - T_MAPA[0] - .5) / .3)
    if a > 0:
        d.ellipse((sx - 30, sy - 30, sx + 30, sy + 30), outline=(40, 110, 40, int(255 * a)), width=6)
        texto(d, sx, sy - 62, [('100 OK', VERDE)], 46, a)
    for k, (rt, (x, y)) in enumerate(E.METAS):
        u = t - T_PINO[k]
        if u < 0: continue
        s = min(1.0, u / .18); sx, sy = tela(x, y); r = int(22 * s)
        foco = k == 0 and t >= Wd(100) - .2
        cor = VERMELHO if foco else TINTA_T
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(226, 204, 160, 230), outline=cor + (255,), width=5)
        if s > .6:
            d.rectangle((sx - 8, sy - 2, sx + 8, sy + 10), fill=cor + (255,))
            d.rectangle((sx - 5, sy - 10, sx + 5, sy - 2), outline=cor + (255,), width=4)
            texto(d, sx, sy - 54, [(rt, OURO if foco else CREME)], 56 if foco else 40, min(1, (u - .1) / .15) if u > .1 else 0)
            if foco: texto(d, sx, sy + 70, [('FALTAM 900', VERMELHO)], 52, min(1, (t - Wd(100) - .1) / .3))

def mapa_quadro(t):
    cam = camera_mapa(t)
    img = mundo(t, 'mapa')
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = E.sepia(img[ys][:, xs])
    u = ease((t - T_MAPA[0]) / .6); meia = int(H / 2 * u)
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

def na_tela(cam, x, y):
    cx, cy, z = cam; return (x - cx) * z + W / 2, (y - cy) * z + H / 2
def cerca(sx, rt, sz):
    larg = V.fonte(sz).getlength(rt); return min(max(sx, 70 + larg / 2), W - 70 - larg / 2)

def sobrepor(base, t, cam, mapa=False):
    camada = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(camada)
    if not mapa:
        a = min(1, t / .3) * (1 - ease((t - Wd(5) + .2) / .4))
        if a > 0:
            texto(d, 540, 300, [('ESSA PÁGINA TEM', CREME)], 58, a); texto(d, 540, 430, [('100', OURO)], 190, a); texto(d, 540, 560, [('SEGUIDORES', CREME)], 58, a)
        if T_CASA5[0] - .3 <= t < Wd(56):
            n = N_ANT + sum(1 for tp in T_PRONTA if t >= tp)
            al = min(1, (t - T_CASA5[0] + .3) / .3) * min(1, (Wd(56) - t) / .3)
            texto(d, 540, 290, [('CABANAS', CREME), (f'{n}/100', OURO)], 56, al)
        for j, tp in enumerate(T_PRONTA):                 # "+1" sobre cada cabana nova
            u = t - tp
            if 0 <= u < .9:
                x, y = NOVOS[j]; sx, sy = na_tela(cam, x + CW / 2, y)
                texto(d, cerca(sx, '+1', 46), sy - 30 - (j % 3) * 44 - u * 40, [('+1', OURO)], 46, min(1, u / .06) * min(1, (.9 - u) / .25))
        if T_SEMDONO - .1 <= t < T_NOITE:
            sx, sy = na_tela(cam, CASA_F[0] + 8, CASA_F[1] - 4)
            texto(d, cerca(sx, '@???', 60), sy - 60, [('@???', OURO)], 60, min(1, (t - T_SEMDONO + .1) / .3))
        if T_CTA <= t < T_FIM:
            sx, sy = na_tela(cam, CASA_F[0] + 8, CASA_F[1] - 4); al = min(1, (t - T_CTA) / .3) * min(1, (T_FIM - t) / .25)
            texto(d, cerca(sx, 'O MAIS CURTIDO', 52), sy - 150, [('O MAIS CURTIDO', CREME)], 52, al)
            texto(d, cerca(sx, 'MORA AQUI', 64), sy - 80, [('MORA AQUI', OURO)], 64, al)
            if t >= Wd(108):
                texto(d, 540, 360, [('COMENTA!', OURO)], 96, min(1, (t - Wd(108)) / .25) * min(1, (T_FIM - t) / .25))
        if t >= T_FIM + 1.0:
            sx, sy = na_tela(cam, LX + CW / 2, LY)
            texto(d, cerca(sx, '@SEU_NOME_AQUI?', 46), sy - 70, [('@SEU_NOME_AQUI?', OURO)], 46, min(1, (t - T_FIM - 1.0) / .4))
    for a0, b0, ws, ch in LEG:
        if a0 <= t < b0:
            al = min(1, (t - a0) / .08) * min(1, (b0 - t) / .08)
            texto(d, 540, 1500 if not mapa else 1640, [(w, OURO if j == ch else CREME) for j, w in enumerate(ws)], 64, al)
    return Image.alpha_composite(base, camada).convert('RGB')

def quadro(t):
    if T_MAPA[0] <= t < T_MAPA[1]:
        return sobrepor(mapa_quadro(t), t, camera_mapa(t), mapa=True)
    cam = camera(t)
    img = mundo(t)
    cx, cy, z = cam
    xs = np.clip(np.floor(cx + V.SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + V.SY / z).astype(int), 0, WH - 1)
    fr = img[ys][:, xs] * V.VIN
    for tc in (T_MAPA[1], T_CTA):                         # clarão nos cortes
        if tc <= t < tc + .1: fr = fr * .55 + 255 * .45 * (1 - (t - tc) / .1)
    if t > DUR - .6: fr *= max(0, (DUR - t) / .6) * .3 + .7
    return sobrepor(Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).convert('RGBA'), t, cam)

def main():
    if len(sys.argv) > 1:
        pasta = sys.argv[2] if len(sys.argv) > 2 else f'{ROOT}/out/testes'; os.makedirs(pasta, exist_ok=True)
        for s in sys.argv[1].split(','):
            quadro(float(s)).save(f'{pasta}/e3_{float(s):05.1f}.png'); print('quadro', s, flush=True)
        return
    n = int(DUR * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/saramar-ep3-mudo.mp4'], stdin=subprocess.PIPE)
    for f in range(n):
        ff.stdin.write(np.asarray(quadro(f / FPS)).tobytes())
        if f % 150 == 0: print(round(f / FPS, 1), 's', flush=True)
    ff.stdin.close(); ff.wait()
    json.dump({'dur': DUR, 'fim_voz': PAL[-1]['b'], 'casas': T_PRONTA, 'obra': T_OBRA, 'quedas': QUEDA, 'chegada': T_CHEGA,
               'ruas': [T_RUAS_A, T_RUAS_B], 'porta': T_PORTA, 'machado': T_MACHADO, 'cem': T_CEM, 'pier': T_PIER, 'barcos': T_BARCOS,
               'redes': T_REDES, 'farol': T_FAROL, 'casa_farol': T_CASAF, 'sem_dono': T_SEMDONO, 'noite': T_NOITE, 'luz': T_LUZ,
               'mapa': T_MAPA, 'pinos': T_PINO, 'cta': T_CTA, 'comenta': Wd(108), 'fim': T_FIM,
               'legendas': [(a, b, ' '.join(ws)) for a, b, ws, _ in LEG]},
              open(f'{ROOT}/out/eventos-ep3.json', 'w'), ensure_ascii=False, indent=1)
    print('fim', n, 'quadros')

# ── o que o site lê (scripts/export_episodio.py do ilha-saramar) ─────────────────────────────────
ESTADO_SITE = True              # export_episodio.py pede mundo(DUR, 'site'): de dia, sem a noite do fim
NICKS = list(E.NICKS)            # os nicks do ep. 2 continuam nas mesmas cabanas; as 50 novas saem sem nome
LIBERADAS = []
# construções especiais (o site abre um card próprio): a casa do farol é do comentário mais curtido do ep. 3
CONSTRUCOES = [{'id': 'farol', 'nome': 'Casa do farol', 'x': FX - 6, 'y': FY - 30, 'largura': CASA_F[0] + 17 - (FX - 6), 'altura': 32,
                'owner': None, 'descricao': 'O comentário mais curtido do Ep. 3 vai morar aqui.'}]
METAS = E.METAS
def frente_lote(i): x, y = LOTES[i]; return x + 3, y + CH + 1

if __name__ == '__main__':
    main()
