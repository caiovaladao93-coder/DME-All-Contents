"""Trilha ORIGINAL v2 (numpy, sem amostras de terceiros) — DME "Bastidores". Eletrônica a 120 BPM.
Intro de tensão (pulso + riser) → IMPACTO em "para" → beat contido em Ré menor nas barreiras e no labirinto (filtro abrindo) →
0,4 s de silêncio → DROP no "Agora" (four-on-the-floor, baixo com sidechain, supersaw, arpejo com delay) em Fá–Dó–Rém–Si♭ →
breakdown no fecho (sem bumbo) → subida até "flui" e novo drop → acorde final na assinatura.
Música ~10 dB abaixo da voz, ducking de 6 dB sob a fala. Saída: public/assets/audio/trilha.wav e out/marcas-som.txt.
A trilha anterior (mais discreta) está em scripts/trilha_v1.py."""
import json, subprocess, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import numpy as np
from sons import SR, ar, band, bell, boom, click, conv, fftfilt, hp, hz, lp, make_ir, whoosh

ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
S = {s['key']: s for s in TL['scenes']}; DUR = TL['frames'] / 30; N = int(DUR * SR)
BEAT = .5; BAR = 4 * BEAT; R = np.random.default_rng(7)
n_ = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode() if c.isalnum())
def wt(k, w, nth=0):
    h = [x[1] for x in TL['words'][k] if n_(x[0]) == n_(w)]; return h[nth] if nth < len(h) else h[0]

# ── barramentos: bateria, baixo (com sidechain), harmonia (com sidechain), efeitos; e envio de reverb
DR, BS, HM, FX = (np.zeros((N, 2)) for _ in range(4)); SEND = np.zeros((N, 2)); EV = []
def put(buf, sig, t0, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t0 * SR))
    if i >= N or g == 0: return
    if i < 0: sig, i = sig[-i:], 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:j, 0] += s * l * .707; buf[i:j, 1] += s * r * .707
    if rev: SEND[i:j, 0] += s * rev * l * .707; SEND[i:j, 1] += s * rev * r * .707
def ev(name, t0): EV.append((round(t0, 2), name))

# ── timbres
def env_ad(n, a=.003, d=.2):
    t = ar(n); return np.minimum(1, t / a) * np.exp(-t / d)
def kick(g=1.0):
    n = int(.42 * SR); t = ar(n); f = 46 + 110 * np.exp(-t / .035)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .26) + .35 * R.standard_normal(n) * np.exp(-t / .004)
    return np.tanh(1.6 * x) * g
def clap():
    n = int(.3 * SR); t = ar(n); x = np.zeros(n)
    for k, d in enumerate((0, .011, .022)):
        i = int(d * SR); m = n - i; x[i:] += R.standard_normal(m) * np.exp(-ar(m) / (.012 if k < 2 else .14))
    return fftfilt(x, band(900, 5200)) * 1.4
def hat(open_=False):
    n = int((.32 if open_ else .06) * SR); x = R.standard_normal(n) * env_ad(n, .001, .1 if open_ else .018)
    return fftfilt(x, hp(7500, 3)) * (.9 if open_ else 1.0)
def saw(f, n, det=0.0):
    t = ar(n); ph = (f * (1 + det)) * t + R.random(); return 2 * (ph % 1) - 1
def bass_note(m, dur, cut=900):
    n = int(dur * SR); x = saw(hz(m), n) + .6 * np.sin(2 * np.pi * hz(m - 12) * ar(n))
    x = fftfilt(x, lp(cut, 2)) * env_ad(n, .004, dur * .8); k = int(.008 * SR); x[-k:] *= np.linspace(1, 0, k); return x
def supersaw(ch, dur, cut=2600):
    n = int(dur * SR); x = sum(saw(hz(m), n, d) for m in ch for d in (-.008, 0, .009)) / (3 * len(ch))
    t = ar(n); e = np.minimum(1, t / .06) * np.minimum(1, (dur - t) / .15); return fftfilt(x, lp(cut, 2)) * e
