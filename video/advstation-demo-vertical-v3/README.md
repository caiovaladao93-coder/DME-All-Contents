# ADV Station · institucional vertical v2 (revisão de texto, tipografia, câmera e demonstração)

Esta pasta revisa `video/advstation-demo-vertical-v2`, que fica preservada, assim como `video/advstation-demo-vertical`. O projeto se chama `advstation-demo-vertical-v3` e entrega o arquivo **`ADV-Station-Institucional-Vertical-v2.mp4`**.

**Lógica de montagem:**

1. o título apresenta a ideia, no plano aberto e fora da área física do monitor;
2. o título sai;
3. a câmera se aproxima da operação;
4. a interface demonstra;
5. a legenda acompanha.

**Conceito:** "Cada caso tem seu caminho. Sua gestão precisa acompanhar."

- **Formato:** 9:16, 1080 × 1920, 30 fps, 68,0 s (2.040 quadros).
- **Exportação:** H.264 yuv420p, AAC 48 kHz, faststart.
- **Projeto:** Remotion, com a vinheta oficial no início e no fim.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `ADV-Station-Institucional-Vertical-v2.mp4` | Master (−15 LUFS, true peak ≤ −1,5 dBTP) |
| `ADV-Station-Institucional-Vertical-v2.srt` | Legenda completa de toda a narração, inclusive dos trechos em que a legenda queimada fica oculta |
| `ADV-Station-Institucional-Vertical-v2-narracao.wav` | Locução separada |
| `capa.png` | Quadro de 5,6 s: computador com a tela real e "Sua gestão precisa acompanhar" |
| `marcas-som.txt`, `conferencia.txt` | Marcas de áudio e conferência técnica |

## Estados explícitos (`src/Film.tsx`)

| Estado | Títulos | Legenda queimada | "Dados demonstrativos" |
|---|---|---|---|
| Plano aberto: equipamento (`EQUIP`) ou tela frontal com parede (`FRONT`) | Sim, sempre acima do monitor e fora da área física da tela | Oculta | Oculto |
| Zoom ou demonstração (`ZOOM`) | Nenhum | Visível, numa posição fixa (y 1330) e em área vazia, longe da região explicada; no máximo 2 linhas | Rótulo discreto no canto superior direito (y 256), fora da região útil |
| Retorno | Só depois de a câmera parar | Oculta | Oculto |

A legenda depende do **estado** (`zoomVis`) e não só do tempo do áudio.

**Regras das telas:**

- **Troca de tela:** só com a câmera parada no equipamento ou na tela frontal. A exceção é Administrativo → Judicial, que têm layout idêntico e por isso fazem um corte alinhado na mesma posição.
- **Aproximação:** acontece sobre a mesma captura, sem tela "pulando" por cima.
- **Escurecimento:** a máscara caiu de 0,42 para 0,16, aparece só durante a observação e destaca uma região por vez.
- **Sombra superior:** o gradiente marinho do topo foi retirado dos zooms.

## Sequência

| Tempo | Bloco | O que se vê |
|---|---|---|
| 0,0–2,2 | Vinheta (encurtada) | Ela se recolhe num círculo e revela o computador |
| 2,2–13,1 | Abertura | O computador mostra a tela real, com aproximação lenta. "Cada caso tem seu caminho" dá lugar a "Sua gestão precisa acompanhar". Em "família de softwares" entram os dois selos oficiais. Sem legenda |
| 13,1–20,4 | Maternidade Legal · organização | "Maternidade Legal" e depois "Informações reunidas". O título sai e a câmera chega a **Setor + Etapa** dos clientes |
| 20,4–27,4 | Maternidade Legal · etapas | Tela frontal com "Onde está cada caso?" na parede. A câmera vai às etapas reais do Setor de Protocolo e desliza, sem voltar ao equipamento, até as tags "Sem contato há mais de 10 dias" e "Inadimplente" |
| 27,4–30,2 | Troca de produto | Saída do zoom, enquadramento renovado do equipamento e "Previdenciário Geral" |
| 30,2–40,2 | Previdenciário Geral · demandas | **Administrativo** (Benefício · Setor · Etapa). Depois, um corte alinhado para o **Judicial** (Benefício · Nº Processo · Etapa, inclusive Aposentadoria) durante a lista de benefícios, que é **só falada** |
| 40,2–51,0 | Do detalhe ao conjunto | Título no equipamento. Detalhe: **Prazos Processuais** (Vencimento, Dias restantes, Prioridade, Status). Em "Amplie", a câmera passa pela tela frontal e chega ao **Dashboard Executivo**: Operação, depois Financeiro |
| 51,0–62,8 | Síntese | Equipamento, selos dos dois produtos e depois a pilha "Organizar. Acompanhar. Coordenar.", na ordem das palavras. O marfim sobe a partir do queixo do monitor |
| 62,8–68,0 | Assinatura | Vinheta oficial e "Conheça nossas soluções" (mais de 2 s), sem legenda |

