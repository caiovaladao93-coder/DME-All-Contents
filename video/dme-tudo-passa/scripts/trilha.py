"""Trilha ORIGINAL (numpy, sem amostras de terceiros) · DME "Tudo passa por você" (9:16, 60 s).
Ré menor e pulso que crescem com a sobrecarga: notificação em dois tons por mensagem, enxurrada que acelera na montagem e ronco
grave no gargalo; 0,4 s de silêncio e impacto no "Agora", quando a harmonia abre para Fá maior. Um sino a cada linha redesenhada
(CRM, agente de voz, processo, integração), placas do método, loop e acorde final na assinatura.
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

t_sil0 = S['agora']['t0'] + .02; t_dif = S['agora']['v0']; t_sig = S['assinatura']['t0']
DM = [(50, 57, 62, 65), (46, 53, 58, 62), (48, 55, 60, 64), (45, 52, 57, 61)]   # Rém – Si♭ – Dó – Lá (a sobrecarga)
FM = [(53, 60, 65, 69), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]   # Fá – Dó – Rém – Si♭ (depois do "Agora")
t, k = 0.0, 0
while t < DUR - .5:
    if t_sil0 - BAR < t < t_dif: t += BAR; k += 1; continue
    prog = FM if t >= t_dif else DM; ch = prog[k % 4]; lvl = .6 if t < S['msgs']['t0'] else .85
    put(MU, pad(ch, BAR + .6, .2 if prog is FM else 0), t, .16 * lvl, 0, .4)
    put(MU, piano(ch[0] - 12, 2.4), t, .22 * lvl, -.1, .3)
    for j, m in enumerate((ch[1], ch[2], ch[3], ch[2])): put(MU, piano(m + 12, 1.2), t + j * BEAT, .07 * lvl, (-.3, .1, .3, -.1)[j], .5)
    t += BAR; k += 1
# pulso: cresce com a sobrecarga (mensagens → montagem → gargalo), firme e aberto depois do "Agora"
t = 0.0
while t < t_sig:
    if not (t_sil0 <= t < t_dif):
        if t < t_sil0: g = .15 + .55 * min(1, max(0, (t - S['msgs']['t0']) / (t_sil0 - S['msgs']['t0'])))
        else: g = .55
        put(MU, sub_pulse(38, 1.0), t, .2 + .25 * g); put(MU, kick(), t, .25 * g)
        if g > .35: put(MU, shaker(), t + BEAT / 2, .06, .35)
    t += BEAT
# notificações: dois tons por mensagem; na montagem, uma enxurrada que acelera
def notif(): return np.concatenate([pluck(84, .12)[:int(.09 * SR)], pluck(91, .35)])
for k_, w in enumerate(['Aprova', 'Atende', 'Passa', 'Acha', 'Lembra']):
    t0 = wt('msgs', w) - .12; put(FX, notif(), t0, .16, (-.4, .4, .4, -.4, -.2)[k_], .2); ev(f'notificação {k_ + 1}', t0)
m0, m1 = S['montagem']['t0'], S['gargalo']['t1']
tt_ = m0; i = 0
while tt_ < m1 - .3:
    put(FX, notif(), tt_, .05 + .05 * (tt_ - m0) / (m1 - m0), (-1) ** i * .5, .2); tt_ += max(.09, .45 - .3 * (tt_ - m0) / (m1 - m0)); i += 1
ev('enxurrada de notificações (almoço, janta, sábado)', m0)
nr = int((m1 - S['gargalo']['t0'] + .2) * SR); tt = ar(nr); u = tt / tt[-1]
put(FX, np.sin(2 * np.pi * np.cumsum(45 + 25 * u) / SR) * u ** 1.5 * .6, S['gargalo']['t0'], .4); ev('gargalo: ronco grave subindo', S['gargalo']['t0'])
EV.append((round(t_sil0, 2), f'SILÊNCIO ({t_dif - t_sil0:.2f} s) antes do "Agora"'))
put(MU, kick(), t_dif - .02, .7); put(FX, boom(1.6), t_dif - .02, .4, 0, .3); put(FX, whoosh(.8), t_dif - .55, .18, 0, .2); ev('AGORA: impacto, harmonia abre para Fá maior', t_dif)
for nm, k_, w in (('CRM · retorno automático', 'crm', 'Cê-Erre-Eme'), ('agente de voz com IA', 'agente', 'agente'), ('processo padronizado', 'processo', 'vira'), ('integração de sistemas', 'integra', 'conversam')):
    t0 = wt(k_, w) - .2; put(FX, bell(79, 1.8), t0, .13, .2, .5); put(FX, bell(86, 1.2), t0 + .08, .05, -.2, .5); put(FX, click(), t0, .2); ev(f'linha redesenhada: {nm}', t0)
for j, w in enumerate(['atende,', 'qualifica,', 'registra', 'passa']): put(FX, pluck(74 + (0, 2, 4, 7)[j], .4), wt('agente', w) - .03, .1, (-.3, -.1, .1, .3)[j], .4)
for j, w in enumerate(['entende,', 'planeja', 'desenvolve']):
    t0 = wt('metodo', w); put(FX, bell(74 + (0, 4, 7)[j], 1.6), t0 - .05, .12, (-.3, 0, .3)[j], .5); ev(f'placa {j + 1}: {w.strip(",").upper()}', t0 - .05)
put(FX, bell(77, 2.2), wt('fecho', 'crescimento,') - .1, .1, 0, .6); ev('linha VOCÊ → CRESCIMENTO', wt('fecho', 'crescimento,') - .1)
tl = wt('fecho', 'crescimento,') + 2.5; put(FX, whoosh(.8), tl - .4, .12, 0, .3); ev('loop: "Você abriu a empresa pra ter liberdade."', tl)
put(MU, kick(), t_sig, .5); put(FX, boom(1.8), t_sig, .35, 0, .3)
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
    f.write(f'MARCAS · DME "Tudo passa por você" (9:16) · {DUR:.2f} s · 30 fps · trilha original, 120 BPM, Ré menor (sobrecarga) → Fá maior (depois do Agora)\n\nFALAS (DME Narrador, ElevenLabs, 1,1×; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', round(DUR, 2), 's')
