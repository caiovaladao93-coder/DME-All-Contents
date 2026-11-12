"""Insere pausas (silêncio) depois de palavras de uma fala, a partir da TOMADA ORIGINAL escolhida (idempotente).
O corte é feito no meio do intervalo entre a palavra e a seguinte; o alinhamento de caracteres é deslocado junto.
Saída: voz/<id>.mp3 e .json, copiados para src/data/voz e public/assets/audio/falas."""
import json, shutil, subprocess
import numpy as np
SR = 44100
TOMADA = {'n1': 1, 'n2': 1, 'n3': 5, 'n4': 6, 'n5': 2, 'n6': 2, 'n6b': 1, 'n7': 2, 'n8': 3, 'n9': 1}
PAUSAS = {  # fala: [(palavra, segundos de silêncio a inserir depois dela)]
    'n1': [('entra.', .25)],
    'n2': [('e-mail.', .45), ('planilha.', .45)],
    # n3 e n4: pausas geradas pela própria voz (<break> da ElevenLabs), sem corte
    'n5': [('diagnóstico,', .35), ('mapeia,', .35), ('padroniza', .3), ('automatiza.', .5)],
    'n6b': [('dia,', .3)],
    'n7': [('flui,', .45)],
    'n8': [('entra.', .3)],
    'n9': [('Technology.', .3), ('tecnologia.', .45)],
}
def limpar(x, ch, st, en, margem=.09, fade=.04):
    """Remove respirações: silêncio depois da última letra (+margem) e no miolo das pausas entre frases; gate leve abaixo de −48 dB."""
    g = np.ones(len(x), np.float32); F = int(fade * SR)
    def mute(a, b):
        i, j = max(0, int(a * SR)), min(len(x), int(b * SR))
        if j - i < 2 * F: return
        g[i:j] = 0; g[i:i + F] = np.minimum(g[i:i + F], np.linspace(1, 0, F)); g[j - F:j] = np.minimum(g[j - F:j], np.linspace(0, 1, F))
    al = [i for i, c in enumerate(ch) if c.isalpha()]
    mute(0, st[al[0]] - .03)                                   # antes da primeira palavra
    for i, j in zip(al, al[1:]):
        if st[j] - en[i] > .18: mute(en[i] + margem * .7, st[j] - .025)   # inspiração entre frases
    i = min(len(x), int((en[al[-1]] + margem) * SR)); g[i:] = 0; g[i - F:i] = np.minimum(g[i - F:i], np.linspace(1, 0, F))  # respiração no fim
    w = int(.01 * SR); e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, 'same'))
    k = int(.06 * SR); emax = np.array([e[max(0, n - k):n + k].max() for n in range(0, len(e), w)]).repeat(w)[:len(e)]
    gate = np.clip((20 * np.log10(emax + 1e-9) + 48) / 6, 0, 1).astype(np.float32)
    g[-F:] = np.minimum(g[-F:], np.linspace(1, 0, F))  # sem clique no fim do arquivo
    return (x * g * gate).astype(np.float32)
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
    x = limpar(x, ch, st, en)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', f'voz/{fid}.mp3'], input=x.tobytes(), check=True)
    d['pausas'] = PAUSAS.get(fid, []); json.dump(d, open(f'voz/{fid}.json', 'w'), ensure_ascii=False, indent=1)
    shutil.copy(f'voz/{fid}.json', f'src/data/voz/{fid}.json'); shutil.copy(f'voz/{fid}.mp3', f'public/assets/audio/falas/{fid}.mp3')
    print(fid, k, 'pausas:', PAUSAS.get(fid, []), f'{len(x) / SR:.2f} s')
