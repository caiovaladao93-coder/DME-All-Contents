# Vídeos do Pexels: origem e tratamento

Licença: Pexels (uso comercial livre, sem atribuição obrigatória). As pessoas ilustram situações e **não** são apresentadas como equipe ou clientes da DME.

| Arquivo | Pexels ID | Autor | Trecho usado | Tratamento extra |
|---|---|---|---|---|
| s01.mp4 | 30284959 | — | 0–7 s | Nome "YEREVAN" no monitor desfocado por rastreamento (`track.py` + `blur.py`) |
| s02a.mp4 | 7477059 | Kampus Production | 2–6,2 s | — |
| s04.mp4 | 8189159 | Kampus Production | inteiro, desacelerado para 1,045× (10,7 s) | — |
| s06a.mp4 | 7706633 | MART PRODUCTION | 6–10,2 s | Original 2160×4096, com corte central |
| s06b.mp4 | 5716235 | Artem Podrez | 1–5 s | Tela com cotações reais e adesivo desfocados e escurecidos (`blur_static.py`) |
| s06c.mp4 | 8348725 | Kampus Production | 4–10,5 s | — |
| s07.mp4 | 8347697 | Kampus Production | 1–12,6 s | — |
| s08.mp4 | 8632192 | Kampus Production | 0–5,8 s | Correção de cor mais clara (cena da filosofia) |

## Baixar de novo (fontes brutas, fora do git)
```bash
curl -L -o public/assets/video/<nome>-raw.mp4 "https://www.pexels.com/download/video/<ID>/"
```

## Correção de cor padrão (azul-aço, realces contidos)
```bash
G='eq=brightness=-0.09:contrast=1.12:saturation=0.62:gamma=0.88,curves=all=0/0 0.5/0.40 1/0.84,colorbalance=rs=-0.05:gs=-0.02:bs=0.08:rm=-0.04:bm=0.06:rh=-0.03:bh=0.04'
ffmpeg -ss <início> -i <nome>-raw.mp4 -t <duração> -vf "fps=30,scale=1080:-2,crop=1080:1920,$G,format=yuv420p" -c:v libx264 -crf 19 -an <nome>.mp4
```
A cena 08 usa uma versão mais clara: `brightness=-0.04`, `curves 1/0.9`.
