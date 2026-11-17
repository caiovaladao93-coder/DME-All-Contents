"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — série 72 HORAS, Parte 1 "O GALPÃO".
Suspense a 90 BPM em Ré menor: drone grave + tique-taque de relógio que acompanha o episódio todo; pulso de baixo e "batida de coração"
a partir dos pedidos; corte seco antes de "Só o Beto sabe"; telefone, teclado, carimbos e porta como efeitos;
a contagem de 10 s é marcada por tiques que aceleram e uma buzina no zero. Ducking sob a voz.
Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, blip, boom, click, conv, fftfilt, hp, hz, lp, make_ir, pad, sub_pulse, sweep, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = 60 / 90; R = np.random.default_rng(72)
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
def ad(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def ev(name, t0): EV.append((round(t0, 2), name))

# ── timbres próprios
def tick(hi=True):
    n = int(.05 * SR); t = ar(n); f = 3400 if hi else 2500
    return (np.sin(2 * np.pi * f * t) * .6 + fftfilt(R.standard_normal(n), band(2000, 8000)) * .5) * np.exp(-t / .006)
def noise(dur, lo, hi):
    n = int(dur * SR); return fftfilt(R.standard_normal(n), band(lo, hi))
def env(n, a=.005, d=.2):
    t = ar(n); return np.minimum(1, t / a) * np.exp(-t / d)
def stamp():
    n = int(.5 * SR); t = ar(n); x = sweep(150, 50, .02, n) * np.exp(-t / .08) + noise(.5, 300, 3000) * np.exp(-t / .02) * .8
    return np.tanh(2 * x)
def thud(f0=95):
    n = int(.6 * SR); t = ar(n); return sweep(f0, 38, .04, n) * np.exp(-t / .16)
def heart():
    n = int(.9 * SR); x = np.zeros(n); a = thud(70)[:n]; x[:len(a)] += a; b = thud(60)[: n - int(.24 * SR)] * .7; i = int(.24 * SR); x[i:i + len(b)] += b; return x
def ring(dur=1.1):  # toque de telefone: duas notas moduladas a 20 Hz
    n = int(dur * SR); t = ar(n); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 20 * t)))
    return fftfilt(x, band(300, 3500)) * np.minimum(1, t / .01) * np.minimum(1, (dur - t) / .03) * .5
def buzz(dur=.6):
    n = int(dur * SR); t = ar(n); x = np.sign(np.sin(2 * np.pi * 160 * t)) * (.6 + .4 * np.sin(2 * np.pi * 31 * t))
    return fftfilt(x, lp(900)) * np.minimum(1, t / .01) * np.minimum(1, (dur - t) / .05)
def key():
    n = int(.045 * SR); t = ar(n); return fftfilt(R.standard_normal(n), band(1200, 6000)) * np.exp(-t / .007) + np.sin(2 * np.pi * 180 * t) * np.exp(-t / .01) * .4
def creak(dur=.9):
    n = int(dur * SR); t = ar(n); f = 380 + 140 * np.sin(2 * np.pi * 1.3 * t) + 40 * R.standard_normal(n).cumsum() / np.sqrt(n)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (R.random(n) < .35)
    return fftfilt(x.astype(float), band(500, 3000)) * np.sin(np.pi * t / dur) * .5
def rattle(dur):  # portão de aço subindo: rolagem de ripas
    n = int(dur * SR); x = noise(dur, 80, 1800) * .35; t = ar(n)
    for k in np.arange(0, dur, .045): i = int(k * SR); m = min(n - i, int(.03 * SR)); x[i:i + m] += noise(.03, 400, 4000)[:m] * np.exp(-ar(m) / .006) * .6
    return x * np.minimum(1, t / .05) * np.minimum(1, (dur - t) / .2)

# ── tempos (palavras reais)
g, tHoras, tVida = S['gancho'], wt('gancho', 'horas'), wt('gancho', 'vida.')
tSo = wt('quadro', 'Só'); tBeto = S['beto']['t0']; tEsc = S['escolha']['t0']; tZero = tEsc + .25 + 10; tEnd = DUR

# 1) DRONE grave (Ré menor) o episódio todo, com filtro que abre aos poucos; pausa antes de "Só o Beto sabe"
dr = pad([38, 45, 50], DUR + .5, bright=.15)[:N] * .5
sw = np.linspace(0, 1, N); dr = fftfilt(dr, lp(700)) * (.6 + .5 * sw)
put(MU, dr, 0, .55, 0, .3); ev('drone Rém (o episódio todo)', 0)
put(MU, pad([62, 65, 69], 6.5, .3), S['anexo']['t0'] + 2, .18, .3, .5); ev('pad agudo de suspense (foto)', S['anexo']['t0'] + 2)

