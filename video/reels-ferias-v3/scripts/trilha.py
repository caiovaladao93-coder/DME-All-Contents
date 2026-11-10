"""Trilha ORIGINAL + efeitos + mixagem final do Reels "Férias" v3 (narrado).

Linguagem DME: escura, aço, cinematográfica e contida. 104 BPM (a batida do roteiro v2).
  - Tensão (gancho → gargalo): pulso grave, pad escuro em Ré menor, tique de relógio.
  - Silêncio de ~0,45 s antes do "Agora" (estudo de referência: pausa antes da virada).
  - "Agora": acorde abre em Fá maior; fluxo e método com arpejo e bateria leve, crescendo.
  - Fecho ("Então, enquanto você…") mais leve, piano; "E as férias?" volta a subir; logo com assinatura de 3 notas.
Os efeitos seguem as marcas do roteiro v2, convertidas para o tempo de saída pelo warp.json.
Saída: out/mix.wav (voz + trilha, já com ducking) — normalizado depois em finalizar.sh.
"""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import (SR, BEAT, ar, bass, bell, blip, boom, click, conv, kick, make_ir, pad, piano, pluck, shaker, sub_pulse, whoosh, rng)

ROOT = __file__.rsplit('/scripts/', 1)[0]
W = json.load(open(f'{ROOT}/warp.json'))
K = W['knots']; DUR = W['dur']; N = int(DUR * SR)


def out(t):
    """tempo original da animação (v2) → tempo de saída."""
    for (a, x), (b, y) in zip(K, K[1:]):
        if y > x and t <= y: return a + (b - a) * (t - x) / (y - x)
    return DUR


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
T_SIL0, T_AGORA = out(7.95) - 0.45, out(8.15)
T_FLOW, T_J, T_K, T_L = out(9.8), out(25.4), out(29.4), out(31.3)

# ── 1. tensão: pulso grave (batimento), pad escuro, tique de relógio em colcheias
put(L, pad((38, 45, 50, 53), T_SIL0 + .3), 0, .4, 0, .3)
for tb in np.arange(0, T_SIL0, BEAT):
    k = int(round(tb / BEAT)) % 4
    if k in (0, 2): put(L, sub_pulse(26, .9), tb); put(L, sub_pulse(26, .4), tb + .17)
    for e in (0, .5): put(L, click(), tb + e * BEAT, .05 + .05 * tb / T_SIL0, .3 if e else -.3)
put(fx, whoosh(.9), T_SIL0 - .9, .35, 0, .3)  # mergulho no gargalo (termina quando o silêncio começa)

# ── 2. virada: silêncio de ~0,45 s e o "Agora" abre em Fá maior
music_mask = np.ones(N); i0, i1 = int(T_SIL0 * SR), int(T_AGORA * SR); music_mask[i0:i1] = 0
put(fx, boom(1.8), T_AGORA, .45, 0, .25); put(fx, bell(77, 2.4), T_AGORA, .12, 0, .6)

# ── 3. progressão F · C · Dm · B♭ a partir do "Agora", alinhada a ele
PROG = [(53, 57, 60, 65), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]; ROOTS = [41, 36, 38, 34]
t, bar = T_AGORA, 0
while t < T_L - 1e-6:
    ch = PROG[bar % 4]; dur = min(BAR, T_L - t)
    soft = T_J <= t < T_K  # fecho mais leve
    grow = np.clip((t - T_AGORA) / (T_J - T_AGORA), 0, 1)
    put(L, pad(ch, dur + .5, bright=.35 + .4 * grow), t, .3 + .08 * grow, 0, .35)
    for b in range(4):
        tb = t + b * BEAT
        if tb >= T_L: break
        if t >= T_FLOW and not soft:
            if b in (0, 2): put(L, kick(), tb, .5 + .2 * grow)
            for e in range(2): put(L, shaker(), tb + e * BEAT / 2, .08 + .06 * grow, .3 if e else -.3)
        put(L, bass(ROOTS[bar % 4], BEAT * .95), tb, (.3 if soft else .42) + .12 * grow)
    if soft:
        for b, m in [(0, ch[2] + 12), (1.5, ch[3] + 12), (2.5, ch[1] + 24)]:
            put(L, piano(m), t + b * BEAT, .22, .2 * (1 if m % 2 else -1), .5)
    else:
        notes = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
        for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 2)):
            put(L, pluck(notes[i % 4], .4), ta, .12 + .07 * grow, .4 * (1 if i % 2 else -1), .4)
    t += BAR; bar += 1
put(fx, whoosh(1.0), T_K - .6, .3, 0, .3)  # "E as férias?" volta a subir

# ── 4. assinatura: resolve em Fá, três notas (Fá · Lá · Dó) com as peças do logo
put(L, pad((41, 53, 57, 60, 65), DUR - T_L + .2, bright=.6), T_L, .45, 0, .5)
put(L, bass(29, 2.6), T_L, .45)
for i, m in enumerate((77, 81, 84)):
    put(fx, bell(m, 2.4), out(31.35) + i * .1 + .05, .2, (-.3, 0, .3)[i], .6)

