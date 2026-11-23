"""Tempos por palavra da tomada escolhida (alinhamento por caractere da ElevenLabs) → voz/palavras.json. Ignora as tags <break>."""
import json, re, sys
TOMADA = sys.argv[1] if len(sys.argv) > 1 else 'voz/takes/ep1-2.json'
A = json.load(open(TOMADA))['alignment']
ch, t0, t1 = A['characters'], A['character_start_times_seconds'], A['character_end_times_seconds']
txt = ''.join(ch); out = []
for m in re.finditer(r'<[^>]*>|[^\s<]+', txt):
    if m.group().startswith('<'): continue
    i, j = m.start(), m.end() - 1
    out.append({'w': m.group(), 'a': round(t0[i], 3), 'b': round(t1[j], 3)})
json.dump(out, open(sys.argv[2] if len(sys.argv) > 2 else 'voz/palavras.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'palavras ·', out[-1]['b'], 's'); print(' '.join(f"{p['w']}@{p['a']:.1f}" for p in out))
