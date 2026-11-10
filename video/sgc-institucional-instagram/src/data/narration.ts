import {SCENES, SceneKey} from './storyboard';
import s1 from './voz/s1.json';
import s2 from './voz/s2.json';
import s3 from './voz/s3.json';
import s4 from './voz/s4.json';
import s5 from './voz/s5.json';
import s6 from './voz/s6.json';
import s7 from './voz/s7.json';

/** Narração oficial do roteiro. "SGC" vai para a voz como "Esse Gê Cê" (sigla); a legenda usa SGC. */
export const NARRATION: Record<SceneKey, string> = {
  s1: 'Decisões importantes não deveriam depender apenas de intuição.',
  s2: 'A SGC é uma metodologia de gestão que ajuda empresas a entender sua operação e agir com mais clareza.',
  s3: 'Começamos pelo diagnóstico: analisamos faturamento, impostos, logística, margem e custos.',
  s4: 'Com esses dados, identificamos prioridades e estruturamos um plano de ação.',
  s5: 'Depois, acompanhamos indicadores e a execução, para que a gestão evolua com direção.',
  s6: 'Porque crescer exige mais do que trabalhar muito. Exige método.',
  s7: 'SGC. Clareza para decidir. Direção para crescer.',
};
const VOZ: Record<SceneKey, any> = {s1, s2, s3, s4, s5, s6, s7};
export const voiceDur = (k: SceneKey) => VOZ[k].alignment.character_end_times_seconds.slice(-1)[0] as number;
export const voiceStart = (k: SceneKey) => SCENES[k].from + SCENES[k].voice;

const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** Quadro LOCAL (dentro da cena) em que a palavra começa a ser dita (alinhamento real da ElevenLabs). */
export const wordAt = (k: SceneKey, needle: string, nth = 0) => {
  const a = VOZ[k].alignment; const ws: {w: string; s: number}[] = []; let cur = '', st = 0;
  a.characters.forEach((ch: string, i: number) => {
    if (ch === ' ') { if (cur) ws.push({w: cur, s: st}); cur = ''; return; }
    if (!cur) st = a.character_start_times_seconds[i];
    cur += ch;
  });
  if (cur) ws.push({w: cur, s: st});
  const hits = ws.filter((w) => norm(w.w) === norm(needle));
  const hit = hits[nth] ?? hits[0];
  return hit ? SCENES[k].voice + Math.round(hit.s * 30) : 0;
};
