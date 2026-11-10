"""Trilha ORIGINAL e efeitos do filme SGC, sintetizados em numpy (sem amostras de terceiros).

Eletrônica cinematográfica, minimalista e corporativa, a 100 BPM:
  - 0 a 8,6 s: tensão discreta (pulso grave, pad escuro em Ré menor, textura);
  - 8,6 s (marca): resolve e entra o arpejo; cresce durante a demonstração do diagnóstico;
  - assinatura: resolve em Fá maior, com assinatura sonora curta de três notas.
A música já sai com ducking sob a voz (as falas entram no Remotion, com os tempos de data/timeline.json).
uso: python3 scripts/trilha.py   → public/assets/audio/trilha.wav
"""
import json, subprocess
import numpy as np

SR = 48000
ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
FPS = TL['fps']
starts, acc = {}, 0
for s in TL['scenes']:
    starts[s['key']] = acc; acc += s['dur']
TOTAL = acc / FPS
N = int(SR * TOTAL)
BEAT = 60 / 100
BAR = 4 * BEAT
rng = np.random.default_rng(23)
sec = lambda k: starts[k] / FPS


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def ar(n): return np.arange(n) / SR


def fftfilt(x, resp):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * resp(f), len(x))
def lp(fc, o=2): return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * o))
def hp(fc, o=2): return lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * o))
def band(lo, hi): return lambda f: lp(hi)(f) * hp(lo)(f)


def conv(x, ir):
    n = len(x) + len(ir) - 1; nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]


def make_ir(dur, seed):
    r = np.random.default_rng(seed); t = ar(int(dur * SR))
    x = r.standard_normal(len(t)) * np.exp(-t * 6.9 / dur)
    x = fftfilt(x, band(200, 8000)); k = int(.02 * SR); x[:k] *= np.linspace(0, 1, k)
    return x / np.sqrt(np.sum(x ** 2))


def sweep(f0, f1, tau, n):
    t = ar(n); f = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ───────── timbres ─────────
def sub_pulse(m, g=1.0):
    n = int(.7 * SR); t = ar(n)
    return g * (np.sin(2 * np.pi * hz(m) * t) + .25 * np.sin(4 * np.pi * hz(m) * t)) * np.minimum(1, t / .01) * np.exp(-t / .28)


def pad(ms, dur, bright=0.0):
    n = int(dur * SR); t = ar(n); x = np.zeros(n)
    for m in ms:
        for d in (-7, 0, 7):
            f = hz(m) * 2 ** (d / 1200)
            ph = rng.random()
            x += np.sin(2 * np.pi * (f * t + ph)) + (.18 + .25 * bright) * np.sin(2 * np.pi * (2 * f * t + ph)) + .08 * bright * np.sin(2 * np.pi * (3 * f * t))
    a = np.minimum(1, t / .6) * np.minimum(1, (dur - t) / .6)
    return x * a / (3 * len(ms))


def pluck(m, dur=.5):
    n = int(dur * SR); t = ar(n)
    x = sum(a * np.sin(2 * np.pi * hz(m) * k * t) for k, a in ((1, 1), (2, .35), (3, .12)))
    return x * np.minimum(1, t / .003) * np.exp(-t / .16)


def bass(m, dur):
    n = int(dur * SR); t = ar(n)
    x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.tanh(2 * np.sin(2 * np.pi * hz(m) * t))
    return x * np.minimum(1, t / .005) * np.exp(-t / .3)


def kick():
    n = int(.4 * SR); t = ar(n)
    return sweep(130, 46, .03, n) * np.exp(-t / .2)


def shaker():
    n = int(.08 * SR); t = ar(n)
    return fftfilt(rng.standard_normal(n), hp(6000)) * np.exp(-t / .018)


def bell(m, dur=2.0):
    n = int(dur * SR); t = ar(n)
    x = sum(a * np.sin(2 * np.pi * hz(m) * k * t) * np.exp(-t / (dur / (1 + 1.5 * i))) for i, (k, a) in enumerate([(1, 1), (2.0, .4), (3.01, .18), (4.16, .08)]))
    return x * np.minimum(1, t / .002)


