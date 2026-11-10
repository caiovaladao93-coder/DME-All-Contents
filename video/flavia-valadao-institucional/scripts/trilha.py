"""Trilha ORIGINAL (numpy, sem amostras de terceiros): piano contemporâneo, textura acústica e pulsação discreta a 80 BPM.
Progressão: curiosidade (uma nota e textura) → descoberta (acordes, acento suave na revelação do desenho) →
clareza (pulsação de piano grave, um único acento) → abertura (plano amplo) → resolução na assinatura.
Poucos efeitos, só os pedidos: textura na abertura, acento na revelação e pequena resolução no logo. Sem whoosh.
Saídas: out/trilha.wav (só música), out/narracao.wav, out/mix.wav (voz + trilha com ducking suave, -15 LUFS / -1 dBTP),
out/legendas.srt e out/marcas-som.txt."""
import json, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, bell, conv, fftfilt, band, make_ir, pad, piano, rng

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/timeline.json')); B = {b['key']: b for b in TL['blocks']}
DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / 80
T_REVEAL_END = 7.2      # conclusão do desenho (bloco 2) — manter igual ao do vídeo
T_ACCENT = 13.6         # mudança mais importante do bloco 3 (entra a composição)
T_LOGO = B['assinatura']['t0'] + .25
L = np.zeros((N, 2)); send = np.zeros((N, 2)); EV = []
def put(sig, t0, g=1.0, pan=0.0, rev=.4):
    i = int(round(t0 * SR));
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:j, 0] += s * l * .707; L[i:j, 1] += s * r * .707
    send[i:j, 0] += s * rev * l * .707; send[i:j, 1] += s * rev * r * .707
def ev(nome, t0): EV.append((round(t0, 2), nome))

# textura acústica discreta (ar de ambiente), presente do início ao fim, mais aberta no plano amplo
tex = fftfilt(rng.standard_normal(N), band(250, 3500)); tex /= np.max(np.abs(tex)); tt = ar(N)
tex *= .018 * (1 + .6 * np.clip((tt - B['conjunto']['t0']) / 1.5, 0, 1) * np.clip((B['assinatura']['t0'] + 1 - tt) / 1.5, 0, 1))
L += tex[:, None]; ev('textura de ambiente (início)', 0.0)

# 1 · curiosidade: uma nota de piano já no primeiro quadro
put(piano(74, 4.0), 0.0, .5, .1); put(piano(62, 4.0), 0.0, .22, -.1); ev('nota de piano (abertura)', 0.0)
put(pad((50, 57, 62), 4.3, bright=.1), 0.6, .16)

# progressão em Ré: D · Bm · G · A (sus) — acordes suaves, levemente arpejados
PROG = [(50, 57, 62, 66), (47, 54, 59, 62), (43, 50, 55, 59), (45, 52, 57, 62)]
def chord(ch, t0, g=.24, spread=.06, dur=3.2):
    for k, m in enumerate(ch): put(piano(m + 12, dur), t0 + k * spread, g * (1 if k else .8), (-.25, -.08, .08, .25)[k])
t, k = B['intencao']['t0'], 0
while t < B['assinatura']['t0'] - .05:
    ch = PROG[k % 4]; blk = 'intencao' if t < B['escolhas']['t0'] else 'escolhas' if t < B['conjunto']['t0'] else 'conjunto'
    g = {'intencao': .2, 'escolhas': .22, 'conjunto': .26}[blk]
    chord(ch, t, g, .07 if blk != 'conjunto' else .1)
    put(pad(ch, 2 * BEAT * 2 + .6, bright=.2 + .2 * (blk == 'conjunto')), t, .12 + .06 * (blk == 'conjunto'))
    if blk in ('escolhas', 'conjunto'):   # pulsação discreta: nota grave do piano em cada tempo
        for b in range(4): put(piano(ch[0] - 12, 1.2), t + b * BEAT, .1 + .02 * (b == 0), 0, .2)
    if blk == 'conjunto':                 # momento mais amplo: melodia curta no registro médio-agudo
        for b, m in ((0, ch[3] + 12), (2, ch[2] + 12)): put(piano(m, 2.6), t + b * BEAT + BEAT / 2, .14, .2, .6)
    t += 4 * BEAT; k += 1
