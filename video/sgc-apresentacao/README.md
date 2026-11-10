# SGC · Filme de apresentação (39,6 s, 16:9)

Filme horizontal 1920×1080 a 30 fps (1.188 quadros), em H.264 com áudio AAC. É feito em Remotion, React e TypeScript.

**Sem imagens reais**, a pedido do cliente. Tudo é gerado em código:

- **Escritório e mesa:** vetores e CSS, com dolly, parallax e profundidade de campo simulada.
- **Telas do diagnóstico:** componentes React na identidade do SGC.
- **Trilha e efeitos:** sintetizados em numpy.
- **Logo:** é o único arquivo de marca usado. São as camadas oficiais separadas pelo próprio projeto do SGC (`jvramos10/sgc-prototipo`, `static/brand/`), sem redesenho e sem recoloração.

## Entregáveis (`out/`)

| Arquivo | O que é |
|---|---|
| `SGC-Apresentacao-39s.mp4` | Filme final, normalizado em −14 LUFS |
| `SGC-Apresentacao-39s.srt` | Legendas com os tempos reais das falas |
| `capa.png` | Capa horizontal 1920×1080 |
| `storyboard/01…08-*.png` | Oito imagens de storyboard, um quadro por cena |
| `marcas-som.txt` | Tempos de falas, efeitos e trilha |
| `validacao.txt` | Medições (ffprobe, loudness) e checklist do roteiro §11 |

## Editar

```bash
npm run studio                       # pré-visualização interativa
```

- **Tempos das cenas:** `src/data/timeline.json` é a fonte única. Ali ficam a duração de cada cena, a entrada da voz e os efeitos. O Remotion e a trilha leem o mesmo arquivo.
- **Textos da narração:** `voz/falas.json`. "SGC" vai para a voz como "Esse Gê Cê" para soar como sigla, e a legenda usa "SGC".
- **Cenas:** `src/scenes/*.tsx`. Os componentes reutilizáveis ficam em `src/components/`:
  - `AnimatedHeadline`, `MaskedText`/`TextReveal` e `OrangeAccentLine`;
  - `InterfaceWindow`, `ScreenHighlight`/`LightSweep` e `CinematicImage`/`Layer`;
  - `BrandSignature` e `SubtitleTrack`.
- **Cores e fontes:** `src/theme/`. As cores são as oficiais do design system do SGC. As fontes são Sora e Manrope (OFL), porque a pilha do produto (Segoe UI e Aptos) não tem licença para vídeo.

## Regenerar áudio e exportar

```bash
# 1. voz (ElevenLabs, voz Guilherme; a chave é injetada pelo proxy do ambiente)
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3
python3 scripts/escolher_take.py hook,problem,brand,questions,preview,unlock,pdf,cta --aplicar
cp voz/*.mp3 public/assets/audio/falas/ && cp voz/{hook,problem,brand,questions,preview,unlock,pdf,cta}.json src/data/voz/
# 2. trilha e efeitos (já com ducking sob a voz)
python3 scripts/trilha.py
# 3. render e normalização
npx remotion render src/index.ts SGCInstitutional out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
bash scripts/finalizar.sh            # loudnorm -14 LUFS, capa, storyboard, SRT e validação
```

Para a versão com legendas queimadas, use a composição `SGCInstitutionalLegendado`.

## Decisões de conteúdo

- **Interface ilustrativa:** a landing page e o checkout do diagnóstico não estão em nenhum repositório disponível. As telas foram geradas com os textos do roteiro: "Responda 10 perguntas e descubra a saúde da sua empresa.", "Descreva seu negócio", "Quero receber o diagnóstico", "Descobrir minha saúde", "R$ 49,90" e "Baixar PDF". Toda tela leva o selo "Interface ilustrativa" ou "Exemplo ilustrativo".
- **Sem conteúdo inventado:** as perguntas, as opções, os pontos de atenção e as recomendações aparecem como linhas neutras.
- **Índice demonstrativo:** o 72% é marcado como "índice demonstrativo".
- **Pagamento:** aparece depois das perguntas e da prévia. A transição para o resultado é simbólica (um cadeado que abre) e não mostra nenhuma confirmação de transação.
- **Sem pessoas:** o roteiro pedia um empresário na cena 01, mas o cliente pediu nenhuma imagem real. O plano mostra o escritório e o monitor em 40°, com lente de 50 mm simulada.
