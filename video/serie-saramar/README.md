# SARAMAR · cada seguidor vira um morador

Série de crescimento de perfil para um **perfil novo, sem marca DME**. O formato segue a mecânica de um vídeo de referência enviado pelo usuário ("essa página tem N seguidores, e cada seguidor vira um morador"). O mundo, o nome, a arte, os mistérios, o texto, a voz e a trilha são próprios.

- **Roteiro:** `../../roteiros/serie-saramar.md`.
- **Arte:** pixel art feita em código (`scripts/mundo.py`), sem imagens de terceiros. A ilha é gerada por ruído, com floresta densa, praia, morro de pedra, recife e ilhéu. Os sprites são mapas de caracteres: moradores, fogueira, cabana em etapas, pier, barcos, varais de rede, faróis, o rosto de pedra e o navio encalhado.
- **Vídeo:** `scripts/video.py` monta a câmera por quadros-chave, a luz (dia, tarde, noite, poente, mistério; brilho da fogueira em anéis; pixels emissivos), a água animada e as legendas no tempo de cada palavra (`voz/palavras.json`). As fontes são Silkscreen Bold e Pixelify Sans (OFL, em `fonts/`). Renderiza em cerca de 9 min.
- **Voz:** **Saramar Narrador** (`wcRzlqRM8P8rr8ZZsd9h`), criada por Voice Design a partir da prévia "contador-3" escolhida pelo usuário (`voz/amostras/`, `voz/voz-escolhida.json`). A narração do ep. 1 sai numa tomada só, com `<break>` (`scripts/gerar_voz.mjs`). Foram geradas 3 tomadas, e a escolhida foi a 2, sem erros de leitura. Os tempos por palavra saem de `scripts/palavras.py`.
- **Som:** `scripts/trilha.py` gera a trilha original, com violão dedilhado (Karplus-Strong) em Ré maior, silêncio antes de "A cada novo seguidor", pulso de 96 BPM e drone de mistério. Os efeitos também são originais: mar, fogueira, tora, vassoura, marteladas, um "plim" por cabana nova, grilos e o ronco do rosto de pedra. A mixagem fica em −14 LUFS.

## Ep. 1 v2 (67,7 s) · `out/Saramar-Ep1.mp4`

A v2 acrescenta uma montagem com cinco lugares novos (cachoeira com caverna, templo na lagoa, círculo de pedras, árvore com porta e uma criatura no fundo do mar), o mapa de metas em seguidores (2 ✓, 10, 25, 50, 100, 250, 500, 1.000, ???) e uma garrafa com mensagem chegando no fim.

- **Narração:** tomada `ep1v3-2` (velocidade 1,1). As pausas longas foram encurtadas por `scripts/encurtar.py`, que gera `voz/narracao.wav` e `voz/palavras.json`.
- **Tempos:** as cenas da v1 foram marcadas sobre a narração antiga (`voz/palavras-v1.json`), e `video.py` converte o tempo novo para o antigo palavra a palavra (`t_velho`). A montagem e o mapa entram nos trechos novos.

### v1 (55,0 s)

O perfil começa com 2 seguidores. O episódio passa pela ilha e pelos mistérios (rosto de pedra, navio com luz no porão, farol que acende sozinho) e mostra dois moradores, a fogueira e a primeira cabana sendo construída. Depois vêm a noite, a montagem da vila crescendo (+1 por cabana, pier, barcos, pescadores, farol), os mistérios de novo e a volta ao acampamento, com o terreno vazio e a placa "?" no fecho: "A próxima cabana pode ser a sua."

Também estão em `out/`: `capa-ep1.png`, `marcas-som-ep1.txt` e `conferencia-ep1.txt`.

## Ep. 2 · "A vila" (63,8 s) · `out/Saramar-Ep2.mp4`

- **Vídeo:** `scripts/ep2.py`. Usa a mesma ilha do ep. 1: importa `video.py`, que monta `BASE`, e reconstrói o chão sem árvores para abrir a clareira da vila. São 6 ruas × 9 lotes (casinhas 14×12), com a avenida central até a praça. As cabanas sobem da praça para cima, cada uma com o @nick do dono (`dados/moradores-ep2.json`), e no máximo 3 nicks aparecem na tela ao mesmo tempo, em 3 alturas. O mapa antigo é a própria ilha em sépia, com pinos de cadeado e as metas ×100.
- **Narração:** `scripts/gerar_voz_ep2.mjs` (tomada `ep2-3`). As pausas foram encurtadas com `python3 scripts/encurtar.py ep2-3 voz/ep2`.
- **Som:** `scripts/trilha_ep2.py`. Cada cabana toca uma nota da pentatônica de Ré: a coluna define a nota e cada rua sobe um degrau. Também há estacas, cordas, a rolha, o papel do mapa e um carimbo por pino.
- Também estão em `out/`: `capa-ep2.png`, `marcas-som-ep2.txt` e `conferencia-ep2.txt`.

## Próximos episódios

Troque o número no cabeçalho de `video.py` pelo número real de seguidores e acrescente ao mundo o que eles "construíram". Os mistérios (o rosto, o navio, o farol do ilhéu) são os ganchos para revelar quando o perfil bater metas.
