import TL from './timeline.json';

export type SceneKey = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';
/** Fonte única dos tempos: data/timeline.json (também lida pela trilha e pelas legendas). */
export const SCENES = {} as Record<SceneKey, {from: number; dur: number; voice: number}>;
let acc = 0;
for (const s of TL.scenes) { SCENES[s.key as SceneKey] = {from: acc, dur: s.dur, voice: s.voice}; acc += s.dur; }
export const TOTAL = acc; // 1.190 quadros = 39,67 s
export const ORDER = TL.scenes.map((s) => s.key as SceneKey);
