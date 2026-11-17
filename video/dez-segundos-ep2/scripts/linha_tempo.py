"""timeline.json a partir das falas REAIS: cenas, entrada da voz, palavras e legendas palavra a palavra (blocos de até 3 palavras).
Números falados por extenso viram algarismos na legenda (o tempo do bloco é o das palavras faladas)."""
import json, re
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS = 30
FALAS = {x['id']: x for x in json.load(open(f'{ROOT}/voz/falas.json'))}
# (cena, fala, entrada da voz depois do início da cena, respiro depois da fala, duração mínima da cena)
PLAN = [('foto', 'n1', .05, .3, 0), ('recap', 'n2', .15, .6, 0), ('play', 'n3', .15, 3.2, 0), ('parou', 'n4', .1, .4, 0),
        ('valdir', 'v1', .2, .5, 0), ('delegada', 'd1', .2, .4, 0), ('levou', 'n5', .15, .5, 0), ('dia', 'n6', .15, .5, 0),
        ('notebook', 'n7', .2, .5, 0), ('saco', 'n8', .15, .7, 0), ('corrente', 'n9', .4, .4, 0), ('passos', 'n10', .2, .3, 0),
        ('escolha', 'n11', .2, .4, 0), ('contagem', 'n12', .3, 0, 0)]
FIM_APOS_ESCOLHA = 13.2  # 10 degraus (1 por segundo) a partir de escolha.t0 + .3, batida na porta e cartão final
NUM = [('às duas e quarenta e sete', 'às 2h47'), ('às duas', 'às 2h'), ('dez', '10')]
norm = lambda w: re.sub(r'[^\wà-ú]', '', w.lower())
t, scenes, words, caps = 0.0, [], {}, []
for key, fid, lead, tail, mn in PLAN:
    a = json.load(open(f'{ROOT}/src/data/voz/{fid}.json'))['alignment']; dur = a['character_end_times_seconds'][-1]
    v0 = t + lead; end = max(t + mn, v0 + dur + tail)
    if key == 'escolha': T_ESC = t
    if key == 'contagem': end = max(end, T_ESC + FIM_APOS_ESCOLHA)
    ws, cur, st, en = [], '', 0, 0
    for i, ch in enumerate(a['characters'] + [' ']):
        if ch == ' ':
            if cur: ws.append([cur, round(v0 + st, 3), round(v0 + en, 3)])
            cur = ''; continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += ch; en = a['character_end_times_seconds'][i]
    ws = [w for w in ws if not (w[0].startswith('<') or w[0].startswith('time=') or w[0] == '/>')]  # marcações <break>
    disp, j = [], 0
    while j < len(ws):
        for frase, num in NUM:
            n = len(frase.split()); seg = ws[j:j + n]
            if len(seg) == n and ' '.join(norm(w[0]) for w in seg) == frase:
                tailp = re.sub(r'^[\wà-úÀ-Ú]+', '', seg[-1][0]); disp.append([num + tailp, seg[0][1], seg[-1][2]]); j += n; break
        else: disp.append(list(ws[j])); j += 1
    frases, cur = [], []
    for w in disp:
        cur.append(w)
        if re.search(r'[.,?:…]$', w[0]): frases.append(cur); cur = []
    if cur: frases.append(cur)
    for fr in frases:
        n = -(-len(fr) // 3); tam = [len(fr) // n + (1 if q < len(fr) % n else 0) for q in range(n)]; i0 = 0
        for q in tam:
            block = fr[i0:i0 + q]; i0 += q
            caps.append({'start': block[0][1], 'end': round(block[-1][2] + .3, 3), 'words': block, 'text': ' '.join(x[0] for x in block), 'scene': key, 'voz': FALAS[fid].get('voz', 'narrador')})
    scenes.append({'key': key, 'fala': fid, 't0': round(t, 3), 't1': round(end, 3), 'v0': round(v0, 3), 'v1': round(v0 + dur, 3), 'texto': FALAS[fid].get('legenda', FALAS[fid]['text'])})
    words[key] = ws; t = end
for a, b in zip(caps, caps[1:]): a['end'] = min(a['end'], b['start'])
total = round(round(t * FPS) / FPS, 3)
json.dump({'fps': FPS, 'dur': total, 'frames': round(total * FPS), 'scenes': scenes, 'words': words, 'captions': caps}, open(f'{ROOT}/src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
for s in scenes: print(f"{s['key']:10s} {s['t0']:6.2f}–{s['t1']:6.2f}  voz {s['v0']:6.2f}–{s['v1']:6.2f}")
print('duração', total, 's ·', round(total * FPS), 'quadros')
for k, ws in words.items(): print(' ', k, ' '.join(f'{w[0]}@{w[1]:.2f}' for w in ws))
print(' | '.join(c['text'] for c in caps))
