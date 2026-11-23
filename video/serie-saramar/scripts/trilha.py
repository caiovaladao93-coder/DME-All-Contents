"""SARAMAR ep. 1 · trilha e efeitos ORIGINAIS (numpy) + mixagem com a narração.
Trilha: violão dedilhado (Karplus-Strong) em Ré maior, calmo no começo; à noite fica só o grave; silêncio antes de
"A cada novo seguidor"; depois a trilha volta mais cheia (pulso de 96 BPM) para a vila crescer; mistério com um drone grave;
fecho quente. Efeitos: mar, fogueira, tora caindo, vassoura, marteladas, "plim" a cada cabana nova, grilos, porta de pedra.
Saídas: out/trilha-ep1.wav, out/Saramar-Ep1.mp4 (-14 LUFS) e out/marcas-som-ep1.txt."""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
EV = json.load(open(f'{ROOT}/out/eventos-ep1.json')); DUR = EV['dur']
_V, _N = EV['velho_para_novo']
def Nt(t): return float(np.interp(t, _V, _N))          # tempo da v1 → tempo da narração atual
MONT, MAPA = EV['mont'], EV['mapa']; WP = {int(k): v for k, v in EV['palavras'].items()}
N = int(DUR * SR); MU = np.zeros((N, 2)); FX = np.zeros((N, 2)); R = np.random.default_rng(5); MARCAS = []
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
    t = ar(n); y = y / (np.abs(y).max() + 1e-9) * np.exp(-t / 1.4) * np.minimum(1, t / .002)
    _pc[k] = y; return y
def pad(ms, d):
    n = int(d * SR); t = ar(n); s = sum(np.sin(2 * np.pi * hz(m) * t + .3 * np.sin(2 * np.pi * .2 * t)) for m in ms) / len(ms)
    return s * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
def ruido(n): return R.standard_normal(n)

# ── trilha ───────────────────────────────────────────────────────────────────────────────────────
# progressão em Ré maior: D – Bm – G – A (cada acorde 2 compassos a 72 BPM no começo)
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
            n = int(.05 * SR); put(MU, filt(ruido(n), 5000, 14000) * np.exp(-ar(n) / .012), t + b / 2, g * .25, .3)
        t += b / 2; k += 1

dedilhado(.0, Nt(35.4), 72, .5)
MARCAS.append((0.0, 'violão dedilhado em Ré maior (72 BPM) e mar'))
# noite: só um acorde grave e longo
put(MU, pad([38, 45, 50, 57], 3.0) * .7, Nt(35.3), .45); MARCAS.append((Nt(35.4), 'anoitece: o violão some, fica um acorde grave e os grilos'))
MARCAS.append((Nt(37.95), 'silêncio antes de "A cada novo seguidor"'))
dedilhado(Nt(38.45), Nt(46.0), 96, .55, cheio=True); MARCAS.append((Nt(38.45), 'amanhece: a trilha volta cheia, com pulso a 96 BPM'))
# mistério: drone grave e sino distante
n = int(3.4 * SR); tt = ar(n); put(MU, (np.sin(2 * np.pi * 36.7 * tt) + .5 * np.sin(2 * np.pi * 55 * tt + np.sin(2 * np.pi * .5 * tt))) * np.minimum(1, tt / .3) * np.minimum(1, (3.4 - tt) / .6), Nt(46.0), .5)
for k, m in enumerate([74, 77, 81]): put(MU, corda(m, 2.5, .3), Nt(46.1) + k * .9, .35, (k - 1) * .5)
MARCAS.append((Nt(46.0), 'mistério: drone grave e notas menores'))
dedilhado(MAPA[0], DUR, 72, .5); MARCAS.append((Nt(49.3), 'volta o violão calmo do começo (loop)'))

