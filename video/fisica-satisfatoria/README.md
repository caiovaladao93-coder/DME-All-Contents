# Física satisfatória · 3 mecânicas (9:16, 70,9 s)

Exemplo criativo no formato "física satisfatória" de uma referência enviada (bola em arena girando, colisões que multiplicam, sons nas batidas). **Mecânicas, desenho e som originais.** Sem narração e sem marca.

| Parte | Tempo | Mecânica | Gancho na tela |
|---|---|---|---|
| 1/3 | 0–22,5 s | Anel girando com uma abertura; **cada batida no anel cria uma bola** (cerca de dobra a cada 1,6 s até 1.300); elas fogem pela abertura; aos 20 s o anel **estoura** | "CADA BATIDA = +1 BOLA", contador e "fugiram" |
| 2/3 | 22,5–46,3 s | **10 anéis concêntricos** girando em sentidos alternados, cada um com uma brecha; quando a bola passa, o anel se despedaça; a brecha alarga se a bola demorar | "SERÁ QUE ELA ESCAPA?" e "N anéis" → "LIVRE!" |
| 3/3 | 46,3–70,9 s | **Guerra de cores** num hexágono girando: 4 times × 95 bolas; numa colisão, a bola mais rápida pode converter a outra; placar ao vivo | "ESCOLHA UMA COR!" (contagem 3-2-1) → "QUAL COR VENCE?" → "X VENCEU! Qual cor você escolheu? Comenta!" |

- **Física** (`scripts/gerar.py`): numba, 8 subpassos por quadro, colisões bola × bola por grade uniforme, quiques elásticos. É determinística (semente fixa).
- **Desenho:** anéis metálicos e esferas com luz desenhados em numba; texto com PIL (Sora OFL convertida para TTF em `fonts/`). Os quadros vão direto ao ffmpeg, e o vídeo inteiro gera em cerca de 1 min.
- **Som** (`scripts/som.py`): a física toca a música.
  - Cada batida da cena 1 toca a próxima nota de uma melodia própria (marimba).
  - Na cena 2, as notas sobem a cada anel, com vidro e acorde na quebra.
  - Na cena 3, há um tique na nota de cada cor, whoosh na troca de líder e fanfarra na vitória.
  - Por baixo, uma base leve a 120 BPM.

```
python3 scripts/gerar.py && python3 scripts/som.py && bash scripts/finalizar.sh
```

**Outras mecânicas para próximos testes:** funil com pinos (Plinko) e apostas, corrida de bolas num labirinto, "a última bola que sobrar", espiral que encolhe, bolas que crescem a cada batida, duelo de duas cores com escudos, cronômetro com "vai estourar em 10 s".

## Guerra de cores · "6 cores. Só 1 sobrevive." (9:16, 81,3 s)

`scripts/guerra.py` (física e desenho) e `scripts/som_guerra.py` (som). Saída: `out/Guerra-de-Cores.mp4`.

- 6 cores × 60 bolas. Numa colisão, a bola mais rápida pode converter a outra. A chance de conversão sobe com o tempo desde a última eliminação, para sair uma eliminação a cada ~8–12 s.
- **A arena perde um lado a cada cor eliminada:** hexágono → pentágono → quadrado → triângulo → final num círculo. A área é constante, e a forma se transforma em 1 s.
- **Na tela:**
  - "Escolha a sua cor!" com 3-2-1;
  - placar ao vivo;
  - "X ELIMINADO!" na cor de quem sai;
  - "FINAL: X × Y";
  - "X SOBREVIVEU! Qual cor você escolheu? Comenta!".
- **Som:** cada conversão toca a nota da cor. Eliminação: impacto e frase descendente. Final: silêncio de 0,4 s, riser e acorde. Vitória: fanfarra. A base sobe de intensidade a cada eliminação.

```
python3 scripts/guerra.py && python3 scripts/som_guerra.py
```

## Linha "1 bola → explode o espaço" (um formato por vídeo)

Regra da série: todo vídeo **começa com 1 bola**, ela se multiplica e **explode o espaço** no fim. Cada vídeo usa **um mecanismo só**, diferente dos outros.

