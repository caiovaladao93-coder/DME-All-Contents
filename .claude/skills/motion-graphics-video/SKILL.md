---
name: "motion-graphics-video"
description: "Cria vídeos curtos profissionais em motion graphics (Reels, Stories, TikTok, anúncios) com HTML determinístico, renderizados em MP4 no Claude Code com Playwright e ffmpeg. Use ao pedir vídeo, reels ou animação de marca."
---

# Criador de vídeos em motion graphics (Claude Code)

Produz vídeos curtos, sóbrios e de aparência profissional a partir de uma página HTML animada por uma função pura do tempo, e entrega o MP4 pronto na pasta do projeto do usuário. Serve para marcas que precisam de precisão e credibilidade (jurídico, saúde, finanças, B2B, software), onde logo, cores, fontes e textos têm de sair exatos.

O trabalho acontece no computador do usuário, dentro da pasta onde o Claude Code foi aberto.

## Quando usar

- Pedidos de reels, stories, vídeo institucional, vinheta, explicação animada, anúncio curto.
- Peças com texto, formas, gráficos, interface ilustrativa e logo animada.

## Quando não usar

- Vídeo com pessoas, filmagem real ou cenas fotorrealistas: isso exige gerador de vídeo por IA ou captação. Diga isso logo e ofereça um roteiro ou storyboard.
- Edição de um vídeo que o usuário já enviou.

## 1. Briefing mínimo

Se a conversa ou o prompt já trouxer os itens, não pergunte de novo. Pergunte só o que faltar, de uma vez:

- Marca: cores (hex), fontes, logo (SVG ou medidas para redesenhar), regras de uso da logo, o que é proibido.
- Formato e destino: 9:16 (Reels, Stories, TikTok), 1:1, 4:5 ou 16:9; duração; fps (30 por padrão).
- Mensagem: gancho, ideia central, textos exatos, chamada final.
- Restrições de conteúdo: o que não pode ser prometido, dados fictícios obrigatórios, termos regulados.

Sem briefing de marca, proponha uma paleta de no máximo 3 cores mais neutros, uma fonte serifada e uma sem serifa, e deixe isso explícito.

## 2. Roteiro antes do código

Escreva, em lista curta, antes de programar: conceito em uma frase, cenas com início e fim em segundos, texto exato de cada cena, o que se move e por quê. Uma ideia por vídeo, um foco visual por vez. Se o prompt do usuário já trouxer o storyboard completo, siga-o e não reescreva.

## 3. Arquitetura da página (contrato)

Um único arquivo HTML autocontido, JavaScript puro, sem bibliotecas de animação.

- Toda a animação é uma função pura `render(t)`, com t em segundos. Proibido setTimeout, setInterval e animações CSS soltas. Assim qualquer quadro pode ser reproduzido exatamente.
- Exponha `window.renderAt(t)`, síncrona, que atualiza o DOM/SVG para o instante t. É ela que o script de renderização chama.
- Palco fixo no tamanho final (por exemplo 1080x1920), escalado com `transform: scale` para caber na janela durante a prévia.
- Parâmetros de URL: `?t=12.5` abre parado nesse instante; `?frame=1` abre sem controles, sem letterbox, em escala 1:1 e sem tocar sozinho (usado na renderização); `?rec=1` é o modo com tudo oculto.
- Controles de prévia: Iniciar, Espaço (pausa), R (reinicia), setas (±1 s), S (guias da zona segura), T (tempo atual).
- Textos, cores, medidas e tempos em constantes no topo do arquivo. Blocos comentados: constantes, easing, construção do DOM/SVG, render(t), controles.
- Anime `transform`, `opacity`, o desenho de traços com dash, `clip-path` (máscaras de texto e transições) e `filter: blur` (desfoque de entrada de texto e desfoque de movimento proporcional à velocidade). Transformações 3D (perspective, rotateX/Y, translateZ) valem para logo e objetos.
- Espere `document.fonts.ready` antes de liberar a prévia ou a renderização.

## 4. Linguagem de movimento

