"""Trilha ORIGINAL + efeitos (numpy, sem amostras de terceiros) — "Suas férias não precisam virar escritório".
Evolução: ambiência tranquila → notificações, vibração e uma ligação breve (pulso grave crescente) → pausa depois de
"o trabalho também viaja" → organização (pulsação estável; efeitos nas conexões, encaminhamentos e conclusões) →
descanso (ambiência e piano) → assinatura de 3 notas. Música ~13 dB abaixo da voz, com ducking de 7 dB sob a fala.
Saída: public/assets/audio/trilha.wav (o Remotion mistura com as falas) e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
def lp_sig(x): return x
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

tN0 = wt('ferias', 'chamando.') - .05
tN = [wt('areas', 'financeiro'), wt('areas', 'comercial'), wt('areas', 'operação')]
tCall = wt('areas', 'próximo') + .2; tH = S['viaja']['t0']; tTrab = wt('viaja', 'trabalho')
mF, mC, mO = wt('estrutura', 'organiza') - .1, wt('estrutura', 'conecta') - .15, wt('estrutura', 'automatiza') - .15
tE, tI, tRp = wt('beneficios', 'encaminhadas.'), wt('beneficios', 'informações'), wt('beneficios', 'responsáveis')
tCalm = S['tranquilidade']['t0']; tFocus = wt('tranquilidade', 'mais') - .1; tEnd = S['assinatura']['t0']
T_PAUSE0, T_PAUSE1 = S['viaja']['v1'] + .05, S['estrutura']['v0'] - .02

# ── ambiência tranquila (água/vento suave): abre o filme e volta no descanso
def ambience(dur):
    m = int(dur * SR); x = fftfilt(rng.standard_normal(m), band(120, 1400)); t = ar(m)
    return x / np.max(np.abs(x)) * (.55 + .45 * np.sin(2 * np.pi * t / 4.3) ** 2)
amb = np.zeros(N)
a1 = ambience(S['areas']['t0'] + 1.5); amb[:len(a1)] += a1 * np.clip((S['areas']['t0'] + 1.5 - ar(len(a1))) / 1.5, 0, 1) * np.clip(ar(len(a1)) / .4, 0, 1)
a2 = ambience(DUR - tCalm); i0 = int(tCalm * SR); amb[i0:i0 + len(a2)] += a2 * np.clip(ar(len(a2)) / 2.0, 0, 1) * 1.3
L += (amb * .07)[:, None]
put(L, pad((53, 60, 65, 69), tN0 + .8, bright=.3), 0, .26, 0, .5)

# ── interrupções: notificações curtas + vibração discreta, ligação breve (toque baixo, cortado pela transição)
def buzz(d=.28):
    m = int(d * SR); t = ar(m); return np.sign(np.sin(2 * np.pi * 150 * t)) * np.sin(np.pi * t / d) ** 2 * .5
ev('notificação (equipe)', tN0, lambda t0: (put(fx, blip(88), t0, .2, .1, .3), put(fx, blip(95), t0 + .09, .11, .1, .3), put(fx, lp_sig(buzz()), t0, .25)))
for i, (t0, nm) in enumerate(zip(tN, ('Mariana · Financeiro', 'Rafael · Comercial', 'Camila · Operação'))):
    ev(f'notificação {nm}', t0, lambda t0, i=i: (put(fx, blip(86 + 2 * i), t0, .17, (-.3, .3, -.1)[i], .3), put(fx, blip(93 + 2 * i), t0 + .09, .09, 0, .3), put(fx, lp_sig(buzz()), t0, .25)))
def ring(dur):
    m = int(dur * SR); t = ar(m); on = (np.floor(t / .5) % 2 == 0) * 1.0
    return (np.sin(2 * np.pi * 659 * t) + .7 * np.sin(2 * np.pi * 784 * t)) * on * .25 * np.exp(-((t % .5) / .35))
ev('ligação "Empresa" (toque baixo)', tCall, lambda t0: put(fx, ring(tH - t0) * np.clip((tH - t0 - ar(int((tH - t0) * SR))) / .08, 0, 1), t0, .22, .2, .2))
# tensão: pulso grave discreto que cresce com as solicitações
put(L, pad((38, 45, 50, 53), T_PAUSE0 - tN0 + .3, bright=.15), tN0, .3, 0, .3)
for tb in np.arange(tN[0], T_PAUSE0, BEAT):
    k = int(round((tb - tN[0]) / BEAT)) % 4
    if k in (0, 2): put(L, sub_pulse(26, .8), tb, .8 + .3 * (tb - tN[0]) / (T_PAUSE0 - tN[0]))
    put(L, click(), tb + BEAT / 2, .04 + .05 * (tb - tN[0]) / (T_PAUSE0 - tN[0]), .3)
ev('as mensagens se desprendem (câmera recua)', tH - .05, lambda t0: put(fx, whoosh(1.1), t0, .24, 0, .3))
ev('conexões convergem para "você"', tH + .9, lambda t0: [put(fx, click(), t0 + j * .08, .1, (-.3, .3, 0)[j]) for j in range(3)])
mask = np.ones(N); mask[int(T_PAUSE0 * SR):int(T_PAUSE1 * SR)] = .12  # pausa depois de "o trabalho também viaja"

# ── organização: pulsação estável, progressão F · C · Dm · B♭
PROG = [(53, 57, 60, 65), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]; ROOTS = [41, 36, 38, 34]
t, bar = T_PAUSE1, 0
while t < tEnd - 1e-6:
    ch = PROG[bar % 4]; dur = min(BAR, tEnd - t); relief = t >= tCalm - .3
    put(L, pad(ch, dur + .5, bright=.35), t, .22 if relief else .3, 0, .4)
    for b in range(4):
        tb = t + b * BEAT
        if tb >= tEnd: break
        if not relief:
            if b in (0, 2): put(L, kick(), tb, .38)
            put(L, shaker(), tb + BEAT / 2, .06, .25)
            put(L, bass(ROOTS[bar % 4], BEAT * .9), tb, .3)
    if relief:
        for bb, m in [(0, ch[2] + 12), (2, ch[1] + 24)]: put(L, piano(m), t + bb * BEAT, .16, .2 * (1 if m % 2 else -1), .55)
    else:
        for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 2)): put(L, pluck([ch[1], ch[2], ch[3], ch[2]][i % 4] + 12, .35), ta, .08, .35 * (1 if i % 2 else -1), .4)
    t += BAR; bar += 1
ev('fluxo: espinha se desenha', S['estrutura']['t0'] + .4, lambda t0: put(fx, whoosh(.8), t0, .14, 0, .3))
for nm, t0 in (('Financeiro vira atividade', mF), ('Comercial vira atividade', mC), ('Operação vira atividade', mO)):
    ev(nm, t0, lambda t0: (put(fx, whoosh(.4), t0, .1, 0, .2), put(fx, click(), t0 + .45, .16, .2)))
ev('status automático', mO + .85, lambda t0: put(fx, bell(84, 1.0), t0, .06, .2, .5))
ev('encaminhada (Mariana → gestor)', tE - .1, lambda t0: [put(fx, blip(79 + 3 * j), t0 + j * .12, .07, 0, .3) for j in range(3)])
ev('arquivo vinculado', tI, lambda t0: (put(fx, whoosh(.3), t0 - .2, .08, .3, .2), put(fx, click(), t0 + .1, .2, .3)))
ev('responsável definido', tRp, lambda t0: put(fx, click(), t0, .18, -.2))
ev('tarefa automática concluída', tRp + 1.2, lambda t0: put(fx, bell(88, 1.0), t0, .07, 0, .5))
ev('descanso: a praia se revela (ondas)', tCalm + .6, lambda t0: put(fx, whoosh(2.4, up=False), t0, .06, 0, .4))
# ── assinatura (Fá · Lá · Dó) e CTA
for i, m in enumerate((77, 81, 84)): ev(f'assinatura {i + 1}', tEnd + i * .12, lambda t0, m=m, i=i: put(fx, bell(m, 2.6), t0, .15, (-.3, 0, .3)[i], .6))
put(L, pad((41, 53, 57, 60, 65), DUR - tEnd + .3, bright=.55), tEnd - .2, .34, 0, .5); put(L, bass(29, 3.0), tEnd, .3)
ev('logo', tEnd - .1, lambda t0: put(fx, boom(1.4), t0, .16, 0, .3))
ev('CTA "Comente COMERCIAL e receba um diagnóstico"', wt('assinatura', 'descansar') - .1, lambda t0: put(fx, blip(91), t0, .07, 0, .5))

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
    f.write(f'MARCAS · DME "Suas férias não precisam virar escritório" · {DUR:.2f} s · 30 fps · trilha original 96 BPM\n\nFALAS (Lendário, ElevenLabs, velocidade natural, sem compressão)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write(f"\nTRILHA: ambiência tranquila 0–{tN0:.2f} · interrupções {tN0:.2f}–{tH:.2f} (notificações, vibração, ligação breve; pulso grave crescente) · "
            f"pausa {T_PAUSE0:.2f}–{T_PAUSE1:.2f} · organização {T_PAUSE1:.2f}–{tCalm:.2f} (pulsação estável, F–C–Dm–B♭) · descanso {tCalm:.2f}–{tEnd:.2f} (ambiência + piano) · assinatura {tEnd:.2f}\n\nEFEITOS\n")
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', DUR)
