"""SARAMAR ep. 3 "A árvore" · trilha e efeitos ORIGINAIS (numpy) + mixagem com a narração.
O mesmo violão em Ré maior; pulso de 96 BPM enquanto as cabanas sobem (cada uma toca uma nota, rua por rua); na árvore
gigante a música suspende (acorde parado e um zumbido grave quando a fechadura acende); píer com tábuas e gaivotas
discretas; o farol sobe com pedras e um sino; à noite, grilos e um tom de mistério na luz da cachoeira; o mapa com
papel e carimbos; fecho com "Comenta!" e o violão calmo.
Saídas: out/trilha-ep3.wav, out/Saramar-Ep3.mp4 (-14 LUFS) e out/marcas-som-ep3.txt."""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
EV = json.load(open(f'{ROOT}/out/eventos-ep3.json')); DUR = EV['dur']; FIM_VOZ = EV['fim_voz']
N = int(DUR * SR); MU = np.zeros((N, 2)); FX = np.zeros((N, 2)); R = np.random.default_rng(53); MARCAS = []
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
c0 = E['casas'][0] - .6
dedilhado(0.0, c0, 72, .5); MARCAS.append((0.0, 'violão dedilhado em Ré maior (72 BPM), o tema de Saramar'))
dedilhado(c0, E['porta'] - .3, 96, .55, cheio=True); MARCAS.append((c0, 'as cabanas sobem: a trilha ganha pulso (96 BPM)'))
put(MU, pad([45, 52, 57, 60], E['machado'][1] - E['porta'] + 1.2) * .8, E['porta'] - .3, .45)
n = int((E['machado'][1] - E['porta'] + .8) * SR); tt = ar(n)
put(MU, np.sin(2 * np.pi * 41.2 * tt) * np.minimum(1, tt / .5) * np.minimum(1, (n / SR - tt) / .5), E['porta'], .4)
MARCAS.append((E['porta'], 'a árvore da porta: a música para, acorde suspenso e zumbido grave quando a fechadura acende'))
dedilhado(E['machado'][1] + .2, E['noite'] - .3, 96, .55, cheio=True); MARCAS.append((E['machado'][1] + .2, '"Então, a vila desviou dela.": o pulso volta'))
put(MU, pad([38, 45, 50, 53], E['mapa'][0] - E['noite'] + .5) * .8, E['noite'], .4); MARCAS.append((E['noite'], 'anoitece: acorde menor, sem pulso'))
put(MU, pad([38, 45, 50, 53], E['mapa'][1] - E['mapa'][0]) * .8, E['mapa'][0], .4)
dedilhado(E['cta'], DUR, 72, .5); MARCAS.append((E['cta'], 'volta o violão calmo, à noite, no farol'))

# ── ambiente ─────────────────────────────────────────────────────────────────────────────────────
tt = ar(N); saida = np.clip((FIM_VOZ + 1.2 - tt) / 1.2, 0, 1)
fora_mapa = ~((tt >= E['mapa'][0]) & (tt < E['mapa'][1]))
mar = filt(ruido(N), 120, 900) * (.5 + .5 * np.sin(2 * np.pi * tt / 6.5) ** 2)
put(FX, mar * saida * fora_mapa * .08, 0)
noite = np.clip((tt - E['noite']) / 1.0, 0, 1) * fora_mapa
grilo = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .6) * (np.sin(2 * np.pi * .9 * tt) > .2)
put(FX, grilo * noite * saida * .025, 0, pan=.3)
MARCAS.append((E['noite'], 'noite: grilos e o mar mais baixo'))

# ── efeitos ──────────────────────────────────────────────────────────────────────────────────────
put(FX, plim(86), .05, .25); put(FX, plim(93), .2, .18); MARCAS.append((0.05, 'plim no número de seguidores (100)'))
a, b = E['chegada']
for k in range(6): put(FX, baque(60, .4), a + .6 + k * .25, .3, (k - 2.5) * .3)
for k in range(30): put(FX, filt(ruido(int(.08 * SR)), 300, 2000) * np.exp(-ar(int(.08 * SR)) / .03), a + 1.0 + k * .1, .1, R.uniform(-.6, .6))
MARCAS.append((a, '6 barcos encostam e os 50 sobem a praia (passos na areia)'))
def estalo():
    n = int(.35 * SR); t = ar(n); return filt(ruido(n), 700, 4000) * np.exp(-t / .05) * (1 + np.sin(2 * np.pi * 37 * t))
for i, tf in enumerate(E['quedas']):
    pan = R.uniform(-.7, .7)
    if i % 3 == 0:
        for c in range(3): put(FX, toc(520 + 40 * (i % 5)), tf - .75 + c * .26, .2, pan)
    if i % 2 == 0: put(FX, estalo(), tf, .15, pan); put(FX, baque(55, .4), tf + .5, .2, pan)
MARCAS.append((E['quedas'][0], f'{len(E["quedas"])} árvores derrubadas no machado (duas levas: mata adentro e o desvio)'))
for r_ in E['ruas']:
    for k in range(8): put(FX, toc(1800), r_ - .4 + k * .12, .18, (k % 2 - .5) * .6)
