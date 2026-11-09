#!/bin/bash
# Junta vídeo mudo + trilha (loudnorm 2 passos, -14 LUFS / -2,2 dBTP), gera brag.jpg e confere.
set -e
cd "$(dirname "$0")/.."
W=brag-output/work
M=$(ffmpeg -hide_banner -i $W/mix.wav -af loudnorm=I=-14:TP=-2.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $W/video-mudo.mp4 -i $W/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-2.2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -shortest -movflags +faststart brag-output/brag.mp4
ffmpeg -y -v error -i brag-output/brag.mp4 -frames:v 1 -q:v 2 brag-output/brag.jpg
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -show_entries format=duration -of compact brag-output/brag.mp4
ffmpeg -hide_banner -i brag-output/brag.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:"
