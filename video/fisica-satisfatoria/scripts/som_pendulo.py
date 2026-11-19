"""Som ORIGINAL (numpy) do PÊNDULO a partir de out/eventos-pendulo.json.
Relógio: "tic" e "tac" de madeira e metal nos extremos do balanço (a cada 1 s, no tempo da música a 120 BPM) e um "vuuush" da lâmina
passando pelo meio. Cada corte faz um "tsk" afinado em arpejo (no máximo um a cada 45 ms). Cada vez que o total dobra toca um sino
que sobe. Base: baixo e chimbal no tempo, bumbo depois de 30 s. Perdendo força = os tique-taques ficam mais fracos e espaçados;
parou = rangido e trincas; silêncio; SE SOLTOU = estalo, a lâmina cai, boom, crash, pedaços e acorde. Loop = ding.
Saída: out/som-pendulo.wav e out/marcas-som-pendulo.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-pendulo.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
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
t_ch, t_tr, t_ex = ev('cheio'), ev('para'), ev('explode'); T0 = D['t0']
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
# tique-taque nos extremos e "vuuush" no meio de cada passada
def tictac(f0):
    n = int(.12 * SR); t = S.ar(n); return (np.sin(2 * np.pi * f0 * t) * np.exp(-t / .02) + S.filt(R.standard_normal(n), 1500, 6000) * np.exp(-t / .006) * .8)
def vuush(d=.8):
    n = int(d * SR); t = S.ar(n); return S.filt(R.standard_normal(n), 300, 2500) * np.sin(np.pi * t / d) ** 3
tiques = [e for e in EVS if e[1] == 'tique']
for i, (tq, _, lado) in enumerate(tiques):
    g = 1.0 if t_ch is None or tq < t_ch else max(.2, 1 - (tq - t_ch) / 4.0)
    put(FX, tictac(1500 if lado else 1150), tq, .3 * g, -.35 if lado else .35); put(FX, vuush(), tq + .1, .16 * g, .35 if lado else -.35)
MARCAS.append((tiques[0][0] if tiques else T0, 'tique-taque nos extremos do balanço + "vuuush" da lâmina passando'))
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
ult = -9.0; idx = 0
for tc in cortes:
    if tc - ult < .045: continue
    nb = 1 + np.sum(cortes <= tc); base = min(len(ESC) - 5, int(np.log2(nb + 1)))
    put(FX, tsk(ESC[base + idx % 5]), tc, .17, np.clip((idx % 7 - 3) / 4, -.8, .8)); idx += 1; ult = tc
MARCAS.append((cortes[0] if len(cortes) else 1.0, 'primeiro corte: "tsk" afinado'))
snips = tiques
for i, (tv, _, v) in enumerate([e for e in EVS if e[1] == 'dobrou']):
    put(FX, S.bell(69 + min(14, i), 2.0), tv, .09, 0); MARCAS.append((tv, f'dobrou: {v} bolas'))
if t_ch is not None:
    n_ = int((t_tr - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
    put(FX, np.sign(np.sin(2 * np.pi * np.cumsum(170 - 110 * u + 25 * np.sin(2 * np.pi * 7 * tt)) / SR)) * (.3 + .7 * u) * .2, t_ch, .35)
    MARCAS.append((t_ch, 'ANEL LOTADO: o pêndulo perde força (tique-taque enfraquece), rangido'))
for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .2 + q * .2, .14, R.uniform(-.6, .6))
MARCAS.append((t_tr, 'parou: trincas'))
MARCAS.append((t_ex - .35, 'silêncio antes de quebrar'))
put(FX, metal(2600, .8), t_ex, .5); put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'SE SOLTOU: a lâmina cai e o anel explode ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta ao pêndulo parado com 1 bola (loop)'))
i0, i1 = int((t_ex - .35) * SR), int(t_ex * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-pendulo.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-pendulo.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · PÊNDULO (sem narração; {len(snips)} tique-taques, {D["cortes"]} cortes)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som pêndulo ok', round(DUR, 2), 's ·', len(snips), 'tiques')
