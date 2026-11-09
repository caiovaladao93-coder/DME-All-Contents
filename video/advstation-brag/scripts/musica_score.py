"""Trilha ORIGINAL no estilo épico de pop-rock (referência de linguagem: The Score). Não reproduz melodia,
letra nem gravação de nenhuma música. É toda sintetizada em numpy: pisadas e palmas, bateria grande,
power chords distorcidos em estéreo, cordas em ostinato, coral, subidas e impactos.

Ré menor, Dm · B♭ · F · C (um acorde por compasso de 2 s), 120 BPM, alinhada às cenas do vídeo narrado.
"""
import numpy as np

SR = 48000
BEAT = 0.5
rng = np.random.default_rng(11)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def ar(n):
    return np.arange(n) / SR


def fftfilt(x, resp):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * resp(f), len(x))


def lp(fc, o=2):
    return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * o))


def hp(fc, o=2):
    return lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * o))


def band(lo, hi, o=2):
    return lambda f: lp(hi, o)(f) * hp(lo, o)(f)


def conv(x, ir):
    n = len(x) + len(ir) - 1; nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]


def make_ir(dur, seed):
    r = np.random.default_rng(seed); t = ar(int(dur * SR))
    x = r.standard_normal(len(t)) * np.exp(-t * 6.9 / dur)
    x = fftfilt(x, band(150, 7000))
    k = int(.015 * SR); x[:k] *= np.linspace(0, 1, k)
    return x / np.sqrt(np.sum(x ** 2))


def saw(f, n, ph=0.0):
    return 2 * ((f * ar(n) + ph) % 1) - 1


def sweep(f0, f1, tau, n):
    t = ar(n); f = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ───────── bateria ─────────
def stomp():
    n = int(.5 * SR); t = ar(n)
    body = sweep(140, 46, .035, n) * np.exp(-t / .2)
    nz = fftfilt(rng.standard_normal(n), lp(900)) * np.exp(-t / .05)
    return 1.0 * body + 0.5 * nz / (np.max(np.abs(nz)) + 1e-9)


def clap():
    n = int(.35 * SR); t = ar(n); e = np.zeros(n)
    for d in (0, .010, .019, .029):
        m = t >= d; e[m] += np.exp(-(t[m] - d) / .005)
    m = t >= .029; e[m] += .55 * np.exp(-(t[m] - .029) / .1)
    x = fftfilt(rng.standard_normal(n), band(900, 5200)) * e
    return x / np.max(np.abs(x))


def kick():
    n = int(.5 * SR); t = ar(n)
    x = sweep(160, 50, .03, n) * np.exp(-t / .28)
    x[:int(.004 * SR)] += rng.standard_normal(int(.004 * SR)) * .4
    return x


def snare():
    n = int(.5 * SR); t = ar(n)
    nz = fftfilt(rng.standard_normal(n), hp(1400)) * np.exp(-t / .17)
    body = (np.sin(2 * np.pi * 185 * t) + .5 * np.sin(2 * np.pi * 330 * t)) * np.exp(-t / .07)
    x = .9 * nz / np.max(np.abs(nz)) + .8 * body
    return x / np.max(np.abs(x))


def tom(f):
    n = int(.6 * SR); t = ar(n)
    return sweep(f * 1.6, f, .05, n) * np.exp(-t / .33)


def crash(dur=2.2):
    n = int(dur * SR); t = ar(n)
    x = fftfilt(rng.standard_normal(n), hp(3800)) * np.exp(-t / (dur / 3.2)) * np.minimum(1, t / .002)
    return x / np.max(np.abs(x))


def boom():
    n = int(2.2 * SR); t = ar(n)
    return sweep(70, 27, .5, n) * np.exp(-t / .9) * np.minimum(1, t / .003)


def riser(dur):
    """Ruído com filtro subindo (300 → 9000 Hz), em janelas sobrepostas."""
    n = int(dur * SR); out = np.zeros(n); w = int(.06 * SR); hop = w // 2
    win = np.hanning(w); src = rng.standard_normal(n + w)
    for i in range(0, n, hop):
        p = i / n; fc = 300 * (30 ** p)
        seg = fftfilt(src[i:i + w], band(fc * .5, fc)) * win
        j = min(n, i + w); out[i:j] += seg[:j - i]
    t = ar(n)
    return out / (np.max(np.abs(out)) + 1e-9) * (t / dur) ** 2


# ───────── harmonia ─────────
ROOT = [38, 34, 41, 36]                                  # D2 · B♭1 · F2 · C2
TRIADE = [(62, 65, 69), (62, 65, 70), (60, 65, 69), (60, 64, 67)]  # Dm · B♭ · F · C (vozes próximas)
CORO = [(50, 57, 62, 65), (50, 58, 62, 65), (48, 57, 60, 65), (48, 55, 60, 64)]


