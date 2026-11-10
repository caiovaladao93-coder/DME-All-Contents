"""Trilha ORIGINAL + efeitos + voz do Reels "Férias" v4 (3D). Tempos vêm de src/timeline.json (falas reais).
Linguagem DME: escura, aço, cinematográfica. 104 BPM. Tensão em Ré menor → silêncio antes do "Agora" → Fá maior;
bateria leve no fluxo e no método; fecho com piano; subida no loop; assinatura de 3 notas no logo.
Saídas: out/mix.wav (voz + trilha com ducking), out/trilha-sem-voz.wav e out/marcas-som.txt."""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, BEAT, ar, bass, bell, blip, boom, click, conv, kick, make_ir, pad, piano, pluck, shaker, sub_pulse, whoosh, rng

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['dur']; N = int(DUR * SR)
norm = lambda x: ''.join(ch for ch in x.lower() if ch.isalnum())
def wt(k, w, nth=0):
    import unicodedata
    n = lambda x: norm(unicodedata.normalize('NFD', x).encode('ascii', 'ignore').decode())
    hits = [t for x, t in TL['words'][k] if n(x) == n(w)]; return hits[nth] if nth < len(hits) else hits[0]

L = np.zeros((N, 2)); send = np.zeros((N, 2)); fx = np.zeros((N, 2))
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707

BAR = 4 * BEAT
T_SIL0, T_AGORA = S['gargalo']['v1'] + .05, S['agora']['v0'] - .02
T_FLOW, T_J, T_K, T_L = S['fluxo']['t0'], S['fecho']['t0'], S['loop']['t0'], S['logo']['t0']

# 1 · tensão: batimento grave, pad escuro, tique de relógio
put(L, pad((38, 45, 50, 53), T_SIL0 + .3), 0, .4, 0, .3)
for tb in np.arange(0, T_SIL0, BEAT):
    k = int(round(tb / BEAT)) % 4
    if k in (0, 2): put(L, sub_pulse(26, .9), tb); put(L, sub_pulse(26, .4), tb + .17)
    for e in (0, .5): put(L, click(), tb + e * BEAT, .05 + .05 * tb / T_SIL0, .3 if e else -.3)
put(fx, whoosh(.9), T_SIL0 - .9, .35, 0, .3)  # câmera mergulha no funil
mask = np.ones(N); mask[int(T_SIL0 * SR):int(T_AGORA * SR)] = 0  # silêncio total antes da virada
put(fx, boom(1.8), T_AGORA, .45, 0, .25); put(fx, bell(77, 2.4), T_AGORA, .12, 0, .6)

# 2 · progressão F · C · Dm · B♭ a partir do "Agora"
PROG = [(53, 57, 60, 65), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]; ROOTS = [41, 36, 38, 34]
t, bar = T_AGORA, 0
while t < T_L - 1e-6:
    ch = PROG[bar % 4]; dur = min(BAR, T_L - t); soft = T_J <= t < T_K
    grow = np.clip((t - T_AGORA) / (T_J - T_AGORA), 0, 1)
    put(L, pad(ch, dur + .5, bright=.35 + .4 * grow), t, .3 + .08 * grow, 0, .35)
    for b in range(4):
        tb = t + b * BEAT
        if tb >= T_L: break
        if t >= T_FLOW - .01 and not soft:
            if b in (0, 2): put(L, kick(), tb, .5 + .2 * grow)
            for e in range(2): put(L, shaker(), tb + e * BEAT / 2, .08 + .06 * grow, .3 if e else -.3)
        put(L, bass(ROOTS[bar % 4], BEAT * .95), tb, (.3 if soft else .42) + .12 * grow)
    if soft:
        for b, m in [(0, ch[2] + 12), (1.5, ch[3] + 12), (2.5, ch[1] + 24)]: put(L, piano(m), t + b * BEAT, .22, .2 * (1 if m % 2 else -1), .5)
    else:
        notes = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
        for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 2)): put(L, pluck(notes[i % 4], .4), ta, .12 + .07 * grow, .4 * (1 if i % 2 else -1), .4)
    t += BAR; bar += 1
put(fx, whoosh(1.0), T_K - .6, .3, 0, .3)

# 3 · assinatura: resolve em Fá, três notas com as peças do logo
put(L, pad((41, 53, 57, 60, 65), DUR - T_L + .2, bright=.6), T_L, .45, 0, .5); put(L, bass(29, 2.6), T_L, .45)
for i, m in enumerate((77, 81, 84)): put(fx, bell(m, 2.4), T_L + .15 + i * .1, .2, (-.3, 0, .3)[i], .6)

