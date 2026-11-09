import {vozDur} from './voz';

// Fonte única de tempos (30 fps). A duração de cada cena = o maior entre a base do storyboard e
// (início da fala + duração REAL da locução + respiro). A voz nunca é acelerada.
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

const ORDER = ['intro', 'opening', 'complexity', 'brand', 'maternidade', 'previdenciario', 'twoProducts', 'value', 'human', 'signature'] as const;
export type SceneKey = (typeof ORDER)[number];

/** duração-base (frames) do storyboard aprovado */
export const BASE: Record<SceneKey, number> = {
  intro: 120, opening: 270, complexity: 300, brand: 270, maternidade: 420, previdenciario: 420, twoProducts: 300, value: 270, human: 210, signature: 270,
};
/** início da fala dentro da cena (frames) */
export const VOICE_OFFSET: Partial<Record<SceneKey, number>> = {
  opening: 14, complexity: 20, brand: 40, maternidade: 8, previdenciario: 10, twoProducts: 30, value: 8, human: 10, signature: 50,
};
const TAIL = 24; // respiro após a última palavra antes do corte

const dur = (k: SceneKey) => {
  const off = VOICE_OFFSET[k];
  const need = off == null ? 0 : off + Math.ceil(vozDur(k) * FPS) + TAIL;
  return Math.max(BASE[k], need);
};

export const SCENES = (() => {
  let from = 0;
  const s = {} as Record<SceneKey, {from: number; dur: number}>;
  for (const k of ORDER) { const d = dur(k); s[k] = {from, dur: d}; from += d; }
  return s;
})();

/** frames acrescentados à cena pela locução real — eventos de fim de cena somam este valor */
export const EXTRA = (k: SceneKey) => SCENES[k].dur - BASE[k];

export const TOTAL_FRAMES = SCENES.signature.from + SCENES.signature.dur;
export const OVERLAP = 18;
