#!/bin/bash
# Junta vídeo mudo + som (-14 LUFS), quadro 0, capa e conferência.
set -e
cd "$(dirname "$0")/.."
OUT=out/Fisica-Satisfatoria.mp4
ffmpeg -y -v error -i out/video-mudo.mp4 -i out/som.wav -map 0:v -map 1:a -c:v copy -af "alimiter=limit=0.6:level=disabled,loudnorm=I=-14:TP=-2:LRA=11,aresample=48000" -c:a aac -b:a 192k -shortest -movflags +faststart $OUT
ffmpeg -y -v error -ss 0.5 -i $OUT -frames:v 1 out/capa.png
{
  echo "CONFERÊNCIA · $(date '+%d/%m/%Y %H:%M')"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -show_entries format=duration -of compact $OUT
  ffmpeg -hide_banner -nostats -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i $OUT -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
} > out/conferencia.txt
cat out/conferencia.txt
