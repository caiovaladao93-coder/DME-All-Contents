// Locução do anúncio vertical ADV Station numa tomada só, com <break> e alinhamento por caractere.
// Voz Guilherme (padrão das peças ADV). A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs [n_tomadas]
import fs from 'fs';
const VOICE = 'CS07DI8x8kLXeSktyWLG';
const SET = {stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 1.08};   // v2 comercial: mais energia
const B = t => ` <break time="${t}s" /> `;
const TEXTO = 'Advogado previdenciário:' + B(.15) + 'onde está cada caso do seu escritório agora?' + B(.5) +
  'Com a ADV Station, você bate o olho e vê o setor e a etapa de cada cliente.' + B(.3) +
  'Um clique, e aparece quem está sem contato e quem está inadimplente.' + B(.3) +
  'Os prazos vêm em ordem:' + B(.15) + 'o que venceu, o que vence hoje e o que vem aí.' + B(.3) +
  'E o dashboard mostra a operação e o financeiro numa tela só.' + B(.4) +
  'Maternidade Legal e Previdenciário Geral:' + B(.15) + 'feitos pra advocacia previdenciária.' + B(.4) +
  'Acesse advstation.io e veja na prática.';
for (let k = 1; k <= Number(process.argv[2] || 3); k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: TEXTO, model_id: 'eleven_multilingual_v2', voice_settings: SET, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/anuncio2-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/anuncio2-${k}.json`, JSON.stringify({voice_id: VOICE, voice_settings: SET, text: TEXTO, alignment: d.alignment}, null, 1));
  console.log('tomada', k);
}
