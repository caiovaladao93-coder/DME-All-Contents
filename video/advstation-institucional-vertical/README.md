# ADV Station · institucional vertical (68 s)

Conceito: **"Cada caso tem seu caminho. A gestão precisa acompanhar."** Formato 9:16, 1080 × 1920, 30 fps, 2.040 quadros, H.264 yuv420p, AAC 48 kHz, faststart.

## Estado

O áudio, a montagem e o motion design estão prontos. **As 14 tomadas fotográficas ainda não foram geradas**, porque este ambiente não tem uma ferramenta de geração de imagens por IA.

- **Credenciais encontradas:** existem credenciais de nuvem pré-configuradas (Google Cloud e AWS). Elas não foram usadas, porque gerar imagens nelas teria custo numa conta, e isso depende de autorização.
- **Animatic:** o vídeo exportado agora é `out/ADV-Station-Institucional-Vertical-ANIMATIC.mp4`. Ele traz a locução, a trilha, as legendas, os títulos, a marca e os tempos finais, com **marcadores de tomada** no lugar das imagens. **Não é o master e não deve ser publicado.**

Para virar o master, basta colocar as imagens em `assets/tomadas/T01.jpg … T14.jpg`. O `video.html` passa a usá-las automaticamente, e o `finalizar.sh` exporta `ADV-Station-Institucional-Vertical.mp4` e a capa.

| Item | Situação |
|---|---|
| Locução: Guilherme, voz aprovada das peças ADV | Pronta: `out/narracao.wav`, 9 falas, velocidade natural |
| Trilha original (92 BPM) e mix | Prontas: `out/trilha.wav` e `out/mix.wav` (68,0 s, -15,3 LUFS, true peak de -1,5 dBTP) |
| Legendas SRT | Prontas: `out/ADV-Station-Institucional-Vertical.srt` |
| Timeline central (GSAP, seek determinístico), títulos, legendas e assinatura | Prontos: `video.html` |
| Bíblia visual, personagens e lista das 14 tomadas com prompts | Pronta: `BIBLIA-VISUAL-E-TOMADAS.md` |
| Imagens das tomadas T01–T14 | **Pendentes** (geração por IA) |
| Capa vertical | **Pendente**: sai de um quadro real quando houver imagens |
| Fonte Fieldwork (apoio e legendas) | **Pendente**: Nunito Sans (OFL) é provisória |

## Locução

A voz é a do Guilherme (`CS07DI8x8kLXeSktyWLG`, stability 0.6, similarity 0.8, style 0.12), com o texto completo do briefing e sem aceleração.

- **Escolha das tomadas:** 3 por fala, escolhidas por medição. Ficaram a1:2, a2:2, a3:2, a4:1, a5:3, a6:1, a7:1, a8:2, a9:1.
- **Pronúncia:** todas as falas e o mix foram transcritos pelo speech-to-text da ElevenLabs. A tomada a3-3 dizia "A DevStation" (o artigo fundia com o nome) e foi descartada. A a3-2 diz "A ADV Station" com clareza.

| Tempo | Fala | Bloco |
|---|---|---|
| 0,60–4,04 | Na advocacia previdenciária, cada caso tem seu caminho. | 01 · 0,0–6,2 |
| 6,40–11,88 | São pessoas, documentos, etapas e responsabilidades… | 02 · 6,2–17,6 |
| 12,40–17,04 | A ADV Station é uma família de softwares de gestão… | 02 |
| 18,00–29,29 | Nossa proposta é ajudar o escritório… Com soluções especializadas. | 03 · 17,6–30,2 |
| 30,60–35,94 | O Maternidade Legal é voltado à gestão de casos de salário-maternidade. | 04 · 30,2–37,3 |
| 37,60–46,28 | O Previdenciário Geral atende a gestão de aposentadorias… | 05 · 37,3–46,8 |
| 47,00–55,78 | Duas soluções para diferentes rotinas… Mais clareza para acompanhar a operação. | 06 · 46,8–56,4 |
| 56,60–61,85 | Porque a experiência jurídica continua no centro. A tecnologia apoia o trabalho. | 07 · 56,4–68,0 |
| 62,60–65,20 | ADV Station. Conheça nossas soluções. | Assinatura: logo e CTA estáveis de cerca de 62,5 s até 68,0 s |

**Trilha:** original, em `scripts/trilha.py`.