def pluck(m, dur=.22, cut=3200):
    n = int(dur * SR); x = saw(hz(m), n) + .5 * saw(hz(m), n, .006); return fftfilt(x, lp(cut, 2)) * env_ad(n, .002, .07)
def riser(dur, g=1.0):
    n = int(dur * SR); t = ar(n); x = R.standard_normal(n); out = np.zeros(n); seg = int(.05 * SR)
    for i in range(0, n, seg):   # ruído em bandas que sobem
        p = i / n; f0 = 400 + 7000 * p ** 2; out[i:i + seg] = fftfilt(x[i:i + seg], band(f0, f0 * 2.2))
    return out * (t / dur) ** 2 * g
def crash(dur=1.8):
    n = int(dur * SR); return fftfilt(R.standard_normal(n), hp(4500, 2)) * env_ad(n, .002, .6)
def snare_roll(t0, t1, g=.5):
    k, t = 0, t0
    while t < t1:
        p = (t - t0) / (t1 - t0); put(DR, clap() * (.25 + .75 * p), t, g * .55, 0, .15)
        t += BEAT / (2 if p < .5 else 4 if p < .8 else 8); k += 1

# ── tempos (palavras reais)
tBast, tInfo, tTar, tSis = wt('flip', 'bastidores'), wt('trinca', 'Informação'), wt('trinca', 'Tarefa'), wt('trinca', 'Sistema')
tProb, tComo = wt('tensao', 'problema'), wt('tensao', 'como'); tSil0, tAgora = S['tensao']['v1'] + .05, wt('virada', 'Agora')
tEnt, tIde, tDes = wt('metodo', 'entende'), wt('metodo', 'identifica'), wt('metodo', 'desenvolve')
tIA, tAut, tInt = wt('conecta', 'Inteligência'), wt('conecta', 'automações'), wt('conecta', 'sistemas')
tFecho, tNeg, tFrente, tSig = S['fecho']['t0'], wt('fecho', 'negócio'), wt('fecho', 'frente'), S['assinatura']['t0']
KICKS = []
DM = [(50, 53, 57), (46, 50, 53), (41, 45, 48), (48, 52, 55)]; DM_R = [38, 34, 29, 36]
UP = [(53, 57, 60, 64), (48, 52, 55, 59), (50, 53, 57, 60), (46, 50, 53, 57)]; UP_R = [41, 36, 38, 34]
def section(t0, t1, prog, roots, kick_on='four', hats='16', claps=True, bass=True, pads=True, arp=True, cut0=900, cut1=2600, lvl=1.0):
    t, bar = t0, 0
    while t < t1 - 1e-6:
        ch, rt = prog[bar % len(prog)], roots[bar % len(roots)]; dur = min(BAR, t1 - t); p = (t - t0) / max(1e-3, t1 - t0)
        cut = cut0 + (cut1 - cut0) * p
        if pads: put(HM, supersaw([m + 12 for m in ch], dur + .05, cut * 1.3), t, .22 * lvl, 0, .35)
        for b in range(8):            # colcheias
            tb = t + b * BEAT / 2
            if tb >= t1 - 1e-6: break
            if b % 2 == 0:
                beat = b // 2
                if kick_on == 'four' or (kick_on == 'half' and beat in (0,)) or (kick_on == 'half' and beat == 1 and False):
                    put(DR, kick(), tb, .55 * lvl); KICKS.append(tb)
                if kick_on == 'half' and beat == 2: put(DR, clap(), tb, .32 * lvl, 0, .2)
                if claps and kick_on == 'four' and beat in (1, 3): put(DR, clap(), tb, .3 * lvl, 0, .18)
            if kick_on == 'half' and b == 3: put(DR, kick(), tb, .45 * lvl); KICKS.append(tb)
            if bass and b % 2 == 1 or (bass and kick_on == 'half'): put(BS, bass_note(rt + (12 if b in (3, 7) and kick_on == 'four' else 0), BEAT / 2 * .9, cut * .5), tb, .34 * lvl)
            if hats in ('8', '16'): put(DR, hat(), tb, .09 * lvl, .25)
            if hats == '16': put(DR, hat(), tb + BEAT / 4, .05 * lvl, -.25)
            if kick_on == 'four' and b % 2 == 1: put(DR, hat(True), tb, .05 * lvl, .1)
        if arp:
            for i, ta in enumerate(np.arange(t, t + dur - 1e-6, BEAT / 4)):
                m = [ch[0], ch[1], ch[2], ch[1] + 12 if len(ch) > 3 else ch[0] + 12][i % 4] + 12
                for k, (dl, gg) in enumerate(((0, 1), (.375, .35), (.75, .15))):   # delay em colcheia pontuada
                    put(HM, pluck(m, .22, cut * 1.4), ta + dl, .075 * gg * lvl, (.3, -.3, .3)[k], .25)
        t += BAR; bar += 1

