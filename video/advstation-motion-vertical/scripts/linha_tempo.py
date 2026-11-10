"""Linha do tempo de 68,0 s (2.040 quadros) a partir das falas REAIS (voz Guilherme, sem aceleração).
Blocos do storyboard ajustados à voz medida. Saída: timeline.json (blocos, falas, palavras e legendas)."""
import json, re
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS, DUR = 30, 68.0
BLOCOS = [('caminho', 0.0, 6.2), ('rotina', 6.2, 17.6), ('organizacao', 17.6, 29.4), ('maternidade', 29.4, 36.3),
          ('previdenciario', 36.3, 46.0), ('visao', 46.0, 55.8), ('assinatura', 55.8, DUR)]
FALAS = [('a1', 0.60), ('a2', 6.40), ('a3', 12.40), ('a4', 18.00), ('a5', 29.60), ('a6', 36.60), ('a7', 46.20), ('a8', 56.00), ('a9', 62.20)]
QUEBRAS = {'a2': ['etapas'], 'a3': ['gestão'], 'a5': ['voltado'], 'a4': ['informações,', 'casos', 'equipe.'], 'a6': ['aposentadorias,'], 'a7': ['rotinas,', 'gestão.', 'organização.'],
           'a8': ['centro.']}
falas, words, caps = [], {}, []
for fid, v0 in FALAS:
    a = json.load(open(f'{ROOT}/voz/{fid}.json'))['alignment']; ch = a['characters']
    ws, cur, st, en = [], '', 0, 0
    for i, c in enumerate(ch):
        if c == ' ':
            if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)]); cur = ''
            continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += c; en = a['character_end_times_seconds'][i]
    if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)])
    words[fid] = ws; falas.append({'fala': fid, 'v0': v0, 'v1': round(v0 + a['character_end_times_seconds'][-1], 3)})
    blk = []
    for j, w in enumerate(ws):
        blk.append(w)
        if j == len(ws) - 1 or w[0] in QUEBRAS.get(fid, []):
            caps.append({'start': blk[0][1], 'end': round(blk[-1][2] + .35, 3), 'text': ' '.join(x[0] for x in blk)}); blk = []
for x, y in zip(caps, caps[1:]): x['end'] = min(x['end'], y['start'])
for x, y in zip(falas, falas[1:]): assert x['v1'] < y['v0'] - .15, ('falas sobrepostas', x, y)
assert falas[-1]['v1'] <= DUR - 2.5, 'reserve pelo menos 2,5 s de assinatura sem fala'
json.dump({'fps': FPS, 'dur': DUR, 'frames': round(DUR * FPS), 'blocks': [dict(zip(('key', 't0', 't1'), b)) for b in BLOCOS], 'falas': falas, 'words': words, 'captions': caps},
          open(f'{ROOT}/timeline.json', 'w'), ensure_ascii=False, indent=1)
for f in falas: print(f"{f['fala']}  {f['v0']:6.2f}–{f['v1']:6.2f}")
for c in caps: print(f"  {c['start']:6.2f}–{c['end']:6.2f} {c['text']}")
print('total', DUR, 's ·', round(DUR * FPS), 'quadros')
