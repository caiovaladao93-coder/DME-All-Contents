# 10 SEGUNDOS · temporada "O prédio" · Ep. 2 "O saco de evidência"

Continuação do ep. 1 v2. O público escolheu **A · abrir e mostrar a foto**. O roteiro está em `roteiros/10-segundos-ep2.md`.

- **Formato:** 1080 × 1920, 30 fps, 84,5 s, Remotion. Mesma linguagem da série: mãos e celular, olho mágico com lente olho de peixe e o assobio de quatro notas.
- **Novidades:**
  - corredor com a porta aberta (sem lente), com a delegada e o porteiro de frente;
  - o notebook e o saco de evidência **Nº 0412**;
  - a contagem de **10 degraus** (passos na escada, um por segundo).
- **Vozes:**
  - narrador (`7wam7e2MYDsrk95Yc6tM`) e Delegada Rocha (`sua1mPTtoAGPaBXx5eNr`);
  - **voz nova do Seu Valdir** (`RNBKQvahvLLI2YICW3n3`, Voice Design, prévia valdir-2; ver `voz/`).

## Pipeline

```
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npm run render && bash scripts/finalizar.sh
```
