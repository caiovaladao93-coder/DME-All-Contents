// Exporta out/timeline.json (cenas, falas e marcas das vinhetas) para a trilha e os efeitos.
import {build} from 'esbuild';
import fs from 'fs';
await build({stdin: {contents: "export * from './src/data/storyboard'; export {vozDur} from './src/data/voz'; export {wordAt} from './src/data/narration';", resolveDir: '.', loader: 'ts'},
  bundle: true, platform: 'node', format: 'esm', outfile: 'out/.t.mjs', logLevel: 'error', loader: {'.json': 'json'}});
const m = await import(process.cwd() + '/out/.t.mjs');
fs.rmSync('out/.t.mjs');
const fps = 30;
const scenes = Object.fromEntries(Object.entries(m.SCENES).map(([k, v]) => [k, {start: v.from / fps, dur: v.dur / fps}]));
const voz = Object.entries(m.VOICE_OFFSET).map(([k, off]) => ({cena: k, start: (m.SCENES[k].from + off) / fps, dur: m.vozDur(k)}));
const VINHETA_T0 = 64;
const marks = {
  intro_t0: 0, intro_wipe: 100 / fps,
  final_dot: (m.SCENES.signature.from + 38) / fps, final_t0: (m.SCENES.signature.from + VINHETA_T0) / fps,
  final_cta: (m.SCENES.signature.from + Math.max(VINHETA_T0 + 150, m.wordAt('signature', 'conheça') - 6)) / fps,
};
fs.writeFileSync('out/timeline.json', JSON.stringify({fps, total: m.TOTAL_FRAMES / fps, scenes, voz, marks}, null, 1));
console.log('total', (m.TOTAL_FRAMES / fps).toFixed(2), 's'); console.log(JSON.stringify(marks));