def whoosh(dur, up=True):
    n = int(dur * SR); out = np.zeros(n); w = int(.05 * SR); hop = w // 2; win = np.hanning(w); src = rng.standard_normal(n + w)
    for i in range(0, n, hop):
        p = i / n if up else 1 - i / n; fc = 400 * (16 ** p)
        seg = fftfilt(src[i:i + w], band(fc * .4, fc)) * win; j = min(n, i + w); out[i:j] += seg[:j - i]
    t = ar(n)
    return out / (np.max(np.abs(out)) + 1e-9) * np.sin(np.pi * t / dur) ** 2


def boom(dur=1.6):
    n = int(dur * SR); t = ar(n)
    return sweep(80, 32, .25, n) * np.exp(-t / .6) * np.minimum(1, t / .004)


def blip(m=84):
    n = int(.25 * SR); t = ar(n)
    return np.sin(2 * np.pi * hz(m) * t) * np.exp(-t / .05) * np.minimum(1, t / .002) + .5 * np.sin(2 * np.pi * hz(m + 7) * t) * np.exp(-t / .04)


def click():
    n = int(.03 * SR); t = ar(n)
    return fftfilt(rng.standard_normal(n), band(1500, 7000)) * np.exp(-t / .004)


def main():
    L = np.zeros((N, 2)); send = np.zeros((N, 2)); fx = np.zeros((N, 2))

    def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
        i = int(round(t0 * SR))
        if i >= N: return
        if i < 0: sig, i = sig[-i:], 0
        j = min(N, i + len(sig)); s = sig[:j - i] * g
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
        if rev: send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707

    T_BRAND, T_Q, T_UN, T_PDF, T_CTA = sec('brand'), sec('questions'), sec('unlock'), sec('pdf'), sec('cta')
    # ── harmonia: tensão (Dm com 9ª) até a marca; depois Dm · B♭ · F · C; resolve em F na assinatura
    PROG = [(50, 57, 64, 65), (46, 53, 62, 65), (41, 53, 60, 65), (48, 55, 62, 64)]
    ROOTS = [38, 34, 41, 36]
    # pad de tensão
    put(L, pad((38, 45, 52, 53), T_BRAND + .6), 0, .42, 0, .3)
    # pulso grave (batimento duplo, como coração) e textura
    for tb in np.arange(0, T_BRAND, BEAT):
        k = int(round(tb / BEAT)) % 4
        if k in (0, 2): put(L, sub_pulse(26, .9), tb); put(L, sub_pulse(26, .45), tb + .18)
        for s16 in range(4):
            put(L, shaker(), tb + s16 * BEAT / 4, .05 + .05 * (tb / T_BRAND), rng.uniform(-.5, .5))
    put(fx, whoosh(1.0), T_BRAND - 1.0, .35, 0, .3)
    # ── a partir da marca: progressão
    t = T_BRAND; bar = 0
    while t < T_CTA - 1e-6:
        ch = PROG[bar % 4]; dur = min(BAR, T_CTA - t)
        grow = np.clip((t - T_BRAND) / (T_UN + 4 - T_BRAND), 0, 1)
        put(L, pad(ch, dur + .5, bright=.3 + .5 * grow), t, .34 + .1 * grow, 0, .35)
        for b in range(4):
            tb = t + b * BEAT
            if tb >= T_CTA: break
            if t >= T_Q:  # bateria leve a partir das perguntas
                if b in (0, 2): put(L, kick(), tb, .55 + .2 * grow)
                for e in range(2): put(L, shaker(), tb + e * BEAT / 2, .10 + .06 * grow, .3 if e else -.3)
            put(L, bass(ROOTS[bar % 4], BEAT * .95), tb, .45 + .15 * grow)
            put(L, bass(ROOTS[bar % 4] + 12, BEAT * .45), tb + BEAT / 2, .18 + .12 * grow)
        # arpejo (colcheias; semicolcheias a partir do desbloqueio)
        step = BEAT / 2 if t < T_UN else BEAT / 4
        notes = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
        for i, ta in enumerate(np.arange(t, t + dur - 1e-6, step)):
            put(L, pluck(notes[i % 4]), ta, .16 + .08 * grow, .45 * (1 if i % 2 else -1), .45)
        t += BAR; bar += 1
    # ── assinatura: resolve em F maior
    put(L, pad((41, 53, 57, 60, 65), TOTAL - T_CTA + .2, bright=.6), T_CTA, .5, 0, .5)
    put(L, bass(29, 3.0), T_CTA, .5)
    for i, m in enumerate((77, 81, 84)):  # assinatura sonora: Fá · Lá · Dó
        put(fx, bell(m, 2.6), T_CTA + .25 + i * .22, .22, (-.3, 0, .3)[i], .6)

    # ── efeitos (data/timeline.json), discretos
    hook_voice = json.load(open(f'{ROOT}/src/data/voz/hook.json'))['alignment']
    chars = ''.join(hook_voice['characters']); i_s = chars.lower().find('saúde')
    t_saude = (TL['scenes'][0]['voice'] / FPS) + hook_voice['character_start_times_seconds'][max(0, i_s)]
    for e in TL['sfx']:
        te = (starts[e['scene']] + e['f']) / FPS
        k = e['k']
        if k == 'pulse': put(fx, boom(2.0), te, .55, 0, .2)
        elif k == 'impact': put(fx, boom(1.4), t_saude, .45, 0, .3); put(fx, bell(62, 1.5), t_saude, .10, 0, .5)
        elif k == 'line': put(fx, whoosh(.5), te - .1, .28, -.2, .2)
        elif k == 'swipe': put(fx, whoosh(.4), te - .05, .2, .3, .2)
        elif k == 'tick': put(fx, click(), te, .25)
        elif k == 'logo': put(fx, boom(1.6), te, .4, 0, .2); put(fx, bell(81, 2.2), te + .05, .16, 0, .6); put(fx, bell(88, 1.8), te + .12, .08, .2, .6)
        elif k == 'highlight': put(fx, blip(88), te, .12, .2, .4)
        elif k == 'unlock': put(fx, click(), te, .35); put(fx, click(), te + .07, .25); put(fx, blip(84), te + .12, .14, 0, .4)
        elif k == 'end': pass  # coberto pela assinatura sonora

    ir = [make_ir(2.2, 7 + c) for c in (0, 1)]
    rev = np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
    music = L + fx + .5 * rev
    tt = ar(N)
    music *= np.clip(tt / .05, 0, 1)[:, None] * np.clip((TOTAL - tt) / 1.2, 0, 1)[:, None]

    # ── ducking sob a voz e nível relativo à voz (−13 dB entre as falas, −19 dB sob a fala)
    fala = np.zeros(N); vrms = []
    for s in TL['scenes']:
        a = json.load(open(f"{ROOT}/src/data/voz/{s['key']}.json"))['alignment']
        t0 = (starts[s['key']] + s['voice']) / FPS
        i0, i1 = int((t0 + a['character_start_times_seconds'][0]) * SR), int((t0 + a['character_end_times_seconds'][-1]) * SR)
        fala[i0:i1] = 1
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['key']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        v = np.frombuffer(raw, np.float32); v = v[np.abs(v) > 1e-3]; vrms.append(np.sqrt(np.mean(v ** 2)))
    env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.15 * SR)), np.exp(-1 / (.45 * SR))
    for k in range(N):
        c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
    duck = 10 ** (-6 * env / 20)
    mrms = np.sqrt(np.mean(music[fala == 0] ** 2))
    music *= (np.mean(vrms) * 10 ** (-13 / 20)) / mrms
    music *= duck[:, None]
    peak = np.max(np.abs(music))
    if peak > .7: music *= .7 / peak
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'],
                   input=music.astype(np.float32).tobytes(), check=True)
    with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
        f.write('Marcas de som (s) · SGC Apresentação 39 s\n\nFALAS (Guilherme, ElevenLabs)\n')
        LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
        for s in TL['scenes']:
            d = json.load(open(f"{ROOT}/src/data/voz/{s['key']}.json"))
            t0 = (starts[s['key']] + s['voice']) / FPS
            f.write(f"{t0:6.2f}–{t0 + d['alignment']['character_end_times_seconds'][-1]:6.2f}  {s['key']}: {LEG[s['key']]}\n")
        f.write('\nEFEITOS\n')
        for e in TL['sfx']:
            te = t_saude if e['k'] == 'impact' else (starts[e['scene']] + e['f']) / FPS
            f.write(f"{te:6.2f}  {e['k']} ({e['scene']})\n")
        f.write(f"\nTRILHA: tensão 0–{T_BRAND:.2f} · progressão Dm–B♭–F–C a partir de {T_BRAND:.2f} · bateria leve a partir de {T_Q:.2f} · arpejo em semicolcheias a partir de {T_UN:.2f} · resolução em Fá maior e assinatura (Fá–Lá–Dó) em {T_CTA:.2f}\n")
    print('trilha ok', TOTAL)


if __name__ == '__main__':
    main()
