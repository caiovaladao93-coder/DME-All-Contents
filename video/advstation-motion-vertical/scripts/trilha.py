"""Trilha ORIGINAL (numpy, sem amostras de terceiros) — ADV Station, filme de motion graphics vertical.
Instrumental contemporânea a 92 BPM: textura harmônica sóbria e piano, pulsação discreta que cresce aos poucos,
textura curta (papel) na abertura do dossiê, acento delicado quando uma relação se completa (folhas no dossiê,
responsabilidades conectadas), pequena mudança sonora na entrada de cada produto (mesmo peso) e resolução na assinatura.
Saídas: out/trilha.wav, out/narracao.wav, out/mix.wav (−15 LUFS, −1,5 dBTP), out/ADV-Station-Institucional-Vertical.srt, out/marcas-som.txt."""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, bass, bell, conv, fftfilt, band, kick, make_ir, pad, piano, shaker, rng

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/timeline.json')); B = {b['key']: b for b in TL['blocks']}
DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / 92; BAR = 4 * BEAT
def wt(fid, w):
    import unicodedata
    n = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()) if c.isalnum() and unicodedata.category(c) != 'Mn')
    return next(x[1] for x in TL['words'][fid] if n(x[0]) == n(w))
T_PROD = [wt('a5', 'Maternidade') - .1, wt('a6', 'Previdenciário') - .1]   # entrada dos nomes dos produtos (video.html)
T_LOGO = 61.55                                                              # entrada do símbolo (video.html)
T_REL = [wt('a4', 'organizar') + 1.1, wt('a4', 'coordenar') + 1.8]           # relações que se completam (video.html)
L = np.zeros((N, 2)); send = np.zeros((N, 2)); EV = []
def put(sig, t0, g=1.0, pan=0.0, rev=.35):
    i = int(round(t0 * SR))
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:j, 0] += s * l * .707; L[i:j, 1] += s * r * .707; send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707
def ev(n, t0): EV.append((round(t0, 2), n))
tt = ar(N)

# ambiência leve de escritório (ar-condicionado distante, sala): ruído filtrado muito baixo, some na assinatura
amb = fftfilt(rng.standard_normal(N), band(120, 1800)); amb /= np.max(np.abs(amb))
amb *= 0; L += amb[:, None]
# textura curta na abertura: a folha desliza do dossiê (ruído filtrado, 0,5 s)
pap = fftfilt(rng.standard_normal(int(.55 * SR)), band(1800, 7000)); pap *= np.sin(np.pi * ar(len(pap)) / .55) ** 2 / np.max(np.abs(pap))
put(pap, .15, .05, .2, .2); ev('textura curta: a folha desliza do dossiê', .15)
for n, t0 in zip(('folhas encontram o dossiê', 'responsabilidades conectadas'), T_REL): put(bell(86, 1.8), t0, .045, .15, .7); ev(f'acento delicado: {n}', t0)

# harmonia: Si♭ maior / Sol menor (confiança, sem melancolia): B♭ · Gm · E♭ · F
PROG = [(46, 53, 58, 62), (43, 50, 55, 58), (39, 46, 51, 55), (41, 48, 53, 57)]; ROOTS = [34, 31, 27, 29]
t, k = 0.0, 0
while t < DUR - .5:
    ch = PROG[k % 4]; blk = next(b['key'] for b in TL['blocks'] if b['t0'] <= t < b['t1'] + 1e-6)
    lvl = {'caminho': .7, 'rotina': .8, 'organizacao': 1, 'maternidade': 1, 'previdenciario': 1, 'visao': 1.1, 'assinatura': .8}[blk]
    put(pad(ch, BAR + .6, bright=.25 + .1 * (lvl > .9)), t, .13 * lvl, 0, .45)
    # piano: notas esparsas no começo, arpejo leve depois
    if blk in ('caminho', 'rotina'):
        for b, m in ((0, ch[2] + 12), (2.5, ch[3] + 12)): put(piano(m, 2.6), t + b * BEAT, .16, .2 if m % 2 else -.2, .55)
    else:
        for i in range(8): put(piano([ch[1], ch[2], ch[3], ch[2]][i % 4] + 12, 1.4), t + i * BEAT / 2, .085 + .02 * (i % 4 == 0), .3 * (1 if i % 2 else -1), .45)
    # pulsação eletrônica suave a partir da rotina; mais presente na organização; sai na assinatura
    if blk not in ('caminho', 'assinatura'):
        for b in range(4):
            if b in (0, 2): put(kick(), t + b * BEAT, .16 * lvl)
            put(shaker(), t + b * BEAT + BEAT / 2, .035 * lvl, .25)
            put(bass(ROOTS[k % 4], BEAT * .9), t + b * BEAT, .12 * lvl)
    t += BAR; k += 1
