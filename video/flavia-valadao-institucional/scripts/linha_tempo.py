"""Linha do tempo de 29,0 s (870 quadros) a partir das falas REAIS, sem acelerar a voz.
Cada fala entra no bloco do storyboard; as quebras de legenda seguem unidades de sentido (no máximo 2 linhas).
Saída: timeline.json (blocos, entrada de cada fala, palavras e legendas)."""
import json
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS, DUR = 30, 29.0
# (bloco, início, fim, fala, entrada da voz)
PLAN = [('detalhe', 0.0, 4.0, 'f1', 0.50), ('intencao', 4.0, 10.0, 'f2', 3.75), ('escolhas', 10.0, 16.6, 'f3', 9.40),
        ('conjunto', 16.6, 21.6, 'f4', 17.90), ('assinatura', 21.6, DUR, 'f5', 20.60)]
QUEBRAS = {'f2': ['Interiores,'], 'f3': ['composição'], 'f5': ['Interiores.', 'espaço.']}
blocks, words, caps = [], {}, []
for key, b0, b1, fid, v0 in PLAN:
    a = json.load(open(f'{ROOT}/voz/{fid}.json'))['alignment']; ch = a['characters']
    ws, cur, st, en = [], '', 0, 0
    for i, c in enumerate(ch):
        if c == ' ':
            if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)]); cur = ''
            continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += c; en = a['character_end_times_seconds'][i]
    if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)])
    words[key] = ws; dur = a['character_end_times_seconds'][-1]
    blocks.append({'key': key, 't0': b0, 't1': b1, 'fala': fid, 'v0': v0, 'v1': round(v0 + dur, 3)})
    blk = []
    for j, w in enumerate(ws):
        blk.append(w)
        if j == len(ws) - 1 or w[0] in QUEBRAS.get(fid, []):
            caps.append({'start': blk[0][1], 'end': round(blk[-1][2] + .35, 3), 'text': ' '.join(x[0] for x in blk), 'bloco': key}); blk = []
for x, y in zip(caps, caps[1:]): x['end'] = min(x['end'], y['start'])
caps[-1]['end'] = DUR
assert blocks[-1]['v1'] <= DUR - .25, 'a última fala precisa terminar antes do fim'
json.dump({'fps': FPS, 'dur': DUR, 'frames': round(DUR * FPS), 'blocks': blocks, 'words': words, 'captions': caps}, open(f'{ROOT}/timeline.json', 'w'), ensure_ascii=False, indent=1)
for b in blocks: print(f"{b['key']:11s} {b['t0']:5.2f}–{b['t1']:5.2f}  voz {b['v0']:5.2f}–{b['v1']:5.2f}")
for c in caps: print(f"  {c['start']:5.2f}–{c['end']:5.2f} {c['text']}")
print('total', DUR, 's ·', round(DUR * FPS), 'quadros')
