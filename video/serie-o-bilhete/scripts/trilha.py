"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — série O BILHETE, Ep. 1 "A calça". Comédia de perseguição a 120 BPM em Fá maior.
Gancho de programa de sorteio (rufar + "ding" por número) → "record scratch" e silêncio em "e a sua mãe" → pizzicato discreto →
perseguição completa (bumbo, palmas, baixo saltitante, pizzicato) da corrida à busca → 0,4 s de silêncio antes de "Cinco reais" →
trombone triste → batida abafada da festa (abre em "E lá está ela") → corte seco no "Que foi?" → vibração do celular →
pulso tenso com tique-taque até a contagem → buzina no zero e vinheta final. Ducking sob a voz.
Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, boom, click, conv, fftfilt, hp, hz, lp, make_ir, pad, sweep, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = .5; BAR = 2.0; R = np.random.default_rng(48)
n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
def wt(k, w, nth=0, end=False):
    h = [x for x in TL['words'][k] if n_(x[0]) == n_(w)]; x = h[nth] if nth < len(h) else h[0]; return x[2] if end else x[1]

MU, FX, SEND = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    if s.ndim == 2: buf[i:j] += s; return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(name, t0): EV.append((round(t0, 2), name))
def noise(dur, lo, hi): return fftfilt(R.standard_normal(int(dur * SR)), band(lo, hi))
def env(n, a=.005, d=.2): t = ar(n); return np.minimum(1, t / a) * np.exp(-t / d)

# ── timbres
def kick(): n = int(.35 * SR); t = ar(n); return np.tanh(1.5 * sweep(140, 48, .03, n) * np.exp(-t / .16))
def clap():
    n = int(.25 * SR); x = np.zeros(n)
    for k, d in enumerate((0, .01, .02)): i = int(d * SR); m = n - i; x[i:] += R.standard_normal(m) * np.exp(-ar(m) / (.01 if k < 2 else .09))
    return fftfilt(x, band(900, 6000)) * 1.2
def hat(): n = int(.05 * SR); return fftfilt(R.standard_normal(n), hp(7000, 3)) * env(n, .001, .015)
def pizz(m, d=.28):
    n = int(d * SR); t = ar(n); f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (8 + 6 * k)) for k, a in ((1, 1), (2, .5), (3, .3), (4, .15)))
    return x * np.minimum(1, t / .002)
def bass(m, d=.22):
    n = int(d * SR); t = ar(n); x = np.sin(2 * np.pi * hz(m) * t) + .35 * np.sign(np.sin(2 * np.pi * hz(m) * t)) * .5
    return fftfilt(x, lp(700)) * np.minimum(1, t / .004) * np.exp(-t / .12)
def brass(m, d, vib=0.0):
    n = int(d * SR); t = ar(n); f = hz(m) * (1 + vib * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / .2))
    ph = np.cumsum(f) / SR; x = 2 * (ph % 1) - 1
    return fftfilt(x, lp(1400, 2)) * np.minimum(1, t / .04) * np.minimum(1, (d - t) / .08)
def scratch(d=.45):
    n = int(d * SR); t = ar(n); f = 900 * np.exp(-t / .08) + 120 + 600 * np.maximum(0, t - .2) / d
    return fftfilt(np.sin(2 * np.pi * np.cumsum(f) / SR) * (R.random(n) < .6), band(200, 4000)) * np.sin(np.pi * t / d) * .9
def roll(d):
    n = int(d * SR); x = np.zeros(n); t = 0.0
    while t < d: i = int(t * SR); c = clap()[: n - i] * (.3 + .7 * t / d); x[i:i + len(c)] += c; t += .045
    return x * .4
def tick(hi=True):
    n = int(.04 * SR); t = ar(n); return np.sin(2 * np.pi * (3200 if hi else 2400) * t) * np.exp(-t / .006)
def buzz(d=.7):
    n = int(d * SR); t = ar(n); return fftfilt(np.sign(np.sin(2 * np.pi * 150 * t)), lp(1100)) * np.minimum(1, (d - t) / .05) * .7
def vibra(d=.5):
    n = int(d * SR); t = ar(n); return fftfilt(np.sin(2 * np.pi * 170 * t) * (np.sin(2 * np.pi * 22 * t) > 0), lp(400)) * .8
def plim(): return bell(91, .6) * .5 + bell(96, .6)[: int(.6 * SR)] * .4

