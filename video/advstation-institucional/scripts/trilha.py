"""Trilha e efeitos sonoros PROCEDURAIS da ADV STATION (nascem deste código: sem amostras, loops ou modelos de terceiros).
Manual §05: trilha procedural própria; Maternidade em Fá maior; Previdenciário em Ré menor com resolução em Fá maior;
ducking de até −9 dB sob a narração. Lê out/timeline.json (scripts/exportar_timeline.mjs) e grava:
  public/assets/audio/trilha.wav   (com ducking, já no nível relativo à voz)
  public/assets/audio/efeitos.wav  (vinhetas de abertura e encerramento)
Uso: python3 scripts/trilha.py
"""
import json, subprocess, wave, glob
import numpy as np

SR = 48000
T = json.load(open('out/timeline.json'))
N = int((T['total'] + 0.05) * SR)
rng = np.random.default_rng(7)  # determinístico
BPM = 80
BEAT = 60 / BPM

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_ar(n, a, r):
    e = np.ones(n); a = max(1, int(a * SR)); r = max(1, int(r * SR))
    e[:a] = np.linspace(0, 1, a) ** 2 if a < n else np.linspace(0, 1, n) ** 2
    if r < n: e[-r:] *= np.linspace(1, 0, r) ** 1.5
    return e
def add(buf, x, t, pan=0.0, g=1.0):
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    if i >= len(buf) or len(x) == 0: return
    x = x[: len(buf) - i] * g
    if x.ndim == 2:  # já estéreo
        buf[i:i + len(x)] += x; return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * l * 1.41; buf[i:i + len(x), 1] += x * r * 1.41

# ---------- instrumentos ----------
def pad(midis, dur, amp=0.10):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((n, 2))
    for j, m in enumerate(midis):
        for side, det in ((-1, -4), (1, 4)):
            f = hz(m) * 2 ** (det / 1200)
            s = sum(a * np.sin(2 * np.pi * f * k * t + j + k) for k, a in ((1, 1), (2, .32), (3, .12), (4, .05)))
            lfo = 1 + 0.06 * np.sin(2 * np.pi * (0.13 + 0.02 * j) * t + j)
            ch = 0 if side < 0 else 1
            out[:, ch] += s * lfo
    out *= amp / len(midis) * env_ar(n, 1.6, 2.2)[:, None]
    return out

def piano(m, vel=0.5, dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR; f0 = hz(m); B = 0.0004; x = np.zeros(n)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + B * k * k)
        if fk > 16000: break
        x += (1 / k ** 1.25) * np.exp(-t * (0.9 + 0.55 * k)) * np.sin(2 * np.pi * fk * t + k)
    att = np.minimum(1, t / 0.004)
    return x * att * vel * 0.16 * env_ar(n, 0.001, 0.4)

def strings(midis, dur, amp=0.05):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((n, 2))
    for j, m in enumerate(midis):
        vib = 2 ** (0.06 * np.sin(2 * np.pi * 5.1 * t + j) / 12)
        ph = 2 * np.pi * np.cumsum(hz(m) * vib) / SR
        s = sum((1 / k) * (0.82 ** k) * np.sin(k * ph) for k in range(1, 10))
        out[:, j % 2] += s
    out *= amp / len(midis) * env_ar(n, 2.4, 2.4)[:, None]
    return out

def pulse(m, vel=0.6):
    n = int(0.6 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * hz(m) * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 7)
    return x * vel * 0.22

def noise_band(n, lo, hi, tilt=1.0):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    mask = ((f >= lo) & (f <= hi)).astype(float) / np.maximum(f, 20) ** (0.5 * tilt)
    x = np.fft.irfft(X * mask, n); return x / (np.abs(x).max() + 1e-9)

# ---------- harmonia por cena ----------
CH = {
    'Fadd9': [53, 57, 60, 67], 'F': [53, 57, 60, 64], 'Dm9': [50, 53, 57, 64], 'Dm': [50, 53, 57, 62], 'Bbmaj7': [46, 50, 53, 57],
    'C': [48, 55, 60, 64], 'Csus': [48, 55, 60, 65], 'Gm7': [43, 50, 53, 58], 'A': [45, 52, 57, 61], 'Am': [45, 52, 57, 60], 'C/E': [52, 55, 60, 64],
}
PLAN = {  # acordes, energia do piano, pulso, cordas, textura
    'intro': (['Fadd9'], 0.0, 0, 0, 0.3),
    'opening': (['Dm9', 'Bbmaj7', 'F', 'Csus'], 0.25, 0, 0, 1.0),
    'complexity': (['Dm', 'Bbmaj7', 'Gm7', 'A'], 0.35, 0.35, 0, 0.8),
    'brand': (['F', 'C/E', 'Dm', 'Bbmaj7'], 0.45, 0, 0.6, 0.4),
    'maternidade': (['F', 'Am', 'Bbmaj7', 'C', 'F', 'Am', 'Bbmaj7', 'C'], 0.5, 0.6, 0.5, 0.2),       # Fá maior
    'previdenciario': (['Dm', 'Bbmaj7', 'C', 'Dm', 'Bbmaj7', 'C', 'F'], 0.5, 0.6, 0.5, 0.2),          # Ré menor → resolve em Fá
    'twoProducts': (['F', 'C', 'Dm', 'Bbmaj7'], 0.55, 0.7, 0.9, 0.1),
    'value': (['F', 'C', 'Dm', 'Bbmaj7'], 0.5, 0.6, 0.8, 0.1),
    'human': (['Bbmaj7', 'F', 'Gm7', 'Csus'], 0.3, 0, 0.6, 0.3),
    'signature': (['Csus', 'F'], 0.4, 0, 0.9, 0.2),
}

