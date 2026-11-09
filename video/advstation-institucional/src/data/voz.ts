// Locução REAL (ElevenLabs, Guilherme, convert_with_timestamps) — gerada por scripts/gerar_voz.mjs.
import opening from '../../public/assets/audio/falas/opening.json';
import complexity from '../../public/assets/audio/falas/complexity.json';
import brand from '../../public/assets/audio/falas/brand.json';
import maternidade from '../../public/assets/audio/falas/maternidade.json';
import previdenciario from '../../public/assets/audio/falas/previdenciario.json';
import twoProducts from '../../public/assets/audio/falas/twoProducts.json';
import value from '../../public/assets/audio/falas/value.json';
import human from '../../public/assets/audio/falas/human.json';
import signature from '../../public/assets/audio/falas/signature.json';

type Align = {characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[]};
type Fala = {text: string; alignment: Align};

const RAW: Record<string, Fala> = {opening, complexity, brand, maternidade, previdenciario, twoProducts, value, human, signature} as any;

export type VozWord = {w: string; t0: number; t1: number}; // segundos, relativos ao início da fala

/** Palavras com tempos reais, montadas a partir do alinhamento por caractere. */
export const vozWords = (scene: string): VozWord[] => {
  const a = RAW[scene]?.alignment;
  if (!a) return [];
  const out: VozWord[] = [];
  let cur = '', t0 = 0, t1 = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) out.push({w: cur, t0, t1});
      cur = '';
      return;
    }
    if (!cur) t0 = a.character_start_times_seconds[i];
    cur += ch;
    t1 = a.character_end_times_seconds[i];
  });
  if (cur) out.push({w: cur, t0, t1});
  return out;
};

/** Duração falada (s): fim do último caractere. */
export const vozDur = (scene: string) => {
  const a = RAW[scene]?.alignment;
  return a ? a.character_end_times_seconds[a.character_end_times_seconds.length - 1] : 0;
};

export const hasVoz = (scene: string) => !!RAW[scene];
