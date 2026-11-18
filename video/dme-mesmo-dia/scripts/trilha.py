"""Trilha ORIGINAL (numpy, sem amostras de terceiros) · DME "Mesmo dia" (9:16, 60 s).
O dia: pulso grave a 120 BPM, tique-taque de relógio e piano em Ré menor; o relógio rola (whoosh + sino) a cada horário.
Empresa A trava (baque abafado), empresa B resolve (sino claro); telefone às 19:07; 0,4 s de silêncio antes de "Mesmo esforço";
a harmonia abre para Fá maior em "A diferença é o processo"; três placas do método e acorde final na assinatura.
Música ~9 dB abaixo da voz, ducking de 6 dB sob a fala. Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, blip, boom, click, conv, fftfilt, hp, hz, kick, make_ir, pad, piano, pluck, shaker, sub_pulse, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = .5; BAR = 4 * BEAT
n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
def wt(k, w, nth=0):
    h = [x[1] for x in TL['words'][k] if n_(x[0]) == n_(w)]; return h[nth] if nth < len(h) else h[0]
MU, FX, SEND = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(nm, t0): EV.append((round(t0, 2), nm))
def aco(t0): return t0 - .02

t_sil0 = S['diferenca']['t0'] + .02; t_dif = S['diferenca']['v0']; t_met = S['metodo']['t0']; t_sig = S['assinatura']['t0']
DM = [(50, 57, 62, 65), (46, 53, 58, 62), (48, 55, 60, 64), (45, 52, 57, 61)]   # Rém – Si♭ – Dó – Lá (o dia)
FM = [(53, 60, 65, 69), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]   # Fá – Dó – Rém – Si♭ (a diferença)
t, k = 0.0, 0
while t < DUR - .5:
    if t_sil0 - BAR < t < t_dif: t += BAR; k += 1; continue
    prog = FM if t >= t_dif else DM; ch = prog[k % 4]; lvl = .6 if t < S['pedido']['t0'] else .85
    put(MU, pad(ch, BAR + .6, .2 if prog is FM else 0), t, .16 * lvl, 0, .4)
    put(MU, piano(ch[0] - 12, 2.4), t, .22 * lvl, -.1, .3)
    for j, m in enumerate((ch[1], ch[2], ch[3], ch[2])): put(MU, piano(m + 12, 1.2), t + j * BEAT, .07 * lvl, (-.3, .1, .3, -.1)[j], .5)
    t += BAR; k += 1
# relógio: tique-taque a cada meia batida durante o dia
t = 0.0
while t < t_sil0:
    put(MU, sub_pulse(38, 1.0), t, .3); put(MU, kick(), t, .16 if t > S['pedido']['t0'] else .0); put(FX, click(), t + BEAT / 2, .1, (.3 if int(t * 2) % 2 else -.3))
    t += BEAT
# horários: o relógio rola (whoosh curto) e marca a hora (sino grave)
for nm, k_, w in (('08:12', 'pedido', 'Oito'), ('10:30', 'proposta', 'Dez'), ('16:00', 'retorno', 'Quatro'), ('19:07', 'ligacao', 'Sete')):
    t0 = wt(k_, w); put(FX, whoosh(.8), t0 - .8, .14, 0, .2); put(FX, bell(69, 1.6), t0 + .1, .12, 0, .5); ev(f'relógio rola até {nm}', t0 - .8)
# desfechos: painel A trava (baque abafado), painel B resolve (sino claro)
for nm, tA in (('digitado em 2 sistemas', wt('pedido2', 'digitado')), ('depende de alguém lembrar', wt('retorno', 'depende')), ('caixa postal', wt('ligacao2', 'caixa'))):
    put(FX, boom(1.0), tA, .22); put(FX, blip(57), tA, .12, -.3); ev(f'empresa A: {nm} (pendência +1)', tA)
for nm, tB in (('sistemas integrados', wt('pedido2', 'integrados.')), ('CRM · retorno automático', wt('retorno', 'Cê-Erre-Eme')), ('agente de voz com IA', wt('ligacao2', 'agente'))):
    put(FX, bell(81, 1.6), tB, .12, .3, .5); put(FX, bell(88, 1.2), tB + .08, .05, .3, .5); ev(f'empresa B: {nm}', tB)
# telefone às 19:07: toque sintetizado (440+480 Hz) duas vezes
nr = int(.9 * SR); tt = ar(nr); ring = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * .5 * (np.sin(2 * np.pi * 20 * tt) > 0) * np.minimum(1, (tt / .02)) * np.minimum(1, (.9 - tt) / .05)
for i in range(2): put(FX, ring, wt('ligacao', 'liga.') - .2 + i * 1.3 if i == 0 else wt('ligacao2', 'De') + .05, .07, 0, .3)
ev('telefone tocando (19:07)', wt('ligacao', 'liga.') - .2)
for j, w in enumerate(['atende,', 'qualifica,', 'registra', 'passa']): put(FX, pluck(74 + (0, 2, 4, 7)[j], .4), wt('ligacao2', w) - .03, .1, (-.3, -.1, .1, .3)[j], .4)
ev('verbos do agente: atende, qualifica, registra, passa', wt('ligacao2', 'atende,'))
# carimbos de fim de dia e silêncio antes da diferença
put(FX, click(), S['diferenca']['t0'] - .2, .3); put(FX, boom(1.2), S['diferenca']['t0'] - .2, .2); ev('carimbos: "3 PENDÊNCIAS PARA AMANHÃ" × "DIA FECHADO"', S['diferenca']['t0'] - .2)
EV.append((round(t_sil0, 2), f'SILÊNCIO ({t_dif - t_sil0:.2f} s) antes de "Mesmo esforço"'))
put(MU, kick(), t_dif - .02, .45); put(FX, boom(1.4), t_dif - .02, .3); ev('a trilha volta em Fá maior: "A diferença é o processo"', t_dif)
for j, w in enumerate(['entende', 'planeja', 'desenvolve']):
    t0 = wt('metodo', w); put(FX, bell(74 + (0, 4, 7)[j], 1.6), t0 - .05, .12, (-.3, 0, .3)[j], .5); put(FX, click(), t0 - .05, .2); ev(f'placa {j + 1}: {w.upper()}', t0 - .05)
put(FX, whoosh(.6), S['pergunta']['t0'] - .3, .14, 0, .2); ev('pergunta: os painéis A e B voltam (loop)', S['pergunta']['t0'])
put(MU, kick(), t_sig, .5); put(FX, boom(1.8), t_sig, .35, 0, .3)
put(MU, pad((53, 57, 60, 65, 69), DUR - t_sig + .2, .4), t_sig, .22, 0, .5); put(MU, piano(41, 3.5), t_sig, .3, 0, .4)
for i, m in enumerate((77, 81, 84)): put(FX, bell(m, 2.6), t_sig + .1 + i * .12, .1, (-.3, 0, .3)[i], .6)
ev('assinatura: logo, acorde final e sinos', t_sig)

# ── reverb, silêncio e mixagem
t = ar(N)
ir = [make_ir(2.2, 41 + c) for c in (0, 1)]
rev = np.stack([conv(SEND[:, c], ir[c]) for c in (0, 1)], 1)
music = MU + FX + .5 * rev
music = np.stack([fftfilt(music[:, c], hp(30, 2)) for c in (0, 1)], 1)
mask = np.ones(N); i0, i1 = int(t_sil0 * SR), int((t_dif - .03) * SR); mask[i0:i1] = 0; kf = int(.04 * SR); mask[i0 - kf:i0] = np.linspace(1, 0, kf)
music *= mask[:, None] * np.clip(t / .01, 0, 1)[:, None] * np.clip((DUR - t) / .8, 0, 1)[:, None]
music = np.tanh(music * 1.2) / 1.2
fala = np.zeros(N); vr = []
for s in TL['scenes']:
    fala[int(s['v0'] * SR):int(s['v1'] * SR)] = 1
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32); v = v[np.abs(v) > 1e-3]; vr.append(np.sqrt(np.mean(v ** 2)))
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.1 * SR)), np.exp(-1 / (.4 * SR))
for kk in range(N):
    c = aa if fala[kk] > g else rr; g = c * g + (1 - c) * fala[kk]; env[kk] = g
mr = np.sqrt(np.mean(music[(fala == 0) & (mask > 0)] ** 2))
music *= np.mean(vr) * 10 ** (-9 / 20) / mr; music *= (10 ** (-6 * env / 20))[:, None]
pk = np.max(np.abs(music))
if pk > .75: music *= .75 / pk
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=music.astype(np.float32).tobytes(), check=True)
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME "Mesmo dia" (9:16) · {DUR:.2f} s · 30 fps · trilha original, 120 BPM, Ré menor (o dia) → Fá maior (a diferença)\n\nFALAS (DME Narrador, ElevenLabs, 1,1×; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', round(DUR, 2), 's')
