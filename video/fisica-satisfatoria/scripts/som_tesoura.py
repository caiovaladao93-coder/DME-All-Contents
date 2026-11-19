"""Som ORIGINAL (numpy) da TESOURA a partir de out/eventos-tesoura.json.
A tesoura dá um SNIP a cada 1 s, no tempo da música (120 BPM, um snip a cada 2 tempos): "shhk" de lâminas raspando + estalo seco do
fechamento. Os cortes de cada snip tocam juntos um acorde/arpejo rápido de "tsk" afinados (mais notas quanto mais bolas cortadas).
Cada vez que o total dobra toca um sino que sobe. Base: baixo e chimbal leves no tempo, batida mais cheia na segunda metade.
Emperra = rangido metálico; trincas; silêncio; QUEBROU = parafuso estoura (ping), boom, crash, pedaços e acorde. Loop = ding.
Saída: out/som-tesoura.wav e out/marcas-som-tesoura.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-tesoura.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(31); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def tsk(m):
    n = int(.4 * SR); t = S.ar(n); f0 = S.hz(m)
    tom = (np.sin(2 * np.pi * f0 * t) + .4 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / .05)) * np.exp(-t / .14)
    return (tom * .7 + S.filt(R.standard_normal(n), 5000, 14000) * np.exp(-t / .006) * .7) * np.minimum(1, t / .0008)
def snip():
    """lâminas raspando (chiado que sobe, 0,25 s) + estalo seco no fechamento"""
    n = int(.3 * SR); t = S.ar(n); u = t / t[-1]
    rasp = S.filt(R.standard_normal(n), 3000, 11000) * (u ** 1.5) * (1 - u) ** .3 * 1.4
    m = int(.04 * SR); tc = S.ar(m)
    estalo = (S.filt(R.standard_normal(m), 1500, 9000) * np.exp(-tc / .004) + np.sin(2 * np.pi * 3400 * tc) * np.exp(-tc / .01) * .6)
    out = np.zeros(n + m); out[:n] += rasp * .35; out[n - int(.01 * SR):n - int(.01 * SR) + m] += estalo
    return out
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_tr, t_ex = ev('cheio'), ev('trava'), ev('explode'); T0 = D['t0']
cortes = np.array([e[0] for e in EVS if e[1] == 'corte'])
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# base no tempo: snips nos tempos 1 e 3 (a cada 1 s); baixo Lám–Fá–Dó–Sol por compasso de 2 s
ACORDES = [(45, 57, 60, 64), (41, 53, 57, 60), (48, 55, 60, 64), (43, 55, 59, 62)]
t, k = 0.0, 0
while t < (t_tr or DUR):
    ch = ACORDES[k % 4]; put(MU, S.acorde([m + 12 for m in ch[1:]], 2.6) * .7, t, .18, 0)
    for j in range(4):
        tb = t + j * .5
        nn = int(.45 * SR); put(MU, np.sin(2 * np.pi * S.hz(ch[0]) * S.ar(nn)) * np.exp(-S.ar(nn) / .25), tb, .24)
        put(MU, S.hat(), tb + .25, .08, .3)
        if t > 30 and j % 2 == 1: put(MU, S.kick(), tb, .3)
    t += 2.0; k += 1
# snips
snips = [e for e in EVS if e[1] == 'snip']
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
for i, (ts_, _, nb) in enumerate(snips):
    if t_ch is not None and ts_ > t_ch: break
    put(FX, snip(), ts_ - .27, .5, 0)
    c = cortes[(cortes > ts_ - .35) & (cortes <= ts_ + .05)]
    base = min(len(ESC) - 6, int(np.log2(nb + 1)))
    for j, tc in enumerate(c[:6]):
        put(FX, tsk(ESC[base + j % 6]), ts_ - .3 + (j * .045), .16, (j % 5 - 2) / 3)
MARCAS.append((snips[0][0] if snips else T0, 'primeiro SNIP: "shhk" + estalo; cada snip toca um arpejo com as bolas cortadas'))
for i, (tv, _, v) in enumerate([e for e in EVS if e[1] == 'dobrou']):
    put(FX, S.bell(69 + min(14, i), 2.0), tv, .09, 0); MARCAS.append((tv, f'dobrou: {v} bolas'))
if t_ch is not None:
    n_ = int((t_tr - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
    put(FX, np.sign(np.sin(2 * np.pi * np.cumsum(170 - 110 * u + 25 * np.sin(2 * np.pi * 7 * tt)) / SR)) * (.3 + .7 * u) * .2, t_ch, .35)
    for q in range(4): put(FX, snip()[:int(.2 * SR)], t_ch + q * .55, .3, 0)
    MARCAS.append((t_ch, 'ANEL LOTADO: a tesoura emperra (tenta fechar e não consegue), rangido'))
for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .2 + q * .2, .14, R.uniform(-.6, .6))
MARCAS.append((t_tr, 'emperrou: trincas'))
MARCAS.append((t_ex - .35, 'silêncio antes de quebrar'))
put(FX, metal(2600, .8), t_ex, .5); put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'QUEBROU: o parafuso estoura, as lâminas se separam e o anel explode ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta à tesoura inteira com 1 bola (loop)'))
i0, i1 = int((t_ex - .35) * SR), int(t_ex * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-tesoura.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-tesoura.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · TESOURA (sem narração; {len(snips)} snips, {D["cortes"]} cortes)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som tesoura ok', round(DUR, 2), 's ·', len(snips), 'snips')
