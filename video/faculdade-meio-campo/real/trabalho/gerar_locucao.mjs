// Locução final (voz "Meio-Campo Locutor", Voice Design da conta). A chave vem do proxy do ambiente; nunca é escrita nem impressa.
// Uso: node gerar_locucao.mjs <speed> <rotulo>
import fs from 'fs';
const [, , speed = '1.0', rot = 'loc'] = process.argv;
const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/nVio1Kfkx6v4kI3DBMvY?output_format=mp3_44100_192', {method: 'POST',
  headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
  body: JSON.stringify({text: 'Meio-Campo. O jogo é melhor com limite. Ministério da Fazenda adverte: aposta não é investimento.',
    model_id: 'eleven_multilingual_v2', language_code: 'pt', voice_settings: {stability: 0.6, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true, speed: Number(speed)}})});
if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
fs.writeFileSync(`voz/${rot}.mp3`, Buffer.from(await r.arrayBuffer()));
