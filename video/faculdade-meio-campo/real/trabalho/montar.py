"""Meio-Campo · "A Resenha" (versão com gravações reais). Trabalho acadêmico, marca FICTÍCIA.
Lê ../gravacoes (sem alterar), recorta o verde (HSV + limpeza morfológica + feather + despill), aplica o conteúdo da TV
(perspectiva por 4 cantos fixos) e do celular (quadrilátero detectado por quadro, trajetória suavizada), monta a linha do
tempo, coloca legendas, a faixa de advertência e o 18+ em TODOS os quadros e a tela final. Saída: video_mudo.mp4 (1920x1080, 30 fps, 30 s).
Uso: python3 montar.py                 (vídeo completo)
     python3 montar.py checagem        (1 quadro composto de cada plano em checagem/)
     python3 montar.py quadros 2,6,12  (quadros finais em checagem/)"""
import math, os, subprocess, sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
GRAV = os.path.join(AQUI, '..', 'gravacoes')
W, H, FPS, DUR = 1920, 1080, 30, 30.0
VERDE, OFF, MOST, CINZA = (15, 61, 46), (244, 241, 234), (224, 179, 58), (43, 43, 43)   # RGB
F = '/usr/share/fonts/opentype/inter/Inter-{}.otf'
def fonte(peso, tam): return ImageFont.truetype(F.format(peso), tam)

# ── linha do tempo: (início, fim, plano, início na fonte, extra) ───────────────────────────────
SEG = [
    (0.0, 4.0, 'plano1', 0.8, {}),
    (4.0, 9.0, 'plano2', 0.5, {'celular': True}),
    (9.0, 12.2, 'plano4a', 0.3, {'tv': 'lance'}),
    (12.2, 16.0, 'plano3', 0.0, {}),
    (16.0, 18.0, 'plano4a', 3.6, {'tv': 'fim'}),
    (18.0, 21.03, 'plano4b', 3.32, {}),
    (21.03, 23.0, 'plano4b', 7.50, {'zoom': 1.12}),          # corte no mesmo plano: punch-in leve para não "pular"
    (23.0, 30.0, 'final', 0, {}),
]
LEG = [  # legendas sincronizadas com o áudio (tempos de saída)
    (13.20, 16.00, None, '“Caraca… quase, moleque!”'),
    (19.30, 20.95, None, '“É, errei o palpite.”'),
    (20.72, 23.00, 'Amigo', '“Semana que vem é aqui em casa!”'),
    (23.50, 25.75, 'Locução', '“Meio-Campo. O jogo é melhor com limite.”'),
    (25.75, 29.70, 'Locução', '“Ministério da Fazenda adverte: apostar faz você perder dinheiro.”'),
]
T_SAI = 11.75             # bola passa raspando a trave e sai (sincronizado com o "uuuh" e com o corte para a reação)

# ── leitura de quadros ───────────────────────────────────────────────────────────────────────────
_caps = {}
def ler(plano, t):
    cap = _caps.get(plano)
    if cap is None:
        cap = _caps[plano] = [cv2.VideoCapture(os.path.join(GRAV, plano + '.mp4')), -1, None]
    n = int(round(t * 30))
    if n != cap[1] + 1:
        cap[0].set(cv2.CAP_PROP_POS_FRAMES, n)
    ok, f = cap[0].read()
    if not ok: f = cap[2]
    cap[1] = n; cap[2] = f
    return f.copy()

# ── chroma key ───────────────────────────────────────────────────────────────────────────────────
def mascara_verde(f, hmin=35, hmax=85, smin=80, vmin=60):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 0] >= hmin) & (hsv[..., 0] <= hmax) & (hsv[..., 1] >= smin) & (hsv[..., 2] >= vmin)).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
    return m

def maior_contorno(m, area_min=800):
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cs: return None
    c = max(cs, key=cv2.contourArea)
    return c if cv2.contourArea(c) >= area_min else None

