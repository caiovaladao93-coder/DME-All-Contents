# Relatório de produção · ADV STATION institucional (v3, com locução)

## 1. Planejamento (manual §01.12)

| Item | Valor |
|---|---|
| Família | Editorial, horizontal |
| Formato | 16:9 · 1920×1080 · 30 fps · H.264 High · yuv420p |
| Duração | **114,9 s (3.445 frames)**, definida pela locução real. Cada cena dura o tempo da sua fala mais um respiro, e a voz não foi acelerada (prompt §5). Para chegar perto de 90 s, é preciso encurtar o texto |
| Estrutura | Vinheta de abertura + 9 cenas do storyboard, com a vinheta de encerramento na cena 09 |
| Voz | ElevenLabs **Guilherme** (`CS07DI8x8kLXeSktyWLG`), `eleven_multilingual_v2`, com os mesmos parâmetros do comercial de referência (`comercial.json`): stability 0.6, similarity_boost 0.8, style 0.12, use_speaker_boost true, speed 0.94, `convert_with_timestamps`. Escolha do cliente |
| Visual | **Sem pessoas e sem banco de imagens** (decisão do cliente). Todo o visual é motion design gerado em código, mais as telas reais |

## 2. Arquivos reais utilizados

| Arquivo | Origem | Uso |
|---|---|---|
| `maternidade-legal/dashboard.png` | Captura enviada (Escritório Demonstração) | Cenas 06 e 08 |
| `maternidade-legal/clientes.png` | Captura enviada | Cena 04: zoom em Setor e Etapa |
| `maternidade-legal/protocolo.png` | Captura enviada | Cena 04: zoom nas etapas do Setor de Protocolo |
| `previdenciario-geral/dashboard.png` | Captura enviada | Cena 05: Resultados dos benefícios e Prazos processuais. Cenas 06 e 08 |
| `previdenciario-geral/administrativo.png` | Captura enviada | Cena 05: Benefício e Etapa. Cena 07: tela em perspectiva |
| Marca (caminho do "A", plataforma) e ícones dos selos | Manual, `tools/tutoriais/vinheta.mjs` | Vinhetas, cena 03 e capa |

As capturas foram usadas sem recolorir nem alterar. A câmera só aproxima e enquadra, e o retângulo dourado marca a área citada na narração. Os dados são os do ambiente de demonstração enviado: nomes e CPFs fictícios.

## 3. O que cada tela comprova no filme

- **Maternidade Legal:**
  - a tela de Clientes mostra o setor e a etapa de cada cliente;
  - o Setor de Protocolo mostra as etapas reais (Recebido do relacionamento, Preparando protocolo, Protocolado, Em análise, Exigência INSS, Benefício negado, Preparando RO, Em Recurso Ordinário, Concedido, Implantação, Recebendo benefício). A lista lateral da cena 04 usa 6 desses nomes, sem inventar nenhum.
- **Previdenciário Geral:**
  - o Dashboard Executivo mostra os resultados Administrativo e Judicial e o painel de Prazos Processuais (Vencem hoje, Em andamento, Vencidos);
  - o Administrativo mostra benefício e etapa por cliente.
- **O que o filme não afirma:** cálculo automático de prazos, integração com Meu INSS ou tribunais, protocolo automático ou qualquer resultado.

## 4. Pendências

1. ~~**Locução (Guilherme)**~~ **Concluída.** São 9 falas geradas pela API (`scripts/gerar_voz.mjs`, com cache por hash de texto, voz, modelo e ajustes), salvas com o alinhamento em `public/assets/audio/falas/`. As legendas e as entradas de texto seguem as palavras reais. A mixagem final ficou em **−14,0 LUFS, pico real −2,3 dBTP** (`out/validacao.txt`).
2. **Telas que faltam (opcionais):** Previdenciário Geral · Judicial e · Prazos Processuais. O filme já cobre esses temas com o Dashboard; com as telas, a navegação da cena 05 fica mais completa.
3. **Trilha da série** e mixagem (ducking de até −9 dB, cerca de −14 LUFS, pico real ≤ −1,5 dBTP).
4. **Fontes comerciais:** Iowan Old Style e Avenir Next. Hoje usam as substitutas Gelasio e Nunito Sans (OFL).

## 5. Decisões

- **Vinheta original no início e no fim** (pedido do cliente). A de abertura vem sem título. A de encerramento traz os selos dos dois produtos, o título, o subtítulo e o CTA "advstation.io".
- **Abertura com contexto:**
  - um tronco dourado se divide nos cinco benefícios (salário-maternidade, aposentadorias, benefícios por incapacidade, pensão por morte e auxílio-acidente);
  - "etapas, documentos, pessoas, decisões" surgem na palavra falada;
  - a cena 02 mostra planilhas, mensagens e controles paralelos como ilustrações genéricas.
- **Cenas 07 e 08 sem pessoas:**
  - na 07, a tela real em perspectiva, com um destaque que percorre os casos;
  - na 08, as telas recuam para as laterais e a frase "a experiência jurídica continua no centro" fica no centro.
- **Mapa das duas estações:** é metáfora visual, não representa integração técnica.
- **Legendas:** os tempos são estimados até chegar a locução.

## 6. Validação

As medições estão em `out/validacao.txt`, e há um quadro de referência por cena em `out/referencias/`.
