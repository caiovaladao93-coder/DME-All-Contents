"""Som ORIGINAL (numpy) do BURACO NEGRO INVERTIDO a partir de out/eventos-buraco.json.
Cada bola engolida faz um "glup" grave que desce, e as que voltam em dobro tocam uma nota que sobe (escala pentatônica,
mais aguda conforme o buraco engole mais); um zumbido grave cresce com o buraco; base a 120 BPM cada vez mais cheia.
Arena cheia = sirene grave subindo; implosão = sucção ao contrário; explosão = boom, crash e acorde; loop = ding.
Saída: out/som-buraco.wav e out/marcas-som-buraco.txt."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import som as S
ROOT = S.ROOT; SR = S.SR
D = json.load(open(f'{ROOT}/out/eventos-buraco.json')); DUR = D['dur']; EVS = sorted(D['eventos'], key=lambda e: e[0])
N = int((DUR + .5) * SR); MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); R = np.random.default_rng(44); MARCAS = []
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
def glup(f0=180):
    n = int(.16 * SR); t = S.ar(n); return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t / .06) + 50) / SR) * np.exp(-t / .07)
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_imp, t_exp = ev('cheio'), ev('implode'), ev('explode')
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
eng = [e[0] for e in EVS if e[1] == 'engole']; tot = np.arange(1, len(eng) + 1)
# base 120 BPM, ganha força com o número de bolas engolidas
t, k = 1.0, 0
while t < t_imp - .1:
    c = np.searchsorted(eng, t); lvl = min(1.0, .2 + .8 * np.log1p(c) / np.log1p(len(eng) * .5))
    put(MU, S.kick(), t, .5 * lvl); put(MU, S.hat(), t + .25, .15 * lvl, .3)
    if lvl > .55: put(MU, S.hat(), t + .125, .09 * lvl, -.3)
    b = [45, 45, 48, 43][(k // 4) % 4]; nn = int(.4 * SR); put(MU, np.sin(2 * np.pi * S.hz(b) * S.ar(nn)) * np.exp(-S.ar(nn) / .2), t, .3 * lvl)
    t += .5; k += 1
# zumbido do buraco: frequência cai e volume sobe com o tamanho
n_ = int((t_imp - 1.0) * SR); tt = S.ar(n_); cnt = np.interp(tt + 1.0, eng, tot) if eng else np.zeros(n_)
sz = np.sqrt(cnt) / (np.sqrt(len(eng)) + 1e-9); f = 70 - 30 * sz
put(FX, np.sin(2 * np.pi * np.cumsum(f) / SR) * (.15 + .85 * sz) ** 1.5 * .5, 1.0, .35)
# glup de cada bola engolida e nota das que voltam (limitados a 1 a cada 45 ms)
ult, cnt_n = -9.0, 0
for i, (t, tp, fil) in enumerate([e for e in EVS if e[1] == 'engole']):
    if t - ult < .045: continue
    put(FX, glup(), t, .22, R.uniform(-.2, .2)); ult = t; cnt_n += 1
    m = ESC[min(len(ESC) - 1, int(np.log2(i + 2)))] + R.choice([0, 0, 12])
    put(FX, S.marimba(m), t + .05, .2 if fil == 2 else .1, R.uniform(-.6, .6))
MARCAS.append((eng[0] if eng else 1.0, 'primeira bola engolida: volta em dobro'))
if t_ch is not None:
    n_ = int((t_imp - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
    put(FX, np.sin(2 * np.pi * np.cumsum(55 + 110 * u ** 1.5) / SR) * u * .5 + S.filt(R.standard_normal(n_), 200, 1500) * u * .2, t_ch, .4)
    MARCAS.append((t_ch, 'ARENA CHEIA (1.500 bolas): o buraco incha, sirene grave subindo'))
n_ = int(.7 * SR); suc = S.whoosh(.7)[::-1].copy(); put(FX, suc, t_imp, .5); MARCAS.append((t_imp, 'implosão: sucção'))
MARCAS.append((t_imp + .3, 'silêncio curto antes do estouro'))
put(FX, S.boom(1.8), t_exp, .95); put(FX, S.crash(2.4), t_exp, .5); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_exp + .05, .5)
for q in range(12): put(FX, S.marimba(R.choice(ESC) + 12), t_exp + .1 + q * .06, .12, R.uniform(-.8, .8))
MARCAS.append((t_exp, f'BOOM: explode ({D["total"]} bolas engolidas)'))
put(FX, S.bell(81, 1.2), t_exp + 3.4, .35); MARCAS.append((t_exp + 3.0, 'volta à arena vazia com 1 bola (loop)'))
# silêncio de 0,3 s antes da explosão na base
i0 = int((t_imp + .4) * SR); i1 = int(t_exp * SR); MU[i0:i1] *= 0
mix = MU * .7 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-buraco.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-buraco.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · BURACO NEGRO INVERTIDO (sem narração; {cnt_n} glups/notas)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som buraco ok', round(DUR, 2), 's ·', cnt_n, 'notas')
