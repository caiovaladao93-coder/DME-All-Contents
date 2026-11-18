"""Trilha ORIGINAL (numpy, sem amostras de terceiros) · DME "Onde a operação trava" (9:16, 60 s).
Tom sóbrio de relatório: pulso grave a 120 BPM, piano em Ré menor e textura de aço. Eventos da história:
o marcador trava no gargalo (bipe de mira + baque grave), a solução entra (sino + whoosh e a harmonia abre para Fá maior),
0,4 s de silêncio antes do método, três placas (Entender, Planejar, Desenvolver) com notas que sobem e acorde final na assinatura.
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

t_sil0 = S['metodo']['t0'] - .4; t_met = S['metodo']['t0']; t_sig = S['assinatura']['t0']
# harmonia: Ré menor (problema) e Fá maior (solução); por compasso
DM = [(50, 57, 62, 65), (46, 53, 58, 62), (48, 55, 60, 64), (45, 52, 57, 61)]   # Rém – Si♭ – Dó – Lá
FM = [(53, 60, 65, 69), (48, 55, 60, 64), (50, 57, 62, 65), (46, 53, 58, 62)]   # Fá – Dó – Rém – Si♭
CASES = ['c1', 'c2', 'c3', 'c4']
def resolved(t):  # dentro de uma solução?
    return any(S[f'{c}s']['t0'] <= t < S[f'{c}s']['t1'] for c in CASES) or t >= t_met
# camas por compasso
t, k = 0.0, 0
while t < DUR - .5:
    if t_sil0 - BAR < t < t_met: t += BAR; k += 1; continue
    prog = FM if resolved(t + .1) else DM; ch = prog[k % 4]
    lvl = .55 if t < S['c1p']['t0'] else .8
    put(MU, pad(ch, BAR + .6, .2 if prog is FM else 0), t, .16 * lvl, 0, .4)
    put(MU, piano(ch[0] - 12, 2.4), t, .22 * lvl, -.1, .3)
    for j, m in enumerate((ch[1], ch[2], ch[3], ch[2])):   # arpejo de piano, uma nota por batida
        put(MU, piano(m + 12, 1.2), t + j * BEAT, .07 * lvl, (-.3, .1, .3, -.1)[j], .5)
    t += BAR; k += 1
# pulso grave e textura (contido no gancho, mais firme nos casos), para no silêncio
t = 0.0
while t < t_sig:
    if not (t_sil0 <= t < t_met):
        firm = t >= S['c1p']['t0']
        put(MU, sub_pulse(38, 1.0), t, .38 if firm else .25)
        if firm: put(MU, kick(), t, .22)
        put(MU, shaker(), t + BEAT / 2, .05 if firm else .03, .35)
    t += BEAT
# marcador: varredura no gancho (ticks) e trava no gargalo
for i in range(4): put(FX, click(), .2 + i * .75, .25, (-.4, .4, .4, -.4)[i], .2)
ev('marcador procura nos 4 setores (ticks)', .2)
locks = [(wt('processo', 'Quase') - .2, 'gargalo escondido encontrado (planta geral)')] + [(S[f'{c}p']['t0'] + .6, f'marcador trava no gargalo · caso 0{i + 1}') for i, c in enumerate(CASES)]
for t0, nm in locks:
    put(FX, blip(81), t0, .18, 0, .3); put(FX, blip(81), t0 + .09, .12, 0, .3); put(FX, boom(1.0), t0, .28); ev(nm, t0)
# solução de cada caso: whoosh que sobe e sino
for i, c in enumerate(CASES):
    t0 = S[f'{c}s']['t0'] + .1
    put(FX, whoosh(.7), t0 - .55, .22, 0, .3); put(FX, bell(77 + 2 * i, 1.8), t0, .14, .2, .5); put(FX, bell(84 + 2 * i, 1.4), t0 + .08, .06, -.2, .5)
    ev(f'solução · caso 0{i + 1} (fluxo fica azul)', t0)
# verbos do agente (caso 1): pluck em cada palavra
for j, w in enumerate(['atende,', 'qualifica,', 'registra', 'passa']):
    put(FX, pluck(74 + (0, 2, 4, 7)[j], .4), wt('c1s', w) - .03, .1, (-.3, -.1, .1, .3)[j], .4)
ev('verbos do agente: atende, qualifica, registra, passa', wt('c1s', 'atende,'))
# troca de caso: whoosh lateral
for c in CASES[1:]:
    put(FX, whoosh(.5, False), S[f'{c}p']['t0'] - .35, .12, 0, .2); ev(f'troca de caso ({c})', S[f'{c}p']['t0'] - .35)
# método: silêncio antes, depois acerto e três placas
EV.append((round(t_sil0, 2), 'SILÊNCIO (0,4 s) antes do método'))
put(MU, kick(), aco(t_met), .4); put(FX, boom(1.4), aco(t_met), .3); ev('método: volta da trilha', t_met)
for j, w in enumerate(['entende,', 'planeja', 'desenvolve']):
    t0 = wt('metodo', w); put(FX, bell(74 + (0, 4, 7)[j], 1.6), t0 - .05, .12, (-.3, 0, .3)[j], .5); put(FX, click(), t0 - .05, .2)
    ev(f'placa {j + 1}: {w.strip(",").upper()}', t0 - .05)
# pergunta: marcador volta a procurar
for i in range(3): put(FX, click(), S['pergunta']['t0'] + .2 + i * .75, .2, (-.4, .4, 0)[i], .2)
ev('pergunta: o marcador volta a procurar (loop)', S['pergunta']['t0'] + .2)
# assinatura: acorde aberto e sinos
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
mask = np.ones(N); i0, i1 = int(t_sil0 * SR), int((t_met - .03) * SR); mask[i0:i1] = 0; kf = int(.04 * SR); mask[i0 - kf:i0] = np.linspace(1, 0, kf)
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
    f.write(f'MARCAS · DME "Onde a operação trava" (9:16) · {DUR:.2f} s · 30 fps · trilha original, 120 BPM, Ré menor → Fá maior\n\nFALAS (DME Narrador, ElevenLabs, 1,1×; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', round(DUR, 2), 's')
