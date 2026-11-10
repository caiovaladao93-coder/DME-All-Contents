"""timeline.json a partir das falas REAIS (sem aceleração): início de cada cena, entrada da voz, palavras e blocos de legenda."""
import json, re
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS = 30
LEG = {x['id']: x.get('legenda', x['text']) for x in json.load(open(f'{ROOT}/voz/falas.json'))}
# (cena, fala, entrada da voz, respiro depois, duração mínima)
PLAN = [('ferias', 'n1', .30, .20, 0), ('areas', 'n2', .06, .35, 0), ('viaja', 'n3', .06, .55, 0),
        ('estrutura', 'n4', .06, .15, 0), ('beneficios', 'n5', .06, .15, 0), ('tranquilidade', 'n6', .06, .10, 0), ('assinatura', 'n7', .06, .45, 0)]
BREAK_AFTER = {'n4': ['processos,', 'manuais.']}  # quebras por unidade de sentido
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
    # legenda: troca "Dê Eme É" por DME e quebra por unidade de sentido (pontuação), até ~2 linhas de 30 caracteres
    disp = [w[:] for w in ws]; i = 0; merged = []
    while i < len(disp):
        if disp[i][0] == 'Dê' and i + 2 < len(disp) and disp[i + 1][0] == 'Eme':
            last = disp[i + 2][0]; tailp = re.sub(r'^É', '', last); merged.append(['DME' + tailp, disp[i][1], disp[i + 2][2]]); i += 3
        else: merged.append(disp[i]); i += 1
    if fid == 'n7': merged = [[('COMERCIAL' if w[0] == 'comercial' else w[0]), w[1], w[2]] for w in merged]
    block = []
    for j, w in enumerate(merged):
        block.append(w); txt = ' '.join(x[0] for x in block)
        if fid in BREAK_AFTER: end_here = j == len(merged) - 1 or w[0] in BREAK_AFTER[fid] or False
        else: end_here = j == len(merged) - 1 or (re.search(r'[.?!]$', w[0]) and len(txt) > 12) or (re.search(r',$', w[0]) and len(txt) > 30) or len(txt) > 52
        if end_here: caps.append({'start': block[0][1], 'end': block[-1][2] + .2, 'text': txt, 'scene': key}); block = []
    scenes.append({'key': key, 'fala': fid, 't0': round(t, 3), 't1': round(end, 3), 'v0': round(v0, 3), 'v1': round(v0 + dur, 3), 'texto': LEG[fid]})
    words[key] = ws; t = end
for a, b in zip(caps, caps[1:]): a['end'] = min(a['end'], b['start'])
total = round(t, 3)
json.dump({'fps': FPS, 'dur': total, 'frames': round(total * FPS), 'scenes': scenes, 'words': words, 'captions': caps}, open(f'{ROOT}/src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
for s in scenes: print(f"{s['key']:13s} {s['t0']:6.2f}–{s['t1']:6.2f}  voz {s['v0']:6.2f}–{s['v1']:6.2f}")
print('duração', total, 's ·', round(total * FPS), 'quadros'); [print(f"  {c['start']:6.2f}–{c['end']:6.2f} {c['text']}") for c in caps]
