"""Som ORIGINAL (numpy) da GUERRA DE CORES a partir de out/eventos-guerra.json.
Cada conversão toca um tique na nota da cor que converteu (6 cores = 6 notas de um acorde); troca de líder = whoosh;
eliminação = impacto + acorde descendente; final = riser + batida dobrada; vitória = fanfarra. Base a 120 BPM que acelera
de intensidade a cada eliminação, com 0,4 s de silêncio antes da final. Saída: out/som-guerra.wav e out/marcas-som-guerra.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S  # reaproveita os timbres de som.py (lê out/eventos.json só para os tempos da primeira peça)
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-guerra.json')); DUR = D['dur']; GO = D['go']; ELIMS = D['elims']; EVS = D['eventos']
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); MARCAS = []; R = np.random.default_rng(66)
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
NOTA = [72, 74, 76, 79, 81, 84]
t_final = next((t for t, k, v in EVS if k == 'final'), DUR)
# contagem inicial 3-2-1
for q in range(3): put(FX, S.bell(84 if q < 2 else 96, .5), GO - 3 + q + .2, .5)
put(FX, S.crash(1.4), GO, .5); MARCAS.append((GO, 'começa a guerra'))
# base: intensidade sobe a cada eliminação; dobra na final; silêncio de 0,4 s antes da final
t, k = GO, 0
while t < DUR - 2:
    ne = sum(1 for _, te in ELIMS if te <= t); final = t >= t_final; lvl = .4 + .1 * ne + (.15 if final else 0)
    if not (t_final - .4 <= t < t_final):
        put(MU, S.kick(), t, .6 * lvl); put(MU, S.hat(), t + .25, .2 * lvl, .3)
        if ne >= 2: put(MU, S.hat(), t + .125, .12 * lvl, -.3)
        if final: put(MU, S.kick(), t + .25, .4 * lvl)
        b = [45, 45, 48, 43][(k // 4) % 4] if ne < 3 else [40, 40, 43, 38][(k // 4) % 4]
        put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(int(.4 * SR))) * np.exp(-S.ar(int(.4 * SR)) / .2), t, .4 * lvl)
    t += .5; k += 1
ult = {}
for t, tipo, v in sorted(EVS, key=lambda e: e[0]):
    if tipo == 'conv':
        if t - ult.get('conv', -9) >= .045: put(FX, S.tick(NOTA[v] + R.choice([0, 12])), t, .16, R.uniform(-.6, .6)); ult['conv'] = t
    elif tipo == 'lider': put(FX, S.whoosh(), t, .3); MARCAS.append((t, f'novo líder: cor {v}'))
    elif tipo == 'elim':
        put(FX, S.boom(), t, .8); put(FX, S.crash(), t, .45)
        for q, m in enumerate([64, 62, 60, 57]): put(FX, S.marimba(m, .5), t + .08 + q * .1, .4)
        MARCAS.append((t, f'cor {v} eliminada · arena perde um lado'))
    elif tipo == 'final':
        n = int(1.2 * SR); tt = S.ar(n); put(FX, S.filt(R.standard_normal(n), 500, 8000) * (tt / 1.2) ** 2 * .7, t - 1.2, .4)
        put(FX, S.acorde([57, 64, 69, 72], 1.6), t, .5); MARCAS.append((t, 'FINAL (silêncio de 0,4 s antes)'))
    elif tipo == 'vitoria':
        for q, m in enumerate([72, 76, 79, 84, 88]): put(FX, S.bell(m, 1.8), t + q * .11, .45)
        put(FX, S.crash(2.4), t + .45, .55); MARCAS.append((t, f'vitória da cor {v}'))
mix = MU * .7 + FX
f = int(1.4 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-guerra.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-guerra.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · GUERRA DE CORES (sem narração; cada conversão toca a nota da cor)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som guerra ok', round(DUR, 2), 's')
