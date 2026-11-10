#!/bin/bash
# Render bruto → MP4 final (-14 LUFS, pico -1,5 dBTP, yuv420p), narração separada, SRT, capa e conferência.
set -e
cd "$(dirname "$0")/.."
IN=out/render-bruto.mp4; OUT=out/DME-O-Trabalho-Tambem-Viaja-Reels.mp4
M=$(ffmpeg -hide_banner -i $IN -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $IN -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "alimiter=limit=0.8:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart $OUT
python3 scripts/extras.py
ffmpeg -y -v error -ss 2.6 -i $OUT -frames:v 1 out/capa.png
{
  echo "CONFERÊNCIA · $(date '+%d/%m/%Y %H:%M')"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -show_entries format=duration -of compact $OUT
  echo "quadros: $(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 $OUT)"
  ffmpeg -hide_banner -nostats -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|LRA:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i $OUT -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
} > out/conferencia.txt
cat out/conferencia.txt
