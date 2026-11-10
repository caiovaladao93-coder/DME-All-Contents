import {SCENES} from './storyboard';
import v1 from './voz/v1.json';
import v2 from './voz/v2.json';
import v3 from './voz/v3.json';
import v4 from './voz/v4.json';
import v5 from './voz/v5.json';
import v6 from './voz/v6.json';
import v7 from './voz/v7.json';
import v8 from './voz/v8.json';
import v9 from './voz/v9.json';

export type VKey = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9';
const VOZ: Record<VKey, any> = {v1, v2, v3, v4, v5, v6, v7, v8, v9};
/** Texto falado (legenda) de cada cena. Alinhamento real da ElevenLabs, já escalado pelo atempo 1,05. */
export const text = (k: VKey) => VOZ[k].text as string;
export const voiceDur = (k: VKey) => VOZ[k].alignment.character_end_times_seconds.slice(-1)[0] as number;
export const voiceStart = (k: VKey) => SCENES[k].from + (SCENES[k].voice ?? 0);
const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** Quadro LOCAL da cena em que a palavra começa (gatilho de animação = palavra falada). */
export const wordAt = (k: VKey, needle: string, nth = 0) => {
  const a = VOZ[k].alignment; const ws: {w: string; s: number}[] = []; let cur = '', st = 0;
  a.characters.forEach((ch: string, i: number) => {
    if (ch === ' ') { if (cur) ws.push({w: cur, s: st}); cur = ''; return; }
    if (!cur) st = a.character_start_times_seconds[i];
    cur += ch;
  });
  if (cur) ws.push({w: cur, s: st});
  const hits = ws.filter((w) => norm(w.w) === norm(needle));
  const hit = hits[nth] ?? hits[0];
  if (!hit) throw new Error(`palavra "${needle}" não encontrada em ${k}`);
  return (SCENES[k].voice ?? 0) + Math.round(hit.s * 30);
};
