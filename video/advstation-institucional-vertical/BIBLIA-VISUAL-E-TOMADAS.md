# ADV Station · bíblia visual e lista de tomadas

Este documento serve de referência para gerar as imagens do filme institucional vertical (68 s). Cada tomada deve ser gerada **em 9:16 (1080 × 1920 ou maior), sem texto, sem legendas e sem logo**. Textos, legendas e marca são aplicados depois, por código, no `video.html`.

> As pessoas são **personagens fictícios ilustrativos**. Não são equipe da ADV Station nem clientes reais.
> Não pode aparecer nenhuma tela de sistema, interface, dashboard, mockup ou celular/computador com conteúdo visível.

## 1. Ambiente (o mesmo escritório em todo o filme)

Escritório brasileiro contemporâneo de advocacia previdenciária, de porte médio.

- **Mesas e estante:** mesas de madeira nogueira média, estante baixa com **pastas marinho** (#16284A) e algumas pastas pardas.
- **Divisórias:** de vidro com perfil metálico escuro.
- **Luz:** janela lateral à esquerda com luz natural suave, luminárias de mesa com ponto âmbar quente e lâmpadas quentes discretas ao fundo.
- **Objetos de uso:** papéis, canetas, clipes, uma caneca, um bloco de notas.
- **O que evitar:** luxo de banco de imagens, biblioteca jurídica exagerada, martelo, balança, estátua da Justiça, logotipos de terceiros e cenários futuristas.

**Prompt base do ambiente (inglês, para geradores):**

> Contemporary Brazilian law office for social security law, medium walnut wood desks, low shelf with navy blue folders, glass partitions with thin dark metal frames, soft natural side light from a window on the left, warm amber desk lamps, organized desks with real signs of use (papers, pens, a mug), cinematic editorial photography, navy and amber palette, natural skin tones, moderate contrast, shadows with detail, no screens visible, no text, no logos, vertical 9:16

## 2. Personagens recorrentes (fictícios)

Manter o **mesmo rosto, cabelo e roupa** sempre que o personagem reaparecer. Para isso, gere primeiro uma folha de referência de cada um e use-a como imagem de referência nas tomadas.

| Personagem | Descrição | Figurino fixo |
|---|---|---|
| **Helena**, advogada (atendimento e análise) | Mulher de cerca de 40 anos, pele morena clara, cabelo castanho-escuro na altura dos ombros, expressão atenta | Blazer **marinho** sobre blusa marfim, brinco pequeno dourado e relógio fino |
| **Rafael**, responsável pelo acompanhamento | Homem de cerca de 32 anos, pele negra, cabelo curto e barba bem aparada | Camisa social azul-clara, suéter cinza-grafite e caneta na mão |
| **Marta**, gestora | Mulher de cerca de 52 anos, pele clara, cabelo grisalho curto | Cardigã caramelo sobre blusa marinho e colar fino dourado |
| Cliente 1 (bloco 1) | Mulher de cerca de 35 anos, aparência cotidiana | Blusa verde-oliva |
| Cliente 2 (bloco 4, Maternidade) | Mulher de cerca de 28 anos, aparência cotidiana (**sem** representar gestante, hospital ou berço) | Camisa jeans clara |
| Cliente 3 (bloco 5, Previdenciário) | Homem de cerca de 62 anos | Camisa xadrez discreta |

**Prompt de referência de personagem (exemplo, Helena):**

> Character reference sheet, Brazilian woman lawyer around 40, light-brown skin, shoulder-length dark brown hair, attentive expression, navy blue blazer over ivory blouse, small gold earring, thin watch, neutral studio background, front and three-quarter views, natural skin, no text

## 3. Regras para todas as gerações

- **Luz:** principal lateral e suave, contraste moderado, pontos quentes discretos ao fundo e separação entre personagem e fundo.
- **Pele e materiais:** pele natural, sem luz azul saturada no rosto. Madeira e papel com cor real.
- **Documentos:** aparência plausível, **sem texto legível** (linhas borradas ou fora de foco) e sem dados pessoais.
- **Ações:** escuta, conferência de pasta, anotação curta, apontar um trecho do documento, troca de olhar e reunião. **Evite:** digitação longa, troca complexa de papéis, mãos cruzando objetos e pessoas falando para a câmera.
- **Câmera:** sem telas visíveis. Se houver um notebook, ele fica fechado ou de costas.
- **Profundidade de campo:** moderada, sem esconder a ação.
- **Formato:** 9:16, resolução de 1080 × 1920 ou maior (de preferência 2160 × 3840, para permitir reenquadramento).

## 4. Tomadas

Os tempos vêm da locução real medida (`timeline.json`). O arquivo esperado de cada tomada é `assets/tomadas/TXX.jpg`, ou `TXX.mp4` se houver image-to-video.

| # | Tempo | Função | Ação e enquadramento | Lente | Movimento (aplicado no código) | Continuidade |
|---|---|---|---|---|---|---|
| T01 | 0,0–3,4 | Abertura: atendimento | Helena escuta a Cliente 1 do outro lado da mesa. Plano médio lateral, as duas de perfil e três quartos | 35–50 mm | Aproximação curta | Primeira cena, sem vinheta |
| T02 | 3,4–6,2 | Detalhe | **Pasta marinho** sobre a mesa e a mão de Helena fazendo uma anotação breve num bloco | 85 mm | Deslocamento lateral curto | A pasta vai para o centro e conecta à T03 |
| T03 | 6,2–9,2 | Rotina: conferência | Rafael confere documentos da **mesma pasta marinho**, em plano próximo | 50 mm | Estável, com leve aproximação | Corte por correspondência da pasta |
| T04 | 9,2–13,6 | Rotina: conjunto | Plano geral do escritório: Helena na mesa dela, Rafael com a pasta e Marta ao fundo, perto da divisória de vidro. Respiro no terço superior para o logo | 35 mm | Afastamento lento | Mostra que todos trabalham no mesmo lugar |
| T05 | 13,6–17,6 | Transição | Marta caminha em direção à mesa de alinhamento, com uma pasta marinho na mão | 50 mm | Deslocamento lateral acompanhando | O movimento conduz ao bloco 3 |
| T06 | 17,6–22,5 | "Organização" | Detalhe: o dedo de Helena indica um ponto de um documento sobre a mesa | 85 mm | Aproximação curta | Corte no gesto de indicar |
| T07 | 22,5–26,5 | "Acompanhamento" | Helena e Rafael alinham os próximos passos e trocam um olhar, lado a lado na mesa | 50 mm | Deslocamento lateral | A direção do olhar leva à T08 |
| T08 | 26,5–30,2 | "Clareza" | Helena, Rafael e Marta reunidos em torno da mesa com pastas abertas | 35 mm | Afastamento curto | Equipe coordenada |
| T09 | 30,2–33,6 | Maternidade Legal | Helena atende a Cliente 2 com uma pasta aberta, em cena respeitosa e cotidiana | 50 mm | Aproximação curta | Mesmo escritório |
| T10 | 33,6–37,3 | Maternidade Legal | Helena passa a demanda a Rafael e os dois conferem a pasta | 50 mm | Estável | Um elemento marinho (pasta ou blazer) conecta à T11 |
| T11 | 37,3–41,6 | Previdenciário Geral | Rafael atende o Cliente 3 e escuta | 50 mm | Aproximação curta | Mesmo tratamento visual da T09 |
| T12 | 41,6–46,8 | Previdenciário Geral | Rafael revisa uma demanda e alinha o acompanhamento com Marta | 50 mm | Deslocamento lateral | — |
| T13 | 46,8–56,4 | Uma mesma visão | **Plano mais amplo do filme**: Marta conduz uma conversa objetiva com Helena e Rafael, com o escritório inteiro visível | 35 mm | Afastamento lento e longo | Reúne os três personagens |
| T14 | 56,4–61,2 | A tecnologia apoia | Detalhe de atenção: Helena relê um documento com calma, em plano próximo | 85 mm | Estável | Leva à assinatura em marfim |
| — | 61,2–68,0 | Assinatura | Fundo marfim (#F4F6F9), símbolo oficial e lettering ADV STATION, CTA "Conheça nossas soluções" | — | Revelação limpa | Logo e CTA legíveis nos 5 s finais |

**Prompt de tomada (exemplo, T01):**

> Vertical 9:16 cinematic photograph, contemporary Brazilian law office (same office as reference), Helena (reference sheet) listening attentively to a client woman in an olive blouse across a walnut desk, medium side shot, 50mm, soft window light from the left, warm amber desk lamp in background, navy folder on desk, papers with no legible text, natural skin tones, moderate contrast, no screens, no text, no logos

## 5. O que entra por código (não na imagem)

- **Títulos (serifada editorial):**
  - "Cada caso tem seu caminho"
  - "Gestão para a advocacia previdenciária"
  - "Organização", "Acompanhamento" e "Clareza", um por vez
  - "Maternidade Legal" e "Previdenciário Geral", com o mesmo tratamento
  - "Uma mesma visão de gestão"
- **Marca:** logo ADV Station no bloco 2 e na assinatura.
- **Textos de apoio e legendas:** em Fieldwork, que está pendente (ver README).
