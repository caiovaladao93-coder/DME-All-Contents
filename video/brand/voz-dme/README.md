# Voz própria da DME (ElevenLabs Voice Design)

Opções de voz criadas a partir de uma descrição, sem clonar ninguém, com `criar_voz.mjs` (endpoint `text-to-voice/create-previews`; a chave vem do proxy do ambiente). O texto de teste é o mesmo para todas: "Toda empresa tem uma planta… DME Technology. Automatizamos processos. Devolvemos tempo."

| Amostra | Perfil | Tom médio (f0) | ID da prévia |
|---|---|---|---|
| `amostras/grave-1.mp3` | Grave e ressonante, autoritária, comercial premium | ~91 Hz | `VYX778CSwCDtj22nTGmz` |
| `amostras/grave-2.mp3` | idem | ~86 Hz | `ekrwzTE1oivT4LHaw0yE` |
| `amostras/grave-3.mp3` | idem | ~86 Hz | `rvQN0FfieG7shqFeMyqw` |
| `amostras/firme-1.mp3` | Firme e assertiva, com energia, narrador de tech para redes | ~120 Hz | `cdfFKPQy4PLkwuHOYFkg` |
| `amostras/firme-2.mp3` | idem | ~138 Hz | `Th8yuVVGyHRoQ2aJ08kd` |
| `amostras/firme-3.mp3` | idem | ~125 Hz | `WMqqRJ1IKs7jaia0d3F8` |

**Escolha:** a voz escolhida é salva na biblioteca da conta (`text-to-voice/create-voice-from-preview`) com o nome "DME Narrador" e passa a ser a voz padrão das peças da DME.

**Pronúncia de "DME":** algumas prévias leram "DMI", por causa do texto em inglês. Na produção, o texto enviado grafa "Dê-Eme-É", e cada tomada é conferida por transcrição.