## Mapa da demonstração

As capturas são reais, do "Escritório Demonstração", com dados fictícios. Cada tela é exibida em **escala uniforme** na área útil do monitor (nada é esticado). As 5 telas novas enviadas nesta revisão estão em `public/assets/telas/` (PNG) e `public/assets/telas/originais/` (webp originais).

| Produto | Operação | Arquivo | Região destacada (px da captura) | O que comprova |
|---|---|---|---|---|
| Maternidade Legal | Organização dos clientes | `ml-clientes.png` (1915 × 1075) | Setor + Etapa (766, 158, 350 × 290) | Cada cliente com setor e etapa |
| Maternidade Legal | Etapas | `ml-protocolo.png` (2000 × 1121) | Etapas (342, 194, 666 × 34) | Recebido do relacionamento, Preparando protocolo, Protocolado, Em análise |
| Maternidade Legal | O que exige atenção | `ml-protocolo.png` | Tags (1164, 320, 294 × 76) | "Sem contato há mais de 10 dias", "Inadimplente" |
| Previdenciário Geral | Demandas administrativas | `pg-administrativo.png` (2000 × 1123) | Benefício · Setor · Etapa (950, 186, 520 × 358) | Pipeline administrativo por benefício e etapa |
| Previdenciário Geral | Demandas judiciais | `pg-judicial.png` (2000 × 1124) | Benefício · Nº Processo · Etapa (968, 186, 520 × 156) | Auxílio-doença, BPC Idoso e Aposentadoria no judicial |
| Previdenciário Geral | Detalhe | `pg-prazos.png` (2000 × 1124) | Vencimento · Dias restantes · Prioridade · Status (1206, 318, 610 × 214) | Prazos vencidos, do dia e próximos |
| Previdenciário Geral | Conjunto | `pg-dashboard.png` (2000 × 1124) | Operação (318, 140, 800 × 112) e Financeiro (318, 650, 960 × 106) | Contadores de operação e valores financeiros |

Nenhum cursor, clique ou mudança de status foi simulado.

## Tipografia

- **Títulos:** serifa (Iowan → Palatino → Gelasio) em 700, com 96–112 px. Os nomes de produto ficam em 104–108 px.
- **Estilo:** caixa de sentença; dourado só na palavra-chave; sem glow e sem animação por letra.
- **Entrada:** máscara com deslocamento curto (0,6 s). A saída leva 0,3 s.
- **Apoio e legenda:** Fieldwork, com Nunito Sans provisória, em 44 px e no máximo 2 linhas.

## Áudio

**Locução:** Guilherme (`CS07DI8x8kLXeSktyWLG`), sem aceleração.

- **Falas reaproveitadas da v2:** r6, r10 e r11.
- **Falas novas:** as demais, com 3 tomadas cada, escolhidas por medição.
- **Conferência:** todas foram transcritas pelo speech-to-text da ElevenLabs. "A ADV Station" está correto em r2.

**Trilha:** original a 92 BPM, entre o jingle oficial da abertura e o do encerramento (este com ducking sob a fala). Tem acentos nas trocas de produto e nas aproximações.

## Editar e exportar

```bash
python3 scripts/linha_tempo.py && python3 scripts/trilha.py
node scripts/stills.mjs out/testes 420,570,780
npx remotion render src/index.ts ADVDemo out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts ADVCapa out/capa.png
```

**Onde editar** (`src/Film.tsx`):

- câmera: `KEYS`;
- estados de zoom e legenda: `ZOOM`;
- telas: `SCREENS`;
- destaques: `HLS`;
- títulos: componentes `Title`.

## Limitações e pendências

1. **Fieldwork:** o kit da Adobe está bloqueado neste ambiente, então Nunito Sans segue como provisória.
2. **Navegação:** sem gravações de navegação, as operações são estados reais e estáticos. A troca Administrativo → Judicial é um corte, não um clique.
3. **Telas da Maternidade Legal:** `ml-clientes.png` continua sendo a captura anterior (1915 px), porque não veio versão nova.
4. **advstation.io:** a rede bloqueia o site, então o endereço não foi confirmado e ficou fora do CTA.
5. **Revisão humana:**
   - o áudio foi conferido por medição e transcrição, não por escuta humana;
   - a sobreposição da interface do Reels não foi testada no aplicativo.