MARCAS.append((E['ruas'][0], 'estacas batidas nas ruas novas'))
ESC = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]
for i, tc in enumerate(E['casas']):
    col = i % 10 if i < 30 else (i - 30) % 5; rua = i // 10 if i < 30 else 3 + (i - 30) // 5; pan = (col - 4.5) / 5.5
    for c in range(2): put(FX, toc(1100 + 60 * (i % 4)), tc - E['obra'] + .2 + c * .3, .08, pan)
    put(FX, plim(ESC[col] + 2 * min(rua, 4)) * .9, tc, .18, pan)
MARCAS.append((E['casas'][0], '50 cabanas novas: marteladas e uma nota por cabana (sobe rua por rua)'))
put(FX, plim(86), E['cem'] + .1, .22); put(FX, plim(90), E['cem'] + 1.3, .2); put(FX, plim(93), E['cem'] + 1.6, .22)
MARCAS.append((E['cem'], '"Cem moradores. Cem cabanas.": três notas'))
a, b = E['pier']
for k in range(10): put(FX, toc(700 + 30 * (k % 3)), a + .2 + k * (b - a - .3) / 10, .18, .2)
MARCAS.append((a, 'píer: tábuas pregadas uma a uma'))
put(FX, whoosh(.8), E['barcos'] - .3, .12); put(FX, plim(78), E['barcos'], .15)
for k in range(4): put(FX, filt(ruido(int(.25 * SR)), 900, 4000) * np.sin(np.pi * ar(int(.25 * SR)) / .25), E['redes'] + k * .2, .08)
MARCAS.append((E['barcos'], 'barcos amarrados e redes estendidas'))
a, b = E['farol']
for k in range(7): put(FX, baque(110 + 10 * k, .25), a + k * (b - a) / 7, .2, -.3)
n = int(2.5 * SR); t_ = ar(n); sino = (np.sin(2 * np.pi * hz(81) * t_) + .5 * np.sin(2 * np.pi * hz(81) * 2.76 * t_)) * np.exp(-t_ / .9)
put(FX, sino, b, .22, -.3); MARCAS.append((a, 'o farol sobe pedra por pedra e toca um sino'))
a, b = E['casa_farol']
for k in range(5): put(FX, baque(95, .22), a + k * (b - a) / 5, .16, -.2)
put(FX, plim(74), E['sem_dono'], .2); MARCAS.append((E['sem_dono'], '"Ainda sem dono.": placa e @???'))
n = int(3.0 * SR); t_ = ar(n); mis = (np.sin(2 * np.pi * hz(69) * t_) + np.sin(2 * np.pi * hz(70) * t_)) * .5 * np.minimum(1, t_ / .6) * np.exp(-t_ / 1.6)
put(FX, mis, E['luz'] - .1, .3); MARCAS.append((E['luz'], 'a luz atrás da cachoeira: dois tons que batem (mistério)'))
a, b = E['mapa']
put(FX, papel(.9), a, .3); MARCAS.append((a, 'o mapa verdadeiro desenrola (papel)'))
for k, tp in enumerate(E['pinos']): put(FX, carimbo(), tp, .3, (k % 3 - 1) * .4)
put(FX, carimbo(), a + .5, .45); MARCAS.append((a + .5, '"100 OK" carimbado na vila; a cachoeira em vermelho: FALTAM 900'))
put(FX, plim(81), E['comenta'], .25); put(FX, plim(86), E['comenta'] + .15, .2); MARCAS.append((E['comenta'], '"COMENTA!" sobre o farol'))
put(FX, plim(81), E['fim'] + .1, .2); MARCAS.append((E['fim'], 'lotes vazios com a placa "?" e @SEU_NOME_AQUI?'))

# ── mixagem ──────────────────────────────────────────────────────────────────────────────────────
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/voz/ep3/narracao.wav', '-ar', str(SR), '-ac', '1', '-f', 'f64le', f'{ROOT}/out/voz3.raw'], check=True)
voz = np.fromfile(f'{ROOT}/out/voz3.raw'); os.remove(f'{ROOT}/out/voz3.raw')
VOZ = np.zeros(N); VOZ[:min(N, len(voz))] = voz[:N]
env = np.convolve(np.abs(VOZ), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .5 * np.clip(env / (env.max() * .25), 0, 1)
musica = (MU * .55 + FX) * duck[:, None]
musica /= np.abs(musica).max() + 1e-9
mix = musica * .32 + VOZ[:, None] / (np.abs(VOZ).max() + 1e-9) * .8
fo = int(1.6 * SR); mix[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/trilha-ep3.wav'], input=mix.tobytes(), check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/saramar-ep3-mudo.mp4', '-i', f'{ROOT}/out/trilha-ep3.wav',
                '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
                f'{ROOT}/out/Saramar-Ep3.mp4'], check=True)
with open(f'{ROOT}/out/marcas-som-ep3.txt', 'w') as f:
    f.write('MARCAS DE SOM · SARAMAR EP. 3 "A ÁRVORE" (narração: Saramar Narrador, tomada ep3-1 com pausas encurtadas)\n\n')
    for a, b, s in EV['legendas']: MARCAS.append((a, f'fala: "{s}"'))
    for t, s in sorted(MARCAS): f.write(f'{t:6.2f}  {s}\n')
print('trilha ep3 ok', round(DUR, 2), 's')
