"""ADV Station · anúncio vertical v2 (comercial): trilha ORIGINAL a 120 BPM (numpy) + efeitos + mixagem com a narração (Guilherme).
Os tempos saem das palavras (src/data/palavras.json), com as mesmas fórmulas do src/Film.tsx.
Saídas: public/assets/audio/mix.wav (usado no render) e out/marcas-som.txt."""
import json, os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
PAL = json.load(open(f'{ROOT}/src/data/palavras.json'))
def W(i): return PAL[i]['a']
DUR = round((PAL[-1]['b'] + 1.9) * 30) / 30
T_JAN, T_PROTO, T_TROCA, T_DASH, T_PROD, T_FIM = W(10) - .2, W(29) + .1, W(40) - .25, W(57) + .05, W(69) - .2, W(78) - .15
SELOS = [W(24), W(35), W(41), W(60)]
DEST = [W(21) - .1, W(32) - .1, W(36) + .2, W(45) - .1, W(48) - .1, W(52) - .1, W(62) - .1, W(65) - .1]
TITULOS = [T_JAN, W(28), W(40), W(57), T_PROD]
N = int(DUR * SR); MU = np.zeros((N, 2)); FX = np.zeros((N, 2)); R = np.random.default_rng(7); MARCAS = []
def ar(n): return np.arange(n) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def filt(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def piano(m, d=1.6):
    n = int(d * SR); t = ar(n); f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.6 + k * 1.2)) for k, a in [(1, 1), (2, .4), (3, .15), (4, .06)])
    return s * np.minimum(1, t / .004)
def pad(ms, d):
    n = int(d * SR); t = ar(n); s = sum(np.sin(2 * np.pi * hz(m) * t + .2 * np.sin(2 * np.pi * .3 * t)) for m in ms) / len(ms)
    return s * np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8)
def kick():
    n = int(.25 * SR); t = ar(n); return np.sin(2 * np.pi * np.cumsum(100 * np.exp(-t / .03) + 48) / SR) * np.exp(-t / .1)
def shaker():
    n = int(.06 * SR); t = ar(n); return filt(R.standard_normal(n), 2500, 7000) * np.exp(-t / .015)
def clique():
    n = int(.05 * SR); t = ar(n); return filt(R.standard_normal(n), 1500, 6000) * np.exp(-t / .004) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .006) * .4
def whoosh(d=.5):
    n = int(d * SR); t = ar(n); return filt(R.standard_normal(n), 400, 4500) * np.sin(np.pi * t / d) ** 2
def sino(m):
    n = int(1.4 * SR); t = ar(n); f = hz(m); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .15)) * np.exp(-t / .5)

# progressão G – Em – C – D a 100 BPM (corporativa calma, sem chiado)
BPM = 120; b = 60 / BPM
PROG = [(43, [67, 71, 74]), (40, [64, 67, 71]), (36, [64, 67, 72]), (38, [66, 69, 74])]
t, k = 0.0, 0
while t < T_FIM:
    raiz, ac = PROG[(k // 8) % 4]
    if k % 8 == 0: put(MU, pad([raiz + 12, *ac], 8 * b / 2 + .4) * .5, t, .35); put(MU, piano(raiz, 2.4), t, .5)
    put(MU, piano(ac[[0, 1, 2, 1][k % 4]] + (12 if k % 8 >= 4 else 0), 1.2), t, .22, ((k % 3) - 1) * .3)
    if t >= T_JAN - .05:                                   # a batida entra com a janela
        if k % 2 == 0: put(MU, kick(), t, .7)
        if k % 2 == 1: put(MU, shaker(), t, .14, .3)
        if k % 4 == 2: put(MU, filt(R.standard_normal(int(.12 * SR)), 900, 5000) * np.exp(-ar(int(.12 * SR)) / .04), t, .18)   # palma
    elif k % 4 == 0: put(MU, kick(), t, .3)
    t += b / 2; k += 1
MARCAS.append((0.0, 'trilha original: piano e pad em Sol maior; gancho só com piano e batida leve'))
MARCAS.append((T_JAN, 'a janela entra: batida cheia a 120 BPM (bumbo, palma, chocalho)'))
def impacto():
    n = int(.6 * SR); t_ = ar(n); return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t_ / .08) + 40) / SR) * np.exp(-t_ / .25) + filt(R.standard_normal(n), 200, 3000) * np.exp(-t_ / .04) * .4
