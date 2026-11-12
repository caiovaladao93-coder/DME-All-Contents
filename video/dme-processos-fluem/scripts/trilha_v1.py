"""Trilha ORIGINAL + efeitos (numpy, sem amostras de terceiros) — DME "Processos que fluem com tecnologia". 120 BPM.
Queda do pedido → impacto metálico → tensão (barreiras, labirinto) → silêncio antes do "Agora" → groove estável no método →
aceleração no fluxo e montagem de horários → fecho mais leve → loop (parede se abre) → assinatura de 3 notas.
Música ~13 dB abaixo da voz, com ducking de 7 dB sob a fala. Saída: public/assets/audio/trilha.wav e out/marcas-som.txt."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, bass, bell, blip, boom, click, conv, kick, make_ir, pad, piano, pluck, shaker, sub_pulse, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = .5; BAR = 4 * BEAT
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

tPara = wt('gancho', 'para'); tEsp = [wt('barreiras', 'Espera', k) for k in range(3)]
tSil0, tAgora = S['caminho']['v1'] + .05, wt('virada', 'Agora')
tDiag, tMapa, tPadr, tAuto, tInt = (wt('metodo', w) for w in ('diagnóstico', 'mapeia', 'padroniza', 'automatiza', 'Integra'))
tAnda, tAndar = wt('fluxo', 'E'), wt('fluxo', 'andar'); tMonta = S['fluxo']['v1'] + .1
tFecho, tLoop, tE, tFlui, tSig = S['fecho']['t0'], S['loop']['t0'], wt('loop', 'E'), wt('loop', 'flui'), S['assinatura']['t0']

def groove(t0, t1, prog, roots, level=1.0, drums=True, keys=False):
    t, bar = t0, 0
    while t < t1 - 1e-6:
        ch = prog[bar % len(prog)]; dur = min(BAR, t1 - t)
        put(L, pad(ch, dur + .4, bright=.3), t, .2 * level, 0, .4)
        for b in range(4):
            tb = t + b * BEAT
            if tb >= t1: break
            if drums:
                put(L, kick(), tb, .4 * level)
                put(L, shaker(), tb + BEAT / 2, .07 * level, .25)
            put(L, bass(roots[bar % len(roots)], BEAT * .85), tb, .3 * level)
        if keys:
            for bb, m in [(0, ch[2] + 12), (2, ch[1] + 24)]: put(L, piano(m), t + bb * BEAT, .14 * level, .2, .55)
        else:
            for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 2)): put(L, pluck([ch[1], ch[2], ch[3], ch[2]][i % 4] + 12, .3), ta, .07 * level, .35 * (1 if i % 2 else -1), .35)
        t += BAR; bar += 1
TENSE = [(38, 45, 50, 53), (37, 44, 49, 53)]; RT = [26, 25]
MAJ = [(50, 57, 62, 66), (47, 54, 59, 62), (43, 50, 55, 59), (45, 52, 57, 61)]; RM = [38, 35, 31, 33]   # D · Bm · G · A

# ── gancho: o pedido cai (whoosh ascendente) e bate na parede
ev('o pedido entra (queda)', 0.0, lambda t0: put(fx, whoosh(tPara, up=True), t0, .2, 0, .2))
ev('IMPACTO na parede', tPara, lambda t0: (put(fx, boom(1.4), t0, .45, 0, .3), put(fx, bell(45, 1.6), t0, .16, 0, .4), put(fx, click(), t0, .35)))
# ── tensão: pulso grave a cada batida, crescendo até o silêncio
for tb in np.arange(tEsp[0] - .1, tSil0, BEAT):
    p = (tb - tEsp[0]) / (tSil0 - tEsp[0]); put(L, sub_pulse(26, .8), tb, .55 + .4 * p); put(L, click(), tb + BEAT / 2, .05 + .06 * p, .3)
put(L, pad((38, 45, 50, 53), tSil0 - tEsp[0], bright=.12), tEsp[0], .26, 0, .3)
for k, t0 in enumerate(tEsp): ev(f'barreira {k + 1} cai', t0 - .05, lambda t0: (put(fx, kick(), t0, .5), put(fx, click(), t0 + .02, .25, (-.3, .3, 0)[k])))
ev('labirinto se forma', S['caminho']['t0'] + .05, lambda t0: [put(fx, click(), t0 + j * .07, .08, (-1) ** j * .4) for j in range(14)])
mask = np.ones(N); mask[int(tSil0 * SR):int((tAgora - .03) * SR)] = 0.0   # silêncio antes do "Agora"
EV.append((round(tSil0, 2), f'SILÊNCIO ({tAgora - tSil0:.2f} s) antes do "Agora"'))
# ── virada
ev('"Agora": as paredes giram (dominó)', tAgora - .03, lambda t0: (put(fx, boom(1.8), t0, .3, 0, .4), put(fx, bell(74, 2.2), t0, .1, 0, .5),
   [put(fx, click(), t0 + .12 + j * .045, .07, (-1) ** j * .3) for j in range(16)]))
# ── método e fluxo: groove maior a 120 BPM
groove(S['virada']['t0'] + .55, tFecho, MAJ, RM)
ev('diagnóstico: scanner', tDiag - .05, lambda t0: put(fx, whoosh(.8), t0, .12, 0, .2))
ev('mapeamento: estações', tMapa, lambda t0: [put(fx, blip(84 + 3 * j), t0 + j * .12, .08, 0, .3) for j in range(3)])
ev('padronização: blocos se encaixam', tPadr, lambda t0: [put(fx, click(), t0 + j * .09, .14, (-1) ** j * .2) for j in range(3)])
ev('automação: trilho preenche', tAuto, lambda t0: put(fx, bell(86, 1.4), t0, .07, .2, .5))
ev('integração: cabos conectam', tInt + .35, lambda t0: [put(fx, click(), t0 + j * .14, .16, (-.3, .3, -.3)[j]) for j in range(3)])
ev('o pedido acelera', tAnda + .25, lambda t0: put(fx, whoosh(1.0, up=True), t0, .2, 0, .2))
for j in range(3): ev(f'estação {j + 1} acende', tAnda + .6 + j * .18, lambda t0: put(fx, blip(88 + 2 * j), t0, .07, 0, .3))
HM, HC = wt('horas', 'manhã'), wt('horas', 'cada')
for j in range(4): ev(f'horário {j + 1}', S['horas']['t0'] + j * (HC - .3 - S['horas']['t0']) / 3, lambda t0: put(fx, blip(91), t0, .06, 0, .3))
# ── fecho mais leve (piano), loop e assinatura
groove(tFecho, tLoop, MAJ, RM, level=.7, drums=False, keys=True)
ev('loop: o pedido entra de novo', tLoop, lambda t0: put(fx, whoosh(tE - tLoop, up=True), t0, .14, 0, .2))
ev('a parede se abre', tE - .05, lambda t0: (put(fx, whoosh(.5), t0, .2, 0, .3), put(fx, click(), t0, .2)))
ev('o pedido atravessa', tFlui, lambda t0: put(fx, whoosh(.8, up=False), t0, .22, 0, .3))
groove(tE - .05, tSig, MAJ[:1], RM[:1], level=.9)
for i, m in enumerate((74, 78, 81)): ev(f'assinatura {i + 1}', tSig + .7 + i * .12, lambda t0, m=m, i=i: put(fx, bell(m, 2.6), t0, .15, (-.3, 0, .3)[i], .6))
put(L, pad((38, 50, 54, 57, 62), DUR - tSig + .3, bright=.5), tSig, .32, 0, .5); put(L, bass(26, 3.0), tSig + .7, .3)
ev('logo se monta', tSig + .7, lambda t0: put(fx, boom(1.4), t0, .16, 0, .3))
ev('CTA "Comente COMERCIAL e receba um diagnóstico"', wt('assinatura', 'Comente') - .1, lambda t0: put(fx, blip(90), t0, .07, 0, .5))

ir = [make_ir(2.0, 71 + c) for c in (0, 1)]
rev = np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music = (L + .5 * rev + fx) * mask[:, None]
tt = ar(N); music *= np.clip(tt / .02, 0, 1)[:, None] * np.clip((DUR - tt) / .8, 0, 1)[:, None]
fala = np.zeros(N); vr = []
for s in TL['scenes']:
    fala[int(s['v0'] * SR):int(s['v1'] * SR)] = 1
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32); v = v[np.abs(v) > 1e-3]; vr.append(np.sqrt(np.mean(v ** 2)))
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.12 * SR)), np.exp(-1 / (.45 * SR))
for k in range(N):
    c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
mr = np.sqrt(np.mean(music[(fala == 0) & (mask > 0)] ** 2))
music *= np.mean(vr) * 10 ** (-12 / 20) / mr; music *= (10 ** (-7 * env / 20))[:, None]
pk = np.max(np.abs(music))
if pk > .7: music *= .7 / pk
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=music.astype(np.float32).tobytes(), check=True)
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME "Processos que fluem com tecnologia" · {DUR:.2f} s · 30 fps · trilha original 120 BPM\n\nFALAS (Lendário, ElevenLabs, velocidade natural)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha ok', DUR)
