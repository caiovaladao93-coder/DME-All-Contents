# DME · "A planta da operação" (filme horizontal, roteiro v1)

> **Conceito:** "Toda empresa tem uma planta. Poucas conhecem a sua."
> Um filme em linguagem de **desenho técnico de engenharia**: a empresa aparece como uma maquete isométrica de aço. Um **raio-X** atravessa a estrutura e revela, como num laudo técnico, os caminhos que o trabalho realmente percorre. A DME então faz o que um engenheiro faz: diagnostica, mapeia, padroniza e automatiza, e a planta é redesenhada diante do espectador.

## 1. Por que essa ideia

| Objetivo | Como o filme entrega |
|---|---|
| **Prender a atenção** | O gancho é uma afirmação incômoda e verdadeira ("Poucas conhecem a sua"). A imagem é uma estrutura que se desenha sozinha em linhas finas e luz azul, um visual raro em vídeo institucional. O raio-X funciona como revelação, porque o espectador quer ver "o que há por dentro". |
| **Gerar credibilidade** | A estética de **prancha técnica** sugere método, rigor e engenharia: grade milimetrada, cotas, carimbo de documento ("DME · DOC 001 · REV. A"), figuras numeradas e notas de rodapé. Não há métricas inventadas; a credibilidade vem da forma de pensar, que é exatamente o posicionamento da DME ("a tecnologia só gera valor quando resolve um problema real"). |
| **Ser diferente das peças anteriores** | Os vídeos anteriores usaram um token (Processos que fluem), um painel frente/verso (Bastidores) e capítulos (Institucional). Este é um **documentário técnico**, com câmera orbitando uma maquete, anotações em tempo real e o "antes e depois" desenhado sobre a mesma estrutura. |
| **Fechar com memória** | Loop de linguagem: abre com "Poucas conhecem a sua" e fecha com "Agora, você conhece a sua." |

## 2. Especificação de entrega

| Item | Valor |
|---|---|
| Formato | **16:9 · 1920 × 1080 · 30 fps · H.264 + AAC 48 kHz · −14 LUFS** |
| Duração | **cerca de 65 s** (versão de 30 s prevista no item 9) |
| Uso | Site, YouTube, LinkedIn e apresentações comerciais |
| Ferramenta | Remotion, seguindo as skills `remotion-best-practices` e `remotion-motion-graphics` (com as regras da marca por cima), com conferência por quadros |
| Voz | ElevenLabs (**a definir: Lendário ou Guilherme**, ver item 10), com pausas por `<break>` e respirações removidas |
| Trilha | Original e procedural, tipo **"score de documentário técnico"**: pulso grave, cordas sintéticas, ticks de relógio e um tema que se resolve na assinatura |
| Saídas | MP4 final, MP4 sem legenda, SRT, narração WAV, `marcas-som.txt`, capa 16:9 e `conferencia.txt` |

## 3. Direção de arte

**Paleta (identidade DME)**

| Elemento | Cor |
|---|---|
| Fundo | `#0A0B0C` |
| Prancha (papel técnico escuro) | `#101316`, com grade milimetrada em `#C0C6CC` a 6% (passo de 24 px) e grade maior a 12% (passo de 120 px) |
| Linhas do desenho | Aço `#C0C6CC`, 1,5 a 2 px |
| Raio-X e planta nova | Azul de destaque `#3A6EA5`, só nos elementos "da DME" e na palavra-chave |
| Profundidade e sombras | `#264B71` |

Não usar vermelho nem cores de alerta: os problemas aparecem em **aço tracejado** e nas anotações. Sem neon, glow, partículas, fotos ou pessoas.

**Tipografia**

| Uso | Fonte |
|---|---|
| Títulos | **Sora 700/800**, 64–96 px, em caixa de frase |
| Anotações técnicas | **Manrope 600** em **caixa alta espaçada** (+0,18 em), 18–24 px, com números de figura (`FIG. 01`) |
| Carimbo e rodapé | Manrope 500, 16–18 px, em aço a 60% |

**Elementos de prancha (presentes o filme todo)**

