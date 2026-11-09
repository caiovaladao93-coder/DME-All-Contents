// Gera out/legendas.srt, out/legendas.vtt, out/roteiro.json e out/locucao.txt a partir de src/data (fonte única).
// Uso: node scripts/legendas.mjs   (tempos ESTIMADOS até existir o alinhamento real da ElevenLabs)
import {build} from 'esbuild';
import fs from 'fs';
await build({entryPoints: ['src/data/narration.ts'], bundle: true, platform: 'node', format: 'esm', outfile: 'out/.narration.mjs', logLevel: 'error'});
const {buildCues, NARRATION} = await import(process.cwd() + '/out/.narration.mjs');
const {SCENES} = await import(process.cwd() + '/out/.narration.mjs').catch(() => ({}));
const cues = buildCues();
const ts = (fr, sep) => { const ms = Math.round(fr / 30 * 1000); const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms % 3600000 / 60000))}:${p(Math.floor(ms % 60000 / 1000))}${sep}${p(ms % 1000, 3)}`; };
const txt = (c) => c.words.map((w) => w.w).join(' ');
fs.writeFileSync('out/legendas.srt', cues.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${txt(c)}\n`).join('\n'));
fs.writeFileSync('out/legendas.vtt', 'WEBVTT\n\nNOTE Tempos estimados (versão de revisão). Substituir pelo alinhamento ElevenLabs.\n\n' + cues.map((c) => `${ts(c.start, '.')} --> ${ts(c.end, '.')}\n${txt(c)}\n`).join('\n'));
fs.writeFileSync('out/locucao.txt', NARRATION.map((n) => n.text).join('\n\n') + '\n');
fs.writeFileSync('out/roteiro.json', JSON.stringify({
  versao: 'revisao', fps: 30, resolucao: '1920x1080', duracao_frames: 2700,
  voz: {servico: 'ElevenLabs', model_id: 'eleven_multilingual_v2', decisao_pendente: 'Leo Antonio (EbiSUflQjzm4g7S895SC, editorial) ou Guilherme (CS07DI8x8kLXeSktyWLG, voz do comercial de referência)'},
  falas: NARRATION.map((n) => ({cena: n.scene, offset_frames: n.offset, texto: n.text, legenda: n.caption !== false})),
  legendas: cues.map((c) => ({cena: c.scene, inicio: c.start, fim: c.end, texto: txt(c)})),
}, null, 2));
fs.rmSync('out/.narration.mjs');
console.log(cues.length, 'blocos; última fala termina no frame', Math.max(...cues.map((c) => c.end)));