# ── gancho: pulso contido (a frente "limpa")
for tb in np.arange(0, tBast - .4, BEAT / 2): put(DR, hat(), tb, .04, .2)
put(BS, bass_note(38, tBast - .4, 280), 0, .22); put(HM, supersaw((53, 57, 60), tBast, 1400), 0, .12, 0, .4)
# ── giro: whoosh + impacto no verso
put(FX, riser(.9, .6), tBast - 1.0, 1, 0, .2); put(FX, whoosh(.9), tBast - .4, .25, 0, .3)
put(DR, kick(), tBast + .45, .8); put(FX, boom(1.6), tBast + .45, .45, 0, .3); put(FX, crash(2.0), tBast + .45, .18, 0, .4); KICKS.append(tBast + .45)
ev('GIRO do painel (whoosh) e impacto nos bastidores', tBast + .45)
# ── trinca e tensão: beat escuro em Ré menor, acertos por item
section(tBast + .95, tSil0, DM, DM_R, kick_on='half', hats='8', claps=False, arp=False, cut0=500, cut1=1700, lvl=.85)
for nm, t0 in (('informação espalhada', tInfo), ('tarefa repetida', tTar), ('sistema que não conversa', tSis)):
    put(FX, kick(.9), t0 - .05, .35); put(FX, click(), t0 - .03, .3); ev(nm, t0 - .05)
for j in range(6): put(FX, click(), tTar + .2 + j * .16, .09, (-1) ** j * .3)
put(FX, riser(tSil0 - (tSil0 - 2.2), .7), tSil0 - 2.2, 1, 0, .2); ev('riser para o "Agora"', tSil0 - 2.2)
EV.append((round(tSil0, 2), f'SILÊNCIO ({tAgora - tSil0:.2f} s) antes do "Agora"'))
# ── DROP no "Agora" e groove completo no método e na conexão
put(DR, kick(), tAgora - .02, .8); put(FX, boom(1.8), tAgora - .02, .4, 0, .4); put(FX, crash(2.4), tAgora - .02, .25, 0, .4); KICKS.append(tAgora)
ev('DROP no "Agora"', tAgora)
section(tAgora + BAR / 2, tFecho, UP, UP_R, kick_on='four', hats='16', cut0=1200, cut1=3600)
put(FX, whoosh(1.0), tEnt - .1, .14, 0, .2); ev('entender: scanner', tEnt - .1)
put(FX, bell(84, 1.0), tIde + .3, .06, 0, .4); ev('identificar: gargalo marcado', tIde + .3)
for j in range(4): put(FX, click(), tDes + .1 + j * .1, .15, (-1) ** j * .25)
ev('desenvolver: peças se encaixam', tDes + .1)
for nm, t0 in (('IA', tIA), ('Automação', tAut), ('Integração', tInt)): put(FX, bell(86 + 2 * len(nm) % 5, .9), t0 - .15, .06, 0, .4); ev(f'hub {nm}', t0 - .15)
# ── fecho: breakdown, giro de volta e acerto em "frente"
section(tFecho, tFrente + .2, UP, UP_R, kick_on='none', hats='8', claps=False, bass=False, cut0=2000, cut1=2600, lvl=.8)
put(FX, riser(tNeg - tFecho, .5), tFecho, 1, 0, .2); put(FX, whoosh(.95, up=False), tNeg - .25, .22, 0, .3); ev('GIRO de volta para a frente', tNeg - .25)
put(DR, kick(), tFrente + .2, .8); put(FX, crash(2.0), tFrente + .2, .2, 0, .4); KICKS.append(tFrente + .2); ev('acerto em "frente"', tFrente + .2)
section(tFrente + .2 + BEAT, tSig, UP, UP_R, kick_on='four', hats='16', cut0=3200, cut1=3600)
# ── assinatura
put(DR, kick(), tSig + .1, .7); put(FX, boom(1.4), tSig + .1, .2, 0, .3); KICKS.append(tSig + .1)
put(HM, supersaw((53, 57, 60, 65, 69), DUR - tSig - .1, 2200), tSig + .1, .18, 0, .5); put(BS, bass_note(29, DUR - tSig - .1, 250), tSig + .1, .28)
for i, m in enumerate((77, 81, 84)): put(FX, bell(m, 2.6), tSig + .1 + i * .12, .12, (-.3, 0, .3)[i], .6)
for tb in np.arange(tSig + .1, DUR - 1.2, BEAT / 2): put(DR, hat(), tb, .04 * max(0, 1 - (tb - tSig) / 8), .2)
ev('logo: acorde final e sinos', tSig + .1); ev('CTA', wt('assinatura', 'Comente') - .1)

