"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — série 10 SEGUNDOS, Ep. 1 v2 "A foto das 3h10". Suspense sem sangue.
Tema da série: ASSOBIO de quatro notas (Mi–Sol–Fá#–Si). Drone grave em Mi menor, pulso de coração que acelera, silêncios secos.
Efeitos: vibração do celular, rádio da polícia, carimbo, passos, rangido de porta no áudio, chaves, batidas na porta, plim, tique-taque.
Ducking sob a voz. Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, boom, conv, fftfilt, hp, hz, lp, make_ir, pad, sweep, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR); R = np.random.default_rng(312)
n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
def wt(k, w, nth=0, end=False):
    h = [x for x in TL['words'][k] if n_(x[0]) == n_(w)]; x = h[nth] if nth < len(h) else h[0]; return x[2] if end else x[1]
MU, FX, SEND = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(name, t0): EV.append((round(t0, 2), name))
def noise(d, lo, hi): return fftfilt(R.standard_normal(int(d * SR)), band(lo, hi))
def env(n, a=.005, d=.2): t = ar(n); return np.minimum(1, t / a) * np.exp(-t / d)

# ── timbres
def whistle(notes=(76, 79, 78, 71), durs=(.32, .32, .32, .7), muff=False):
    out = []
    for m, d in zip(notes, durs):
        n = int(d * SR); t = ar(n); f = hz(m) * (1 + .012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .15))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) + fftfilt(R.standard_normal(n), band(hz(m) * .8, hz(m) * 1.3)) * .25
        out.append(x * np.minimum(1, t / .04) * np.minimum(1, (d - t) / .06))
    x = np.concatenate(out)
    return fftfilt(x, lp(1600)) * .7 if muff else x
def keys(d=.8):
    n = int(d * SR); x = np.zeros(n)
    for k in range(14):
        i = int(R.uniform(0, d - .08) * SR); m = int(.06 * SR); f = R.uniform(3000, 6500); t = ar(m)
        x[i:i + m] += np.sin(2 * np.pi * f * t) * np.exp(-t / .02) * R.uniform(.3, 1)
    return x * .6
def knock():
    n = int(.25 * SR); t = ar(n); return np.tanh(2 * (sweep(180, 70, .02, n) * np.exp(-t / .05) + fftfilt(R.standard_normal(n), band(200, 1800)) * np.exp(-t / .012)))
def heart(g=1.0):
    n = int(.7 * SR); x = np.zeros(n); t = ar(int(.3 * SR)); b = sweep(70, 40, .03, len(t)) * np.exp(-t / .09)
    x[:len(b)] += b; i = int(.2 * SR); x[i:i + len(b)] += b * .6; return x * g
def vibra(d=.45):
    n = int(d * SR); t = ar(n); return fftfilt(np.sin(2 * np.pi * 160 * t) * (np.sin(2 * np.pi * 24 * t) > 0), lp(450)) * .8
def creak(d=1.0):
    n = int(d * SR); t = ar(n); f = 260 + 180 * t / d + 30 * np.sin(2 * np.pi * 3 * t)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (R.random(n) < .45)
    return fftfilt(x.astype(float), band(300, 2500)) * np.sin(np.pi * t / d) * .5
def radio(d=1.2):
    n = int(d * SR); t = ar(n); x = noise(d, 800, 3500) * (np.sin(2 * np.pi * 7 * t) > -.2) * .3
    x += np.sin(2 * np.pi * 1200 * t) * np.exp(-t / .05) * .3; return x * np.minimum(1, (d - t) / .1)
def step():
    n = int(.18 * SR); t = ar(n); return sweep(120, 60, .02, n) * np.exp(-t / .04) + noise(.18, 400, 2000) * np.exp(-t / .01) * .4
def stamp():
    n = int(.4 * SR); t = ar(n); return np.tanh(2 * (sweep(150, 50, .02, n) * np.exp(-t / .07) + noise(.4, 300, 3000) * np.exp(-t / .02) * .6))
def tick(hi=True): n = int(.035 * SR); t = ar(n); return np.sin(2 * np.pi * (3000 if hi else 2300) * t) * np.exp(-t / .006)
def plim(): return bell(88, .5) * .6

# ── tempos
KN = [S['policia']['t0'] + .15, S['policia']['t0'] + .45, S['policia']['t0'] + .75]
CNT = json.load(open(f'{ROOT}/src/data/contagem.json')); T0 = CNT['um']; tEndC = T0 + 9.6
tMorto = S['morto']['t0']; tLive = S['som']['v1'] + .15
def shutter():
    n = int(.12 * SR); t = ar(n); x = noise(.12, 1500, 7000) * (np.exp(-t / .008) + .6 * np.exp(-np.maximum(0, t - .05) / .01) * (t > .05))
    return x * .9
def chain(d=1.4):
    n = int(d * SR); x = np.zeros(n)
    for k in range(10):
        i = int(R.uniform(0, d - .1) * SR); m = int(.08 * SR); tt = ar(m); x[i:i + m] += np.sin(2 * np.pi * R.uniform(1800, 3500) * tt) * np.exp(-tt / .03) * (1 - i / n)
    return x * .7
def breath(d=3.0):
    n = int(d * SR); t = ar(n); return noise(d, 300, 1800) * (np.maximum(0, np.sin(2 * np.pi * t / 1.5)) ** 2) * .25

