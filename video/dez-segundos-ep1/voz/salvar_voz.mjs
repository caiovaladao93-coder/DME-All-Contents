// Salva a prévia escolhida como voz da conta (ElevenLabs). Uso: node salvar_voz.mjs <generated_voice_id> "<nome>" "<descrição>" [saida.json]
import fs from 'fs';
const [, , id, nome, desc, saida = 'voz-escolhida.json'] = process.argv;
const r = await fetch('https://api.elevenlabs.io/v1/text-to-voice/create-voice-from-preview', {method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
  body: JSON.stringify({voice_name: nome, voice_description: desc, generated_voice_id: id})});
const txt = await r.text(); if (!r.ok) { console.error(r.status, txt.slice(0, 400)); process.exit(1); }
const d = JSON.parse(txt); console.log('voice_id', d.voice_id);
fs.writeFileSync(saida, JSON.stringify({nome, voice_id: d.voice_id, origem: id, descricao: desc}, null, 1));
