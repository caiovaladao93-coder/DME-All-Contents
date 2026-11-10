# SGC · Institucional vertical (36,5 s, 9:16)

O cliente é o SGC (Sistema de Gestão Compartilhada), do repositório `jvramos10/sgc-prototipo`. O formato segue o modelo DME (`video/reels-ferias-v2`): gancho → trinca → tensão → virada "Agora…" → demonstração → montagem de tempo → verbos → fecho "Então, enquanto você…" → loop → assinatura com CTA. As cores são da marca SGC (`docs/sgc-sf/design-system.md`):

- marinho `#0A2048`;
- laranja `#F86A14`, só na palavra-chave;
- laranja-tinta `#AE4A0E`, para texto sobre fundo claro;
- petróleo `#176B86`, como apoio.

O logo é montado com as camadas oficiais de `static/brand/simbolo-*.png`, na mesma coreografia do `loginIntro` do app.

| Tempo | Cena | Texto na tela | Visual |
|---|---|---|---|
| 0–3,2 | Gancho | Quantas **planilhas** até uma decisão? | Arquivos soltos (vendas, estoque, DRE, ata) flutuando. Legível no quadro 0 |
| 3,2–6,2 | Trinca | Vendas **aqui**. · Estoque **ali**. · Financeiro em **outro lugar**. | Três cartões em lugares diferentes |
| 6,2–8,3 | Tensão | E a reunião vira **achismo**. | Balões: "Acho que vendeu bem", "…tem estoque", "…deu lucro" |
| 8,3–10,0 | Virada | **Agora** a gestão é **compartilhada**. | Círculo claro (fundo `#EDF1F6`) |
| 10,0–13,6 | Demonstração | Vendas, estoque e financeiro num só **lugar**. | vendas.csv, estoque.csv e financeiro.csv entram no SGC e viram PGV, CIL e DRE |
| 13,6–19,6 | Método | O método, dentro do **sistema**. | Sequência Informação → Análise → Decisão → Responsável → Execução → Cobrança → Resultado → Evolução, com um ponto laranja que percorre as etapas |
| 19,6–23,6 | Montagem de tempo | Segunda. · Quarta. · Sexta. | Celular com o painel e farol. Notificações: RPS registrada, ação concluída, relatório executivo em PDF. Selo "Exemplo ilustrativo" |
| 23,6–26,0 | Verbos | Medindo · Decidindo · Cobrando · Evoluindo | Bloco com ícones |
| 26,0–30,0 | Fecho | Então, enquanto você **decide**, o SGC acompanha a **execução**. | Selos: Direção, Equipe, Consultoria |
| 30,0–32,2 | Loop | E as **planilhas**? · Viraram **gestão**. | O arquivo do gancho gira e vira o cartão "Saúde do projeto" |
| 32,2–36,5 | Assinatura | Logo SGC + "Agende uma demonstração" | Logo oficial montado camada a camada |

## Fonte de cada afirmação (repositório do SGC)

- **Importação de vendas, estoque e financeiro por CSV, com prévia e validação:** `docs/sgc-sf/tour-homologacao.md`, passos 15, 17 e 19.
- **Módulos:**
  - PGV (vendas e metas, projeção);
  - CIL (estoque por loja, sem giro, rupturas e transferências);
  - DRE gerencial.
  - Fonte: `static/js/tour.js`.
- **Sequência do método:** "espinha" da apresentação em `docs/sgc-sf/modo-demonstracao.md`.
- **Toda segunda a RPS cobra os compromissos:** `static/js/tour.js`, etapa Acompanhamento.
- **Plano de ação com responsável, prazo e kanban:** `tour.js` e o passo 14 do tour.
- **Relatório executivo em PDF para a direção:** `tour.js`, etapa Relatórios, e o passo 24 do tour.
- **Farol com forma, ícone, cor e texto (No alvo, Atenção, Crítico):** `design-system.md`.

O painel, as notificações e os nomes de arquivos são ilustrativos e não mostram números do produto. O vídeo não inclui métricas, clientes nem depoimentos.

## Pendências para o cliente

- **CTA:** "Agende uma demonstração" é uma proposta, porque o modo demonstração comercial existe. Confirmar ou trocar.
- **Telas reais:** as capturas de `docs/evidencias-tour/` são da interface antiga ("SGC + SF"). Por isso, as telas são ilustrações na marca atual. Com capturas atuais, dá para trocar.
- **Áudio:** sem áudio, que é o padrão. Narração (voz do Guilherme) e trilha só se o cliente pedir.
