import {SCENES, SceneKey} from './storyboard';
import hook from './voz/hook.json';
import problem from './voz/problem.json';
import brand from './voz/brand.json';
import questions from './voz/questions.json';
import preview from './voz/preview.json';
import unlock from './voz/unlock.json';
import pdf from './voz/pdf.json';
import cta from './voz/cta.json';

/** Narração oficial (roteiro §6). "SGC" vai para a voz como "Esse Gê Cê" para soar como sigla. */
export const NARRATION: Record<SceneKey, string> = {
  hook: 'Você sabe como está a saúde da sua empresa?',
  problem: 'Custos, margens e decisões importantes nem sempre estão claros.',
  brand: 'A SGC transforma dúvidas em um diagnóstico inicial de gestão.',
  questions: 'Descreva seu negócio e responda dez perguntas.',
  preview: 'Veja uma prévia do resultado.',
  unlock: 'Após o pagamento único, desbloqueie seu índice de saúde, pontos de atenção e recomendações iniciais.',
  pdf: 'Depois, baixe o relatório em PDF.',
  cta: 'SGC. Gestão com clareza. Descubra a saúde da sua empresa.',
};
const VOZ: Record<SceneKey, any> = {hook, problem, brand, questions, preview, unlock, pdf, cta};
export const voiceDur = (k: SceneKey) => VOZ[k].alignment.character_end_times_seconds.slice(-1)[0] as number;
/** Quadro absoluto em que a fala da cena começa. */
export const voiceStart = (k: SceneKey) => SCENES[k].from + SCENES[k].voice;

/** Palavras com tempo (quadros absolutos), a partir do alinhamento real da ElevenLabs. */
export const words = (k: SceneKey) => {
  const a = VOZ[k].alignment; const out: {w: string; start: number; end: number}[] = [];
  let cur = '', s = 0;
  a.characters.forEach((ch: string, i: number) => {
    if (ch === ' ') { if (cur) out.push({w: cur, start: s, end: a.character_end_times_seconds[i - 1]}); cur = ''; return; }
    if (!cur) s = a.character_start_times_seconds[i];
    cur += ch;
  });
  if (cur) out.push({w: cur, start: s, end: a.character_end_times_seconds.slice(-1)[0]});
  return out.map((o) => ({w: o.w, start: voiceStart(k) + Math.round(o.start * 30), end: voiceStart(k) + Math.round(o.end * 30)}));
};
/** Quadro LOCAL (dentro da cena) em que uma palavra é dita. */
export const wordAt = (k: SceneKey, needle: string) => {
  const n = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const hit = words(k).find((w) => n(w.w) === n(needle));
  return hit ? hit.start - SCENES[k].from : 0;
};
