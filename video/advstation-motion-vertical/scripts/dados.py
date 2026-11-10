"""Gera data.js (linha do tempo) para o video.html abrir direto do disco, sem servidor."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
open(f'{ROOT}/data.js', 'w').write(f"window.TLDATA = {json.dumps(json.load(open(f'{ROOT}/timeline.json')), ensure_ascii=False)};\n")
print('data.js ok')
