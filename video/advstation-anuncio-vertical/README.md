# ADV Station · anúncio vertical (31,1 s) · `out/ADV-Station-Anuncio-Vertical.mp4`

Anúncio no formato "produto em uso" (roteiro e decisões em `roteiros/advstation-anuncio-vertical.md`). É feito em **Remotion**, com a marca, as fontes e as telas reais do projeto `advstation-demo-vertical-v3`; o `node_modules` é um link para o desse projeto.

- **Layout** (`src/Film.tsx`):
  - fundo marinho e marca oficial (`BrandMark`) no topo;
  - título fixo "Cada caso tem seu **caminho**." em Gelasio 700 e o subtítulo;
  - selo do produto (Maternidade Legal → Previdenciário Geral);
  - **janela do navegador** (960 × 740, borda dourada) com as capturas reais e a câmera interna (foco e escala por cena);
  - cursor com clique (anel dourado) e destaques dourados nas regiões reais;
  - legenda sincronizada à fala, com a palavra-chave em dourado;
  - selos de função com check;
  - faixa "DADOS DEMONSTRATIVOS" no canto;
  - cartão final.
- **Tempos:** saem das palavras da narração (`src/data/palavras.json`, gerado por `scripts/palavras.py` a partir de `voz/takes/anuncio-1.json`).
- **Voz:** Guilherme (`scripts/gerar_voz.mjs`, uma tomada com `<break>`). Das 3 tomadas, a 1 foi escolhida, e as 3 conferem com a transcrição.
- **Som:** `scripts/trilha.py` faz piano e pad em Sol maior a 100 BPM, cliques do cursor, sopros nas trocas de tela, um sino por selo e o jingle oficial no cartão final. Gera `public/assets/audio/mix.wav`.
- **Render:** `npm run render` gera `out/render-bruto.mp4`, e `bash scripts/finalizar.sh` gera o master (−15 LUFS em 2 passadas, a capa e a conferência).
- **Saídas:** `out/ADV-Station-Anuncio-Vertical.mp4`, `out/capa.png`, `out/marcas-som.txt` e `out/conferencia.txt`.
