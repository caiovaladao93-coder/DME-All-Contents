"""Som ORIGINAL (numpy) da SERRA a partir de out/eventos-serra.json.
O disco tem um zumbido contínuo (frequência dos dentes + chiado agudo), que acompanha a rotação real: liga no começo e cai
devagar quando a serra trava. Cada corte faz um "zzt" (chiado de serra curto, com o zumbido afundando um instante) e um "tsk"
afinado em arpejo (no máximo um a cada 45 ms). Cada vez que o total dobra toca um sino que sobe. Cada ricochete no anel faz um
"tlim" metálico. Cama calma em Lá menor; batida leve depois da metade. Quebra = estalo, boom, pedaços e acorde. Loop = ding.
Saída: out/som-serra.wav e out/marcas-som-serra.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-serra.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(99); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def tsk(m):
    n = int(.4 * SR); t = S.ar(n); f0 = S.hz(m)
    tom = (np.sin(2 * np.pi * f0 * t) + .4 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / .05)) * np.exp(-t / .14)
    return (tom * .7 + S.filt(R.standard_normal(n), 5000, 14000) * np.exp(-t / .006) * .7) * np.minimum(1, t / .0008)
def zzt():
    n = int(.12 * SR); t = S.ar(n); return S.filt(R.standard_normal(n), 2500, 9000) * np.sin(np.pi * t / t[-1]) ** .5 * np.exp(-t / .05)
def tlim():
    n = int(.6 * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(1180, 1, .2), (2950, .4, .08), (4300, .2, .05)])
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_tr, t_ex = ev('cheio'), ev('trava'), ev('explode'); T0 = .5; SPIN = D['spin']
cortes = np.array([e[0] for e in EVS if e[1] == 'corte'])
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# zumbido da serra seguindo a rotação real (mesma regra do vídeo), com afundada rápida a cada corte
tt = np.arange(int((t_tr or DUR) * SR)) / SR
spin = np.where(tt < T0, SPIN * tt / T0, SPIN)
if t_ch is not None: spin = np.where(tt >= t_ch, SPIN * np.clip(1 - (tt - t_ch) / 2.4, 0, 1) ** 1.3, spin)
dip = np.zeros_like(tt)
for tc in cortes[cortes < tt[-1]]:
    i = int(tc * SR); m = min(len(dip), i + int(.08 * SR)); dip[i:m] = np.maximum(dip[i:m], np.linspace(1, 0, m - i))
fd = spin * 26 / (2 * np.pi) * (1 - .12 * dip)                    # frequência dos dentes (~108 Hz)
ph = 2 * np.pi * np.cumsum(fd) / SR
zum = (np.sign(np.sin(ph)) * .25 + .5 * np.sin(ph) + .25 * np.sin(4 * ph) + .12 * np.sin(9 * ph)) * (spin / SPIN) ** .8
chiado = S.filt(R.standard_normal(len(tt)), 3000, 8000) * (spin / SPIN) * .15
put(FX, (zum + chiado) * .5, 0, .35)
MARCAS.append((T0, 'a serra liga: zumbido contínuo (dentes ~108 Hz + chiado)'))
# cama calma Lám–Fá–Dó–Sol a cada 2 s; batida leve depois da metade
ACORDES = [(45, 57, 60, 64), (41, 53, 57, 60), (48, 55, 60, 64), (43, 55, 59, 62)]
t, k = 0.0, 0
while t < (t_tr or DUR):
    ch = ACORDES[k % 4]; put(MU, S.acorde([m + 12 for m in ch[1:]], 3.0) * .8, t, .2, 0); nn = int(2 * SR); put(MU, np.sin(2 * np.pi * S.hz(ch[0]) * S.ar(nn)) * np.exp(-S.ar(nn) / 1.5), t, .22)
    t += 2.0; k += 1
t = 30.0
while t < (t_ch or DUR) - .1: put(MU, S.kick(), t, .3); put(MU, S.hat(), t + .25, .09, .3); t += .5
MARCAS.append((30.0, 'entra batida leve'))
# cortes
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
ult = -9.0; idx = 0; cnt_n = 0
for tc in cortes:
    if tc - ult < .045: continue
    nb = 1 + np.sum(cortes <= tc); base = min(len(ESC) - 5, int(np.log2(nb + 1)))
    put(FX, tsk(ESC[base + idx % 5]), tc, .17, np.clip((idx % 7 - 3) / 4, -.8, .8)); put(FX, zzt(), tc, .14, 0); idx += 1; ult = tc; cnt_n += 1
MARCAS.append((cortes[0] if len(cortes) else 1.0, 'primeiro corte: "zzt" + "tsk" afinado'))
for i, (tv, _, v) in enumerate([e for e in EVS if e[1] == 'dobrou']):
    put(FX, S.bell(69 + min(14, i), 2.0), tv, .09, 0); MARCAS.append((tv, f'dobrou: {v} bolas'))
ult = -9.0
for tr in [e[0] for e in EVS if e[1] == 'ricochete']:
    if tr - ult > .3: put(FX, tlim(), tr, .08, R.uniform(-.5, .5)); ult = tr
MARCAS.append((ev('ricochete') or 1.0, 'ricochetes no anel: "tlim" metálico'))
if t_ch is not None: MARCAS.append((t_ch, 'ANEL LOTADO: a serra perde rotação (o zumbido cai até parar)'))
for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .2 + q * .2, .14, R.uniform(-.6, .6))
MARCAS.append((t_tr, 'serra parada: trincas'))
MARCAS.append((t_ex - .35, 'silêncio antes de quebrar'))
put(FX, tsk(93), t_ex, .5); put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'QUEBROU: a serra parte em 4 e o anel em 16 ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta à serra inteira com 1 bola (loop)'))
i0, i1 = int((t_ex - .35) * SR), int(t_ex * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-serra.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-serra.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · SERRA (sem narração; {cnt_n} cortes tocados de {D["cortes"]})\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som serra ok', round(DUR, 2), 's ·', cnt_n, 'cortes tocados')
