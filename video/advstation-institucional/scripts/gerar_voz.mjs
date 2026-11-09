// Gera a locução (ElevenLabs, voz Guilherme do comercial de referência), UMA fala por cena, com timestamps.
// A chave NÃO está no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: node scripts/gerar_voz.mjs                     → gera só falas novas/alteradas (cache por hash)
//      node scripts/gerar_voz.mjs --refazer=a,b --takes=3 → gera N tomadas dessas cenas em falas/takes/
//      (depois: python3 scripts/escolher_take.py escolhe a mais limpa por medição)
// Rodar com: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
import {build} from 'esbuild';
import fs from 'fs';
import crypto from 'crypto';
const VOICE = 'CS07DI8x8kLXeSktyWLG'; // Guilherme
const MODEL = 'eleven_multilingual_v2';
const BASE = {stability: 0.6, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true, speed: 0.94}; // comercial.json
const OUT = 'public/assets/audio/falas';
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1];
const refazer = (arg('refazer') || '').split(',').filter(Boolean);
const takes = Number(arg('takes') || 1);
await build({entryPoints: ['src/data/narration.ts'], bundle: true, platform: 'node', format: 'esm', outfile: 'out/.n.mjs', logLevel: 'error'});
const {NARRATION} = await import(process.cwd() + '/out/.n.mjs');
fs.rmSync('out/.n.mjs');
fs.mkdirSync(`${OUT}/takes`, {recursive: true});
const gen = async (text, settings) => {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text, model_id: MODEL, voice_settings: settings, language_code: 'pt'}),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};
for (const n of NARRATION) {
  const settings = {...BASE, ...(n.speed ? {speed: n.speed} : {})};
  const hash = crypto.createHash('sha256').update(JSON.stringify([n.text, VOICE, MODEL, settings])).digest('hex').slice(0, 16);
  const jf = `${OUT}/${n.scene}.json`;
  const force = refazer.includes(n.scene);
  if (!force && fs.existsSync(jf) && JSON.parse(fs.readFileSync(jf, 'utf8')).hash === hash) { console.log('cache', n.scene); continue; }
  const N = force ? takes : Math.max(1, takes);
  for (let k = 1; k <= N; k++) {
    const d = await gen(n.text, settings);
    const meta = {hash, voice_id: VOICE, model_id: MODEL, voice_settings: settings, text: n.text, alignment: d.alignment, normalized_alignment: d.normalized_alignment};
    fs.writeFileSync(`${OUT}/takes/${n.scene}-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
    fs.writeFileSync(`${OUT}/takes/${n.scene}-${k}.json`, JSON.stringify(meta, null, 1));
    console.log('tomada', n.scene, k);
  }
}
