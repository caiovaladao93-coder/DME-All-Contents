// Locução do anúncio vertical ADV Station numa tomada só, com <break> e alinhamento por caractere.
// Voz Guilherme (padrão das peças ADV). A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs [n_tomadas]
import fs from 'fs';
const VOICE = 'CS07DI8x8kLXeSktyWLG';
const SET = {stability: 0.6, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true, speed: 1.0};
const B = t => ` <break time="${t}s" /> `;
const TEXTO = 'Advogado previdenciário:' + B(.2) + 'cada caso tem o seu caminho.' + B(.5) +
  'Na ADV Station, cada cliente aparece com o setor e a etapa em que está.' + B(.4) +
  'Um clique, e o protocolo mostra o que precisa de atenção.' + B(.5) +
  'No Previdenciário Geral, os prazos aparecem em ordem:' + B(.2) + 'vencidos, do dia e os próximos.' + B(.4) +
  'E o dashboard reúne a operação e o financeiro do escritório.' + B(.6) +
  'ADV Station.' + B(.3) + 'Conheça nossas soluções.';
for (let k = 1; k <= Number(process.argv[2] || 3); k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: TEXTO, model_id: 'eleven_multilingual_v2', voice_settings: SET, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/anuncio-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/anuncio-${k}.json`, JSON.stringify({voice_id: VOICE, voice_settings: SET, text: TEXTO, alignment: d.alignment}, null, 1));
  console.log('tomada', k);
}
