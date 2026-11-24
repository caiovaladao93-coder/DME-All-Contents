# "Meio-Campo · A resenha" · animática para trabalho de faculdade (Legislação Publicitária)

Anúncio de 30 s de uma casa de apostas **fictícia**, feito para cumprir as regras brasileiras de publicidade de apostas. Não tem marca DME.

- **Arquivo final:** `out/meio-campo_a-resenha.mp4`, com 1920×1080, 30 fps, exatamente 30,000 s (900 quadros), H.264 em yuv420p (`-preset veryfast`) e áudio AAC.
- **Como é feito:** `video.html` traz cenas em HTML e SVG com animação determinística (`renderAt(t)`, sem relógio real). `render.js` captura os quadros com Playwright e monta o vídeo com ffmpeg. `audio.sh` gera um ambiente de sala e torcida **sintetizado no ffmpeg**, a partir de ruído rosa filtrado, sem música nem efeitos de terceiros.
- **Comandos:** `node render.js video.html out/meio-campo_a-resenha-mudo.mp4 1920 1080 30 30` e depois `bash audio.sh`.
- **Estilo:** ilustração flat, quatro amigos adultos (barba, roupas casuais) e a paleta #0F3D2E / #F4F1EA / #E0B33A / #2B2B2B, em Inter. Os times da TV são inventados (AZUL × VERDE), de camisa lisa e sem escudos.

## Conformidade (conferida nos quadros de `out/verificacao/`)

| Regra | Como foi cumprida |
|---|---|
| Advertência em 100% do tempo | Faixa preta fixa de 120 px (11,1% da altura) com "Ministério da Fazenda adverte: Apostar faz você perder dinheiro" em branco, sem animação e sem nada por cima, de 0 s a 30 s |
| 18+ | Selo em círculo branco com texto preto, à direita da faixa, o tempo todo |
| Sem chamada para ação | Não há "aposte", "baixe", "cadastre-se", QR code, link, código nem bônus |
| Sem valores, odds ou palpites | O app mostra só "Seu limite mensal está ativo ✓" |
| Sem promessa de ganho | O roteiro mostra a perda: "Errei o palpite. Mas a resenha valeu." |
| Sem celebridades, crianças, mascotes ou animais | Quatro adultos genéricos |
| Sem álcool | Pipoca e refrigerante (copos com canudo) |
| Sem clubes ou campeonatos reais | Times AZUL e VERDE, camisas lisas e placar inventado |
| Texto legal | Razão social e autorização fictícias, "Proibido para menores de 18 anos. Jogue com responsabilidade.", de 24,6 s a 30 s (5,4 s) |

As legendas (falas e locução) ficam na tela para a locução ser gravada depois.