def quad_de(c):
    """quadrilátero do contorno: approxPolyDP com 4 pontos ou, se falhar, o retângulo mínimo"""
    peri = cv2.arcLength(c, True)
    for eps in (0.02, 0.03, 0.04, 0.06):
        a = cv2.approxPolyDP(c, eps * peri, True)
        if len(a) == 4: return ordenar(a.reshape(4, 2).astype(np.float32))
    return ordenar(cv2.boxPoints(cv2.minAreaRect(c)).astype(np.float32))

def ordenar(p):
    """tl, tr, br, bl (o celular fica em pé: o lado curto de cima é o 'topo')"""
    c = p.mean(0); ang = np.arctan2(p[:, 1] - c[1], p[:, 0] - c[0]); p = p[np.argsort(ang)]   # sentido horário a partir de ~-180°
    # o canto com menor x+y é o topo-esquerdo
    i = np.argmin(p[:, 0] + p[:, 1]); p = np.roll(p, -i, 0)
    return p

def despill(f, zona, modo='max'):
    """remove o reflexo verde (só onde zona=1, com transição suave). modo 'max': G <= max(R,B) (bordas da tela);
    modo 'media': G <= (R+B)/2, o despill clássico para reflexo verde-amarelado na pele"""
    b, g, r = [f[..., i].astype(np.float32) for i in range(3)]
    lim = np.maximum(r, b) * 1.02 if modo == 'max' else (r + b) / 2 + 4
    g2 = np.where(g > lim, lim, g)
    z = zona.astype(np.float32)[..., None] if zona.ndim == 2 else zona
    out = f.astype(np.float32).copy(); out[..., 1] = g * (1 - z[..., 0]) + g2 * z[..., 0]
    return np.clip(out, 0, 255).astype(np.uint8)

