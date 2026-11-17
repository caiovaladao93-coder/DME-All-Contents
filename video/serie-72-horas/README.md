# 72 HORAS · Parte 1 "O GALPÃO"

Série interativa de ficção (thriller de negócios) em 9:16, **sem marca DME**, sem pessoas na tela e com dados fictícios. O roteiro e as decisões estão em `roteiros/serie-72-horas.md`.

- **Formato:** 1080 × 1920, 30 fps, cerca de 100 s (89 s de história + 10 s de decisão), Remotion.
- **Vozes:**
  - narrador: **72 Horas Narrador** (`h8kJ5JnfR302VfkueTp8`), voz própria criada por Voice Design (ver `voz/README.md`); stability 0.45, similarity 0.85, style 0.3;
  - cliente (`c1`): Guilherme, com filtro de telefone (`FILTRO` em `scripts/pausas.py`);
  - sócio (`s1`): Lendário, calmo e um pouco mais lento (speed 0.92).
- **Fontes:** Sora, Manrope e JetBrains Mono (OFL).

## Pipeline

```
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.45 --style=0.3 --so=f1,...
python3 scripts/escolher_take.py f1,f2,...      # limpeza das tomadas (junto com STT e timbre)
python3 scripts/pausas.py                       # tomada escolhida, respirações removidas, pausas limitadas, filtro de telefone
python3 scripts/linha_tempo.py                  # src/data/timeline.json (cenas, palavras, legendas)
python3 scripts/trilha.py                       # trilha original + out/marcas-som.txt
npm run render && bash scripts/finalizar.sh     # MP4 final a -14 LUFS, SRT, narração separada e conferência
```

## Saídas (`out/`)

- `72-Horas-P1-O-Galpao.mp4`;
- `72-Horas-P1-O-Galpao.srt`;
- `72-Horas-P1-O-Galpao-narracao.wav`;
- `capa.png`;
- `marcas-som.txt`;
- `conferencia.txt`.
