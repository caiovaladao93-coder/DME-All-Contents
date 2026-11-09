# Relatório de produção · ADV STATION institucional (versão de revisão)

## 1. Planejamento informado (manual §01.12)

| Item | Valor |
|---|---|
| Família | Editorial, horizontal |
| Objetivo | Filme institucional com os dois produtos em protagonismo igual |
| Proporção e formato | 16:9 · 1920×1080 · 30 fps |
| Duração | 90 s (2.700 frames). Será recalculada com a locução real |
| Cenas | 9, conforme o storyboard do prompt |
| Voz | **Decisão pendente** (ver §4) |

## 2. Arquivos reais utilizados

| Arquivo | Origem | Uso |
|---|---|---|
| Marca: caminho do "A" `M50 12 L81 79 H69 L50 34 L31 79 H19 Z` e plataforma `rect 9,79,82,8 rx4` | Manual, código de `tools/tutoriais/vinheta.mjs` | Marca em todas as cenas (`public/assets/brand/advstation-logo.svg`) |
| Ícones dos selos Maternidade Legal e Previdenciário Geral | Manual, mesmo arquivo | Selos da assinatura final |
| Vinheta `.asvv` (tempos, easings, 14 faíscas, letras 1,15 s + i×0,05 s, título 2,85 s) | Prompt da vinheta e manual | Cena 09, reproduzida quadro a quadro em Remotion |
| Cores #16284A, #C29B3C, #FFFFFF, #F4F6F9 e creme #F7F1E3 | Manual e prompt | Tema |
| Vídeo de referência `advstation-apresentacao.mp4` | Enviado pelo cliente | Referência de linguagem (comercial 3D). **Não contém telas do app** |

## 3. Funcionalidades: o que foi verificado

**Não houve verificação no app.** O repositório `crm-adv` não está acessível nesta sessão e não foi enviada nenhuma captura. Por isso:

- Nenhuma interface foi inventada. As janelas mostram um esqueleto neutro, sem nomes de módulo, números ou dados, com o selo **CAPTURA PENDENTE**.
- As únicas afirmações de produto são as do texto oficial de narração do prompt, que foram mantidas sem alteração.
- A linha "PROTOCOLO → ACOMPANHAMENTO → DESFECHO" está identificada na tela como **ILUSTRAÇÃO DO FLUXO**.
- Nada sobre cálculo de prazos, integração com Meu INSS ou tribunais, protocolo automático ou resultado jurídico.
- Os nomes das telas pedidas vêm do catálogo de tutoriais do manual. Isso indica que existem, mas não substitui a captura.

## 4. Pendências (bloqueiam a versão final)

1. **Voz (manual §01.4).** A locução deve ser ElevenLabs `eleven_multilingual_v2`, mas há ambiguidade de voz:
   - **Leo Antonio** (`EbiSUflQjzm4g7S895SC`, stability 0.5, similarity 0.78, style 0.12, speaker boost, speed 1.0) é a obrigatória da família editorial;
   - **Guilherme** (`CS07DI8x8kLXeSktyWLG`) é a voz do comercial enviado como referência.

   Nenhuma das duas está disponível nesta sessão (sem chave da ElevenLabs). O manual proíbe substituir. A saída é gerar com `convert_with_timestamps` e enviar o áudio e o JSON de alinhamento, ou fornecer a chave por mecanismo seguro.
2. **Telas reais (7).** Maternidade Legal: Clientes, Protocolo e Dashboard Executivo. Previdenciário Geral: Dashboard Executivo, Administrativo, Judicial e Prazos Processuais. Formato: captura do app local com dados fictícios, de preferência com 2880 px de largura.
3. **Fotografias (7).** A direção de cada uma está em `src/data/assets.ts`, e a etiqueta na tela repete essa direção.
4. **Trilha da série.** O manual pede trilha procedural própria (Maternidade em Fá maior; Previdenciário em Ré menor com resolução em Fá maior), com ducking de até −9 dB, cerca de −14 LUFS e pico real ≤ −1,5 dBTP.
5. **Fontes comerciais.** Iowan Old Style e Avenir Next não estão no ambiente. As substitutas usadas foram:
   - **Gelasio** (OFL, mesmas métricas da Georgia, que faz parte da cadeia de títulos do manual);
   - **Nunito Sans** (OFL), no lugar de Avenir Next.

   O prompt pedia Inter. Prevaleceu o manual (Avenir).

## 5. Decisões e desvios

- **Vinheta.** Segue a regra editorial do manual: gancho primeiro e assinatura no cartão final. A vinheta creme dos tutoriais virou a assinatura da cena 09, com os selos dos dois produtos, o título "Duas soluções especializadas.", o subtítulo "Uma mesma visão de gestão." e o CTA "Conheça nossas soluções · advstation.io".
- **Tempos das cenas.** Redistribuí os tempos do storyboard para caber a narração completa sem acelerar, e a cena 09 ganhou 3 s:

  | Cena | Original | Agora |
  |---|---|---|
  | 02 | 11 s | 10 s |
  | 04 | 15 s | 14 s |
  | 05 | 15 s | 14 s |
  | 09 | 6 s | 9 s |
- **Legendas.** Os tempos são estimados (0,37 s por palavra mais as pausas). O manual exige sincronizar às palavras reais do áudio, e isso só pode ser feito com a voz gerada.
- **Mapa das duas estações.** É uma metáfora visual das duas soluções, não representa integração técnica entre os produtos.

## 6. Validação desta versão

As medições estão em `validacao.txt`: resolução, fps, duração, codec e perfil, QA de movimento e folha de referências.