# ── sidechain (baixo e harmonia "respiram" com o bumbo), reverb, silêncio antes do "Agora"
t = ar(N); sc = np.ones(N)
for tk in KICKS:
    i = int(tk * SR); m = min(N, i + int(.35 * SR)); sc[i:m] = np.minimum(sc[i:m], 1 - .7 * np.exp(-ar(m - i) / .09))
ir = [make_ir(1.8, 91 + c) for c in (0, 1)]
rev = np.stack([conv(SEND[:, c], ir[c]) for c in (0, 1)], 1)
music = DR + (BS + HM) * sc[:, None] + FX + .45 * rev
music = fftfilt(music[:, 0], hp(28, 2))[:, None] * [1, 0] + fftfilt(music[:, 1], hp(28, 2))[:, None] * [0, 1]
mask = np.ones(N); i0, i1 = int(tSil0 * SR), int((tAgora - .03) * SR); mask[i0:i1] = 0
k = int(.03 * SR); mask[i0 - k:i0] = np.linspace(1, 0, k)
music *= mask[:, None] * np.clip(t / .01, 0, 1)[:, None] * np.clip((DUR - t) / .8, 0, 1)[:, None]
music = np.tanh(music * 1.2) / 1.2   # cola leve

# ── nível relativo à voz e ducking
fala = np.zeros(N); vr = []
for s in TL['scenes']:
    fala[int(s['v0'] * SR):int(s['v1'] * SR)] = 1
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32); v = v[np.abs(v) > 1e-3]; vr.append(np.sqrt(np.mean(v ** 2)))
env = np.zeros(N); g = 0.0; aa, rr = np.exp(-1 / (.1 * SR)), np.exp(-1 / (.4 * SR))
for k in range(N):
    c = aa if fala[k] > g else rr; g = c * g + (1 - c) * fala[k]; env[k] = g
mr = np.sqrt(np.mean(music[(fala == 0) & (mask > 0)] ** 2))
music *= np.mean(vr) * 10 ** (-10 / 20) / mr; music *= (10 ** (-6 * env / 20))[:, None]
pk = np.max(np.abs(music))
if pk > .75: music *= .75 / pk
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'{ROOT}/public/assets/audio/trilha.wav'], input=music.astype(np.float32).tobytes(), check=True)
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
with open(f'{ROOT}/out/marcas-som.txt', 'w') as f:
    f.write(f'MARCAS · DME "Bastidores" · {DUR:.2f} s · 30 fps · trilha original v2, eletrônica 120 BPM\n\nFALAS (Lendário, ElevenLabs; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha v2 ok', round(DUR, 2), 's · bumbos', len(KICKS))
