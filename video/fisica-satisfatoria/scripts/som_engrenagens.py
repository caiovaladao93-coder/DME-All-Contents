"""Som ORIGINAL (numpy) das ENGRENAGENS a partir de out/eventos-engrenagens.json.
Cada dente que passa faz um tique de relógio (o ritmo segue a velocidade real da máquina); cada bola duplicada toca uma nota na
escala da engrenagem que a duplicou; a base a 120 BPM cresce com o número de bolas. Cheia = rangido metálico que sobe; travou =
baque pesado e rangidos; 0,4 s de silêncio; explosão = boom, crash, sinos metálicos (pedaços) e acorde. Loop = ding.
Saída: out/som-engrenagens.wav e out/marcas-som-engrenagens.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-engrenagens.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(21); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
ESC = [[60, 62, 64, 67, 69, 72], [67, 69, 71, 74, 76, 79], [64, 67, 69, 72, 74, 76]]  # uma escala por engrenagem
def tique(f0=2600): n = int(.035 * SR); t = S.ar(n); return (np.sin(2 * np.pi * f0 * t) * .6 + S.filt(R.standard_normal(n), 2000, 9000) * .5) * np.exp(-t / .006)
def metal(f0, d=1.4):  # sino inarmônico (pedaço de metal)
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35), (8.93, .2)]))
def baque(): n = int(.6 * SR); t = S.ar(n); return np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t / .2) + 35) / SR) * np.exp(-t / .18) + S.filt(R.standard_normal(n), 80, 1500) * np.exp(-t / .04) * .6
def rangido(f0, d=.5):
    n = int(d * SR); t = S.ar(n); f = f0 * (1 + .3 * np.sin(2 * np.pi * 23 * t)) * (1 + .4 * t / d)
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 * np.sin(np.pi * t / d) ** 2
ev = lambda tp: next((e for e in EVS if e[1] == tp), None)
t_ch = ev('cheio')[0]; t_tr = ev('trava')[0]; e_ex = ev('explode'); t_ex, n_ex = e_ex[0], e_ex[2]
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# base 120 BPM até a máquina travar
t, k = 1.2, 0; nd = [e[0] for e in EVS if e[1] == 'dente']
while t < t_tr:
    nb = 1 + sum(1 for x in nd if x <= t); lvl = min(1.0, .2 + .8 * (np.log2(nb) / np.log2(2400)) ** 1.5)
    put(MU, S.kick(), t, .5 * lvl); put(MU, S.hat(), t + .25, .16 * lvl, .3)
    if lvl > .55: put(MU, S.hat(), t + .125, .09 * lvl, -.3)
    b = [48, 48, 43, 45][(k // 4) % 4]; nn = int(.4 * SR); put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(nn)) * np.exp(-S.ar(nn) / .2), t, .32 * lvl)
    t += .5; k += 1
# tique de cada dente (o ritmo sai da física) e notas das duplicações
cnt_t = 0
for t, tp, v in EVS:
    if tp == 'passo' and t < t_ex: put(FX, tique(2600 if cnt_t % 2 else 2200), t, .22, -.2 if cnt_t % 2 else .2); cnt_t += 1
ult, cnt = -9.0, 0
for t, tp, v in EVS:
    if tp == 'dente' and t - ult >= .035:
        put(FX, S.marimba(R.choice(ESC[v]) + R.choice([0, 0, 12])), t, .27, [-.5, 0, .5][v]); ult = t; cnt += 1
MARCAS.append((t_ch, f'MÁQUINA CHEIA ({n_ex} bolas): rangido metálico, a máquina perde velocidade'))
n_ = int((t_tr - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
put(FX, S.filt(R.standard_normal(n_), 300, 2500) * u * .5 + np.sin(2 * np.pi * np.cumsum(40 + 30 * u) / SR) * u * .6, t_ch, .5)
t = t_ch
while t < t_ex - .4: put(FX, rangido(R.uniform(180, 420)), t, .25, R.uniform(-.6, .6)); t += R.uniform(.35, .7)
put(FX, baque(), t_tr, .9); MARCAS.append((t_tr, 'TRAVOU: baque pesado; trincas'))
for q in range(5): put(FX, metal(R.uniform(900, 1600), .3), t_tr + .3 + q * .22, .15, R.uniform(-.6, .6))
MARCAS.append((t_ex - .4, 'silêncio antes da explosão'))
put(FX, S.boom(1.8), t_ex, .95); put(FX, S.crash(2.4), t_ex, .5); put(FX, S.acorde([60, 67, 72, 76, 79, 84], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(300, 1400)), t_ex + R.uniform(.05, 1.6), .2, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'EXPLOSÃO: as engrenagens se partem ({n_ex} bolas)'))
put(FX, S.bell(81, 1.2), t_ex + 3.8, .35); MARCAS.append((t_ex + 3.0, 'volta à máquina vazia (loop)'))
mix = MU * .7 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-engrenagens.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-engrenagens.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · ENGRENAGENS (sem narração; {cnt} notas das duplicações, {cnt_t} tiques de dente)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som engrenagens ok', round(DUR, 2), 's ·', cnt, 'notas ·', cnt_t, 'tiques')
