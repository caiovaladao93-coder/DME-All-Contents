// Amostras do texto completo em vozes candidatas (a chave vem do proxy do ambiente).
import fs from 'fs';
const V = {pri: '8EY2gK6oUxZCDZAlvUpZ', sol: 'WZEwLyw8MpIhHlh41g9e', fernanda: 'KHmfNHtEjHhLK9eER20w'};
const text = JSON.parse(fs.readFileSync('voz/falas.json', 'utf8')).map((f) => f.text).join(' ');
for (const [n, id] of Object.entries(V)) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_192`, {method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text, model_id: 'eleven_multilingual_v2', language_code: 'pt', voice_settings: {stability: .55, similarity_boost: .8, style: .15, use_speaker_boost: true, speed: 1.0}})});
  console.log(n, r.status); if (!r.ok) { console.log(await r.text()); continue; }
  fs.writeFileSync(`voz/amostras/${n}.mp3`, Buffer.from(await r.arrayBuffer()));
}
