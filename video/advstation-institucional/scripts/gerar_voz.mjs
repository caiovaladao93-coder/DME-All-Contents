// Gera a locução (ElevenLabs, voz Guilherme do comercial de referência), UMA fala por cena, com timestamps.
// A chave NÃO está no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Cache: só gera de novo se texto/voz/modelo/ajustes mudarem (hash em cada .json).
import {build} from 'esbuild';
import fs from 'fs';
import crypto from 'crypto';
const VOICE = 'CS07DI8x8kLXeSktyWLG'; // Guilherme
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = {stability: 0.6, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true, speed: 0.94}; // comercial.json
const OUT = 'public/assets/audio/falas';
await build({entryPoints: ['src/data/narration.ts'], bundle: true, platform: 'node', format: 'esm', outfile: 'out/.n.mjs', logLevel: 'error'});
const {NARRATION} = await import(process.cwd() + '/out/.n.mjs');
fs.rmSync('out/.n.mjs');
for (const n of NARRATION) {
  const hash = crypto.createHash('sha256').update(JSON.stringify([n.text, VOICE, MODEL, SETTINGS])).digest('hex').slice(0, 16);
  const jf = `${OUT}/${n.scene}.json`;
  if (fs.existsSync(jf) && JSON.parse(fs.readFileSync(jf, 'utf8')).hash === hash) { console.log('cache', n.scene); continue; }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: n.text, model_id: MODEL, voice_settings: SETTINGS, language_code: 'pt'}),
  });
  if (!r.ok) { console.error('ERRO', n.scene, r.status, await r.text()); process.exit(1); }
  const d = await r.json();
  fs.writeFileSync(`${OUT}/${n.scene}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(jf, JSON.stringify({hash, voice_id: VOICE, model_id: MODEL, voice_settings: SETTINGS, text: n.text, alignment: d.alignment, normalized_alignment: d.normalized_alignment}, null, 1));
  console.log('gerado', n.scene);
}
