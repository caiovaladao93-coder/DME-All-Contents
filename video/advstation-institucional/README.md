# ADV STATION · Filme institucional horizontal (VERSÃO DE REVISÃO)

Projeto Remotion (React + TypeScript): 1920×1080, 30 fps, 2.850 frames (95 s), H.264 High, yuv420p.
Esta versão usa as telas reais enviadas, não tem pessoas nem fotos de banco e **não tem áudio** (a locução Guilherme está pendente). Os pendentes estão em `RELATORIO.md`.

## Entregáveis (`out/`)

| Arquivo | Conteúdo |
|---|---|
| `ADV-STATION-Institucional-16x9-REVISAO.mp4` | Versão de revisão (sem áudio, com marcadores) |
| `capa.png` | Capa horizontal 1920×1080 |
| `legendas.srt` / `legendas.vtt` | Legendas com tempos **estimados** |
| `roteiro.json` | Falas, cenas e blocos de legenda (fonte única: `src/data`) |
| `locucao.txt` | Texto a ser gerado na ElevenLabs, uma fala por cena |
| `referencias/cena-01.png` … `cena-09.png` | Um quadro de referência por cena |

## Executar

```bash
npm install
npm run studio                         # prévia interativa
npm run render                         # MP4 (ajuste o nome final no package.json)
node scripts/stills.mjs out/testes 0,900,1800   # quadros de teste
node scripts/stills.mjs out 0 Capa             # capa
node scripts/legendas.mjs                      # SRT, VTT, roteiro.json e locucao.txt
```

`remotion.config.ts` aponta para o Chromium do ambiente cloud. Em outra máquina, remova `setBrowserExecutable`.

## Editar

- **Tempos:** `src/data/storyboard.ts` (cenas) e `src/data/narration.ts` (início de cada fala).
- **Telas e fotos:** coloque os arquivos em `public/assets/maternidade-legal/`, `public/assets/previdenciario-geral/` e `public/assets/photography/`, e preencha `src` em `src/data/assets.ts`. O marcador some sozinho.
- **Voz:** com a narração gerada (ElevenLabs, `convert_with_timestamps`), salve o áudio em `public/assets/audio/` e preencha `AUDIO.narration`. Depois troque os tempos estimados de `narration.ts` pelos tempos por palavra do alinhamento.
- **Cores e fontes:** `src/theme/`. Para usar as fontes licenciadas, coloque os arquivos `.woff2` em `public/fonts/` e registre-os em `src/components/Fonts.ts`.

## Estrutura

```
src/ Root.tsx · ADVStationFilm.tsx · Cover.tsx
  scenes/      Opening · LegalComplexity · BrandIntroduction · MaternidadeLegal · PrevidenciarioGeral ·
               TwoProducts · BusinessValue · HumanExperience · BrandSignature (+ ProductParts)
  components/  StationMap (AnimatedStationLine, Station) · Brand (BrandMark, Selo, Vinheta = BrandReveal/BrandFinalCard) ·
               CinematicImage · ProductScreenshot (+ ScreenSpotlight) · Editorial (EditorialHeadline, GoldLabel,
               GoldAccentLine, FeatureLabel) · SubtitleTrack · Atmosphere · Fonts
  theme/       colors · typography · animation
  data/        storyboard · narration · assets
```
