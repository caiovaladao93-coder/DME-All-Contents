// Voice Design (ElevenLabs): gera prévias da voz do narrador da série 72 HORAS a partir de uma descrição.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node criar_voz.mjs <rotulo> "<descrição>"
import fs from 'fs';
const [, , rotulo, descricao] = process.argv;
const texto = 'Imagina que você herda a empresa do seu pai… e ela tem setenta e duas horas de vida. Mil duzentos e quarenta e sete pedidos parados. E o Beto pediu demissão ontem. A Júlia tem dez segundos. Ela abre a foto na frente dele… ou finge que não viu?';
const r = await fetch('https://api.elevenlabs.io/v1/text-to-voice/create-previews', {method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
  body: JSON.stringify({voice_description: descricao, text: texto})});
if (!r.ok) { console.error(r.status, (await r.text()).slice(0, 400)); process.exit(1); }
const d = await r.json();
fs.mkdirSync('amostras', {recursive: true});
(d.previews || []).forEach((p, i) => { fs.writeFileSync(`amostras/${rotulo}-${i + 1}.mp3`, Buffer.from(p.audio_base_64, 'base64')); console.log(rotulo, i + 1, p.generated_voice_id); });
fs.writeFileSync(`amostras/${rotulo}.json`, JSON.stringify({descricao, texto, previews: (d.previews || []).map((p) => ({id: p.generated_voice_id}))}, null, 1));
