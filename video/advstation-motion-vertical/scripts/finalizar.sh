#!/bin/bash
# Render bruto (quadros) + mix → master H.264 (CRF 18, yuv420p, faststart) com AAC 48 kHz; capa; conferência.
set -e
cd "$(dirname "$0")/.."
IN=out/video-bruto.mp4; OUT=out/ADV-Station-Institucional-Vertical.mp4
ffmpeg -y -v error -i $IN -i out/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -ar 48000 -t 68.0 -movflags +faststart $OUT
ffmpeg -y -v error -ss 50.5 -i $OUT -frames:v 1 out/capa.png
{
  echo "CONFERÊNCIA · $(date '+%d/%m/%Y %H:%M')"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -show_entries format=duration -of compact $OUT
  echo "quadros: $(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 $OUT)"
  ffmpeg -hide_banner -nostats -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i $OUT -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
} > out/conferencia.txt
cat out/conferencia.txt
