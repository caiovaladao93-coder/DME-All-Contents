# ADV STATION · Apresentação vertical para Instagram (59,7 s, 9:16)

Reels editorial em Remotion: a vinheta padrão abre o vídeo, seguem os dois sistemas e as etapas reais de cada um, e o cartão final traz a assinatura animada da marca.

## Roteiro (voz do Guilherme, ElevenLabs)

| Tempo | Cena | Fala |
|---|---|---|
| 0–4,0 | Vinheta padrão + jingle | Sem fala. Título "Conheça a ADV Station" e os selos dos dois sistemas |
| 4,0–8,6 | Cada cliente, uma etapa | "Na advocacia previdenciária, cada cliente está em uma etapa diferente." |
| 8,6–15,6 | Dois sistemas | "A ADV Station organiza esse caminho em dois sistemas: Maternidade Legal e Previdenciário Geral." |
| 15,6–22,7 | Jornada na Maternidade | "…a cliente chega pelo comercial, passa pelo relacionamento e segue para o protocolo." |
| 22,7–31,1 | Etapas do protocolo | "…protocolado, em análise, exigência, concedido, implantação e recebendo benefício." |
| 31,1–36,6 | Painel da Maternidade | "…distribuição por setor, os partos próximos e quem está sem contato." |
| 36,6–43,8 | Administrativo (Previdenciário) | "…da coleta de documentos ao benefício concedido." |
| 43,8–50,2 | Judicial e prazos | "…publicações, perícias, audiências e prazos processuais ficam no mesmo lugar." |
| 50,2–56,0 | Financeiro | "…previsão de faturamento, os valores a receber e o fluxo de caixa." |
| 56,0–59,7 | Cartão final | "ADV Station. Cada cliente no trilho certo." + advstation.io |

## Arquivos (`out/`)

| Arquivo | O que é |
|---|---|
| `ADV-Station-Apresentacao-Vertical.mp4` | Vídeo final |
| `.srt` e `.vtt` | Legendas |
| `capa-instagram.png` e `capa-instagram-3x4.png` | Capa e o recorte da grade |
| `storyboard/` | Um quadro de revisão por cena |
| `marcas-som.txt` | Marcas de som |
| `validacao.txt` | Requisitos atendidos e limitações |

## Editar e exportar

- **Tempos:** `src/data/timeline.json` é a fonte única.
- **Cenas:** `src/scenes/Scenes.tsx`.
- **Componentes verticais:** `src/components/Vertical.tsx` (`ScreenCrop`, `Headline`, `GoldLabel`, `Atmos`, `Flash`).
- **Vinheta e marca:** `src/components/Brand.tsx`.

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs --takes=3 --speed=1.0
python3 scripts/escolher_take.py v1,v2,v3,v4,v5,v6,v7,v8,v9 --aplicar   # depois aplique atempo 1,05 (ver histórico do commit)
python3 scripts/trilha.py
npx remotion render src/index.ts ADVReels out/render-bruto.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
bash scripts/finalizar.sh
```

Para a versão com legendas queimadas, use a composição `ADVReelsLegendado`.