# ── ambiente ─────────────────────────────────────────────────────────────────────────────────────
n = N; tt = ar(n)
mar = filt(ruido(n), 150, 1800) * (.5 + .5 * np.sin(2 * np.pi * tt / 6.5) ** 2)
amb_mar = np.where((tt >= Nt(46.0)) & (tt < Nt(49.3)), .4, 1.0)
put(FX, mar * amb_mar * .08, 0)
fogo = filt(ruido(n), 800, 6000) * (R.random(n) < .0009).astype(float) * 2.5
fogo = np.convolve(fogo, np.exp(-ar(600) / .002), 'same')
env_fogo = ((tt >= Nt(12.5)) & (tt < Nt(41.7))) | (tt >= Nt(49.3))
put(FX, fogo * env_fogo * .35, 0)
MARCAS.append((Nt(12.5), 'estalos da fogueira'))
# grilos à noite
grilo = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .6) * (np.sin(2 * np.pi * 1.1 * tt) > 0)
put(FX, grilo * ((tt >= Nt(35.6)) & (tt < Nt(38.4))) * .03, 0)

# ── efeitos ──────────────────────────────────────────────────────────────────────────────────────
def baque(f=80, d=.35):
    n = int(d * SR); t = ar(n); return np.sin(2 * np.pi * np.cumsum(f * np.exp(-t / .05) + f * .5) / SR) * np.exp(-t / .09) + filt(ruido(n), 200, 2500) * np.exp(-t / .02) * .5
def toc(f=1400):
    n = int(.12 * SR); t = ar(n); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .02) + filt(ruido(n), 1500, 6000) * np.exp(-t / .006)) * .8
def plim(m):
    n = int(1.2 * SR); t = ar(n); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .2)) * np.exp(-t / .45) * np.minimum(1, t / .002)
def whoosh(d=.6):
    n = int(d * SR); t = ar(n); return filt(ruido(n), 400, 5000) * np.sin(np.pi * t / d) ** 2

put(FX, plim(86), .05, .25); put(FX, plim(93), .2, .18)                     # abertura: "2"
MARCAS.append((0.05, 'plim no número de seguidores'))
for tc in (6.5, 9.0, 10.6, 12.2):
    put(FX, whoosh(.7), Nt(tc), .12)
MARCAS.append((Nt(6.5), 'sopros de vento nas passagens de câmera'))
put(FX, filt(ruido(int(.25 * SR)), 300, 3000) * np.exp(-ar(int(.25 * SR)) / .05), Nt(19.3), .35)      # pega a tora na areia
put(FX, baque(70), Nt(21.0), .7); put(FX, toc(600), Nt(21.05), .3); MARCAS.append((Nt(21.0), 'tora cai na pilha'))
for k in range(9): put(FX, filt(ruido(int(.18 * SR)), 1500, 7000) * np.sin(np.pi * ar(int(.18 * SR)) / .18), Nt(21.25) + k * .16, .12, (k % 2 - .5) * .4)
MARCAS.append((Nt(21.2), 'vassoura na areia'))
for k in range(14): put(FX, toc(1100 + 150 * (k % 3)), Nt(22.8) + k * .165, .45, .2)
MARCAS.append((Nt(22.8), 'marteladas enquanto as paredes sobem'))
put(FX, baque(55, .6), Nt(25.1), .7); put(FX, plim(74), Nt(25.15), .3); put(FX, plim(78), Nt(25.3), .25); put(FX, plim(81), Nt(25.45), .25)
MARCAS.append((Nt(25.1), 'telhado: a cabana fica pronta (baque e acorde)'))
put(FX, whoosh(1.6), Nt(33.3), .18); MARCAS.append((Nt(33.3), 'zoom de afastar sobre o mar'))
put(FX, plim(69) * .7, Nt(36.7), .3); MARCAS.append((Nt(36.7), 'o farol do ilhéu pisca: nota grave'))
for k, tc in enumerate(EV['casas']):
    put(FX, plim([74, 76, 78, 81, 83, 86, 88, 90][k]), tc, .32, (k % 3 - 1) * .4); put(FX, toc(900), tc, .25)
MARCAS.append((EV['casas'][0], f'{len(EV["casas"])} "plins" que sobem: uma cabana nova (+1) para cada um'))
for tc in (41.75, 42.8, 43.4, 44.8, 46.0, 47.1, 49.3): put(FX, whoosh(.35), Nt(tc) - .12, .1)
n = int(1.6 * SR); t = ar(n)
pedra = filt(ruido(n), 60, 600) * np.minimum(1, t / .3) * np.exp(-t / .9)
put(FX, pedra, Nt(47.75), .9); put(FX, plim(62), Nt(47.8), .35); MARCAS.append((Nt(47.75), 'o rosto de pedra abre os olhos: ronco grave'))
put(FX, plim(81), Nt(49.35), .2); MARCAS.append((Nt(49.3), 'volta ao acampamento: o terreno vazio com a placa "?"'))

