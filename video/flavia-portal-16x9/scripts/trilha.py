"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — Portal da Flávia Valadão (16:9).
Piano calmo a 80 BPM em Fá maior (Fá7M – Lám7 – Rém7 – Si♭7M), pad suave, cliques discretos de interface nas ações do cursor
e um sino leve a cada troca de capítulo. Ducking sob a voz. Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, conv, fftfilt, hp, lp, make_ir, pad, piano

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json')); S = {s['key']: s for s in TL['scenes']}
DUR = TL['frames'] / 30; N = int(DUR * SR); BEAT = 60 / 80; BAR = 4 * BEAT; R = np.random.default_rng(80)
MU, FX, SEND = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(n, t0): EV.append((round(t0, 2), n))
def word(k, w):
    import unicodedata
    n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
    return next(x[1] for x in TL['words'][k] if n_(x[0]) == n_(w))
def uiclick():
    n = int(.05 * SR); t = ar(n); return fftfilt(R.standard_normal(n), band(1800, 6000)) * np.exp(-t / .006) * .6 + np.sin(2 * np.pi * 1400 * t) * np.exp(-t / .01) * .3

PROG = [([53, 57, 60, 64], 41), ([57, 60, 64, 67], 45), ([50, 53, 57, 60], 38), ([46, 50, 53, 57], 34)]
MEL = [72, 69, 67, 69, 72, 74, 72, 69, 65, 67, 69, 72, 70, 69, 67, 65]
t0 = 1.0; bar = 0
while t0 < DUR - 2:
    ch, root = PROG[bar % 4]; dens = 1.0 if t0 > S['login']['t0'] else .6
    put(MU, piano(root, BAR * 1.2), t0, .35, -.2, .4)
    for i, m in enumerate(ch): put(MU, piano(m, BAR), t0 + i * .06, .16 * dens, -.1 + i * .08, .5)
    for b in range(4):
        if bar % 2 == 1 or b in (0, 2): put(MU, piano(MEL[(bar * 4 + b) % 16], 1.4), t0 + b * BEAT + BEAT * .5, .14 * dens, .25, .6)
    put(MU, pad(ch, BAR + .6, .1), t0, .05, 0, .5)
    t0 += BAR; bar += 1
ev('piano 80 BPM em Fá maior + pad (o vídeo todo)', 1.0)
# sino suave em cada capítulo
for k in ['login', 'painel', 'planta', 'imagens', 'compras', 'obra', 'plantas', 'retorno']:
    put(FX, bell(84, 1.6) * .5, S[k]['t0'] + .05, .25, .3, .5); ev(f'capítulo: {k}', S[k]['t0'] + .05)
# cliques do cursor (mesmos tempos do Film.tsx)
for nome, tc in [('entrar', word('login', 'senha.') + .35), ('cozinha', word('planta', 'entrar.') + .05), ('imagem', word('imagens', 'tela') - .25), ('já comprei', word('compras', 'marcar,') - .05)]:
    put(FX, uiclick(), tc, .55); ev(f'clique: {nome}', tc)
# assinatura: acorde final
ta = S['assinatura']['t0'] + .2
for i, m in enumerate([41, 53, 57, 60, 64, 69]): put(MU, piano(m, 4.0), ta + i * .05, .3 if i == 0 else .18, -.2 + i * .08, .6)
ev('acorde final (assinatura)', ta)

ir = make_ir(2.2, 11)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .35
duck = np.ones(N)
for s in TL['scenes']:
    i, j = int((s['v0'] - .1) * SR), int((s['v1'] + .15) * SR); duck[max(0, i):min(N, j)] = .5
kk = int(.15 * SR); duck = np.convolve(duck, np.ones(kk) / kk, 'same')
mix = MU * duck[:, None] + FX
f = int(2.0 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.2) * .45
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · Portal Flávia Valadão (16:9)\n\nFALAS (voz Pri)\n')
    for s in TL['scenes']: fo.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  {s['key']:10s} {s['texto']}\n")
    fo.write('\nTRILHA E EFEITOS\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(EV)]
print('trilha ok', round(DUR, 2), 's')
