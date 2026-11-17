# 10 SEGUNDOS · temporada "O prédio" · Ep. 1 "O áudio das 3h12"

Suspense em **primeira pessoa**, sem sangue, sem marca DME e com dados fictícios. O roteiro está em `roteiros/serie-testemunha.md` (o nome do perfil escolhido foi **10 SEGUNDOS**).

- **Formato:** 1080 × 1920, 30 fps, cerca de 94 s (83 s de história + 10 s de decisão), Remotion.
- **Linguagem:**
  - POV com as minhas mãos e o celular (`Hands`, `Chat`);
  - **olho mágico** com lente olho de peixe: `feDisplacementMap` com o mapa `public/assets/img/olho-magico-mapa.png`, embutido em `src/data/olhoMapa.ts` para carregar em todo quadro. O mapa foi gerado por numpy: saída no raio r busca a origem em r·(0,72 + 0,62 r²);
  - personagens 2D vistos pela lente (Delegada Rocha, Seu Valdir).
- **Vozes:** narrador, Seu Elias e Delegada Rocha, criadas por Voice Design (ver `voz/README.md`).
  - O áudio do Seu Elias tem filtro de mensagem de voz.
  - A delegada fala abafada pela porta (`FILTRO` em `scripts/pausas.py`).
- **Trilha:** original, com drone, coração e silêncios. O **assobio de quatro notas** (Mi–Sol–Fá#–Si) é o tema da série.
- **Fontes:** Sora, Manrope e JetBrains Mono (OFL).

## Pipeline

```
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.5 --style=0.25 --so=n1,...
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npm run render && bash scripts/finalizar.sh
```

Saídas em `out/`: `10-Segundos-Ep1-O-Audio-das-3h12.mp4`, `.srt`, `-narracao.wav`, `capa.png`, `marcas-som.txt` e `conferencia.txt`.
