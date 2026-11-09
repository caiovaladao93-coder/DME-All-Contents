import {SCENES, SceneKey} from './storyboard';

/**
 * Narração oficial (prompt §5), uma fala por cena (manual §01.5).
 * VERSÃO DE REVISÃO: tempos ESTIMADOS (0,37 s/palavra + pausas na pontuação).
 * Na versão final, substituir por palavras/tempos do alinhamento ElevenLabs (convert_with_timestamps).
 */
export const NARRATION: Array<{scene: SceneKey; offset: number; text: string; caption?: boolean}> = [
  {scene: 'opening', offset: 14, text: 'A advocacia previdenciária não segue um caminho único. Cada benefício exige atenção a etapas, documentos, pessoas e decisões diferentes.'},
  {scene: 'complexity', offset: 20, text: 'E quando tudo isso fica espalhado em planilhas, mensagens e controles paralelos, acompanhar a operação se torna mais difícil.'},
  {scene: 'brand', offset: 40, text: 'Foi para essa realidade que nasceu a ADV Station: uma família de soluções de gestão especializada.'},
  {scene: 'maternidade', offset: 8, text: 'Para quem atua com salário-maternidade, o Maternidade Legal ajuda a organizar clientes, informações e o acompanhamento de cada caso, do protocolo ao deferimento ou recurso, de acordo com os fluxos do sistema.'},
  {scene: 'previdenciario', offset: 10, text: 'Para escritórios que trabalham com aposentadorias, benefícios por incapacidade, pensão por morte e auxílio-acidente, o Previdenciário Geral oferece uma estrutura de gestão alinhada a essas rotinas.'},
  {scene: 'twoProducts', offset: 30, text: 'Em ambos, o foco é transformar informações dispersas em processos acompanháveis,'},
  {scene: 'value', offset: 8, text: 'com mais clareza para quem atende, opera e coordena a equipe.'},
  {scene: 'human', offset: 6, text: 'Porque nenhuma ferramenta substitui a análise e a experiência jurídica. A tecnologia deve apoiar o trabalho, não complicá-lo.'},
  {scene: 'signature', offset: 4, text: 'ADV Station. Duas soluções especializadas para um mesmo compromisso: organizar a advocacia previdenciária. Conheça o Maternidade Legal e o Previdenciário Geral.', caption: false},
];

// Palavras que recebem destaque dourado na legenda (manual: o destaque serve à palavra citada).
export const GOLD_WORDS = new Set(['caminho', 'difícil.', 'especializada.', 'Legal', 'Maternidade', 'Previdenciário', 'Geral', 'clareza', 'jurídica.', 'apoiar']);

const SEC_PER_WORD = 0.37;
const pauseAfter = (w: string) => (/[.:;!?]$/.test(w) ? 0.28 : /,$/.test(w) ? 0.12 : 0);

export type Word = {w: string; start: number; end: number}; // frames absolutos
export type Cue = {start: number; end: number; words: Word[]; caption: boolean; scene: SceneKey};

/** Gera palavras com tempos estimados e blocos de legenda (≤ 7 palavras, quebra na pontuação). */
export const buildCues = (): Cue[] => {
  const cues: Cue[] = [];
  for (const n of NARRATION) {
    let t = (SCENES[n.scene].from + n.offset) / 30;
    const words: Word[] = n.text.split(' ').map((w) => {
      const start = t;
      t += SEC_PER_WORD;
      const end = t;
      t += pauseAfter(w);
      return {w, start: Math.round(start * 30), end: Math.round(end * 30)};
    });
    let cur: Word[] = [];
    words.forEach((wd, i) => {
      cur.push(wd);
      const brk = /[.:;,!?]$/.test(wd.w) && cur.length >= 3;
      if (cur.length >= 7 || brk || i === words.length - 1) {
        cues.push({start: cur[0].start, end: cur[cur.length - 1].end + 6, words: cur, caption: n.caption !== false, scene: n.scene});
        cur = [];
      }
    });
  }
  // bloco termina quando o seguinte começa (sem sobreposição)
  for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);
  return cues;
};
