# Flávia Valadão · Portal do cliente (16:9)

Vídeo explicativo para a seção "Portal" do site da Flávia. O roteiro e a fonte de cada afirmação estão em `roteiros/flavia-portal-16x9.md`.

- **Formato:** 1920 × 1080, 30 fps, cerca de 96 s, Remotion, com legendas queimadas.
- **Telas:** capturas reais do protótipo do portal (`landing-sites/flavia-portal/index.html`, dados de exemplo).
  - `scripts/capturar.js` abre o protótipo no Playwright em 2x, entra como a cliente de exemplo e percorre login → home → cozinha (imagens, tela cheia, compras, "Já comprei", obra, plantas) → sala de estar (retorno).
  - A faixa "Protótipo com dados de exemplo" e as contas de demonstração do login ficam escondidas.
  - Saem `public/assets/telas/*.jpg` e as caixas dos elementos em `src/data/telas.json`, que guiam a câmera, os destaques e o cursor.
  - Para atualizar quando o portal mudar: `NODE_PATH=$(npm root -g) node scripts/capturar.js /caminho/landing-sites/flavia-portal/index.html`.
- **Identidade:** a da seção do site.
  - Cores: noite `#1C1915`, marfim, caramelo `#E4B37F` e linha de LED.
  - Fontes: Cormorant e Manrope (OFL).
  - Logo oficial na assinatura, em fundo marfim, sem recolorir.
- **Voz:** Pri (`8EY2gK6oUxZCDZAlvUpZ`, stability 0.55, similarity 0.8, style 0.15). É a mesma do institucional; ela não imita a Flávia.
- **Trilha:** original, piano a 80 BPM (`scripts/trilha.py`).

## Pipeline

```
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --stability=0.55 --style=0.15 --so=p1,...
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npm run render && bash scripts/finalizar.sh
```

Saídas em `out/`: `Flavia-Valadao-Portal-16x9.mp4`, `.srt`, `-narracao.wav`, `capa.png`, `marcas-som.txt` e `conferencia.txt`.
