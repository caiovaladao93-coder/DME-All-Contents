"""Timbres e utilidades de síntese (copiados da trilha do SGC; sem amostras de terceiros)."""

import json, subprocess
import numpy as np

SR = 48000
ROOT = __file__.rsplit('/scripts/', 1)[0]
BEAT = 60 / 104  # mesma batida do roteiro v2 (0,577 s)
BAR = 4 * BEAT
rng = np.random.default_rng(23)


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


def piano(m, dur=2.4):
    """Piano sintetizado: parciais levemente inarmônicas, ataque de martelo e decaimento duplo."""
    n = int(dur * SR); t = ar(n); f0 = hz(m); x = np.zeros(n)
    for k in range(1, 7):
        fk = f0 * k * np.sqrt(1 + .0004 * k * k)
        x += (1 / k ** 1.3) * np.sin(2 * np.pi * fk * t) * (.65 * np.exp(-t * (1.2 + .9 * k)) + .35 * np.exp(-t * (.35 + .2 * k)))
    ham = fftfilt(rng.standard_normal(int(.012 * SR)), band(1500, 6000)) * np.exp(-ar(int(.012 * SR)) / .003) * .15
    x[:len(ham)] += ham
    return x * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .05)


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


