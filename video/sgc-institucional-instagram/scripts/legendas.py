"""Gera out/SGC-Institucional-Vertical.srt com os tempos reais das falas (alinhamento da ElevenLabs)."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
ts = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}"
acc, out = 0, []
for i, s in enumerate(TL['scenes'], 1):
    a = json.load(open(f"{ROOT}/src/data/voz/{s['key']}.json"))['alignment']
    t0 = (acc + s['voice']) / TL['fps']
    out.append(f"{i}\n{ts(t0 + a['character_start_times_seconds'][0])} --> {ts(t0 + a['character_end_times_seconds'][-1] + .3)}\n{LEG[s['key']]}\n")
    acc += s['dur']
open(f'{ROOT}/out/SGC-Institucional-Vertical.srt', 'w').write('\n'.join(out))
print(open(f'{ROOT}/out/SGC-Institucional-Vertical.srt').read())
