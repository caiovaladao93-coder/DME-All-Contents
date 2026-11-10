"""Troca só a frase "DME Technology." da fala n7 por uma tomada mais suave (voz/takes/marca/<id>),
emendando na pausa antes de "Tecnologia". O volume da marca é igualado ao da fala. Também gera o alinhamento combinado.
Uso: python3 scripts/emendar_marca.py a2 voz/takes/n7-6"""
import json, subprocess, sys
import numpy as np
SR = 44100
mk, base = sys.argv[1], sys.argv[2]
def load(f): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
A = json.load(open(f'voz/takes/marca/{mk}.json')); B = json.load(open(f'{base}.json'))
xa, xb = load(f'voz/takes/marca/{mk}.mp3'), load(f'{base}.mp3')
ca, cb = ''.join(A['alignment']['characters']), ''.join(B['alignment']['characters'])
ea = A['alignment']['character_end_times_seconds'][len(ca.rstrip()) - 1] + .10          # fim de "Technology." + cauda
jb = cb.index('Tecnologia'); sb = B['alignment']['character_start_times_seconds'][jb] - .06  # um pouco antes de "Tecnologia"
def rms(x): v = x[np.abs(x) > 1e-3]; return np.sqrt(np.mean(v ** 2))
ga = rms(xb[int(sb * SR):]) / rms(xa[:int(ea * SR)])
seg_a = xa[:int(ea * SR)] * ga; seg_b = xb[int(sb * SR):]
fade = int(.012 * SR); seg_a[-fade:] *= np.linspace(1, 0, fade); seg_b[:fade] *= np.linspace(0, 1, fade)
gap = np.zeros(int(.16 * SR))
y = np.concatenate([seg_a, gap, seg_b])
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', 'voz/n7.mp3'], input=y.tobytes(), check=True)
off = len(seg_a) / SR + len(gap) / SR - sb
al = {k: [] for k in ('characters', 'character_start_times_seconds', 'character_end_times_seconds')}
na = len(ca.rstrip())
for i in range(na):
    for k in al: al[k].append(A['alignment'][k][i])
al['characters'].append(' '); al['character_start_times_seconds'].append(ea); al['character_end_times_seconds'].append(off + B['alignment']['character_start_times_seconds'][jb])
for i in range(jb, len(cb)):
    al['characters'].append(cb[i]); al['character_start_times_seconds'].append(B['alignment']['character_start_times_seconds'][i] + off); al['character_end_times_seconds'].append(B['alignment']['character_end_times_seconds'][i] + off)
json.dump({'voice_id': A['voice_id'], 'model_id': A['model_id'], 'text': ''.join(al['characters']), 'emenda': {'marca': mk, 'resto': base, 'ganho_marca': round(ga, 3)}, 'alignment': al}, open('voz/n7.json', 'w'), ensure_ascii=False, indent=1)
print('emenda ok · ganho da marca %.2f · duração %.2f s' % (ga, len(y) / SR))
