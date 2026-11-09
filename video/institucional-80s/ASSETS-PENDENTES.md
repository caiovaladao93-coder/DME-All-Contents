# Assets pendentes

O storyboard pede fotografia realista em 8 momentos. Neste ambiente, os bancos de imagem (Pexels e Unsplash) estão bloqueados e não há fotos oficiais da DME. Por isso, cada um desses momentos usa uma **ilustração vetorial temporária** (ambiente, objetos e telas, sem pessoas) com a mesma câmera virtual. Para trocar, coloque a foto em `public/assets/images/` e preencha o campo correspondente em `src/data/assets.ts`.

| Campo | Cena | Foto necessária (direção do storyboard) |
|---|---|---|
| `s01` | 01 · 00:00–00:06 | Profissional diante do monitor, close lateral a 45°, 50 mm, profundidade de campo reduzida, monitor iluminando o rosto e luz azul de recorte. Expressão concentrada. |
| `s02a` | 02 · 00:06–00:09 | Mesa profissional vista de cima (35°), notebook com planilhas, documentos, sem marcas nem dados pessoais. |
| `s04` | 04 · 00:24–00:34 | Reunião consultiva com 3 ou 4 pessoas, plano médio lateral (30°), 35 mm, mesa escura, fluxogramas em papel, luz natural com azul frio. Ninguém olhando para a câmera. |
| `s06a` | 06 · Atendimento | Profissional com notebook e headset discreto, plano médio lateral, luz azul suave. |
| `s06b` | 06 · Comercial | Plano sobre o ombro (35°), notebook com etapas comerciais. |
| `s06c` | 06 · Gestão | Equipe administrativa analisando informações em uma tela, plano médio aberto. |
| `s07` | 07 · 00:57–01:08 | Profissional observando um monitor, câmera atrás do ombro (25°), ambiente moderno com luz equilibrada. |
| `s08` | 08 · 01:08–01:13 | Equipe colaborando em escritório moderno, imagem mais clara. **De preferência, a equipe real da DME.** Se for banco de imagem, não apresentar as pessoas como funcionários da DME. |

**Formato recomendado:** JPG vertical com pelo menos 1080×1920 (de preferência 1350×2400, para sobrar margem para a câmera virtual), com licença comercial.

## Áudio pendente

| Campo | Arquivo |
|---|---|
| `narration` | Locução humana em pt-BR, madura e corporativa, de 125 a 145 palavras por minuto. O texto e os tempos estão em `out/legendas.srt`. |
| `music` | Trilha instrumental original ou licenciada, com a estrutura descrita em `out/mapa-audio.md`. |

Com a locução real em mãos, ajuste `src/data/narration.json` para os tempos reais (as legendas acompanham) e renderize de novo.
