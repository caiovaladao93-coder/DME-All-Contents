"""Gera out/ADV-Station-Apresentacao-Vertical.srt e .vtt com os tempos reais das falas (alinhamento ElevenLabs, escalado pelo atempo)."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
def ts(x, sep=','):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'
acc, srt, vtt, n = 0, [], ['WEBVTT', ''], 0
for s in TL['scenes']:
    if s['voice'] is not None:
        d = json.load(open(f"{ROOT}/src/data/voz/{s['key']}.json")); a = d['alignment']
        t0 = (acc + s['voice']) / TL['fps']; a0, a1 = t0 + a['character_start_times_seconds'][0], t0 + a['character_end_times_seconds'][-1] + .25
        n += 1
        srt.append(f"{n}\n{ts(a0)} --> {ts(a1)}\n{d['text']}\n")
        vtt += [f"{ts(a0, '.')} --> {ts(a1, '.')}", d['text'], '']
    acc += s['dur']
open(f'{ROOT}/out/ADV-Station-Apresentacao-Vertical.srt', 'w').write('\n'.join(srt))
open(f'{ROOT}/out/ADV-Station-Apresentacao-Vertical.vtt', 'w').write('\n'.join(vtt))
print(n, 'falas')