music = np.zeros((N, 2))
for k, (chords, pv, pu, st, tx) in PLAN.items():
    s0, d = T['scenes'][k]['start'], T['scenes'][k]['dur']
    if k == 'signature':
        spans = [(s0, (T['marks']['final_t0'] - s0) + 0.6, 'Csus'), (T['marks']['final_t0'] + 0.6, s0 + d - T['marks']['final_t0'] - 0.6, 'F')]
    else:
        seg = d / len(chords); spans = [(s0 + i * seg, seg, c) for i, c in enumerate(chords)]
    for (t0, sd, c) in spans:
        add(music, pad(CH[c], sd + 1.8), t0 - 0.4)  # sobreposição suave entre acordes
        add(music, pad([CH[c][0] - 12], sd + 1.8, amp=0.06), t0 - 0.4)  # baixo
        if st: add(music, strings([m + 12 for m in CH[c][1:]], sd + 2.0, amp=0.045 * st), t0 - 0.3)
        if pv:
            arp = [CH[c][0] + 12, CH[c][2] + 12, CH[c][1] + 24, CH[c][2] + 12]
            step = BEAT if pv < 0.45 else BEAT / 2
            nb = int(sd / step)
            for b in range(nb):
                if pv < 0.3 and b % 2: continue
                m = arp[b % len(arp)]
                add(music, piano(m, vel=pv * (0.85 + 0.15 * ((b % 4) == 0))), t0 + b * step, pan=0.25 * np.sin(b))
        if pu:
            for b in range(int(sd / BEAT)):
                add(music, pulse(CH[c][0] - 12, vel=pu * (1.0 if b % 4 == 0 else 0.6)), t0 + b * BEAT)
    if tx:
        n = int(d * SR); x = noise_band(n, 300, 2500) * env_ar(n, 1.5, 1.5) * (0.5 + 0.5 * np.sin(np.arange(n) / SR * 0.4))
        add(music, x * 0.012 * tx, s0, pan=-0.3); add(music, np.roll(x, 9000) * 0.012 * tx, s0, pan=0.3)
