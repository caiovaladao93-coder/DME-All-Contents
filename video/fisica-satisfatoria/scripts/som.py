"""Som ORIGINAL (numpy) a partir de out/eventos.json: a física "toca" a música.
Cena 1: cada batida no anel toca a próxima nota de uma melodia própria (marimba), com estouro no fim.
Cena 2: cada batida toca uma nota que sobe de tom a cada anel quebrado; a quebra é vidro + acorde; "livre" é um acorde aberto.
Cena 3: cada conversão faz um tique na nota da cor; a troca de líder tem um whoosh; a vitória, uma fanfarra.
Base leve a 120 BPM por baixo. Saída: out/som.wav e out/marcas-som.txt. Depois: scripts/finalizar.sh junta vídeo e som."""
import json, subprocess, sys
import numpy as np
ROOT = __file__.rsplit('/scripts/', 1)[0]
D = json.load(open(f'{ROOT}/out/eventos.json')); DUR = D['dur']; M = D['marcos']; EVS = D['eventos']
SR = 48000; N = int((DUR + .5) * SR); R = np.random.default_rng(9)
MU, FX = np.zeros((N, 2)), np.zeros((N, 2)); MARCAS = []
def ar(n): return np.arange(n) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, s, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(s)); l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s[:j - i] * g * l * .707; buf[i:j, 1] += s[:j - i] * g * r * .707
def filt(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X * ((f > lo) & (f < hi)), len(x))
def marimba(m, d=.45):
    n = int(d * SR); t = ar(n); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .22) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .03) + .15 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / .1)
    return x * np.minimum(1, t / .002)
def bell(m, d=1.2):
    n = int(d * SR); t = ar(n); f = hz(m)
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (d / (1 + i))) for i, (k, a) in enumerate([(1, 1), (2.0, .5), (3.01, .25), (4.2, .12)])) * np.minimum(1, t / .002)
def tick(m): n = int(.06 * SR); t = ar(n); return np.sin(2 * np.pi * hz(m) * t) * np.exp(-t / .02)
def kick(): n = int(.3 * SR); t = ar(n); f = 45 + 100 * np.exp(-t / .03); return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .14))
def hat(): n = int(.05 * SR); return filt(R.standard_normal(n), 7000, 16000) * np.exp(-ar(n) / .012)
def crash(d=1.6): n = int(d * SR); return filt(R.standard_normal(n), 2000, 12000) * np.exp(-ar(n) / .4)
def boom(d=1.4): n = int(d * SR); t = ar(n); f = 30 + 60 * np.exp(-t / .2); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .5)
def vidro():
    n = int(.9 * SR); x = np.zeros(n)
    for _ in range(18):
        i = int(R.uniform(0, .25) * SR); m = int(.4 * SR); t = ar(m); x[i:i + m] += np.sin(2 * np.pi * R.uniform(2500, 6500) * t) * np.exp(-t / R.uniform(.03, .15)) * R.uniform(.3, 1)
    return x * .5 + filt(R.standard_normal(n), 3000, 12000) * np.exp(-ar(n) / .08) * .4
def whoosh(d=.4):
    n = int(d * SR); t = ar(n); return filt(R.standard_normal(n), 400, 5000) * np.sin(np.pi * t / d) ** 2 * .6
def acorde(ms, d=2.0): return sum(bell(m, d) for m in ms) / len(ms)

MEL = [69, 72, 76, 74, 72, 69, 67, 69, 72, 74, 76, 79, 76, 74, 72, 74, 76, 81, 79, 76, 74, 72, 74, 76, 72, 69, 67, 64, 67, 69, 72, 69]
ESC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
TEAM_NOTE = [72, 76, 79, 84]

# ── base a 120 BPM (some nos estouros)
c2, c3 = M['cena2'], M['cena3']
BEAT = .5; t = .0; k = 0
while t < DUR - .5:
    sc = 1 if t < c2 else 2 if t < c3 else 3; lvl = {1: .35 + .5 * min(1, t / 15), 2: .7, 3: .85}[sc]
    put(MU, kick(), t, .55 * lvl); put(MU, hat(), t + .25, .18 * lvl, .3)
    if sc >= 2 and k % 2 == 1: put(MU, hat(), t + .125, .1 * lvl, -.3)
    bass = [45, 45, 48, 43][(k // 4) % 4] if sc != 2 else [40, 40, 43, 38][(k // 4) % 4]
    put(MU, np.sin(2 * np.pi * hz(bass) * ar(int(.4 * SR))) * np.exp(-ar(int(.4 * SR)) / .2), t, .35 * lvl)
    t += BEAT; k += 1

ultimo = {}; mi = 0; aneis_q = 0
def pode(tipo, t, dt):
    if t - ultimo.get(tipo, -9) < dt: return False
    ultimo[tipo] = t; return True
for t, tipo, v in sorted(EVS, key=lambda e: e[0]):
    if tipo == 'bate1' and pode('bate1', t, .07): put(FX, marimba(MEL[mi % len(MEL)]), t, .32, R.uniform(-.5, .5)); mi += 1
    elif tipo == 'estouro': put(FX, crash(), t, .6); put(FX, boom(), t, .8); put(FX, acorde([57, 64, 69, 72, 76], 2.4), t + .05, .5); MARCAS.append((t, 'estouro do anel (LOTOU!)'))
    elif tipo == 'bate2' and pode('bate2', t, .05): put(FX, marimba(ESC[min(len(ESC) - 1, v + (mi % 3))] + 12), t, .38, R.uniform(-.4, .4)); mi += 1
    elif tipo == 'quebra': put(FX, vidro(), t, .55); put(FX, acorde([ESC[v] + 12, ESC[v + 2] + 12, ESC[v + 4] + 12], 1.4), t, .35); MARCAS.append((t, f'anel {v + 1} quebra'))
    elif tipo == 'livre': put(FX, crash(2.2), t, .6); put(FX, acorde([60, 64, 67, 72, 76, 79], 3.0), t, .6); MARCAS.append((t, 'LIVRE!'))
    elif tipo == 'conv' and pode('conv', t, .035): put(FX, tick(TEAM_NOTE[v] + R.choice([0, 12])), t, .14, R.uniform(-.6, .6))
    elif tipo == 'lider': put(FX, whoosh(), t, .35); MARCAS.append((t, f'novo líder: cor {v}'))
    elif tipo == 'vitoria':
        for q, m in enumerate([72, 76, 79, 84]): put(FX, bell(m, 1.6), t + q * .12, .45)
        put(FX, crash(2.2), t + .4, .5); MARCAS.append((t, f'vitória da cor {v}'))
for nome, t in M.items(): MARCAS.append((t, f'início da {nome}'))
for t, n in [(c2 - .3, 'whoosh de transição'), (c3 - .3, 'whoosh de transição')]: put(FX, whoosh(.6), t, .5)
mix = MU * .7 + FX
f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.5) * .5
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/out/som.wav'], input=mix.tobytes(), check=True)
with open(f'{ROOT}/out/marcas-som.txt', 'w') as fo:
    fo.write('MARCAS DE SOM · física satisfatória (sem narração; cada batida toca uma nota)\n\n'); [fo.write(f'{t:6.2f}  {n}\n') for t, n in sorted(MARCAS)]
print('som ok', round(DUR, 2), 's')