# 2) TIQUE-TAQUE do relógio a 90 BPM desde "horas" até o zero da contagem (acelera nos últimos 10 s)
t, k = tHoras, 0
while t < tEsc + .25:
    put(FX, tick(k % 2 == 0), t, .22 if t < S['luzes']['t0'] else .16, .35 if k % 2 else -.35); t += BEAT; k += 1
ev('tique-taque do relógio (90 BPM) começa', tHoras)
for sgn in range(10):  # contagem: 1 tique forte por segundo, com taque a meio segundo nos últimos 3
    ts = tEsc + .25 + sgn; put(FX, tick(True), ts, .5); put(FX, thud(120) * .3, ts, .35)
    if sgn >= 7: put(FX, tick(False), ts + .5, .4)
ev('contagem: tique por segundo', tEsc + .25)

# 3) PULSO de baixo (colcheias) dos pedidos ao quadro; corte seco; volta com "coração" no Beto
def pulse(t0, t1, g=.5, root=38):
    t = t0
    while t < t1: put(MU, sub_pulse(root, 1)[: int(BEAT / 2 * SR)], t, g); t += BEAT / 2
pulse(S['pedidos']['t0'], tSo - .45, .32); ev('pulso grave em colcheias', S['pedidos']['t0'])
ev('SILÊNCIO antes de "Só o Beto sabe"', tSo - .45)
t = tBeto
while t < S['cliente']['t1']:
    put(MU, heart(), t, .55); t += BEAT * 2
ev('batida de coração (Beto → cliente)', tBeto)
pulse(S['login']['t0'], S['porta']['t0'] - .3, .3, 36); ev('pulso grave volta (sistema/e-mail)', S['login']['t0'])
t = S['socio']['t0']
while t < tEsc: put(MU, heart(), t, .6); t += BEAT * 1.5
ev('coração acelera (sócio)', S['socio']['t0'])

# 4) EFEITOS de cena
put(FX, key(), g['t0'] + .9, .5); put(FX, key(), g['t0'] + 1.05, .4); ev('molho de chaves', g['t0'] + .9)
put(FX, click() * 2, wt('gancho', 'pai…') - .1, .6); put(FX, thud(160), wt('gancho', 'pai…'), .3); ev('chave gira na fechadura', wt('gancho', 'pai…') - .1)
put(FX, rattle(.9), tVida + .15, .45, 0, .4); put(FX, boom(1.6), tVida + .8, .5, 0, .3); ev('portão de aço sobe + impacto', tVida + .15)
put(FX, whoosh(.4, False), S['cracha']['t0'], .3); put(FX, thud(140), S['cracha']['t0'] + .4, .35); ev('crachá cai na mesa', S['cracha']['t0'] + .4)
put(FX, stamp(), wt('cracha', 'quis.'), .7); ev('carimbo NENHUM', wt('cracha', 'quis.'))
for i in range(7): put(FX, ad(click() * 1.5, thud(220) * .3), wt('luzes', 'acende') - .05 + i * .16, .45 - i * .04, 0, .5)
ev('reatores acendendo, um a um', wt('luzes', 'acende'))
a, b = wt('pedidos', 'Mil'), wt('pedidos', 'sete', end=True) + .15
for i, tt in enumerate(np.arange(a, b, .05)): put(FX, blip(96 + (i % 3)) * .25, tt, .12)
put(FX, boom(1.2), b, .55); put(FX, stamp(), wt('pedidos', 'parados.'), .55); ev('contador 1.247 rolando + impacto + carimbo', a)
for i in range(3): put(FX, whoosh(.25), wt('planilhas', 'Três') + i * .17, .2, -.4 + i * .4)
for w in ('Nenhuma', 'bate', 'outra.'): put(FX, buzz(.18), wt('planilhas', w), .18)
ev('três erros (círculos vermelhos)', wt('planilhas', 'Nenhuma'))
for i in range(6): put(FX, noise(.12, 1500, 7000) * env(int(.12 * SR), .01, .04), wt('quadro', 'quadro') + i * .3, .3, -.5 + i * .2)
ev('bilhetes de papel', wt('quadro', 'quadro'))
put(FX, boom(2.2), tSo, .5, 0, .4); ev('impacto grave em "Só o Beto sabe"', tSo)
put(FX, creak(1.0), tBeto + .1, .3, -.3, .3); ev('cadeira rangendo sozinha', tBeto + .1)
put(FX, whoosh(.5), wt('beto', 'pediu') - .1, .35); put(FX, stamp(), wt('beto', 'ontem.'), .7); ev('carta + carimbo DESLIGADO', wt('beto', 'ontem.'))
tr = wt('telefone', 'telefone') - .1
for i in range(3):
    put(FX, ring(), tr + i * 1.6, .45); put(FX, buzz(.6) * .6, tr + i * 1.6, .25)
