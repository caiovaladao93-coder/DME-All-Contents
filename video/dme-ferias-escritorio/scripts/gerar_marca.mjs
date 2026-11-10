// Gera só a frase da marca ("DME Technology.") em variações de grafia, com o contexto das frases vizinhas
// para a entonação sair natural. Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_marca.mjs
import fs from 'fs';
const VOICE = '4za2kOXGgUd57HRSQ1fn', MODEL = 'eleven_multilingual_v2';
const SET = {stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 1.0};
const VAR = {a: 'Dê Eme É Technology.', b: 'Dê-Eme-É Technology.', c: 'Dê Eme Ê Technology.', d: 'Dêemeé Technology.'};
for (const [k, text] of Object.entries(VAR)) for (let n = 1; n <= 3; n++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text, model_id: MODEL, voice_settings: SET, language_code: 'pt',
      previous_text: 'Mais tranquilidade para aproveitar suas férias.', next_text: 'Tecnologia para a empresa seguir.'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/marca/${k}${n}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/marca/${k}${n}.json`, JSON.stringify({voice_id: VOICE, model_id: MODEL, voice_settings: SET, text, alignment: d.alignment}, null, 1));
  console.log('marca', k, n);
}
