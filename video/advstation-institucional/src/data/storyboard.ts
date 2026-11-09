// Fonte única de tempos (30 fps). Ajustar após medir a locução real (ElevenLabs, convert_with_timestamps).
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

export const SCENES = {
  opening: {from: 0, dur: 240}, // 00:00–00:08
  complexity: {from: 240, dur: 300}, // 00:08–00:18
  brand: {from: 540, dur: 270}, // 00:18–00:27
  maternidade: {from: 810, dur: 420}, // 00:27–00:41
  previdenciario: {from: 1230, dur: 420}, // 00:41–00:55
  twoProducts: {from: 1650, dur: 300}, // 00:55–01:05
  value: {from: 1950, dur: 270}, // 01:05–01:14
  human: {from: 2220, dur: 210}, // 01:14–01:21
  signature: {from: 2430, dur: 270}, // 01:21–01:30
} as const;

export type SceneKey = keyof typeof SCENES;
export const TOTAL_FRAMES = 2700;
export const OVERLAP = 18; // a cena seguinte é desenhada por cima durante a transição
