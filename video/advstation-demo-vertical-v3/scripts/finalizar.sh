#!/bin/bash
# Render bruto → master H.264 (CRF 18, yuv420p, faststart), AAC 48 kHz, -15 LUFS / TP -1,5 dBTP; capa; conferência.
set -e
cd "$(dirname "$0")/.."
IN=out/render-bruto.mp4; OUT=out/ADV-Station-Institucional-Vertical-v2.mp4
M=$(ffmpeg -hide_banner -i $IN -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $IN -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "alimiter=limit=0.75:attack=2:release=60:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -t 69.5 -movflags +faststart $OUT
{
  echo "CONFERÊNCIA · $(date '+%d/%m/%Y %H:%M')"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -show_entries format=duration -of compact $OUT
  echo "quadros: $(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 $OUT)"
  ffmpeg -hide_banner -nostats -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i $OUT -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
} > out/conferencia.txt
cat out/conferencia.txt
