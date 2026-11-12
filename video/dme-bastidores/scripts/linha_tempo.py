"""timeline.json a partir das falas REAIS (Lendário, sem aceleração): cenas, entrada da voz, palavras e blocos do SRT.
Ritmo de 120 BPM (batida de 0,5 s); a montagem visual se ancora nas palavras, não em tempos fixos."""
import json, re
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS = 30
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
# (cena, fala, entrada da voz depois do início da cena, respiro depois da fala, duração mínima da cena)
PLAN = [('gancho', 'n1', .15, .45, 0), ('flip', 'n2', .4, .3, 0), ('trinca', 'n3', .1, .35, 0), ('tensao', 'n4', .1, .15, 0),
        ('virada', 'n5', .3, .35, 0), ('metodo', 'n6', .1, .35, 0), ('conecta', 'n7', .1, .5, 2.6), ('fecho', 'n8', .15, .5, 0), ('assinatura', 'n9', .3, 1.4, 0)]
QUEBRAS = {'n2': ['bastidores,'], 'n3': ['espalhada.', 'repetida.'], 'n4': ['tecnologia.'], 'n6': ['operação,', 'gargalos'], 'n8': ['bastidores,'], 'n9': ['Technology.', 'tempo.']}
t, scenes, words, caps = 0.0, [], {}, []
for key, fid, lead, tail, mn in PLAN:
    a = json.load(open(f'{ROOT}/src/data/voz/{fid}.json'))['alignment']; dur = a['character_end_times_seconds'][-1]
    v0 = t + lead; end = max(t + mn, v0 + dur + tail)
    ws, cur, st, en = [], '', 0, 0
    for i, ch in enumerate(a['characters']):
        if ch == ' ':
            if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)])
            cur = ''; continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += ch; en = a['character_end_times_seconds'][i]
    if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)])
    ws = [w for w in ws if not (w[0].startswith('<') or w[0].startswith('time=') or w[0] == '/>')]  # marcações <break>
    disp = [[re.sub(r'^Dê-Eme-É', 'DME', w[0]).replace('comercial', 'COMERCIAL'), w[1], w[2]] for w in ws]
    block = []
    for j, w in enumerate(disp):
        block.append(w)
        if j == len(disp) - 1 or w[0] in QUEBRAS.get(fid, []) or (fid not in QUEBRAS and re.search(r'[.]$', w[0]) and fid in ('n2', 'n3')):
            caps.append({'start': block[0][1], 'end': round(block[-1][2] + .25, 3), 'text': ' '.join(x[0] for x in block), 'scene': key}); block = []
    scenes.append({'key': key, 'fala': fid, 't0': round(t, 3), 't1': round(end, 3), 'v0': round(v0, 3), 'v1': round(v0 + dur, 3), 'texto': LEG[fid]})
    words[key] = ws; t = end
for a, b in zip(caps, caps[1:]): a['end'] = min(a['end'], b['start'])
total = round(round(t * FPS) / FPS, 3)
json.dump({'fps': FPS, 'dur': total, 'frames': round(total * FPS), 'scenes': scenes, 'words': words, 'captions': caps}, open(f'{ROOT}/src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
for s in scenes: print(f"{s['key']:11s} {s['t0']:6.2f}–{s['t1']:6.2f}  voz {s['v0']:6.2f}–{s['v1']:6.2f}")
print('duração', total, 's ·', round(total * FPS), 'quadros')
for k, ws in words.items(): print(' ', k, ' '.join(f'{w[0]}@{w[1]:.2f}' for w in ws))