- **Moldura:** margem de 64 px com cantos em L.
- **Carimbo (canto inferior direito):** `DME TECHNOLOGY · DOC 001 · PLANTA DA OPERAÇÃO · REV. A`. A revisão muda para **REV. B** depois da virada, um detalhe que recompensa quem presta atenção.
- **Régua superior:** marcações de 0 a 100 que andam com a câmera.
- **Escala gráfica:** "ESC. 1:1 · OPERAÇÃO", no canto inferior esquerdo.
- **Indicador de etapa** (topo à direita): `01 LEVANTAMENTO · 02 DIAGNÓSTICO · 03 PROJETO · 04 EXECUÇÃO`.

**A maquete (objeto principal)**

- **Forma:** um edifício isométrico de **4 pavimentos**, cada um um setor genérico: **Atendimento** (térreo), **Comercial**, **Financeiro** e **Operação** (topo). Tem lajes de aço escovado com espessura real em CSS 3D (lâminas), pilares e escadas.
- **Vistas:** a câmera alterna **vista isométrica**, **corte lateral** (o edifício "abre" como uma planta em corte) e **planta baixa** (vista de cima de um pavimento).
- **Fluxos de trabalho:** linhas que percorrem os pavimentos. Antes, são **tracejadas, emaranhadas e com retornos**. Depois, ficam **contínuas, ortogonais e azuis**, com um pulso que percorre o caminho.

**Anotações técnicas (o "laudo")**

Chamadas com linha de chamada (leader) até o ponto exato, círculo numerado e texto em caixa alta. Exemplos:

- `FIG. 01 — MESMA INFORMAÇÃO EM 3 LUGARES`
- `FIG. 02 — APROVAÇÃO EM ESPERA`
- `FIG. 03 — TAREFA RETORNA À ORIGEM`
- `FIG. 04 — SISTEMAS SEM COMUNICAÇÃO`

As chamadas se desenham (traço → círculo → texto letra a letra em 0,3 s). Nunca há números estatísticos.

## 4. Linguagem de movimento

- **Câmera:**
  - órbita lenta e contínua em torno da maquete (8° a 12° por cena, com easing 0.65/0/0.35/1);
  - cortes só na virada e na assinatura;
  - durante a leitura de anotações, a câmera **para** (≥ 1,2 s parada por figura).
- **Desenho:** as linhas sempre **se desenham** (stroke-dashoffset), nunca aparecem prontas. A ordem é contorno → estrutura → detalhe.
- **Raio-X:** um plano horizontal de luz azul fria e fina (2 px, com borda suave de 40 px, sem glow forte) varre o edifício de baixo para cima. Ao passar, ele torna as lajes semitransparentes e revela os fluxos internos.
- **Redesenho (virada):** o edifício não é trocado. As linhas tracejadas **se apagam no sentido inverso** e as novas se desenham em azul por cima, na mesma maquete, como uma revisão de projeto.
- **Texto:** frase palavra por palavra com desfoque de movimento, palavra-chave em azul e saída para cima antes de a próxima entrar. Nunca há duas frases legíveis competindo.

## 5. Roteiro detalhado

> Tempos estimados para a locução natural. A montagem final se ancora nas palavras reais da voz (`timeline.json`).

### CENA 1 · Gancho: a planta (0:00–0:07)

| | |
|---|---|
| **Locução** | "Toda empresa tem uma planta. *(pausa 0,4 s)* Poucas conhecem a sua." |
| **Na tela** | 0:00 — a prancha vazia com grade, moldura e carimbo (`REV. A`) já visíveis no quadro 0. Título no terço esquerdo: **"Toda empresa tem uma planta."**<br>0:03,5 — o título sobe e entra **"Poucas conhecem *a sua.*"** |
| **Imagem** | Do centro-direita, as linhas de aço desenham o edifício isométrico na ordem lajes → pilares → escadas → contorno dos setores, em cerca de 3,5 s. Cotas aparecem nas laterais ("PAV. 01 — ATENDIMENTO" … "PAV. 04 — OPERAÇÃO") |
| **Câmera** | Plano geral 3/4 com aproximação lenta (escala 1,00 → 1,06) |
| **Som** | Tick de lapiseira em cada linha que se fecha; pulso grave a 72 BPM entra em 0:02 |
| **Transição** | A câmera gira 10° e as lajes ganham espessura de aço escovado: a planta vira maquete |

### CENA 2 · Por fora (0:07–0:13)

