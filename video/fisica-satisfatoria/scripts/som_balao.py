"""Som ORIGINAL (numpy) do BALÃO ELÁSTICO a partir de out/eventos-balao.json.
Cada batida na borda toca uma nota (marimba) na cor da bola; um "esticar de borracha" (tom grave que sobe) e rangidos cada vez mais
frequentes acompanham a tensão; a base a 120 BPM cresce com o tempo e para 0,4 s antes do estouro (silêncio de suspense).
Estouro = estalo seco + boom + crash + o "flap" da borracha recolhendo; loop = ding. Saída: out/som-balao.wav e out/marcas-som-balao.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-balao.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(12); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
ESC = [[60, 64, 67, 72], [62, 67, 71, 74], [64, 67, 72, 76], [65, 69, 72, 77], [67, 71, 74, 79], [69, 72, 76, 81]]
def rangido(f0):  # borracha rangendo: tom curto com vibrato irregular
    n = int(.18 * SR); t = S.ar(n); f = f0 * (1 + .25 * np.sin(2 * np.pi * 31 * t) + .1 * R.standard_normal(n).cumsum() / np.sqrt(n))
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * np.sin(np.pi * t / t[-1]) ** 2
def estalo(): n = int(.12 * SR); return R.standard_normal(n) * np.exp(-S.ar(n) / .012)
def flap(d=1.1):  # borracha recolhendo: zumbido grave que desacelera
    n = int(d * SR); t = S.ar(n); f = 70 * np.exp(-t / .35) + 14
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / .3) * .5
t_sol = next((e[0] for e in EVS if e[1] == 'solta'), 1.0); t_pop = next((e[0] for e in EVS if e[1] == 'estoura'), DUR - 5)
n_pop = next((e[2] for e in EVS if e[1] == 'estoura'), 0)
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
MARCAS.append((t_sol, 'a bola é solta'))
# base 120 BPM, cresce até o estouro e para 0,4 s antes (silêncio)
t, k = t_sol, 0
while t < t_pop - .4:
    lvl = min(1.0, .2 + .8 * ((t - t_sol) / (t_pop - t_sol)) ** 1.3)
    put(MU, S.kick(), t, .5 * lvl); put(MU, S.hat(), t + .25, .16 * lvl, .3)
    if lvl > .6: put(MU, S.hat(), t + .125, .1 * lvl, -.3)
    b = [48, 48, 52, 43][(k // 4) % 4]; nn = int(.4 * SR); put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(nn)) * np.exp(-S.ar(nn) / .2), t, .32 * lvl)
    t += .5; k += 1
MARCAS.append((t_pop - .4, 'silêncio antes do estouro'))
# borracha esticando: tom grave contínuo que sobe com a tensão
n = int((t_pop - t_sol) * SR); tt = S.ar(n); u = tt / tt[-1]; f = 55 + 140 * u ** 2
tom = (np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR)) * u ** 1.6 * .5
put(FX, tom, t_sol, .45)
# rangidos: cada vez mais frequentes e agudos
t = t_sol + 3
while t < t_pop:
    u = (t - t_sol) / (t_pop - t_sol); put(FX, rangido(300 + 900 * u), t, .12 + .25 * u, R.uniform(-.5, .5))
    t += max(.18, 3.0 * (1 - u) ** 2) * R.uniform(.7, 1.3)
# notas das batidas (limitadas a uma a cada 35 ms)
ult, cnt = -9.0, 0
for t, tipo, v in EVS:
    if tipo == 'bate' and t < t_pop and t - ult >= .035:
        put(FX, S.marimba(R.choice(ESC[v % 6]) + R.choice([0, 0, 12])), t, .28, R.uniform(-.4, .4)); ult = t; cnt += 1
put(FX, estalo(), t_pop, 1.0); put(FX, S.boom(1.8), t_pop, .9); put(FX, S.crash(2.4), t_pop, .45); put(FX, flap(), t_pop + .02, .6)
put(FX, S.acorde([60, 67, 72, 76, 79, 84], 3.0), t_pop + .1, .45); MARCAS.append((t_pop, f'POW! estouro com {n_pop} bolas (estalo, boom, flap da borracha)'))
for q in range(10): put(FX, S.marimba(R.choice(ESC[q % 6]) + 12), t_pop + .15 + q * .07, .15, R.uniform(-.8, .8))
put(FX, S.bell(81, 1.2), t_pop + 3.6, .35); MARCAS.append((t_pop + 3.0, 'volta ao balão murcho (loop)'))
mix = MU * .7 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-balao.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-balao.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · BALÃO ELÁSTICO (sem narração; {cnt} notas tocadas pelas batidas na borda)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som balão ok', round(DUR, 2), 's ·', cnt, 'notas')