ev('telefone tocando', tr)
put(FX, blip(76) * .5, S['cliente']['t0'] + .05, .4); ev('chamada atendida', S['cliente']['t0'] + .05)
put(FX, boom(1.4), wt('cliente', 'cancelo'), .45); ev('impacto em "cancelo"', wt('cliente', 'cancelo'))
for i in range(15): put(FX, key(), S['login']['t0'] + .2 + i * .09 if i < 7 else wt('login', 'tenta') + (i - 7) * .15, .35, R.uniform(-.3, .3))
put(FX, buzz(.35), wt('login', 'Senha?'), .4); ev('teclado + erro de senha', wt('login', 'Senha?'))
put(FX, noise(.3, 800, 5000) * env(int(.3 * SR), .05, .1), wt('login', 'Pergunta') - .15, .3); ev('post-it sai de baixo do teclado', wt('login', 'Pergunta') - .15)
put(FX, blip(88) + blip(93)[::1] * .6, wt('email', 'Chega'), .45); ev('notificação de e-mail', wt('email', 'Chega'))
for w in TL['words']['email']:
    if w[1] >= wt('email', 'Eu') - .01:
        for j in range(len(w[0])): put(FX, key(), w[1] + j * .035, .25)
ev('assunto digitado', wt('email', 'Eu'))
a = wt('anexo', 'uma'); b = wt('anexo', 'foto…', end=True)
put(FX, sweep(300, 1400, 2, int((b - a) * SR)) * .06 * np.linspace(.2, 1, int((b - a) * SR)), a, 1); put(FX, blip(91), b, .4); ev('download do anexo', a)
put(FX, boom(2.4), wt('anexo', 'sócio'), .7, 0, .5); ev('IMPACTO: proposta de compra', wt('anexo', 'sócio'))
put(FX, ad(click() * 2.5, thud(300) * .3), wt('porta', 'porta') - .35, .6); put(FX, creak(.9), wt('porta', 'porta') - .1, .35, .2, .4); ev('maçaneta + porta abrindo', wt('porta', 'porta') - .35)
put(FX, whoosh(.5), wt('socio', 'Vamos'), .25); ev('pasta PROPOSTA desliza', wt('socio', 'Vamos'))
put(FX, boom(1.8), S['escolha']['t0'], .5); ev('cartão de decisão', S['escolha']['t0'])
put(FX, buzz(.9) * 1.2, tZero, .6); put(FX, boom(2.5), tZero + .2, .7, 0, .5); ev('zero: buzina + TEMPO ESGOTADO', tZero)

# 5) mixagem: reverb, ducking sob a voz, silêncio antes de "Só", fade final
SEND[:] = 0 if False else SEND
ir = make_ir(1.8, 5)
for c in range(2): MU[:, c] += conv(SEND[:, c], ir) * .35
duck = np.ones(N)
for s in TL['scenes']:
    i, j = int((s['v0'] - .1) * SR), int((s['v1'] + .15) * SR); duck[max(0, i):min(N, j)] = .45
k = int(.12 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')
mus = MU * duck[:, None]
i0, i1 = int((tSo - .45) * SR), int((tSo - .02) * SR); mus[i0:i1] *= 0; FX[i0:i1] *= 0
mix = mus + FX * (.6 + .4 * duck[:, None])
f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=mix.tobytes(), check=True)

with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · 72 HORAS · Parte 1 "O GALPÃO"\n\nFALAS\n')
    for s in TL['scenes']: fo.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  {s['key']:10s} {s['texto']}\n")
    fo.write('\nTRILHA E EFEITOS\n'); [fo.write(f'{t0:6.2f}  {n}\n') for t0, n in sorted(EV)]
print('trilha ok', round(DUR, 2), 's ·', len(EV), 'marcas')
