# ADV Station · demonstração real do produto (vertical, 68 s)

Conceito: **"Cada caso tem seu caminho. A gestão precisa acompanhar."**

- **Formato:** 9:16, 1080 × 1920, 30 fps, 2.040 quadros.
- **Exportação:** H.264 yuv420p, AAC 48 kHz, faststart.
- **Projeto:** Remotion (React/TS), com a mesma vinheta oficial validada na peça `advstation-reels-apresentacao`, no início e no fim.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `ADV-Station-Institucional-Vertical.mp4` | Master (−15 LUFS, true peak ≤ −1,5 dBTP) |
| `ADV-Station-Institucional-Vertical.srt` | Legendas (no máximo 2 linhas, quebras por sentido) |
| `ADV-Station-Institucional-Vertical-narracao.wav` | Locução separada |
| `capa.png` | Capa vertical: computador com tela real, título e marca oficial (versão escura do manual) |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas, trilha e jingles; ffprobe, loudness e quadros pretos |

**Prévia:** `npx remotion studio src/index.ts` abre a timeline com scrub (modo de revisão). O render é o modo limpo.

## Estrutura

| Tempo | Bloco | Imagem |
|---|---|---|
| 0,0–3,9 | Vinheta padrão + jingle oficial | Réplica de `.asvv` (manual). Ela se recolhe num círculo no símbolo e revela o computador |
| 3,9–14,3 | Contexto | Equipamento inteiro com a tela de clientes, em aproximação curta. Títulos "Cada caso tem seu caminho" e "Gestão para a advocacia previdenciária" |
| 14,3–23,0 | Maternidade Legal · clientes | Tela quase frontal e depois a região real **Setor + Etapa**. Etiqueta "Informações organizadas" |
| 23,0–30,3 | Maternidade Legal · etapas | Setor de Protocolo. A câmera desliza pelas etapas reais (Preparando protocolo, Protocolado, Em análise… Em Recurso Ordinário, Concedido). Título "Clareza sobre cada etapa" |
| 30,3–43,6 | Previdenciário Geral | A troca de produto passa pelo equipamento inteiro. **Administrativo** (Benefício, Setor, Etapa), depois o bloco **Judicial** do painel. Os benefícios atendidos entram como texto editorial, em duas composições |
| 43,6–49,2 | Visão gerencial | Painel: faixa **Operação** e faixa **Financeiro**, uma de cada vez |
| 49,2–62,5 | Portfólio | Equipamento com os selos oficiais dos dois produtos, em hierarquia igual. Depois "Organização", "Acompanhamento" e "Clareza". O queixo branco do monitor conduz ao marfim |
| 62,5–68,0 | Vinheta padrão + jingle oficial | Marca oficial e o título "Conheça nossas soluções", estáveis até o último quadro |

## Mapa de fontes das interfaces

As telas são capturas reais (1918 × 1077) do "Escritório Demonstração", com dados fictícios. Não houve redesenho, recriação nem alteração de números. O selo "Dados demonstrativos" aparece em todos os trechos com tela em leitura.

| Operação | Arquivo | Região destacada (px da captura) | Afirmação sustentada |
|---|---|---|---|
| Organização dos clientes | `public/assets/telas/ml-clientes.png` | Setor + Etapa (766, 158, 350 × 290) | "a organização dos clientes" |
| Acompanhamento das etapas | `public/assets/telas/ml-protocolo.png` | Etapas (546, 184, 422 × 36) e (1420, 184, 296 × 36) | "Da preparação do protocolo ao acompanhamento do desfecho" |
| Rotina administrativa | `public/assets/telas/pg-administrativo.png` | Benefício + Setor + Etapa (905, 178, 580 × 342) | "visão das rotinas administrativas" |
| Rotina judicial | `public/assets/telas/pg-dashboard.png` | Bloco Judicial (692, 316, 362 × 172) | "e judiciais" |
| Visão operacional e financeira | `public/assets/telas/pg-dashboard.png` | Operação (304, 137, 1552 × 106) e Financeiro (304, 624, 926 × 104) | "Informações operacionais e financeiras" |

**Regras da demonstração:**

- **Benefícios citados:** "Aposentadorias, benefícios por incapacidade, pensão por morte e auxílio-acidente" descrevem o **escopo do produto** informado pelo cliente. Aparecem como texto editorial sobre a tela inteira, **sem** destacar a coluna Benefício, cujos exemplos de demonstração são BPC e Auxílio-Acidente.
- **Interação:** nenhum cursor nem clique foi simulado. As trocas de tela são passagens limpas entre estados reais.

## Computador

**Origem:** foto **Pexels 6483591, de Mikael Blomkvist** (licença Pexels). O original está em `public/assets/computador/original/`.

**Tratamento** (`scripts/preparar_computador.py`):

- **Parede:** de verde para marinho, preservando luminância e sombra.
- **Extensão:** parede estendida para cima, para o enquadramento vertical do equipamento inteiro.
- **O que não mudou:** o aparelho, a mesa e os reflexos.
- **Área útil da tela:** 2878 × 1617 px, na proporção das capturas. As telas entram sem esticar.

## Áudio

**Locução:** voz Guilherme (padrão ADV, sem aceleração).

- **Falas reaproveitadas:** v1, v9 e v10, idênticas às já validadas.
- **Falas novas:** v2–v8, 3 tomadas por fala, escolhidas por medição.
- **Conferência:** todas foram transcritas pelo speech-to-text da ElevenLabs. A v2-1 dizia "A DV Station" e foi descartada.

**Trilha** (`scripts/trilha.py`):

- **Vinhetas:** jingle oficial no início e no fim; no fim, com ducking sob a fala.
- **Entre as vinhetas:** instrumental original discreta, a 92 BPM.
- **Acentos:** nas trocas de produto e nas aproximações importantes. Sem sons de clique.

## Editar e exportar

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --so=v2 --takes=3 --speed=1.0
python3 scripts/escolher_take.py v2,v3,v4,v5,v6,v7,v8 --aplicar --forcar=v2:3,v3:3,v4:3,v5:2,v6:3,v7:2,v8:2 && cp voz/v*.mp3 public/assets/audio/falas/
python3 scripts/linha_tempo.py      # src/data/timeline.json
python3 scripts/trilha.py           # trilha + jingles, narração separada, SRT e marcas
node scripts/stills.mjs out/testes 555,1416   # quadros de teste
npx remotion render src/index.ts ADVDemo out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts ADVCapa out/capa.png
```

**Onde editar** (`src/Film.tsx`):

- câmera: `KEYS`;
- telas exibidas: `SCREENS`;
- destaques: `HLS`;
- títulos: camada de leitura.

## Pendências

1. **Fonte Fieldwork (apoio e legendas):**
   - o kit da Adobe Fonts está bloqueado pela rede deste ambiente;
   - o token `APOIO` chama `Fieldwork` primeiro; até lá, usa **Nunito Sans (OFL), como provisória**.
2. **Gravações de navegação:** não há gravações originais disponíveis, só capturas estáticas. As operações são mostradas como estados reais, sem simular cliques.
3. **advstation.io:** a rede bloqueia o site, então o endereço não foi confirmado e ficou fora do CTA.
4. **Revisão humana:**
   - o áudio foi conferido por medição e transcrição, não por escuta humana;
   - a sobreposição da interface do Reels não foi testada no aplicativo.