| | |
|---|---|
| **Locução** | "Por fora, a operação parece funcionar." |
| **Na tela** | Indicador de etapa: **01 LEVANTAMENTO**. Título: **"Por fora, tudo parece *funcionar.*"** |
| **Imagem** | A maquete completa e "limpa", com fachada opaca e pequenas janelas acendendo em ritmo regular (atividade). Uma etiqueta discreta na fachada: `FACHADA`. Tudo parece em ordem |
| **Câmera** | Órbita de 8° pela esquerda |
| **Som** | Pulso estável; textura de cordas sintéticas em Ré menor, contida |

### CENA 3 · O raio-X (0:13–0:20)

| | |
|---|---|
| **Locução** | "Por dentro, o trabalho percorre caminhos que ninguém desenhou." |
| **Na tela** | Título: **"Por dentro, caminhos que *ninguém desenhou.*"** |
| **Imagem** | O **plano de raio-X** azul varre o edifício de baixo para cima em 2,5 s. Onde passa, as lajes ficam translúcidas e aparecem **os fluxos reais**: linhas tracejadas em aço que sobem e descem entre pavimentos, cruzam-se, voltam e terminam em becos sem saída |
| **Câmera** | Parada durante a varredura, para acompanhar o plano |
| **Som** | Varredura (ruído filtrado subindo, 2,5 s) e um "clique" de scanner ao final |
| **Detalhe** | O carimbo passa a mostrar `LEVANTAMENTO CONCLUÍDO` por 1 s |

### CENA 4 · O laudo: trinca de problemas (0:20–0:31)

| | |
|---|---|
| **Locução** | "Informação que se repete. *(break 0,35)* Aprovação que espera. *(break 0,35)* Tarefa que volta para o início." |
| **Na tela** | Indicador: **02 DIAGNÓSTICO**. Uma figura por frase, com a câmera aproximando o pavimento correspondente (corte lateral):<br>• **FIG. 01 — MESMA INFORMAÇÃO EM 3 LUGARES:** no pavimento Comercial, um documento se copia em três telas, ligadas por linhas tracejadas.<br>• **FIG. 02 — APROVAÇÃO EM ESPERA:** no pavimento Financeiro, um fluxo para numa "porta" fechada, com um relógio de linha cujo ponteiro gira.<br>• **FIG. 03 — TAREFA RETORNA À ORIGEM:** em Operação, uma seta faz um laço completo e volta ao Atendimento.<br>Título por figura, no terço esquerdo: **"Informação que *se repete.*"** / **"Aprovação que *espera.*"** / **"Tarefa que *volta.*"** |
| **Câmera** | Três reenquadramentos (0,8 s cada), cada um parado durante a leitura |
| **Som** | Um tick grave por figura; o pulso ganha um acento a cada frase |
| **Regra** | As figuras ficam na tela até o fim da cena, acumulando o "laudo"; os títulos se trocam |

### CENA 5 · Tensão (0:31–0:37)

| | |
|---|---|
| **Locução** | "Isso não é falta de esforço. *(break 0,5)* É falta de *projeto*." |
| **Na tela** | A câmera recua para a maquete inteira, com as três figuras visíveis e mais **FIG. 04 — SISTEMAS SEM COMUNICAÇÃO** entre Financeiro e Operação. Títulos: **"Não é falta de esforço."** → **"É falta de *engenharia.*"** |
| **Imagem** | A maquete inteira escurece levemente; só as linhas tracejadas ficam visíveis, como um mapa de problemas |
| **Som** | O pulso desacelera; 0,4 s de silêncio total antes da cena 6 |

### CENA 6 · Virada: a DME entra (0:37–0:41)

| | |
|---|---|
| **Locução** | "É aqui que a Dê-Eme-É entra." |
| **Na tela** | Indicador: **03 PROJETO**. O carimbo muda de `REV. A` para **`REV. B · DME TECHNOLOGY`**, com um traço azul riscando o "A". Título: **"É aqui que a *DME* entra."** |
| **Imagem** | **Corte seco** para a vista de **planta baixa** (de cima), em que o edifício vira um desenho técnico plano azul sobre a prancha. A grade da prancha muda para azul profundo `#264B71` a 10% |
| **Som** | Batida única (kick abafado) com acorde aberto: entra o tema |

