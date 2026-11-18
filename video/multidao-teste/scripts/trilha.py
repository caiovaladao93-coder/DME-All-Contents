"""Trilha e efeitos ORIGINAIS (numpy) para "1 CONTRA 10.000". Tudo sai de src/data/plano.json (mesmos tempos da imagem).
Batida eletrônica a 128 BPM que cresce por camadas (gancho → portais → onda 2 → porta dourada), fica sombria no chefão,
sirene no alarme, corta no último soldado (só coração), "derrota" descendente e um tique-taque leve na escolha.
Estouros na frente da batalha proporcionais às baixas, "ding" a cada portal, tiros do canhão, pisadas do chefão e portais quebrando."""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, boom, conv, fftfilt, hp, hz, lp, make_ir, sweep, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
P = json.load(open(f'{ROOT}/src/data/plano.json')); E = P['eventos']
DUR = P['dur']; N = int(DUR * SR); R = np.random.default_rng(128); BEAT = 60 / 128
MU, FX, SEND = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0 or t0 < 0: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(n, t): EV.append((round(t, 2), n))
def sm(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def kf(k, t):
    if t <= k[0][0]: return k[0][1]
    for (a, va), (b, vb) in zip(k, k[1:]):
        if t < b: return va + (vb - va) * sm((t - a) / (b - a))
    return k[-1][1]
def kflog(k, t): return np.exp(kf([[a, np.log(v + 1)] for a, v in k], t)) - 1
def noise(d, lo, hi): return fftfilt(R.standard_normal(int(d * SR)), band(lo, hi))
def env(n, a=.003, d=.1): t = ar(n); return np.minimum(1, t / a) * np.exp(-t / d)
def kick(): n = int(.35 * SR); t = ar(n); return np.tanh(1.6 * sweep(150, 45, .03, n) * np.exp(-t / .15))
def clap():
    n = int(.22 * SR); x = np.zeros(n)
    for k, d in enumerate((0, .01, .02)): i = int(d * SR); m = n - i; x[i:] += R.standard_normal(m) * np.exp(-np.arange(m) / SR / (.01 if k < 2 else .08))
    return fftfilt(x, band(900, 6000))
def hat(): n = int(.05 * SR); return fftfilt(R.standard_normal(n), hp(7000, 3)) * env(n, .001, .015)
def saw(m, d, cut=1800):
    n = int(d * SR); t = ar(n); f = hz(m); x = sum(2 * ((f * (1 + dt) * t + R.random()) % 1) - 1 for dt in (-.007, 0, .008)) / 3
    return fftfilt(x, lp(cut, 2)) * np.minimum(1, t / .005) * np.exp(-t / (d * .6))
def pop(): n = int(.07 * SR); t = ar(n); f = R.uniform(500, 1400); return (np.sin(2 * np.pi * f * t * (1 - t * 4)) * .6 + fftfilt(R.standard_normal(n), band(1500, 6000)) * .3) * np.exp(-t / .018)
def ding(m): return bell(m, .6) * .6
def siren(d):
    n = int(d * SR); t = ar(n); f = 700 + 250 * np.sin(2 * np.pi * 1.6 * t); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 * np.minimum(1, t / .1)
def stomp(): n = int(.8 * SR); t = ar(n); return np.tanh(2 * (sweep(70, 30, .08, n) * np.exp(-t / .25) + fftfilt(R.standard_normal(n), band(80, 900)) * np.exp(-t / .06) * .6))
def crash(d=1.2): n = int(d * SR); return fftfilt(R.standard_normal(n), band(1500, 9000)) * env(n, .002, .25)
def riser(d): n = int(d * SR); t = ar(n); return noise(d, 400, 7000) * (t / d) ** 2 * .7 + sweep(150, 1200, d, n) * (t / d) ** 2 * .2
def heart(): n = int(.6 * SR); x = np.zeros(n); b = sweep(70, 40, .03, int(.25 * SR)) * np.exp(-ar(int(.25 * SR)) / .09); x[:len(b)] += b; i = int(.2 * SR); x[i:i + len(b)] += b * .6; return x

PROG_A = [45, 45, 48, 43]; PROG_B = [40, 40, 43, 38]  # Lá menor → ... ; chefão em Mi menor
def secao(t0, t1, lvl, kick_on=True, clap_on=True, hats=True, bass=True, stab=True, prog=PROG_A, cut=1800):
    t, k = t0, 0
    while t < t1 - 1e-3:
        b = k % 4; root = prog[(k // 4) % 4]
        if kick_on: put(MU, kick(), t, .8 * lvl)
        if clap_on and b in (1, 3): put(MU, clap(), t, .35 * lvl, .1)
        if hats: put(MU, hat(), t + BEAT / 2, .25 * lvl, .4); put(MU, hat(), t + BEAT / 4 * 3, .12 * lvl, -.4)
        if bass: put(MU, saw(root, BEAT * .9, 500), t + BEAT / 2, .5 * lvl)
        if stab and b in (0, 2): put(MU, saw(root + 24, BEAT * .5, cut) + saw(root + 31, BEAT * .5, cut) * .7, t, .18 * lvl, -.2, .3)
        t += BEAT; k += 1

# ── música por seções
put(FX, boom(1.4), 0, .7); put(FX, riser(2.4), .2, .4); ev('gancho: impacto + riser', 0)
secao(E['hook'][1], 8.8, .55, clap_on=False, stab=False); ev('batida entra (128 BPM)', E['hook'][1])
secao(8.8, E['onda2'] - .4, .8, cut=1400)
put(FX, riser(1.5), E['onda2'] - 1.5, .4); put(FX, crash(), E['onda2'], .5); put(FX, boom(1.6), E['onda2'], .6); ev('ONDA 2', E['onda2'])
secao(E['onda2'], E['ouro'] - .5, .9, cut=2200)
put(FX, riser(2.0), E['ouro'] - 2.0, .5); put(FX, crash(1.8), E['ouro'], .6); put(FX, bell(84, 2) + bell(91, 2) * .7, E['ouro'], .5, 0, .5); ev('PORTA DOURADA ×20 (drop)', E['ouro'])
secao(E['ouro'], E['chefe'] - .3, 1.0, cut=3200)
put(FX, boom(2.5), E['chefe'], .9, 0, .5); put(FX, crash(2.0), E['chefe'], .5); ev('CHEFÃO', E['chefe'])
secao(E['chefeDesce'][0], E['ultimo'] - .2, .9, clap_on=True, prog=PROG_B, cut=1200)
put(FX, siren(E['ultimo'] - E['alarme']), E['alarme'], .4); ev('sirene de alarme', E['alarme'])
t = E['ultimo']
while t < E['derrota']: put(MU, heart(), t, .8); t += .45
ev('último soldado: só coração', E['ultimo'])
for i, m in enumerate([60, 59, 58, 55]): put(FX, saw(m, .5 if i < 3 else 1.4, 1500), E['derrota'] + .1 + i * .42, .45, 0, .4)
put(FX, boom(2.0), E['derrota'], .7); ev('DERROTA (descendente)', E['derrota'])
for i in range(7): put(FX, bell(88 if i < 6 else 96, .4) * .5, E['escolha'] + 1.2 + i, .4)
secao(E['escolha'] + .2, DUR - .8, .35, kick_on=True, clap_on=False, bass=False, stab=True, cut=1600); ev('escolha: tique por segundo', E['escolha'] + 1.2)

# ── efeitos da simulação
dt = 1 / 30
for f in range(int(E['derrota'] * 30)):
    t = f * dt
    if t < E['hook'][1]: continue
    rate = abs(kflog(P['vermelho'], t + dt) - kflog(P['vermelho'], t)) + abs(kflog(P['azul'], t + dt) - kflog(P['azul'], t))
    n = min(4, int(np.log10(rate + 1) * 1.6 + (R.random() < .5)))
    for _ in range(n): put(FX, pop(), t + R.random() * dt, .12, R.uniform(-.6, .6))
ev('estouros na frente (pelas baixas)', E['hook'][1])
t = E['hook'][1]
while t < E['derrota']: put(FX, kick() * .4, t, .18, 0); t += 1 / 7
ev('tiros do canhão (7/s)', E['hook'][1])
for i, g in enumerate(P['portais']):
    put(FX, ding(84 + i * 3), g['t0'], .7, 0, .4); ev(f"portal {g['rot']} aparece", g['t0'])
    t = g['t0'] + .4; m_ = 72 + i * 4
    while t < E['derrota']:
        if kf(P['front'], t) >= g['s']: put(FX, crash(.6), t, .5); put(FX, boom(1.0), t, .4); ev(f"portal {g['rot']} quebra", t); break
        put(FX, bell(m_, .25) * .3, t, .2, .5); t += .55
t = E['chefeDesce'][0]
while t < E['derrota']: put(FX, stomp(), t, .8); t += 1.2
ev('pisadas do chefão (1,2 s)', E['chefeDesce'][0])

ir = make_ir(1.4, 3)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .3
mix = MU * .8 + FX
i0, i1 = int((E['ultimo'] - .15) * SR), int(E['derrota'] * SR); mix[i0:i1] *= np.linspace(1, .6, i1 - i0)[:, None]
f = int(1.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.6) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · 1 CONTRA 10.000 (sem narração)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(EV)]
print('trilha ok', DUR, 's ·', len(EV), 'marcas')
