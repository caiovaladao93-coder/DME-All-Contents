"""Gera data.js (linha do tempo + contorno) para o video.html abrir direto do disco, sem servidor."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
tl = json.load(open(f'{ROOT}/timeline.json')); ct = json.load(open(f'{ROOT}/assets/contorno-sala-tv.json'))
open(f'{ROOT}/data.js', 'w').write(f'window.TLDATA = {json.dumps(tl, ensure_ascii=False)};\nwindow.CONTORNO = {json.dumps(ct)};\n')
print('data.js ok')
