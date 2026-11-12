# DME · "Processos que fluem com tecnologia" (Reels, 48,1 s · revisão 2)

Vídeo vertical 1080 × 1920, 30 fps, em Remotion. O roteiro está em `roteiros/reels-processos-que-fluem.md`.

**O que muda em relação às peças anteriores:**

- **Plano-sequência:** a câmera segue um único **pedido** (token de aço) num mundo contínuo, sem cenas separadas.
- **Ritmo:** 120 BPM, com impacto no gancho e loop literal no fim.

## Revisão 2 (pedidos do cliente)

1. **Método:** cada item da lista só aparece quando é falado.
2. **Horários:** ganharam contexto.
   - Fala nova: "Da manhã ao fim do dia, cada pedido segue o seu caminho."
   - Na tela: o rótulo "Ao longo do dia" e a frase de apoio.
3. **Estratégia, Clientes e Equipe:** em cartões alinhados, com ícone em aço e descrição curta, sobre fundo escurecido.
4. **Loop:** quando a parede abre e o pedido cai, a frase sai pela parte de cima da tela.
5. **"Agora":** pausa de 0,75 s entre "Agora" e "o caminho muda".
6. **Ritmo:** pausas inseridas nas falas (`scripts/pausas.py`) e respiros maiores entre as cenas. Cada frase fica mais tempo na tela. A duração passou de 38,7 s para 48,1 s.

## Revisão 3

- **"O problema não é a equipe.":** fica na tela, e "É o caminho." entra embaixo quando é falado. As duas frases saem juntas, antes do "Agora".
- **Voz distorcida em "É o caminho" e "Agora":** as tomadas antigas (n3-3 e n4-1) destoavam das demais na medição (tom muito mais agudo, timbre mais escuro).
  - Foram regravadas com stability 0.5 e style 0.25.
  - As pausas agora são geradas pela própria voz (`<break>` da ElevenLabs), em vez de inseridas por corte.
  - Tomadas usadas: n3-5 (0,64 s depois de "equipe.") e n4-6 (0,87 s depois de "Agora.").
  - Transcrição conferida.
- **Duração:** 48,9 s.

## Revisão 4

- **Respirações removidas.** O `scripts/pausas.py` agora limpa cada fala (`limpar`):
  - silêncio a partir de 90 ms depois da última letra;
  - silêncio no meio das pausas entre frases, onde entra a inspiração;
  - gate leve abaixo de −48 dB;
  - fade de 40 ms no fim do arquivo.

  As transcrições continuam idênticas.
- **Trilha nova** (`scripts/trilha.py`; a anterior ficou em `scripts/trilha_v1.py`): eletrônica original a 120 BPM.
  - **Gancho:** riser e impacto.
  - **Barreiras e labirinto:** beat contido em Ré menor, com o filtro abrindo.
  - **"Agora":** 0,4 s de silêncio e DROP. Vem um groove completo, com bumbo reto, clap, hi-hats em semicolcheia, baixo com sidechain, supersaw e arpejo com delay, em Fá–Dó–Rém–Si♭.
  - **Fecho:** breakdown sem bumbo.
  - **Loop:** subida com virada de caixa e novo drop em "flui".
  - **Assinatura:** acorde final.

  Fica cerca de 10 dB abaixo da voz, com ducking de 6 dB. A inteligibilidade foi conferida por transcrição da mistura.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `DME-Processos-Que-Fluem-Reels.mp4` | Vídeo final: −14 LUFS, pico abaixo de −1,5 dBTP, H.264 yuv420p, AAC 48 kHz |
| `DME-Processos-Que-Fluem-narracao.wav` | Narração separada, nas posições do vídeo |
| `DME-Processos-Que-Fluem-Reels.srt` | Legendas (o vídeo não tem legenda queimada; o texto na tela segue a fala) |
| `capa.png` | Capa: quadro do impacto, com "Um pedido entra. E para." |
| `quadro0.png` | Primeiro quadro do MP4 (o gancho já legível) |
| `marcas-som.txt` | Tempos das falas, da trilha e dos efeitos |
| `conferencia.txt` | ffprobe, loudness e quadros pretos |

## Estrutura