def compor(f, conteudo, quad, mask, brilho=True):
    """aplica 'conteudo' (BGR) no quadrilátero, só onde a máscara verde é 1 (o que está na frente continua na frente)"""
    h, w = f.shape[:2]; ch, cw = conteudo.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), quad.astype(np.float32))
    wrp = cv2.warpPerspective(conteudo, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    a = cv2.GaussianBlur(mask, (5, 5), 1.2).astype(np.float32) / 255          # feather de ~1–2 px
    a = a[..., None]
    if brilho:   # tela "acesa": leve bloom e um reflexo diagonal sutil
        glow = cv2.GaussianBlur(wrp, (0, 0), 6)
        wrp = cv2.addWeighted(wrp, 0.9, glow, 0.14, 0)
        refl = np.zeros((h, w), np.float32)
        x0, y0 = quad[0]; x1, y1 = quad[2]
        yy, xx = np.mgrid[0:h, 0:w]
        u = ((xx - x0) / max(1, x1 - x0) + (yy - y0) / max(1, y1 - y0)) / 2
        refl = np.clip(1 - np.abs(u - 0.35) / 0.12, 0, 1) * 0.07
        wrp = np.clip(wrp.astype(np.float32) + refl[..., None] * 255, 0, 255)
    # despill só na imagem gravada (bordas e reflexos perto da tela), ANTES de compor: o conteúdo inserido mantém as cores
    zona = cv2.GaussianBlur(cv2.dilate(mask, np.ones((25, 25), np.uint8)), (0, 0), 6).astype(np.float32) / 255
    f = despill(f, zona)
    out = f.astype(np.float32) * (1 - a) + wrp.astype(np.float32) * a
    return np.clip(out, 0, 255).astype(np.uint8)

# ── TV: cantos fixos (mediana de vários quadros do plano4a) ──────────────────────────────────────
def cantos_tv():
    qs = []
    cap = cv2.VideoCapture(os.path.join(GRAV, 'plano4a.mp4'))
    for n in range(0, 170, 10):
        cap.set(cv2.CAP_PROP_POS_FRAMES, n); ok, f = cap.read()
        if not ok: break
        c = maior_contorno(mascara_verde(f), 20000)
        if c is not None: qs.append(quad_de(c))
    q = np.median(np.array(qs), 0)
    # expande 1,5 px para fora para cobrir a borda antialiased do verde (a máscara decide o que aparece)
    c = q.mean(0); q = c + (q - c) * 1.006
    return q.astype(np.float32)

# ── conteúdo da TV: transmissão fictícia (AZUL x VERDE, camisas lisas, sem escudos/nomes reais) ───
FW, FH = 1050, 680          # campo visto de cima (unidades = px)
def campo_base():
    img = Image.new('RGB', (FW + 200, FH + 200), (50, 140, 72)); d = ImageDraw.Draw(img)
    for i in range(14):
        d.rectangle([100 + i * 75, 100, 100 + (i + 1) * 75, 100 + FH], fill=(58, 156, 82) if i % 2 else (50, 144, 74))
    L = (236, 240, 232); o = 100
    d.rectangle([o, o, o + FW, o + FH], outline=L, width=4)
    d.line([o + FW / 2, o, o + FW / 2, o + FH], fill=L, width=4); d.ellipse([o + FW / 2 - 92, o + FH / 2 - 92, o + FW / 2 + 92, o + FH / 2 + 92], outline=L, width=4)
    for lado in (0, 1):
        x = o if lado == 0 else o + FW
        s = 1 if lado == 0 else -1
        def ret(xa, xb, h_, **k):
            x0_, x1_ = sorted([xa, xb]); d.rectangle([x0_, o + FH / 2 - h_, x1_, o + FH / 2 + h_], **k)
        ret(x, x + s * 165, 202, outline=L, width=4)
        ret(x, x + s * 55, 92, outline=L, width=4)
        ret(x, x - s * 22, 37, outline=(255, 255, 255), width=5)   # gol
    return img
CAMPO = campo_base()

def jogadores(t, lance):
    """posições (x, y no campo) de 7 azuis e 7 verdes; no lance os azuis atacam para a direita"""
    r = np.random.default_rng(5)
    base_az = r.uniform([300, 120], [620, 560], (7, 2)); base_vd = r.uniform([560, 120], [960, 560], (7, 2))
    u = lance
    az = base_az + np.array([300, 0]) * u + np.stack([np.sin(t * 1.3 + np.arange(7)), np.cos(t * 1.1 + np.arange(7))], 1) * 14
    vd = base_vd + np.array([90, 0]) * u + np.stack([np.sin(t * 1.2 + np.arange(7) * 2), np.cos(t + np.arange(7))], 1) * 12
    return az, vd

def bola(t):
    """trajetória do lance: conduz, cruza e finaliza raspando a trave de cima, saindo pela linha de fundo em T_SAI"""
    pts = [(9.0, 520, 360), (10.2, 760, 300), (10.9, 880, 420), (11.35, 930, 380), (T_SAI, FW + 2, 340 - 41), (12.2, FW + 60, 340 - 60)]
    for a, b in zip(pts, pts[1:]):
        if a[0] <= t <= b[0]:
            u = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u
    return pts[0][1:] if t < pts[0][0] else pts[-1][1:]

def placar(d, t, final=False):
    if final: return
    seg = int(83 * 60 + 41 + (t - 9.0))
    d.rounded_rectangle([34, 30, 470, 84], 10, fill=(12, 14, 16))
    d.rectangle([34, 30, 46, 84], fill=(47, 109, 181)); d.rectangle([458, 30, 470, 84], fill=(16, 78, 40))
    d.text((60, 57), 'AZUL  0 x 0  VERDE', font=fonte('Bold', 28), fill=(255, 255, 255), anchor='lm')
    d.rounded_rectangle([480, 30, 590, 84], 10, fill=(224, 179, 58)); d.text((535, 57), f'{seg // 60}:{seg % 60:02d}', font=fonte('Bold', 28), fill=(20, 20, 20), anchor='mm')

def tv_quadro(t, modo):
    """1280x720 (BGR): câmera de transmissão em ângulo, seguindo a bola"""
    CW_, CH_ = 1280, 720
    img = CAMPO.copy(); d = ImageDraw.Draw(img)
    lance = min(1.0, max(0.0, (t - 9.0) / 2.4)) if modo == 'lance' else 0.6
    az, vd = jogadores(t, lance)
    bx, by = bola(t) if modo == 'lance' else (700, 380)
    for (x, y), cor in [(p, (47, 109, 181)) for p in az] + [(p, (16, 78, 40)) for p in vd]:
        X, Y = x + 100, y + 100
        d.ellipse([X - 9, Y - 3, X + 9, Y + 6], fill=(20, 60, 30))                       # sombra
        d.rounded_rectangle([X - 8, Y - 27, X + 8, Y - 3], 4, fill=cor, outline=(245, 245, 245), width=2)   # camisa lisa
        d.ellipse([X - 6, Y - 38, X + 6, Y - 26], fill=(196, 150, 118))                  # cabeça
    d.ellipse([bx + 100 - 6, by + 100 - 6, bx + 100 + 6, by + 100 + 6], fill=(255, 255, 255), outline=(30, 30, 30), width=2)
    # janela da câmera seguindo a bola e perspectiva de transmissão
    cx = min(max(bx + 100, 360), FW + 200 - 360) if modo == 'lance' else 625
    cy = 100 + (by if modo == 'lance' else 340)
    jan = np.float32([[cx - 250, cy - 250], [cx + 250, cy - 250], [cx + 360, cy + 230], [cx - 360, cy + 230]])
    dst = np.float32([[0, 0], [CW_, 0], [CW_, CH_], [0, CH_]])
    arr = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
    out = cv2.warpPerspective(arr, cv2.getPerspectiveTransform(jan, dst), (CW_, CH_), flags=cv2.INTER_LINEAR)
    pil = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(pil)
    if modo == 'fim':
        pil = Image.blend(pil, Image.new('RGB', pil.size, (8, 12, 10)), 0.55); d = ImageDraw.Draw(pil)
        d.rounded_rectangle([140, 270, 1140, 450], 18, fill=(12, 14, 16))
        d.rectangle([140, 270, 160, 450], fill=(47, 109, 181)); d.rectangle([1120, 270, 1140, 450], fill=(16, 78, 40))
        d.text((640, 318), 'FIM DE JOGO', font=fonte('Bold', 40), fill=MOST, anchor='mm')
        d.text((640, 392), 'AZUL  0 x 1  VERDE', font=fonte('ExtraBold', 72), fill=(255, 255, 255), anchor='mm')
    else:
        placar(d, t)
    return cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR)

