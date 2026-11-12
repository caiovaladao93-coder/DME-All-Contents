"""Trilha ORIGINAL (adaptada da peça DME Processos que fluem) (numpy, sem amostras de terceiros) — W-EV · apresentação. Eletrônica a 120 BPM.
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

def brand(name):   # sons e vinheta da própria W-EV (repositório do cliente)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/public/assets/audio/marca/{name}.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def put2(buf, sig, t0, g=1.0):
    i = int(round(t0 * SR)); j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g

# ── tempos (palavras reais)
tProx, tElet = wt('abertura', 'próximo'), wt('abertura', 'elétrico')
tC0, tDir, tEne, tOpe = S['conecta']['t0'], wt('conecta', 'dirige'), wt('conecta', 'energia'), wt('conecta', 'opera')
tMot, tMapa, tQr, tVal, tAco, tFim = S['motorista']['t0'], wt('motorista', 'encontre'), wt('motorista', 'leia'), wt('motorista', 'escolha'), wt('motorista', 'acompanhe'), wt('motorista', 'fim')
tPar, tVen, tRep = S['parceiros']['t0'], wt('parceiros', 'vendas'), wt('parceiros', 'repasses')
tOp, OPW = S['operacao']['t0'], [wt('operacao', w) for w in ('estações', 'sessões', 'financeiro', 'auditoria')]
tJor, tUma, tMuitas, tSig = S['jornadas']['t0'], wt('jornadas', 'Uma'), wt('jornadas', 'Muitas'), S['assinatura']['t0']
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

# ── abertura: pulso e riser até "elétrico", impacto brilhante
put(FX, riser(tElet, .45), 0, 1, 0, .2); ev('riser de abertura', 0)
put(BS, bass_note(29, tElet, 260), 0, .25)
for tb in np.arange(.5, tElet, BEAT / 2): put(DR, hat(), tb, .04 + .05 * tb / tElet, .2)
put(DR, kick(), tElet, .8); put(FX, boom(1.6), tElet, .4, 0, .3); put(FX, crash(2.2), tElet, .2, 0, .4); KICKS.append(tElet); ev('IMPACTO em "elétrico"', tElet)
# ── rede: groove contido e arpejo, filtro abrindo
section(tElet + BEAT, tMot, UP, UP_R, kick_on='half', hats='8', claps=False, arp=True, cut0=700, cut1=2000, lvl=.8)
for nm, t0 in (('nó Motorista', tDir), ('nó Parceiros', tEne), ('nó Operação', tOpe)): put(FX, bell(86, .9), t0 - .2, .05, 0, .4); ev(nm, t0 - .2)
put(FX, riser(1.6, .5), tMot - 1.6, 1, 0, .2)
# ── motorista, parceiros e operação: groove completo com os sons do app W-EV
put(DR, kick(), tMot, .75); put(FX, crash(1.8), tMot, .16, 0, .4); KICKS.append(tMot); ev('groove completo (Fá–Dó–Rém–Si♭)', tMot)
section(tMot, tJor, UP, UP_R, kick_on='four', hats='16', cut0=1600, cut1=3600)
put2(FX, brand('update'), tMapa + .5, .5); ev('som W-EV "update" (mapa)', tMapa + .5)
put2(FX, brand('confirmation'), tQr + 1.25, .55); ev('som W-EV "confirmation" (conector identificado)', tQr + 1.25)
put2(FX, brand('charging-start'), tAco, .55); ev('som W-EV "charging-start" (recarga)', tAco)
put2(FX, brand('complete'), tFim, .55); ev('som W-EV "complete" (comprovante)', tFim)
for nm, t0 in (('vendas', tVen), ('repasse', tRep)): put(FX, bell(88, .8), t0, .05, 0, .3); ev(nm, t0)
for j, t0 in enumerate(OPW): put(FX, click(), t0 - .1, .15, (-.3, .3, -.3, .3)[j]); ev(f'painel {j + 1} do console', t0 - .1)
# ── jornadas: breakdown e acerto em "Muitas"
section(tJor, tMuitas - .05, UP, UP_R, kick_on='none', hats='none', claps=False, bass=False, cut0=2200, cut1=2600, lvl=.8)
put(FX, riser(tMuitas - tJor, .6), tJor, 1, 0, .2); put(DR, kick(), tMuitas, .8); put(FX, crash(2.0), tMuitas, .2, 0, .4); KICKS.append(tMuitas); ev('acerto em "Muitas jornadas"', tMuitas)
section(tMuitas + BEAT, tSig, UP, UP_R, kick_on='four', hats='16', cut0=3400, cut1=3600)
# ── assinatura: vinheta oficial W-EV + acorde final
put2(FX, brand('wev-intro'), tSig + .05, .9); ev('vinheta W-EV (wev-intro, do repositório do cliente)', tSig + .05)
put(HM, supersaw((53, 57, 60, 65, 69), DUR - tSig - .3, 2000), tSig + .3, .12, 0, .5); put(BS, bass_note(29, DUR - tSig - .3, 240), tSig + .3, .22)
KICKS.append(tSig + .05)

# ── sidechain (baixo e harmonia "respiram" com o bumbo), reverb, silêncio antes do "Agora"
t = ar(N); sc = np.ones(N)
for tk in KICKS:
    i = int(tk * SR); m = min(N, i + int(.35 * SR)); sc[i:m] = np.minimum(sc[i:m], 1 - .7 * np.exp(-ar(m - i) / .09))
ir = [make_ir(1.8, 91 + c) for c in (0, 1)]
rev = np.stack([conv(SEND[:, c], ir[c]) for c in (0, 1)], 1)
music = DR + (BS + HM) * sc[:, None] + FX + .45 * rev
music = fftfilt(music[:, 0], hp(28, 2))[:, None] * [1, 0] + fftfilt(music[:, 1], hp(28, 2))[:, None] * [0, 1]
mask = np.ones(N)
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
    f.write(f'MARCAS · W-EV apresentação · {DUR:.2f} s · 30 fps · trilha original eletrônica 120 BPM + vinheta e sons do app W-EV\n\nFALAS (Lendário, ElevenLabs; respirações removidas)\n')
    for s in TL['scenes']: f.write(f"{s['v0']:6.2f}–{s['v1']:6.2f}  [{s['key']}] {LEG[s['fala']]}\n")
    f.write('\nTRILHA E EFEITOS\n')
    for t0, nm in sorted(EV): f.write(f'{t0:6.2f}  {nm}\n')
print('trilha v2 ok', round(DUR, 2), 's · bumbos', len(KICKS))
