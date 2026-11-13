# DME · "A planta da operação" (16:9, 68,4 s)

Filme horizontal em **linguagem de desenho técnico**, feito em Remotion. O roteiro detalhado está em `roteiros/dme-planta-da-operacao-16x9.md`.

- **Decisões do cliente:** voz do Lendário, a frase "É falta de projeto." (revisão 2) e o CTA "Comente como está a sua planta.".
- **Formato:** 1920 × 1080, 30 fps, H.264 com AAC 48 kHz e −14 LUFS.

## O que há na tela

**Prancha técnica (o filme todo)**

- grade milimetrada (24 e 120 px) e moldura com cantos em L;
- régua superior que anda com a órbita da câmera e escala gráfica "ESC. 1:1 · OPERAÇÃO";
- indicador de etapa (01 LEVANTAMENTO · 02 DIAGNÓSTICO · 03 PROJETO · 04 EXECUÇÃO);
- carimbo DME · DOC 001: mostra "LEVANTAMENTO CONCLUÍDO" depois do raio-X, risca **REV. A** e passa a **REV. B** em "É aqui que a DME entra", e ganha **APROVADO** no loop.

**Maquete isométrica**

- **Construção:** projeção axonométrica própria (`proj`, órbita θ e elevação φ) e 4 pavimentos (Atendimento, Comercial, Financeiro e Operação). As faces de aço são escolhidas pela normal, há pilares, escada e fachada com janelas.
- **Desenho:** as linhas se desenham a partir do quadro 0.
- **Raio-X:** o plano azul varre o edifício de baixo para cima; as lajes ficam translúcidas, a fachada some e os fluxos tracejados aparecem conforme o plano sobe.

**Laudo**

As figuras FIG. 01 a 04 têm âncora 3D, linha de chamada e rótulo técnico:
- FIG. 01: três telas iguais;
- FIG. 02: barreira e relógio;
- FIG. 03: laço que volta ao térreo;
- FIG. 04: dois sistemas com a ligação partida.

**Planta baixa (03 PROJETO)**

1. As salas se desenham, depois vêm as cotas ("entender") e as figuras numeradas ("identificar").
2. O caos se apaga ("redesenhar") e o fluxograma se desenha ("mapeamento").
3. As caixas se alinham com "= 140 =" ("padronização").
4. Um conector azul contínuo é percorrido por pulsos ("automação").
5. Entram os selos IA e INTEGRAÇÃO, e cada figura recebe um ✓ (cena "tecnologia").

**Execução e loop**

- A mesma maquete volta com o fluxo azul ortogonal e pulsos, e a câmera orbita de −30° a +12°.
- A lista de especificação CLARA · CONECTADA · PREPARADA PARA EVOLUIR entra na fala.
- O filme fecha em loop com "Toda empresa tem uma planta. / Agora, você conhece a sua.".

**Assinatura**

A maquete se recolhe, o logo se monta (4 peças), entra "Tecnologia aplicada aos negócios." e o CTA.

## Áudio

**Voz:** Lendário (stability 0.5, style 0.25), com as frases vizinhas como contexto, `<break>` nas pausas e respirações removidas.

- **Tomadas:** n1-2, n2-2, n3-2, n4-2, n5-2, n6-2, n7-3, n8-2, n9-2, n10-2 e n11-3.
- **Descarte:** a n6-3 dizia "DME é entra".
- **Conferência:** a transcrição da mistura confere com o roteiro.

**Trilha (`scripts/trilha.py`):** score original de documentário técnico.

- **Abertura:** ticks de lapiseira enquanto a planta se desenha, pulso grave a 72 BPM e cordas em Ré menor.
- **Raio-X e laudo:** varredura e clique de scanner; tick grave por figura e tique-taque do relógio da FIG. 02.
- **Virada:** 0,45 s de silêncio, kick abafado e acorde aberto em Fá.
- **Projeto e execução:** tema a 96 BPM com arpejo, cliques de encaixe na padronização e sinos nos checks; quatro tempos no chão na execução.
- **Assinatura:** acorde final e sinos.

## Como gerar

```bash
python3 scripts/pausas.py && python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npx remotion render src/index.ts DMEPlanta out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts DMECapa out/capa.png
```

## Pendências

- **Áudio:** conferido por medição e transcrição, não por escuta humana.
- **Versão curta de 30 s:** prevista no roteiro (item 9), ainda não feita.

## Revisão 3

- **Voz:** passa a ser a **DME Narrador**, voz própria criada por Voice Design (ver `video/brand/voz-dme/`).
  - Todas as falas foram regravadas, com 3 tomadas cada, escolhidas por timbre e conferidas por transcrição.
  - As tomadas antigas do Lendário estão em `voz/takes-lendario/`.
- **Assinatura:** "DME Technology. Automatizamos processos. Devolvemos tempo.", na fala e na tela, no lugar de "Tecnologia aplicada aos negócios" e do CTA de comentário.
- **Trilha vibrante a 120 BPM:**
  - batida desde o gancho e kick quando a maquete ganha volume;
  - impacto no fim do raio-X e groove escuro com clap no laudo, com um acerto por figura;
  - breakdown e riser na tensão, 0,45 s de silêncio e **drop** em "É aqui que a DME entra";
  - groove completo com arpejo no método;
  - seção aberta com supersaw na execução e acorde final.
