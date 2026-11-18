"""Som ORIGINAL (numpy) da LÂMINA a partir de out/eventos-lamina.json.
Os cortes tocam um arpejo NO TEMPO (semicolcheias a 120 BPM, Lám–Fá–Dó–Sol); os 60 primeiros também fazem um "shing" de aço no
instante exato. A lâmina faz um "swish" a cada meia volta (o ritmo acelera com a rotação real). Arena cheia = rangido metálico
enquanto a lâmina trava; trincas; silêncio curto; QUEBROU = estalo, boom, crash, pedaços de aço e acorde. Loop = ding.
Saída: out/som-lamina.wav e out/marcas-som-lamina.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-lamina.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(88); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def shing(f0=2400):
    n = int(.35 * SR); t = S.ar(n)
    x = sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (.25 / (1 + i))) for i, (k, a) in enumerate([(1, 1), (1.51, .5), (2.37, .3)]))
    return x * .5 + S.filt(R.standard_normal(n), 4000, 12000) * np.exp(-t / .02) * .5
def swish(d=.18):
    n = int(d * SR); t = S.ar(n); return S.filt(R.standard_normal(n), 500, 6000) * np.sin(np.pi * t / d) ** 2
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_tr, t_ex = ev('cheio'), ev('trava'), ev('explode'); T0 = .6
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# rotação real da lâmina (mesma regra do vídeo) → swish a cada meia volta
dt = 1 / 240; th = 0.0; prox = np.pi; t = T0; om_p = None
while t < (t_tr or DUR):
    om = min(7.5, 2.0 + .095 * (t - T0)) if (t_ch is None or t < t_ch) else (om_p or 0) * max(0.0, 1 - (t - t_ch) / 3.6) ** 1.5
    if t_ch is not None and t >= t_ch and om_p is None: om_p = min(7.5, 2.0 + .095 * (t_ch - T0)); continue
    th += om * dt
    if th >= prox: put(FX, swish(), t - .09, .12 + .03 * om / 7.5, 0); prox += np.pi
    t += dt
MARCAS.append((T0, 'a lâmina começa a girar (swish a cada meia volta, acelerando)'))
# base 120 BPM até a lâmina travar
cortes = np.array([e[0] for e in EVS if e[1] == 'corte'])
t, k = 1.0, 0
while t < (t_tr or DUR) - .2:
    c = np.sum(cortes <= t); lvl = min(1.0, .2 + .8 * np.log1p(c) / np.log1p(1500))
    put(MU, S.kick(), t, .5 * lvl); put(MU, S.hat(), t + .25, .15 * lvl, .3)
    if lvl > .55: put(MU, S.hat(), t + .125, .09 * lvl, -.3)
    b = [45, 41, 48, 43][(k // 4) % 4]; nn = int(.4 * SR); put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(nn)) * np.exp(-S.ar(nn) / .2), t, .3 * lvl)
    t += .5; k += 1
# cortes: arpejo no tempo + shing dos primeiros
ACORDES = [[57, 60, 64, 69, 72, 76], [53, 57, 60, 65, 69, 72], [60, 64, 67, 72, 76, 79], [55, 59, 62, 67, 71, 74]]
idx = 0; cnt_n = 0; t = 1.0
while t < (t_ch or DUR):
    c = int(np.sum((cortes >= t) & (cortes < t + .125)))
    if c:
        ch = ACORDES[int((t - 1.0) // 2.0) % 4]; m = ch[idx % 6]; idx += 1
        put(FX, S.marimba(m), t, .16 + .1 * min(1.0, np.log1p(c) / 3), ((idx % 6) - 2.5) / 3)
        if c >= 3: put(FX, S.bell(m + 12, .6), t, .04, -((idx % 6) - 2.5) / 3)
        cnt_n += 1
    t += .125
for i, tc in enumerate(cortes[:60]): put(FX, shing(2000 + 40 * (i % 12)), tc, .16, R.uniform(-.4, .4))
MARCAS.append((cortes[0] if len(cortes) else 1.0, 'primeiro corte: a bola vira duas'))
if t_ch is not None:
    n_ = int((t_tr - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
    put(FX, np.sign(np.sin(2 * np.pi * np.cumsum(140 - 90 * u + 20 * np.sin(2 * np.pi * 9 * tt)) / SR)) * (.3 + .7 * u) * .25, t_ch, .4)
    MARCAS.append((t_ch, 'ARENA CHEIA (1.500 bolas): a lâmina trava, rangido metálico'))
for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .2 + q * .2, .15, R.uniform(-.6, .6))
MARCAS.append((t_tr, 'lâmina parada: trincas'))
MARCAS.append((t_ex - .3, 'silêncio antes de quebrar'))
put(FX, shing(3200), t_ex, .5); put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .5); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .16, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'QUEBROU: a lâmina parte em 4 e o anel em 16 ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta à lâmina inteira com 1 bola (loop)'))
i0, i1 = int((t_ex - .3) * SR), int(t_ex * SR); MU[i0:i1] *= 0
mix = MU * .7 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-lamina.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-lamina.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · LÂMINA (sem narração; {cnt_n} notas no tempo, {D["cortes"]} cortes)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som lâmina ok', round(DUR, 2), 's ·', cnt_n, 'notas')