# ── tela do app (celular) ────────────────────────────────────────────────────────────────────────
def tela_app():
    w, h = 900, 1950
    img = Image.new('RGB', (w, h), VERDE); d = ImageDraw.Draw(img)
    # logo tipográfico no topo: "Meio | Campo" com a linha de meio-campo e o círculo central
    d.text((w / 2 - 22, 260), 'Meio', font=fonte('ExtraBold', 96), fill=OFF, anchor='rm')
    d.text((w / 2 + 22, 260), 'Campo', font=fonte('ExtraBold', 96), fill=OFF, anchor='lm')
    d.line([w / 2, 190, w / 2, 330], fill=MOST, width=8); d.ellipse([w / 2 - 18, 242, w / 2 + 18, 278], outline=MOST, width=7)
    d.ellipse([w / 2 - 120, 640, w / 2 + 120, 880], fill=(23, 82, 62))
    d.line([(w / 2 - 56, 760), (w / 2 - 12, 804), (w / 2 + 64, 716)], fill=MOST, width=26, joint='curve')
    d.text((w / 2, 1060), 'Seu limite', font=fonte('ExtraBold', 118), fill=OFF, anchor='mm')
    d.text((w / 2, 1200), 'mensal', font=fonte('ExtraBold', 118), fill=OFF, anchor='mm')
    d.text((w / 2, 1340), 'está ativo ✓', font=fonte('ExtraBold', 118), fill=MOST, anchor='mm')
    return cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