| Tempo | Trecho | O que acontece |
|---|---|---|
| 0–2,4 | Gancho | "Um pedido entra." aparece legível no quadro 0. O pedido cai em aceleração e bate numa parede de aço na palavra "para", com a câmera trepidando |
| 2,4–6,8 | Barreiras | Cada "Espera…" derruba um cartão (E-mail, Planilha, Lembrete) em volta do pedido, e a câmera recua |
| 6,8–9,4 | Caminho | O labirinto se forma (parede por parede, por distância) e os trechos travados piscam. "É o caminho." |
| 9,4–9,7 | Silêncio | 0,4 s, com tudo parado |
| 9,7–12,0 | Virada | Fundo em aço claro e "Agora". As paredes giram em dominó e viram trilhos paralelos |
| 12,0–18,9 | Método | Lista fixa com o item ativo, na palavra falada:<br>• **Diagnóstico:** scanner e marcação do gargalo.<br>• **Mapeamento:** estações e linha central.<br>• **Padronização:** blocos tortos se alinham e o gargalo abre.<br>• **Automação:** o trilho preenche em azul.<br>Depois, "Sistemas conectados": os cartões das barreiras voltam ligados por cabos às estações (selo "Exemplo ilustrativo") |
| 18,9–22,9 | Fluxo | O pedido acelera, com rastro de linhas de aço, por Pedido, Aprovação e Entrega. Depois a montagem 09:00 · 11:00 · 15:00 · 18:00, com pedidos em todos os trilhos |
| 22,9–27,6 | Fecho | "Então, enquanto o processo flui, você cuida do que faz a empresa crescer." Os chips Estratégia, Clientes e Equipe entram em 3 profundidades |
| 27,6–30,1 | Loop | O mesmo plano do gancho, mas em "E" a parede se abre e o pedido atravessa em "flui" |
| 30,1–38,6 | Assinatura | O pedido chega ao centro e dá lugar ao logo, que se monta (4 peças). "Processos que fluem com tecnologia." e o CTA "Comente **COMERCIAL** e receba um diagnóstico" |

## Áudio

**Voz:** Lendário (`4za2kOXGgUd57HRSQ1fn`, `eleven_multilingual_v2`), com stability 0.4, similarity 0.8, style 0.35 e velocidade 1,0.

- **Tomadas:** 3 por fala, geradas com as frases vizinhas como contexto (`previous_text`/`next_text`).
- **Escolha:** por medição de limpeza e timbre, e pela transcrição (speech-to-text da ElevenLabs).
- **Usadas:** n1:1, n2:1, n3:5, n4:6, n5:2, n6:2, n6b:1, n7:2, n8:3, n9:1.
- **Descarte:** a n6-1 dizia "volta a lhe andar".
- **Pronúncia de "DME":** o texto enviado grafa "Dê-Eme-É", e todas as tomadas saíram "DME" na transcrição.

**Trilha:** original e procedural, a 120 BPM (`scripts/trilha.py`).

- **Do gancho ao "Agora":** whoosh na queda, impacto metálico, pulso grave crescente, 0,4 s de silêncio e um dominó de cliques no "Agora".
- **Do método ao loop:** groove em Ré maior no método e no fluxo, e piano no fecho. No loop, a parede se abre com efeito próprio.
- **Assinatura:** 3 notas, com ducking de 7 dB sob a fala.

## Como gerar

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3
python3 scripts/escolher_take.py n1,...,n9 --aplicar --forcar=n1:1,n2:1,n3:3,n4:1,n5:2,n6:2,n7:2,n8:3,n9:1
python3 scripts/pausas.py          # aplica as pausas às tomadas escolhidas e copia para src/data/voz e public
python3 scripts/linha_tempo.py && python3 scripts/trilha.py
node scripts/stills.mjs out/testes 0,60,300          # quadros de teste
npx remotion render src/index.ts DMEProcessosFluem out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh && npx remotion still src/index.ts DMECapa out/capa.png --props='{"audio":false,"still":1.9}'
```

**Onde editar** (`src/Film.tsx`):

- câmera: `CAM`;
- trajetória do pedido: `tokenY`;
- labirinto: `WALLS`;
- cartões: `CARDS`;
- textos: componentes `Phrase`.

Os tempos vêm das palavras reais (`wt`).

## Pendências reais

- **Áudio:** conferido por medição e transcrição, não por escuta humana.
- **Interface do Reels:** a sobreposição não foi testada no aplicativo. O texto fica entre y 250 e 1580, com margens de 90 px.
- **Duração:** 48,1 s, acima da faixa padrão de 30 a 35 s. O aumento foi pedido na revisão para dar mais respiro; dá para encurtar reduzindo as pausas em `scripts/pausas.py` e os respiros em `scripts/linha_tempo.py`.
