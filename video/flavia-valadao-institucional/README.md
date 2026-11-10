# Flávia Valadão Interiores · institucional vertical (29 s)

Conceito: **"Seu jeito de viver, em cada detalhe."** Formato 9:16, 1080 × 1920, 30 fps, 870 quadros, H.264 com AAC a 48 kHz.

Estrutura: DETALHE → INTENÇÃO → RELAÇÃO → AMBIENTE → MARCA. Um único apartamento (as duas fotos e o vídeo enviados pelo cliente) sustenta o filme inteiro.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `Flavia-Valadao-Institucional-Vertical.mp4` | Master: CRF 18, yuv420p, faststart, AAC 48 kHz, 29,0 s |
| `Flavia-Valadao-Institucional-Vertical.srt` | Legendas sincronizadas |
| `capa.png` | Capa vertical, quadro real em 7,9 s: a sala revelada e o título |
| `narracao.wav`, `trilha.wav`, `mix.wav` | Áudio separado e mixado |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas e efeitos; ffprobe, loudness e quadros pretos |

**Prévia HTML:** abra `video.html` no navegador. Ele toca a timeline com o áudio.

## Como gerar

```bash
python3 scripts/linha_tempo.py      # timeline.json (29,0 s) a partir da voz real
python3 scripts/trilha.py           # trilha, narração, mix, SRT e marcas de som
python3 scripts/contorno.py         # contorno ilustrativo derivado da foto da sala
python3 scripts/dados.py            # data.js (timeline + contorno) para o video.html
node render.js video.html out/video-bruto.mp4 1080 1920 30 29     # render por quadros (Playwright)
./scripts/finalizar.sh              # master com áudio, capa e conferência
node render.js video.html out/testes 1080 1920 30 29 1.5,6.6,14.8  # quadros de teste
```

## Materiais e origem (`assets/`)

| Arquivo | Origem | Uso |
|---|---|---|
| `original/logo-enviado.jpg` | Enviado pelo cliente no chat, em 10/11/2026 | O fundo foi removido **só pela luminância**, sem redesenho nem vetorização. O resultado é `logo-flavia-transparente.png` (813 × 411 px) |
| `original/foto-entrada-nicho.jpg` | Enviado pelo cliente (1086 × 1448) | Bloco 1 (detalhe) e bloco 3 (composição) |
| `original/foto-sala-tv.jpg` | Enviado pelo cliente (1086 × 1448) | Bloco 2 (contorno e revelação) e bloco 3 (materiais e luz) |
| `original/video-ambiente.mp4` | Enviado pelo cliente (576 × 1024, 24 fps, 15 s). Os dois anexos eram o mesmo arquivo | Bloco 4 (trecho de 9,7 a 14,0 s) |
| `tratadas/` | Derivados | Correção moderada: um pouco menos de laranja, proteção dos brancos estourados (eram 3–4 % dos pixels) e leve abertura das sombras. Ampliação Lanczos com nitidez leve. Os quadros do vídeo saem em 1080 × 1920 |
| `contorno-sala-tv.json` | Derivado da foto da sala (`scripts/contorno.py`) | Silhuetas reais (TV, aparador, quadros, porta, pendente, linhas de LED), sem cotas |
| `fonts/` | Fontsource (licença OFL) | Cormorant 400/500 e Manrope 400/500 |
| `lib/gsap.min.js` | GSAP 3.12.5 (npm), arquivo local | Timeline central |

## Mapa de uso

| Tempo | Arquivo | Enquadramento | Função |
|---|---|---|---|
| 0,0–4,0 | foto do nicho | Plano próximo do painel de madeira, descendo pela **borda iluminada** | Detalhe: material e luz. Título "Seu espaço, seu jeito" |
| 3,4–4,5 | — | A borda vira um traço verde e o marfim se abre a partir dela | Transição por posição |
| 4,1–6,0 | contorno da sala | O desenho nasce a partir da mesma borda, que é a quina da coluna da sala | Intenção. Título "Interiores com intenção" |
| 6,0–7,6 | foto da sala | Revelação por máscara a partir da borda (1,6 s), com o desenho coincidindo com a foto | Momento principal |
| 7,6–10,0 | foto da sala | Imagem completa, depois aproximação curta até o sofá | — |
| 10,0–11,9 | foto da sala | Sofá, almofadas e manta | "Materiais" |
| 11,9–13,8 | foto da sala | Arandela, linha de LED e quadro | "Luz" |
| 13,8–16,6 | foto do nicho | Jantar, cadeiras e estar | "Composição" |
| 16,6–22,2 | vídeo | Deslocamento lateral real até o nicho, que passa em primeiro plano. Velocidade de cerca de 0,8×, com mistura entre quadros vizinhos | Conjunto e respiro. "Cuidado em cada detalhe" |
| 21,6–29,0 | marfim | A parede clara à direita conduz ao marfim. Logo por máscara e opacidade, "Seu jeito de viver" e o CTA "Converse sobre o seu espaço" | Assinatura (legível nos 2,8 s finais) |

