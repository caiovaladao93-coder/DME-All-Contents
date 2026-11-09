# Assets

## Imagens: concluído
As 8 cenas com fotografia usam vídeos do Pexels escolhidos pelo cliente. Origem, trechos e tratamento estão em `scripts/README-videos.md`. Se a DME tiver vídeos ou fotos da própria equipe (recomendado, principalmente para a cena 08), basta trocar o caminho em `src/data/assets.ts`.

## Áudio: pendente

| Campo | Arquivo |
|---|---|
| `narration` | Locução humana em pt-BR, madura e corporativa, de 125 a 145 palavras por minuto. O texto e os tempos estão em `out/legendas.srt`. |
| `music` | Trilha instrumental original ou licenciada, com a estrutura descrita em `out/mapa-audio.md`. |

Com a locução real em mãos, ajuste `src/data/narration.json` aos tempos reais (as legendas acompanham) e renderize de novo.