# 1) quadro 0: clique de câmera do celular; drone
put(FX, shutter(), 0, .7); ev('clique de câmera (quadro 0)', 0)
put(MU, fftfilt(pad([40, 47, 52], DUR, .1)[:N], lp(500)), 0, .6, 0, .2); ev('drone grave Mi menor (o episódio todo)', 0)
put(FX, whoosh(.35), wt('mensagem', 'mandou') - .2, .3); put(FX, bell(91, .4) * .4, wt('mensagem', 'mandou') + .1, .4); ev('mensagem enviada do meu número', wt('mensagem', 'mandou'))
# 2) morto, rádio, SUSPEITO
put(FX, boom(2.0), tMorto, .75, 0, .4); ev('IMPACTO: olho mágico, fita no 302', tMorto)
for k in (0.3, 3.5): put(FX, radio(), tMorto + k, .3, .5, .3)
put(FX, stamp(), wt('suspeito', 'eu.') - .05, .7); put(FX, boom(1.4), wt('suspeito', 'eu.'), .5); ev('carimbo SUSPEITO', wt('suspeito', 'eu.'))
# 3) BAM BAM BAM (silêncio na música)
for k in KN: put(FX, knock(), k, 1.0)
ev('BAM BAM BAM na porta (música para)', KN[0])
# 4) corrente solta
put(FX, chain(), S['corrente']['t0'] + .1, .5, -.2); ev('corrente balançando', S['corrente']['t0'] + .1)
# 5) a foto ao vivo: respiração + ASSOBIO colado ao microfone
put(FX, breath(), tLive, .5); put(FX, whistle(), tLive + .3, .55, 0, .2); ev('FOTO AO VIVO: respiração + ASSOBIO de 4 notas', tLive)
t = S['cama']['t0']
while t < S['contar']['t0']: put(MU, heart(), t, .5); t += .85
ev('coração', S['cama']['t0'])
# 6) delegada vai contar; assobio atrás dela; chaves; 301
put(FX, boom(1.4), wt('contar', 'dez.'), .45); ev('"Vou contar até dez"', wt('contar', 'dez.'))
put(FX, whistle(muff=True), wt('assobio', 'alguém'), .45, .35, .4); ev('assobio atrás da delegada', wt('assobio', 'alguém'))
put(FX, keys(1.2), wt('valdir', 'chave'), .35, .4); ev('chaves do porteiro', wt('valdir', 'chave'))
put(FX, boom(2.2), wt('chave', 'meu.') - .05, .75, 0, .5); ev('IMPACTO em "a do meu" (silêncio antes)', wt('chave', 'meu.'))
t = S['contar']['t0']
while t < S['chave']['t0']: put(MU, heart(), t, .55); t += .7
# 7) ameaça + foto da porta
tM = S['chegou']['v1'] - .1
for k in (0, 1.1): put(FX, vibra(), tM + k, .55); put(FX, plim(), tM + k + .05, .5)
ev('"Mostra a foto e você é o próximo." + foto da minha porta', tM)
put(FX, whistle(muff=True), tM + 1.8, .12, .5, .4)
# 8) contagem da delegada (voz em contagem.wav): tique por segundo, coração acelerado, maçaneta no fim
for k in range(10): put(FX, tick(True), T0 + k, .35); put(FX, tick(False), T0 + k + .5, .22)
t = T0
while t < tEndC: put(MU, heart(), t, .6); t += .5
ev('contagem 1..10: tique por segundo + coração', T0)
put(FX, creak(.7), tEndC, .6); put(FX, knock() * .5, tEndC + .55, .6); put(FX, boom(2.5), tEndC + .6, .6, 0, .5); ev('A MAÇANETA GIRA + corte', tEndC)
put(FX, whistle(), tEndC + 1.2, .35, 0, .6); ev('assobio final', tEndC + 1.2)

# ── mixagem
ir = make_ir(1.6, 4)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .25; FX[:, c] += conv(SEND[:, c], ir) * .25
duck = np.ones(N)
for s in TL['scenes']:
    i, j = int((s['v0'] - .08) * SR), int((s['v1'] + .12) * SR); duck[max(0, i):min(N, j)] = .45
kk = int(.1 * SR); duck = np.convolve(duck, np.ones(kk) / kk, 'same')
mus = MU * duck[:, None]
for a0, a1 in ((KN[0] - .3, S['corrente']['t0']), (tLive - .1, tLive + 3.2), (wt('chave', 'meu.') - .45, wt('chave', 'meu.') - .05)):
    i0, i1 = int(a0 * SR), int(a1 * SR); mus[i0:i1] *= .0
mix = mus + FX * (.65 + .35 * duck[:, None])
f = int(1.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · 10 SEGUNDOS · Ep. 1 v2 "A foto das 3h10"\n\nFALAS\n')
    for s in TL['scenes']: fo.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  {s['key']:9s} [{s['fala']}] {s['texto']}\n")
    fo.write('\nTRILHA E EFEITOS\n'); [fo.write(f'{t0:6.2f}  {n}\n') for t0, n in sorted(EV)]
print('trilha ok', round(DUR, 2), 's ·', len(EV), 'marcas')