- Entradas com desaceleração suave, por exemplo cubic-bezier(0.22, 1, 0.36, 1). Reorganizações com ease-in-out, por exemplo cubic-bezier(0.65, 0, 0.35, 1). Saídas curtas (cerca de 350 ms) com ease-in. Implemente as curvas em JavaScript dentro de render(t).
- Física controlada: molas com overshoot de no máximo 3 a 4 por cento são permitidas em cartões, chips, interruptores e painéis; textos entram sem overshoot. Sem elástico exagerado nem bounce.
- Profundidade sóbria é permitida e desejada: sombras suaves em camadas, luz radial suave de fundo, objetos 3D feitos de camadas CSS 3D. Sem neon, glow em texto ou objeto, partículas, lens flare, vidro fosco, emojis, fotos, pessoas e clichês do setor (balança e martelo no jurídico, estetoscópio na saúde, cifrão em finanças).
- Um único reflexo discreto numa forma de marca é o máximo de "brilho" aceitável.
- Tremor ou caos, quando a história pedir, deve ser determinístico (seno e cosseno de t com fases por elemento), nunca aleatório.
- Ritmo seguro e cadenciado, com cortes alinhados a uma batida (por exemplo 120 BPM: 0,5 s por batida, 2 s por compasso). Sempre há micromovimento (câmera, flutuação, deriva do fundo); nada fica parado por mais de 1,0 s. Pare de mover tudo nos últimos 0,5 s para ter um quadro final limpo (capa e corte).

## 4b. Padrão de produção premium (comercial de tecnologia)

Quando o pedido for um vídeo institucional, de produto ou de marca, trabalhe neste padrão:
- Cenas curtas (2 a 6 s), uma ideia por cena, com arco de comercial: gancho, demonstração em blocos, virada emocional, assinatura de marca.
- Tipografia cinética em escala de comercial (96 a 190 px): palavras sobem de dentro de uma linha recortada, com desfoque que se desfaz; a frase troca no mesmo lugar (a antiga sobe e desfoca, a nova entra por baixo); a palavra-chave recebe destaque de marca (sobre fundo escuro, cor de destaque; sobre fundo claro, marcador desenhado atrás).
- Interface em cartões flutuantes: notificações que empilham, lista com item ativo que alterna enquanto o cartão ao lado troca de conteúdo, interruptor que liga, campo que recebe digitação, checks que se completam, painel que se transforma de computador em celular. Dados sempre fictícios e marcados como ilustrativos.
- Objetos 3D de camadas (logo extrudada, cofre, caixa) com inclinação contínua e sombra de contato.
- Câmera sutil (aproximação de 1,00 a 1,035 por cena), paralaxe entre fundo, cartões e chips, flutuação determinística.
- Fundos alternando entre claro e escuro, com transições gráficas (barra de marca que varre a tela, íris circular, dissolução com desfoque), nunca fade simples entre cores diferentes.
- Mola: spring(t, zeta=0.72, omega=14), solução analítica do oscilador subamortecido, overshoot de cerca de 3 por cento. Desfoque de movimento: blur = min(10, velocidade_px_s * 0.006).
- A referência dá a técnica, nunca o conteúdo: não copie marca, cores, símbolos nem textos de terceiros.
- Gere uma lista de eventos sonoros com o tempo de cada um (marcas-som.txt) a partir das constantes de animação, e indique a trilha (BPM e energia por cena).

## 5. Texto e leitura

- Use os textos exatamente como definidos. Não troque palavras sem avisar.
- Entrada palavra por palavra, cerca de 80 ms entre palavras, 520 ms por palavra (opacidade, subida de 22 px, desfoque de 6 px a 0).
- Regras de leitura: o texto completo fica visível por no mínimo 1,0 s, e o tempo total do texto na tela é de pelo menos palavras ÷ 3,5 segundos.
- Nenhum texto abaixo de 22 px num palco de 1080 de largura. Numerais tabulares em contagens.
- O vídeo tem de funcionar sem som: todo o essencial está em texto.

## 6. Zonas seguras

- Reels, Stories e TikTok (1080x1920): nada de texto nos 250 px superiores nem nos 340 px inferiores (texto entre y=250 e y=1580); margens laterais de 90 px; nenhum texto nos 130 px da direita abaixo de y=1100. Grid do perfil em 3:4: deixe o conteúdo da capa na faixa central y=240 a y=1680.
- Traços decorativos podem sangrar até a borda; texto não.
- Para outros formatos, aplique margens proporcionais e diga quais usou.

## 7. Marca

- Só cores e fontes da marca; variações apenas por opacidade.
- Logo redesenhada em SVG a partir das medidas oficiais, nunca distorcida, girada, recolorida ou separada. Se o SVG original estiver na pasta do projeto, use-o. Senão, avise que a logo foi redesenhada.
- Dados em interfaces ilustrativas são sempre fictícios e marcados como "ilustrativo".
- Não prometa resultado, não invente números, não afirme funções que o usuário não confirmou. Em setores regulados (jurídico, saúde, finanças), registre uma lista curta de pontos a conferir com o cliente.