# ── montagem dos lugares e mapa de metas ────────────────────────────────────────────────────────
c = {n: (a, b) for n, a, b in EV['cenas']}
for n, (a, b) in c.items(): put(FX, whoosh(.4), a - .15, .14)
a, b = c['cachoeira']; n = int((b - a) * SR); put(FX, filt(ruido(n), 300, 7000) * np.minimum(1, ar(n) / .2) * np.minimum(1, (b - a - ar(n)) / .2), a, .16)
MARCAS.append((a, 'cachoeira: água caindo'))
a, b = c['templo']
for k, m in enumerate([81, 88, 93]): put(FX, plim(m) * .8, a + .2 + k * .45, .18, (k - 1) * .5)
MARCAS.append((a, 'templo: runa acende (sino cristalino)'))
a, b = c['pedras']; n = int(1.6 * SR); put(FX, np.sin(2 * np.pi * 110 * ar(n)) * np.sin(np.pi * ar(n) / 1.6) * (1 + .3 * np.sin(2 * np.pi * 7 * ar(n))), WP[38], .3)
MARCAS.append((WP[38], 'pedras: zumbido grave quando a runa acende'))
a, b = c['arvore']; n = int(.9 * SR); t_ = ar(n)
put(FX, filt(np.sign(np.sin(2 * np.pi * np.cumsum(90 + 140 * t_) / SR)), 200, 2500) * np.sin(np.pi * t_ / .9) * .5, WP[44], .3)
MARCAS.append((WP[44], 'árvore: rangido de porta'))
a, b = c['mar']; n = int(2.6 * SR); t_ = ar(n)
put(FX, np.sin(2 * np.pi * np.cumsum(70 - 25 * t_ / 2.6) / SR) * np.sin(np.pi * t_ / 2.6) * (1 + .4 * np.sin(2 * np.pi * 3 * t_)), WP[50] - .2, .5)
i0, i1 = int(a * SR), int(b * SR); MU[i0:i1] *= np.linspace(1, .25, i1 - i0)[:, None]
MARCAS.append((WP[50], 'fundo do mar: a trilha baixa e a criatura geme grave'))
for k, tp in enumerate(EV['pinos']): put(FX, plim([74, 76, 78, 81, 83, 86, 88, 90, 93][k % 9]), tp, .26, (k % 3 - 1) * .4)
MARCAS.append((EV['pinos'][0], f'mapa de metas: {len(EV["pinos"])} pinos com "plim"'))

# ── mixagem ──────────────────────────────────────────────────────────────────────────────────────
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/voz/narracao.wav', '-ar', str(SR), '-ac', '1', '-f', 'f64le', f'{ROOT}/out/voz.raw'], check=True)
voz = np.fromfile(f'{ROOT}/out/voz.raw'); os.remove(f'{ROOT}/out/voz.raw')
VOZ = np.zeros(N); VOZ[:min(N, len(voz))] = voz[:N]
env = np.convolve(np.abs(VOZ), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .5 * np.clip(env / (env.max() * .25), 0, 1)
i0, i1 = int(Nt(37.95) * SR), int(Nt(38.45) * SR); MU[i0:i1] *= np.linspace(1, 0, i1 - i0)[:, None] * 0; FX[i0:i1] *= .15
musica = (MU * .55 + FX) * duck[:, None]
musica /= np.abs(musica).max() + 1e-9
mix = musica * .32 + VOZ[:, None] / (np.abs(VOZ).max() + 1e-9) * .8
fo = int(.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/trilha-ep1.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-ep1.txt', 'w') as f:
    f.write('MARCAS DE SOM · SARAMAR EP. 1 (narração: Saramar Narrador, tomada ep1v3-2 com pausas encurtadas)\n\n')
    for a, b, s in EV['legendas']: MARCAS.append((a, f'fala: "{s}"'))
    for t, s in sorted(MARCAS): f.write(f'{t:6.2f}  {s}\n')
print('trilha ok', round(DUR, 2), 's')
