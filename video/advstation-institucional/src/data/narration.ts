import {SCENES, SceneKey, VOICE_OFFSET} from './storyboard';
import {hasVoz, vozWords} from './voz';

/** Narração oficial (prompt §5), uma fala por cena (manual §01.5). Tempos = alinhamento REAL da ElevenLabs. */
// speed: ajuste de velocidade por fala (manual: preservar velocidades específicas da cena). Reticências = pausa natural.
export const NARRATION: Array<{scene: SceneKey; text: string; caption?: boolean; speed?: number}> = [
  {scene: 'opening', text: 'A advocacia previdenciária não segue um caminho único. Cada benefício exige atenção a etapas, documentos, pessoas e decisões diferentes.'},
  {scene: 'complexity', text: 'E quando tudo isso fica espalhado em planilhas, mensagens e controles paralelos, acompanhar a operação se torna mais difícil.'},
  {scene: 'brand', text: 'Foi para essa realidade que nasceu a ADV Station: uma família de soluções de gestão especializada.'},
  {scene: 'maternidade', text: 'Para quem atua com salário-maternidade, o Maternidade Legal ajuda a organizar clientes, informações e o acompanhamento de cada caso, do protocolo ao deferimento ou recurso, de acordo com os fluxos do sistema.'},
  {scene: 'previdenciario', text: 'Para escritórios que trabalham com aposentadorias, benefícios por incapacidade, pensão por morte e auxílio-acidente, o Previdenciário Geral oferece uma estrutura de gestão alinhada a essas rotinas.'},
  {scene: 'twoProducts', text: 'Em ambos, o foco é transformar informações dispersas em processos acompanháveis.'},
  {scene: 'value', text: 'Com mais clareza para quem atende, opera e coordena a equipe.'},
  {scene: 'human', text: 'Porque nenhuma ferramenta substitui a análise e a experiência jurídica. A tecnologia deve apoiar o trabalho, não complicá-lo.'},
  {scene: 'signature', text: 'ADV Station. Duas soluções especializadas para um mesmo compromisso: organizar a advocacia previdenciária. Conheça o Maternidade Legal e o Previdenciário Geral.', caption: false},
];

export const GOLD_WORDS = new Set(['caminho', 'difícil.', 'especializada.', 'Legal', 'Maternidade', 'Previdenciário', 'Geral', 'clareza', 'jurídica.', 'apoiar']);

export type Word = {w: string; start: number; end: number}; // frames absolutos
export type Cue = {start: number; end: number; words: Word[]; caption: boolean; scene: SceneKey};

const SEC_PER_WORD = 0.37; // só usado se faltar o áudio de alguma cena
const pauseAfter = (w: string) => (/[.:;!?]$/.test(w) ? 0.28 : /,$/.test(w) ? 0.12 : 0);

const wordsFor = (n: (typeof NARRATION)[number]): Word[] => {
  const base = SCENES[n.scene].from + (VOICE_OFFSET[n.scene] ?? 0);
  if (hasVoz(n.scene)) return vozWords(n.scene).map((v) => ({w: v.w.replace(/\.\.\.|…/g, ''), start: base + Math.round(v.t0 * 30), end: base + Math.round(v.t1 * 30)}));
  let t = base / 30;
  return n.text.split(' ').map((w) => { const s = t; t += SEC_PER_WORD; const e = t; t += pauseAfter(w); return {w, start: Math.round(s * 30), end: Math.round(e * 30)}; });
};

let CACHE: Cue[] | null = null;
/** Blocos de legenda (≤ 7 palavras, quebra na pontuação) com os tempos das palavras reais. */
export const buildCues = (): Cue[] => {
  if (CACHE) return CACHE;
  const cues: Cue[] = [];
  for (const n of NARRATION) {
    const words = wordsFor(n);
    let cur: Word[] = [];
    words.forEach((wd, i) => {
      cur.push(wd);
      const brk = /[.:;,!?]$/.test(wd.w) && cur.length >= 3;
      if (cur.length >= 7 || brk || i === words.length - 1) {
        cues.push({start: cur[0].start - 2, end: cur[cur.length - 1].end + 8, words: cur, caption: n.caption !== false, scene: n.scene});
        cur = [];
      }
    });
  }
  for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);
  CACHE = cues;
  return cues;
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, '');

/** Frame LOCAL (relativo à cena) em que a palavra é dita — gatilho de animação (manual: texto pela palavra da locução). */
export const wordAt = (scene: SceneKey, needle: string, nth = 0): number => {
  const hits = buildCues().filter((c) => c.scene === scene).flatMap((c) => c.words).filter((w) => norm(w.w) === norm(needle));
  const hit = hits[nth] ?? hits[0];
  return hit ? hit.start - SCENES[scene].from : 0;
};
