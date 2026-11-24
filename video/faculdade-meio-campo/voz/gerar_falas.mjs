// Falas do anúncio Meio-Campo (vozes criadas por Voice Design e escolhidas pelo usuário). 3 tomadas por fala.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node gerar_falas.mjs
import fs from 'fs';
const FALAS = [
  {id: 'rafa', voz: '3h4O9SgJZdkbcM1hFseC', text: 'Errei o palpite. Mas a resenha valeu.', set: {stability: 0.4, similarity_boost: 0.8, style: 0.35}},
  {id: 'caio', voz: 'OgPvH2TqntVZ64cBxgxn', text: 'Semana que vem é aqui em casa!', set: {stability: 0.4, similarity_boost: 0.8, style: 0.4}},
  {id: 'locutor', voz: 'nVio1Kfkx6v4kI3DBMvY', text: 'Meio-Campo. O jogo é melhor com limite.', set: {stability: 0.55, similarity_boost: 0.85, style: 0.2}},
];
fs.mkdirSync('takes', {recursive: true});
for (const f of FALAS) for (let k = 1; k <= 3; k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${f.voz}?output_format=mp3_44100_192`, {method: 'POST',
    headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: f.text, model_id: 'eleven_multilingual_v2', voice_settings: {...f.set, use_speaker_boost: true}, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  fs.writeFileSync(`takes/${f.id}-${k}.mp3`, Buffer.from(await r.arrayBuffer()));
  console.log('tomada', f.id, k);
}
