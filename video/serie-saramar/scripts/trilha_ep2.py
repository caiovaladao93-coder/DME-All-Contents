"""SARAMAR ep. 2 "A vila" (v2) · trilha e efeitos ORIGINAIS (numpy) + mixagem com a narração.
Violão dedilhado em Ré maior (o tema do ep. 1), que ganha pulso (96 BPM) quando as cabanas sobem; cada cabana toca uma nota
de uma escala que sobe rua por rua; estacas, cordas e enxadas na planta; a garrafa: rolha e papel; o mapa antigo: papel
desenrolando, pinos com carimbo e um drone grave no fundo do mar; fecho quente com a fogueira.
Saídas: out/trilha-ep2.wav, out/Saramar-Ep2.mp4 (-14 LUFS) e out/marcas-som-ep2.txt."""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
EV = json.load(open(f'{ROOT}/out/eventos-ep2.json')); DUR = EV['dur']; FIM_VOZ = EV['fim_voz']
N = int(DUR * SR); MU = np.zeros((N, 2)); FX = np.zeros((N, 2)); R = np.random.default_rng(52); MARCAS = []
def ar(n): return np.arange(n) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def filt(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
_pc = {}
def corda(m, d=2.2, brilho=.5):
    k = (m, d, brilho)
    if k in _pc: return _pc[k]
    p = max(2, int(round(SR / hz(m)))); n = int(d * SR); buf = R.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(0, n, p):
        seg = buf.copy(); y[i:i + p] = seg[:min(p, n - i)]; buf = .997 * (brilho * seg + (1 - brilho) * np.roll(seg, -1))
    y = filt(y, 40, 5000)                                   # tira o chiado do ataque da corda
    t = ar(n); y = y / (np.abs(y).max() + 1e-9) * np.exp(-t / 1.4) * np.minimum(1, t / .004)
    _pc[k] = y; return y
def pad(ms, d):
    n = int(d * SR); t = ar(n); s = sum(np.sin(2 * np.pi * hz(m) * t + .3 * np.sin(2 * np.pi * .2 * t)) for m in ms) / len(ms)
    return s * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
def ruido(n): return R.standard_normal(n)


PROG = [(50, [62, 66, 69, 74]), (47, [59, 62, 66, 71]), (43, [55, 59, 62, 67]), (45, [57, 61, 64, 69])]
def dedilhado(t0, t1, bpm, g, cheio=False):
    b = 60 / bpm; t, k = t0, 0
    while t < t1:
        raiz, notas = PROG[(k // 8) % 4]
        if k % 8 == 0:
            put(MU, corda(raiz - 12, 3.0, .45), t, g * .9, 0)
            put(MU, pad([raiz, *notas[:3]], 8 * b / 2 + .5) * .5, t, g * .5)
        nota = [notas[0], notas[2], notas[1], notas[3], notas[2], notas[1], notas[3], notas[2]][k % 8]
        put(MU, corda(nota, 1.8, .5), t + R.uniform(0, .012), g * (.55 if k % 2 else .7), (k % 3 - 1) * .35)
        if cheio and k % 2 == 0:
            n = int(.12 * SR); put(MU, np.sin(2 * np.pi * np.cumsum(90 * np.exp(-ar(n) / .03) + 45) / SR) * np.exp(-ar(n) / .06), t, g * (.9 if k % 4 == 0 else .4))
            n = int(.05 * SR); put(MU, filt(ruido(n), 2500, 6500) * np.exp(-ar(n) / .012), t + b / 2, g * .15, .3)
        t += b / 2; k += 1

def baque(f=80, d=.35):
    n = int(d * SR); t = ar(n); return np.sin(2 * np.pi * np.cumsum(f * np.exp(-t / .05) + f * .5) / SR) * np.exp(-t / .09) + filt(ruido(n), 200, 2500) * np.exp(-t / .02) * .5
def toc(f=1400):
    n = int(.12 * SR); t = ar(n); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .02) + filt(ruido(n), 1500, 6000) * np.exp(-t / .006)) * .8
def plim(m):
    n = int(1.2 * SR); t = ar(n); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .2)) * np.exp(-t / .45) * np.minimum(1, t / .002)
def whoosh(d=.6):
    n = int(d * SR); t = ar(n); return filt(ruido(n), 400, 5000) * np.sin(np.pi * t / d) ** 2


def papel(d=.7):
    n = int(d * SR); t = ar(n); return filt(ruido(n), 600, 4500) * np.sin(np.pi * t / d) * (1 + .5 * np.sin(2 * np.pi * 23 * t))
def carimbo():
    n = int(.25 * SR); t = ar(n); return np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t / .03) + 60) / SR) * np.exp(-t / .06) + filt(ruido(n), 300, 2500) * np.exp(-t / .015) * .4

