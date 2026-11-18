"""Som ORIGINAL (numpy) da AMPULHETA a partir de out/eventos-ampulheta.json.
Cada bola que passa pelo gargalo toca uma nota (marimba), que sobe na escala a cada virada; a virada tem whoosh, baque de madeira e
um sino que sobe de tom; a base a 120 BPM ganha intensidade com o número de viradas. Entupiu = ronco grave; trincas = estalos de
vidro; explosão = vidro estilhaçando, impacto e acorde; loop = ding. Saída: out/som-ampulheta.wav e out/marcas-som-ampulheta.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-ampulheta.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(8); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
def baque(): n = int(.3 * SR); t = S.ar(n); return np.sin(2 * np.pi * (180 * np.exp(-t / .05) + 90) * t) * np.exp(-t / .07) + S.filt(R.standard_normal(n), 200, 2000) * np.exp(-t / .02) * .5
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
vir = [e for e in EVS if e[1] == 'vira']; t_exp = next((e[0] for e in EVS if e[1] == 'explode'), DUR); t_pr = next((e[0] for e in EVS if e[1] == 'pressao'), None)
t, k = 1.0, 0
while t < t_exp:
    nv = sum(1 for e in vir if e[0] <= t); lvl = min(1.0, .25 + .07 * nv)
    put(MU, S.kick(), t, .55 * lvl); put(MU, S.hat(), t + .25, .18 * lvl, .3)
    if nv >= 6: put(MU, S.hat(), t + .125, .1 * lvl, -.3)
    b = [45, 45, 48, 43][(k // 4) % 4]; put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(int(.4 * SR))) * np.exp(-S.ar(int(.4 * SR)) / .2), t, .35 * lvl)
    t += .5; k += 1
ult, cnt = -9.0, 0
for t, tipo, v in EVS:
    if tipo == 'passa' and t - ult >= .035:
        put(FX, S.marimba(ESC[min(len(ESC) - 1, v)] + R.choice([0, 0, 12])), t, .3, R.uniform(-.3, .3)); ult = t; cnt += 1
    elif tipo == 'vira':
        put(FX, S.whoosh(1.2), t, .4); put(FX, baque(), t + 1.35, .6); put(FX, S.bell(ESC[min(len(ESC) - 1, v)] + 12, 1.0), t + 1.35, .3)
        MARCAS.append((t, f'virada {v}'))
    elif tipo == 'estalo': put(FX, S.vidro(), t, .3, R.uniform(-.5, .5))
if t_pr is not None:
    n = int((t_exp - t_pr) * SR); tt = S.ar(n); put(FX, np.sin(2 * np.pi * (36 + 22 * tt / tt[-1]) * tt) * (tt / tt[-1]) ** 1.5, t_pr, .55); MARCAS.append((t_pr, 'ENTUPIU: ronco grave; depois trincas'))
for q in range(4): put(FX, S.vidro(), t_exp + q * .05, .55, R.uniform(-.7, .7))
put(FX, S.boom(1.8), t_exp, .9); put(FX, S.crash(2.4), t_exp, .5); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_exp + .05, .5); MARCAS.append((t_exp, 'EXPLOSÃO do vidro'))
put(FX, S.bell(81, 1.2), t_exp + 3.2, .35); MARCAS.append((t_exp + 2.8, 'volta ao início (loop)'))
mix = MU * .7 + FX; f = int(.6 * SR); mix[-f:] *= np.linspace(1, .3, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-ampulheta.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-ampulheta.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · AMPULHETA (sem narração; {cnt} notas tocadas pelas bolas no gargalo)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som ampulheta ok', round(DUR, 2), 's ·', cnt, 'notas')
