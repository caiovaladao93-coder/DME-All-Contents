# O BILHETE · vozes

Prévias criadas por Voice Design (`criar_voz.mjs`, com o texto em `TEXTO`) e salvas na conta com `salvar_voz.mjs`. Todas passaram na transcrição.

| Personagem | Voz salva | voice_id | Prévias (escolhida em negrito) |
|---|---|---|---|
| Narrador | 72 Horas Narrador (da série anterior, prévia "cronista 2") | `h8kJ5JnfR302VfkueTp8` | — |
| Mãe | O Bilhete · Mãe | `lcIsKVFyooAHH6xTWABY` | mae-1, **mae-2**, mae-3 |
| Dona Cida | O Bilhete · Dona Cida | `7ORdkg0jjh0wi6l8ydgB` | cida-1, **cida-2** (a mais grave), cida-3 |
| Léo | O Bilhete · Léo | `LANpfqYQjf1tyDW0JVUC` | **leo-1**, leo-2, leo-3 |

Para trocar uma voz, salve outra prévia (`node salvar_voz.mjs <generated_voice_id> "<nome>" "<descrição>" voz-<personagem>.json`; os IDs estão em `amostras/<rotulo>.json`) e atualize `VOZES` em `scripts/gerar_voz.mjs`. As prévias expiram na ElevenLabs depois de alguns dias.
