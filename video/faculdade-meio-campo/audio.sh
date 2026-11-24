#!/bin/bash
# Ambiente sonoro 100% sintetizado no ffmpeg (sem música nem efeitos de terceiros): murmúrio de sala/TV (ruído rosa filtrado)
# + torcida da TV (ruído em banda média) que cresce no ataque (9,3–11,6 s), "uuuh" quando a bola sai (11,6–12,6 s) e baixa;
# tela final (23–30 s) só com um fundo suave que some. Gera out/ambiente.wav e o vídeo final com o áudio.
set -e
cd "$(dirname "$0")"
ffmpeg -y -v error \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.6:duration=30:seed=11" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=30:seed=23" \
  -filter_complex "\
[0:a]highpass=f=120,lowpass=f=1400,volume=eval=frame:volume='0.10*if(lt(t,4),1,if(lt(t,9),0.55,if(lt(t,23),1,max(0,1-(t-23)/2.5))))'[sala];\
[1:a]bandpass=f=900:width_type=h:width=1400,tremolo=f=3.2:d=0.35,volume=eval=frame:volume='0.06*if(lt(t,4),1,if(lt(t,9),0.4,if(lt(t,9.3),1,if(lt(t,11.6),1+2.2*(t-9.3)/2.3,if(lt(t,12.6),3.2-1.2*(t-11.6),if(lt(t,16),1.6,if(lt(t,23),0.7,max(0,0.7-(t-23)/1.5))))))))'[torcida];\
[sala][torcida]amix=inputs=2:normalize=0,afade=t=in:d=0.4,afade=t=out:st=28.8:d=1.2,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[a]" -t 30 out/ambiente.wav
ffmpeg -y -v error -i out/meio-campo_a-resenha-mudo.mp4 -i out/ambiente.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-20:TP=-2:LRA=11,aresample=48000" -c:a aac -b:a 160k -t 30 -movflags +faststart out/meio-campo_a-resenha.mp4