def chord_at(t):
    return int(t // 2.0) % 4


def power(r, dur, mute, seed):
    rr = np.random.default_rng(seed); n = int(dur * SR); t = ar(n)
    x = sum(saw(hz(m) * 2 ** (rr.uniform(-7, 7) / 1200), n, rr.random()) for m in (r, r + 7, r + 12) for _ in range(2)) / 6
    if mute:
        e = np.exp(-t / .06)
        return np.tanh(5 * x) * e
    e = np.minimum(1, t / .004) * (.65 + .35 * np.exp(-t / .5)) * np.minimum(1, (dur - t) / .04)
    return np.tanh(5 * x) * e


def corda(m, dur):
    n = int(dur * SR); t = ar(n)
    x = sum(saw(hz(m) * 2 ** (d / 1200), n, rng.random()) for d in (-8, 0, 8)) / 3
    return x * np.minimum(1, t / .006) * np.exp(-t / .13)


def coro(ms, dur):
    n = int(dur * SR); t = ar(n)
    vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t)
    x = np.zeros(n)
    for m in ms:
        for d in (-10, 0, 10):
            ph = 2 * np.pi * np.cumsum(hz(m) * 2 ** (d / 1200) * vib) / SR
            x += 2 * ((ph / (2 * np.pi) + rng.random()) % 1) - 1
    return x / (3 * len(ms)) * np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .4)


def formante(f):  # vogal "ah" (coral)
    g = lambda c, w, a: a * np.exp(-((f - c) / w) ** 2)
    return (g(700, 160, 1) + g(1150, 200, .7) + g(2700, 300, .3)) * hp(180)(f)


