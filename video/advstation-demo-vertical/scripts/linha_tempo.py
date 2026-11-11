"""Linha do tempo de 68,0 s (2.040 quadros) a partir das falas REAIS (voz Guilherme, sem aceleração).
Vinheta padrão no início (0–3,9 s, jingle oficial) e no fim (62,5–68,0 s, com a fala da assinatura).
Saída: src/data/timeline.json (blocos, falas, palavras e legendas)."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS, DUR = 30, 68.0
VIN0, VIN1 = (0.0, 3.9), (62.5, DUR)
BLOCOS = [('vinheta', 0.0, 3.9), ('contexto', 3.9, 14.3), ('ml_clientes', 14.3, 23.0), ('ml_etapas', 23.0, 30.3),
          ('pg', 30.3, 43.6), ('gerencial', 43.6, 49.2), ('portfolio', 49.2, 62.5), ('assinatura', 62.5, DUR)]
FALAS = [('v1', 4.25), ('v2', 8.15), ('v3', 14.6), ('v4', 23.3), ('v5', 30.6), ('v6', 38.1), ('v7', 43.9), ('v8', 49.5), ('v9', 56.7), ('v10', 63.75)]
QUEBRAS = {'v2': ['gestão'], 'v3': ['clientes', 'etapas'], 'v4': ['desfecho,'], 'v5': ['demandas,'], 'v6': ['incapacidade,'], 'v8': ['especializadas'], 'v9': ['centro.']}
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
for x, y in zip(falas, falas[1:]): assert x['v1'] < y['v0'] - .2, ('falas sobrepostas', x, y)
assert falas[-1]['v1'] <= DUR - 1.5
json.dump({'fps': FPS, 'dur': DUR, 'frames': round(DUR * FPS), 'blocks': [dict(zip(('key', 't0', 't1'), b)) for b in BLOCOS], 'falas': falas, 'words': words, 'captions': caps},
          open(f'{ROOT}/src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
for f in falas: print(f"{f['fala']:4s} {f['v0']:6.2f}–{f['v1']:6.2f}")
for c in caps: print(f"  {c['start']:6.2f}–{c['end']:6.2f} {c['text']}")
