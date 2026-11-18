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
