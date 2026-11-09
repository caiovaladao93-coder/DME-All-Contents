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
- **CTA padrão:** "Envie COMERCIAL no direct."

## Fatos confirmados pelo cliente (únicas afirmações de produto permitidas)

- O CRM personalizado faz retornos automáticos.
- O agente de voz com IA atende fora do horário, qualifica, registra no CRM e transfere para uma pessoa da equipe.
- A DME oferece diagnóstico, mapeamento, padronização e automação de processos.

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
- Para narração, o usuário envia uma gravação humana ou um arquivo do ElevenLabs. Ele não forneceu chave de API, então não peça de novo. Separe as falas por silêncio, encaixe cada uma no início da sua cena, normalize para -14 LUFS (pico -1,5 dBTP) e gere `<nome>-narrado.mp4`.
- Sempre entregue `marcas-som.txt` com os tempos de frases e efeitos.

## Mapa do repositório

- `roteiros/prompt-mestre-reels-dme.md`: prompt mestre, com diagnóstico do que melhorar e o roteiro "Férias" v2.
- `roteiros/reels-estilo-comercial-v2.md`: roteiros prontos 1 (CRM, "Quem lembra?") e 2 (agente de voz, "Ninguém atendeu"), ainda não produzidos.
- `roteiros/reels-ia-versao-da-verdade.md`: primeiro roteiro, descartado por ser fraco. Fica como referência do que evitar.
- `video/reels-ferias-v2/`: vídeo mais recente e aprovado, que é o **modelo de referência**.
- `video/reels-ferias/`: v1 do mesmo vídeo, com a pasta `audio/` do teste de voz sintética.
- `video/reels-versao-da-verdade/`: primeiro vídeo (descartado).
- `video/brand/dme-logo.svg`: logo vetorial.
