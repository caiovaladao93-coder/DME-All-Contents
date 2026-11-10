// Oito imagens de storyboard (um quadro representativo por cena) em out/storyboard/.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const TL = JSON.parse(fs.readFileSync('src/data/timeline.json', 'utf8'));
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const REP = {hook: .88, problem: .82, brand: .7, questions: .9, preview: .62, unlock: .62, pdf: .95, cta: .85}; // posição do quadro dentro da cena
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'SGCInstitutional', browserExecutable, inputProps: {audio: false}});
fs.mkdirSync('out/storyboard', {recursive: true});
let acc = 0;
for (const [i, s] of TL.scenes.entries()) {
  const frame = acc + Math.round(s.dur * REP[s.key]);
  await renderStill({serveUrl, composition, frame, output: `out/storyboard/${String(i + 1).padStart(2, '0')}-${s.key}.png`, browserExecutable, inputProps: {audio: false}});
  console.log(s.key, frame);
  acc += s.dur;
}
