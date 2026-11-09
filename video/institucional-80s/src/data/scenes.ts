// Todas as durações centralizadas aqui (30 fps). Alterar um número reposiciona a cena inteira.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const SCENES = {
  s01Hook: {from: 0, dur: 180},
  s02Problems: {from: 180, dur: 300},
  s03Brand: {from: 480, dur: 240},
  s04Method: {from: 720, dur: 300},
  s05Solutions: {from: 1020, dur: 330},
  s06Applications: {from: 1350, dur: 360},
  s07Benefits: {from: 1710, dur: 330},
  s08Philosophy: {from: 2040, dur: 150},
  s09Signature: {from: 2190, dur: 120},
  s10CTA: {from: 2310, dur: 90},
} as const;

export const TOTAL_FRAMES = 2400; // 80 s

// Sobreposição usada nas transições (a cena seguinte começa a ser desenhada antes).
export const OVERLAP = 16;

// Blocos internos da cena 06 (frames locais).
export const APP_BLOCKS = [
  {key: 'atendimento', from: 0, dur: 100},
  {key: 'comercial', from: 100, dur: 90},
  {key: 'gestao', from: 190, dur: 170},
] as const;