# acorde final do piano + respiro
t_end = T['marks']['final_t0'] + 0.6
for i, m in enumerate([53, 60, 65, 69, 72]): add(music, piano(m, vel=0.55, dur=6), t_end + i * 0.04)
fade = int(2.5 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

# ---------- efeitos das vinhetas (mesmos instantes da animação original) ----------
fx = np.zeros((N, 2))
def whoosh(dur, lo, hi, rising=True, g=0.5):
    n = int(dur * SR); x = noise_band(n, 200, 9000, tilt=0.6); t = np.arange(n) / n
    # varredura: realça faixas diferentes ao longo do tempo
    X = np.zeros(n); seg = 12
    for i in range(seg):
        a, b = int(i * n / seg), int((i + 1) * n / seg); p = (i + 0.5) / seg
        c = lo * (hi / lo) ** (p if rising else 1 - p)
        X[a:b] = noise_band(b - a, c * 0.6, c * 1.6, tilt=0.3)
    return X * np.sin(np.pi * t) ** 1.6 * g
def chime(m, dur=2.5, g=0.35):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = sum(a * np.exp(-t * dcy) * np.sin(2 * np.pi * f * r * t) for r, a, dcy in ((1, 1, 1.6), (2.76, .45, 3.2), (5.4, .2, 5.5), (8.93, .08, 8)))
    return x * np.minimum(1, t / 0.003) * g
def spring_pop(g=0.5):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 160 + 260 * (1 - np.exp(-t * 14)) + 18 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * g
def bubble(g=0.35):
    n = int(1.2 * SR); t = np.arange(n) / SR
    return noise_band(n, 60, 500, tilt=1.2) * np.exp(-t * 3) * np.minimum(1, t / 0.03) * g
def sparkles(t0, g=0.18):
    for i in range(14):  # 14 faíscas, atrasos (i % 4) * 0.03 como na vinheta
        add(fx, chime(84 + (i * 5) % 12, dur=0.9, g=g * (0.7 + 0.3 * (i % 3) / 2)), t0 + 1.1 + (i % 4) * 0.03 + i * 0.012, pan=np.cos(i / 14 * 2 * np.pi) * 0.8)
def letters(t0, g=0.06):
    for i in range(11): add(fx, chime(96 + (i % 3), dur=0.25, g=g), t0 + 1.15 + i * 0.05, pan=-0.6 + i * 0.12)
def vinheta(t0, titulo=False):
    add(fx, whoosh(0.55, 400, 5000, rising=True, g=0.35), t0 + 0.1)          # plataforma desliza
    add(fx, spring_pop(0.45), t0 + 0.55)                                       # A sobe com mola
    add(fx, bubble(0.4), t0 + 1.05)                                            # bolha dourada
    sparkles(t0); letters(t0)                                                  # faíscas + letras
    add(fx, chime(65, dur=3.0, g=0.22), t0 + 1.2); add(fx, chime(72, dur=3.0, g=0.16), t0 + 1.24)
    if titulo:
        for i, m in enumerate([65, 69, 72, 77]): add(fx, chime(m, dur=3.5, g=0.16), t0 + 2.85 + i * 0.035)  # título entra (Fá maior)

M = T['marks']
# ASSINATURA SONORA DA SÉRIE (manual §01.8: reutilizar a assinatura sonora): o jingle oficial das vinhetas,
# recortado da referência enviada pelo cliente (1,15 s → 4,85 s, sem a narração), no início de cada vinheta.
def load_flac(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
JINGLE = load_flac('public/assets/audio/jingle-vinheta.flac')
JW = []  # janelas do jingle (a trilha sai de cena para não embolar)
for t0 in (M['intro_t0'], M['final_t0']):
    add(fx, JINGLE, t0); JW.append((t0, t0 + len(JINGLE) / SR))
gate = np.ones(N); fd = int(0.3 * SR)
for a, b in JW:
    ia, ib = max(0, int((a - 0.3) * SR)), min(N, int(b * SR))
    gate[ia:ib] = 0
    if ia > 0: gate[max(0, ia - fd):ia] = np.minimum(gate[max(0, ia - fd):ia], np.linspace(1, 0, ia - max(0, ia - fd)))
    gate[ib:min(N, ib + fd)] = np.minimum(gate[ib:min(N, ib + fd)], np.linspace(0, 1, min(N, ib + fd) - ib))
music *= gate[:, None]

# ---------- níveis: trilha ~10 dB abaixo da voz fora das falas; ducking −9 dB sob a narração ----------
def lufs(x):
    p = 'out/.tmp.wav'; write(p, x)
    o = subprocess.run(['ffmpeg', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in o.splitlines() if l.strip().startswith('I:')][-1].split()[1])
def write(p, x):
    y = np.clip(x, -1, 1); y = (y * 32767).astype('<i2')
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())

voz_lufs = float([l for l in subprocess.run(['ffmpeg', *sum([['-i', f] for f in sorted(glob.glob('public/assets/audio/falas/*.mp3'))], []),
    '-filter_complex', f"concat=n={len(glob.glob('public/assets/audio/falas/*.mp3'))}:v=0:a=1,ebur128", '-f', 'null', '-'], capture_output=True, text=True).stderr.splitlines() if l.strip().startswith('I:')][-1].split()[1])
music *= 10 ** ((voz_lufs - 10 - lufs(music)) / 20)
duck = np.zeros(N)
for v in T['voz']:
    a, b = int(v['start'] * SR), int((v['start'] + v['dur']) * SR); duck[a:b] = 1
k_att, k_rel = 1 - np.exp(-1 / (0.15 * SR)), 1 - np.exp(-1 / (0.5 * SR))
g = np.empty(N); s = 0.0
for i in range(N):  # envelope com ataque 150 ms e liberação 500 ms
    tgt = duck[i]; s += (k_att if tgt > s else k_rel) * (tgt - s); g[i] = s
music *= (1 - (1 - 10 ** (-9 / 20)) * g)[:, None]
fx *= 10 ** ((voz_lufs - 11 - lufs(fx)) / 20) if np.abs(fx).max() > 0 else 1
for nm, x in (('trilha', music), ('efeitos', fx)):
    pk = np.abs(x).max()
    if pk > 0.89: x *= 0.89 / pk
    write(f'public/assets/audio/{nm}.wav', x)
print('voz', voz_lufs, 'LUFS | trilha', round(lufs(music), 1), '| efeitos', round(lufs(fx), 1))
