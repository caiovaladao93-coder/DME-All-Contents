# SGC · Institucional vertical para Instagram (39,7 s, 9:16)

Filme vertical 1080×1920 a 30 fps (1.190 quadros), em H.264 com áudio AAC. É feito em Remotion, React e TypeScript. Apresenta a SGC como metodologia de gestão e consultoria: diagnóstico FILMC 360°, plano de ação e acompanhamento.

## Entregáveis (`out/`)

| Arquivo | O que é |
|---|---|
| `SGC-Institucional-Vertical.mp4` | Filme final (−14 LUFS) |
| `SGC-Institucional-Vertical.srt` | Legendas com os tempos reais das falas |
| `capa-instagram.png` / `capa-instagram-3x4.png` | Capa 1080×1920 e o recorte 3:4 da grade |
| `storyboard/01…07-*.png` | Imagens de revisão das sete cenas |
| `marcas-som.txt` | Tempos de falas, efeitos e trilha |
| `validacao.txt` | Medições e checklist de validação do roteiro |

## Estrutura

- `src/data/timeline.json`: **fonte única dos tempos** (duração de cada cena, entrada da voz e efeitos). O Remotion, a trilha e as legendas leem o mesmo arquivo.
- `src/scenes/S1…S7*.tsx`: uma cena por componente.
- `src/components/`:
  - títulos: `AnimatedHeadline` e `MaskedText`/`TextReveal`;
  - linhas: `OrangeAccentLine`;
  - fluxogramas: `Cards` (`PillarCard`, `Connector`, `Spark`);
  - imagens cinematográficas: `CinematicImage`/`Layer` e `Plates`;
  - logo: `BrandSignature`;
  - legendas: `SubtitleTrack`;
  - fundo: `NavyStage`/`Scrim`.
- **Cores:** `src/theme/colors.ts`, com as cores oficiais do design system do SGC: marinho `#0A2048`, laranja `#F86A14` e laranja-tinta `#AE4A0E`.
- **Logo:** camadas oficiais de `jvramos10/sgc-prototipo/static/brand`, sem redesenho e sem recoloração.

## Fotografia

O roteiro pede fotografias realistas com pessoas, mas nenhuma foto foi fornecida. A busca do Pexels não funciona neste ambiente, e o padrão do repositório é usar ilustrações sem pessoas quando não há links. Por isso, cada cena usa um **plano gerado em código**, sem pessoas: escritório, sala de reunião, monitor sobre o ombro, mesa, estação de trabalho e janela. Cada plano tem luz azul à direita, luz quente ao fundo, profundidade de campo simulada e movimento de câmera.

Para trocar por fotos licenciadas:

1. Coloque o arquivo em `public/assets/photography/`.
2. Registre em `src/data/photos.ts` (por exemplo, `office: 'escritorio.jpg'`).

As chaves são `office`, `meeting`, `analysis`, `table`, `workstation` e `window`. A câmera, as máscaras e os textos continuam iguais. Pessoas de banco de imagens não podem ser apresentadas como equipe ou clientes da SGC.

## Regenerar e exportar

```bash
npm run studio
# voz (ElevenLabs, Guilherme; a chave é injetada pelo proxy). Velocidade 1,06 para caber nos 40 s
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --speed=1.06
python3 scripts/escolher_take.py s1,s2,s3,s4,s5,s6,s7 --aplicar
cp voz/s?.mp3 public/assets/audio/falas/ && cp voz/s?.json src/data/voz/
python3 scripts/trilha.py            # trilha original + efeitos, já com ducking sob a voz
npx remotion render src/index.ts SGCVertical out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
bash scripts/finalizar.sh            # loudnorm, capa, storyboard, SRT e validação
```

Para a versão com legendas queimadas, use a composição `SGCVerticalLegendado`.

## Decisões

- **Narração:**
  - são as frases exatas do roteiro, com "SGC" falado como sigla ("Esse Gê Cê");
  - a fala foi gerada a 1,06 e, entre as tomadas limpas (chiado abaixo de −30 dB), ficou a mais curta, para o total caber em 39,7 s com respiro e a assinatura estável no final.
- **Cena 03:** os cinco pilares são os do FILMC 360° do próprio SGC (Faturamento, Impostos, Logística, Margem e Custos). A ligação ao ponto "DIAGNÓSTICO" é ilustrativa e o vídeo não mostra nenhum valor numérico.
- **Cena 06:** o roteiro pede "CRESCER EXIGE MAIS DO QUE ESFORÇO." na tela. A narração diz "trabalhar muito".
- **Ponto luminoso da cena 04:** tem núcleo laranja e halo curto, sem neon.
