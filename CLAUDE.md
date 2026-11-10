# DME All Contents · instruções para o Claude

Repositório de conteúdo da **DME Technology**: roteiros e vídeos curtos (Reels) em motion graphics. Responda sempre em português do Brasil.

## Fluxo padrão quando o usuário manda uma ideia nova

1. Leia `roteiros/prompt-mestre-reels-dme.md`. Ele é a fonte das regras de roteiro, ritmo, composição, movimento e conferência.
2. Transforme a ideia em roteiro usando a estrutura da referência: gancho → trinca → tensão → virada ("Agora…") → demonstração → montagem de tempo → verbos → fecho "Então, enquanto você…" → elemento que fecha o loop → assinatura com CTA.
3. Mostre o roteiro e pergunte **só** o que bloquear o trabalho: uma função de produto fora da lista de fatos abaixo ou uma frase que soe como promessa. Se o usuário disser "pode gerar direto", siga sem parar.
4. Gere o vídeo com a skill `motion-graphics-video`. Parta do vídeo `video/reels-ferias-v2/video.html` como modelo: ele já traz o motor `render(t)`, os helpers, o logo animado e os padrões de cena.
5. Faça a conferência obrigatória do prompt mestre: folha de contato, quadro 0 legível, capa 3:4, ffprobe e QA de movimento. Só então faça o commit e o push.

## Marca

- **Cores:** #0A0B0C (fundo), #1C1F22 (superfícies), #264B71 (profundidade e assinatura), #C0C6CC (aço), #3A6EA5 (destaque, só na palavra-chave).
- **Fontes:** Sora (títulos) e Manrope (interface). Os arquivos woff2 com licença OFL estão em `video/reels-ferias-v2/fonts/`.
- **Logo:** `video/brand/dme-logo.svg`, um vetor redesenhado a partir do mockup oficial. Não distorcer nem recolorir. A única exceção é a animação de montagem das 4 peças.
- **Estética:** escura, aço escovado, cinematográfica. **Sem neon**, glow, partículas, emojis, fotos ou pessoas.
- **CTA padrão:** "Envie COMERCIAL no direct." No institucional: "Converse com a DME."
- **Slogan:** "Automatizamos processos. Devolvemos tempo."

## Fatos confirmados pelo cliente (únicas afirmações de produto permitidas)

- O CRM personalizado faz retornos automáticos.
- O agente de voz com IA atende fora do horário, qualifica, registra no CRM e transfere para uma pessoa da equipe.
- A DME oferece diagnóstico, mapeamento, padronização e automação de processos.
- A DME atua com inteligência artificial, automações, integração de sistemas e desenvolvimento de soluções digitais personalizadas.
- Abordagem: entender os desafios de cada empresa, identificar gargalos e desenvolver soluções sob medida (método Entender → Planejar → Desenvolver).

**Proibido:** inventar métricas, depoimentos, clientes, integrações, telas de produto reais ou garantias. Dados de interface são fictícios e levam o selo "Exemplo ilustrativo". Frases que soem como promessa ("pode marcar as férias", "nunca mais perde cliente") precisam da aprovação do usuário.

## Vídeo: especificações técnicas

- 9:16, 1080x1920, 30 fps, de 30 a 35 s, H.264.
- Zona segura: texto entre y=250 e y=1580, margens de 90 px e nenhum texto em x>950 abaixo de y=1100.
- Renderização: `node render.js video.html out/<nome>.mp4 1080 1920 30 <duração>` leva cerca de 9 min para 34 s. Use `run_in_background`.
- Capturas de teste: `node render.js video.html out/testes 1080 1920 30 <duração> 0,1.5,...`
- Estrutura de cada vídeo: `video/<nome>/` com `video.html`, `render.js`, `fonts/` e `out/` (MP4, `capa.png`, `marcas-som.txt`). Arquivos de teste ficam fora do git (ver `.gitignore` de cada pasta).
- O Playwright e o Chromium já vêm instalados no ambiente cloud. Não reinstale.

## Áudio

- Os vídeos saem **sem áudio** por padrão.
- Voz sintética local (Kokoro) foi testada e reprovada pelo usuário por soar robótica. **Não usar voz sintética sem pedido explícito.**
- **Narração:** a chave da ElevenLabs está salva no ambiente (o proxy a injeta), então não peça de novo. Use a voz **Guilherme** (`CS07DI8x8kLXeSktyWLG`, `eleven_multilingual_v2`, stability 0.6, similarity 0.8, style 0.12), com 3 tomadas por fala e a escolha por medição (`scripts/escolher_take.py`).
  - **Sincronia:** gere frases inteiras e recorte nas pausas. Cada trecho entra quando a frase aparece na tela. Se faltar tempo, desacelere a animação naquele trecho (WARP). O modelo é `video/reels-ferias-v3/scripts/sincronizar.py`.
  - **Mixagem:** normalize para -14 LUFS (pico -1,5 dBTP) e gere `<nome>-narrado.mp4`.
  - **Gravação humana:** se o usuário enviar uma, separe as falas por silêncio e siga o mesmo fluxo.
- **Trilha:** original e procedural (numpy). Use silêncio de 0,3 a 0,5 s antes da virada e ducking sob a voz. O modelo é `video/reels-ferias-v3/scripts/trilha.py`.
- Sempre entregue `marcas-som.txt` com os tempos de frases e efeitos.

## Mapa do repositório