E = EV
# ── trilha ───────────────────────────────────────────────────────────────────────────────────────
dedilhado(0.0, E['casas'][0], 72, .5); MARCAS.append((0.0, 'violão dedilhado em Ré maior (72 BPM), o tema de Saramar'))
dedilhado(E['casas'][0], E['tudo'][1], 96, .55, cheio=True); MARCAS.append((E['casas'][0], 'as cabanas sobem: a trilha ganha pulso (96 BPM)'))
put(MU, pad([50, 57, 62, 66], 2.6) * .8, E['tudo'][1] - .4, .5)
put(MU, pad([45, 52, 57, 60], E['mapa'][0] - E['garrafa'][0] + 1) * .7, E['garrafa'][0], .35); MARCAS.append((E['garrafa'][0], 'garrafa: a música para, fica um acorde suspenso'))
fa, fb, fc = E['focos']
put(MU, pad([38, 45, 50, 53], fc - E['mapa'][0]) * .8, E['mapa'][0], .4)
n = int((E['mapa'][1] - fc + .3) * SR); tt = ar(n)
put(MU, (np.sin(2 * np.pi * 36.7 * tt) + .5 * np.sin(2 * np.pi * 55 * tt + np.sin(2 * np.pi * .5 * tt))) * np.minimum(1, tt / .4) * np.minimum(1, (n / SR - tt) / .5), fc - .2, .55)
MARCAS.append((E['mapa'][0], 'mapa antigo: acorde menor; no fundo do mar, drone grave'))
dedilhado(E['fim'], DUR, 72, .5); MARCAS.append((E['fim'], 'volta o violão calmo; anoitece na vila'))

# ── ambiente ─────────────────────────────────────────────────────────────────────────────────────
tt = ar(N); saida = np.clip((FIM_VOZ + 1.2 - tt) / 1.2, 0, 1)
mar = filt(ruido(N), 120, 900) * (.5 + .5 * np.sin(2 * np.pi * tt / 6.5) ** 2)
fora_mapa = ~((tt >= E['mapa'][0]) & (tt < E['mapa'][1]))
put(FX, mar * saida * fora_mapa * .08, 0)
fogo = filt(ruido(N), 500, 2800) * (R.random(N) < .0006).astype(float) * 2.5
fogo = np.convolve(fogo, np.exp(-ar(600) / .002), 'same')
put(FX, fogo * fora_mapa * saida * .22, 0)

# ── efeitos ──────────────────────────────────────────────────────────────────────────────────────
put(FX, plim(86), .05, .25); put(FX, plim(93), .2, .18); MARCAS.append((0.05, 'plim no número de seguidores (50)'))
a, b = E['chegada']
for k in range(3): put(FX, baque(60, .4), a + .8 + k * .35, .35, (k - 1) * .5)
for k in range(24): put(FX, filt(ruido(int(.08 * SR)), 300, 2000) * np.exp(-ar(int(.08 * SR)) / .03), a + 1.2 + k * .13, .1, R.uniform(-.6, .6))
MARCAS.append((a, 'barcos encostam e os 48 sobem a praia (passos na areia)'))
def estalo():
    n = int(.35 * SR); t = ar(n); return filt(ruido(n), 700, 4000) * np.exp(-t / .05) * (1 + np.sin(2 * np.pi * 37 * t))
a, b = E['corte']
for i, tf in enumerate(E['quedas']):
    pan = R.uniform(-.7, .7)
    if i % 3 == 0:
        for c in range(3): put(FX, toc(520 + 40 * (i % 5)), tf - .75 + c * .26, .22, pan)       # machadadas
    if i % 2 == 0: put(FX, estalo(), tf, .16, pan); put(FX, baque(55, .4), tf + .5, .22, pan)    # estala e cai
MARCAS.append((a, f'corte: machadadas, estalos e {len(E["quedas"])} árvores caindo; as toras vão para as pilhas'))
for k in range(8): put(FX, filt(ruido(int(.3 * SR)), 400, 3000) * np.exp(-ar(int(.3 * SR)) / .08), a + 2.5 + k * .6, .1, R.uniform(-.6, .6))
a, b = E['ruas']
for k in range(14): put(FX, toc(1800), a + .2 + k * (b - a - .4) / 14, .22, (k % 2 - .5) * .6)
MARCAS.append((a, 'estacas batidas: as ruas são marcadas'))
a, b = E['lotes']
for k in range(10): put(FX, filt(ruido(int(.2 * SR)), 800, 4000) * np.sin(np.pi * ar(int(.2 * SR)) / .2), a + .2 + k * (b - a - .4) / 10, .12)
MARCAS.append((a, 'cordas esticadas: os lotes são divididos'))
ESC = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]      # pentatônica de Ré: cada coluna uma nota, cada rua sobe um degrau
for i, tc in enumerate(E['casas']):
    rua, col = i // 10, i % 10; pan = (col - 4.5) / 5.5
    for c in range(3): put(FX, toc(1100 + 60 * (i % 4)), tc - E['obra'] + .3 + c * .4, .1, pan)    # marteladas da obra
    put(FX, plim(ESC[col] + 2 * min(rua, 4)) * .9, tc, .2, pan)
