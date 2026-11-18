# DME · "Mesmo dia" (9:16, 59,7 s)

Reels em Remotion: duas empresas iguais vivem o mesmo dia, com o mesmo relógio. A **Empresa A · sem processo** acumula pendências (digitação em dois sistemas, retorno que depende de alguém lembrar, caixa postal às 19h07). A **Empresa B · com processo** resolve os mesmos acontecimentos com integração de sistemas, CRM com retorno automático e agente de voz com IA. Em seguida vêm "Mesmo esforço. A diferença é o processo.", o método Entender → Planejar → Desenvolver, a pergunta "De que lado está a sua empresa?" (loop) e a assinatura. Roteiro em `roteiros/reels-mesmo-dia.md`.

- **Formato:** 1080 × 1920, 30 fps, H.264/AAC, −14 LUFS. Saída: `out/DME-Mesmo-Dia.mp4`, narração separada, SRT, `capa.png` (quadro 0, com o gancho legível) e `marcas-som.txt`.
- **Voz:** DME Narrador (stability 0.5, style 0.2, 1,1×), tomadas conferidas por transcrição.
- **Trilha (`scripts/trilha.py`):** original, a 120 BPM, com tique-taque de relógio em Ré menor durante o dia. O relógio rola a cada horário; a empresa A trava com um baque e a B resolve com um sino. O telefone toca às 19h07, há 0,4 s de silêncio e a harmonia abre para Fá maior em "A diferença é o processo".
- **Dados:** horários, pedido e contadores são fictícios ("Exemplo ilustrativo").

Pipeline: `gerar_voz.mjs` → `escolher_take.py` → `pausas.py` → `linha_tempo.py` → `trilha.py` → `npm run render` → `scripts/finalizar.sh`.
