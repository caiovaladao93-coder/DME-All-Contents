"""Som ORIGINAL (numpy) do FIO DE AÇO a partir de out/eventos-fio.json.
O fio é uma corda: cada corte é uma nota dedilhada (Karplus-Strong) numa escala pentatônica; a altura depende do ponto do fio
onde a bola foi cortada (perto da roldana = agudo, no meio = grave) e a escala sobe a cada meia volta. Zumbido grave do fio
girando, rangido das roldanas a cada meia volta, sino a cada ×2, cama calma em Lá menor. Lotado: o fio range e sobe de tensão;
ARREBENTA: "TWANG" (corda que estala), boom, crash, acorde e estilhaços. Loop = ding. Saída: out/som-fio.wav e out/marcas-som-fio.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-fio.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(18); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
_cache = {}
def pluck(m, d=1.6):
    """corda dedilhada (Karplus-Strong) com ataque metálico"""
    if m in _cache: return _cache[m]
    f0 = S.hz(m); p = max(2, int(round(SR / f0))); n = int(d * SR)
    buf = R.uniform(-1, 1, p); y = np.zeros(n)
    for k in range(0, n, p):   # média móvel por bloco (vetorizado por período)
        seg = buf.copy(); y[k:k + p] = seg[:min(p, n - k)]
        buf = .996 * .5 * (seg + np.roll(seg, -1))
    t = S.ar(n); y = S.filt(y, 60, 9000)
    y = y / (np.max(np.abs(y)) + 1e-9) * np.exp(-t / .9) + np.sin(2 * np.pi * f0 * 2 * t) * np.exp(-t / .08) * .25
    _cache[m] = y * np.minimum(1, t / .0015); return _cache[m]
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
def rangido(d, f=180):
    n = int(d * SR); t = S.ar(n); fr = f + 40 * np.sin(2 * np.pi * 5 * t)
    return S.filt(np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)), 300, 3000) * np.sin(np.pi * t / d)
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_sn = ev('cheio'), ev('arrebenta')
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# cama calma
ACORDES = [(45, 57, 60, 64), (41, 53, 57, 60), (48, 55, 60, 64), (43, 55, 59, 62)]
t, k = 0.0, 0
while t < (t_sn or DUR) - .4:
    ch = ACORDES[k % 4]; put(MU, S.acorde([m + 12 for m in ch[1:]], 3.6) * .7, t, .16, 0)
    nn = int(3.2 * SR); put(MU, np.sin(2 * np.pi * S.hz(ch[0]) * S.ar(nn)) * np.exp(-S.ar(nn) / 2.0), t, .18)
    t += 3.5; k += 1
# zumbido do fio girando
n_ = int(((t_ch or DUR) - .8) * SR); tt = S.ar(n_)
put(MU, (np.sin(2 * np.pi * 55 * tt) + .3 * np.sin(2 * np.pi * 110 * tt)) * (.6 + .4 * np.sin(2 * np.pi * tt / 7)) * np.minimum(1, tt / 2), .8, .06)
PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
meia = 0; ult = -1.0
for e in EVS:
    if e[1] == 'meia':
        meia = e[2]; put(FX, rangido(.35, 220 + 20 * meia), e[0], .08, R.uniform(-.5, .5))
    elif e[1] == 'corte':
        if e[0] - ult < .05: continue
        ult = e[0]; pos = e[2]; c = 1 - 2 * abs(pos - .5)   # 1 no meio, 0 nas pontas
        m = PENTA[min(len(PENTA) - 1, int(min(meia, 6) * .7) + int((1 - c) * 7))]
        put(FX, pluck(m), e[0], .32, (pos - .5) * 1.2)
    elif e[1] == 'dobrou':
        i = int(np.log2(e[2])); put(FX, S.bell(69 + min(15, 2 * i), 2.2), e[0] + .03, .12, 0)
        MARCAS.append((e[0], f'×2 → {e[2]} bolas (sino)'))
MARCAS.append((1.0, 'cortes: nota dedilhada da corda (pentatônica; meio do fio = grave, perto da roldana = agudo)'))
if t_ch is not None:
    d = t_sn - t_ch; n_ = int(d * SR); tt = S.ar(n_); u = tt / d
    fr = 70 + 260 * u ** 1.5; put(FX, S.filt(np.sin(2 * np.pi * np.cumsum(fr) / SR) + .4 * R.standard_normal(n_) * u, 60, 4000) * u, t_ch, .3)
    for q in range(int(d / .45)): put(FX, metal(R.uniform(1200, 2200), .25), t_ch + .6 + q * .45, .08 + .02 * q, R.uniform(-.6, .6))
    MARCAS.append((t_ch, 'LOTOU: o fio para, enverga e range com a tensão subindo'))
MARCAS.append((t_sn - .35, 'silêncio antes de arrebentar'))
n_ = int(1.6 * SR); tt = S.ar(n_); fr = 900 * np.exp(-tt / .12) + 90
twang = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / .5) + S.filt(R.standard_normal(n_), 3000, 12000) * np.exp(-tt / .02)
put(FX, twang, t_sn, .8); put(FX, S.boom(1.8), t_sn, .9); put(FX, S.crash(2.4), t_sn, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_sn + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_sn + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_sn, f'ARREBENTOU: "TWANG", boom e o anel explode ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_sn + 3.4, .35); MARCAS.append((t_sn + 3.0, 'volta ao fio esticado com 1 bola (loop)'))
i0, i1 = int((t_sn - .35) * SR), int(t_sn * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-fio.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-fio.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · FIO DE AÇO (sem narração; {D["cortes"]} cortes)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som fio ok', round(DUR, 2), 's')
