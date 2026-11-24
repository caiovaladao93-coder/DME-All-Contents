"""Encurta as pausas longas da tomada (pausa máxima PMAX, exceto onde o roteiro pede respiro) e recalcula os tempos por palavra.
Entrada: voz/takes/<tomada>.mp3/.json → saída: voz/narracao.wav e voz/palavras.json"""
import json, re, subprocess, sys
import numpy as np
SR = 48000; TOM = sys.argv[1] if len(sys.argv) > 1 else 'ep1v3-2'
SAIDA = sys.argv[2] if len(sys.argv) > 2 else 'voz'            # pasta de saída (ep. 2: voz/ep2)
PMAX = .32
LONGAS = {'Uma': .45, 'Mas,': .7, 'Mas': .7, 'A': .55, 'Cada': .6, 'Segue': .45} if SAIDA == 'voz' else {'Mas': .75, 'E': .45, 'Segue': .5, 'ninguém': .45}   # pausa antes destas palavras (primeira ocorrência após frase)
A = json.load(open(f'voz/takes/{TOM}.json'))['alignment']
ch, t0, t1 = A['characters'], A['character_start_times_seconds'], A['character_end_times_seconds']
txt = ''.join(ch); pal = []
for m in re.finditer(r'<[^>]*>|[^\s<]+', txt):
    if m.group().startswith('<'): continue
    pal.append([m.group(), t0[m.start()], t1[m.end() - 1]])
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'voz/takes/{TOM}.mp3', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
partes, novo, cur, desl = [], [], 0.0, 0.0
for i, (w, a, b) in enumerate(pal):
    if i > 0:
        gap = a - pal[i - 1][2]
        fim_frase = pal[i - 1][0][-1] in '.…'
        alvo = LONGAS.get(w, PMAX) if fim_frase else PMAX
        if gap > alvo + .05:
            # corta o meio da pausa, mantendo .12 s depois da palavra anterior
            c0 = pal[i - 1][2] + .12; c1 = c0 + (gap - alvo)
            partes.append((c0, c1))
for c0, c1 in partes: pass
mask = np.ones(len(x), bool)
for c0, c1 in partes: mask[int(c0 * SR):int(c1 * SR)] = False
def mapa(t): return t - sum(min(c1, t) - c0 for c0, c1 in partes if t > c0)
y = x[mask]
fade = int(.01 * SR)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', f'{SAIDA}/narracao.wav'], input=y.tobytes(), check=True)
out = [{'w': w, 'a': round(mapa(a), 3), 'b': round(mapa(b), 3)} for w, a, b in pal]
json.dump(out, open(f'{SAIDA}/palavras.json', 'w'), ensure_ascii=False, indent=0)
print(TOM, len(x) / SR, '→', round(len(y) / SR, 2), 's ·', len(partes), 'cortes')
for i, p in enumerate(out): print(i, p['w'], p['a'], end=' | ')
