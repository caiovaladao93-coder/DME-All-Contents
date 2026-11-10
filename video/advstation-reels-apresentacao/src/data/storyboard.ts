import TL from './timeline.json';

export type SceneKey = 'vin' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9';
export const SCENES = {} as Record<SceneKey, {from: number; dur: number; voice: number | null}>;
let acc = 0;
for (const s of TL.scenes) { SCENES[s.key as SceneKey] = {from: acc, dur: s.dur, voice: s.voice}; acc += s.dur; }
export const TOTAL = acc; // 1.790 quadros = 59,67 s
export const ORDER = TL.scenes.map((s) => s.key as SceneKey);
export const VOICED = ORDER.filter((k) => SCENES[k].voice != null) as Exclude<SceneKey, 'vin'>[];
