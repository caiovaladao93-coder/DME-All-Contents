// Fonte única de tempos (30 fps). Ajustar após medir a locução real (ElevenLabs, convert_with_timestamps).
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

export const SCENES = {
  intro: {from: 0, dur: 120}, // 00:00–00:04 vinheta de abertura (marca)
  opening: {from: 120, dur: 270}, // 00:04–00:13 cada benefício, um caminho
  complexity: {from: 390, dur: 300}, // 00:13–00:23 planilhas, mensagens, controles paralelos
  brand: {from: 690, dur: 270}, // 00:23–00:32 conheça a ADV Station
  maternidade: {from: 960, dur: 420}, // 00:32–00:46
  previdenciario: {from: 1380, dur: 420}, // 00:46–01:00
  twoProducts: {from: 1800, dur: 300}, // 01:00–01:10
  value: {from: 2100, dur: 270}, // 01:10–01:19
  human: {from: 2370, dur: 210}, // 01:19–01:26
  signature: {from: 2580, dur: 270}, // 01:26–01:35 vinheta de encerramento + CTA
} as const;

export type SceneKey = keyof typeof SCENES;
export const TOTAL_FRAMES = 2850; // 95 s
export const OVERLAP = 18;