### 1 · Anel musical (`scripts/anel_musical.py` + `scripts/som_anel.py` → `out/Anel-Musical.mp4`, 61,6 s)
- **Gancho:** "QUANTAS BOLAS CABEM AQUI DENTRO? Chuta nos comentários!"
- O anel tem 12 segmentos coloridos e gira. Cada segmento é uma nota (pentatônica de Lá menor). A bola que bate acende o segmento, toca a nota e solta uma bola nova da cor dele (~dobra a cada 4,8 s, até 1.900).
- Ao lotar: **PRESSÃO** (barra, tremor, ronco, rangidos). Os segmentos se soltam um a um, cada um tocando a própria nota, e o anel **estoura**: "ESTOUROU! Você chutou quanto?".
- **Loop:** o último quadro volta ao anel inteiro com 1 bola no centro, igual ao quadro 0.

### 2 · Ampulheta (`scripts/ampulheta.py` + `scripts/som_ampulheta.py` → `out/Ampulheta.mp4`, 67,9 s)
- **Gancho:** "CADA BOLA QUE PASSA PELO GARGALO VIRA DUAS · Quantas viradas até quebrar? Chuta!"
- Começa com 1 bola no bulbo de cima. Cada bola dobra **uma vez por virada** ao atravessar o gargalo. Quando o bulbo de cima esvazia (ou para de escoar), a ampulheta vira sozinha (12 viradas, até 1.200 bolas). Cada virada tem uma cor nova.
- **Paredes por SDF:** dois bulbos, o gargalo e um funil a 45° que leva ao gargalo (sem ele, as bolas paravam no fundo quase plano). Tudo num referencial que gira.
- **Final:** "ENTUPIU!" → "O VIDRO VAI QUEBRAR!" (trincas) → explosão em cacos → "QUEBROU NA VIRADA 12! Você acertou?" → loop com 1 bola.

### 3 · Balão elástico (`scripts/balao.py` + `scripts/som_balao.py` → `out/Balao-Elastico.mp4`, 59,8 s)
- **Gancho:** "CADA BATIDA NA BORDA CRIA MAIS UMA BOLA · Quantas até estourar? Chuta!"
- A borda é uma **membrana** de 140 nós ligados por molas, presa ao nó do barbante. A pressão interna (∝ nº de bolas / área) e os impactos a esticam. Um controle suave faz a esticada seguir uma curva pelo nº de bolas (100% → ~235% com 1.500 bolas), depois sobe devagar até 255% e **rasga** no segmento mais esticado.
- A borracha fica mais fina e mais clara conforme estica; o texto "borracha esticada: N%" fica vermelho e pulsa perto do limite. Som: notas das batidas, tom de borracha que sobe, rangidos cada vez mais frequentes, silêncio de 0,4 s e o POW (estalo, boom e flap da borracha).
- **Final:** "POW! ESTOUROU COM 1.500 BOLAS! Você chutou quanto?" → loop com o balão murcho e 1 bola.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/balao.py`.

### 4 · Engrenagens (`scripts/engrenagens.py` + `scripts/som_engrenagens.py` → `out/Engrenagens.mp4`, 61,4 s)
- **Gancho:** "CADA DENTE QUE TOCA DUPLICA A BOLA · Quantas até a máquina travar? Chuta!"
- Máquina com 3 engrenagens **engrenadas de verdade** (14, 10 e 14 dentes; razão de giro e fase calculadas para os dentes se encaixarem). A colisão usa o perfil do dente (normal pelo gradiente) e a velocidade da superfície arremessa as bolas. A bola que toca a ponta de um dente ganha uma cópia (até 2.400).
- "velocidade da máquina: N%" cai com a carga; cheia → "TRAVANDO..." (tremor) → "TRAVOU!" (trincas) → explosão: cada engrenagem se parte em 6 pedaços e as paredes voam → "QUEBROU! TRAVOU COM 2.400 BOLAS! Você chutou quanto?" → loop.
- Som: um tique por dente que passa (o ritmo sai da velocidade real), notas por engrenagem, rangidos metálicos, baque, silêncio e explosão com pedaços de metal.

### 5 · Buraco negro invertido (`scripts/buraco.py` + `scripts/som_buraco.py` → `out/Buraco-Negro.mp4`, 62,0 s)
- **Gancho:** "CADA BOLA QUE CAI NO BURACO VOLTA EM DOBRO · Quanto o buraco aguenta? Chuta!"
- A arena é circular, com um buraco negro no centro. A gravidade é radial, com atrito leve, então as órbitas viram espirais e o disco de acreção gira. Cada bola engolida volta em dobro pela borda, em órbita; as cores mudam a cada 45 bolas engolidas.
- O buraco cresce com a raiz do total engolido ("buraco: N% da arena"). Com 1.500 bolas, "O BURACO ESTÁ INCHANDO!"; a 52% da arena, "IMPLODINDO..." (tudo é puxado para o centro). Vem então o BOOM: o anel se parte em 16 pedaços e as bolas voam. Fecha com "ENGOLIU N BOLAS! Você chutou quanto?" → loop com 1 bola.
- **Versão 2 (mais satisfatória):**
  - rastros que viram espirais coloridas em volta do buraco;
  - uma onda na borda a cada bola que volta em dobro;
  - o buraco pulsa a cada bola engolida e o disco de acreção tem 4 braços;
  - zoom lento enquanto o buraco incha e tremor na implosão.
- **Som:** as bolas engolidas tocam um arpejo no tempo (semicolcheias a 120 BPM, Lám–Fá–Dó–Sol) e as 60 primeiras fazem um "glup". Há também um zumbido que cresce com o buraco, uma sirene quando a arena enche, sucção na implosão e boom com acorde no fim.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/buraco.py`.

