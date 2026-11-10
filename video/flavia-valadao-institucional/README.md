# Flávia Valadão Interiores · institucional vertical (29 s)

Conceito: **"Seu jeito de viver, em cada detalhe."** Formato 9:16, 1080 × 1920, 30 fps, 870 quadros.

## Estado: o áudio está pronto, a imagem aguarda os materiais reais

O filme depende de fotografias **reais e autorizadas** de um projeto da Flávia e do **logo original**. Nenhum dos dois existe neste ambiente:

- O caminho indicado (`C:/Users/caiov/…/portal-flavia/dist/assets/flavia-logo.png`) está no computador de origem.
- Não há repositório nem pasta conectada com esses arquivos.

Pelas regras do briefing, nenhum ambiente de banco de imagens nem imagem gerada foi usado no lugar deles.

| Item | Situação |
|---|---|
| Narração (voz Pri, ElevenLabs) | Pronta: `out/narracao.wav` |
| Trilha original (piano, 80 BPM) | Pronta: `out/trilha.wav` |
| Mix voz + trilha | Pronto: `out/mix.wav`, 29,0 s, -14,5 LUFS, true peak -1,5 dBTP |
| Legendas | Prontas: `out/Flavia-Valadao-Institucional-Vertical.srt` |
| Linha do tempo de 870 quadros | Pronta: `timeline.json` |
| Fontes Cormorant e Manrope (OFL, pesos 400 e 500) | Prontas: `assets/fonts/` |
| Fotos do projeto principal | **Pendente: enviar** |
| Logo original | **Pendente: enviar** |
| Vídeo, prévia HTML e capa | Aguardam fotos e logo |

## Narração

- **Texto:** é o do briefing, sem a frase "Um olhar atento.". Com ela, a voz real somava 27,2 s e não sobrava espaço para as pausas e o respiro do bloco 4. O briefing prevê essa retirada.
- **Velocidade:** natural, sem aceleração.
- **Voz:** Pri (`8EY2gK6oUxZCDZAlvUpZ`), pt-BR, madura e calma. Ajustes: stability 0.55, similarity 0.8, style 0.15. A voz não imita a Flávia.
- **Escolha das tomadas:** 3 por fala, escolhidas por medição de ruído e chiado (`scripts/escolher_take.py`). Ficaram f1:2, f2:1, f3:3, f4:2, f5:2.
- **Conferência:** cada tomada e o mix completo foram transcritos pelo speech-to-text da ElevenLabs, e o texto saiu idêntico. "Flávia Valadão Interiores" é pronunciado com clareza.
- **Vozes alternativas:** `voz/amostras/` tem o texto completo em Pri, Sol Reis e Fernanda.

| Bloco | Tempo | Fala |
|---|---|---|
| 01 Detalhe | 0,0–4,0 | 0,50–3,05 "Um espaço faz parte da sua vida." |
| 02 Intenção | 4,0–10,0 | 3,75–8,90 "Na Flávia Valadão Interiores, cada projeto parte do que importa para você." |
| 03 Escolhas | 10,0–16,6 | 9,40–17,11 "Materiais, luz e composição unem beleza, funcionalidade e personalidade." |
| 04 Conjunto | 16,6–21,6 | 17,90–19,66 "Cuidado em cada detalhe.", seguido do respiro sem informação nova |
| 05 Assinatura | 21,6–29,0 | 20,60–28,68 "Flávia Valadão Interiores. Seu jeito de viver, em cada espaço. Vamos conversar sobre o seu?" |

**Trilha:** original, em `scripts/trilha.py`.

- **Abertura:** nota de piano e textura de ambiente.
- **Bloco 2:** acordes, com um acento delicado na conclusão do desenho (7,2 s).
- **Bloco 3:** pulsação grave discreta e um único acento em 13,6 s.
- **Bloco 4:** abertura no plano amplo.
- **Bloco 5:** resolução em Ré maior no logo.
- **Mixagem:** sem whoosh. A música fica cerca de 12 dB abaixo da voz, com ducking suave de 5 dB (ataque de 0,25 s e liberação de 0,6 s). Todas as marcas estão em `out/marcas-som.txt`.

## Materiais necessários (o que enviar)

**Projeto principal**, um único ambiente que sustente a maior parte do filme. Fotos reais e autorizadas, em JPG ou PNG na resolução original, de preferência com o lado menor de 2.160 px ou mais. Uma foto horizontal funciona se tiver pelo menos 4.000 px de largura, para permitir o recorte vertical.

1. **Detalhe de abertura:** um encontro de materiais ou de luz, como tecido junto à madeira, uma quina de bancada ou uma linha de marcenaria.
2. **Plano geral:** a vista que melhor representa o ambiente, usada na revelação do desenho (bloco 2) e no plano amplo (bloco 4). Se possível, envie uma vista vertical ou uma horizontal com margem para o recorte.
3. **Material ou textura:** madeira, pedra, tecido ou metal em plano próximo.
4. **Iluminação:** um pendente, uma arandela, uma fita ou luz natural sobre uma superfície.
5. **Composição:** a relação entre móveis e a composição do ambiente, em plano médio.
6. **Opcionais:** vídeos reais do projeto, a planta ou o desenho do ambiente (para o contorno do bloco 2) e um retrato autorizado da Flávia.

**Informe também:**

- quais imagens são **renders**, que recebem a identificação "Imagem de projeto";
- se há restrição de uso ou crédito de fotógrafo.

**Logo:** o arquivo original, de preferência em SVG, PDF ou AI. Um PNG com fundo transparente também serve, com pelo menos 1.500 px de largura para a assinatura em 1080 px. Se vier só o PNG do portal e a resolução for baixa, o logo **não será vetorizado nem redesenhado**: a pendência será registrada.

## Como a imagem será construída quando os materiais chegarem

A parte visual segue a skill **Bang Motion**, cujo SKILL.md foi lido.

- **Stack:** HTML, CSS e GSAP numa única timeline com seek, renderizada quadro a quadro com Playwright e codificada com FFmpeg (H.264, CRF 18, yuv420p, faststart, AAC 48 kHz).
- **Progressão:** detalhe → intenção → relação → ambiente → marca, conduzida por uma borda real do projeto escolhido.
- **Contorno do bloco 2:** traçado a partir das linhas reais da foto do plano geral, sem cotas, e revelado por máscara em 1,2 a 1,8 s.
- **Movimentos:** só reenquadramentos que a resolução de cada foto permita. Sem parallax inventado, sem deformação, sem mover móveis.
- **Assinatura:** fundo marfim (#F9F5EE) e o logo original revelado por máscara e opacidade. O texto "Seu jeito de viver" e o CTA "Converse sobre o seu espaço" ficam subordinados ao logo e legíveis nos 2 s finais.
- **Arquivos ainda a produzir:** `Flavia-Valadao-Institucional-Vertical.mp4`, a prévia HTML, a capa a partir de um quadro real e o mapa de uso (arquivo → trecho → enquadramento → função).

## Como gerar o áudio

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --speed=1.0
python3 scripts/escolher_take.py f1,f2,f3,f4,f5 --aplicar --forcar=f1:2,f2:1,f3:3,f4:2,f5:2
python3 scripts/linha_tempo.py   # timeline.json (29,0 s)
python3 scripts/trilha.py        # trilha, narração, mix, SRT e marcas de som
```