F = [53, 57, 60]; BB = [58, 62, 65]; C7 = [60, 64, 67]; DM = [62, 65, 69]
PROG = [(F, 41), (BB, 46), (C7, 48), (F, 41)]
MEL = [72, 69, 72, 74, 72, 69, 67, 65]

def groove(t0, t1, lvl=1.0, kick_on=True, claps=True, bassline=True, plz=True, lp_cut=None):
    out = np.zeros((int((t1 - t0) * SR) + SR, 2)); t, bar = t0, 0
    def P(sig, tt, g=1.0, pan=0.0):
        i = int((tt - t0) * SR)
        if i < 0 or i >= len(out): return
        j = min(len(out), i + len(sig)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        out[i:j, 0] += sig[:j - i] * g * l * .707; out[i:j, 1] += sig[:j - i] * g * r * .707
    while t < t1 - .01:
        ch, root = PROG[bar % 4]
        for b in range(4):
            tb = t + b * BEAT
            if tb >= t1: break
            if kick_on and b in (0, 2): P(kick(), tb, .8)
            if claps and b in (1, 3): P(clap(), tb, .35, .1)
            P(hat(), tb + BEAT / 2, .25, .4)
            if bassline:
                P(bass(root), tb, .55); P(bass(root + 7), tb + BEAT / 2, .4)
            if plz:
                m = MEL[(bar * 4 + b) % 8] + (0 if bar % 2 == 0 else -2 if b == 3 else 0)
                P(pizz(m), tb, .35, -.3); P(pizz(ch[(b) % 3] + 12), tb + BEAT / 2, .2, .3)
        t += BAR; bar += 1
    if lp_cut: out = np.stack([fftfilt(out[:, c], lp(lp_cut, 2)) for c in range(2)], 1)
    put(MU, out[: int((t1 - t0) * SR)] * lvl, t0)

# ── tempos (palavras reais)
g = S['gancho']; tMae = wt('gancho', 'e') - .05; n0 = g['v0'] + .25; nd = (wt('gancho', 'loteria…') - n0) / 6
tCinco = wt('vendi', 'Cinco'); tQue = S['leo']['v0']; tZero = S['escolha']['t0'] + .25 + 10

# 1) gancho: programa de sorteio
put(MU, roll(nd * 6), n0 - .05, .5); ev('rufar do sorteio', n0)
for i in range(6): put(FX, bell(84 + [0, 2, 4, 5, 7, 9][i], 1.0), n0 + i * nd, .45, -.5 + i * .2, .3)
ev('ding por número (6)', n0)
put(MU, brass(65, .35) + brass(69, .35) * .8 + brass(72, .35) * .7, tMae - .4, .3); ev('fanfarra curta', tMae - .4)
put(FX, scratch(), tMae, .7); ev('RECORD SCRATCH em "e a sua mãe" (música para)', tMae)
put(FX, boom(1.4), wt('gancho', 'doou'), .4)

# 2) ficha → mãe: pizzicato discreto (sem bateria)
groove(S['ficha']['t0'] + .2, S['corrida']['t0'], .55, kick_on=False, claps=False, bassline=False); ev('pizzicato discreto (ficha, flashback, mãe)', S['ficha']['t0'] + .2)
put(FX, whoosh(.4) * .6, S['flash']['t0'], .3); ev('virada de página (flashback)', S['flash']['t0'])
put(FX, noise(.4, 300, 2500) * env(int(.4 * SR), .02, .1), wt('ficha', 'reais.', end=True) + .1, .4); ev('carimbo MILIONÁRIO?', wt('ficha', 'reais.', end=True) + .1)

# 3) perseguição: da corrida até "Cinco reais"
tRun = wt('corrida', 'Você') - .1
groove(S['corrida']['t0'], tRun, .6, kick_on=True, claps=False, plz=False); ev('relógio: bazar fecha às 18h (bumbo + baixo)', S['corrida']['t0'])
groove(tRun, tCinco - .45, 1.0); ev('PERSEGUIÇÃO completa (120 BPM)', tRun)
for i in range(12): put(FX, noise(.08, 200, 1500) * env(int(.08 * SR), .002, .03), tRun + i * .25, .3, (-1) ** i * .2)
put(FX, bell(96, .4) * .5, S['bazar']['t0'] + .05, .5); ev('sino da porta do bazar', S['bazar']['t0'] + .05)
a, b = S['busca']['t0'], S['busca']['t1'] - .2
for i in range(30): put(FX, whoosh(.18), a + i * (b - a) / 30, .12, R.uniform(-.6, .6))
ev('swish de 30 calças', a)
put(FX, buzz(.25), wt('busca', 'Nenhuma'), .35); ev('erro: NENHUMA', wt('busca', 'Nenhuma'))
ev('SILÊNCIO antes de "Cinco reais"', tCinco - .45)
put(FX, boom(1.0), tCinco, .45)

# 4) trombone triste e retomada leve
tc = S['cinco']['t0'] + .1
for i, (m, d) in enumerate([(58, .4), (57, .4), (56, .4), (55, 1.4)]): put(MU, brass(m, d, .03 if i == 3 else 0), tc + i * .42, .5, 0, .3)
ev('trombone triste (R$ 5 × R$ 48 milhões)', tc)
groove(S['capacete']['t0'], S['festa']['t0'], .6, claps=False); ev('groove leve (capacete)', S['capacete']['t0'])
put(FX, whoosh(.5), wt('capacete', 'capacete.') - .3, .3)

# 5) festa: batida abafada que abre no "E lá está ela"; corte no "Que foi?"
tE = wt('festa', 'E') - .1
groove(S['festa']['t0'], tE, .8, lp_cut=500); groove(tE, tQue - .25, 1.0); ev('festa: batida abafada → nítida em "E lá está ela"', S['festa']['t0'])
put(FX, scratch(.35), tQue - .3, .6); ev('scratch: música para no "Que foi?"', tQue - .3)

# 6) mensagem de voz: vibração e plim
tv = S['audio']['t0'] + .05
for i in range(3): put(FX, vibra(), tv + i * .6, .5)
put(FX, plim(), S['audio']['v0'] - .2, .5); ev('vibração + plim da mensagem', tv)
put(MU, pad([53, 60, 65], S['audio']['t1'] - S['audio']['t0'], .2), S['audio']['t0'], .2); ev('pad suave sob a mensagem', S['audio']['t0'])

# 7) caminhão → decisão: pulso tenso + tique-taque; contagem; buzina; vinheta
tk0 = S['caminhao']['t0']; t, k = tk0, 0
while t < tZero:
    sec = t >= S['escolha']['t0'] + .25
    put(FX, tick(k % 2 == 0), t, .35 if sec else .22, .3 if k % 2 else -.3); t += .5; k += 1
ev('tique-taque (caminhão e contagem)', tk0)
t = tk0
while t < tZero: put(MU, bass(41, .3), t, .5); put(MU, kick(), t, .4); t += 1.0
ev('pulso tenso (1 por segundo)', tk0)
put(FX, boom(1.4), S['escolha']['t0'], .45); ev('cartão de decisão', S['escolha']['t0'])
put(FX, buzz(.9), tZero, .6); ev('zero: buzina', tZero)
for i, m in enumerate([65, 69, 72, 77]): put(MU, pizz(m, .5), tZero + .4 + i * .15, .6)
put(MU, brass(65, 1.2) + brass(72, 1.2) * .7, tZero + 1.0, .3); ev('vinheta final "O BILHETE"', tZero + .4)

# ── mixagem
ir = make_ir(1.4, 9)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .3
duck = np.ones(N)
for s in TL['scenes']:
    i, j = int((s['v0'] - .08) * SR), int((s['v1'] + .12) * SR); duck[max(0, i):min(N, j)] = .42
kk = int(.1 * SR); duck = np.convolve(duck, np.ones(kk) / kk, 'same')
mus = MU * duck[:, None]
for a0, a1 in ((tMae + .05, wt('gancho', 'bilhete.', end=True) + .3), (tCinco - .45, tCinco - .02), (tQue - .05, S['leo']['t1'])):
    i0, i1 = int(a0 * SR), int(a1 * SR); mus[i0:i1] *= 0
mix = mus + FX * (.6 + .4 * duck[:, None])
f = int(1.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · O BILHETE · Ep. 1 "A calça"\n\nFALAS\n')
    for s in TL['scenes']: fo.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  {s['key']:9s} [{s['fala']}] {s['texto']}\n")
    fo.write('\nTRILHA E EFEITOS\n'); [fo.write(f'{t0:6.2f}  {n}\n') for t0, n in sorted(EV)]
print('trilha ok', round(DUR, 2), 's ·', len(EV), 'marcas')
