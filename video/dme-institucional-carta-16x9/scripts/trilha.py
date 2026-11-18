"""Trilha ORIGINAL (numpy, sem amostras de terceiros) · DME institucional 16:9 "Por que você abriu a sua empresa?" (59,7 s).
Piano em Ré menor e pulso discreto nas cenas do dono (celular vibrando no almoço, pasta "só eu sei", escada que sobe);
0,4 s de silêncio e impacto quando a DME entra (Fá maior); um sino por etapa do método, selos e provas; a porta se abre (whoosh)
e o acorde final fecha a assinatura. Música ~9 dB abaixo da voz, ducking de 6 dB sob a fala."""
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

t_sil0 = S['dme']['t0'] + .02; t_dif = S['dme']['v0']; t_sig = S['assinatura']['t0']
DM = [(50, 57, 62, 65), (46, 53, 58, 62), (48, 55, 60, 64), (45, 52, 57, 61)]   # Rém – Si♭ – Dó – Lá (o dono hoje)
FM = [(53, 60, 65, 69), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]   # Fá – Dó – Rém – Si♭ (a DME)
t, k = 0.0, 0
while t < DUR - .5:
    if t_sil0 - BAR < t < t_dif: t += BAR; k += 1; continue
    prog = FM if t >= t_dif else DM; ch = prog[k % 4]; lvl = .55 if t < S['almoco']['t0'] else .8
    put(MU, pad(ch, BAR + .6, .2 if prog is FM else 0), t, .16 * lvl, 0, .4)
    put(MU, piano(ch[0] - 12, 2.4), t, .24 * lvl, -.1, .3)
    for j, m in enumerate((ch[1], ch[2], ch[3], ch[2])): put(MU, piano(m + 12, 1.2), t + j * BEAT, .07 * lvl, (-.3, .1, .3, -.1)[j], .5)
    t += BAR; k += 1
# pulso discreto (institucional): só depois do gancho, um pouco mais firme a partir da DME
t = S['almoco']['t0']
while t < t_sig:
    if not (t_sil0 <= t < t_dif):
        g = .35 if t < t_dif else .6
        put(MU, sub_pulse(38, 1.0), t, .2 + .2 * g); put(MU, kick(), t, .18 * g)
        if t >= t_dif: put(MU, shaker(), t + BEAT / 2, .05, .35)
    t += BEAT
put(FX, click(), .3, .25); put(FX, whoosh(1.2), .2, .08, .3, .3); ev('porta "ABERTO" range e abre um pouco', .2)
t0 = wt('almoco', 'almoço.') - .9; nr = int(.5 * SR); tt = ar(nr); buzz = np.sin(2 * np.pi * 180 * tt) * (np.sin(2 * np.pi * 25 * tt) > 0) * .4 * np.minimum(1, (.5 - tt) / .05)
put(FX, buzz, t0, .25, .4); put(FX, np.concatenate([pluck(84, .12)[:int(.09 * SR)], pluck(91, .35)]), t0 + .1, .14, .4, .2); ev('celular vibra no almoço (notificação)', t0)
put(FX, bell(62, 1.8), wt('arquivo', 'única') - .1, .1, .2, .5); put(FX, click(), wt('arquivo', 'única'), .2); ev('pasta "SÓ EU SEI" sobe', wt('arquivo', 'única') - .1)
for i in range(6): put(FX, pluck(55 + (0, 2, 4, 5, 7, 9)[i], .35), S['cresce']['t0'] + .2 + i * .22, .1, -.4 + i * .16, .3)
ev('escada da empresa sobe; régua dos processos fica para trás', S['cresce']['t0'] + .2)
EV.append((round(t_sil0, 2), f'SILÊNCIO ({t_dif - t_sil0:.2f} s) antes da DME'))
put(MU, kick(), t_dif - .02, .55); put(FX, boom(1.6), t_dif - .02, .35, 0, .3); put(FX, whoosh(1.2), wt('dme', 'Dê-Eme-É') + .2, .12, 0, .3); ev('DME entra: a régua se alinha (Fá maior)', t_dif)
for n_i, (k_, w) in enumerate((('entender', 'Primeiro,'), ('planejar', 'Depois,'), ('desenvolver', 'desenvolve'))):
    t0 = wt(k_, w) - .1; put(FX, bell(72 + (0, 4, 7)[n_i], 1.8), t0, .12, (-.3, 0, .3)[n_i], .5); ev(f'placa 0{n_i + 1}', t0)
put(FX, blip(81), wt('entender', 'trava') - .05, .14, 0, .3); put(FX, blip(81), wt('entender', 'trava') + .04, .1, 0, .3); ev('marcador no gargalo ("quem espera quem")', wt('entender', 'trava'))
for j in range(5): put(FX, click(), wt('planejar', 'mapeia') + j * .12, .18, -.4 + j * .2)
ev('etapas se alinham', wt('planejar', 'mapeia'))
for w in ('inteligência', 'automação', 'integração'): put(FX, pluck(79, .5), wt('desenvolver', w) - .1, .12, 0, .4)
ev('selos IA, AUTOMAÇÃO, INTEGRAÇÃO', wt('desenvolver', 'inteligência') - .1)
for nm, w in (('CRM: retorno enviado', 'lembrou.'), ('agente: atendida', 'atende'), ('agente: qualificada', 'sete'), ('agente: transferida para comercial', 'passa')):
    put(FX, bell(84, 1.2), wt('provas', w) - .15, .08, .3, .5); ev(nm, wt('provas', w) - .15)
put(FX, whoosh(1.4), wt('fecho', 'abrir') - .5, .16, 0, .3); ev('a porta "ABERTO" se abre por inteiro (loop)', wt('fecho', 'abrir') - .3)
put(MU, kick(), t_sig, .45); put(FX, boom(1.8), t_sig, .3, 0, .3)
put(MU, pad((53, 57, 60, 65, 69), DUR - t_sig + .2, .4), t_sig, .22, 0, .5); put(MU, piano(41, 3.5), t_sig, .3, 0, .4)
for i_, m in enumerate((77, 81, 84)): put(FX, bell(m, 2.6), t_sig + .1 + i_ * .12, .1, (-.3, 0, .3)[i_], .6)
ev('assinatura: logo, slogan, acorde final', t_sig)

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
    f.write(f'MARCAS · DME institucional "Por que você abriu a sua empresa?" (16:9) · {DUR:.2f} s · 30 fps · trilha original, 120 BPM, Ré menor (o dono hoje) → Fá maior (a DME)\n\nFALAS (DME Narrador, ElevenLabs, 1,1×; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', round(DUR, 2), 's')
