# Prompt mestre · Reels DME em motion graphics (v2)

Este prompt serve para pedir novos vídeos ao Claude Code com a skill `motion-graphics-video`. Ele reúne o que funcionou no vídeo "Se você tirar férias" e corrige o que ainda deixou a desejar.

---

## 1. O que melhorar em relação ao vídeo "Se você tirar férias" (v1)

| # | Problema na v1 | Correção pedida no prompt |
|---|---|---|
| 1 | O primeiro quadro fica quase vazio, porque o gancho ainda está entrando. No feed, a capa e o primeiro segundo decidem o scroll. | O gancho fica legível desde o quadro 0, e uma capa à parte é exportada. |
| 2 | A composição pesa no topo e deixa vazio o terço inferior de várias cenas. | Cada cena tem um objeto principal com pelo menos 40% da área, centrado entre y=700 e y=1500. |
| 3 | As transições são, na maioria, cortes e fades. | Match cuts: o objeto de uma cena vira o da próxima (lista na seção 3). |
| 4 | Os objetos são cartões planos. A referência usa objetos 3D (caixa, moedas, escudo). | 3 objetos em aço escovado com volume real (camadas CSS 3D), com inclinação contínua e sombra de contato. |
| 5 | Na troca de dias, "Segunda." e "Quarta." ficam visíveis juntas por cerca de 0,15 s. | Regra de troca de frase: a saída termina antes de a entrada passar de 30% de opacidade. |
| 6 | O vídeo não tem trilha nem locução sincronizada. | Mapa de batidas a 104 BPM nas constantes, cortes na batida e narração encaixada por detecção de silêncio quando o áudio for enviado. |
| 7 | O final não fecha o gancho: o vídeo abre com "férias" e termina sem voltar a ele. | Fechar o loop: o chip "Férias" do calendário inicial volta aceso antes do logo (ver o roteiro v2). |
| 8 | A cena dos verbos e a do fluxo têm pouca ação. | Na cena dos verbos, um objeto 3D gira e troca de forma a cada verbo. No fluxo, um "token" percorre as caixas. |
| 9 | Há tamanhos de texto demais. | Escala fixa com 3 níveis: Hero 220–270 px, H1 120–140 px e H2 84–96 px. No máximo 2 linhas por frase, salvo a frase emocional final. |

---

## 2. PROMPT MESTRE (copiar, preencher os campos [ ] e enviar)

