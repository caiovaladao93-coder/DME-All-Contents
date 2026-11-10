// Imagens de revisão (uma por cena) de storyboard (um quadro representativo por cena) em out/storyboard/.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const TL = JSON.parse(fs.readFileSync('src/data/timeline.json', 'utf8'));
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const REP = {vin: .97, v1: .85, v2: .9, v3: .9, v4: .9, v5: .9, v6: .9, v7: .92, v8: .9, v9: .95}; // posição do quadro dentro da cena
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'ADVReels', browserExecutable, inputProps: {audio: false}});
fs.mkdirSync('out/storyboard', {recursive: true});
let acc = 0;
for (const [i, s] of TL.scenes.entries()) {
  const frame = acc + Math.round(s.dur * REP[s.key]);
  await renderStill({serveUrl, composition, frame, output: `out/storyboard/${String(i + 1).padStart(2, '0')}-${s.key}.png`, browserExecutable, inputProps: {audio: false}});
  console.log(s.key, frame);
  acc += s.dur;
}
