# DME Technology · "O trabalho também viaja?" (Reels, 39,5 s)

Reels vertical 1080×1920 a 30 fps (1.185 quadros), H.264 + AAC, feito em Remotion, React e TypeScript.

O filme é **um único mundo contínuo**, seguindo o Bang Motion:
- o celular é o protagonista e aparece do começo ao fim;
- as três solicitações ("Pode aprovar?", "Onde está o arquivo?", "Como seguimos?") **viram etapas** da operação;
- a câmera recua e revela que tudo converge para o celular;
- as conexões se redistribuem entre as etapas e os responsáveis, e só a **revisão humana** continua ligada ao celular.

## Caso de exemplo (dados fictícios, com selo "Exemplo ilustrativo")

Para o cliente entender a operação, um caso concreto atravessa o filme: o **Pedido 1042 do Cliente Alfa**.

- **Pedidos que chegam ao dono:**
  - "Carla · Financeiro: Pode aprovar o pagamento?";
  - "Rafael · Comercial: Onde está o contrato do Alfa?";
  - "Marina · Operações: Como seguimos com o 1042?".
- **Áreas paradas (revelação):**
  - Financeiro: 3 aprovações paradas;
  - Comercial: contrato sem pasta;
  - Compras: cotação sem resposta;
  - Operações: pedido 1042 parado;
  - Atendimento: cliente sem retorno.
- **Processo organizado:** Contratos (pasta do cliente Alfa) → Pedido 1042 → Responsável (Marina · Operações) → Automação (nota emitida, cliente avisado) → Aprovação (sua, acima de R$ 3.000) → Concluído.
- **Cartão da cena 5:** Responsável, o que é automático e o próximo passo ("Sua aprovação · R$ 4.870,00").
- **Cena 6:** o celular mostra **só a aprovação que é do dono**. As demais etapas seguem com a equipe.

## Entregáveis (`out/`)

| Arquivo | Conteúdo |
|---|---|
| `DME-O-Trabalho-Tambem-Viaja-Reels.mp4` | Filme final com legendas, −14 LUFS |
| `DME-O-Trabalho-Tambem-Viaja-narracao.wav` | Narração final em arquivo separado, nas posições da timeline |
| `DME-O-Trabalho-Tambem-Viaja-Reels.srt` | Legendas sincronizadas: 1 a 2 linhas por bloco, quebradas por unidade de sentido |
| `capa.png` | Capa |
| `marcas-som.txt` | Tempos de falas, trilha e efeitos |
| `conferencia.txt` | Medições (ffprobe, loudness, quadros pretos) |

## Estrutura

- **Tempos:** `src/data/timeline.json` é gerado por `scripts/linha_tempo.py` a partir das falas reais. Traz as cenas, as palavras e os blocos de legenda.
- **Filme:** `src/Film.tsx` contém o mundo, a câmera com chaves de tempo, as conexões, os estados, a atividade e a assinatura.
- **Componentes (`src/components/`):**
  - `Phone`: celular de metal escovado e vidro fumê;
  - `Nodes` (`OpNode`): uma solicitação que vira etapa;
  - `Horizon` e `Table`: horizonte de descanso e mesa, gerados, sem fotos;
  - `Type`: título, legendas e logo oficial.
- **Fontes:** Space Grotesk (títulos; OFL, pacote Fontsource) e Manrope (texto e legendas; OFL), em `public/assets/fonts`.
- **Logo:** `video/brand/dme-logo.svg`, sem redesenho, com revelação por máscara.

## Refazer

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --speed=1.0
python3 scripts/escolher_take.py n1,n2,n3,n4,n5,n6,n7 --aplicar   # depois copie voz/*.mp3 e *.json para public/assets/audio/falas e src/data/voz
python3 scripts/linha_tempo.py && python3 scripts/trilha.py
npx remotion render src/index.ts DMETrabalhoViaja out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
bash scripts/finalizar.sh
```

Para a versão sem legendas queimadas, use a composição `DMETrabalhoViajaSemLegenda`.

## Verificado × pendente

**Verificado:**
- duração de 39,5 s (até 40 s);
- 1080×1920, 30 fps, H.264 yuv420p, AAC 48 kHz;
- −14,4 LUFS, com pico real de −1,9 dBTP;
- nenhum quadro preto;
- folha de contato com 23 pontos, incluindo as transições;
- legendas e títulos dentro das margens de 100/220/350 px;
- logo oficial e fontes Space Grotesk e Manrope carregadas.

**Pendente:**
- **Áudio não ouvido:** voz e trilha foram conferidas por medição (música cerca de 13 dB abaixo da voz e ducking de −7 dB sob a fala).
- **Interface do Reels:** a sobreposição com os controles do Instagram foi checada pelas margens, não no aplicativo.
- **Voz:** usei o Guilherme, voz padrão da DME, na velocidade natural, sem compressão de tempo. Ajustes de interpretação por frase (mais firmeza na DME, acolhimento no final) dependeram da escolha entre 3 tomadas, não de direção fina.
