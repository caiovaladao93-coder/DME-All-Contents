// Voice Design (ElevenLabs): prévias de vozes novas a partir de uma descrição e de um texto de teste.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node criar_voz.mjs <rotulo> "<descrição>" "<texto>"
import fs from 'fs';
const [, , rotulo, descricao, texto] = process.argv;
const r = await fetch('https://api.elevenlabs.io/v1/text-to-voice/create-previews', {method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
  body: JSON.stringify({voice_description: descricao, text: texto})});
if (!r.ok) { console.error(r.status, (await r.text()).slice(0, 400)); process.exit(1); }
const d = await r.json();
fs.mkdirSync('amostras', {recursive: true});
(d.previews || []).forEach((p, i) => { fs.writeFileSync(`amostras/${rotulo}-${i + 1}.mp3`, Buffer.from(p.audio_base_64, 'base64')); console.log(rotulo, i + 1, p.generated_voice_id); });
fs.writeFileSync(`amostras/${rotulo}.json`, JSON.stringify({descricao, texto, previews: (d.previews || []).map((p) => ({id: p.generated_voice_id}))}, null, 1));