### CENA 7 · Método: diagnóstico, mapeamento, padronização (0:41–0:52)

| | |
|---|---|
| **Locução** | "Entendemos o negócio, identificamos os gargalos e redesenhamos o processo: *(break 0,3)* mapeamento, padronização *(break 0,25)* e automação." |
| **Na tela** | Lista técnica à esquerda, que cresce item a item **na palavra falada**:<br>`01 ENTENDER` · `02 IDENTIFICAR` · `03 REDESENHAR`<br>e depois os subitens `MAPEAMENTO`, `PADRONIZAÇÃO` e `AUTOMAÇÃO` |
| **Imagem** | Na planta baixa:<br>• **Entender:** a régua percorre os setores e cota cada um.<br>• **Identificar:** as quatro figuras do laudo reaparecem como **círculos numerados** sobre a planta.<br>• **Mapeamento:** as linhas tracejadas viram um **fluxograma** com caixas e losangos de decisão, desenhado traço a traço.<br>• **Padronização:** as caixas de tamanhos diferentes se alinham à grade, com as mesmas medidas e os mesmos espaçamentos (cotas confirmam: "= = =").<br>• **Automação:** as conexões viram linhas azuis contínuas e um **pulso** percorre o fluxo de ponta a ponta sem parar |
| **Câmera** | Travelling lateral lento sobre a planta |
| **Som** | Tema completo: pulso a 96 BPM, arpejo leve e um "clique" de encaixe em cada caixa alinhada |

### CENA 8 · Tecnologia aplicada (0:52–0:58)

| | |
|---|---|
| **Locução** | "Com inteligência artificial e integração de sistemas, onde elas resolvem um problema real." |
| **Na tela** | Duas etiquetas técnicas entram sobre o fluxo, no ponto exato onde atuam:<br>• `IA` ao lado de um nó de decisão do fluxo;<br>• `INTEGRAÇÃO` ligando o bloco Financeiro ao bloco Operação, no lugar exato da antiga FIG. 04.<br>Título: **"Tecnologia onde resolve um *problema real.*"** |
| **Imagem** | A FIG. 04 é riscada em azul e recebe a nota `RESOLVIDO EM PROJETO`; as demais figuras também ganham um check técnico (✓ em traço), uma a uma |
| **Som** | Três "pings" suaves nos checks |

### CENA 9 · A nova planta (0:58–1:05)

| | |
|---|---|
| **Locução** | "O resultado é uma operação desenhada de propósito: *(break 0,3)* clara, conectada e preparada para evoluir." |
| **Na tela** | Indicador: **04 EXECUÇÃO**. Os três adjetivos aparecem como itens de especificação, na palavra falada:<br>`CLARA` · `CONECTADA` · `PREPARADA PARA EVOLUIR` |
| **Imagem** | **Volta à maquete isométrica**, a mesma do início, agora com os fluxos **azuis e contínuos** atravessando os quatro pavimentos, com pulsos em ritmo regular. A câmera faz a órbita completa final (30°) |
| **Som** | O tema cresce; cordas sobem meio tom |

### CENA 10 · Loop e assinatura (1:05–1:14)

| | |
|---|---|
| **Locução** | "Toda empresa tem uma planta. *(break 0,4)* Agora, você conhece a sua. *(break 0,5)* Dê-Eme-É Technology. Tecnologia aplicada aos negócios. Comente como está a sua planta." |
| **Na tela** | **"Toda empresa tem uma planta."** → **"Agora, você conhece *a sua.*"**. As linhas da maquete se recolhem num traço único que desenha o **logo DME** (as 4 peças se montam).<br>Embaixo: **"Tecnologia aplicada aos negócios."** e o CTA **"Comente como está a sua planta."**.<br>O carimbo final, `DOC 001 · REV. B · APROVADO`, entra com um traço azul de assinatura |
| **Som** | Acorde final e três notas de assinatura, com cauda de 2 s |

## 6. Locução completa (para gravação)

