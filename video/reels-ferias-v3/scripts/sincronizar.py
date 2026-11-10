"""Recorta cada fala (gerada inteira, para a entonação ser natural) nas pausas entre frases e encaixa cada trecho
no instante em que a frase entra na tela (âncoras do video.html v2). Quando a fala precisa de mais tempo do que
a animação dá, a linha do tempo do vídeo desacelera naquele trecho (WARP), sem congelar.
Saídas: voz/segmentos/*.wav, voz/narracao.wav e warp.json (nós [saída, original]) lidos pelo video.html e pela trilha."""
import json, subprocess
import numpy as np
SR = 48000
GAP = 0.14  # respiro mínimo entre trechos
# (fala, palavras que iniciam cada trecho, âncoras no tempo ORIGINAL da animação v2)
PLAN = [
    ('c1', ['Se', 'sua'], [0.12, 1.72]),
    ('c2', ['Você', 'Você', 'Você'], [3.22, 4.12, 5.02]),
    ('c3', ['Isso', 'É'], [6.12, 7.05]),
    ('c4', ['Agora,', 'quem'], [8.15, 8.62]),
    ('c5', ['Diagnóstico.', 'Mapeamento.', 'Padronização.', 'Automação.'], [12.78, 13.93, 15.08, 16.23]),
    ('c6', ['No'], [17.42]),
    ('c7', ['Segunda.', 'Quarta.', 'Sexta.'], [19.67, 20.84, 22.01]),
    ('c8', ['Então,', 'o'], [25.48, 27.62]),
    ('c9', ['E', 'Agora'], [29.47, 30.47]),
    ('c10', ['Envie'], [32.17]),
]
DUR0 = 34.0


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def words(a):
    ws, cur, st, en = [], '', 0, 0
    for i, ch in enumerate(a['characters']):
        if ch == ' ':
            if cur: ws.append([cur, st, en])
            cur = ''; continue
        if not cur: st = a['character_start_times_seconds'][i]
        cur += ch; en = a['character_end_times_seconds'][i]
    if cur: ws.append([cur, st, en])
    return ws


segs = []
for cid, starts, anchors in PLAN:
    d = json.load(open(f'voz/{cid}.json')); a = d['alignment']; x = load(f'voz/{cid}.mp3'); ws = words(a)
    idx, j = [], 0
    for w in starts:
        while ws[j][0] != w: j += 1
        idx.append(j); j += 1
    for k, i0 in enumerate(idx):
        i1 = idx[k + 1] if k + 1 < len(idx) else len(ws)
        t0 = ws[i0][1]; t1 = ws[i1 - 1][2]
        # corte no meio da pausa vizinha
        c0 = 0.0 if i0 == 0 else (ws[i0 - 1][2] + t0) / 2
        c1 = len(x) / SR if i1 == len(ws) else (t1 + ws[i1][1]) / 2
        y = x[int(c0 * SR):int(c1 * SR)].copy()
        fi, fo = int(.006 * SR), int(.02 * SR); y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
        segs.append({'id': f'{cid}_{k + 1}', 'texto': ' '.join(w[0] for w in ws[i0:i1]), 'ancora': anchors[k], 'lead': t0 - c0, 'fala': t1 - t0, 'audio': y})

# encaixe + warp
shift, prev_end, knots = 0.0, -1.0, [[0.0, 0.0]]
for s in segs:
    want = s['ancora'] + shift  # quando a fala (palavra) deve começar, em tempo de saída
    if want < prev_end + GAP:
        shift += prev_end + GAP - want; want = prev_end + GAP
    s['inicio'] = want; prev_end = want + s['fala']
    knots.append([round(want, 4), s['ancora']])
knots.append([round(DUR0 + shift, 4), DUR0])
DUR = DUR0 + shift
N = int(DUR * SR) + SR
nar = np.zeros(N)
import os
os.makedirs('voz/segmentos', exist_ok=True)
for s in segs:
    i = int((s['inicio'] - s['lead']) * SR); y = s['audio']; nar[i:i + len(y)] += y
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', f"voz/segmentos/{s['id']}.wav"], input=y.tobytes(), check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', 'voz/narracao.wav'], input=nar[:int(DUR * SR)].tobytes(), check=True)
json.dump({'dur': round(DUR, 4), 'knots': knots, 'segmentos': [{k: v for k, v in s.items() if k != 'audio'} for s in segs]}, open('warp.json', 'w'), ensure_ascii=False, indent=1)
print('duração', round(DUR, 2), 's · deslocamento total', round(shift, 2))
for s in segs: print(f"{s['inicio']:6.2f}  (âncora {s['ancora']:5.2f})  {s['texto']}  [{s['fala']:.2f}s]")