## 8. Renderização para MP4 no Claude Code

Pré-requisitos (verifique antes de começar): `node -v`, `ffmpeg -version`, `npx playwright --version`. Se faltar algo, instale e diga ao usuário o que foi instalado: `npm install playwright` e `npx playwright install chromium` na pasta do projeto; ffmpeg por `brew install ffmpeg` (Mac), `winget install ffmpeg` (Windows) ou `apt install ffmpeg` (Linux). Peça confirmação antes de instalar qualquer coisa global.

Fontes: confirme com `document.fonts.check(...)` que cada fonte da marca carregou, sem fallback. No Mac, Iowan Old Style já existe no sistema. Inter vem do Google Fonts ou, sem internet, do pacote npm `@fontsource/inter`. Se uma fonte licenciada não estiver disponível, use uma equivalente e avise.

Estrutura sugerida na pasta do projeto: `video.html` (nome livre), `render.js`, `out/` (MP4) e `out/testes/` (capturas).

Script `render.js` (renderiza o MP4 ou, com a lista de instantes, só as capturas de teste):

```js
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  // uso: node render.js video.html out/video.mp4 [W H FPS DUR] ; capturas: node render.js video.html out/testes 1080 1920 30 24 0.6,12.5,23.8
  const [,, html, out, W = '1080', H = '1920', FPS = '30', DUR = '24', STILLS = ''] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(html)).href + '?frame=1');
  await page.evaluate(() => document.fonts.ready);
  if (STILLS) {
    fs.mkdirSync(out, { recursive: true });
    for (const s of STILLS.split(',')) {
      await page.evaluate(t => window.renderAt(t), +s);
      await page.screenshot({ path: path.join(out, 't' + s + '.png') });
    }
    await browser.close();
    return;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',FPS,'-i','-',
    '-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-movflags','+faststart', out], { stdio: ['pipe','inherit','inherit'] });
  const n = Math.round(+DUR * +FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderAt(t), i / +FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})();
```

Se a renderização for lenta, rode em segundo plano e avise o usuário do tempo estimado depois de medir os primeiros quadros.

## 9. Conferência (obrigatória antes de dar como pronto)

1. Gere capturas de teste nos instantes-chave (final de cada cena, meio das transições, último quadro) e olhe cada imagem com a ferramenta de leitura de imagens. Não declare que ficou bom sem ter visto.
2. Confira: textos idênticos ao roteiro, nada fora da zona segura, nenhuma sobreposição ilegível, logo íntegra (pernas do A encostadas na barra, sem vão), cores dentro da paleta, fontes carregadas (sem fallback inesperado).
3. Renderize o MP4 e confira com `ffprobe`: resolução, fps, duração e codec. Extraia 3 quadros do MP4 (`ffmpeg -ss T -i arquivo.mp4 -frames:v 1 quadro.png`) e compare com as capturas de teste. Amostre a cor de fundo de um quadro: deve bater com o hex da marca.
4. QA de movimento: gere um preview de baixa resolução, calcule a diferença média entre quadros consecutivos e registre trechos parados por mais de 1,0 s (só o quadro final pode ficar parado). Corrija com micromovimento antes de renderizar o final.
5. Se algo falhar, corrija o HTML e renderize de novo. Não entregue com ressalvas escondidas.

## 10. Entrega

- Salve o MP4 em `out/` e o HTML-fonte na pasta do projeto. Informe o caminho completo dos arquivos.
- Diga em poucas linhas: o que foi feito, duração e formato, o que ficou pendente (logo original, fonte oficial, narração), e o que foi instalado, se algo foi.
- Áudio: este fluxo gera vídeo sem som. Quando útil, entregue junto o roteiro de voz com marcação de tempo, a direção de trilha (instrumental licenciada, 90 a 100 BPM, cerca de 20 dB abaixo da voz) e os pontos de efeito sonoro. Mixagem final sugerida: -14 LUFS, pico real abaixo de -1 dBTP.
- Para outros formatos, parametrize largura e altura e reajuste as zonas seguras em vez de duplicar o arquivo.

## 11. Limites

- Não gera pessoas, filmagem real nem voz.
- Não vem com direitos de música; sugira trilha licenciada ou livre de direitos.
- Sempre separe o que foi verificado (quadros vistos, MP4 inspecionado) do que não foi.