for tt in TITULOS: put(FX, impacto(), tt, .45); put(FX, whoosh(.35), tt - .3, .15)
MARCAS.append((TITULOS[0], 'impacto grave a cada troca de título'))
n = int(1.4 * SR); t_ = ar(n); riser = filt(R.standard_normal(n), 500, 6000) * (t_ / 1.4) ** 2 + np.sin(2 * np.pi * np.cumsum(200 + 600 * (t_ / 1.4) ** 2) / SR) * (t_ / 1.4) ** 2 * .3
put(FX, riser, T_FIM - 1.4, .22); put(FX, impacto(), T_FIM, .6)
MARCAS.append((T_FIM - 1.4, 'crescendo antes do CTA e impacto no "Acesse advstation.io"'))
for tc, nome in [(T_PROTO, 'Protocolo'), (T_TROCA, 'Trocar de sistema'), (T_DASH, 'Dashboard')]:
    put(FX, clique(), tc, .6, -.2); put(FX, whoosh(.45), tc + .05, .18)
    MARCAS.append((tc, f'clique do cursor em "{nome}" e troca de tela'))
for i, ts in enumerate(SELOS): put(FX, sino([79, 83, 86, 91][i]), ts, .2, .3); MARCAS.append((ts, f'selo {i + 1} entra (sino)'))
for td in DEST: put(FX, sino(74) * .6, td, .1, -.3)
MARCAS.append((DEST[0], 'destaques dourados nas regiões reais (toque suave)'))
# cartão final: jingle oficial da vinheta
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/jingle-vinheta.flac', '-ar', str(SR), '-ac', '2', '-f', 'f64le', '-'], capture_output=True, check=True).stdout
jg = np.frombuffer(raw).reshape(-1, 2); i0 = int(T_FIM * SR); j = min(N, i0 + len(jg)); FX[i0:j] += jg[:j - i0] * .55
MARCAS.append((T_FIM, 'CTA: jingle oficial da vinheta ADV Station'))
fo = int(.4 * SR); i1 = int(T_FIM * SR); MU[i1 - fo:i1] *= np.linspace(1, 0, fo)[:, None]; MU[i1:] = 0
# narração
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/audio/narracao.wav', '-ar', str(SR), '-ac', '1', '-f', 'f64le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw); VOZ = np.zeros(N); VOZ[:min(N, len(v))] = v[:N]
env = np.convolve(np.abs(VOZ), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .55 * np.clip(env / (env.max() * .25), 0, 1)
mus = (MU * .6 + FX) * duck[:, None]; mus /= np.abs(mus).max() + 1e-9
mix = mus * .34 + VOZ[:, None] / (np.abs(VOZ).max() + 1e-9) * .8
fo = int(.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/mix.wav'], input=mix.tobytes(), check=True)
FR = [(0, 'Advogado previdenciário: onde está cada caso do seu escritório agora?'), (10, 'Com a ADV Station, você bate o olho e vê o setor e a etapa de cada cliente.'),
      (28, 'Um clique, e aparece quem está sem contato e quem está inadimplente.'), (40, 'Os prazos vêm em ordem: o que venceu, o que vence hoje e o que vem aí.'),
      (57, 'E o dashboard mostra a operação e o financeiro numa tela só.'), (69, 'Maternidade Legal e Previdenciário Geral: feitos pra advocacia previdenciária.'),
      (78, 'Acesse advstation.io e veja na prática.')]
for i, s in FR: MARCAS.append((W(i), f'fala: "{s}"'))
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write('MARCAS DE SOM · ADV STATION · ANÚNCIO VERTICAL v2 COMERCIAL (voz Guilherme, tomada anuncio2-3 com pausas encurtadas)\n\n')
    for t, s in sorted(MARCAS): f.write(f'{t:6.2f}  {s}\n')
print('mix ok')
