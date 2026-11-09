// Gera out/legendas.srt a partir de src/data/narration.json (30 fps).
import fs from 'fs';
const {chunks} = JSON.parse(fs.readFileSync('src/data/narration.json', 'utf8'));
const ts = (fr) => {
  const ms = Math.round((fr / 30) * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
};
const srt = chunks.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/legendas.srt', srt);
console.log(`${chunks.length} blocos → out/legendas.srt`);
