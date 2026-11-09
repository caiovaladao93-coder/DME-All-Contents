"""Trilha procedural do /brag ADV STATION (sem amostras de terceiros, exceto o jingle oficial da série).

120 BPM, Fá maior. Os estalos das plaquinhas (eventos exportados do video.html) são a percussão.
uso: python3 scripts/trilha.py brag-output/work/eventos.json brag-output/work/jingle-vinheta.flac brag-output/work/mix.wav
"""
import json, subprocess, sys
import numpy as np

SR = 48000
DUR = 24.0
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def add(buf, sig, t0, g=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += g * sig[: j - i]


def onepole_hp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); prev_x = prev_y = 0.0
    for k in range(len(x)):
        prev_y = a * (prev_y + x[k] - prev_x); prev_x = x[k]; y[k] = prev_y
    return y


# ── estalo de plaquinha: ruído curto agudo + "tic" ressonante + leve batida ──
def flap(big):
    n = int(SR * (0.03 if big else 0.018))
    t = np.arange(n) / SR
    nz = onepole_hp(rng.standard_normal(n), 1800 if big else 2600) * np.exp(-t / (0.004 if big else 0.0025))
    f = rng.uniform(1700, 2400) if big else rng.uniform(2600, 3600)
    tic = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006)
    thump = np.sin(2 * np.pi * (180 if big else 320) * t) * np.exp(-t / 0.008)
    return 0.55 * nz + 0.35 * tic + (0.5 if big else 0.2) * thump


FLAPS = [flap(False) for _ in range(24)]
FLAPSG = [flap(True) for _ in range(12)]


def bell(m, dur=1.8):
    n = int(SR * dur); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * hz(m) * k * t) * np.exp(-t / (dur / (1 + 1.6 * i))) for i, (k, a) in enumerate([(1, 1), (2.0, .45), (3.01, .22), (4.2, .1)]))
    return s * np.minimum(1, t / .003)


def pad(ms, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.0, 0.07):
            f = hz(m) * 2 ** (d / 12)
            s += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4)
    return s * a / (3 * len(ms))


def bass(m, dur=0.42):
    n = int(SR * dur); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * 2 * hz(m) * t)) * env(n, .004, .16)


def kick():
    n = int(SR * .35); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .11)


def whoosh(dur, up=True):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # filtro passa-baixa variável (aproximação) por média móvel com janela decrescente
    out = np.zeros(n); k0 = 60
    c = np.cumsum(np.concatenate([[0], x]))
    for i in range(n):
        p = t[i] / dur if up else 1 - t[i] / dur
        k = max(2, int(k0 * (1 - .95 * p)))
        lo = max(0, i - k); out[i] = (c[i + 1] - c[lo]) / (i + 1 - lo)
    return out * (np.sin(np.pi * t / dur) ** 2)


def main(ev_path, jingle_path, out_path):
    ev = json.load(open(ev_path))
    clat = np.zeros(N); mus = np.zeros(N); fx = np.zeros(N)

    for i, e in enumerate(ev):
        if e['k'] == 'flap':
            add(clat, FLAPS[i % len(FLAPS)], e['t'], 0.16 * rng.uniform(.7, 1))
        elif e['k'] == 'flapG':
            add(clat, FLAPSG[i % len(FLAPSG)], e['t'], 0.5 * rng.uniform(.75, 1))
        elif e['k'] == 'tick':
            add(fx, flap(True) * 1.2, e['t'], .55); add(fx, bell(84, .5), e['t'], .10)
        elif e['k'] == 'anel':
            add(fx, bell({7.0: 81, 13.0: 81, 14.5: 72, 15.0: 76, 15.5: 81}.get(round(e['t'], 1), 77)), e['t'], .32)
        elif e['k'] == 'virada':
            add(fx, whoosh(.45), e['t'] - .2, .35); add(fx, kick(), e['t'] + .3, .7)
    # compressão suave do barulho das plaquinhas (densidade muda muito)
    clat = np.tanh(clat * 1.6) / 1.6

    # harmonia por compasso (2 s): F · Dm · B♭ · C
    prog = [[53, 57, 60, 65], [50, 57, 62, 65], [46, 58, 62, 65], [48, 55, 60, 64]]
    roots = [41, 38, 34, 36]
    for bar in range(int(19 / 2) + 1):
        t0 = bar * 2.0
        if t0 >= 19.0: break
        ch = prog[bar % 4]; g = .16
        add(mus, pad(ch, min(2.25, 19.0 - t0 + .2)), t0, g)
        if t0 >= 3.0:
            for b in range(4):
                tb = t0 + b * BEAT
                if tb >= 19.0: break
                if 9.0 <= tb < 9.5: continue  # respiro antes da virada
                add(mus, bass(roots[bar % 4]), tb, .30)
                if b in (0, 2): add(mus, kick(), tb, .45)
    # subida no caos (7,5 → 9,5)
    add(fx, whoosh(2.0) * np.linspace(.2, 1, int(SR * 2.0)), 7.5, .30)
    # trilha sai antes do jingle
    tt = np.arange(N) / SR
    gate = np.clip((19.0 - tt) / .12, 0, 1)
    mix = (mus + fx + clat * .9) * gate

    # jingle oficial da série no início da vinheta, nivelado pelo corpo do vídeo
    j = subprocess.run(['ffmpeg', '-v', 'error', '-i', jingle_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    jin = np.frombuffer(j, dtype=np.float32).astype(np.float64)
    body = mix[int(3 * SR):int(17 * SR)]
    rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
    jin *= rms(body) / rms(jin) * 10 ** (-1.0 / 20)
    add(mix, jin, 19.0)
    # cauda: acorde de Fá bem baixo enquanto o título da vinheta fica na tela
    add(mix, pad([53, 57, 60, 65], 2.4), 21.6, .05)
    mix *= np.clip((DUR - tt) / .25, 0, 1)
    mix /= np.max(np.abs(mix)) * 1.12
    st = np.stack([mix, mix], 1).astype(np.float32)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', out_path], input=st.tobytes(), check=True)


if __name__ == '__main__':
    main(*sys.argv[1:4])
