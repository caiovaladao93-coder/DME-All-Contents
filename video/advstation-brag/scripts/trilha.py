"""Trilha procedural do /brag ADV STATION (sem amostras de terceiros, exceto o jingle oficial da série).

120 BPM, Fá maior. Os estalos das plaquinhas (eventos exportados do video.html) são a percussão.
uso: python3 scripts/trilha.py brag-output/work/eventos.json brag-output/work/jingle-vinheta.flac brag-output/work/mix.wav
"""
import json, subprocess, sys
import numpy as np
import musica_score


SR = 48000
DUR = 32.0
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


# Linha do tempo com locução (mesmos nós do video.html: [saída, original]).
WARP = [[0, 0], [7.2, 7.2], [8.2, 7.2], [8.5, 7.5], [11.5, 9.5], [15.2, 13.2], [16.7, 13.2], [19.7, 16.2], [21.2, 16.2],
        [23.5, 18.5], [25.0, 18.5], [30.4, 23.9], [31.9, 23.9], [32.0, 24.0]]


def out_t(t):
    for (a, x), (b, y) in zip(WARP, WARP[1:]):
        if y > x and t <= y:
            return a + (b - a) * (t - x) / (y - x)
    return DUR


T_CAOS, T_CAOS_FIM, T_VIN = out_t(7.5), out_t(9.5), out_t(19.0)  # 8,5 · 11,5 · 25,5

# Locução (Guilherme): início de cada fala em segundos de saída
FALAS = [('gancho', 0.35), ('partidas', 3.35), ('caos', 8.6), ('pg', 11.9), ('ml', 17.4), ('embarque', 22.45), ('assinatura', 29.3)]


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def main(ev_path, jingle_path, out_path):
    ev = json.load(open(ev_path))
    clat = np.zeros(N); mus = np.zeros(N); fx = np.zeros(N); voz = np.zeros(N); fala = np.zeros(N)
    aneis = iter([81, 81, 72, 76, 81])

    for i, e in enumerate(ev):
        if e['k'] == 'flap':
            add(clat, FLAPS[i % len(FLAPS)], e['t'], 0.16 * rng.uniform(.7, 1))
        elif e['k'] == 'flapG':
            add(clat, FLAPSG[i % len(FLAPSG)], e['t'], 0.5 * rng.uniform(.75, 1))
        elif e['k'] == 'tick':
            add(fx, flap(True) * 1.2, e['t'], .55); add(fx, bell(84, .5), e['t'], .10)
        elif e['k'] == 'anel':
            add(fx, bell(next(aneis, 77)), e['t'], .32)
        elif e['k'] == 'virada':
            add(fx, whoosh(.45), e['t'] - .2, .35); add(fx, kick(), e['t'] + .3, .7)
    clat = np.tanh(clat * 1.6) / 1.6

    # trilha original no estilo épico (scripts/musica_score.py), alinhada às cenas
    sec = {'intro': 0.0, 'verso': 3.0, 'build': T_CAOS, 'respiro': T_CAOS_FIM - .5, 'refrao': T_CAOS_FIM,
           'saida': out_t(17.0), 'fim': T_VIN}
    mus = musica_score.build(N, sec)                       # estéreo (N, 2)
    L = T_CAOS_FIM - T_CAOS
    tt = np.arange(N) / SR
    rms0 = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
    mr = rms0(mus[int(3 * SR):int(T_VIN * SR)].mean(1))
    # estalos ~5 dB abaixo da música (medidos onde há estalos); efeitos (sinos, viradas) ~3 dB abaixo
    clat *= mr / rms0(clat[np.abs(clat) > 1e-4]) * 10 ** (-5 / 20)
    fx *= mr / rms0(fx[np.abs(fx) > 1e-4]) * 10 ** (-3 / 20)
    sfx = (fx + clat)[:, None]
    bed = (mus + sfx) * np.clip((T_VIN - tt) / .12, 0, 1)[:, None]

    # locução: posiciona as falas e monta o envelope de presença de voz
    for nome, t0 in FALAS:
        x = load(f'voz/{nome}.mp3')
        add(voz, x, t0)
        a = json.load(open(f'voz/{nome}.json'))['alignment']
        i0, i1 = int((t0 + a['character_start_times_seconds'][0]) * SR), int((t0 + a['character_end_times_seconds'][-1]) * SR)
        fala[i0:i1] = 1
    # ducking: −6 dB sob a voz (ataque 150 ms, liberação 500 ms)
    env_d = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.15 * SR)), np.exp(-1 / (.5 * SR))
    for k in range(N):
        c = aa if fala[k] > g else rr
        g = c * g + (1 - c) * fala[k]; env_d[k] = g
    duck = (10 ** (-6 * env_d / 20))[:, None]
    rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
    vr = rms(voz[fala > 0])
    voz *= (mr * 10 ** (4 / 20)) / vr  # voz 4 dB acima da música (10 dB acima sob o ducking): trilha presente
    mix = bed * duck + voz[:, None]
    import os
    if os.environ.get('STEMS'):
        for nm, arr in (('bed', bed * duck), ('voz', np.stack([voz, voz], 1))):
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'brag-output/work/stem-{nm}.wav'], input=arr.astype(np.float32).tobytes(), check=True)

    # jingle oficial da série: ~5 dB abaixo da voz, como no institucional
    jin = load(jingle_path)
    jin *= rms(voz[fala > 0]) / rms(jin) * 10 ** (-5.0 / 20)
    i0 = int(T_VIN * SR); mix[i0:i0 + len(jin)] += jin[:N - i0, None]
    tail = pad([50, 57, 62, 65], 3.0) * .05; i1 = int((T_VIN + 3.6) * SR); mix[i1:i1 + len(tail)] += tail[:N - i1, None]
    mix *= np.clip((DUR - tt) / .25, 0, 1)[:, None]
    mix /= np.max(np.abs(mix)) * 1.12
    st = mix.astype(np.float32)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', out_path], input=st.tobytes(), check=True)
    with open(out_path.rsplit('/', 1)[0] + '/../marcas-som.txt', 'w') as f:
        f.write('Marcas de som (s) · ADV STATION /brag narrado\n')
        for nome, t0 in FALAS:
            a = json.load(open(f'voz/{nome}.json'))['alignment']
            f.write(f"{t0:6.2f}–{t0 + a['character_end_times_seconds'][-1]:6.2f}  voz {nome}: {json.load(open(f'voz/{nome}.json'))['text']}\n")
        f.write(f"{T_CAOS:6.2f}–{T_CAOS_FIM:6.2f}  subida (caos), caixa acelerando e respiro antes do refrão\n")
        for e in ev:
            if e['k'] in ('virada', 'anel', 'tick', 'jingle'): f.write(f"{e['t']:6.2f}         {e['k']}\n")


if __name__ == '__main__':
    main(*sys.argv[1:4])
