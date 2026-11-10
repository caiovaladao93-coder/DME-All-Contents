# DME · "Suas férias não precisam virar escritório" (Reels, 38,2 s)

Vídeo vertical 1080 × 1920, 30 fps, feito em Remotion (React + TypeScript), com a voz do Lendário (ElevenLabs, animada, escolhida entre 3 amostras), trilha original procedural, legendas queimadas, SRT e narração separada.

## Saídas (`out/`)

| Arquivo | O que é |
|---|---|
| `DME-Ferias-Nao-Precisam-Virar-Escritorio-Reels.mp4` | Vídeo final: -14 LUFS, pico abaixo de -1,5 dBTP |
| `DME-Ferias-Nao-Precisam-Virar-Escritorio-narracao.wav` | Narração separada, nas posições do vídeo |
| `DME-Ferias-Nao-Precisam-Virar-Escritorio-Reels.srt` | Legendas |
| `capa.png` | Capa (quadro em 7,2 s) |
| `marcas-som.txt` | Tempos das falas, da trilha e dos efeitos |
| `conferencia.txt` | ffprobe, loudness e quadros pretos |

## Como gerar

```bash
python3 scripts/linha_tempo.py      # tempos a partir das falas reais, gravados em src/data/timeline.json
python3 scripts/trilha.py           # trilha e efeitos: public/assets/audio/trilha.wav
npx remotion render src/index.ts DMEFeriasEscritorio out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
./scripts/finalizar.sh              # loudness, narração, SRT, capa e conferência
node scripts/stills.mjs out/testes 0,150,300   # quadros de teste
```

**Voz:** `node scripts/gerar_voz.mjs --takes=3 --speed=1.0` gera as tomadas, com o proxy injetando a chave. `python3 scripts/escolher_take.py n1,...,n7 --aplicar --forcar=...` escolhe uma delas. Depois, copie as falas para `src/data/voz/` (json) e `public/assets/audio/falas/` (mp3).

- **Tomadas usadas:** n1:1, n2:2, n3:1, n4:2, n5:1, n6:2, n7:6 (voz Lendário, `4za2kOXGgUd57HRSQ1fn`, stability 0.4, style 0.35). A fala da assinatura foi refeita com "Dê, Eme, É" separados por vírgula. A tomada foi escolhida pela fluidez de "Tecnologia para a empresa seguir. E para você descansar.". A pronúncia de "DME" foi conferida transcrevendo cada tomada com o speech-to-text da ElevenLabs (scribe_v1). As tomadas que saíam "DM é" foram descartadas. Na assinatura, o teste foi feito com a tomada já misturada à trilha (3 transcrições). A frase "DME Technology." foi refeita isoladamente para soar mais suave, com `scripts/gerar_marca.mjs` (4 grafias × 3 tomadas, com o contexto das frases vizinhas). Foi escolhida a `a2`, com a grafia natural "Dê Eme É" e as letras juntas, que saiu "DME" nas 3 transcrições com a trilha. Ela foi emendada na pausa antes de "Tecnologia" com `scripts/emendar_marca.py a2 voz/takes/n7-6`.
- **Velocidade:** 1,0, sem aceleração.
- **Pronúncia:** o texto enviado à voz grafa "Dê Eme É", e as legendas mostram "DME".

## Estrutura do filme

O celular conduz o filme inteiro. As três notificações se desprendem da tela e viram as atividades do fluxo, mantendo o mesmo cartão e o mesmo cabeçalho.

| Cena | Tempo | O que acontece |
|---|---|---|
| Férias | 0–3,8 s | O celular aparece em três quartos, num estúdio escuro com luz azul lateral, e a câmera se aproxima. A primeira notificação ("Equipe · grupo da empresa") acende a tela |
| Áreas | 3,8–11,6 s | Chegam, cada uma na sua fala, as notificações de Mariana · Financeiro, Rafael · Comercial e Camila · Operação. As anteriores recuam numa pilha. Depois, uma ligação breve: "Empresa · ligação" |
| Viaja | 11,6–15,5 s | A câmera recua. As mensagens ficam ligadas por linhas finas a um único ponto, "você". Há uma pausa de movimento e de som |
| Estrutura | 15,5–21,8 s | Cada mensagem vira uma atividade, em sequência: Financeiro (etapa e **validação humana do gestor**), Comercial (responsável e histórico) e Operação (status automático). A espinha azul encaminha o fluxo, um marcador acompanha a atividade e o logo DME aparece discreto no fluxo |
| Benefícios | 21,8–27,3 s | **Encaminhadas:** Mariana → gestor. **Disponíveis:** um arquivo se vincula à proposta. **Definidos:** Camila assume, o próximo passo aparece e uma tarefa automática conclui ("cliente avisado") |
| Tranquilidade | 27,3–31,9 s | O fluxo se dissolve ao fundo. O celular sai junto com o fluxo e sobra só a praia, com areia, ondas e o foco passando para o mar |
| Assinatura | 28,5–38,2 s | Fundo institucional escuro, o logo oficial, "Tecnologia para a empresa seguir. E para você descansar." e o CTA "Comente **COMERCIAL** e receba um diagnóstico" (cerca de 4 s) |

## Recursos visuais

**Celular (`src/components/Phone3D.tsx`):** o aparelho é montado em CSS 3D.

- **Frente:** o aro e a ilha da câmera vêm da foto de estúdio **Pexels 26109750, de Arpit Brandings** (licença Pexels), sem o fundo e sem a tela cinza (`public/assets/photography/celular-aro.png`).
- **Espessura:** 24 lâminas metálicas, iluminadas pela luz azul lateral.
- **Vidro:** um reflexo que se move com a rotação.
- **Tela:** gerada em React (papel de parede, relógio, notificações e ligação), com componentes próprios no estilo das notificações de celular, sem copiar um aplicativo específico.

**Cenário de férias:** gerado (céu, mar ao entardecer e areia com ondas), sem foto.

**Dados:** nomes, empresa ("Cliente Horizonte"), pedido 2381 e arquivo são fictícios e editáveis em `src/Film.tsx` (constante `REQ`). O selo "Exemplo ilustrativo" foi removido a pedido do usuário.

**Promessa:** a validação humana do gestor continua no fluxo. Não aparecem modo avião nem notificações desativadas como solução.

## Pendências reais

- **Áudio:** foi conferido só por medição (loudness, pico e tempos). A mixagem não foi ouvida aqui.
- **Interface do Reels:** a sobreposição dos botões do Instagram não foi testada no aplicativo. O conteúdo respeita as margens de 100 px nas laterais, 220 px no topo e 350 px na base.
- **Mão que afasta o celular:** não foi feita, por não haver filmagem adequada. A cena se resolve com câmera e foco.
- **Paisagem:** a varanda e o mar são ilustrações geradas. Se quiser fotografia, envie um link do Pexels e o cenário é trocado em `src/components/Horizon.tsx`.
