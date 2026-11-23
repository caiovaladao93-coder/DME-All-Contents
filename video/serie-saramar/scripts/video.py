"""SARAMAR · ep. 1 (9:16, 1080×1920, 30 fps). Pixel art gerada em código + câmera + legendas no tempo da narração.
Uso: python3 scripts/video.py                → out/saramar-ep1-mudo.mp4
     python3 scripts/video.py 0,8,20 <pasta> → quadros de teste em PNG"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mundo as M
from mundo import P, WW, WH

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1080, 1920, 30
DUR = 55.0
CX, CY = M.CAMP
PAL = json.load(open(f'{ROOT}/voz/palavras.json'))

# ── mundo estático ───────────────────────────────────────────────────────────────────────────────
BASE, MORRO, AREIA = M.base()
livre = MORRO.copy()
livre |= ((M.XX - CX) / 56) ** 2 + ((M.YY - (CY - 8)) / 34) ** 2 < 1            # clareira do acampamento
livre |= ((M.XX - M.FAROL[0]) / 16) ** 2 + ((M.YY - M.FAROL[1]) / 16) ** 2 < 1
livre |= (abs(M.XX - (CX + 10)) < 5) & (M.YY > CY) & (M.YY < CY + 40)             # trilha até a praia
# clareira: grama mais clara e terra batida perto do fogo
cl = ((M.XX - CX) / 50) ** 2 + ((M.YY - (CY - 8)) / 30) ** 2 < 1
BASE[cl & M.TERRA & ~AREIA] = P['grama3']
terra_batida = ((M.XX - CX) / 20) ** 2 + ((M.YY - (CY - 4)) / 12) ** 2 + .35 * M.ruido(2, 30, 5) < 1
BASE[terra_batida & ~AREIA] = P['grama'] * .5 + P['areia2'] * .5
BASE[terra_batida & ~AREIA & (M.ruido(2, 40, 8) > .4)] = P['areia2']
M.arvores(BASE, livre)
M.rosto(BASE)                                         # versão de olhos fechados (o quadro redesenha quando abre)
AGUA = ~M.TERRA
DASH = np.random.default_rng(3)
NDASH = 2200
DX = DASH.integers(0, WW - 4, NDASH); DY = DASH.integers(0, WH, NDASH); DPH = DASH.uniform(0, 6.28, NDASH); DSP = DASH.uniform(.6, 1.4, NDASH)
ok = AGUA[DY, DX] & AGUA[DY, np.minimum(WW - 1, DX + 3)] & (M.DIST_MAR[DY, DX] > 6); DX, DY, DPH, DSP = DX[ok], DY[ok], DPH[ok], DSP[ok]
ESP = AGUA & (M.DIST_MAR < 4)
VIN = None

# ── utilidades ───────────────────────────────────────────────────────────────────────────────────
def ease(u): u = min(1.0, max(0.0, u)); return u * u * (3 - 2 * u)
def lerp(a, b, u): return a + (b - a) * u

# câmera: (t, x, y, zoom, corte_antes)
K = [(0, 240, 455, 3.15, 0), (6.4, 240, 430, 3.35, 0), (7.7, 240, 226, 7.2, 0), (8.6, 244, 226, 7.6, 0),
     (9.7, M.NAVIO[0] - 6, M.NAVIO[1], 7.4, 0), (10.4, M.NAVIO[0] - 4, M.NAVIO[1], 7.8, 0),
     (11.4, M.ILHEU[0] - 10, M.ILHEU[1] - 4, 7.4, 0), (12.1, M.ILHEU[0] - 10, M.ILHEU[1] - 4, 7.6, 0),
     (14.6, CX, CY - 10, 6.2, 0), (16.9, CX, CY - 8, 9.5, 0), (18.2, CX + 2, CY - 6, 12.5, 0),
     (21.2, CX + 4, CY - 4, 13.5, 0), (25.0, CX, CY - 10, 13.5, 0), (27.4, CX, CY - 10, 10.5, 0), (29.0, CX, CY - 8, 9.5, 0),
     (29.9, M.PIER_X + 4, M.PIER_Y + 4, 9.5, 0), (30.5, M.PIER_X + 4, M.PIER_Y + 4, 9.5, 0),
     (31.2, M.FAROL[0] + 8, M.FAROL[1] + 6, 9.5, 0), (31.8, M.FAROL[0] + 8, M.FAROL[1] + 6, 9.5, 0),
     (32.6, CX, CY - 6, 12.0, 0), (33.3, CX, CY - 6, 12.0, 0), (35.4, CX + 30, CY - 120, 2.3, 0), (38.4, CX + 40, CY - 160, 2.25, 0),
     (38.45, CX, CY - 14, 5.6, 1), (41.7, CX, CY - 14, 4.9, 0),
     (41.75, CX - 4, CY - 30, 10.5, 1), (42.75, CX + 2, CY - 30, 11.0, 0),
     (42.8, M.PIER_X, M.PIER_Y + 26, 9.5, 1), (43.35, M.PIER_X, M.PIER_Y + 28, 9.8, 0),
     (43.4, CX - 40, M.PIER_Y - 6, 10.5, 1), (44.75, CX - 36, M.PIER_Y - 6, 11.0, 0),
     (44.8, M.FAROL[0], M.FAROL[1] - 12, 9.0, 1), (45.95, M.FAROL[0], M.FAROL[1] - 14, 9.6, 0),
     (46.0, M.NAVIO[0], M.NAVIO[1], 9.0, 1), (47.05, M.NAVIO[0] + 3, M.NAVIO[1], 12.0, 0),
     (47.1, M.ROSTO[0], M.ROSTO[1] + 2, 7.5, 1), (49.25, M.ROSTO[0], M.ROSTO[1], 10.5, 0),
     (49.3, CX + 6, CY - 10, 8.5, 1), (53.2, CX + 12, CY - 14, 11.0, 0), (DUR, CX + 12, CY - 14, 11.3, 0)]

def camera(t):
    for i in range(len(K) - 1):
        a, b = K[i], K[i + 1]
        if a[0] <= t < b[0]:
            if b[4]: return a[1:4]
            u = ease((t - a[0]) / (b[0] - a[0])); return tuple(lerp(a[j], b[j], u) for j in (1, 2, 3))
    return K[-1][1:4]

def luz(t):
    """(multiplicador ambiente RGB, força do brilho da fogueira)"""
    dia, tarde, noite, poente, misterio = (1, 1, 1), (1.0, .86, .74), (.26, .32, .55), (.86, .68, .62), (.55, .6, .78)
    def mix(a, b, u): return tuple(lerp(a[k], b[k], u) for k in range(3))
    if t < 12: return dia, 0.0
    if t < 35.4: return mix(dia, tarde, ease((t - 12) / 3)), .55 * ease((t - 12) / 3)
    if t < 38.45: return mix(tarde, noite, ease((t - 35.4) / 1.4)), 1.25
    if t < 44.8: return (1, .98, .94), 0.0
    if t < 46.0: return poente, .6
    if t < 49.3: return misterio, .4
    return poente, .8

# ── estado do acampamento ────────────────────────────────────────────────────────────────────────
HUT = (CX - 11, CY - 26)
PILHA = (CX + 16, CY - 12)
PRAIA = (CX + 8, M.costa_sul(CX + 10) - 10)

def anda(a, b, t, t0, t1):
    u = min(1.0, max(0.0, (t - t0) / (t1 - t0))); return a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0 < u < 1

def presente(img, t, final=False):
    fogo_forte = 1.0
    prog = 2.0 if (final or t >= 25.1) else (0.0 if t < 22.8 else min(1.0, (t - 22.8) / 2.2))
    M.cabana(img, *HUT, prog=prog, t=t, janela=t >= 25.6 or final, fumaca=t >= 25.4 or final)
    ntoras = 3 + (t >= 21.0 or final)
    M.pilha(img, PILHA[0], PILHA[1], ntoras)
    M.fogueira(img, CX, CY, t, fogo_forte)
    # morador A (vermelho): junta madeira 18.2–21.0
    ax, ay, an = CX - 10, CY - 5, False; carrega = False
    if not final:
        if 18.2 <= t < 19.3: ax, ay, an = anda((CX - 10, CY - 5), PRAIA, t, 18.2, 19.3)
        elif 19.3 <= t < 19.6: ax, ay = PRAIA
        elif 19.6 <= t < 21.0: ax, ay, an = anda(PRAIA, (PILHA[0] - 6, PILHA[1] + 2), t, 19.6, 21.0); carrega = True
        elif 21.0 <= t < 25.4: ax, ay = PILHA[0] - 6, PILHA[1] + 2
    if not final and 18.2 <= t < 19.4:
        M.blit(img, M.TORA, PRAIA[0] + 1, PRAIA[1] + 7)          # tora trazida pelo mar
    fr = int(t * 8) % 4 if an else 0
    M.blit(img, M.MOR_A[fr], ax, ay)
    if carrega: M.blit(img, M.TORA, ax - 1, ay - 3)
    # morador B (azul): limpa a areia 21.2–22.6, ergue paredes 22.8–25.1
    bx, by, bn = CX + 6, CY - 5, False
    if not final:
        if 21.2 <= t < 22.7: bx, by, bn = CX - 4 + 6 * math.sin((t - 21.2) * 5), CY - 14, True
        elif 22.7 <= t < 25.2: bx, by = HUT[0] + 23 + (t * 2 % 1 > .5), HUT[1] + 12
    fr = int(t * 8) % 4 if bn else 0
    M.blit(img, M.MOR_B[fr], bx, by)
    if not final and 21.2 <= t < 22.7:      # vassoura e poeira
        img[int(by) + 6:int(by) + 9, int(bx) + 5] = P['madeira3']
        for k in range(3):
            ph = (t * 3 + k / 3) % 1; img[int(by) + 8 - int(ph * 3), int(bx) + 6 + k * 2] = P['areia3']
    if not final and 22.7 <= t < 25.2 and int(t * 6) % 2 == 0:   # martelada: lasca de luz
        img[int(by) + 4, int(bx) - 1] = P['branco']
    if final:   # o terreno vazio da próxima cabana
        lx, ly = CX + 20, CY - 30
        for k in range(0, 20, 2): img[ly + 14, lx + k] = P['madeira2']; img[ly, lx + k] = P['madeira2']
        for k in range(0, 14, 2): img[ly + k, lx] = P['madeira2']; img[ly + k, lx + 19] = P['madeira2']
        M.placa(img, lx + 6, ly + 10, t)

CASAS = [(CX - 40, CY - 30), (CX + 22, CY - 34), (CX - 58, CY - 8), (CX + 36, CY - 6), (CX - 30, CY - 58), (CX + 8, CY - 60), (CX - 74, CY - 34), (CX + 50, CY - 40)]
T_CASA = [38.7 + i * .38 for i in range(len(CASAS))]

def futuro(img, t):
    M.cabana(img, *HUT, prog=2.0, t=t)
    for (x, y), tc in zip(CASAS, T_CASA):
        if t >= tc:
            M.cabana(img, x, y, prog=2.0, t=t + x)
    M.pilha(img, PILHA[0], PILHA[1], 4)
    M.fogueira(img, CX, CY, t)
    M.pier(img, M.PIER_X, M.PIER_Y - 4, 46)
    for k, (bx, by) in enumerate([(M.PIER_X + 6, M.PIER_Y + 14), (M.PIER_X - 18, M.PIER_Y + 26), (M.PIER_X + 6, M.PIER_Y + 34)]):
        M.barco(img, bx, by, t, k)
    # pescadores no píer e na praia, com varais de rede
    for k, (px, py) in enumerate([(M.PIER_X - 2, M.PIER_Y + 36), (CX - 44, M.PIER_Y - 14), (CX - 30, M.PIER_Y - 12)]):
        M.blit(img, M.MOR_V[k][0], px, py)
        bal = math.sin(t * 3 + k) * 1.5
        for j in range(7): img[int(py + 4 + j * .9 + (j == 6) * bal), int(px + 5 + j)] = P['madeira2']    # vara
    M.varal(img, CX - 46, M.PIER_Y - 24); M.varal(img, CX - 26, M.PIER_Y - 24)
    M.farol(img, M.FAROL[0], M.FAROL[1] + 4, aceso=1.0 if t >= 44.8 else 0.0, alto=30)
    # moradores andando pela vila
    for k in range(5):
        u = (t * .12 + k * .21) % 1; x = CX - 60 + 120 * u; y = CY + 6 + (k % 2) * 5
        M.blit(img, M.MOR_V[k][int(t * 8 + k) % 4], x, y)

# ── luz e água por quadro ────────────────────────────────────────────────────────────────────────
GX, GY = np.mgrid[0:WH, 0:WW]
def brilho(cx, cy, r):
    d = np.hypot(GX - cy, GY - cx) / r
    g = np.clip(1 - d, 0, 1)
    return np.floor(g * 4) / 4                          # anéis em degraus (pixel art)

GLOW_F = brilho(CX, CY - 2, 46)
GLOW_FAROL = brilho(M.FAROL[0], M.FAROL[1] - 26, 34)
GLOW_ILHEU = brilho(M.ILHEU[0], M.ILHEU[1] - 16, 30)
GLOW_NAVIO = brilho(M.NAVIO[0] + 4, M.NAVIO[1], 26)
GLOW_ROSTO = brilho(M.ROSTO[0], M.ROSTO[1] - 6, 30)
QUENTE = np.array([1.0, .62, .28], np.float32)

def mundo_quadro(t):
    img = BASE.copy()
    # água: ondinhas que acendem e somem, espuma que respira na costa
    on = np.sin(t * DSP * 1.6 + DPH) > .55
    for k in range(3): img[DY[on], DX[on] + k] = P['onda']
    esp = ESP & (M.DIST_MAR < 1.6 + 1.3 * np.sin(t * 1.3 + M.XX * .07 + M.YY * .05))
    img[esp] = P['espuma']
    # mistérios
    M.navio(img, t, luz=1.0 if 46 <= t < 47.1 else .6)
    M.farol(img, M.ILHEU[0], M.ILHEU[1] + 6, aceso=farol_ilheu(t), alto=20)
    if 47.1 <= t < 49.3: M.rosto(img, olhos=(t - 47.75) / .5 if t >= 47.75 else 0, t=t)
    if 38.45 <= t < 46.0: futuro(img, t)
    else: presente(img, t, final=t >= 49.3)
    amb, gf = luz(t)
    org = img.copy()
    emis = np.zeros((WH, WW), bool)
    for c in ('luz', 'fogo1', 'fogo2', 'fogo3'): emis |= np.abs(img - P[c]).sum(-1) < 30
    img *= np.array(amb, np.float32)
    lum = GLOW_F * gf
    if 38.45 <= t < 46 and t >= 44.8: lum = lum + GLOW_FAROL * 1.2
    fi = farol_ilheu(t)
    if fi > 0: lum = lum + GLOW_ILHEU * fi * 1.3
    if 46 <= t < 47.1: lum = lum + GLOW_NAVIO * 1.8
    elif t < 12: lum = lum + GLOW_NAVIO * .5
    if 47.75 <= t < 49.3: lum = lum + GLOW_ROSTO * min(1, (t - 47.75) / .5) * 1.1
    img = img * (1 + lum[..., None] * .45 * QUENTE) + lum[..., None] * 22 * QUENTE
    img[emis] = org[emis] * 1.08
    return img

def farol_ilheu(t):
    if 36.6 <= t < 37.5: return math.sin(math.pi * (t - 36.6) / .9) ** 2          # pisca uma vez à noite
    if t >= 49.3: return .5 + .5 * math.sin(t * 2.2) ** 8
    return 0.0

# ── textos ───────────────────────────────────────────────────────────────────────────────────────
FONTE = f'{ROOT}/fonts/Silkscreen-Bold.ttf'
_fc = {}
def fonte(sz):
    if sz not in _fc: _fc[sz] = ImageFont.truetype(FONTE, sz)
    return _fc[sz]
CREME, OURO, CONTORNO = (246, 236, 206), (246, 204, 92), (24, 22, 30)

def pedacos():
    """agrupa a narração em legendas de 1 a 3 palavras; a palavra mais longa fica dourada"""
    ch, cur = [], []
    for i, p in enumerate(PAL):
        cur.append(p)
        prox = PAL[i + 1] if i + 1 < len(PAL) else None
        fim = p['w'][-1] in '.,…' or p['w'].endswith('...') or prox is None or prox['a'] - p['b'] > .28 or len(cur) >= 3 or sum(len(q['w']) for q in cur) >= 14
        if fim: ch.append(cur); cur = []
    out = []
    for i, c in enumerate(ch):
        a = c[0]['a']; b = ch[i + 1][0]['a'] if i + 1 < len(ch) else DUR
        b = min(b, c[-1]['b'] + .9)
        ws = [q['w'].strip('.,…').upper() for q in c]
        chave = max(range(len(ws)), key=lambda j: len(ws[j]))
        out.append((a - .05, b, ws, chave))
    return out
LEG = pedacos()

def texto(d, x, y, partes, sz, alpha=1.0):
    """partes: [(texto, cor)] centralizado em x"""
    f = fonte(sz); esp = f.getlength(' ')
    larg = sum(f.getlength(s) for s, _ in partes) + esp * (len(partes) - 1); cx = x - larg / 2
    for s, c in partes:
        d.text((cx, y), s, font=f, fill=c + (int(255 * alpha),), anchor='lm', stroke_width=max(4, sz // 9), stroke_fill=CONTORNO + (int(255 * alpha),))
        cx += f.getlength(s) + esp

def sobrepor(fr, t):
    camada = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(camada)
    # cabeçalho
    a = min(1, t / .3) * (1 - ease((t - 10.9) / .5))
    if a > 0:
        texto(d, 540, 300, [('ESSA PÁGINA TEM', CREME)], 58, a)
        texto(d, 540, 430, [('2', OURO)], 190, a)
        texto(d, 540, 560, [('SEGUIDORES', CREME)], 58, a)
    for a0, b0, ws, ch in LEG:
        if a0 <= t < b0:
            al = min(1, (t - a0) / .08) * min(1, (b0 - t) / .08)
            texto(d, 540, 1500, [(w, OURO if j == ch else CREME) for j, w in enumerate(ws)], 64, al)
    # "+1" sobre cada cabana nova
    if 38.45 <= t < 41.7:
        cx, cy, z = camera(t)
        for (x, y), tc in zip(CASAS, T_CASA):
            u = t - tc
            if 0 <= u < 1.1:
                sx = (x + 11 - cx) * z + W / 2; sy = (y - 4 - cx * 0 - cy) * z + H / 2 - u * 60
                texto(d, sx, sy, [('+1', OURO)], 54, min(1, (1.1 - u) / .3))
    return Image.alpha_composite(fr.convert('RGBA'), camada).convert('RGB')

# ── quadro ───────────────────────────────────────────────────────────────────────────────────────
VY, VX = np.mgrid[0:H, 0:W]
VIN = (1 - .5 * np.clip(np.hypot((VX - W / 2) / (W * .62), (VY - H / 2) / (H * .6)) - .45, 0, 1) ** 1.5).astype(np.float32)[..., None]
SX, SY = np.arange(W) - W / 2, np.arange(H) - H / 2

def quadro(t):
    img = mundo_quadro(t)
    cx, cy, z = camera(t)
    xs = np.clip(np.floor(cx + SX / z).astype(int), 0, WW - 1); ys = np.clip(np.floor(cy + SY / z).astype(int), 0, WH - 1)
    fr = img[ys][:, xs] * VIN
    # transição suave entre noite e dia (fade a partir do preto) e no fim do vídeo
    for tc in (38.45,):
        if tc <= t < tc + .25: fr *= (t - tc) / .25
    if t > DUR - .6: fr *= max(0, (DUR - t) / .6) * .3 + .7
    fr = Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8))
    return sobrepor(fr, t)

def main():
    if len(sys.argv) > 1:
        pasta = sys.argv[2] if len(sys.argv) > 2 else f'{ROOT}/out/testes'; os.makedirs(pasta, exist_ok=True)
        for s in sys.argv[1].split(','):
            quadro(float(s)).save(f'{pasta}/q{float(s):05.1f}.png'); print('quadro', s, flush=True)
        return
    n = int(DUR * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', f'{ROOT}/out/saramar-ep1-mudo.mp4'], stdin=subprocess.PIPE)
    for f in range(n):
        ff.stdin.write(np.asarray(quadro(f / FPS)).tobytes())
        if f % 150 == 0: print(round(f / FPS, 1), 's', flush=True)
    ff.stdin.close(); ff.wait()
    json.dump({'dur': DUR, 'casas': T_CASA, 'legendas': [(a, b, ' '.join(ws)) for a, b, ws, _ in LEG]}, open(f'{ROOT}/out/eventos-ep1.json', 'w'), ensure_ascii=False, indent=1)
    print('fim', n, 'quadros')

if __name__ == '__main__':
    main()