```text
<papel>
Você é diretor de motion design e redator publicitário B2B. Cria Reels de produto com acabamento de comercial de tecnologia, em HTML determinístico renderizado para MP4 (skill motion-graphics-video). Cada decisão é comparada com a referência e o vídeo só fica pronto quando passa em todas as checagens.
</papel>

<marca>
- Empresa: DME Technology. Público: donos de PMEs e gestores.
- Cores: #0A0B0C (fundo), #1C1F22 (superfícies), #264B71 (profundidade e assinatura), #C0C6CC (aço e texto secundário), #3A6EA5 (destaque, só na palavra-chave).
- Fontes: Sora 700/800 nos títulos e Manrope 500–700 na interface (os arquivos estão em video/reels-ferias/fonts).
- Logo: video/brand/dme-logo.svg (vetor oficial redesenhado). Nunca distorcer, recolorir nem separar, exceto na animação de montagem das 4 peças.
- Estética: corporativa e cinematográfica, com aço escovado e luz lateral fria. Proibido: neon, glow em texto, partículas, emojis, fotos, pessoas e clichês.
- CTA padrão: "Envie COMERCIAL no direct."
</marca>

<fatos_confirmados>
Use somente estes fatos. Qualquer outra afirmação sobre produto, número ou cliente é proibida.
- O CRM personalizado faz retornos automáticos.
- O agente de voz com IA atende fora do horário, qualifica, registra no CRM e transfere para uma pessoa da equipe.
- A DME oferece diagnóstico, mapeamento, padronização e automação de processos.
- Dados de interface (nomes, horários, tarefas) são fictícios e levam o selo "Exemplo ilustrativo".
- Sem métricas, depoimentos, clientes, integrações ou garantias.
</fatos_confirmados>

<referencia>
Comercial de produto em motion graphics (estilo fintech), de 35 s. Copie a técnica, nunca a marca:
1. Gancho sobre a vida do espectador, legível desde o quadro 0.
2. Trinca de frases curtas no mesmo ritmo, com a palavra-chave na cor de destaque e um cartão empilhando por frase.
3. Virada com uma palavra gigante ("Agora") e o fundo invertendo para aço claro.
4. O produto como ação concreta: campo sendo digitado, objeto 3D recebendo o conteúdo.
5. Lista à esquerda com item ativo e cartão à direita que troca junto.
6. Interruptor "No automático" ligando, com ícones orbitando em profundidade.
7. Montagem de tempo (dias ou horários) com relógio e fundo mudando de tom.
8. Verbos no gerúndio rolando com objeto 3D.
9. Fechamento "Então, enquanto você…" com chips da vida flutuando, seguido da assinatura.
</referencia>

<briefing>
- Tema: [ex.: processos e automação]
- Insight (a dor real, em uma frase): [ex.: o processo da empresa é o próprio dono]
- Gancho (pergunta ou frase de até 7 palavras sobre a rotina do dono): [ ]
- Trinca: [frase 1] / [frase 2] / [frase 3]
- Tensão (frase curta e incômoda): [ ]
- Virada: "Agora" + [ ]
- Demonstração (o que a DME faz, só com fatos confirmados): [ ]
- Montagem de tempo: [ ]
- Verbos: [4 verbos no gerúndio]
- Fecho: "Então, enquanto você cuida de [X], [Y] cuida de [Z]."
- Fechar o loop: [qual elemento do gancho volta no fim]
- Duração: 30 a 35 s · 9:16 · 1080x1920 · 30 fps
</briefing>

<ritmo>
- Trilha a 104 BPM (1 batida = 0,577 s). Declare as batidas nas constantes e alinhe cada corte e cada entrada de frase a uma batida ou meia batida.
- Um acontecimento a cada 0,6 a 1,5 s. Nada parado por mais de 1 s, exceto o quadro final (0,5 s).
- Uma batida de silêncio antes da virada.
- Leitura: cada frase fica inteira na tela por pelo menos 1 s e por, no mínimo, (número de palavras ÷ 3,5) s.
- Troca de frase no mesmo lugar: a antiga sobe e desfoca em 300 ms e só depois a nova passa de 30% de opacidade. Nunca duas frases legíveis ao mesmo tempo.
</ritmo>

<composicao>
- Zona segura do Reels: texto entre y=250 e y=1580, margens laterais de 90 px e nenhum texto em x>950 abaixo de y=1100.
- Título no terço superior (y 300–650). Objeto principal entre y 700 e 1500, ocupando pelo menos 40% da área do quadro.
- Escala tipográfica fixa: Hero 220–270 px, H1 120–140 px, H2 84–96 px e interface entre 26 e 52 px. Nada abaixo de 22 px.
- Ritmo de cor: escuro no problema, aço claro na virada, azul na demonstração e azul profundo na assinatura.
</composicao>

<movimento>
- render(t) é uma função pura. Easing de entrada (0.22,1,0.36,1), reorganização (0.65,0,0.35,1) e saída ease-in de 300 ms. Mola com zeta 0,72 e omega 14 (overshoot de cerca de 3%), só em cartões, chips e interruptores. Texto nunca usa mola.
- Câmera sutil por cena (escala de 1,00 a 1,04) e paralaxe entre fundo, objeto e chips.
- Pelo menos 3 objetos 3D de aço escovado com volume real (camadas CSS 3D com espessura), inclinação contínua e sombra de contato.
- Pelo menos 4 match cuts, em que o objeto de uma cena vira o da próxima.
- Tremor e vibração determinísticos (seno de t), nunca aleatórios.
</movimento>

<audio>
- O vídeo funciona sem som: todo o essencial está em texto.
- Gere marcas-som.txt com o tempo de cada fala, efeito e batida.
- Se eu enviar um arquivo de narração, separe as falas por detecção de silêncio, encaixe cada uma no início da sua cena (até 120 ms antes do texto), comprima no máximo 8% quando necessário, aplique passa-alta em 80 Hz e compressão leve, normalize para -14 LUFS com pico de -1,5 dBTP e gere o MP4 narrado.
- Nunca use voz sintética no MP4 final sem minha aprovação.
</audio>

<conferencia>
Antes de entregar:
1. Faça uma folha de contato a 4 fps e olhe todos os quadros com a ferramenta de imagem.
2. Confira o quadro 0: o gancho precisa estar legível. Exporte capa.png 1080x1920 e confira o recorte 3:4 central (grade do perfil).
3. Confira: textos idênticos ao roteiro, nenhuma frase sobreposta, zona segura, fontes sem fallback e logo íntegro.
4. Valide com ffprobe (1080x1920, 30 fps, duração e H.264) e compare 3 quadros do MP4 com as capturas.
5. QA de movimento: nenhum trecho parado por mais de 1 s.
6. Liste o que foi verificado e o que não foi.
</conferencia>

<entrega>
video.html (fonte editável), MP4 sem áudio, MP4 narrado (se houver áudio), capa.png e marcas-som.txt, todos em video/[nome]/out. Faça o commit e o push na branch de trabalho.
</entrega>
```

---

## 3. Roteiro "Se você tirar férias" v2 (preenchido para o prompt acima)

Batida de 0,577 s. Duração de 33 s.

