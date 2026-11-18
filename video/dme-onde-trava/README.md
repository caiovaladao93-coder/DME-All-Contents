# DME · "Onde a operação trava" (9:16, 60,0 s)

Reels institucional em **tom de relatório de consultoria**, feito em Remotion. O roteiro está em `roteiros/reels-onde-a-operacao-trava.md`.

- **Formato:** 1080 × 1920, 30 fps, H.264 com AAC 48 kHz e −14 LUFS. Saída: `out/DME-Onde-a-Operacao-Trava.mp4`, narração separada, SRT, `capa.png` e `marcas-som.txt`.
- **Fio condutor:** um marcador de mira que procura o gargalo. Na planta geral (gancho), os itens já estão parados na fila desde o quadro 0, num ponto entre Comercial e Financeiro que o marcador só encontra em "Quase sempre é processo".
- **4 cenários típicos** (selo "CENÁRIO ILUSTRATIVO"; não são clientes): clínica (agente de voz com IA), serviços B2B (CRM com retornos automáticos), distribuidora (integração de sistemas) e construtora (mapeamento e padronização). Em cada um: maquete isométrica de aço, fila de itens no gargalo, ficha GARGALO/SOLUÇÃO no rodapé e fluxo azul depois da solução.
- **Fecho:** os 4 casos lado a lado, método Entender → Planejar → Desenvolver (placas de aço), pergunta "Onde a sua operação trava?" com a planta geral de volta (loop) e assinatura com o slogan e "Envie COMERCIAL no direct.".
- **Voz:** DME Narrador (stability 0.5, style 0.2, velocidade 1,1×), tomadas conferidas por transcrição (`TOMADA` em `scripts/pausas.py`).
- **Trilha:** `scripts/trilha.py`, original: pulso a 120 BPM, piano em Ré menor que abre para Fá maior nas soluções, bipe de mira nas travas, 0,4 s de silêncio antes do método e acorde final.

Pipeline: `gerar_voz.mjs` → `escolher_take.py` → `pausas.py` → `linha_tempo.py` → `trilha.py` → `npm run render` → `scripts/finalizar.sh`.
