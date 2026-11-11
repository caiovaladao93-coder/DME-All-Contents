// Locução ElevenLabs. Voz Lendário (escolhida pelo usuário para as peças DME).
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs [--takes=3] [--so=id,id]
import fs from 'fs';
const VOICE = '4za2kOXGgUd57HRSQ1fn' /* Lendário - Cheerful, Vibrant and Fun (pt-BR) */, MODEL = 'eleven_multilingual_v2';
const SET = {stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: Number(process.argv.find(a => a.startsWith('--speed='))?.split('=')[1] || 1.0)};
const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1];
const takes = Number(arg('takes') || 3), ini = Number(arg('inicio') || 1), so = (arg('so') || '').split(',').filter(Boolean);
const FALAS = JSON.parse(fs.readFileSync('voz/falas.json', 'utf8'));
for (const [i, f] of FALAS.entries()) {
  if (so.length && !so.includes(f.id)) continue;
  for (let k = ini; k < ini + takes; k++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
      method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
      body: JSON.stringify({text: f.text, model_id: MODEL, voice_settings: SET, language_code: 'pt', previous_text: FALAS[i - 1]?.text, next_text: FALAS[i + 1]?.text})});
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    fs.writeFileSync(`voz/takes/${f.id}-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
    fs.writeFileSync(`voz/takes/${f.id}-${k}.json`, JSON.stringify({voice_id: VOICE, model_id: MODEL, voice_settings: SET, text: f.text, alignment: d.alignment}, null, 1));
    console.log('tomada', f.id, k);
  }
}
