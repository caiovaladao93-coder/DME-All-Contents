# ADV Station · demonstração institucional cinematográfica (vertical, 68 s) · v2

Esta é uma evolução de `video/advstation-demo-vertical`, com o texto de narração revisado e a regra **contexto → aproximação → operação → resultado observável**. Cada operação fica no mínimo 2,5 s estável, e a câmera só volta ao equipamento para trocar de produto e na síntese.

- **Formato:** 9:16, 1080 × 1920, 30 fps, 2.040 quadros.
- **Exportação:** H.264 yuv420p, AAC 48 kHz, faststart.
- **Vinheta:** a vinheta padrão oficial (réplica de `.asvv` com o jingle) abre e fecha o filme. A abertura é encurtada para 2,6 s, já com a marca completa, porque o briefing pede para não abrir com vinheta longa.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `ADV-Station-Institucional-Vertical.mp4` | Master (−15 LUFS, true peak ≤ −1,5 dBTP) |
| `ADV-Station-Institucional-Vertical.srt` | Legendas |
| `ADV-Station-Institucional-Vertical-narracao.wav` | Locução separada |
| `capa.png` | Capa: quadro de 6,2 s (computador com a tela real de clientes e "Cada caso tem seu caminho") e marca oficial na versão escura, sobre a parede marinho |
| `marcas-som.txt`, `conferencia.txt` | Marcas de áudio e conferência técnica |

## Sequência

| Tempo | Etapa | O que se vê |
|---|---|---|
| 0,0–2,6 | Vinheta | A vinheta oficial se recolhe no símbolo |
| 2,6–12,0 | Abertura | O computador já mostra o sistema e a câmera se aproxima desde o primeiro segundo. "Cada caso tem seu caminho" e "Gestão para a advocacia previdenciária" |
| 12,0–19,4 | Maternidade Legal · clientes | Estrutura da tela, depois aproximação à região **Setor + Etapa** (5 s estáveis). Etiqueta "Informações organizadas" |
| 19,4–26,6 | Maternidade Legal · etapas | Setor de Protocolo: etapas reais (Recebido do relacionamento, Preparando protocolo, Protocolado, Em análise). Depois "o que exige atenção": as tags reais "Sem contato há mais de 10 dias" e "Inadimplente". Título "Clareza sobre cada etapa" |
| 26,6–29,9 | Troca de produto | A câmera recua ao equipamento e a tela troca para o Previdenciário Geral |
| 29,9–41,2 | Previdenciário Geral | Visão geral do Administrativo, depois Benefício · Setor · Etapa, depois o bloco **Judicial** do painel. Os benefícios atendidos entram como texto editorial em duas composições, com a tela inteira (sem destacar coluna) |
| 41,2–47,2 | Visão gerencial | Painel: faixa Operação, depois faixa Financeiro |
| 47,2–62,6 | Síntese | Equipamento; selos dos dois produtos com o mesmo peso; "Organização", "Clareza" e "Acompanhamento", na ordem da fala. O marfim sobe a partir da borda do queixo do monitor |
| 62,6–68,0 | Assinatura | Vinheta oficial com "Conheça nossas soluções" |

## Mapa da demonstração (fontes das interfaces)

**Fontes:** as 5 capturas reais (1918 × 1077) do "Escritório Demonstração", com dados fictícios e o selo "Dados demonstrativos".

**O que não estava disponível:**

- o vídeo de apresentação de 1min54 não está neste ambiente (o único vídeo ADV disponível é o comercial 3D);
- não há gravação de navegação.

Por isso as operações são **estados reais**, sem cliques, cursor ou mudança de status simulados.

| Produto | Operação | Arquivo | Região enquadrada (px da captura) | O que comprova | Benefício explicado |
|---|---|---|---|---|---|
| Maternidade Legal | Organização dos clientes | `telas/ml-clientes.png` | Setor + Etapa (766, 158, 350 × 290) | Cada cliente com setor e etapa | Informações organizadas |
| Maternidade Legal | Acompanhamento das etapas | `telas/ml-protocolo.png` | Etapas (330, 184, 638 × 36) | Etapas do setor de protocolo | Onde cada caso está |
| Maternidade Legal | O que exige atenção | `telas/ml-protocolo.png` | Tags (1116, 306, 284 × 70) | "Sem contato há mais de 10 dias", "Inadimplente" | O que exige atenção |
| Previdenciário Geral | Demandas administrativas | `telas/pg-administrativo.png` | Benefício · Setor · Etapa (905, 178, 580 × 342) | Pipeline INSS por benefício e etapa | Acompanhamento administrativo |
| Previdenciário Geral | Demandas judiciais | `telas/pg-dashboard.png` | Judicial (692, 316, 362 × 172) | Protocolados, procedentes e improcedentes no judicial | Acompanhamento judicial |
| Previdenciário Geral | Visão gerencial | `telas/pg-dashboard.png` | Operação (304, 137, 1552 × 106) e Financeiro (304, 624, 926 × 104) | Contadores de operação e valores | Visão operacional e financeira |

## Computador

**Origem:** foto Pexels 6483591, de Mikael Blomkvist.

**Tratamento:** a parede passou de verde para marinho, preservando luz e sombra, e foi estendida para cima. O aparelho, a mesa e os reflexos não foram alterados.

**Perspectiva:** a foto é frontal, e o briefing proíbe inventar ângulos deformando a imagem. Por isso a "perspectiva leve" foi traduzida em variação de escala e de posição. A tela entra na câmera sempre alinhada, e a passagem para o detalhe é contínua sobre a mesma captura em resolução original.

## Áudio

**Locução:** voz Guilherme, sem aceleração.

- **Falas reaproveitadas:** n1, n6, n10 e n11, idênticas às já validadas.
- **Falas novas:** as demais, com 3 tomadas cada, escolhidas por medição e conferidas por transcrição.
- **Fala n2:** precisou de 9 tomadas. Várias saíam "DevStation" ou "AdvStation"; a usada (n2-1 da segunda leva) sai "ADV Station" nas duas transcrições.

**Trilha:** original e discreta, entre o jingle oficial da abertura e o do encerramento (este com ducking sob a fala). Tem acentos nas trocas de produto e nas aproximações. Sem sons de clique.

## Editar e exportar

```bash
python3 scripts/linha_tempo.py && python3 scripts/trilha.py
node scripts/stills.mjs out/testes 420,570,780   # quadros de teste
npx remotion render src/index.ts ADVDemo out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts ADVCapa out/capa.png
```

**Onde editar** (`src/Film.tsx`):

- câmera: `KEYS`;
- telas: `SCREENS`;
- destaques: `HLS`;
- textos: camada de leitura.

## Pendências

1. **Gravação de navegação:** para mostrar operações interativas reais, faltam gravações de tela de cada produto (1920 × 1080 ou mais, 30 fps, de 6 a 10 s cada, sem textos sobrepostos):
   - **Maternidade Legal:** abrir a lista de clientes e filtrar por setor.
   - **Maternidade Legal:** abrir o Setor de Protocolo e passar pelas etapas.
   - **Previdenciário Geral:** navegar de Administrativo para Judicial.
2. **Fonte Fieldwork:** o kit está bloqueado neste ambiente. Apoio e legendas usam Nunito Sans como provisória.
3. **advstation.io:** não foi possível confirmar o endereço, que ficou fora do CTA.
4. **Revisão humana:** o áudio foi conferido por medição e transcrição, não por escuta humana. A sobreposição da interface do Reels não foi testada no aplicativo.
