# DME · apresentação institucional vertical (9:16, 59,9 s)

Apresentação profissional da DME, feita a partir do resumo institucional enviado pelo cliente. O roteiro está em `roteiros/dme-institucional-vertical.md`.

**Linguagem:** a de uma apresentação corporativa.

- Abertura com o logo montado em 4 peças.
- Seis capítulos numerados (01 Quem somos · 02 Premissa · 03 Abordagem · 04 Método · 05 Soluções · 06 Propósito).
- Mini-logo fixo no topo e indicador de capítulos.
- Um objeto de aço por capítulo.
- Assinatura com o slogan e o CTA institucional "Converse com a DME.".

| Capítulo | Objeto |
|---|---|
| 01 Quem somos | Quatro anéis de aço (Estratégia, IA, Automação e Sistemas digitais) entram na fala e se cruzam na DME |
| 02 Premissa | Citação que acende palavra por palavra **no tempo exato da fala**; "problema real" em azul |
| 03 Abordagem | Ícones de ferramentas tracejados saem; entram os cartões Processos, Desafios e Oportunidades |
| 04 Método | Linha vertical com 3 nós: Entender, Planejar e Desenvolver |
| 05 Soluções | Grade 2 × 2 (Diagnóstico, Mapeamento, Padronização e Automação) e as faixas IA e Integração de sistemas |
| 06 Propósito | Triângulo Pessoas · Informações · Sistemas que se alinha num fluxo único em "uma forma melhor de operar" |

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `DME-Institucional-Vertical.mp4` | Vídeo final (−14 LUFS, pico abaixo de −1,5 dBTP) |
| `DME-Institucional-Vertical-narracao.wav` | Narração separada |
| `DME-Institucional-Vertical.srt` | Legendas |
| `capa.png` | Capa: capítulo 01, com os anéis cruzando na DME |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas e efeitos; ffprobe e loudness |

## Áudio

- **Voz:** Lendário (stability 0.5, style 0.25), com o contexto das frases vizinhas e `<break>` nas pausas. As respirações foram removidas.
- **Tomadas:** n1-2, n2-1, n3-1, n4-2, n5-2, n6-2, n7-1 e n8-1.
- **Conferência:** a transcrição da mistura confere com o roteiro.
- **Trilha:** eletrônica original a 120 BPM, mais sóbria que a dos Reels:
  - acorde e sinos na abertura;
  - pulso a meio tempo nos capítulos 01 e 02;
  - groove completo do 03 ao 06;
  - acorde final na assinatura.

  Não há silêncio de virada, porque a peça é institucional.

## Como gerar

```bash
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npx remotion render src/index.ts DMEInstitucional out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts DMECapa out/capa.png
```

## Pendências

- **Áudio:** conferido por medição e transcrição, não por escuta humana.
- **Interface do Reels:** a sobreposição não foi testada no aplicativo.
