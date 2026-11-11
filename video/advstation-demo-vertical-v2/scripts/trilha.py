"""Trilha ORIGINAL (numpy) + jingle OFICIAL da vinheta — ADV Station, demonstração real do produto.
0–2,6 s: jingle oficial (vinheta de abertura). 2,4–62,5 s: instrumental contemporânea a 92 BPM (textura harmônica sóbria,
piano e pulsação discreta), com acentos discretos nas trocas de produto e pequenos sons nas aproximações importantes.
62,6 s: jingle oficial (vinheta de encerramento), com ducking sob a fala da assinatura. Sem sons de clique.
Saídas: public/assets/audio/trilha.wav (o Remotion mistura as falas), out/mix.wav (conferência), out/narracao.wav, SRT e marcas."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, bass, bell, conv, kick, make_ir, pad, piano, shaker

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json')); DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / 92; BAR = 4 * BEAT
n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()) if c.isalnum() and unicodedata.category(c) != 'Mn')
wt = lambda fid, w: next(x[1] for x in TL['words'][fid] if n_(x[0]) == n_(w))
M0, M1 = 2.4, 62.5                                     # trecho da trilha entre as vinhetas
L = np.zeros((N, 2)); send = np.zeros((N, 2)); EV = []
def put(sig, t0, g=1.0, pan=0.0, rev=.35):
    i = int(round(t0 * SR))
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:j, 0] += s * l * .707; L[i:j, 1] += s * r * .707; send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707
ev = lambda n, t0: EV.append((round(t0, 2), n))
PROG = [(46, 53, 58, 62), (43, 50, 55, 58), (39, 46, 51, 55), (41, 48, 53, 57)]; ROOTS = [34, 31, 27, 29]
t, k = M0, 0
while t < M1 - .3:
    ch = PROG[k % 4]; lvl = min(1.0, .7 + .3 * (t - M0) / 20)
    put(pad(ch, BAR + .6, bright=.3), t, .13 * lvl, 0, .45)
    for i in range(8): put(piano([ch[1], ch[2], ch[3], ch[2]][i % 4] + 12, 1.4), t + i * BEAT / 2, .075 + .02 * (i % 4 == 0), .3 * (1 if i % 2 else -1), .45)
    if t > 6.5:
        for b in range(4):
            if b in (0, 2): put(kick(), t + b * BEAT, .13 * lvl)
            put(shaker(), t + b * BEAT + BEAT / 2, .03 * lvl, .25)
            put(bass(ROOTS[k % 4], BEAT * .9), t + b * BEAT, .11 * lvl)
    t += BAR; k += 1
ev('trilha entra com a cena (textura harmônica e piano)', M0); ev('pulsação discreta', 8.0)
for n, t0 in (('Maternidade Legal', wt('n3', 'Maternidade') - .1), ('Previdenciário Geral', wt('n5', 'Previdenciário') - .1)):
    put(bell(82, 2.2), t0, .055, 0, .6); put(piano(70, 2.4), t0, .09, 0, .5); ev(f'acento: troca de produto ({n})', t0)
for n, t0 in (('aproximação: clientes', 13.5), ('aproximação: etapas', 19.5), ('aproximação: administrativo', 30.9), ('aproximação: visão gerencial', 41.2)):
    put(bell(89, 1.2), t0, .03, .2, .6); ev(n, t0)
ir = [make_ir(2.4, 31 + c) for c in (0, 1)]
music = L + .55 * np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1); tt = ar(N)
music *= (np.clip((tt - M0) / 1.0, 0, 1) * np.clip((M1 - tt) / .8, 0, 1))[:, None]
# voz (para ducking e nível)
voz = np.zeros(N); fala = np.zeros(N)
for f in TL['falas']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/voz/{f['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, np.float32).astype(np.float64); i = int(round(f['v0'] * SR)); voz[i:i + len(y)] += y[:N - i]; fala[int(f['v0'] * SR):int(f['v1'] * SR)] = 1
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.25 * SR)), np.exp(-1 / (.6 * SR))
for i in range(N):
    c = aa if fala[i] > g else rr; g = c * g + (1 - c) * fala[i]; env[i] = g
vr = np.sqrt(np.mean(voz[np.abs(voz) > 1e-3] ** 2)); mr = np.sqrt(np.mean(music[(fala == 0) & (tt > M0 + 1) & (tt < M1 - 1)] ** 2))
music *= vr * 10 ** (-12 / 20) / mr; music *= (10 ** (-5 * env / 20))[:, None]
# jingle oficial nas duas vinhetas (o de encerramento abaixa sob a fala da assinatura)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/jingle-vinheta.flac', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
jg = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2); jr = np.sqrt(np.mean(jg ** 2))
jg *= vr * 10 ** (-4 / 20) / jr
for t0, nome in ((0.0, 'jingle oficial · vinheta de abertura'), (62.6, 'jingle oficial · vinheta de encerramento')):
    i = int(t0 * SR); j = min(N, i + len(jg)); seg = jg[:j - i].copy()
    if t0 > 0: seg *= (10 ** (-8 * env[i:j] / 20))[:, None]
    music[i:j] += seg; ev(nome, t0)
pk = np.max(np.abs(music + voz[:, None]))
def wav(x, path, ch): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-ar', '48000', '-c:a', 'pcm_s24le', path], input=np.ascontiguousarray(x).tobytes(), check=True)
sc = .8 / pk if pk > .8 else 1.0
wav(music * sc, f'{ROOT}/public/assets/audio/trilha.wav', 2); wav(voz * sc, f'{ROOT}/out/narracao-bruta.wav', 1); wav((music + voz[:, None]) * sc, f'{ROOT}/out/mix-bruto.wav', 2)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/narracao-bruta.wav', '-af', 'loudnorm=I=-16:TP=-1.5,aresample=48000', '-c:a', 'pcm_s24le', f'{ROOT}/out/ADV-Station-Institucional-Vertical-narracao.wav'], check=True)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
open(f'{ROOT}/out/ADV-Station-Institucional-Vertical.srt', 'w').write('\n'.join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(TL['captions'], 1)))
F = {x['id']: x['text'] for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · ADV Station · demonstração real do produto · {DUR:.2f} s ({TL["frames"]} quadros) · 30 fps\n\nBLOCOS\n' + ''.join(f"{b['t0']:6.2f}–{b['t1']:6.2f}  {b['key']}\n" for b in TL['blocks']))
    f.write('\nFALAS (Guilherme, ElevenLabs, velocidade natural)\n' + ''.join(f"{x['v0']:6.2f}–{x['v1']:6.2f}  {F[x['fala']]}\n" for x in TL['falas']))
    f.write('\nTRILHA E EFEITOS\n' + ''.join(f'{t0:6.2f}  {n}\n' for t0, n in sorted(EV)))
print('trilha ok')
