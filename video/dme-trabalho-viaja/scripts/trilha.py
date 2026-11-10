"""Trilha ORIGINAL + efeitos (numpy, sem amostras de terceiros) — "O trabalho também viaja".
Evolução: tranquilidade (ambiência de água, pad suave) → interrupção (uma notificação) → tensão leve (pulso, 3 eventos)
→ pausa depois de "o trabalho também viaja" → organização (pulsação estável, cliques nas conexões) → alívio (piano, ambiência
volta) → assinatura de 3 notas antecipada na cena 6. A música fica ~13 dB abaixo da voz e abaixa 7 dB sob a fala.
Saída: public/assets/audio/trilha.wav (o Remotion mistura com as falas) e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, bass, bell, blip, boom, click, conv, fftfilt, kick, lp, band, make_ir, pad, piano, pluck, shaker, sub_pulse, whoosh, rng

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = 60 / 96; BAR = 4 * BEAT
n = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
def wt(k, w, nth=0):
    h = [x[1] for x in TL['words'][k] if n(x[0]) == n(w)]; return h[nth] if nth < len(h) else h[0]

L = np.zeros((N, 2)); send = np.zeros((N, 2)); fx = np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707
def ev(name, t0, fn): EV.append((round(t0, 2), name)); fn(t0)

tLit = wt('interrupcao', 'empresa') - .15
tR = [wt('dependencias', 'aprovação.'), wt('dependencias', 'arquivo.'), wt('dependencias', 'decisão')]
tPull = S['viaja']['t0'] + .15; tTrab = wt('viaja', 'trabalho'); tReorg = S['estrutura']['t0'] + .2
tTok = [wt('estrutura', 'sistemas,') + .1, wt('estrutura', 'automações') + .1, wt('estrutura', 'integrações') + .15]
tHuman = S['clareza']['v1'] - .9; tDone = S['clareza']['v1'] - .3; tCalm = S['presente']['t0']; tEnd = S['assinatura']['t0']
T_PAUSE0, T_PAUSE1 = S['viaja']['v1'] + .05, S['estrutura']['v0'] - .05

# ── ambiência de descanso (água/vento suave): ruído filtrado com ondulação lenta
def ambience(dur):
    m = int(dur * SR); x = fftfilt(rng.standard_normal(m), band(120, 1400)); t = ar(m)
    return x / np.max(np.abs(x)) * (.55 + .45 * np.sin(2 * np.pi * t / 4.3) ** 2)
amb = np.zeros(N)
a1 = ambience(tPull + 1.0); amb[:len(a1)] += a1 * np.clip((tPull + 1 - ar(len(a1))) / 1.2, 0, 1)
a2 = ambience(DUR - tCalm); i0 = int(tCalm * SR); amb[i0:i0 + len(a2)] += a2 * np.clip(ar(len(a2)) / 1.5, 0, 1)
L += (amb * .06)[:, None]

# ── 1 tranquilidade: pad em Fá maior, aberto
put(L, pad((53, 60, 65, 69), tLit + .6, bright=.3), 0, .28, 0, .5)
# ── interrupção: UMA notificação corta o silêncio
ev('notificação (tela acende)', tLit + .12, lambda t0: (put(fx, blip(88), t0, .22, .1, .3), put(fx, blip(95), t0 + .09, .12, .1, .3)))
# ── tensão leve: pulso grave e pad escuro (Ré menor) até a pausa
put(L, pad((38, 45, 50, 53), T_PAUSE0 - tLit + .3, bright=.15), tLit, .32, 0, .3)
for tb in np.arange(tLit + .3, T_PAUSE0, BEAT):
    k = int(round((tb - tLit) / BEAT)) % 4
    if k in (0, 2): put(L, sub_pulse(26, .8), tb)
    put(L, click(), tb + BEAT / 2, .04 + .04 * (tb - tLit) / (T_PAUSE0 - tLit), .3)
for i, t0 in enumerate(tR): ev(f'solicitação {i + 1}', t0, lambda t0, i=i: put(fx, blip(84 + i), t0, .14, (-.3, .3, -.2)[i], .3))
ev('câmera recua (revelação)', tPull - .1, lambda t0: put(fx, whoosh(1.2), t0, .25, 0, .3))
ev('sinal percorre até "Aprovação"', tTrab, lambda t0: [put(fx, blip(76 + 2 * j), t0 + j * .2, .06, 0, .4) for j in range(4)])
ev('sinal espera em "Aprovação"', tTrab + .85, lambda t0: put(fx, bell(81, 1.2), t0, .07, 0, .5))
mask = np.ones(N); mask[int(T_PAUSE0 * SR):int(T_PAUSE1 * SR)] = .15  # pausa breve: a frase ganha significado

# ── organização: pulsação estável, progressão F · C · Dm · B♭
PROG = [(53, 57, 60, 65), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]; ROOTS = [41, 36, 38, 34]
t, bar = T_PAUSE1, 0
while t < tEnd - 1e-6:
    ch = PROG[bar % 4]; dur = min(BAR, tEnd - t); relief = t >= tCalm - .2
    put(L, pad(ch, dur + .5, bright=.35), t, .26 if relief else .3, 0, .4)
    for b in range(4):
        tb = t + b * BEAT
        if tb >= tEnd: break
        if not relief:
            if b in (0, 2): put(L, kick(), tb, .38)
            put(L, shaker(), tb + BEAT / 2, .06, .25)
            put(L, bass(ROOTS[bar % 4], BEAT * .9), tb, .3)
    if relief:
        for bb, m in [(0, ch[2] + 12), (1.5, ch[3] + 12), (2.5, ch[1] + 24)]: put(L, piano(m), t + bb * BEAT, .2, .2 * (1 if m % 2 else -1), .5)
    else:
        for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 2)): put(L, pluck([ch[1], ch[2], ch[3], ch[2]][i % 4] + 12, .35), ta, .08, .35 * (1 if i % 2 else -1), .4)
    t += BAR; bar += 1
for j in range(5): ev(f'conexão estabelecida {j + 1}', tReorg + 1.0 + j * .3, lambda t0: put(fx, click(), t0, .16, .2))
for j, t0 in enumerate(tTok): ev(f'atividade avança {j + 1}', t0, lambda t0: put(fx, blip(79 + 3 * j), t0, .08, 0, .3))
ev('automação (engrenagem)', tTok[1] + .35, lambda t0: [put(fx, click(), t0 + k * .12, .07, .3) for k in range(4)])
ev('decisão humana (revisão)', tHuman, lambda t0: put(fx, blip(84), t0, .1, -.2, .4))
ev('concluído', tDone + .5, lambda t0: put(fx, bell(84, 1.4), t0, .09, 0, .5))
# ── alívio e assinatura sonora antecipada (Fá · Lá · Dó)
for i, m in enumerate((77, 81, 84)): ev(f'assinatura {i + 1}', tEnd - .35 + i * .12, lambda t0, m=m, i=i: put(fx, bell(m, 2.6), t0, .16, (-.3, 0, .3)[i], .6))
put(L, pad((41, 53, 57, 60, 65), DUR - tEnd + .3, bright=.55), tEnd - .2, .36, 0, .5); put(L, bass(29, 3.0), tEnd, .3)
ev('logo', tEnd + .15, lambda t0: put(fx, boom(1.4), t0, .18, 0, .3))
ev('CTA "Fale com a DME"', wt('assinatura', 'fale') - .15, lambda t0: put(fx, blip(91), t0, .07, 0, .5))

ir = [make_ir(2.2, 61 + c) for c in (0, 1)]
rev = np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music = (L + .5 * rev + fx) * mask[:, None]
tt = ar(N); music *= np.clip(tt / .05, 0, 1)[:, None] * np.clip((DUR - tt) / .8, 0, 1)[:, None]

# ── nível relativo à voz e ducking (a voz entra no Remotion)
fala = np.zeros(N); vr = []
for s in TL['scenes']:
    fala[int(s['v0'] * SR):int(s['v1'] * SR)] = 1
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32); v = v[np.abs(v) > 1e-3]; vr.append(np.sqrt(np.mean(v ** 2)))
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.12 * SR)), np.exp(-1 / (.45 * SR))
for k in range(N):
    c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
mr = np.sqrt(np.mean(music[fala == 0] ** 2))
music *= np.mean(vr) * 10 ** (-13 / 20) / mr; music *= (10 ** (-7 * env / 20))[:, None]
pk = np.max(np.abs(music));
if pk > .7: music *= .7 / pk
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=music.astype(np.float32).tobytes(), check=True)

LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME "O trabalho também viaja" · {DUR:.2f} s · 30 fps · trilha original 96 BPM\n\nFALAS (Guilherme, ElevenLabs, velocidade natural, sem compressão)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write(f"\nTRILHA: tranquilidade 0–{tLit:.2f} (ambiência + pad Fá maior) · interrupção {tLit + .12:.2f} · tensão leve {tLit:.2f}–{T_PAUSE0:.2f} (pulso, Ré menor) · "
            f"pausa {T_PAUSE0:.2f}–{T_PAUSE1:.2f} · organização {T_PAUSE1:.2f}–{tCalm:.2f} (pulsação estável, F–C–Dm–B♭) · alívio {tCalm:.2f}–{tEnd:.2f} (piano + ambiência) · assinatura {tEnd - .35:.2f}\n\nEFEITOS\n")
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', DUR)
