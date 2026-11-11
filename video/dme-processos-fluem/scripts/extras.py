"""Narração final em arquivo separado (falas nas posições da timeline) e legendas SRT a partir dos blocos de legenda."""
import json, subprocess
import numpy as np
ROOT = __file__.rsplit('/scripts/', 1)[0]; SR = 48000
TL = json.load(open(f'{ROOT}/src/data/timeline.json')); N = int(TL['frames'] / 30 * SR); voz = np.zeros(N)
for s in TL['scenes']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{ROOT}/public/assets/audio/falas/{s['fala']}.mp3", '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, np.float32).astype(np.float64); i = int(round(s['v0'] * 30)) / 30 * SR; i = int(i); voz[i:i + len(y)] += y[:N - i]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(SR), f'{ROOT}/out/DME-Processos-Que-Fluem-narracao.wav'], input=voz.tobytes(), check=True)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
open(f'{ROOT}/out/DME-Processos-Que-Fluem-Reels.srt', 'w').write('\n'.join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(TL['captions'], 1)))
print('narração e SRT ok')
