#!/bin/bash
# Junta vídeo + mix (loudnorm -14 LUFS, pico -1,5 dBTP), gera capa, versão sem áudio e conferência.
set -e
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/mix.wav -af "alimiter=limit=0.8:attack=3:release=60:level=disabled" out/mix-lim.wav
M=$(ffmpeg -hide_banner -i out/mix-lim.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i out/video-mudo.mp4 -i out/mix-lim.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/dme-reels-ferias-v4-narrado.mp4
ffmpeg -y -v error -i out/video-mudo.mp4 -c copy -movflags +faststart out/dme-reels-ferias-v4.mp4
ffmpeg -y -v error -i out/dme-reels-ferias-v4.mp4 -frames:v 1 out/capa.png
{
  echo "CONFERÊNCIA · $(date '+%d/%m/%Y %H:%M')"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate -show_entries format=duration -of compact out/dme-reels-ferias-v4-narrado.mp4
  ffmpeg -hide_banner -nostats -i out/dme-reels-ferias-v4-narrado.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|LRA:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i out/dme-reels-ferias-v4.mp4 -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
} > out/conferencia.txt
cat out/conferencia.txt
