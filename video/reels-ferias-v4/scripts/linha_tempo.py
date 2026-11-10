"""Monta timeline.json: início/fim de cada cena e de cada palavra falada (tempo de saída), a partir das falas reais."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
FALAS = {x['id']: x for x in json.load(open(f'{ROOT}/voz/falas.json'))}
# (cena, fala, entrada da voz após o início da cena, respiro depois da fala, duração mínima)
PLAN = [('hook', 'f01', .08, .32, 2.4), ('trinca', 'f02', .10, .30, 3.2), ('gargalo', 'f03', .10, .62, 2.6), ('agora', 'f04', .12, .30, 2.3),
        ('fluxo', 'f05', .12, .30, 2.4), ('metodo', 'f06', .10, .30, 3.6), ('auto', 'f07', .10, .28, 2.3), ('dias', 'f08', .10, .40, 2.0),
        ('verbos', 'f09', .10, .25, 3.9), ('fecho', 'f10', .10, .30, 3.9), ('loop', 'f11', .10, .30, 2.4), ('logo', 'f12', .45, .55, 3.5)]
t, scenes, words = 0.0, [], {}
for key, fid, lead, tail, mn in PLAN:
    a = json.load(open(f'{ROOT}/voz/final/{fid}.json'))['alignment']
    dur = a['character_end_times_seconds'][-1]
    v0 = t + lead
    end = max(t + mn, v0 + dur + tail)
    ws, cur, st = [], '', 0
    for i, ch in enumerate(a['characters']):
        if ch == ' ':
            if cur: ws.append([cur, round(v0 + st, 3)])
            cur = ''; continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += ch
    if cur: ws.append([cur, round(v0 + st, 3)])
    scenes.append({'key': key, 'fala': fid, 't0': round(t, 3), 't1': round(end, 3), 'v0': round(v0, 3), 'v1': round(v0 + dur, 3),
                   'texto': FALAS[fid].get('legenda', FALAS[fid]['text'])})
    words[key] = ws
    t = end
json.dump({'dur': round(t, 3), 'scenes': scenes, 'words': words}, open(f'{ROOT}/src/timeline.json', 'w'), ensure_ascii=False, indent=1)
for s in scenes: print(f"{s['key']:8s} {s['t0']:6.2f}–{s['t1']:6.2f}  voz {s['v0']:6.2f}–{s['v1']:6.2f}  {s['texto']}")
print('duração', round(t, 2))
