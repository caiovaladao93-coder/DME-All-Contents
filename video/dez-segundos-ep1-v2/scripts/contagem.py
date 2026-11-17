"""Contagem da delegada (1 a 10), recortada da tomada única 'dc' (gerar "Um." sozinho saía como "Hum").
Etapa 1 (antes da linha do tempo): grava a fala c1 ("Um.") em voz/, src/data/voz e public/assets/audio/falas.
Etapa 2 (depois da linha do tempo): monta public/assets/audio/contagem.wav com "Dois"…"Dez", um por segundo depois do "Um".
Todos os números com o filtro de voz atrás da porta."""
import json, os, subprocess, sys
import numpy as np
ROOT = __file__.rsplit('/scripts/', 1)[0]; SR = 44100; TAKE = 1
PORTA = 'lowpass=f=2300,highpass=f=140,volume=1.25'
d = json.load(open(f'{ROOT}/voz/takes/dc-{TAKE}.json')); a = d['alignment']; ch, st, en = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/voz/takes/dc-{TAKE}.mp3', '-ac', '1', '-ar', str(SR), '-af', PORTA, '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
words, cur, i0 = [], '', 0
for i, c in enumerate(ch + [' ']):
    if c == ' ' or c == '<':
        if cur and cur[0].isalpha(): words.append((cur, st[i0], en[i - 1]))
        cur = ''; continue
    if not cur: i0 = i
    cur += c
nums = [w for w in words if w[0].rstrip('.').lower() in ('um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez')]
assert len(nums) == 10, nums
def clip(w):
    s0, s1 = max(0, int((w[1] - .03) * SR)), min(len(x), int((w[2] + .14) * SR)); y = x[s0:s1].copy(); f = int(.03 * SR); y[-f:] *= np.linspace(1, 0, f); return y, w[1] - s0 / SR
def mp3(y, path): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', path], input=y.astype(np.float32).tobytes(), check=True)
tl = f'{ROOT}/src/data/timeline.json'
if sys.argv[1:] == ['1']:
    y, off = clip(nums[0]); dur = nums[0][2] - nums[0][1]
    for pth in (f'{ROOT}/voz/c1.mp3', f'{ROOT}/public/assets/audio/falas/c1.mp3'): mp3(y, pth)
    js = {'voice_id': d['voice_id'], 'text': 'Um.', 'origem': f'dc-{TAKE}', 'alignment': {'characters': list('Um.'), 'character_start_times_seconds': [off, off + dur * .5, off + dur], 'character_end_times_seconds': [off + dur * .5, off + dur, off + dur]}}
    for pth in (f'{ROOT}/voz/c1.json', f'{ROOT}/src/data/voz/c1.json'): json.dump(js, open(pth, 'w'), ensure_ascii=False, indent=1)
    print('c1 ok', [w[0] for w in nums])
else:
    T = json.load(open(tl)); um = next(s for s in T['scenes'] if s['key'] == 'um'); t0 = um['v0'] + json.load(open(f'{ROOT}/src/data/voz/c1.json'))['alignment']['character_start_times_seconds'][0]
    N = int(T['frames'] / 30 * SR); out = np.zeros(N); marks = []
    for k, w in enumerate(nums[1:], 2):
        y, off = clip(w); i = int((t0 + (k - 1) - off) * SR); out[i:i + len(y)] += y[:N - i]; marks.append((k, round(t0 + k - 1, 2)))
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', f'{ROOT}/public/assets/audio/contagem.wav'], input=out.tobytes(), check=True)
    json.dump({'um': round(t0, 3), 'numeros': marks}, open(f'{ROOT}/src/data/contagem.json', 'w'))
    print('contagem ok', marks)
