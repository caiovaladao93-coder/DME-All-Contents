# 10 SEGUNDOS · temporada "O prédio" · Ep. 1 v2 "A foto das 3h10"

Revisão do ep. 1 com gancho mais forte. O roteiro está em `roteiros/10-segundos-ep1-v2.md`. Usa a mesma linguagem e as mesmas vozes de `video/dez-segundos-ep1/`: POV com mãos e celular, olho mágico com lente olho de peixe, narrador e Delegada Rocha. A versão v1 continua na pasta anterior.

- **Formato:** 1080 × 1920, 30 fps, 78,8 s, Remotion.
- **Gancho:** o quadro 0 mostra a foto de mim dormindo, tirada com o meu celular às 03:10.
- **Contagem dentro da história:** a delegada conta de 1 a 10, um número por segundo.
  - A tomada única `dc` (gerar "Um." sozinho saía como "Hum") é recortada por `scripts/contagem.py`:
    - etapa 1: grava a fala `c1`;
    - etapa 2: monta `public/assets/audio/contagem.wav` e `src/data/contagem.json`, que o cartão A/B usa para acompanhar a voz.

## Pipeline

```
python3 scripts/pausas.py && python3 scripts/contagem.py 1 && python3 scripts/linha_tempo.py && python3 scripts/contagem.py 2 && python3 scripts/trilha.py
npm run render && bash scripts/finalizar.sh
```