MARCAS.append((E['casas'][0], '50 cabanas: marteladas na obra e, quando cada uma fica pronta, uma nota (escala que sobe rua por rua)'))
put(FX, plim(74), E['praca'], .25)
for k in range(5): put(FX, filt(ruido(int(.15 * SR)), 300, 2200) * np.exp(-ar(int(.15 * SR)) / .05), E['poco'] - .8 + k * .32, .2, (k % 2 - .5) * .6)   # pá
put(FX, baque(90, .3), E['poco'] + .8, .4); put(FX, plim(81), E['poco'] + .85, .2)
for k in range(6): put(FX, filt(ruido(int(.12 * SR)), 400, 2500) * np.exp(-ar(int(.12 * SR)) / .04), E['horta'] + k * .12, .12)
MARCAS.append((E['praca'], 'praça, poço (água) e horta (terra mexida)'))
a, b = E['tudo']; put(FX, plim(86), a + .1, .22); put(FX, plim(90), a + 1.3, .2); put(FX, plim(93), a + 2.6, .22)
MARCAS.append((a, '"Cinquenta moradores. Cinquenta cabanas.": três notas que fecham a vila'))
put(FX, whoosh(1.6), E['sobra'] - .1, .2); MARCAS.append((E['sobra'], '"E ainda sobra muita ilha": a câmera se afasta (sopro)'))
a, b = E['garrafa']
n = int(.15 * SR); put(FX, np.sin(2 * np.pi * np.cumsum(900 - 500 * ar(n) / .15) / SR) * np.exp(-ar(n) / .05), E['rolha'], .4)
MARCAS.append((E['rolha'], 'garrafa: a rolha sai ("plóc")'))
a, b = E['mapa']
put(FX, papel(.9), a, .3); MARCAS.append((a, 'o mapa desenrola (papel)'))
for k, tp in enumerate(E['pinos']): put(FX, carimbo(), tp, .45, (k % 3 - 1) * .4)
MARCAS.append((E['pinos'][0], f'{len(E["pinos"])} pinos de meta carimbados no mapa (metas ×100)'))
for f_ in E['focos']: put(FX, whoosh(.5), f_ - .2, .14)
put(FX, plim(57), fc + .2, .3); MARCAS.append((fc, 'fundo do mar: nota grave e o drone'))
put(FX, plim(81), E['fim'] + .1, .2); MARCAS.append((E['fim'], 'último lote vazio, com a placa "?" e @SEU_NOME_AQUI?'))

# ── mixagem ──────────────────────────────────────────────────────────────────────────────────────
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/voz/ep2/narracao.wav', '-ar', str(SR), '-ac', '1', '-f', 'f64le', f'{ROOT}/out/voz2.raw'], check=True)
voz = np.fromfile(f'{ROOT}/out/voz2.raw'); os.remove(f'{ROOT}/out/voz2.raw')
VOZ = np.zeros(N); VOZ[:min(N, len(voz))] = voz[:N]
env = np.convolve(np.abs(VOZ), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .5 * np.clip(env / (env.max() * .25), 0, 1)
musica = (MU * .55 + FX) * duck[:, None]
musica /= np.abs(musica).max() + 1e-9
mix = musica * .32 + VOZ[:, None] / (np.abs(VOZ).max() + 1e-9) * .8
fo = int(1.6 * SR); mix[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
i0 = int((FIM_VOZ - .2) * SR); cauda = mix[i0:].copy()
for c in range(2):
    X = np.fft.rfft(cauda[:, c]); f = np.fft.rfftfreq(len(cauda), 1 / SR); X[f > 3500] *= .15; X[f > 6000] = 0
    cauda[:, c] = np.fft.irfft(X, len(cauda))
xf = np.minimum(1, np.arange(len(cauda)) / (.3 * SR))[:, None]; mix[i0:] = mix[i0:] * (1 - xf) + cauda * xf
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/trilha-ep2.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-ep2.txt', 'w') as f:
    f.write('MARCAS DE SOM · SARAMAR EP. 2 "A VILA" (narração: Saramar Narrador, tomada ep2v2-2 com pausas encurtadas)\n\n')
    for a, b, s in EV['legendas']: MARCAS.append((a, f'fala: "{s}"'))
    for t, s in sorted(MARCAS): f.write(f'{t:6.2f}  {s}\n')
print('trilha ep2 ok', round(DUR, 2), 's')
