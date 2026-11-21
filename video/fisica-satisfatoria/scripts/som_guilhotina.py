"""Som ORIGINAL (numpy) da GUILHOTINA a partir de out/eventos-guilhotina.json.
Subida: catraca "tec-tec-tec" (um clique a cada dente, rápido no começo e devagar no fim) + rangido de corda. No alto: 1 s de
suspense (um grave pulsando, quase silêncio). Descida: "SHHHNK" (lâmina raspando nos trilhos, que sobe de tom) + baque seco
embaixo; os cortes da descida tocam um arpejo rápido de "tsk" afinados que sobe (mais notas quanto mais bolas). Embaixo, um sino
"×2" que sobe a cada descida. Cama em Lá menor. 10ª descida: trava no meio (estalo metálico, rangido), trincas, silêncio, a
lâmina cai e o anel explode (boom, crash, pedaços, acorde). Loop = ding. Saída: out/som-guilhotina.wav e out/marcas-som-guilhotina.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-guilhotina.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(10); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def tsk(m):
    n = int(.45 * SR); t = S.ar(n); f0 = S.hz(m)
    tom = (np.sin(2 * np.pi * f0 * t) + .4 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / .05)) * np.exp(-t / .16)
    return (tom * .7 + S.filt(R.standard_normal(n), 5000, 14000) * np.exp(-t / .006) * .6) * np.minimum(1, t / .0008)
def clique():
    n = int(.04 * SR); t = S.ar(n); return (S.filt(R.standard_normal(n), 1800, 7000) * np.exp(-t / .004) + np.sin(2 * np.pi * 2200 * t) * np.exp(-t / .008) * .5)
def shhnk(d):
    n = int(d * SR); t = S.ar(n); u = t / t[-1]
    rasp = S.filt(R.standard_normal(n), 2000, 10000) * (.3 + .7 * u)
    tom = np.sin(2 * np.pi * np.cumsum(900 + 1600 * u) / SR) * .25
    return (rasp + tom) * np.minimum(1, t / .01)
def baque():
    n = int(.5 * SR); t = S.ar(n); return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t / .1) + 40) / SR) * np.exp(-t / .15) + S.filt(R.standard_normal(n), 100, 2500) * np.exp(-t / .03) * .7
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_tr, t_ex = ev('trava'), ev('explode'); QUEDA, SUBIDA = D['queda'], D['subida']
cortes = np.array([e[0] for e in EVS if e[1] == 'corte'])
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# cama calma
ACORDES = [(45, 57, 60, 64), (41, 53, 57, 60), (48, 55, 60, 64), (43, 55, 59, 62)]
t, k = 0.0, 0
while t < (t_tr or DUR):
    ch = ACORDES[k % 4]; put(MU, S.acorde([m + 12 for m in ch[1:]], 3.6) * .7, t, .18, 0)
    nn = int(3.2 * SR); put(MU, np.sin(2 * np.pi * S.hz(ch[0]) * S.ar(nn)) * np.exp(-S.ar(nn) / 2.0), t, .2)
    t += 3.25; k += 1
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93]
for i, (td, _, kd) in enumerate([e for e in EVS if e[1] == 'desce']):
    put(FX, shhnk(QUEDA), td, .35, 0); put(FX, baque(), td + QUEDA, .7, 0)
    c = cortes[(cortes >= td - .02) & (cortes <= td + QUEDA + .05)]
    nt = min(14, len(c)); base = min(4, i // 2)
    for j in range(nt):   # arpejo que sobe, distribuído pela queda
        tj = c[int(j * len(c) / max(1, nt))]
        put(FX, tsk(ESC[min(len(ESC) - 1, base + j)]), tj, .16, (j % 5 - 2) / 3)
    put(FX, S.bell(69 + min(14, 2 * i), 2.2), td + QUEDA + .05, .13, 0)
    MARCAS.append((td, f'descida {i + 1}: "SHHHNK", {len(c)} cortes em arpejo, baque e sino ×2'))
for (ts_, _, kd) in [e for e in EVS if e[1] == 'sobe']:
    # catraca: cliques com intervalo crescente durante a subida
    tc, dtc = ts_, .07
    while tc < ts_ + SUBIDA - .1:
        put(FX, clique(), tc, .22, -.3 if int(tc * 20) % 2 else .3); dtc = .07 + .13 * ((tc - ts_) / SUBIDA) ** 1.5; tc += dtc
    n_ = int(SUBIDA * SR); tt = S.ar(n_); put(FX, S.filt(R.standard_normal(n_), 200, 900) * .15 * np.sin(np.pi * tt / SUBIDA), ts_, .4)
    # suspense no alto: pulso grave
    for q in range(2): nn = int(.3 * SR); put(MU, np.sin(2 * np.pi * 55 * S.ar(nn)) * np.exp(-S.ar(nn) / .1), ts_ + SUBIDA + q * .5, .5)
MARCAS.append((ev('sobe') or 3.0, 'subida: catraca "tec-tec-tec" e rangido; no alto, suspense com pulso grave'))
if t_tr is not None:
    put(FX, metal(1900, .6), t_tr, .5); put(FX, baque(), t_tr, .6)
    n_ = int(1.4 * SR); tt = S.ar(n_); put(FX, np.sign(np.sin(2 * np.pi * np.cumsum(130 + 20 * np.sin(2 * np.pi * 6 * tt)) / SR)) * .18, t_tr + .1, .35)
    for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .3 + q * .2, .14, R.uniform(-.6, .6))
    MARCAS.append((t_tr, 'TRAVOU NO MEIO: estalo, rangido e trincas'))
MARCAS.append((t_ex - .35, 'silêncio antes de quebrar'))
put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'QUEBROU: a lâmina cai e o anel explode ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta à guilhotina no alto com 1 bola (loop)'))
i0, i1 = int((t_ex - .35) * SR), int(t_ex * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-guilhotina.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-guilhotina.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · GUILHOTINA (sem narração; {D["cortes"]} cortes)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som guilhotina ok', round(DUR, 2), 's')