- `roteiros/prompt-mestre-reels-dme.md`: prompt mestre, com diagnóstico do que melhorar e o roteiro "Férias" v2.
- `roteiros/reels-estilo-comercial-v2.md`: roteiros prontos 1 (CRM, "Quem lembra?") e 2 (agente de voz, "Ninguém atendeu"), ainda não produzidos.
- `roteiros/estudo-referencia-inter-porquinho.md`: estudo de linguagem de um comercial de motion design de referência. Traz a decupagem, os princípios (gancho de situação, interface em componentes, lista + demonstração, fio condutor, transição pelo objeto, pausa antes da virada, loop), a aplicação por marca, as receitas técnicas e um checklist. **Consulte ao roteirizar e animar qualquer peça nova.**
- `roteiros/reels-ia-versao-da-verdade.md`: primeiro roteiro, descartado por ser fraco. Fica como referência do que evitar.
- `video/reels-ferias-v2/`: vídeo mais recente e aprovado, que é o **modelo de referência**.
- `video/reels-ferias-v3/`: a v2 com **narração** (Guilherme) e **trilha original**. A animação é sincronizada à fala pelo `warp.json`, há silêncio antes do "Agora" e as palavras entram com desfoque de movimento mais forte. Saídas: `dme-reels-ferias-v3-narrado.mp4` (35,4 s) e a versão sem áudio.
- `video/reels-ferias-v4/`: a versão **3D (three.js)** do mesmo Reels. A câmera percorre 12 estações sem cortes, com materiais de aço escovado, chão espelhado e logo DME extrudado do vetor. Todas as partes têm narração (Guilherme) e a trilha é original, sincronizada aos eventos 3D. O código fica em `src/main.js`, empacotado em `dist/bundle.js` com esbuild. O `render.js` usa WebGL por SwiftShader (cerca de 0,8 s por quadro). Os tempos vêm das falas (`scripts/linha_tempo.py` → `src/timeline.json`).
- `video/dme-trabalho-viaja/`: Reels **"O trabalho também viaja?"** (39,5 s) em **Remotion**. É um mundo contínuo: o celular é o protagonista, as solicitações viram etapas e as conexões se redistribuem, com revisão humana preservada. Usa Space Grotesk e Manrope, voz do Guilherme sem compressão, legendas queimadas, SRT e narração separada. A abertura usa um celular real (foto Pexels 36538967, tela verde substituída) com as notificações chegando uma a uma.
- `video/dme-ferias-escritorio/`: Reels **"Suas férias não precisam virar escritório"** (37,8 s) em **Remotion**. O celular é montado em CSS 3D (`Phone3D.tsx`: aro da foto Pexels 26109750, espessura em lâminas e reflexo que acompanha a rotação). As notificações (Financeiro, Comercial, Operação) viram atividades de um fluxo, e o fim acontece numa praia gerada, sem o celular. Tem voz do **Lendário** (`4za2kOXGgUd57HRSQ1fn`, escolhida pelo usuário; pronúncia de DME conferida por speech-to-text; a frase "DME Technology" foi refeita e emendada com `scripts/emendar_marca.py`), CTA "Comente COMERCIAL e receba um diagnóstico", trilha procedural, SRT e narração separada.
- `video/reels-ferias/`: v1 do mesmo vídeo, com a pasta `audio/` do teste de voz sintética.
- `video/reels-versao-da-verdade/`: primeiro vídeo (descartado).
- `video/brand/dme-logo.svg`: logo vetorial.
- `video/sgc-institucional/`: institucional vertical do **SGC** (cliente; repositório `jvramos10/sgc-prototipo`), no modelo HTML da DME, com a marca SGC (marinho `#0A2048` e laranja `#F86A14`). O logo é montado com as camadas oficiais. O roteiro e a fonte de cada afirmação estão em `roteiros/sgc-institucional-vertical.md`.
- `video/sgc-apresentacao/`: filme de apresentação **SGC** de 39,6 s, em 16:9 e **Remotion**. Apresenta o diagnóstico de saúde da gestão (10 perguntas → prévia com blur → pagamento único de R$ 49,90 → resultado → PDF). Tem voz do Guilherme, trilha procedural, SRT e storyboard. Sem imagens reais: telas e cenários são componentes gerados. A fonte única dos tempos é `src/data/timeline.json`. Veja o `README.md` da pasta.
- `video/sgc-institucional-instagram/`: institucional **SGC** vertical de 39,7 s em **Remotion**: metodologia (diagnóstico FILMC 360° → prioridades → plano de ação → acompanhamento). Tem voz do Guilherme a 1,06, trilha com piano e 7 cenas. Os planos são gerados sem pessoas e podem ser trocados por fotos em `src/data/photos.ts`.
- `video/advstation-reels-apresentacao/`: apresentação **ADV STATION** vertical de 59,7 s para o Instagram, em Remotion. Abre com a vinheta padrão e o jingle, explica as etapas reais dos dois sistemas com telas reais e fecha com o cartão final da marca. Usa a voz do Guilherme e trilha a 120 BPM.
- `video/institucional-80s/`: filme institucional de 80 s em **Remotion** (React/TS), com componentes por cena, legendas, SRT e capa. Leia o `README.md` e o `ASSETS-PENDENTES.md` dessa pasta, que listam as fotos e o áudio que ainda faltam. Para peças longas ou com fotografia, prefira esse projeto como base. Para Reels curtos, use o modelo HTML.
- **Pexels:** o ambiente `dme-all-contents` libera `images.pexels.com`, `videos.pexels.com` e `www.pexels.com`. Busca no site (403) e API (a emissão de chaves está pausada) **não funcionam**. O usuário envia links, e eu extraio o número do item:
  - foto: `https://images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg`;
  - vídeo: `https://www.pexels.com/download/video/<ID>/` (redireciona para o MP4).
  Em vídeos com pessoas, as pessoas não podem ser apresentadas como equipe ou clientes da DME. Unsplash continua bloqueado. Sem links, use ilustrações vetoriais sem pessoas.