> Toda empresa tem uma planta. Poucas conhecem a sua.
> Por fora, a operação parece funcionar.
> Por dentro, o trabalho percorre caminhos que ninguém desenhou.
> Informação que se repete. Aprovação que espera. Tarefa que volta para o início.
> Isso não é falta de esforço. É falta de projeto.
> É aqui que a DME entra.
> Entendemos o negócio, identificamos os gargalos e redesenhamos o processo: mapeamento, padronização e automação.
> Com inteligência artificial e integração de sistemas, onde elas resolvem um problema real.
> Uma operação desenhada com propósito: clara, conectada e preparada para evoluir.
> Toda empresa tem uma planta. Agora, você conhece a sua.
> DME Technology. Tecnologia aplicada aos negócios. Comente como está a sua planta.

Tem cerca de 125 palavras, o que dá de 62 a 70 s na voz natural.

## 7. Conformidade com os fatos

| Afirmação | Fonte |
|---|---|
| Diagnóstico, mapeamento, padronização e automação | Lista de fatos confirmados |
| IA e integração de sistemas | Lista de fatos confirmados |
| Entender → identificar gargalos → desenvolver sob medida | Abordagem confirmada |
| "resolvem um problema real" | Premissa do resumo do cliente |
| "clara, conectada e preparada para evoluir" | Resumo do cliente ("mais organizadas, inteligentes e preparadas para evoluir"; "fluxos mais claros, conectados e eficientes") |
| Anotações FIG. 01–04 | Problemas citados no resumo: informações espalhadas, tarefas repetitivas, processos sem acompanhamento, sistemas que não se comunicam |

Não há métricas, clientes, depoimentos nem garantias. Os setores do edifício são genéricos e não representam uma empresa real.

## 8. Som em detalhe

- **0:00–0:13 (abertura):** ticks de lapiseira, pulso grave e cordas contidas em Ré menor.
- **0:13–0:20 (raio-X):** varredura e clique de scanner.
- **0:20–0:31 (laudo):** tick grave por figura, acentos e o relógio da FIG. 02 em tique-taque sutil.
- **0:31–0:37 (tensão):** desaceleração e 0,4 s de silêncio antes da virada.
- **0:37 (virada):** kick abafado e acorde aberto em Fá maior.
- **0:41–1:05 (método e execução):** tema a 96 BPM, arpejo, cliques de encaixe e pings nos checks; as cordas sobem no final.
- **Assinatura:** acorde final e três notas.
- **Mistura:** ducking de 6 dB sob a voz, −14 LUFS, pico de −1,5 dBTP e `marcas-som.txt` com todos os eventos.

## 9. Versão curta (opcional, 30 s)

Cenas 1, 3, 4 (só FIG. 01 e 03), 6, 7 (compacta), 9 e 10. Serve para anúncio e corte para redes.

## 10. Pontos para decidir antes da produção

1. **Voz:**
   - **Lendário** (padrão recente da DME): mais energia.
   - **Guilherme**: mais sóbrio, reforça o tom técnico e de credibilidade. É a recomendação para este filme.
2. **"É falta de engenharia."** é a frase de tensão. É forte e não é promessa, mas pode soar crítica ao cliente. A alternativa mais suave é "É falta de método."
3. **CTA:**
   - "Converse com a DME." (institucional, recomendado para o horizontal);
   - "Comente COMERCIAL e receba um diagnóstico" (usado nos Reels).

## 11. Decisões do cliente (13/11/2026)

- **Voz:** Lendário.
- **Frase de tensão:** "É falta de engenharia." (mantida).
- **CTA final:** "Comente como está a sua planta." Fecha o conceito e convida ao comentário.

## 12. Revisão 2 (pedidos do cliente)

- **Planta baixa:** cada número fica **no lugar do problema que representa**, com glifo e legenda. São eles:
  - 01 · INFORMAÇÃO REPETIDA (3 cópias no Comercial);
  - 02 · APROVAÇÃO EM ESPERA (relógio no Financeiro);
  - 03 · RETRABALHO (seta de volta da Operação ao Atendimento);
  - 04 · SEM COMUNICAÇÃO (ligação partida entre Financeiro e Operação, substituída pelo selo INTEGRAÇÃO).
- **Fala e título da cena 9:** passam a ser "Uma operação desenhada com propósito: clara, conectada e preparada para evoluir."
- **Tensão:**
  - "Não é falta de esforço." fica na tela e a segunda frase entra embaixo.
  - "É falta de engenharia." foi trocada por **"É falta de projeto."**. Ela fecha a metáfora da planta (uma planta é um projeto) e conduz à etapa 03 PROJETO.
