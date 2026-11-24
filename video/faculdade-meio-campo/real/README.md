# Meio-Campo · "A Resenha" (versão com gravações reais)

Trabalho de faculdade (Legislação Publicitária). A casa de apostas é **fictícia**. O vídeo final é `saida/meio-campo_a-resenha.mp4`: 1920×1080, 30 fps, exatamente 30,000 s (900 quadros), H.264 yuv420p e AAC 192 kbps estéreo, a −16,8 LUFS.

- **Material:** `gravacoes/` são cópias somente leitura das 5 gravações do usuário, que ficam intactas.
- **Vídeo:** `trabalho/montar.py` (OpenCV, numpy e Pillow) faz:
  - o chroma key em HSV, com limpeza morfológica, feather e despill nas bordas e na pele;
  - a TV com 4 cantos fixos (mediana do plano4a) e perspectiva, compondo só onde há verde;
  - o celular com o quadrilátero detectado a cada quadro e os cantos suavizados (mediana e gaussiana), sem desenhar nada quando o verde some;
  - o conteúdo da TV e do app gerado em código, a correção de cor uniforme e o desfoque de marcas (controle remoto, rótulo da garrafa, selo da caixa de som);
  - as legendas, a faixa de advertência, o 18+ e a tela final.
- **Áudio:** `trabalho/audio.py` usa:
  - as falas originais limpas (passa-alta e afftdn);
  - o AMIGO com a voz "Meio-Campo Caio" e reverb de sala, e o LOCUTOR com a voz "Meio-Campo Locutor" (`trabalho/gerar_locucao.mjs`);
  - o ambiente dos próprios planos e a TV sintetizada (torcida, "uuuh" e apito), cerca de 15 dB abaixo, com ducking.
- **Marcas de som:** em `saida/marcas-som.txt`.

## Decisões do usuário
- **TV:** o plano1 e o plano3 não mostram a TV, então todas as cenas de TV vêm do plano4a, intercaladas com as reações.
- **Fala do plano4b:** era "É, errei o palpite, mas ganhei a resenha". Foi cortada em "palpite", porque "ganhei" poderia sugerir ganho.

## Linha do tempo
| s | Plano |
|---|---|
| 0–4 | plano1 (sala) |
| 4–9 | plano2 (app "Seu limite mensal está ativo ✓"; o celular é virado para baixo) |
| 9–12,2 | plano4a (lance: a bola passa raspando a trave aos 11,75 s, com o "uuuh") |
| 12,2–16 | plano3 (reação: "Caraca… quase, moleque!") |
| 16–18 | plano4a (FIM DE JOGO · AZUL 0 x 1 VERDE, com apito) |
| 18–23 | plano4b ("É, errei o palpite." + riso; o amigo fala em 20,72 s) |
| 23–30 | tela final (texto legal de 24,4 a 30 s; locução de 23,5 a 29,54 s) |

## Verificação
- A faixa e o 18+ estão legíveis nos **900/900** quadros.
- **0** pixel de verde-chroma puro sobrou em qualquer quadro.
- A transcrição do áudio final confere com todas as falas, sem cortes.
- Quadros de checagem em `trabalho/checagem/` e `trabalho/checagem/final/`.
