# ADV Station · "Cada caso tem seu caminho" (motion graphics vertical, 68 s)

Filme institucional construído **inteiramente com código**, em HTML, CSS, SVG e GSAP. Não usa fotografias, imagens geradas por IA, banco de imagens nem telas do sistema.

- **Formato:** 9:16, 1080 × 1920, 30 fps, 2.040 quadros.
- **Exportação:** H.264 yuv420p, AAC 48 kHz, faststart.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `ADV-Station-Institucional-Vertical.mp4` | Master: 68,0 s |
| `ADV-Station-Institucional-Vertical.srt` | Legendas (no máximo 2 linhas, quebras por sentido) |
| `capa.png` | Capa vertical: quadro real da visão do conjunto (50,5 s) |
| `narracao.wav`, `trilha.wav`, `mix.wav` | Áudio separado e mixado |
| `marcas-som.txt`, `conferencia.txt` | Tempos de falas e efeitos; ffprobe, loudness e quadros pretos |

**Prévia HTML:** abra `video.html` no navegador.

- **Sem parâmetros:** toca com o áudio.
- **`?debug=1`:** mostra o controle de scrub para revisão.
- **`?frame=1`:** modo limpo de exportação.

## Universo visual

Um único mundo SVG (1740 × 3100) é percorrido por um rig de câmera. A camada de leitura (títulos e legendas) fica fora do rig.

**Objetos.** Todos são da mesma família: superfícies marfim, detalhes marinho e acentos dourados pontuais.

| Objeto | Desenho |
|---|---|
| Dossiês | Capa, aba, lombada marinho e linhas abstratas, sem texto legível |
| Folhas | Marfim, com linhas abstratas |
| Trajetórias | Traço marfim translúcido; o trecho percorrido fica dourado |
| Pontos de etapa | Círculo marinho com anel dourado quando observados |
| Nós de responsabilidade | Figura abstrata, sem personagem |
| Ramificações | Terminam em pequenos dossiês |

**Fundo.** Marinho com luz ampla e textura fina estática (semente fixa), com paralaxe leve no gradiente.

**Fluxo do filme:**

1. **Abertura:** a câmera abre perto do dossiê e uma folha desliza no primeiro segundo. O percurso leva ao segundo dossiê.
2. **O espaço se revela:** pessoas (nós), documentos (folhas) e etapas (marcadores) aparecem com a fala, ainda dispersos. Os marcadores se alinham ao percurso.
3. **Organizar, acompanhar, coordenar:**
   - As folhas encontram o dossiê.
   - O enquadramento segue o dossiê pelas etapas.
   - As responsabilidades se distribuem ao lado das etapas.
   - Em "Com soluções especializadas", o percurso se bifurca.
4. **Maternidade Legal:** um dossiê com faixa marinho percorre três etapas, sem rótulos de procedimento.
5. **Previdenciário Geral:** um dossiê com canto dourado. O caminho se abre em quatro ramificações, que aparecem com os nomes falados dos benefícios.
6. **Visão do conjunto:** o enquadramento se abre e mostra que tudo, incluindo outras demandas com percurso próprio, pertence à mesma composição.
7. **Encerramento:** um dossiê em primeiro plano, o resto se simplifica e a câmera entra na capa marfim. Entram o símbolo oficial e "Conheça nossas soluções".

**Cuidados com afirmações.** As transformações são **metáforas de gestão**:

- não há carimbo de aprovação, marca de vitória nem papel que se organize sozinho para sugerir automação;
- a bifurcação representa a família da marca, **não** integração técnica entre os produtos;
- os dois produtos têm a mesma composição: nome, filete, apoio, dossiê e percurso.

## Áudio

**Locução:** voz Guilherme (voz aprovada das peças ADV, `CS07DI8x8kLXeSktyWLG`), com o texto completo do briefing e velocidade natural.

- **Falas aproveitadas:** as que são idênticas às do filme `advstation-institucional-vertical`.
- **Falas regravadas:** a4 ("…acompanhar os casos…") e a8 ("A experiência jurídica…"), com 3 tomadas e escolha por medição.
- **Conferência:** todas as falas foram transcritas pelo speech-to-text da ElevenLabs, com "ADV Station", "Maternidade Legal" e "Previdenciário Geral" corretos.

**Trilha:** original, em `scripts/trilha.py`, a 92 BPM.

- **Abertura:** textura harmônica, piano e uma textura curta de papel quando a folha desliza.
- **Pulsação:** discreta, cresce aos poucos.
- **Relações:** acento delicado quando as folhas encontram o dossiê e quando as responsabilidades se conectam.
- **Produtos:** a mesma pequena mudança sonora na entrada de cada um.
- **Assinatura:** resolução musical. Sem whoosh.
- **Mixagem:** a música fica cerca de 12 dB abaixo da voz, com ducking suave de 5 dB.

## Editar e exportar

```bash
python3 scripts/linha_tempo.py && python3 scripts/dados.py   # timeline.json → data.js
python3 scripts/trilha.py                                     # trilha, mix, narração, SRT e marcas
node render.js video.html out/testes 1080 1920 30 68 1,20,31,40,50,63   # quadros de teste
node render.js video.html out/video-bruto.mp4 1080 1920 30 68        # render por quadros (Playwright)
./scripts/finalizar.sh                                        # master com áudio, capa e conferência
```

**Onde editar:** o código fica todo no `video.html`, organizado em funções (`dossier`, `sheet`, `marker`, `node`) e numa única timeline GSAP com seções por bloco.

**Determinismo:** o estado exibido é calculado por `apply(t)` sem alterar os valores animados, então o seek funciona em qualquer ordem. Não há `Date.now()` nem `Math.random()` no render.

## Origem dos materiais

| Material | Origem |
|---|---|
| Símbolo ADV Station (SVG) | Arquivo original do manual de produção ADV |
| Gelasio e Nunito Sans | Fontsource, licença OFL (os arquivos de licença estão em `assets/fonts/`) |
| GSAP 3.12.5 | npm, cópia local em `lib/` |
| Textura | Gerada com semente fixa (`assets/textura.png`) |
| Voz | ElevenLabs, voz Guilherme |
| Trilha | Gerada por código |

## Pendências

1. **Fonte Fieldwork (apoio e legendas):**
   - o kit da Adobe Fonts (`rqa5wet`) está bloqueado pela rede deste ambiente, e a licença não permite copiar os arquivos;
   - o CSS chama `Fieldwork` primeiro; até lá, o render usa **Nunito Sans (OFL), como provisória declarada**.
2. **Logo:**
   - o único arquivo oficial disponível é o **símbolo** (o "A" marinho com a plataforma dourada), usado sobre marfim;
   - este briefing proíbe montar o lettering com caracteres, então a assinatura usa **só o símbolo**;
   - para o lockup completo (símbolo + "ADV STATION"), envie o arquivo oficial.
3. **advstation.io:** a rede deste ambiente bloqueia o site, então o endereço não foi confirmado e ficou fora do CTA.
4. **Revisão humana:**
   - o áudio foi conferido por medição e transcrição, não por escuta humana;
   - a sobreposição da interface do Reels não foi testada no aplicativo. A leitura foi conferida numa prévia reduzida a 360 × 640.