APP = tela_app()

# ── celular: quadriláteros por quadro, suavizados ────────────────────────────────────────────────
def trilha_celular(t0, t1):
    qs = []
    for n in range(int(round(t0 * 30)), int(round(t1 * 30)) + 1):
        f = ler('plano2', n / 30)
        m = mascara_verde(f, 38, 78, 70, 60)
        c = maior_contorno(m, 2500)
        qs.append(quad_de(c) if c is not None else None)
    # suavização temporal dos cantos: mediana (±4 quadros) descarta saltos da detecção (dedo na borda) + gaussiana (σ = 1,5 quadro)
    val = [i for i, q in enumerate(qs) if q is not None]
    A = np.array([qs[i] for i in val])
    med = np.array([np.median(A[max(0, k - 4):k + 5], 0) for k in range(len(A))])
    g = np.exp(-0.5 * (np.arange(-4, 5) / 1.5) ** 2)
    suav = np.array([(med[max(0, k - 4):k + 5] * g[max(0, 4 - k):9 - max(0, k + 5 - len(med))][:, None, None]).sum(0) / g[max(0, 4 - k):9 - max(0, k + 5 - len(med))].sum() for k in range(len(med))])
    out = [None] * len(qs)
    for k, i in enumerate(val): out[i] = suav[k]
    return out

# ── correção de cor leve e uniforme + escala para 1080p ───────────────────────────────────────────
def acabamento(f, zoom=1.0):
    if zoom != 1.0:
        h, w = f.shape[:2]; cw, ch = int(w / zoom), int(h / zoom); x0, y0 = (w - cw) // 2, (h - ch) // 2
        f = f[y0:y0 + ch, x0:x0 + cw]
    f = cv2.resize(f, (W, H), interpolation=cv2.INTER_LANCZOS4)
    f = cv2.addWeighted(f, 1.35, cv2.GaussianBlur(f, (0, 0), 1.6), -0.35, 0)            # nitidez leve depois do aumento
    x = f.astype(np.float32) / 255
    x = (x - 0.5) * 1.04 + 0.5                                                          # contraste +4%
    lum = x.mean(-1, keepdims=True); x = lum + (x - lum) * 1.06                          # saturação +6%
    x[..., 2] *= 1.012; x[..., 0] *= 0.99                                                # leve calor, igual em todos os planos
    return np.clip(x * 255, 0, 255).astype(np.uint8)

def desfocar(f, caixas):
    for x0, y0, x1, y1 in caixas:
        roi = f[y0:y1, x0:x1]
        if roi.size: f[y0:y1, x0:x1] = cv2.GaussianBlur(roi, (0, 0), 9)
    return f
MARCAS = {'plano2': [(905, 300, 1024, 576)],          # controle remoto com logo e botões de aplicativos
          'plano4a': [(196, 398, 246, 432)]}          # selo pequeno na caixa de som

# ── sobreposições (legenda, faixa, 18+) e tela final ─────────────────────────────────────────────
FAIXA = Image.new('RGBA', (W, H), (0, 0, 0, 0)); _d = ImageDraw.Draw(FAIXA)
_d.rectangle([0, 960, W, H], fill=(0, 0, 0, 255))
_d.text((W / 2 - 40, 1020), 'Ministério da Fazenda adverte: Apostar faz você perder dinheiro', font=fonte('Bold', 44), fill=(255, 255, 255, 255), anchor='mm')
_d.ellipse([1788, 978, 1872, 1062], fill=(255, 255, 255, 255)); _d.text((1830, 1020), '18+', font=fonte('ExtraBold', 34), fill=(0, 0, 0, 255), anchor='mm')

def legenda(d, t, y):
    for a, b, quem, txt in LEG:
        if a <= t < b:
            f1, f2 = fonte('Bold', 40), fonte('SemiBold', 40)
            pre = f'{quem}: ' if quem else ''
            wp = f1.getlength(pre); wt = f2.getlength(txt); x = W / 2 - (wp + wt) / 2
            d.rounded_rectangle([x - 26, y - 34, x + wp + wt + 26, y + 34], 10, fill=(0, 0, 0, 185))
            if pre: d.text((x, y), pre, font=f1, fill=MOST + (255,), anchor='lm')
            d.text((x + wp, y), txt, font=f2, fill=OFF + (255,), anchor='lm')

