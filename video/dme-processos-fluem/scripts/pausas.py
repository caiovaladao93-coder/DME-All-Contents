"""Insere pausas (silêncio) depois de palavras de uma fala, a partir da TOMADA ORIGINAL escolhida (idempotente).
O corte é feito no meio do intervalo entre a palavra e a seguinte; o alinhamento de caracteres é deslocado junto.
Saída: voz/<id>.mp3 e .json, copiados para src/data/voz e public/assets/audio/falas."""
import json, shutil, subprocess
import numpy as np
SR = 44100
TOMADA = {'n1': 1, 'n2': 1, 'n3': 3, 'n4': 1, 'n5': 2, 'n6': 2, 'n6b': 1, 'n7': 2, 'n8': 3, 'n9': 1}
PAUSAS = {  # fala: [(palavra, segundos de silêncio a inserir depois dela)]
    'n1': [('entra.', .25)],
    'n2': [('e-mail.', .45), ('planilha.', .45)],
    'n3': [('equipe.', .45)],
    'n4': [('Agora,', .75)],
    'n5': [('diagnóstico,', .35), ('mapeia,', .35), ('padroniza', .3), ('automatiza.', .5)],
    'n6b': [('dia,', .3)],
    'n7': [('flui,', .45)],
    'n8': [('entra.', .3)],
    'n9': [('Technology.', .3), ('tecnologia.', .45)],
}
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
for fid, k in TOMADA.items():
    src = f'voz/takes/{fid}-{k}'
    d = json.load(open(src + '.json')); a = d['alignment']; ch = a['characters']; st = a['character_start_times_seconds']; en = a['character_end_times_seconds']
    words, cur, i0 = [], '', 0
    for i, c in enumerate(ch + [' ']):
        if c == ' ':
            if cur: words.append((cur, i0, i - 1))
            cur = ''; continue
        if not cur: i0 = i
        cur += c
    x = load(src + '.mp3'); cuts = []
    for w, sec in PAUSAS.get(fid, []):
        j = next(n for n, ww in enumerate(words) if ww[0] == w)
        e = en[words[j][2]]; nx = st[words[j + 1][1]] if j + 1 < len(words) else e + .05
        cuts.append(((e + nx) / 2, sec, words[j][2]))
    for tcut, sec, last in sorted(cuts, reverse=True):
        s = int(tcut * SR); x = np.concatenate([x[:s], np.zeros(int(sec * SR), np.float32), x[s:]])
        for i in range(last + 1, len(ch)): st[i] += sec; en[i] += sec
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', f'voz/{fid}.mp3'], input=x.tobytes(), check=True)
    d['pausas'] = PAUSAS.get(fid, []); json.dump(d, open(f'voz/{fid}.json', 'w'), ensure_ascii=False, indent=1)
    shutil.copy(f'voz/{fid}.json', f'src/data/voz/{fid}.json'); shutil.copy(f'voz/{fid}.mp3', f'public/assets/audio/falas/{fid}.mp3')
    print(fid, k, 'pausas:', PAUSAS.get(fid, []), f'{len(x) / SR:.2f} s')
