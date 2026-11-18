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

### Próximos mecanismos (um por vídeo)
1. **Divisão celular:** cada batida divide a bola em duas menores, até virar "areia" que transborda.
2. ~~Ampulheta~~ (feito).
3. **Engrenagens:** bolas caem em engrenagens girando; cada dente que toca duplica a bola; a máquina engasga e quebra.
4. **Balão elástico:** a borda é uma membrana que estica com a pressão (molas) até estourar.
5. **Buraco negro invertido:** cada bola que cai no centro sai como duas pelas bordas; o centro cresce até engolir a tela.
6. **Camadas de vidro:** anéis concêntricos de vidro, cada um com resistência visível, que trincam e quebram por dentro.
7. **Espiral:** a bola desce uma espiral; cada volta completa dobra as bolas, até a espiral entupir e explodir.
8. **Teclado/Plinko:** pinos que tocam notas e multiplicam; o funil entope e transborda.