ev('piano e textura harmônica (abertura, sem vinheta)', 0); ev('pulsação discreta entra', B['rotina']['t0']); ev('pulsação ganha presença', B['organizacao']['t0'])
for n, t0 in zip(('Maternidade Legal', 'Previdenciário Geral'), T_PROD):
    put(bell(82, 2.2), t0, .06, 0, .6); put(piano(70, 2.4), t0, .1, 0, .5); ev(f'mudança sonora: entra {n}', t0)
# resolução na assinatura: B♭ maior aberto + três notas
put(pad((34, 46, 53, 58, 62), DUR - T_LOGO + .8, bright=.35), T_LOGO - .5, .18, 0, .5)
for i, m in enumerate((77, 81, 82)): put(bell(m, 2.6), T_LOGO + .15 + i * .14, .05, (-.2, 0, .2)[i], .7)
put(piano(58, 4.0), T_LOGO, .2); put(piano(46, 4.0), T_LOGO, .16); ev('resolução musical na assinatura', T_LOGO)

ir = [make_ir(2.4, 21 + c) for c in (0, 1)]
music = L + .55 * np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music *= np.clip(tt / .02, 0, 1)[:, None] * np.clip((DUR - tt) / 1.4, 0, 1)[:, None]

voz = np.zeros(N); fala = np.zeros(N)
for f in TL['falas']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/voz/{f['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, np.float32).astype(np.float64); i = int(round(f['v0'] * SR)); voz[i:i + len(y)] += y[:N - i]
    fala[int(f['v0'] * SR):int(f['v1'] * SR)] = 1
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.25 * SR)), np.exp(-1 / (.6 * SR))
for i in range(N):
    c = aa if fala[i] > g else rr; g = c * g + (1 - c) * fala[i]; env[i] = g
vr = np.sqrt(np.mean(voz[np.abs(voz) > 1e-3] ** 2)); mr = np.sqrt(np.mean(music[fala == 0] ** 2))
music *= vr * 10 ** (-12 / 20) / mr; music *= (10 ** (-5 * env / 20))[:, None]
def wav(x, path, ch): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-ar', '48000', '-c:a', 'pcm_s24le', path], input=np.ascontiguousarray(x).tobytes(), check=True)
wav(music, f'{ROOT}/out/trilha.wav', 2); wav(voz, f'{ROOT}/out/narracao-bruta.wav', 1); wav(music + voz[:, None], f'{ROOT}/out/mix-bruto.wav', 2)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/mix-bruto.wav', '-af', 'alimiter=limit=0.8:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000', '-c:a', 'pcm_s24le', f'{ROOT}/out/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/narracao-bruta.wav', '-af', 'loudnorm=I=-16:TP=-1.5,aresample=48000', '-c:a', 'pcm_s24le', f'{ROOT}/out/narracao.wav'], check=True)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
open(f'{ROOT}/out/ADV-Station-Institucional-Vertical.srt', 'w').write('\n'.join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(TL['captions'], 1)))
F = {x['id']: x['text'] for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · ADV Station · motion graphics vertical · {DUR:.2f} s ({TL["frames"]} quadros) · 30 fps · trilha original 92 BPM\n\nBLOCOS\n')
    f.write(''.join(f"{b['t0']:6.2f}–{b['t1']:6.2f}  {b['key']}\n" for b in TL['blocks']))
    f.write('\nFALAS (Guilherme, ElevenLabs, velocidade natural)\n' + ''.join(f"{x['v0']:6.2f}–{x['v1']:6.2f}  {F[x['fala']]}\n" for x in TL['falas']))
    f.write('\nTRILHA E EFEITOS\n' + ''.join(f'{t0:6.2f}  {n}\n' for t0, n in sorted(EV)))
print('trilha ok')
