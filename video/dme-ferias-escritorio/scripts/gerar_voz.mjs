// Locução ElevenLabs. Esta peça usa a voz Diego (locutor publicitário, mais entusiasmada), a pedido do usuário.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs [--takes=3] [--so=id,id]
import fs from 'fs';
const VOICE = 'rpNe0HOx7heUulPiOEaG' /* Diego - Confident Announcer (pt-BR) */, MODEL = 'eleven_multilingual_v2';
const SET = {stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: Number(process.argv.find(a => a.startsWith('--speed='))?.split('=')[1] || 0.94)};
const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1];
const takes = Number(arg('takes') || 3), so = (arg('so') || '').split(',').filter(Boolean);
for (const f of JSON.parse(fs.readFileSync('voz/falas.json', 'utf8'))) {
  if (so.length && !so.includes(f.id)) continue;
  for (let k = 1; k <= takes; k++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
      method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
      body: JSON.stringify({text: f.text, model_id: MODEL, voice_settings: SET, language_code: 'pt'})});
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    fs.writeFileSync(`voz/takes/${f.id}-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
    fs.writeFileSync(`voz/takes/${f.id}-${k}.json`, JSON.stringify({voice_id: VOICE, model_id: MODEL, voice_settings: SET, text: f.text, alignment: d.alignment}, null, 1));
    console.log('tomada', f.id, k);
  }
}