# ───────── montagem ─────────
def build(N, sec):
    """sec: tempos de saída das seções. Retorna (L, R)."""
    I, V, B, R0, C, E, END = sec['intro'], sec['verso'], sec['build'], sec['respiro'], sec['refrao'], sec['saida'], sec['fim']
    tr = {k: np.zeros((N, 2)) for k in ('perc', 'drum', 'gtr', 'mute', 'bass', 'str', 'choir', 'fx', 'send')}

    def put(name, sig, t0, g=1.0, pan=0.0, send=0.0):
        i = int(round(t0 * SR))
        if i >= N: return
        if i < 0: sig, i = sig[-i:], 0
        j = min(N, i + len(sig)); s = sig[:j - i] * g
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        tr[name][i:j, 0] += s * l * .707; tr[name][i:j, 1] += s * r * .707
        if send: tr['send'][i:j, 0] += s * send * l * .707; tr['send'][i:j, 1] += s * send * r * .707

    ST, CL, KI, SN, CR = stomp(), clap(), kick(), snare(), crash()
    beats = np.arange(0, END, BEAT)
    for tb in beats:
        k = int(round(tb / BEAT)) % 2  # 0 = tempo forte, 1 = contratempo
        # pisada-pisada-palma (intro, verso e saída), com variação de altura por compasso
        if tb < B or E <= tb < END - 1.0:
            if k == 0:
                put('perc', ST, tb, .9, -.15, .25); put('perc', ST, tb + .25, .75, .15, .25)
            else:
                put('perc', CL, tb, .55, rng.uniform(-.3, .3), .5)
        # bateria cheia no refrão
        if C <= tb < E:
            pos = int(round((tb - C) / BEAT)) % 4
            if pos in (0, 2): put('drum', KI, tb, 1.0)
            if pos == 2: put('drum', KI, tb + .25, .7)
            if pos in (1, 3): put('drum', SN, tb, .85, 0, .55); put('perc', CL, tb, .4, 0, .4)
        # bumbo no verso
        if V <= tb < B and k == 0:
            put('drum', KI, tb, .75)

    # caixa acelerando na subida (B → R0)
    t = B
    while t < R0 - 1e-6:
        p = (t - B) / (R0 - B); step = .5 if p < .34 else .25 if p < .67 else .125
        put('drum', SN, t, .35 + .5 * p, 0, .45); t += step
    for i, f in enumerate([130, 110, 92, 78]):
        put('drum', tom(f), R0 - .5 + i * .125, .8, -.5 + i * .33, .3)
    # viradas de tom na saída e batida final seca
    for i in range(8):
        put('drum', tom([130, 120, 110, 98, 92, 82, 78, 65][i]), END - 1.0 + i * .0625, .75, -.6 + i * .17, .3)
    put('drum', KI, END - .5, 1.1); put('drum', SN, END - .5, .9, 0, .3)

    # impactos e pratos
    for ti in (V, C):
        put('fx', boom(), ti, 1.0); put('drum', CR, ti, .5, .2, .4)
    for ti in np.arange(C + 4.0, E, 4.0):
        put('drum', CR, ti, .32, -.2, .3)
    put('fx', riser(V - I - .2), I + .2, .5, 0, .3)
    put('fx', riser(R0 - B), B, .65, 0, .3)
    put('fx', CR[::-1][-int(.9 * SR):], R0 - .9 + .5, .35, 0, .2)  # prato reverso para o refrão

    # guitarras: abafadas em colcheias no verso e na subida, abertas no refrão e na saída
    for tb in np.arange(V, R0, .25):
        r = ROOT[chord_at(tb)]
        for side, pan in ((0, -.75), (1, .75)):
            put('mute', power(r, .24, True, int(tb * 1000) * 2 + side), tb + side * .006, .55 + .3 * (tb >= B), pan)
    for tb in np.arange(C, E, 1.0):
        r = ROOT[chord_at(tb)]
        for side, pan in ((0, -.8), (1, .8)):
            put('gtr', power(r, 1.0, False, int(tb * 1000) * 2 + side), tb + side * .007, .6, pan)
    for tb in np.arange(E, END - 1.0, 2.0):
        r = ROOT[chord_at(tb)]
        for side, pan in ((0, -.8), (1, .8)):
            put('gtr', power(r, 2.0, False, int(tb * 1000) * 3 + side), tb + side * .007, .5, pan)

    # baixo
    for tb in np.arange(V, END - .5, .5):
        if R0 <= tb < C: continue
        r = ROOT[chord_at(tb)] - 12; n = int(.48 * SR); tt = ar(n)
        b = (np.sin(2 * np.pi * hz(r) * tt) + .45 * np.tanh(2 * saw(hz(r), n))) * np.minimum(1, tt / .004) * np.exp(-tt / .35)
        put('bass', b, tb, .8)

    # cordas em ostinato (colcheias) no verso tardio e no refrão
    pat = [0, 2, 1, 2, 0, 2, 1, 2]
    for i, tb in enumerate(np.arange(V + 2.0, E, .25)):
        if R0 <= tb < C: continue
        m = TRIADE[chord_at(tb)][pat[i % 8]] + (12 if tb >= C else 0)
        put('str', corda(m, .2), tb, .32 if tb >= C else .22, .35 * (1 if i % 2 else -1), .35)

    # coral: drone na intro, subindo na subida, pleno no refrão e na saída
    for tb in np.arange(0, END - .5, 2.0):
        g = .35 if tb < V else .2 if tb < B else .4 if tb < C else .6 if tb < E else .5
        if R0 - 2 < tb < C: g = .5
        put('choir', coro(CORO[chord_at(tb)], 2.3), tb, g, 0, .6)
    tr['choir'] = np.stack([fftfilt(tr['choir'][:, c], formante) for c in (0, 1)], 1)

    # filtros de canal
    for c in (0, 1):
        tr['gtr'][:, c] = fftfilt(tr['gtr'][:, c], band(90, 3400))
        tr['mute'][:, c] = fftfilt(tr['mute'][:, c], band(80, 1500))
        tr['str'][:, c] = fftfilt(tr['str'][:, c], band(200, 5000))
        tr['bass'][:, c] = fftfilt(tr['bass'][:, c], lp(900))

    # reverb de sala grande (IRs descorrelacionados L/R)
    rev = np.stack([conv(tr['send'][:, c], make_ir(2.4, 100 + c)) for c in (0, 1)], 1)
    mix = (1.0 * tr['perc'] + 1.0 * tr['drum'] + .55 * tr['gtr'] + .6 * tr['mute'] + .9 * tr['bass']
           + .9 * tr['str'] + .35 * tr['choir'] + .8 * tr['fx'] + .55 * rev)
    # silêncio dramático no respiro antes do refrão (só o prato reverso e a reverberação)
    t = ar(N)
    resp = np.where((t >= R0) & (t < C), 0.0, 1.0)
    keep = tr['fx'] * .8 + rev * .55
    mix = mix * resp[:, None] + keep * (1 - resp[:, None])
    # dinâmica por seção: verso contido, subida crescendo, refrão pleno
    g = np.interp(t, [0, V - .01, V, B, R0, C, E - .01, E, END], [.7, .7, .62, .62, .95, 1.0, 1.0, .85, .85])
    mix *= g[:, None]
    # cola de master
    mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.6) / np.tanh(1.6)
    return mix
