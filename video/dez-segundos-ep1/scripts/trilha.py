"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — série 10 SEGUNDOS, Ep. 1 "O áudio das 3h12". Suspense sem sangue.
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
KN = [S['batida']['t0'] + .25, S['batida']['t0'] + .6, S['batida']['t0'] + .95, S['entao']['t0'] + .05, S['entao']['t0'] + .35]
tZero = S['escolha']['t0'] + .25 + 10
tMorto = S['morto']['t0']; e1 = S['audio']

# 1) quadro 0: vibração; drone entra baixo
put(FX, vibra(), 0, .55); put(FX, vibra(), .55, .45); ev('vibração do celular (quadro 0)', 0)
put(MU, fftfilt(pad([40, 47, 52], DUR, .1)[:N], lp(500)), 0, .55, 0, .2); ev('drone grave Mi menor (o episódio todo)', 0)
# 2) "Às sete, ele tava morto": impacto, rádio, carimbo, passos
put(FX, boom(2.0), tMorto, .7, 0, .4); ev('IMPACTO: olho mágico, fita no 302', tMorto)
for k in (0, 2.4, 6.5): put(FX, radio(), tMorto + .4 + k, .3, .5, .3)
ev('rádio da polícia ao fundo', tMorto + .4)
put(FX, stamp(), wt('fichas', 'comigo.', end=True) + .1, .6); ev('carimbo ÓBITO · 07:04', wt('fichas', 'comigo.', end=True) + .1)
for i in range(8): put(FX, step(), S['policia']['t0'] + .3 + i * .55, .35, .6 - i * .15)
ev('passos do policial no corredor', S['policia']['t0'] + .3)
# 3) play: silêncio só com respiração (a trilha some)
ev('silêncio antes do play', S['play']['t0'])
# 4) o áudio do Seu Elias: no fundo, chaves e o assobio; no fim, porta rangendo e corte
tEnd = e1['v1']
put(FX, keys(.9), tEnd - .9, .12, .4); put(FX, whistle(muff=True), tEnd - 1.6, .08, .4)
put(FX, fftfilt(creak(1.0), band(300, 3400)), tEnd + .05, .4); ev('no áudio: chaves + assobio (baixinho) e porta rangendo; corte', tEnd - 1.6)
# 5) de novo, volume máximo: cliques de volume
for i in range(6): put(FX, tick(True) * .6, wt('denovo', 'volume') + i * .14, .4)
ev('cliques de volume', wt('denovo', 'volume'))
# 6) o barulho isolado: chaves e ASSOBIO (tema)
put(FX, keys(1.0), wt('fundo', 'Chaves.') - .1, .5, -.2); ev('CHAVES isoladas', wt('fundo', 'Chaves.') - .1)
put(FX, whistle(), wt('fundo', 'assobiando.') - .05, .45, .2, .4); ev('ASSOBIO de 4 notas (tema da série)', wt('fundo', 'assobiando.'))
t = S['fundo']['t0']
while t < KN[0] - .3: put(MU, heart(), t, .5); t += .9
ev('coração', S['fundo']['t0'])
# 7) batidas na porta (a música para)
for k in KN: put(FX, knock(), k, .9)
ev('TOC TOC TOC (silêncio na trilha)', KN[0])
# 8) delegada; assobio atrás dela; chaves; chave 301
put(FX, whistle(muff=True), wt('assobio', 'alguém'), .4, .35, .4); ev('assobio atrás da delegada', wt('assobio', 'alguém'))
put(FX, keys(1.2), wt('valdir', 'chave'), .35, .4); put(FX, whistle(muff=True), S['valdir']['v1'] - .2, .2, .35, .4); ev('chaves do porteiro', wt('valdir', 'chave'))
put(FX, boom(2.2), wt('chave', 'meu.') - .05, .7, 0, .5); ev('IMPACTO em "a do meu" (silêncio antes)', wt('chave', 'meu.'))
t = S['delegada']['t0']
while t < S['chave']['t0']: put(MU, heart(), t, .55); t += .75
t = S['entao']['t0'] + .6
while t < S['escolha']['t0']: put(MU, heart(), t, .6); t += .6
ev('coração acelerando', S['delegada']['t0'])
# 9) mensagem: vibração + plim; assobio bem baixo
tM = S['mensagem']['t0'] + .7
put(FX, vibra(), tM, .55); put(FX, plim(), tM + .05, .5); ev('"Apaga o áudio." (vibração + plim)', tM)
put(FX, whistle(muff=True), S['mensagem']['v1'] + .1, .1, .5, .4)
# 10) decisão: tique-taque, assobio no zero
put(FX, boom(1.4), S['escolha']['t0'], .45); ev('cartão de decisão', S['escolha']['t0'])
t, k = S['escolha']['t0'] + .25, 0
while t < tZero: put(FX, tick(k % 2 == 0), t, .4 if t > tZero - 3 else .28); t += .5; k += 1
ev('tique-taque da contagem', S['escolha']['t0'] + .25)
put(FX, whistle(), tZero + .1, .5, 0, .6); put(FX, boom(2.5), tZero + .1, .5); ev('zero: o assobio de novo', tZero + .1)

# ── mixagem
ir = make_ir(1.6, 4)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .25; FX[:, c] += conv(SEND[:, c], ir) * .25
duck = np.ones(N)
for s in TL['scenes']:
    i, j = int((s['v0'] - .08) * SR), int((s['v1'] + .12) * SR); duck[max(0, i):min(N, j)] = .45
kk = int(.1 * SR); duck = np.convolve(duck, np.ones(kk) / kk, 'same')
mus = MU * duck[:, None]
for a0, a1 in ((S['play']['t0'], e1['t1']), (KN[0] - .3, S['delegada']['t0']), (wt('chave', 'meu.') - .45, wt('chave', 'meu.') - .05)):
    i0, i1 = int(a0 * SR), int(a1 * SR); mus[i0:i1] *= .0
mix = mus + FX * (.65 + .35 * duck[:, None])
f = int(1.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · 10 SEGUNDOS · Ep. 1 "O áudio das 3h12"\n\nFALAS\n')
    for s in TL['scenes']: fo.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  {s['key']:9s} [{s['fala']}] {s['texto']}\n")
    fo.write('\nTRILHA E EFEITOS\n'); [fo.write(f'{t0:6.2f}  {n}\n') for t0, n in sorted(EV)]
print('trilha ok', round(DUR, 2), 's ·', len(EV), 'marcas')