### 6 · Lâmina (`scripts/lamina.py` + `scripts/som_lamina.py` → `out/Lamina.mp4`, 62,1 s · v3)
- **Formato:** o estilo "anel + arma girando no centro" de uma referência enviada pelo usuário, com arte, título e mecânica próprios. No topo, "LÂMINA" e o contador; embaixo, "volta N".
- **Gancho:** "Cada corte = ×2 · Quantas até ela quebrar? Chuta!"
- **v3 (pedido do usuário: "não precisa ser tão lento"):**
  - a lâmina gira com velocidade constante, uma volta a cada 3,2 s, e vai até 78% do raio, então as bolas entram e saem do alcance;
  - as bolas andam a 150–280 px/s;
  - chega a 2.052 bolas em cerca de 54 s.
- **v2 (calma):**
  - a lâmina dava uma volta a cada 5,4 s;
  - toda bola que ela atravessa é cortada ao meio: as duas metades se abrem na linha do corte, um risco branco rápido marca o corte, e as metades se afastam e viram bolas inteiras;
  - como a lâmina varre o anel inteiro, as bolas quase dobram a cada volta (1 → 2.050 em 11 voltas);
  - as bolas são de uma cor só, sem rastro nem onda, e andam devagar (55–140 px/s).
- **Final:** com o anel lotado, "TRAVANDO..." → "TRAVOU..." (tremor e trincas) → a lâmina parte em 4 e o anel em 16 → "QUEBROU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - cada corte faz um "tsk" de lâmina afinado (estalo agudo seco e nota de aço), num arpejo que sobe a cada volta;
  - um sino a cada volta completa e um "vuuush" grave da lâmina;
  - cama calma em Lá menor, com batida leve só nas 3 últimas voltas;
  - rangido ao travar, trincas, 0,35 s de silêncio e a quebra com boom.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/lamina.py`.

### 7 · Serra (`scripts/serra.py` + `scripts/som_serra.py` → `out/Serra.mp4`, 67,8 s)
- **Formato:** o mesmo da Lâmina (anel branco, título "SERRA" no topo, contador, bolas de uma cor só e sem efeitos), com outro cortante: um disco de serra circular de aço que ricocheteia dentro do anel em alta rotação. O desenho do disco tem 26 dentes desfocados pela rotação, reflexo que gira, furos de alívio e cubo.
- **Corte:** toda bola em que a serra encosta é cortada ao meio. As metades se abrem dos dois lados do caminho da serra, com um risco branco rápido. Chega a 2.051 bolas em cerca de 59 s.
- **Final:** "TRAVANDO..." (a serra perde rotação e vira obstáculo) → "TRAVOU..." (tremor e trincas) → o disco parte em 4, o anel em 16 e as bolas voam → "QUEBROU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - zumbido contínuo da serra que segue a rotação real (dentes ~108 Hz e chiado) e afunda a cada corte;
  - cada corte faz "zzt" e um "tsk" afinado em arpejo;
  - sino cada vez que o total dobra e "tlim" metálico nos ricochetes;
  - cama calma em Lá menor, com batida leve depois de 30 s;
  - o zumbido cai até parar quando a serra trava;
  - quebra com boom, pedaços e acorde.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/serra.py`.

