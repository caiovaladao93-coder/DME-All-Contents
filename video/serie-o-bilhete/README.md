# O BILHETE · Ep. 1 "A calça"

Série interativa de comédia de perseguição em 9:16, sem marca DME, com personagens 2D autorais em recorte de papel e dados fictícios. O roteiro está em `roteiros/serie-o-bilhete.md`.

- **Formato:** 1080 × 1920, 30 fps, cerca de 95 s (85 s de história + 10 s de decisão), Remotion.
- **Personagens:** `src/Person.tsx` (Você, Mãe, Dona Cida, Léo), com poses, expressões e boca sincronizada à fala; animação pose a pose a 12 fps. O filtro `#papel` (borda irregular + sombra deslocada) fica em `src/Film.tsx`.
- **Vozes:** narrador (72 Horas Narrador) e três vozes novas por Voice Design; ver `voz/README.md`. A mensagem de voz da mãe tem filtro de celular (`FILTRO` em `scripts/pausas.py`).
- **Trilha:** original, comédia de perseguição a 120 BPM (`scripts/trilha.py`).
- **Fontes:** Sora, Manrope e JetBrains Mono (OFL).

## Pipeline

```
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.45 --style=0.35 --so=n1,...
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npm run render && bash scripts/finalizar.sh
```

Saídas em `out/`: `O-Bilhete-Ep1-A-Calca.mp4`, `.srt`, `-narracao.wav`, `capa.png`, `marcas-som.txt` e `conferencia.txt`.