| Tempo | Na tela | Objeto / movimento | Match cut para a próxima cena |
|---|---|---|---|
| 0,0–1,7 | **Se você tirar *férias*,** (já legível no quadro 0) | Calendário 3D de aço inclinado, com a barra "Férias" já marcada em azul. | A barra "Férias" encolhe e vira um chip. |
| 1,7–3,2 | **sua empresa *para*?** | O alerta "Aguardando você" cai sobre o calendário, com tremor. O chip "Férias" apaga e fica guardado num canto. | O alerta se divide em 3 notificações. |
| 3,2–6,1 | **Você *aprova*.** / **Você *cobra*.** / **Você *lembra* todo mundo.** | Notificações empilham, uma por frase, na batida. Na terceira, a pilha transborda e o celular vibra. | As notificações encolhem e viram blocos. |
| 6,1–8,1 | **Isso não é dedicação.** → **É *gargalo*.** | Os blocos caem num funil 3D de aço e entopem o gargalo. | A câmera mergulha no gargalo e o quadro clareia. |
| 8,1–9,8 | **Agora** (Hero) → **quem segura é o *processo*.** | Inversão para aço claro. Uma batida de silêncio antes. | Cortina escura sobe. O "o" de "processo" vira o token do fluxo. |
| 9,8–12,7 | **Entrada → Processo → Validação → Entrega** | Um token azul percorre as 4 caixas, e cada uma acende quando ele passa. | A caixa "Entrega" vira o cartão da lista. |
| 12,7–17,3 | **Diagnóstico · Mapeamento · Padronização · Automação** | Lista à esquerda com o item ativo. Cartão 3D à direita que gira 180° para trocar de conteúdo. | O interruptor do cartão "Automação" cresce até virar o interruptor principal. |
| 17,3–19,6 | **No *automático*.** | O interruptor 3D liga e os ícones orbitam em profundidade (frente nítida, fundo desfocado). | Os ícones sugam para dentro da tela do celular. |
| 19,6–23,1 | **Segunda.** / **Quarta.** / **Sexta.** | Celular 3D com relógio e notificação concluída a cada dia. O fundo muda de tom. Selo "Exemplo ilustrativo". | A tela do celular vira o objeto 3D dos verbos. |
| 23,1–25,4 | **Mapeando · Padronizando · Automatizando · Acompanhando** | Objeto 3D de aço que se transforma a cada verbo: lupa, régua, engrenagem, olho. | O objeto se dissolve em chips. |
| 25,4–29,4 | **Então, enquanto você cuida da *estratégia*,** → **o processo cuida da *rotina*.** | Chips da vida flutuando em 3 camadas de profundidade: "Novos clientes", "Planejamento", "Família". | Os chips saem e só resta espaço vazio. |
| 29,4–30,6 | **Pode marcar as *férias*.** ⚠ | Fecha o loop: o chip "Férias" do início volta aceso no centro e encaixa de volta no calendário. | O calendário vira a placa de aço do logo. |
| 30,6–33,0 | **DME TECHNOLOGY** · **Envie *COMERCIAL* no direct.** | As 4 peças do logo se encaixam, com reflexo único. O CTA entra com mola e a palavra COMERCIAL pulsa uma vez. | Quadro final parado por 0,5 s. |

⚠ **Para aprovar:** "Pode marcar as férias." fecha o loop do gancho e é a frase mais memorável do vídeo, mas soa como promessa. Uma alternativa mais neutra é "E as férias? Agora entram no calendário."

**Locução v2 (cerca de 55 palavras):** "Se você tirar férias, sua empresa para? Você aprova. Você cobra. Você lembra todo mundo. Isso não é dedicação. É gargalo. Agora… quem segura é o processo. Diagnóstico, mapeamento, padronização, automação. No automático. Então, enquanto você cuida da estratégia, o processo cuida da rotina. Pode marcar as férias. Envie COMERCIAL no direct."

## 4. Aprendizados da referência de motion design (Inter "Porquinho", 10/11/2026)

O estudo completo está em `roteiros/estudo-referencia-inter-porquinho.md`. Antes de entregar, confira também:

1. **Gancho:** a abertura é uma situação concreta, com dia e hora, e não o produto.
2. **Texto:** uma frase por tela e uma palavra-chave colorida, montada palavra por palavra com desfoque de movimento.
3. **Interface:** aparece como componente ampliado com a interação acontecendo (selo "Exemplo ilustrativo").
4. **Muitos itens:** com 3 itens ou mais, use lista fixa + cartão de demonstração que troca (cerca de 2 s por item, na palavra falada).
5. **Fio condutor:** um elemento visual recorrente (na DME, o token de aço) aparece no começo, no meio e no fim.
6. **Cortes:** no máximo 2 ou 3 cortes secos. O resto é transição pelo objeto, máscara ou inversão. Na DME, nada de clarão.
7. **Trilha:** 0,3 a 0,5 s de silêncio antes do "Agora" e fecho mais denso no logo.
8. **Loop:** o final volta à situação do gancho.

