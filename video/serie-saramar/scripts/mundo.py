"""SARAMAR · o mundo em pixel art, gerado em código (sem imagens de terceiros).
Ilha vista de cima, na resolução "de arte" WW×WH; cada pixel de arte vira um bloco na tela (câmera com zoom).
Camadas: terreno estático (mar, raso, areia, grama, pedra, árvores, mistérios) + elementos animados por quadro."""
import math
import numpy as np
from scipy import ndimage

WW, WH = 480, 860
RNG = np.random.default_rng(7)

def hexc(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)

P = {k: hexc(v) for k, v in dict(
    mar0='#1d4f7a', mar1='#235d8c', mar2='#2b6e9e', raso='#3f93b4', raso2='#5bb0c4', espuma='#d8f0ee', onda='#7fc4dc',
    areia='#e3cf96', areia2='#d4bd80', areia3='#c7ad70', grama='#5d9b45', grama2='#4f8a3c', grama3='#6eac4f', grama4='#437a34',
    pedra='#8d8f8c', pedra2='#73757a', pedra3='#a6a7a0', pedra4='#5e6066', musgo='#5f7f3e',
    folha='#3f8a3a', folha2='#2f6f30', folha3='#58a548', folha4='#245a29', tronco='#6b4a2d', tronco2='#523720',
    pinho='#2f6b3b', pinho2='#255a32', pinho3='#3d8048', palma='#5aa040', palma2='#447f31',
    madeira='#9a6a3c', madeira2='#7d5330', madeira3='#b5824c', telhado='#7a3f2a', telhado2='#5f2f20', telhado3='#93513a',
    pele='#e8b58a', pele2='#c98e64', cabelo1='#3b2a1e', cabelo2='#d9a441', camisa1='#c0453a', camisa2='#3f6fb0', calca='#4a3b30',
    fogo1='#ffd25a', fogo2='#ff9a2e', fogo3='#e5532b', brasa='#7a2f1e', fumaca='#9a9a9a',
    branco='#f2efe6', vermelho='#c8443a', luz='#ffe38a', vela='#f3eee0', casco='#6e4a2e', casco2='#523621', rede='#c9b98f').items()}