# ── 5. efeitos discretos (marcas do roteiro v2)
put(fx, boom(1.0), out(1.80), .3, 0, .2)                                   # alerta cai
for tt in (3.2, 4.12, 5.02): put(fx, blip(86), out(tt), .1, .3, .3)        # notificações
for i in range(8): put(fx, click(), out(6.05 + i * .09), .12, rng.uniform(-.4, .4))  # blocos no funil
put(fx, whoosh(.6), out(9.45) - .1, .22, 0, .2)                           # cortina
for i, tt in enumerate((10.3, 10.95, 11.5, 12.05)): put(fx, blip(79 + 2 * i), out(tt), .09, 0, .4)  # token acende as caixas
for tt in (13.9, 15.05, 16.2): put(fx, whoosh(.35), out(tt) - .15, .14, .2, .2)  # cartão gira
put(fx, click(), out(16.55), .25); put(fx, click(), out(16.6), .15)        # interruptor
for tt in (19.65, 20.82, 21.99): put(fx, blip(84), out(tt) + .3, .09, -.2, .3)  # notificação concluída
for i in range(4): put(fx, click(), out(23.15 + i * BEAT), .1, .2)          # verbos
put(fx, click(), out(30.8), .2); put(fx, bell(84, 1.2), out(30.8), .07, 0, .5)  # Férias encaixa no calendário
for i in range(4): put(fx, click(), out(31.35 + i * .1), .14, (-.4, .4, -.2, .2)[i])  # peças do logo
put(fx, blip(91), out(32.75), .07, 0, .5)                                  # pulso COMERCIAL

ir = [make_ir(2.0, 31 + c) for c in (0, 1)]
rev = np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music = (L + .5 * rev + fx) * music_mask[:, None]  # silêncio total antes do "Agora"
tt = ar(N)
music *= np.clip(tt / .03, 0, 1)[:, None] * np.clip((DUR - tt) / .8, 0, 1)[:, None]

# ── 6. voz + ducking (−7 dB sob a fala) e nível da música ~13 dB abaixo da voz entre as falas
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/voz/narracao.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
voz = np.frombuffer(raw, np.float32).astype(np.float64)[:N]; voz = np.pad(voz, (0, N - len(voz)))
fala = np.zeros(N)
for s in W['segmentos']:
    fala[int(s['inicio'] * SR):int((s['inicio'] + s['fala']) * SR)] = 1
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.12 * SR)), np.exp(-1 / (.4 * SR))
for k in range(N):
    c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
vr = np.sqrt(np.mean(voz[fala > 0] ** 2)); mr = np.sqrt(np.mean(music[fala == 0] ** 2))
music *= vr * 10 ** (-13 / 20) / mr
music *= (10 ** (-7 * env / 20))[:, None]
mix = music + voz[:, None]
mix /= np.max(np.abs(mix)) * 1.1
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{ROOT}/out/mix.wav'], input=mix.astype(np.float32).tobytes(), check=True)
musica_so = music / (np.max(np.abs(mix)) * 1.1)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{ROOT}/out/trilha-sem-voz.wav'], input=musica_so.astype(np.float32).tobytes(), check=True)

with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME Reels "Se você tirar férias" v3 (narrado) · {DUR:.2f} s · 30 fps · trilha original 104 BPM\n\nFALAS (Guilherme, ElevenLabs; início de cada trecho)\n')
    for s in W['segmentos']: f.write(f"{s['inicio']:6.2f}–{s['inicio'] + s['fala']:6.2f}  {s['texto']}\n")
    f.write(f"\nTRILHA: tensão 0–{T_SIL0:.2f} (pulso grave, Ré menor, tique de relógio) · silêncio {T_SIL0:.2f}–{T_AGORA:.2f} · \"Agora\" em {T_AGORA:.2f} (impacto + sino, abre em Fá maior) · "
            f"bateria leve e arpejo a partir do fluxo {T_FLOW:.2f} · fecho com piano {T_J:.2f}–{T_K:.2f} · subida em {T_K:.2f} · logo e assinatura Fá–Lá–Dó em {T_L:.2f}\n")
    f.write("EFEITOS (tempo de saída): " + ' · '.join(f'{n} {out(t):.2f}' for n, t in [('alerta', 1.8), ('notificações', 3.2), ('blocos no funil', 6.05), ('cortina', 9.45),
            ('token', 10.3), ('cartão gira', 13.9), ('interruptor', 16.55), ('dias', 19.65), ('verbos', 23.15), ('Férias encaixa', 30.8), ('peças do logo', 31.35), ('pulso COMERCIAL', 32.75)]) + '\n')
print('mix ok', DUR)
