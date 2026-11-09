# DME Technology · vídeo institucional (80 s)

Projeto em Remotion (React + TypeScript): Reels 9:16 com 1080×1920 px, 30 fps, 2.400 quadros, H.264 em yuv420p.

## Entregáveis (`out/`)

| Arquivo | O que é |
|---|---|
| `dme-institucional-80s.mp4` | Filme renderizado, **sem áudio**, com legendas sincronizadas à locução planejada. |
| `capa.png` | Capa do Instagram (1080×1920): logo + "SUA EMPRESA PODE OPERAR MELHOR." |
| `legendas.srt` | Texto completo da locução com os tempos de cada bloco. |
| `storyboard.png` | Um quadro representativo de cada uma das 10 cenas, para aprovação. |
| `mapa-audio.md` | Locução com tempos, estrutura da trilha e pontos de efeito sonoro. |

## Como executar

```bash
npm install
npm run studio          # prévia interativa no navegador (Remotion Studio)
npm run render          # gera out/dme-institucional-80s.mp4
node scripts/stills.mjs out/testes 0,300,900   # quadros de teste
node scripts/stills.mjs out 0 Capa             # capa (salva out/f0000.png)
node scripts/gen-srt.mjs                       # regenera out/legendas.srt
```

O `remotion.config.ts` aponta para o Chromium já instalado no ambiente cloud. Em outra máquina, remova a linha `setBrowserExecutable` e o Remotion baixa o navegador sozinho.

## Como modificar

- **Tempos das cenas:** `src/data/scenes.ts` é a fonte única. Os blocos da cena 06 ficam em `APP_BLOCKS`.
- **Locução e legendas:** `src/data/narration.json` guarda o início e o fim de cada bloco, em quadros. `caption: false` esconde a legenda quando o título na tela já é a própria frase.
- **Fotografias reais:** coloque o arquivo em `public/assets/images/` e informe o caminho em `src/data/assets.ts`. A cena troca a ilustração vetorial pela foto e mantém a câmera virtual. Ver `ASSETS-PENDENTES.md`.
- **Narração e trilha:** coloque os WAVs em `public/assets/audio/` e preencha `narration` e `music` em `src/data/assets.ts`. Depois, ajuste os tempos de `narration.json` à locução real.
- **Cores, tipografia e movimento:** `src/theme/` (`colors.ts`, `typography.ts`, `motion.ts`).

## Estrutura

```
src/
  Root.tsx · DMEInstitutional.tsx · Cover.tsx
  scenes/      Scene01Hook … Scene10CTA (uma por cena)
  components/  AnimatedText (RevealText, StaggeredWords/WordSequence, MaskedHeadline, UnderlineReveal),
               BrandLogo (BrandLogoReveal), CinematicImage (+ Grain, Vignette), Illustrations,
               LightSweep, SceneTransition (GraphiteWipe, lineReveal), SystemCard, WorkflowDiagram,
               Subtitle (KineticCaption), Fonts
  theme/       colors.ts · typography.ts · motion.ts
  data/        scenes.ts · narration.json · assets.ts
public/  fonts/ (Sora e Manrope, OFL) · assets/brand/dme-logo.svg · assets/images · assets/audio
```

## Licenças e direitos

- **Fontes:** Sora e Manrope, sob licença SIL OFL (as licenças estão em `public/fonts/`).
- **Logo:** vetor redesenhado a partir do arquivo oficial enviado pela DME.
- **Imagens:** nenhuma foto de banco foi usada. Todas as cenas são vetoriais, feitas no projeto.
- **Áudio:** nenhum arquivo de música ou voz foi incluído.
- **Remotion:** é gratuito para pessoas físicas e empresas com até 3 funcionários. Empresas maiores precisam de uma licença de empresa (remotion.dev/license), e cabe à DME confirmar em que caso se enquadra.