# ── terreno ──────────────────────────────────────────────────────────────────────────────────────
def ruido(oit, base, seed):
    r = np.random.default_rng(seed); out = np.zeros((WH, WW), np.float32); amp = 1.0
    for o in range(oit):
        n = base * 2 ** o; g = r.standard_normal((n * WH // WW + 2, n + 2)).astype(np.float32)
        z = ndimage.zoom(g, (WH / (g.shape[0] - 2), WW / (g.shape[1] - 2)), order=3)[:WH, :WW]
        out += z * amp; amp *= .5
    return out / np.abs(out).max()

YY, XX = np.mgrid[0:WH, 0:WW].astype(np.float32)
ICX, ICY = 240.0, 430.0
_d = np.sqrt(((XX - ICX) / 150) ** 2 + ((YY - ICY) / 250) ** 2)
_n = ruido(4, 3, 11)
ALT = 1 - _d + .22 * _n                                   # > 0 → terra
ALT += .9 * np.exp(-(((XX - 420) / 17) ** 2 + ((YY - 170) / 15) ** 2)) - .0   # ilhéu do farol
TERRA = ALT > 0
TERRA = ndimage.binary_opening(TERRA, iterations=2)
lab, nl = ndimage.label(TERRA)
tam = ndimage.sum(TERRA, lab, range(1, nl + 1))
# mantém a ilha e o ilhéu
keep = np.zeros(nl + 1, bool); keep[1:] = tam > 300
TERRA = keep[lab]
DIST_MAR = ndimage.distance_transform_edt(~TERRA)        # distância da água até a terra
DIST_TER = ndimage.distance_transform_edt(TERRA)         # distância da terra até a água
RECIFE = np.exp(-(((XX - 432) / 30) ** 2 + ((YY - 520) / 18) ** 2)) > .35

def costa_sul(x):
    col = np.nonzero(TERRA[:, int(x)])[0]; col = col[col > 400]
    return int(col.max()) if len(col) else 650

# pontos de interesse
CAMP = (240, costa_sul(240) - 34)
PIER_X = 300; PIER_Y = costa_sul(PIER_X)
FAROL = (int(ICX - 92), costa_sul(ICX - 92) - 10)
ROSTO = (240, 222)
NAVIO = (432, 520)
ILHEU = (420, 170)

def base():
    img = np.zeros((WH, WW, 3), np.float32)
    dith = ((XX.astype(int) + YY.astype(int)) % 2 == 0)
    nn = ruido(3, 6, 23)
    # mar profundo com faixas
    m = (~TERRA)
    img[m] = P['mar1']; img[m & (nn < -.25)] = P['mar0']; img[m & (nn > .35)] = P['mar2']
    raso = m & (DIST_MAR < 9 + 4 * ruido(2, 5, 3)) | (m & RECIFE)
    img[raso] = P['raso']; img[raso & (DIST_MAR < 4)] = P['raso2']
    img[m & (DIST_MAR >= 9) & (DIST_MAR < 11) & dith] = P['raso']
    # terra
    areia = TERRA & (DIST_TER < 9 + 5 * ruido(2, 5, 5))
    img[TERRA] = P['grama']
    img[TERRA & (nn > .25)] = P['grama3']; img[TERRA & (nn < -.3)] = P['grama2']
    img[TERRA & (ruido(2, 18, 9) > .55)] = P['grama4']
    img[areia] = P['areia']; img[areia & (nn > .3)] = P['areia2']
    img[areia & (DIST_TER < 2)] = P['areia3']
    # borda grama/areia pontilhada
    borda = TERRA & ~areia & ndimage.binary_dilation(areia, iterations=1) & dith
    img[borda] = P['areia2']
    # morro de pedra ao norte (onde fica o rosto)
    morro = TERRA & (np.sqrt(((XX - 240) / 62) ** 2 + ((YY - 228) / 46) ** 2) + .18 * nn < 1) & ~areia
    img[morro] = P['pedra']; img[morro & (nn > .2)] = P['pedra3']; img[morro & (nn < -.2)] = P['pedra2']
    img[morro & (ruido(2, 20, 31) > .5)] = P['musgo']
    pe = morro & ~np.roll(morro, -3, 0)            # borda do penhasco (sombra)
    img[pe] = P['pedra4']; img[morro & ~np.roll(morro, -1, 0)] = P['pedra4'] * .8
    # recife: pedras escuras na água rasa
    rp = RECIFE & ~TERRA & (ruido(2, 30, 41) > .45)
    img[rp] = P['pedra4']
    # ilhéu: pedra
    ilheu = TERRA & (np.hypot(XX - ILHEU[0], YY - ILHEU[1]) < 22)
    img[ilheu] = P['pedra2']; img[ilheu & (nn > .1)] = P['pedra']; img[ilheu & (DIST_TER < 2)] = P['areia3']
    return img, morro, areia

# ── sprites (mapa de caracteres → RGBA) ───────────────────────────────────────────────────────────
def spr(rows, pal):
    h, w = len(rows), max(len(r) for r in rows); a = np.zeros((h, w, 4), np.float32)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.' and c != ' ': a[y, x, :3] = pal[c]; a[y, x, 3] = 1
    return a

def blit(img, s, x, y, alpha=1.0):
    x, y = int(round(x)), int(round(y)); h, w = s.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(WW, x + w), min(WH, y + h)
    if x0 >= x1 or y0 >= y1: return
    sub = s[y0 - y:y1 - y, x0 - x:x1 - x]; a = sub[..., 3:4] * alpha
    img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - a) + sub[..., :3] * a

ARV = spr(['...ggGG....', '..gggGGGG..', '.ggggGGGGd.', 'gggGGGGGGdd', 'ggGGGGGGddd', 'GGGGGGGdddd', '.GGGGGdddd.', '..dGGGddd..',
           '...ddTdd...', '.....T.....', '....sTs....'], {'g': P['folha3'], 'G': P['folha'], 'd': P['folha2'], 'T': P['tronco'], 's': P['grama4']})
PINHO = spr(['....p....', '...pPP...', '..pPPPq..', '...pPP...', '..pPPPPq.', '.pPPPPPqq', '..pPPPqq.', '.pPPPPPqq', 'pPPPPPqqq', '....T....', '...sTs...'],
            {'p': P['pinho3'], 'P': P['pinho'], 'q': P['pinho2'], 'T': P['tronco2'], 's': P['grama4']})
PALMA = spr(['..L...L..', '.LLl.lLL.', 'LL.lLl.LL', 'L..lTl..L', '....T....', '....T....', '...T.....', '...T.....', '...T.....', '..ssT....'],
            {'L': P['palma'], 'l': P['palma2'], 'T': P['tronco'], 's': P['areia3']})
PEDRINHA = spr(['.aa.', 'abbc', '.cc.'], {'a': P['pedra3'], 'b': P['pedra'], 'c': P['pedra4']})

def arvores(img, livre):
    """espalha árvores (ordenadas por y) fora das áreas livres"""
    pts = []
    nn = ruido(3, 4, 77)
    for _ in range(30000):
        x, y = RNG.integers(4, WW - 12), RNG.integers(4, WH - 12)
        cx, cy = x + 5, y + 9
        if not TERRA[cy, cx] or livre[cy, cx]: continue
        if DIST_TER[cy, cx] < 5: continue
        dens = .75 + .35 * nn[cy, cx]
        if RNG.random() > dens: continue
        pts.append((y, x, DIST_TER[cy, cx]))
    pts.sort()
    ocup = np.zeros((WH, WW), bool)
    for y, x, d in pts:
        if ocup[y + 7:y + 10, x + 3:x + 7].any(): continue
        if d < 13: s = PALMA
        elif RNG.random() < .45: s = PINHO
        else: s = ARV
        blit(img, s, x, y); ocup[y + 5:y + 10, x + 1:x + 9] = True
    for _ in range(140):  # pedrinhas na praia
        x, y = RNG.integers(4, WW - 6), RNG.integers(4, WH - 6)
        if TERRA[y, x] and DIST_TER[y, x] < 6 and not livre[y, x]: blit(img, PEDRINHA, x, y)

# ── mistérios ────────────────────────────────────────────────────────────────────────────────────
def rosto(img, olhos=0.0, t=0.0):
    """rosto gigante esculpido no morro: testa, sobrancelhas, olhos fechados (ou acesos), nariz e boca"""
    cx, cy = ROSTO; w, h = 46, 50
    for y in range(-h // 2, h // 2):
        for x in range(-w // 2, w // 2):
            e = (x / (w / 2)) ** 2 + (y / (h / 2)) ** 2
            if e > 1: continue
            sh = .82 + .18 * (-x / (w / 2)) - .08 * (y / (h / 2))       # luz vindo da esquerda
            c = P['pedra3'] * sh
            if (x + y) % 2 == 0 and e > .8: c = P['pedra2']
            img[cy + y, cx + x] = c
    def ret(x0, y0, x1, y1, c):
        img[cy + y0:cy + y1, cx + x0:cx + x1] = c
    ret(-15, -11, -4, -9, P['pedra4']); ret(4, -11, 15, -9, P['pedra4'])          # sobrancelhas
    if olhos <= 0:
        ret(-13, -6, -6, -5, P['pedra4']); ret(6, -6, 13, -5, P['pedra4'])         # olhos fechados
    else:
        k = min(1.0, olhos)
        ret(-13, -7, -6, -7 + max(1, int(3 * k)), P['luz']); ret(6, -7, 13, -7 + max(1, int(3 * k)), P['luz'])
    ret(-2, -4, 2, 8, P['pedra']); ret(2, -4, 3, 8, P['pedra2']); ret(-3, 7, 4, 9, P['pedra2'])   # nariz
    ret(-9, 14, 9, 15, P['pedra4']); ret(-7, 15, 7, 16, P['pedra2'])                              # boca
    for (x, y) in [(-20, 6), (-18, 10), (16, -16), (19, 12), (-6, 20), (10, 19), (-19, -12), (0, -20), (3, -21)]:
        ret(x, y, x + 3, y + 2, P['musgo'])                                                         # musgo
    for k in range(6):                                                                              # rachaduras
        img[cy - 18 + k, cx + 9 + k // 2] = P['pedra4']

def navio(img, t, luz=1.0):
    """casco antigo encalhado no recife, inclinado, com o mastro quebrado e uma luz no porão"""
    cx, cy = NAVIO
    for y in range(-8, 9):
        for x in range(-20, 21):
            xr = x * math.cos(.35) + y * math.sin(.35); yr = -x * math.sin(.35) + y * math.cos(.35)
            e = (xr / 20) ** 2 + (yr / 7) ** 2
            if e <= 1:
                c = P['casco'] if e < .7 else P['casco2']
                if int(xr) % 5 == 0 and e < .7: c = P['casco2']
                if abs(yr) < 3 and xr > -14 and xr < 14 and e < .55: c = P['madeira2'] * .7  # convés aberto
                img[cy + y, cx + x] = c
    for k in range(-2, 10):  # mastro quebrado caído
        img[cy - 3 - k // 3, cx - 4 + k] = P['madeira']
    # luz no porão
    f = luz * (.75 + .25 * math.sin(t * 5.3) * math.sin(t * 2.1))
    img[cy - 2:cy + 2, cx + 2:cx + 7] = P['casco2'] * (1 - f) + P['luz'] * f
    # pedaços de madeira e espuma
    for (x, y) in [(-26, 6), (24, -9), (-22, -10), (27, 4)]:
        img[cy + y, cx + x:cx + x + 3] = P['madeira2']

def farol(img, x, y, aceso=0.0, alto=24):
    """farol listrado (branco e vermelho) com lanterna; x,y = base"""
    for k in range(alto):
        w = 3 + int(2 * k / alto)
        c = P['vermelho'] if (k // 4) % 2 == 0 else P['branco']
        img[y - k, x - w:x + w + 1] = c * np.array([.82, .82, .82]) if False else c
        img[y - k, x + w] = c * .75
    img[y - alto - 1, x - 3:x + 4] = P['pedra4']
    lc = P['pedra4'] * (1 - aceso) + P['luz'] * aceso
    img[y - alto - 4:y - alto - 1, x - 2:x + 3] = lc
    img[y - alto - 5, x - 3:x + 4] = P['telhado2']; img[y - alto - 6, x - 1:x + 2] = P['telhado2']

# ── acampamento e vila ───────────────────────────────────────────────────────────────────────────
def morador(cor, cabelo):
    pal = {'H': P[cabelo], 'S': P['pele'], 's': P['pele2'], 'C': P[cor], 'c': P[cor] * .78, 'P': P['calca']}
    corpo = ['.HHH.', 'HHHHH', '.SSs.', '.SSs.', 'CCCCc', 'SCCcS', '.CCc.']
    return [spr(corpo + p, pal) for p in (['.P.P.', '.P.P.'], ['.P..P', 'P...P'], ['.P.P.', '.P.P.'], ['P..P.', 'P...P'])]

MOR_A = morador('camisa1', 'cabelo1'); MOR_B = morador('camisa2', 'cabelo2')
MOR_V = [morador(c, h) for c, h in [('camisa1', 'cabelo2'), ('camisa2', 'cabelo1'), ('telhado3', 'cabelo1'), ('grama2', 'cabelo2'), ('madeira', 'cabelo1')]]
TORA = spr(['.mmmmmmM', 'mMMMMMMm', '.mmmmmmM'], {'m': P['madeira2'], 'M': P['madeira3']})

def fogueira(img, x, y, t, forte=1.0):
    blit(img, spr(['b.....b', '.bbbbb.', 'b.....b'], {'b': P['brasa']}), x - 3, y)
    f = int(t * 10) % 3
    chama = [['...1...', '..121..', '.12321.', '.23332.'], ['..1....', '..12.1.', '.12321.', '.23332.'], ['....1..', '.1.21..', '.12321.', '.23332.']][f]
    if forte > 0: blit(img, spr(chama, {'1': P['fogo1'], '2': P['fogo2'], '3': P['fogo3']}), x - 3, y - 3)
    for k in range(3):   # faíscas
        ph = (t * .9 + k * .37) % 1
        px, py = x + int(3 * math.sin(k * 2.1 + t * 3)), y - 4 - int(ph * 12)
        if 0 <= py < WH and ph < .8: img[py, px] = P['fogo1'] * (1 - ph) + img[py, px] * ph

def cabana(img, x, y, prog=2.0, t=0.0, janela=True, fumaca=True):
    """x,y = canto sup-esq; prog: 0 estacas, 0..1 paredes subindo, 2 pronta"""
    w, hp, ht = 22, 10, 7     # largura, altura da parede, altura do telhado
    if prog < 1e-3:
        for k in (0, 7, 14, 21): img[y + ht + hp - 3:y + ht + hp, x + k] = P['madeira2']
        img[y + ht + hp - 1, x:x + w] = P['madeira2'] * .9
        return
    linhas = hp if prog >= 1 else int(hp * prog)
    for r in range(linhas):
        yy = y + ht + hp - 1 - r
        img[yy, x + 1:x + w - 1] = P['madeira'] if r % 2 == 0 else P['madeira2']
        img[yy, x] = P['madeira3']; img[yy, x + w - 1] = P['madeira3']
    if prog >= 1:
        img[y + ht + 3:y + ht + hp, x + 9:x + 13] = P['tronco2']      # porta
        if janela:
            img[y + ht + 3:y + ht + 6, x + 16:x + 19] = P['luz']; img[y + ht + 4, x + 16:x + 19] = P['madeira2']
        for r in range(ht + 1):   # telhado
            m = int((ht - r) * 1.3)
            img[y + r, x - 1 + max(0, m - 7):x + w + 1 - max(0, m - 7)] = P['telhado'] if r % 2 else P['telhado3']
            img[y + r, x - 1 + max(0, m - 7)] = P['telhado2']; img[y + r, x + w - max(0, m - 7)] = P['telhado2']
        img[y - 3:y + 2, x + 16:x + 19] = P['pedra2']     # chaminé
        if fumaca:
            for k in range(5):
                ph = (t * .35 + k / 5) % 1; py = int(y - 4 - ph * 16); px = int(x + 17 + 2 * math.sin(ph * 6 + k))
                if 0 <= py: img[py, px] = P['fumaca'] * (1 - ph * .6) + img[py, px] * ph * .6

def pilha(img, x, y, n):
    for k in range(n): blit(img, TORA, x + (k % 2) * 2, y - k * 2)

def placa(img, x, y, t):
    img[y:y + 7, x + 3] = P['madeira2']
    img[y - 6:y, x:x + 8] = P['madeira3']; img[y - 6, x:x + 8] = P['madeira']
    q = spr(['.###.', '#...#', '...#.', '..#..', '.....', '..#..'][:6], {'#': P['tronco2']})
    blit(img, q[1:], x + 1, y - 6)

def barco(img, x, y, t, k=0):
    b = int(math.sin(t * 2 + k) > 0)
    blit(img, spr(['....v.......', '...vvv......', '..vvvvv.....', '.....m......', 'HHHHHHHHHHHh', '.HHHHHHHHHh.'],
                  {'v': P['vela'], 'm': P['madeira2'], 'H': P['casco'], 'h': P['casco2']}), x, y + b)

def pier(img, x, y, comp=46):
    for k in range(comp):
        img[y + k, x - 3:x + 4] = P['madeira3'] if k % 3 else P['madeira2']
    for k in range(0, comp, 8): img[y + k:y + k + 2, x - 4] = P['tronco2']; img[y + k:y + k + 2, x + 4] = P['tronco2']

def varal(img, x, y):
    img[y:y + 6, x] = P['madeira2']; img[y:y + 6, x + 14] = P['madeira2']
    for k in range(1, 14):
        img[y + 1 + (k % 3 == 0), x + k] = P['rede']
        if k % 2: img[y + 2:y + 4, x + k] = P['rede'] * .9