def tela_final(t):
    img = Image.new('RGB', (W, 960), VERDE); d = ImageDraw.Draw(img, 'RGBA')
    a = min(1.0, (t - 23.0) / 0.5)
    d.line([W / 2, 0, W / 2, 800], fill=OFF + (int(30 * a),), width=4); d.ellipse([W / 2 - 300, 60, W / 2 + 300, 660], outline=OFF + (int(30 * a),), width=4)
    cor = tuple(int(VERDE[i] + (OFF[i] - VERDE[i]) * a) for i in range(3))
    d.text((W / 2 - 30, 360), 'Meio', font=fonte('ExtraBold', 128), fill=cor, anchor='rm')
    d.text((W / 2 + 30, 360), 'Campo', font=fonte('ExtraBold', 128), fill=cor, anchor='lm')
    cm = tuple(int(VERDE[i] + (MOST[i] - VERDE[i]) * a) for i in range(3))
    d.line([W / 2, 262, W / 2, 452], fill=cm, width=9); d.ellipse([W / 2 - 24, 333, W / 2 + 24, 381], outline=cm, width=8)
    b = min(1.0, max(0.0, (t - 23.6) / 0.5))
    d.text((W / 2, 520), 'O jogo é melhor com limite.', font=fonte('SemiBold', 58), fill=tuple(int(VERDE[i] + (OFF[i] - VERDE[i]) * b) for i in range(3)), anchor='mm')
    c = min(1.0, max(0.0, (t - 24.4) / 0.3))                                             # texto legal: 24,4 → 30 s (5,6 s)
    ct = tuple(int(VERDE[i] + (OFF[i] - VERDE[i]) * c) for i in range(3))
    d.text((W / 2, 880), 'Meio-Campo Entretenimento Ltda. (fictícia) – CNPJ 00.000.000/0001-00 – Autorização SPA/MF nº 000/2026 (fictícia).', font=fonte('Medium', 26), fill=ct, anchor='mm')
    d.text((W / 2, 920), 'Proibido para menores de 18 anos. Jogue com responsabilidade.', font=fonte('SemiBold', 26), fill=ct, anchor='mm')
    out = np.zeros((H, W, 3), np.uint8); out[:960] = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
    return out

# ── quadro de saída ──────────────────────────────────────────────────────────────────────────────
TV_Q = None; CEL = None
def preparar():
    global TV_Q, CEL
    TV_Q = cantos_tv()
    s = SEG[1]; CEL = trilha_celular(s[3], s[3] + (s[1] - s[0]))

def plano_composto(plano, ts, extra, t):
    f = ler(plano, ts)
    if 'tv' in extra:
        m = mascara_verde(f, 40, 80, 120, 80)
        f = compor(f, tv_quadro(t, extra['tv']), TV_Q, m)
    if extra.get('celular'):
        q = CEL[min(len(CEL) - 1, int(round((ts - SEG[1][3]) * 30)))]
        protege = np.zeros(f.shape[:2], np.uint8)
        if q is not None: cv2.fillConvexPoly(protege, q.astype(np.int32), 255); protege = cv2.dilate(protege, np.ones((9, 9), np.uint8))
        f = despill(f, np.where(protege > 0, 0.0, 1.0).astype(np.float32), 'media')    # reflexo verde na pele (orelha, nuca, mão): só fora do celular
        if q is not None:
            m = mascara_verde(f, 38, 78, 70, 60)
            # só a área dentro do quadrilátero do celular (evita pegar outros verdes do cenário)
            poly = np.zeros_like(m); cv2.fillConvexPoly(poly, q.astype(np.int32), 255)
            poly = cv2.dilate(poly, np.ones((7, 7), np.uint8)); m = cv2.bitwise_and(m, poly)
            if m.sum() > 255 * 1500: f = compor(f, APP, q, m, brilho=False)
    f = desfocar(f, MARCAS.get(plano, []))
    if plano in ('plano1', 'plano3', 'plano4b'):
        for x0, y0, x1, y1 in rotulo_garrafa(f):          # desfoque com borda suave (sem retângulo duro)
            m = np.zeros(f.shape[:2], np.float32); cv2.ellipse(m, (int((x0 + x1) / 2), int((y0 + y1) / 2)), (int((x1 - x0) * .62), int((y1 - y0) * .6)), 0, 0, 360, 1, -1)
            m = cv2.GaussianBlur(m, (0, 0), 6)[..., None]
            f = (f * (1 - m) + cv2.GaussianBlur(f, (0, 0), 7) * m).astype(np.uint8)
    return f

