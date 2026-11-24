"""Meio-Campo · "A Resenha" · áudio. Vozes em primeiro plano (minha fala original limpa, AMIGO com reverb de sala, LOCUTOR),
ambiente dos próprios planos e o som da TV SINTETIZADO (torcida distante, "uuuh" no lance, apito final), cerca de 15 dB abaixo
das vozes, com ducking. Total ≈ -16 LUFS. Saída: audio_final.wav (48 kHz estéreo, 30 s) e marcas-som.txt."""
import os, subprocess
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__)); GRAV = os.path.join(AQUI, '..', 'gravacoes')
SR, DUR = 48000, 30.0
N = int(SR * DUR)
R = np.random.default_rng(42)

def carregar(arq, ini=0.0, dur=None, filtros=None, mono=False):
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ini:.3f}', '-i', arq]
    if dur: cmd += ['-t', f'{dur:.3f}']
    if filtros: cmd += ['-af', filtros]
    cmd += ['-ar', str(SR), '-ac', '1' if mono else '2', '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)

def por(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if x.ndim == 1: x = np.stack([x, x], 1)
    buf[i:j] += x[:j - i] * g

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def ajusta(x, alvo_db): return x * 10 ** ((alvo_db - rms_db(x[np.abs(x).max(1) > 1e-4] if x.ndim == 2 else x)) / 20)

VOZ = np.zeros((N, 2)); AMB = np.zeros((N, 2)); TV = np.zeros((N, 2)); MARCAS = []
LIMPA = 'highpass=f=90,afftdn=nf=-25:nr=22:tn=1,lowpass=f=7500'
V_DB = -20.0                              # nível RMS das vozes (antes da normalização final)

# ── ambiente dos próprios planos (mesmos trechos da montagem) ─────────────────────────────────────
for a, b, plano, s0 in [(0, 4, 'plano1', 0.8), (4, 9, 'plano2', 0.5), (9, 12.2, 'plano4a', 0.3), (16, 18, 'plano4a', 3.6)]:
    x = carregar(os.path.join(GRAV, plano + '.mp4'), s0, b - a, 'highpass=f=60,afftdn=nf=-25:nr=25:tn=1,lowpass=f=2500'); por(AMB, x, a)
MARCAS.append((0.0, 'ambiente: som de sala dos próprios planos'))
# ── minhas falas (áudio original, limpo) ─────────────────────────────────────────────────────────
x = carregar(os.path.join(GRAV, 'plano3.mp4'), 0.0, 3.8, LIMPA); por(VOZ, ajusta(x, V_DB - 1), 12.2)
MARCAS.append((13.24, 'minha reação (áudio original): "Caraca… quase, moleque!"'))
x = carregar(os.path.join(GRAV, 'plano4b.mp4'), 3.32, 3.03, LIMPA)
x[-int(.06 * SR):] *= np.linspace(1, 0, int(.06 * SR))[:, None]                     # corte limpo antes de "mas"
por(VOZ, ajusta(x, V_DB), 18.0)
MARCAS.append((19.38, 'minha fala (áudio original): "É, errei o palpite."'))
x = carregar(os.path.join(GRAV, 'plano4b.mp4'), 7.50, 1.97, LIMPA)
x[:int(.05 * SR)] *= np.linspace(0, 1, int(.05 * SR))[:, None]
por(VOZ, ajusta(x, V_DB - 6), 21.03)                                                 # riso, mais baixo, sob o amigo
MARCAS.append((21.03, 'meu riso (áudio original), sob a fala do amigo'))
# ── AMIGO (fora de quadro, reverb de sala) e LOCUTOR ─────────────────────────────────────────────
x = carregar(os.path.join(AQUI, '..', '..', 'voz', 'takes', 'caio-1.mp3'), 0, None,
             'highpass=f=100,aecho=0.85:0.55:28|53|79:0.22|0.14|0.08,lowpass=f=9000,silenceremove=start_periods=1:start_threshold=-45dB')
por(VOZ, ajusta(x, V_DB - 1), 20.72)
MARCAS.append((20.72, 'AMIGO (voz "Meio-Campo Caio", fora de quadro, reverb de sala): "Semana que vem é aqui em casa!"'))
x = carregar(os.path.join(AQUI, 'voz', 'locucao-final.wav'), 0, None, 'highpass=f=70')
por(VOZ, ajusta(x, V_DB + 1), 23.5); FIM_LOC = 23.5 + len(x) / SR
MARCAS.append((23.5, f'LOCUTOR (voz "Meio-Campo Locutor"): "Meio-Campo. O jogo é melhor com limite. Ministério da Fazenda adverte: aposta não é investimento." (termina em {FIM_LOC:.2f} s)'))

# ── TV sintetizada: torcida distante, "uuuh" no lance, apito final ───────────────────────────────
def filt(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
t = np.arange(N) / SR
torcida = filt(R.standard_normal(N), 200, 1300) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.37 * t) + 0.1 * np.sin(2 * np.pi * 2.3 * t))
nivel = np.interp(t, [0, 9, 9.05, 10.0, 11.4, 11.75, 12.2, 12.25, 16, 16.05, 18, 18.05, 23, 30], [.35, .35, 1, 1.2, 1.7, 1.9, 1.6, .55, .55, 1, 1, .4, .3, .3])
por(TV, torcida * nivel, 0)
T_SAI = 11.75
n = int(1.6 * SR); tt = np.arange(n) / SR                                            # "uuuh": muitas vozes em ~200–330 Hz, sobe e cai
env = np.minimum(1, tt / 0.25) * np.exp(-np.maximum(0, tt - 0.35) / 0.55)
uuuh = sum(np.sin(2 * np.pi * (f0 * (1 - 0.06 * tt)) * tt + R.uniform(0, 6.28)) for f0 in R.uniform(190, 330, 40)) / 40
uuuh = (uuuh + 0.15 * filt(R.standard_normal(n), 200, 700)) * env
por(TV, uuuh * 3.2, T_SAI - 0.1)
MARCAS.append((T_SAI - 0.1, 'TV: "uuuh" da torcida quando a bola passa raspando a trave'))
for k, (ini, d) in enumerate([(16.15, .22), (16.45, .22), (16.75, .8)]):              # apito final (3 toques)
    n = int(d * SR); tt = np.arange(n) / SR
    ap = np.sin(2 * np.pi * (2900 + 60 * np.sin(2 * np.pi * 32 * tt)) * tt) * np.minimum(1, tt / .01) * np.minimum(1, (d - tt) / .03)
    por(TV, ap * 0.35, ini)
MARCAS.append((16.15, 'TV: apito final (sintetizado)'))
TV = filt(TV[:, 0], 120, 3200)[:, None] * np.array([[1.0, 0.92]])                     # som "da TV": banda estreita, levemente à esquerda

# ── mixagem: ambiente + TV ~15 dB abaixo das vozes, ducking nas falas, fade nos últimos 1,5 s ─────
fundo = AMB * 0.6 + TV
fundo = ajusta(fundo, V_DB - 15)
envv = np.convolve(np.abs(VOZ).max(1), np.ones(int(.2 * SR)) / int(.2 * SR), 'same')
duck = 1 - 0.5 * np.clip(envv / (np.percentile(envv[envv > 1e-4], 90) + 1e-9), 0, 1)
fundo *= duck[:, None]
fo = int(1.5 * SR); fundo[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = VOZ + fundo
mix[-int(.15 * SR):] *= np.linspace(1, 0, int(.15 * SR))[:, None]
bruto = os.path.join(AQUI, 'audio_bruto.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', bruto], input=mix.astype(np.float64).tobytes(), check=True)
# normalização em duas passadas para -16 LUFS, pico -1,5 dBTP
import json
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', bruto, '-af', 'acompressor=threshold=-24dB:ratio=3:attack=5:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', bruto, '-af', f"acompressor=threshold=-24dB:ratio=3:attack=5:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000",
                '-t', '30', '-c:a', 'pcm_s16le', os.path.join(AQUI, 'audio_final.wav')], check=True)
with open(os.path.join(AQUI, '..', 'saida', 'marcas-som.txt'), 'w') as f:
    f.write('MARCAS DE SOM · MEIO-CAMPO "A RESENHA" (versão com gravações reais)\n\n')
    for tm, s in sorted(MARCAS): f.write(f'{tm:6.2f}  {s}\n')
    f.write(f'\nMixagem: vozes à frente; ambiente + TV ~15 dB abaixo, com ducking; fade do fundo nos últimos 1,5 s; total -16 LUFS (pico -1,5 dBTP).\n')
print('áudio ok · locução termina em', round(FIM_LOC, 2), 's')