### 8 · Laser (`scripts/laser.py` + `scripts/som_laser.py` → `out/Laser.mp4`, 69,7 s)
- **Formato:** o mesmo da Lâmina e da Serra (anel branco, título "LASER" no topo, contador, bolas de uma cor só e sem efeitos), com outro cortante: um emissor de aço anda pela borda do anel e dispara um feixe vermelho que reflete 2 vezes nas paredes (3 trechos). O ângulo do feixe abre e fecha, então a figura gira, "respira" e varre o anel inteiro.
- **Corte:** toda bola que o feixe atravessa é cortada ao meio (metades e risco branco, como na Lâmina). Cada metade só pode ser cortada de novo depois de 2,5 s, para o crescimento ficar gradual. O primeiro corte acontece logo no começo, e o vídeo chega a 2.050 bolas em cerca de 61 s.
- **Final:** "SUPERAQUECENDO..." (o feixe engrossa, pisca e acelera) → "QUEIMANDO..." (o feixe falha e apaga) → o anel explode → "QUEIMOU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - zumbido elétrico contínuo que sobe no superaquecimento;
  - cada corte faz um "zip" de laser e um "tsk" afinado em arpejo;
  - sino cada vez que o total dobra;
  - cama calma com batida leve depois de 30 s;
  - estalos elétricos ao queimar, boom e acorde.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/laser.py`.

### 9 · Tesoura (`scripts/tesoura.py` + `scripts/som_tesoura.py` → `out/Tesoura.mp4`, 73,3 s)
- **Formato:** o mesmo da Lâmina, da Serra e do Laser (anel branco, título "TESOURA" no topo, contador, bolas de uma cor só e sem efeitos), com outro cortante: uma tesoura gigante no centro, com lâminas de aço afuniladas com fio, cabos vermelhos com argolas e parafuso no pivô.
- **Mecânica:** a tesoura gira devagar e dá um SNIP a cada 1 s, no tempo da música (120 BPM): abre (0,6 s), segura (0,1 s) e fecha num estalo (0,3 s). Toda bola varrida pelas lâminas enquanto elas fecham é cortada ao meio, num corte coletivo e ritmado. Chega a 2.049 bolas em cerca de 65 s (64 snips).
- **Final:** "EMPERRANDO..." (a tesoura não fecha mais e treme) → "EMPERROU..." (trincas) → o parafuso estoura, as lâminas se separam e o anel explode → "QUEBROU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - cada snip faz "shhk" de lâminas raspando, estalo do fechamento e um arpejo rápido com os cortes daquele snip;
  - sino cada vez que o total dobra;
  - baixo e chimbal no tempo, com bumbo depois de 30 s;
  - rangido e snips falhos ao emperrar, trincas, silêncio e a quebra.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/tesoura.py`.

### 10 · Pêndulo (`scripts/pendulo.py` + `scripts/som_pendulo.py` → `out/Pendulo.mp4`, 70,1 s)
- **Formato:** o mesmo da Lâmina, da Serra, do Laser e da Tesoura (anel branco, título "PÊNDULO" no topo, contador, bolas de uma cor só e sem efeitos), com outro cortante: um pêndulo de relógio gigante preso no alto do anel (suporte e pivô), com haste de aço e lâmina em meia-lua com fio claro na ponta.
- **Mecânica:** o pêndulo balança ±50°, com ida de 1 s no tempo da música (120 BPM). Toda bola que a lâmina atravessa é cortada ao meio. Chega a 2.053 bolas em cerca de 60 s.
- **Final:** "PERDENDO FORÇA..." (a amplitude cai em 4 s) → "PAROU..." (tremor e trincas) → a haste se solta, a lâmina cai girando e o anel explode → "SE SOLTOU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - tique-taque de relógio nos extremos e "vuuush" da lâmina passando;
  - "tsk" afinado em arpejo a cada corte e sino cada vez que o total dobra;
  - baixo e chimbal no tempo;
  - o tique-taque enfraquece quando o pêndulo perde força;
  - trincas, silêncio e a queda com boom.
