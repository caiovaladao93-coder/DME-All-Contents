"""ADV Station · anúncio vertical: trilha ORIGINAL (numpy) + efeitos + mixagem com a narração (Guilherme).
Os tempos saem das palavras (src/data/palavras.json), com as mesmas fórmulas do src/Film.tsx.
Saídas: public/assets/audio/mix.wav (usado no render) e out/marcas-som.txt."""
import json, os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; DUR = 31.0
PAL = json.load(open(f'{ROOT}/src/data/palavras.json'))
def W(i): return PAL[i]['a']
T_PROTO, T_TROCA, T_DASH, T_FIM = W(24) + .15, W(34) - .25, W(48) + .05, W(59) - .15
SELOS = [W(19), W(33), W(38), W(50)]
DEST = [W(21) - .2, W(27) + .1, W(33) - .2, W(42) - .1, W(44) - .1, W(47) - .1, W(53) - .1, W(56) - .1]
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
BPM = 100; b = 60 / BPM
PROG = [(43, [67, 71, 74]), (40, [64, 67, 71]), (36, [64, 67, 72]), (38, [66, 69, 74])]
t, k = 0.0, 0
while t < T_FIM:
    raiz, ac = PROG[(k // 8) % 4]
    if k % 8 == 0: put(MU, pad([raiz + 12, *ac], 8 * b / 2 + .4) * .5, t, .35); put(MU, piano(raiz, 2.4), t, .5)
    put(MU, piano(ac[[0, 1, 2, 1][k % 4]] + (12 if k % 8 >= 4 else 0), 1.2), t, .22, ((k % 3) - 1) * .3)
    if t > 1.5:
        if k % 4 == 0: put(MU, kick(), t, .55)
        if k % 2 == 1: put(MU, shaker(), t, .12, .3)
    t += b / 2; k += 1
MARCAS.append((0.0, 'trilha original: piano e pad em Sol maior, pulso leve a 100 BPM'))
for tc, nome in [(T_PROTO, 'Protocolo'), (T_TROCA, 'Trocar de sistema'), (T_DASH, 'Dashboard')]:
    put(FX, clique(), tc, .6, -.2); put(FX, whoosh(.45), tc + .05, .18)
    MARCAS.append((tc, f'clique do cursor em "{nome}" e troca de tela'))
for i, ts in enumerate(SELOS): put(FX, sino([79, 83, 86, 91][i]), ts, .2, .3); MARCAS.append((ts, f'selo {i + 1} entra (sino)'))
for td in DEST: put(FX, sino(74) * .6, td, .1, -.3)
MARCAS.append((DEST[0], 'destaques dourados nas regiões reais (toque suave)'))
# cartão final: jingle oficial da vinheta
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/jingle-vinheta.flac', '-ar', str(SR), '-ac', '2', '-f', 'f64le', '-'], capture_output=True, check=True).stdout
jg = np.frombuffer(raw).reshape(-1, 2); i0 = int(T_FIM * SR); j = min(N, i0 + len(jg)); FX[i0:j] += jg[:j - i0] * .55
MARCAS.append((T_FIM, 'cartão final: jingle oficial da vinheta ADV Station'))
fo = int(.4 * SR); i1 = int(T_FIM * SR); MU[i1 - fo:i1] *= np.linspace(1, 0, fo)[:, None]; MU[i1:] = 0
# narração
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/audio/narracao.wav', '-ar', str(SR), '-ac', '1', '-f', 'f64le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw); VOZ = np.zeros(N); VOZ[:min(N, len(v))] = v[:N]
env = np.convolve(np.abs(VOZ), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .55 * np.clip(env / (env.max() * .25), 0, 1)
mus = (MU * .6 + FX) * duck[:, None]; mus /= np.abs(mus).max() + 1e-9
mix = mus * .34 + VOZ[:, None] / (np.abs(VOZ).max() + 1e-9) * .8
fo = int(.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/mix.wav'], input=mix.tobytes(), check=True)
FR = [(0, 'Advogado previdenciário: cada caso tem o seu caminho.'), (4, 'Na ADV Station, cada cliente aparece com o setor e a etapa em que está.'),
      (23, 'Um clique, e o protocolo mostra o que precisa de atenção.'), (34, 'No Previdenciário Geral, os prazos aparecem em ordem: vencidos, do dia e os próximos.'),
      (48, 'E o dashboard reúne a operação e o financeiro do escritório.'), (59, 'ADV Station. Conheça nossas soluções.')]
for i, s in FR: MARCAS.append((W(i), f'fala: "{s}"'))
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write('MARCAS DE SOM · ADV STATION · ANÚNCIO VERTICAL (voz Guilherme, tomada anuncio-1)\n\n')
    for t, s in sorted(MARCAS): f.write(f'{t:6.2f}  {s}\n')
print('mix ok')
