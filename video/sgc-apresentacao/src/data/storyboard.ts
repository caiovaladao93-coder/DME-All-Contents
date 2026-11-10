import TL from './timeline.json';

export type SceneKey = 'hook' | 'problem' | 'brand' | 'questions' | 'preview' | 'unlock' | 'pdf' | 'cta';
export const FPS = TL.fps;
/** Início, duração e entrada da voz (quadros) de cada cena. Fonte única: data/timeline.json (também lida pela trilha). */
export const SCENES = {} as Record<SceneKey, {from: number; dur: number; voice: number}>;
let acc = 0;
for (const s of TL.scenes) { SCENES[s.key as SceneKey] = {from: acc, dur: s.dur, voice: s.voice}; acc += s.dur; }
export const TOTAL = acc; // 1182 quadros = 39,4 s
export const ORDER = TL.scenes.map((s) => s.key as SceneKey);