- **Mixagem:** compressor rápido antes do loudnorm, para segurar o pico dos tique-taques depois da codificação AAC.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/pendulo.py`.

### 11 · Guilhotina (`scripts/guilhotina.py` + `scripts/som_guilhotina.py` → `out/Guilhotina.mp4`)
- **Formato:** o mesmo da série de cortantes (anel branco, título "GUILHOTINA", contador, bolas de uma cor só e sem efeitos), com **bolas maiores** (raio 13, a pedido do usuário). É uma guilhotina com trilhos dos dois lados do anel, travessa, peso e lâmina de aço com fio inclinado.
- **Mecânica:** a lâmina sobe devagar (4,2 s, com catraca), segura no alto (suspense) e desce de uma vez (0,38 s), atravessando o anel inteiro. Toda bola cruzada é cortada ao meio, então o total quase dobra a cada descida, com "×2" ao lado do contador. Na subida, a lâmina passa por trás das bolas. São 9 descidas que cortam, até cerca de 480–510 bolas: algumas escapam do corte por estarem se movendo no instante da passada.
- **Final:** na 10ª descida, com o anel lotado, a lâmina "TRAVOU NO MEIO!" (tremor e trincas) → o anel explode e a lâmina cai girando → "QUEBROU! N CORTES! Você chutou quanto?" → loop.
- **Som:**
  - catraca "tec-tec-tec" e rangido na subida, e pulso grave no suspense;
  - "SHHHNK" e baque na descida, com um arpejo de "tsk" afinados que sobe com os cortes e um sino "×2";
  - estalo, rangido e trincas ao travar;
  - explosão com acorde.
- **Mixagem:** compressor antes do loudnorm, como no Pêndulo.
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/guilhotina.py`.

### 12 · Fio de aço (`scripts/fio.py` + `scripts/som_fio.py` → `out/Fio-de-Aco.mp4`)
- **Formato:** o mesmo da série de cortantes, com **bolas ainda maiores** (raio 18, a pedido do usuário). Um fio de aço esticado atravessa o anel de ponta a ponta, preso a duas roldanas na borda.
- **Mecânica:** o fio gira devagar (meia volta a cada 7 s) e varre o anel inteiro. Toda bola que ele atravessa é cortada ao meio, e o total vai de 1 a 256 (72,6 s). O fio funciona como uma corda: cada corte belisca o fio, que vibra no ponto do corte.
- **Final:** com o anel lotado, o fio para, enverga como um arco ("O FIO ESTÁ ENVERGANDO...") e treme → "ARREBENTOU!": as pontas chicoteiam, o anel explode → "256 CORTES! Você chutou quanto?" → loop.
- **Som:**
  - cada corte é uma nota dedilhada (Karplus-Strong) numa pentatônica: o meio do fio soa grave e perto da roldana soa agudo, e a escala sobe a cada meia volta;
  - zumbido grave do fio, rangido das roldanas a cada meia volta, sino a cada ×2 e cama em Lá menor;
  - tensão que sobe enquanto o fio enverga, "TWANG", boom e acorde.
- **Mixagem:** compressor antes do loudnorm (−14,1 LUFS, pico −4,2 dBFS).
- Teste rápido sem desenho: `RAPIDO=1 python3 scripts/fio.py`.

### Próximos mecanismos (um por vídeo)
1. **Divisão celular:** cada batida divide a bola em duas menores, até virar "areia" que transborda.
2. ~~Ampulheta~~ (feito).
3. ~~Engrenagens~~ (feito).
4. ~~Balão elástico~~ (feito).
5. ~~Buraco negro invertido~~ (feito).
6. **Camadas de vidro:** anéis concêntricos de vidro, cada um com resistência visível, que trincam e quebram por dentro.
7. **Espiral:** a bola desce uma espiral; cada volta completa dobra as bolas, até a espiral entupir e explodir.
8. **Teclado/Plinko:** pinos que tocam notas e multiplicam; o funil entope e transborda.
