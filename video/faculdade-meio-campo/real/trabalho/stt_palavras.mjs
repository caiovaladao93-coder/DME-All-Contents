// Transcrição com tempo por palavra (ElevenLabs Scribe). A chave vem do proxy do ambiente; nunca é escrita aqui.
import fs from 'fs';
for (const f of process.argv.slice(2)) {
  const fd = new FormData(); fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'por'); fd.append('timestamps_granularity', 'word');
  fd.append('file', new Blob([fs.readFileSync(f)], {type: 'audio/mpeg'}), 'a.mp3');
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': 'proxy-injected'}, body: fd});
  const d = await r.json();
  console.log(f, (d.words || []).filter(w => w.type === 'word').map(w => `${w.text}@${w.start.toFixed(2)}-${w.end.toFixed(2)}`).join(' '));
}
