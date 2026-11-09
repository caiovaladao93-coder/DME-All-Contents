# /brag-slim · ADV STATION: "Painel de partidas"

Este vídeo foi feito com a skill `brag-slim` (github.com/latent-spaces/brag), com as regras do manual da ADV STATION por cima: marca original, vinheta, jingle da série e só capacidades reais.

## Inspeção (respostas da skill)

- **O que é:** uma família de softwares de gestão para a advocacia previdenciária (Maternidade Legal e Previdenciário Geral).
- **Para quem:** escritórios que acompanham muitos clientes, cada um num benefício e numa etapa diferentes.
- **O que a diferencia:** cada caso fica numa etapa visível. Na tela real do Administrativo, cada cliente aparece com benefício e etapa (Coletando documentos, Protocolado INSS, Exigência INSS, Benefício concedido…). O Setor de Protocolo da Maternidade tem 11 etapas nomeadas.
- **Gancho visual:** o nome da marca é *Station*, então o escritório vira uma **estação**, com um painel de partidas de letras que viram com estalo (split-flap). Cada cliente é um trem, com destino (benefício) e plataforma (etapa).
- **Interface real mostrada:** a tela do Previdenciário Geral · Administrativo, com as mesmas linhas do painel, e a do Maternidade Legal · Setor de Protocolo, com as etapas reais.
- **Tom:** `default` com um toque deadpan. A metáfora é dita com a cara séria e a graça está nela.
- **Legenda de compartilhamento:** "Seu escritório é uma estação. A ADV Station mostra em que plataforma está cada cliente."
- **Dados:** os nomes são os do ambiente de **demonstração** das capturas enviadas (Escritório Demonstração), todos fictícios. Os CPFs que aparecem na tela do Administrativo também são fictícios, do mesmo ambiente já usado no institucional. O vídeo não mostra nenhum dado real.

## Plano

- **Formato:** paisagem 1920×1080, 30 fps, 24 s.
- **Trilha:** 120 BPM (batida de 0,5 s, compasso de 2 s), em Fá maior, como a família editorial do manual. O estalo das plaquinhas é a percussão, quantizado em semicolcheias na mesma grade. Todo corte cai numa batida.
- **Sem voz.** É o padrão da skill. O manual exige ElevenLabs quando há locução, e a voz do Guilherme pode ser adicionada se o cliente quiser.

| Tempo | Cena | O que acontece |
|---|---|---|
| 0,0–3,0 | **Gancho** | O quadro 0 é a capa, com a frase já assentada. Depois o painel gigante vira as plaquinhas com estalo e escreve "SEU ESCRITÓRIO / É UMA ESTAÇÃO.", com a plataforma dourada do logo embaixo. |
| 3,0–7,5 | **Partidas** | O painel de partidas (Plat. · Cliente · Benefício · Etapa) vira uma linha por batida, com os dados da tela de demonstração. Na batida 7,0, a linha 06, "BENEFÍCIO CONCEDIDO", acende em dourado. Título: "Cada cliente, um destino." |
| 7,5–9,5 | **Caos** | Todas as plaquinhas giram sem parar e voltam à ordem. Título: "Sem sistema, vira caos." |
| 9,5–13,5 | **Previdenciário Geral** | O painel cai como uma plaquinha e revela a tela real do Administrativo, com as mesmas linhas. O destaque dourado desce uma linha por batida e para em "Benefício Concedido". Título: "Cada cliente na etapa certa." |
| 13,5–17,0 | **Maternidade Legal** | A tela real do Setor de Protocolo. Anéis dourados numerados acendem Protocolado → Em análise → Concedido, na batida, ligados por um trilho. Título: "Do protocolo à concessão." |
| 17,0–19,0 | **Embarque** | O painel volta e escreve "PRÓXIMA PARADA: / ADVSTATION.IO". |
| 19,0–24,0 | **Assinatura** | A vinheta original da marca, com o jingle oficial da série. Título: "Cada cliente no trilho certo.", com os selos dos dois produtos e advstation.io. |

## Som

- **Estalos:** 6.969 eventos de plaquinha exportados do próprio `video.html` (`work/eventos.json`), cada um com um clique sintetizado (ruído + "tic" ressonante). Os estalos sincronizam com a imagem por construção.
- **Trilha:** procedural em `scripts/trilha.py`. Pad F · Dm · B♭ · C, baixo e bumbo nas batidas a partir de 3,0 s, subida de ruído no caos, "virada" (sopro e batida) nas trocas de painel e sinos dourados nos anéis (C5 → E5 → A5).
- **Jingle:** o oficial da série a partir de 19,0 s, nivelado 1 dB abaixo do corpo do vídeo. A trilha sai antes de ele entrar.
- **Master:** −14,0 LUFS, pico real de −1,3 dBTP (loudnorm linear em 2 passos).