# 4 · efeitos ligados aos eventos 3D
EV = []
def ev(name, tt, f): EV.append((name, tt)); f(tt)
ev('alerta cai', wt('hook', 'sua') - .05, lambda tt: put(fx, boom(1.0), tt, .3, 0, .2))
for i in range(3): ev(f'notificação {i + 1}', wt('trinca', 'você', i), lambda tt: put(fx, blip(86), tt, .1, .3, .3))
ev('notificações transbordam', wt('trinca', 'você', 2) + .45, lambda tt: [put(fx, blip(84), tt + j * .25, .07, -.3, .3) for j in range(2)])
ev('blocos no funil', S['gargalo']['t0'] + .3, lambda tt: [put(fx, click(), tt + j * .1, .12, rng.uniform(-.4, .4)) for j in range(9)])
for i, w in enumerate(['entrada,', 'processo,', 'validação,', 'entrega.']): ev(f'esfera na plataforma {i + 1}', wt('fluxo', w), lambda tt, i=i: put(fx, blip(79 + 2 * i), tt, .1, 0, .4))
for w in ['mapeia,', 'padroniza', 'automatiza.']: ev(f'cartão gira ({w})', wt('metodo', w) - .38, lambda tt: put(fx, whoosh(.35), tt, .14, .2, .2))
ev('interruptor liga', wt('auto', 'automático.') - .05, lambda tt: (put(fx, click(), tt, .25), put(fx, click(), tt + .05, .15)))
for w in ['segunda.', 'quarta.', 'sexta.']: ev(f'celular ({w})', wt('dias', w), lambda tt: put(fx, blip(84), tt + .05, .09, -.2, .3))
for w in ['padronizando.', 'automatizando.', 'acompanhando.']: ev(f'cubo gira ({w})', wt('verbos', w) - .3, lambda tt: put(fx, whoosh(.3), tt, .12, .2, .2))
ev('chip Férias volta', wt('loop', 'férias?') - .1, lambda tt: put(fx, whoosh(.7), tt, .2, -.3, .3))
ev('Férias encaixa no calendário', wt('loop', 'agora') + .8, lambda tt: (put(fx, click(), tt, .2), put(fx, bell(84, 1.2), tt, .07, 0, .5)))
for i in range(4): ev(f'peça do logo {i + 1}', T_L + .1 + i * .1 + .25, lambda tt, i=i: put(fx, click(), tt, .14, (-.4, .4, -.2, .2)[i]))
ev('pulso COMERCIAL', wt('logo', 'comercial'), lambda tt: put(fx, blip(91), tt, .07, 0, .5))
for k in ['hook', 'trinca', 'agora', 'fluxo', 'metodo', 'auto', 'dias', 'verbos', 'fecho', 'loop']:  # viagem de câmera entre estações
    ev(f'câmera: {k} → próxima', S[k]['t1'] - .3, lambda tt: put(fx, whoosh(.55), tt, .1, 0, .2))

ir = [make_ir(2.0, 41 + c) for c in (0, 1)]
rev = np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music = (L + .5 * rev + fx) * mask[:, None]
tt = ar(N); music *= np.clip(tt / .03, 0, 1)[:, None] * np.clip((DUR - tt) / .8, 0, 1)[:, None]

# 5 · voz no início de cada cena (falas reais) + ducking −7 dB
voz = np.zeros(N); fala = np.zeros(N)
for s in TL['scenes']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/voz/final/{s['fala']}.wav", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, np.float32).astype(np.float64); i = int(s['v0'] * SR); j = min(N, i + len(y)); voz[i:j] += y[:j - i]
    fala[int(s['v0'] * SR):int(s['v1'] * SR)] = 1
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.12 * SR)), np.exp(-1 / (.4 * SR))
for k in range(N):
    c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
vr = np.sqrt(np.mean(voz[fala > 0] ** 2)); mr = np.sqrt(np.mean(music[fala == 0] ** 2))
music *= vr * 10 ** (-13 / 20) / mr; music *= (10 ** (-7 * env / 20))[:, None]
mix = music + voz[:, None]; pk = np.max(np.abs(mix)) * 1.1
for arr, name in ((mix, 'mix'), (music, 'trilha-sem-voz')):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{ROOT}/out/{name}.wav'], input=(arr / pk).astype(np.float32).tobytes(), check=True)

with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME Reels "Se você tirar férias" v4 (3D, narrado) · {DUR:.2f} s · 30 fps · trilha original 104 BPM\n\nFALAS (Guilherme, ElevenLabs, atempo 1,08)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {s['texto']}\n")
    f.write(f"\nTRILHA: tensão 0–{T_SIL0:.2f} · SILÊNCIO {T_SIL0:.2f}–{T_AGORA:.2f} · \"Agora\" {T_AGORA:.2f} (impacto + sino, Fá maior) · bateria leve e arpejo a partir de {T_FLOW:.2f} · "
            f"piano {T_J:.2f}–{T_K:.2f} · subida {T_K:.2f} · logo e assinatura Fá–Lá–Dó {T_L:.2f}\n\nEFEITOS\n")
    for n, t0 in sorted(EV, key=lambda x: x[1]): f.write(f"{t0:6.2f}  {n}\n")
print('mix ok', DUR)