- **Abertura:** piano e textura harmônica.
- **Pulsação:** eletrônica suave, entra na rotina e ganha presença na organização.
- **Produtos:** um acento discreto e **idêntico** para cada um.
- **Assinatura:** resolução musical.
- **Ambiente:** ambiência leve de escritório. Sem whoosh.
- **Mixagem:** a música fica cerca de 12 dB abaixo da voz, com ducking suave de 5 dB.

## Marca e tipografia

- **Logo:** `assets/brand/advstation-logo.svg`, o SVG original do manual: o símbolo "A" marinho com a plataforma dourada, na versão clara.
  - **Lettering:** "ADV STATION" é composto em tipo, como nas peças aprovadas.
  - **Fundo:** como só existe a versão de "A" marinho, a assinatura fecha sobre **marfim #F4F6F9**, sem recolorir.
  - **No bloco 2:** a marca aparece num selo marfim, na região de respiro.
- **Títulos:** a cadeia do manual (Iowan Old Style → Palatino → Georgia), renderizada com **Gelasio** (OFL, métrica Georgia), a mesma das peças ADV anteriores.
- **Apoio e legendas:** o briefing pede **Fieldwork** (Adobe Fonts, kit `rqa5wet`).
  - O kit está bloqueado pela rede deste ambiente, e a licença da Adobe Fonts não permite copiar os arquivos.
  - O CSS já chama `'Fieldwork'` primeiro. Por ora, o render usa **Nunito Sans (OFL), apenas como provisória**.
- **CTA:** "Conheça nossas soluções", **sem endereço**. O advstation.io aparecia na peça anterior, mas não foi possível confirmá-lo daqui, porque a rede também bloqueia o site.

## Editar e exportar

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --speed=1.0
python3 scripts/escolher_take.py a1,a2,a3,a4,a5,a6,a7,a8,a9 --aplicar --forcar=a1:2,a2:2,a3:2,a4:1,a5:3,a6:1,a7:1,a8:2,a9:1
python3 scripts/linha_tempo.py && python3 scripts/dados.py   # timeline.json e data.js
python3 scripts/trilha.py                                     # trilha, mix, narração, SRT e marcas
node render.js video.html out/testes 1080 1920 30 68 2,13,35,43,63   # quadros de teste
node render.js video.html out/video-bruto.mp4 1080 1920 30 68        # render por quadros (Playwright)
./scripts/finalizar.sh                                        # MP4 com áudio, capa e conferência
```

- **Prévia HTML:** abra `video.html` no navegador.
- **Tomadas:** a lista `SHOTS` no `video.html` define o tempo e o movimento de cada uma.
- **Títulos:** ficam na mesma timeline GSAP central.

## Origem dos materiais

| Material | Origem |
|---|---|
| Logo (SVG) | Manual da ADV Station, o mesmo arquivo da peça `advstation-reels-apresentacao` |
| Gelasio e Nunito Sans | Fontsource, licença OFL (os arquivos de licença estão em `assets/fonts/`) |
| GSAP 3.12.5 | npm, cópia local em `lib/` |
| Voz | ElevenLabs, voz Guilherme |
| Trilha e efeitos | Gerados por código (`scripts/sons.py` e `scripts/trilha.py`) |
| Referência de conteúdo | Manual de produção ADV (HTML enviado pelo cliente) e o comercial 3D anterior. Nenhuma captura de sistema foi reutilizada |

## Pendências

1. **Imagens T01–T14:** precisam ser geradas por IA a partir da `BIBLIA-VISUAL-E-TOMADAS.md`. Basta uma destas opções:
   - autorizar o uso de um serviço de geração (por exemplo, Google Imagen/Vertex ou AWS Bedrock nas credenciais do ambiente, se forem suas);
   - gerar numa ferramenta sua (Midjourney, Firefly, etc.) e enviar os arquivos.
2. **Fieldwork:** enviar os arquivos licenciados ou autorizar uma substituta definitiva.
3. **advstation.io:** confirmar se o endereço pode aparecer no CTA.
4. **Logo:** se houver o lockup oficial com lettering, ou a versão escura com "A" branco, ele substitui a composição atual.
5. **Escuta e Reels:** o áudio foi conferido por medição e transcrição, não por escuta humana. A sobreposição da interface do Reels não foi testada no aplicativo.
