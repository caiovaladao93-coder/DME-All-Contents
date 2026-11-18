# "1 CONTRA 10.000" · teste de retenção no formato "batalha de multidão" (9:16, 62 s)

Inspirado na **mecânica** de um anúncio de jogo enviado como referência (multidão contra multidão, portais multiplicadores, contadores, chefão e derrota por pouco). **Não recria o jogo:** arena, unidades, portais, chefão, nome e textos são originais e desenhados em código.

- **Sem narração.** Os contadores e os textos grandes contam a história; o som é trilha e efeitos.
- **Roteiro de atenção:**
  - 0 s · "1 CONTRA 10.000";
  - portais +20, ×2, ×5, ×10 (o azul cresce de 1 a 1.500);
  - 19 s · ONDA 2 (+20.000 vermelhos);
  - 25 s · PORTA DOURADA ×20 (30.000 azuis);
  - 32 s · CHEFÃO, que derruba os portais um a um;
  - 46 s · "ELE ESTÁ CHEGANDO";
  - 49 s · "ÚLTIMO SOLDADO";
  - 51 s · DERROTA, "Faltou 1 soldado.";
  - 53–62 s · "Você tem 100 soldados. Qual porta te salva? ×50 ou +5.000. Comenta!", com contagem de 6 s. A resposta certa é +5.000 (5.100 contra 5.000), o que puxa discussão nos comentários.
- **Simulação determinística em canvas** (`src/Film.tsx`). A estrada em S tem comprimento de arco; milhares de unidades fluem por ela, a densidade vem das contagens, e cada portal multiplica visualmente a densidade azul acima dele. A frente da batalha, as contagens, os portais e os eventos ficam em `src/data/plano.json`.
- **Trilha e efeitos originais** (`scripts/trilha.py`, lê o mesmo `plano.json`):
  - batida a 128 BPM em camadas, com drops na onda 2 e na porta dourada e uma seção sombria no chefão;
  - estouros proporcionais às baixas, "ding" nos portais, tiros do canhão e pisadas;
  - sirene, coração no último soldado e "derrota" descendente.

```
python3 scripts/trilha.py
npx remotion render src/index.ts Multidao out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac
bash scripts/finalizar.sh
```
