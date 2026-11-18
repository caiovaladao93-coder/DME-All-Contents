"""Som ORIGINAL (numpy) do ANEL MUSICAL a partir de out/eventos-anel.json: cada segmento do anel é uma nota
(pentatônica de Lá menor, 12 notas), então a física toca a melodia, cada vez mais rápida conforme as bolas se multiplicam.
Base leve a 120 BPM que entra quando a bola é solta e cresce com a densidade de batidas; pressão = ronco grave e rangidos;
estouro = riser, cada segmento que se solta toca a própria nota com estalo de vidro, explosão = impacto e acorde; loop = um ding.
Saída: out/som-anel.wav e out/marcas-som-anel.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-anel.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(12); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
NOTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]
ev = {k: [e for e in EVS if e[1] == k] for k in ('solta', 'cheio', 'estouro', 'explode')}
t_solta = ev['solta'][0][0] if ev['solta'] else 1.0; t_cheio = ev['cheio'][0][0] if ev['cheio'] else DUR; t_est = ev['estouro'][0][0] if ev['estouro'] else DUR
t_exp = ev['explode'][0][0] if ev['explode'] else DUR
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# densidade de batidas por segundo → intensidade da base
notas_t = np.array([e[0] for e in EVS if e[1] == 'nota']); dens = lambda t: ((notas_t > t - 1) & (notas_t <= t)).sum()
t, k = t_solta, 0
while t < t_exp:
    lvl = min(1.0, .25 + np.log10(dens(t) + 1) * .3)
    put(MU, S.kick(), t, .55 * lvl); put(MU, S.hat(), t + .25, .18 * lvl, .3)
    if lvl > .6: put(MU, S.hat(), t + .125, .1 * lvl, -.3)
    b = [45, 45, 48, 43][(k // 4) % 4]; put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(int(.4 * SR))) * np.exp(-S.ar(int(.4 * SR)) / .2), t, .35 * lvl)
    t += .5; k += 1
MARCAS.append((t_solta, 'a bola é solta; base a 120 BPM'))
ult = -9.0; cnt = 0
for t, tipo, v in EVS:
    if tipo == 'nota' and t - ult >= .04:
        g = .34 if t < t_cheio else .22; put(FX, S.marimba(NOTA[v]), t, g, (v - 5.5) / 7); ult = t; cnt += 1
    elif tipo == 'segmento':
        put(FX, S.bell(NOTA[v] + 12, .9), t, .45, (v - 5.5) / 7); put(FX, S.vidro(), t, .35); MARCAS.append((t, f'segmento {v} se solta'))
# pressão: ronco que sobe + rangidos
n = int((t_est - t_cheio) * SR)
if n > 0:
    tt = S.ar(n); ronco = np.sin(2 * np.pi * (38 + 20 * tt / tt[-1]) * tt) * (tt / tt[-1]) ** 1.5
    put(FX, ronco, t_cheio, .5); MARCAS.append((t_cheio, 'PRESSÃO: ronco e rangidos'))
    for q in range(int((t_est - t_cheio) / .6)):
        m = int(.3 * SR); x = np.sign(np.sin(2 * np.pi * np.cumsum(260 + 120 * R.random() + 40 * S.ar(m)) / SR)) * (R.random(m) < .4)
        put(FX, S.filt(x.astype(float), 400, 2500) * np.sin(np.pi * S.ar(m) / .3), t_cheio + q * .6 + R.uniform(0, .3), .18, R.uniform(-.6, .6))
nr = int(1.4 * SR); put(FX, S.filt(R.standard_normal(nr), 500, 8000) * (S.ar(nr) / 1.4) ** 2 * .7, t_est - 1.4, .35); MARCAS.append((t_est, 'estouro começa (segmentos um a um)'))
put(FX, S.boom(1.8), t_exp, .9); put(FX, S.crash(2.4), t_exp, .6); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_exp, .55); MARCAS.append((t_exp, 'EXPLOSÃO'))
t_loop = t_exp + 2.6; put(FX, S.bell(81, 1.2), t_loop + .4, .35); MARCAS.append((t_loop, 'volta ao início (loop)'))
mix = MU * .7 + FX
f = int(.6 * SR); mix[-f:] *= np.linspace(1, .3, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-anel.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-anel.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · ANEL MUSICAL (sem narração; {cnt} notas tocadas pelas batidas)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som anel ok', round(DUR, 2), 's ·', cnt, 'notas')
