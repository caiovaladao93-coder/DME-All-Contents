"""Som ORIGINAL (numpy) da LÂMINA v2 (versão calma) a partir de out/eventos-lamina.json.
Cada corte faz um "tsk" de lâmina limpo (ataque seco de aço + estalo agudo curto) afinado numa nota: a nota sobe na escala a cada
volta e, dentro da volta, segue um arpejo (no máximo um corte a cada 45 ms; com muitos cortes vira um "chiado" musical). Cada volta
completa (×2) toca um sino suave. A lâmina tem um "vuuush" grave e lento por volta. Cama calma em Lá menor, sem bateria até o fim.
Trava = rangido; trincas; silêncio; QUEBROU = estalo, boom, pedaços e acorde. Loop = ding.
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
def tsk(m):
    """corte: estalo agudo bem curto + nota de aço afinada com decaimento rápido (som de lâmina passando limpo)"""
    n = int(.45 * SR); t = S.ar(n); f0 = S.hz(m)
    tom = (np.sin(2 * np.pi * f0 * t) + .45 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / .05)) * np.exp(-t / .16)
    ar_ = S.filt(R.standard_normal(n), 5000, 14000) * np.exp(-t / .006) * .8
    return (tom * .7 + ar_) * np.minimum(1, t / .0008)
def vuush(d=1.4):
    n = int(d * SR); t = S.ar(n); return S.filt(R.standard_normal(n), 150, 1200) * np.sin(np.pi * t / d) ** 2
def metal(f0, d=1.2):
    n = int(d * SR); t = S.ar(n); return sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / (d / (1 + 2 * i))) for i, (k, a) in enumerate([(1, 1), (2.76, .6), (5.4, .35)]))
ev = lambda tp: next((e[0] for e in EVS if e[1] == tp), None)
t_ch, t_tr, t_ex = ev('cheio'), ev('trava'), ev('explode'); OM = D['om']; PER = 2 * np.pi / OM
voltas = [e[0] for e in EVS if e[1] == 'volta']
put(FX, S.bell(81, 1.2), 0, .35); MARCAS.append((0, 'ding (o mesmo do fim: loop)'))
# cama calma: Lám – Fá – Dó – Sol, um acorde por volta da lâmina
ACORDES = [(45, 57, 60, 64), (41, 53, 57, 60), (48, 55, 60, 64), (43, 55, 59, 62)]
t, k = 0.0, 0
while t < (t_tr or DUR):
    ch = ACORDES[k % 4]; put(MU, S.acorde([m + 12 for m in ch[1:]], PER + 1.0) * .8, t, .22, 0); put(MU, np.sin(2 * np.pi * S.hz(ch[0]) * S.ar(int(PER * SR))) * np.exp(-S.ar(int(PER * SR)) / 2.5), t, .25)
    t += PER; k += 1
# vuuush da lâmina (uma vez por volta, no meio do giro)
t = .6
while t < (t_tr or DUR): put(FX, vuush(), t, .12, 0); t += PER / 2
# cortes: tsk afinado. A escala sobe a cada volta; dentro da volta, arpejo
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
cortes = [e[0] for e in EVS if e[1] == 'corte']; ult = -9.0; idx = 0; cnt_n = 0
for tc in cortes:
    if tc - ult < .045: continue
    v = sum(1 for x in voltas if x <= tc); base = min(len(ESC) - 5, v)
    m = ESC[base + (idx % 5)]; idx += 1
    put(FX, tsk(m), tc, .2, np.clip((idx % 7 - 3) / 4, -.8, .8)); ult = tc; cnt_n += 1
MARCAS.append((cortes[0] if cortes else 1.0, 'primeiro corte: a bola abre em duas metades ("tsk" afinado)'))
for i, tv in enumerate(voltas):
    put(FX, S.bell(69 + min(12, i), 2.0), tv, .1, 0); MARCAS.append((tv, f'volta {i + 1} completa (×2)'))
# no fim da subida entra uma batida leve (últimas 3 voltas)
if len(voltas) >= 3:
    t = voltas[-3]; kk = 0
    while t < (t_ch or DUR) - .1:
        put(MU, S.kick(), t, .35); put(MU, S.hat(), t + .25, .1, .3); t += .5; kk += 1
    MARCAS.append((voltas[-3], 'entra uma batida leve nas últimas voltas'))
if t_ch is not None:
    n_ = int((t_tr - t_ch) * SR); tt = S.ar(n_); u = tt / tt[-1]
    put(FX, np.sign(np.sin(2 * np.pi * np.cumsum(150 - 100 * u + 20 * np.sin(2 * np.pi * 8 * tt)) / SR)) * (.3 + .7 * u) * .22, t_ch, .35)
    MARCAS.append((t_ch, 'ANEL LOTADO: a lâmina trava, rangido metálico'))
for q in range(6): put(FX, metal(R.uniform(900, 1700), .3), t_tr + .2 + q * .2, .14, R.uniform(-.6, .6))
MARCAS.append((t_tr, 'lâmina parada: trincas'))
MARCAS.append((t_ex - .35, 'silêncio antes de quebrar'))
put(FX, tsk(93), t_ex, .5); put(FX, S.boom(1.8), t_ex, .9); put(FX, S.crash(2.4), t_ex, .45); put(FX, S.acorde([57, 64, 69, 72, 76, 81], 3.0), t_ex + .05, .45)
for q in range(14): put(FX, metal(R.uniform(400, 1500)), t_ex + R.uniform(.05, 1.5), .15, R.uniform(-.9, .9))
MARCAS.append((t_ex, f'QUEBROU: a lâmina parte em 4 e o anel em 16 ({D["cortes"]} cortes)'))
put(FX, S.bell(81, 1.2), t_ex + 3.4, .35); MARCAS.append((t_ex + 3.0, 'volta à lâmina inteira com 1 bola (loop)'))
i0, i1 = int((t_ex - .35) * SR), int(t_ex * SR); MU[i0:i1] *= 0; FX[i0:i1] *= .2
mix = MU * .6 + FX; fo_ = int(.6 * SR); mix[-fo_:] *= np.linspace(1, .3, fo_)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som-lamina.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som-lamina.txt', 'w') as fo:
    fo.write(f'MARCAS DE SOM · LÂMINA v2 (sem narração; {cnt_n} cortes tocados de {D["cortes"]})\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som lâmina ok', round(DUR, 2), 's ·', cnt_n, 'cortes tocados')