**Movimentos:** só reenquadramentos dentro dos limites de cada foto. Não há parallax inventado, deformação nem móveis animados, e os únicos cortes secos são feitos por posição e conteúdo.

**Títulos:** cartões marfim editoriais (Cormorant 500, 92 px) fora do centro de interesse. Garantem leitura sem tingir a fotografia.

**Legendas:** Manrope 500, 42 px, no máximo 2 linhas. Saem na assinatura, que já traz o texto.

## Áudio

**Narração:**

- **Texto:** o do briefing, sem "Um olhar atento.". Com ela, a voz real somava 27,2 s e não sobrava espaço para as pausas e o respiro; o briefing prevê essa retirada.
- **Velocidade:** natural, sem aceleração.
- **Voz:** Pri (`8EY2gK6oUxZCDZAlvUpZ`), pt-BR, madura e calma. Ajustes: stability 0.55, similarity 0.8, style 0.15. A voz não imita a Flávia.
- **Tomadas:** 3 por fala, escolhidas por medição: f1:2, f2:1, f3:3, f4:2, f5:2.
- **Conferência:** cada tomada e o mix completo foram transcritos pelo speech-to-text da ElevenLabs, e o texto saiu idêntico ao do briefing.
- **Vozes alternativas:** `voz/amostras/` tem o texto em Sol Reis e Fernanda.

**Trilha:** original, piano a 80 BPM (`scripts/trilha.py`).

- **Abertura:** nota de piano e textura de ambiente.
- **Revelação:** acento delicado na conclusão do desenho (7,6 s).
- **Bloco 3:** pulsação grave discreta e um único acento no corte para a composição (13,8 s).
- **Bloco 4:** abertura no plano amplo.
- **Logo:** resolução em Ré maior em 22,05 s. Sem whoosh.

**Mixagem:** a música fica cerca de 12 dB abaixo da voz, com ducking suave de 5 dB. O master fica em cerca de -14,5 LUFS, com true peak de -1,5 dBTP.

## Pendências reais

1. **Resolução dos materiais:**
   - As fotos chegaram com 1086 × 1448 e o vídeo com 576 × 1024, ambos comprimidos pelo WhatsApp.
   - Os recortes de detalhe ampliam a imagem cerca de 2×, e o vídeo cerca de 1,9×. A ampliação usa Lanczos com nitidez leve, então o resultado é bom no celular, mas **menos nítido que o ideal**.
   - Com os originais em alta resolução (fotos com 3.000 px ou mais, vídeo em 1080p ou 4K), basta trocar os arquivos em `assets/original/` e rodar o tratamento e o render de novo.
2. **Render ou foto:** as imagens têm acabamento de render ou de foto bastante editada. Se forem **renders**, o briefing pede a identificação discreta "Imagem de projeto", que **ainda não foi aplicada** porque isso não foi confirmado.
3. **Origem do vídeo:** o vídeo tem emendas com barras pretas (6,0 e 7,0 s do original) e trechos com movimento muito rápido. Esses trechos foram evitados. Se o vídeo foi gerado a partir das fotos, vale confirmar se ele pode ser apresentado como material do projeto.
4. **Logo:** usado a partir do arquivo enviado (um JPEG de 1080 × 1350). Para a assinatura, a resolução é suficiente, mas um original vetorial (SVG, PDF ou AI) daria bordas mais limpas.
5. **Interface do Reels:** os textos respeitam as margens de 90 px nas laterais, 250 px no topo e 420 px na base. A sobreposição real da interface do Instagram não foi testada no aplicativo.
6. **Áudio:** foi conferido por medição e por transcrição, não por escuta humana.