ev('acordes e pad (descoberta)', B['intencao']['t0']); ev('pulsação de piano grave (clareza)', B['escolhas']['t0']); ev('abertura da trilha (plano amplo)', B['conjunto']['t0'])
put(bell(86, 2.2), T_REVEAL_END, .07, .15, .7); ev('acento delicado: conclusão do desenho', T_REVEAL_END)
put(piano(81, 2.4), T_ACCENT, .12, .25, .6); ev('acento único do bloco 3 (composição)', T_ACCENT)

# 5 · resolução na assinatura: Ré maior aberto + três notas leves com o logo
put(pad((38, 50, 57, 62, 66), DUR - T_LOGO + .3, bright=.3), T_LOGO - .3, .2)
chord((50, 57, 62, 66), T_LOGO - .05, .22, .12, 5.0)
for i, m in enumerate((86, 90, 93)): put(bell(m, 2.6), T_LOGO + .35 + i * .16, .05, (-.2, 0, .2)[i], .7)
ev('resolução no logo (Ré maior + 3 notas)', T_LOGO)

ir = [make_ir(2.6, 11 + c) for c in (0, 1)]
music = L + .6 * np.stack([conv(send[:, c], ir[c]) for c in (0, 1)], 1)
music *= np.clip(tt / .02, 0, 1)[:, None] * np.clip((DUR - tt) / 1.2, 0, 1)[:, None]  # o fade termina em 29,0 s

# voz nas posições da linha do tempo
voz = np.zeros(N); fala = np.zeros(N)
for b in TL['blocks']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/voz/{b['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, np.float32).astype(np.float64); i = int(round(b['v0'] * SR)); voz[i:i + len(y)] += y[:N - i]
    fala[int(b['v0'] * SR):int(b['v1'] * SR)] = 1
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.25 * SR)), np.exp(-1 / (.6 * SR))   # ducking suave, sem bombeamento
for i in range(N):
    c = aa if fala[i] > g else rr; g = c * g + (1 - c) * fala[i]; env[i] = g
vr = np.sqrt(np.mean(voz[np.abs(voz) > 1e-3] ** 2)); mr = np.sqrt(np.mean(music[fala == 0] ** 2))
music *= vr * 10 ** (-12 / 20) / mr; music *= (10 ** (-5 * env / 20))[:, None]
def wav(x, path, ch):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-ar', '48000', '-c:a', 'pcm_s24le', path], input=np.ascontiguousarray(x).tobytes(), check=True)
wav(music, f'{ROOT}/out/trilha.wav', 2)
wav(voz, f'{ROOT}/out/narracao-bruta.wav', 1)
mix = music + voz[:, None]
wav(mix, f'{ROOT}/out/mix-bruto.wav', 2)
af = 'loudnorm=I=-15:TP=-1.5:LRA=11'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/mix-bruto.wav', '-af', f'alimiter=limit=0.8:level=disabled,{af},aresample=48000', '-c:a', 'pcm_s24le', f'{ROOT}/out/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{ROOT}/out/narracao-bruta.wav', '-af', 'loudnorm=I=-16:TP=-1.5,aresample=48000', '-c:a', 'pcm_s24le', f'{ROOT}/out/narracao.wav'], check=True)

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
open(f'{ROOT}/out/Flavia-Valadao-Institucional-Vertical.srt', 'w').write('\n'.join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(TL['captions'], 1)))
F = {x['id']: x['text'] for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · Flávia Valadão Interiores · institucional vertical · {DUR:.2f} s ({TL["frames"]} quadros) · 30 fps · trilha original 80 BPM\n\n')
    f.write('BLOCOS\n' + ''.join(f"{b['t0']:6.2f}–{b['t1']:6.2f}  {b['key']}\n" for b in TL['blocks']))
    f.write('\nFALAS (voz Pri, ElevenLabs, velocidade natural, sem compressão artificial)\n' + ''.join(f"{b['v0']:6.2f}–{b['v1']:6.2f}  {F[b['fala']]}\n" for b in TL['blocks']))
    f.write('\nTRILHA E EFEITOS\n' + ''.join(f'{t0:6.2f}  {n}\n' for t0, n in sorted(EV)))
print('trilha ok')
