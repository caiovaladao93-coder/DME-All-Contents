# DME · "Bastidores" (Reels 9:16, 50,2 s)

Reels institucional da DME feito a partir do resumo da empresa enviado pelo cliente ("Tecnologia que opera nos bastidores para que o negócio avance na frente"). O roteiro está em `roteiros/reels-bastidores.md`.

**Conceito:** um painel de aço com **frente** (o que o cliente vê) e **verso** (os bastidores da empresa).

1. **Abertura:** o painel mostra a frente, com a tela limpa de pedido confirmado.
2. **Giro:** o painel vira e revela o caos dos bastidores: janelas, planilhas, post-its, copiar/colar e sistemas sem conexão.
3. **"Agora":** o fundo vira aço claro.
4. **Organização:** o método Entender → Identificar → Desenvolver transforma o caos numa placa de circuito, com os nós IA, Automação e Integração e pulsos azuis.
5. **Volta:** o painel gira de novo para a frente (loop), agora com o selo "Operação conectada".
6. **Assinatura:** logo, slogan e CTA.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `DME-Bastidores-Reels.mp4` | Vídeo final (−14 LUFS, pico abaixo de −1,5 dBTP) |
| `DME-Bastidores-narracao.wav` | Narração separada |
| `DME-Bastidores-Reels.srt` | Legendas |
| `capa.png` | Capa: o verso revelado, com "Nos bastidores, a sua empresa é isto." |
| `quadro0.png` | Primeiro quadro (gancho legível) |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas e efeitos; ffprobe e loudness |

## Áudio

**Voz:** Lendário, com stability 0.5, style 0.25 e as frases vizinhas como contexto.

- **Pausas:** pedidas por `<break>` na própria fala, com respirações removidas (`scripts/pausas.py`).
- **Tomadas:** n1-1, n2-1, n3-3, n4-2, n5-1, n6-1, n7-4, n8-1 e n9-1.
- **Descarte:** a n8-3 saiu como ruído.
- **Fala n7:** foi encurtada para não repetir "sistemas".
- **Conferência:** a transcrição da mistura confere com o roteiro.

**Trilha:** eletrônica original a 120 BPM (`scripts/trilha.py`).

- **Gancho e trinca:** pulso contido no gancho; whoosh e impacto no giro; beat escuro em Ré menor na trinca.
- **Virada e método:** 0,4 s de silêncio e DROP no "Agora", seguidos de groove completo no método.
- **Fecho e assinatura:** breakdown no fecho, whoosh no giro de volta, acerto em "frente" e acorde final.

## Como gerar

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.5 --style=0.25
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
node scripts/stills.mjs out/testes 0,120,600
npx remotion render src/index.ts DMEBastidores out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts DMECapa out/capa.png
```

## Pendências

- **Áudio:** conferido por medição e transcrição, não por escuta humana.
- **Interface do Reels:** a sobreposição não foi testada no aplicativo. O texto fica entre y 250 e 1580.
- **Duração:** 50,2 s, acima da faixa padrão. A locução ocupa cerca de 43 s.