def rotulo_garrafa(f):
    """garrafa azul no canto esquerdo: acha pela cor e desfoca o corpo inteiro (o rótulo pode ter marca)"""
    hsv = cv2.cvtColor(f[:, :160], cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 0] >= 100) & (hsv[..., 0] <= 125) & (hsv[..., 1] >= 90) & (hsv[..., 2] >= 50)).astype(np.uint8) * 255
    c = maior_contorno(cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), 300)
    if c is None: return []
    x, y, w, h = cv2.boundingRect(c)
    return [(max(0, x - 8), max(0, y - 30), min(f.shape[1], x + w + 10), min(f.shape[0], y + h + 8))]   # do gargalo à base

def quadro(t):
    for a, b, plano, s0, extra in SEG:
        if a <= t < b or (b == DUR and t >= a):
            break
    if plano == 'final':
        img = tela_final(t)
    else:
        img = acabamento(plano_composto(plano, s0 + (t - a), extra, t), extra.get('zoom', 1.0))
    # transições curtas: fade de 0,25 s na entrada da tela final; o resto em corte seco
    if 23.0 <= t < 23.25:
        prev = acabamento(plano_composto('plano4b', 7.5 + (t - 21.03), {}, t), 1.12)
        u = (t - 23.0) / 0.25; img = cv2.addWeighted(prev, 1 - u, img, u, 0)
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).convert('RGBA')
    camada = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(camada)
    legenda(d, t, 700 if t >= 23 else 905)
    pil = Image.alpha_composite(pil, camada)
    pil = Image.alpha_composite(pil, FAIXA)                                              # faixa por último: nada a cobre
    return cv2.cvtColor(np.asarray(pil.convert('RGB')), cv2.COLOR_RGB2BGR)

def main():
    preparar()
    os.makedirs(os.path.join(AQUI, 'checagem'), exist_ok=True)
    if len(sys.argv) > 1 and sys.argv[1] == 'checagem':
        for nome, t in [('plano1', 2.0), ('plano2_app', 6.2), ('plano2_virado', 8.8), ('plano4a_lance', 11.0), ('plano3', 13.5), ('plano4a_fim', 17.0), ('plano4b', 20.0), ('plano4b_zoom', 22.0), ('final', 27.0)]:
            cv2.imwrite(os.path.join(AQUI, 'checagem', f'{nome}.png'), quadro(t)); print('checagem', nome, flush=True)
        return
    if len(sys.argv) > 2 and sys.argv[1] == 'quadros':
        for s in sys.argv[2].split(','):
            cv2.imwrite(os.path.join(AQUI, 'checagem', f'final_{float(s):05.1f}s.png'), quadro(float(s)))
        return
    n = int(DUR * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', os.path.join(AQUI, 'video_mudo.mp4')], stdin=subprocess.PIPE)
    for i in range(n):
        ff.stdin.write(quadro(i / FPS).tobytes())
        if i % 90 == 0: print(round(i / FPS, 1), 's', flush=True)
    ff.stdin.close(); ff.wait(); print('fim', n, 'quadros')

if __name__ == '__main__':
    main()
