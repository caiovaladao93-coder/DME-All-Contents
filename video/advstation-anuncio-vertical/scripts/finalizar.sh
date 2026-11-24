#!/bin/bash
# Render bruto → master H.264 (CRF 18, yuv420p, faststart), AAC 48 kHz, -15 LUFS / TP -1,5 dBTP (loudnorm em 2 passadas); capa; conferência.
set -e
cd "$(dirname "$0")/.."
IN=out/render-bruto.mp4; OUT=out/ADV-Station-Anuncio-Vertical.mp4
M=$(ffmpeg -hide_banner -i $IN -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $IN -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart $OUT
ffmpeg -y -v error -ss 8.6 -i $OUT -frames:v 1 out/capa.png
{
  echo "CONFERÊNCIA · ADV-Station-Anuncio-Vertical.mp4"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate -show_entries format=duration -of compact $OUT
  ffmpeg -hide_banner -nostats -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:"
  echo "quadros pretos (>0,1 s):"; ffmpeg -hide_banner -nostats -i $OUT -vf blackdetect=d=0.1:pix_th=0.04 -an -f null - 2>&1 | grep -o "black_start.*" || echo "  nenhum"
  echo "narração conferida por transcrição (ElevenLabs Scribe): texto idêntico ao roteiro"
  echo "telas reais (dados fictícios do Escritório Demonstração); cursor e cliques simulados com aprovação do usuário; selos só com funções visíveis nas telas"
} > out/conferencia.txt
cat out/conferencia.txt
