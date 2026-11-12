# W-EV · vídeo de apresentação (16:9, 40,4 s)

Filme curto de apresentação da **W-EV**, plataforma de recarga de veículos elétricos multimarcas (Motorista, Parceiros e Operação), feito em **Remotion** com as skills do repositório (`motion-graphics-video`, `remotion-best-practices` e `remotion-motion-graphics`).

- **Formato:** 1920 × 1080, 30 fps, H.264 com AAC 48 kHz.
- **Voz:** Lendário.
- **Assinatura:** só a marca, sem CTA, a pedido do cliente.
- **Fonte das informações:** o repositório do cliente `werbos-ai/w-ev`, enviado em zip (README, `docs/`, `apps/`, `packages/ui-tokens`). Nada foi inventado além dos dados fictícios de interface.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `WEV-Apresentacao.mp4` | Vídeo final (−14 LUFS, pico abaixo de −1,5 dBTP) |
| `WEV-Apresentacao-narracao.wav` | Narração separada |
| `WEV-Apresentacao.srt` | Legendas |
| `capa.png` | Capa: assinatura W-EV ("Energia em movimento.", POWERED BY WERBOS) |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas e efeitos; ffprobe e loudness |

## Roteiro

| Tempo | Fala (Lendário) | Imagem |
|---|---|---|
| 0–3,2 | "O próximo passo é elétrico." | O posto em wireframe isométrico se desenha. Kicker e título da landing da W-EV |
| 3,2–10,2 | "Uma plataforma de recarga multimarcas, que conecta quem dirige, quem oferece energia e quem opera a rede." | O posto vira o centro da rede. Os nós Motorista, Parceiros e Operação entram na palavra falada, ligados por linhas com pulsos de energia |
| 10,2–20,0 | "Para o motorista: encontre a estação no mapa, leia o QR Code do conector, escolha o valor e acompanhe a recarga do início ao fim." | Lista de 4 passos que acendem na fala. O celular troca de tela a cada passo: mapa, QR, valor e recarga (12,5 kWh, R$ 25,00 de R$ 40,00, comprovante e devolução) |
| 20,0–24,6 | "Para os parceiros: vendas e repasses visíveis em cada recarga." | O mesmo celular troca para o app Parceiros: vendas de 7 dias e repasse calculado (R$ 22,00, comissão de R$ 3,00) |
| 24,6–31,3 | "Na operação: estações, sessões, financeiro e auditoria em um só console." | Console no navegador: indicadores e 4 painéis que acendem na palavra falada |
| 31,3–35,2 | "Uma plataforma. Muitas jornadas." | Celular e console lado a lado, ligados por uma linha de energia |
| 35,2–40,4 | "Energia em movimento." | Marca W-EV®, feixe menta, slogan e POWERED BY WERBOS |

## Decisões e fontes

- **Identidade:** cores, fontes e marca vêm do repositório do cliente.
  - Cores de `landing.css` e `packages/ui-tokens`: fundo `#0B100E`, menta `#64E6B5`, superfícies `#151817` e `#1B1F1E`.
  - Fontes Manrope e DM Sans (OFL), copiadas de `apps/admin-web/public/fonts`.
  - A marca é a palavra "W-EV" em Manrope 800, com espaçamento −0,08 em e ®.
- **Textos:** frases da própria landing ("O próximo passo é elétrico.", "UMA NOVA ENERGIA PARA IR ALÉM", "Energia em movimento.", "Uma plataforma. Muitas jornadas.").
- **Valores das telas:** espelham o cenário de teste documentado em `docs/validation.md`: R$ 40 pagos, 12,5 kWh, R$ 25 de venda, R$ 15 de devolução, R$ 3 de comissão e R$ 22 ao parceiro. São fictícios e levam o selo "Exemplo ilustrativo".
- **O que ficou de fora:**
  - "Tempo real", porque o console documenta consulta periódica.
  - Lojas de aplicativo, meio de pagamento específico (o PSP não está definido), Intelbras e qualquer promessa de disponibilidade, porque o produto ainda não está liberado para produção.
- **Nome falado:** o narrador não pronuncia "W-EV", porque a pronúncia oficial não foi confirmada. A marca aparece escrita.
- **Áudio:**
  - **Vinheta e sons do app:** a vinheta oficial `wev-intro.mp3` entra na assinatura. Os sons do app (`update`, `confirmation`, `charging-start` e `complete`) marcam os passos do motorista. Todos vêm do repositório do cliente.
  - **Trilha:** eletrônica original a 120 BPM. Tem impacto em "elétrico", groove completo na demonstração, breakdown e acerto em "Muitas jornadas".

## Como gerar

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.5 --style=0.25
python3 scripts/pausas.py        # aplica as tomadas escolhidas (TOMADA) e remove respirações
python3 scripts/linha_tempo.py && python3 scripts/trilha.py
node scripts/stills.mjs out/testes 0,300,600
npx remotion render src/index.ts WEVApresentacao out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts WEVCapa out/capa.png
```

**Tomadas usadas:** n1-2, n2-1, n3-1, n4-2, n5-4, n6-1 e n7-2.

- A n5 foi reescrita de "Para a operação" para "Na operação", porque a voz pronunciava "Para Z operação".
- A transcrição da mistura final confere com o roteiro.

## Pendências

- **Áudio:** conferido por medição e transcrição, não por escuta humana.
- **Pronúncia da marca:** se a W-EV quiser o nome falado, confirme a pronúncia oficial.
