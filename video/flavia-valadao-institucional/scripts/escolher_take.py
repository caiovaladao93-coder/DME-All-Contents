"""Escolhe, por medição, a tomada mais limpa de cada fala (ruído nas pausas, chiado agudo, cliques).
Uso: python3 scripts/escolher_take.py cena1,cena2 [--aplicar]   (sem --aplicar só mostra a tabela)"""
import json, subprocess, sys, glob, os, shutil
import numpy as np
D = 'voz'
SR = 44100

def load(mp3):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

def db(x): return 20 * np.log10(max(1e-9, float(np.sqrt(np.mean(np.square(x)))))) if len(x) else -120.0

def metrics(mp3, js):
    a = json.load(open(js))['alignment']; x = load(mp3)
    ch, t0, t1 = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    gaps = [(0.0, t0[0] - 0.03)]
    for i, c in enumerate(ch):
        if c == ' ' and t1[i] - t0[i] > 0.08: gaps.append((t0[i] + 0.02, t1[i] - 0.02))
    seg = np.concatenate([x[int(s * SR):int(e * SR)] for s, e in gaps if e - s > 0.03] or [np.zeros(1)])
    voiced = x[int(t0[0] * SR):int(t1[-1] * SR)]
    # chiado: energia acima de 9 kHz relativa ao total (espectro médio)
    n = 2048; fr = [voiced[i:i + n] * np.hanning(n) for i in range(0, len(voiced) - n, n)]
    S = np.mean([np.abs(np.fft.rfft(f)) ** 2 for f in fr], axis=0); fq = np.fft.rfftfreq(n, 1 / SR)
    hf = 10 * np.log10(S[fq > 9000].sum() / S.sum())
    d = np.abs(np.diff(x)); clicks = int(np.sum(d > 8 * (np.percentile(d, 99.5) + 1e-6)))
    return {'pausas_dB': round(db(seg), 1), 'chiado_dB': round(hf, 1), 'cliques': clicks, 'dur': round(t1[-1], 2)}

cenas = sys.argv[1].split(','); aplicar = '--aplicar' in sys.argv
for c in cenas:
    rows = []
    if os.path.exists(f'{D}/{c}.mp3') and not aplicar:
        print(c, 'ATUAL', metrics(f'{D}/{c}.mp3', f'{D}/{c}.json'))
    for mp3 in sorted(glob.glob(f'{D}/takes/{c}-*.mp3')):
        m = metrics(mp3, mp3[:-4] + '.json'); rows.append((mp3, m)); print(c, os.path.basename(mp3), m)
    if not rows: continue
    # critério: chiado agudo primeiro (foi o defeito relatado), depois ruído nas pausas e cliques.
    # --forcar=cena:N escolhe a tomada N (ex.: a mais pausada quando todas estão limpas).
    forc = dict(x.split(':') for x in (next((a.split('=')[1] for a in sys.argv if a.startswith('--forcar=')), '') or '').split(',') if ':' in x)
    if c in forc: best = f'{D}/takes/{c}-{forc[c]}.mp3'
    else: best = min(rows, key=lambda r: (round(r[1]['chiado_dB'] / 2), r[1]['cliques'], r[1]['pausas_dB']))[0]
    print('  →', c, 'escolhida:', os.path.basename(best))
    if aplicar:
        shutil.copy(best, f'{D}/{c}.mp3'); shutil.copy(best[:-4] + '.json', f'{D}/{c}.json')
