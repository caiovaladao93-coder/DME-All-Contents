// Narração do ep. 3 de SARAMAR ("A árvore") numa tomada só, com <break> e alinhamento por caractere.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz_ep3.mjs [n_tomadas]
import fs from 'fs';
const VOICE = 'wcRzlqRM8P8rr8ZZsd9h'; // Saramar Narrador (Voice Design)
const SET = {stability: 0.5, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true, speed: 1.1};
const B = t => ` <break time="${t}s" /> `;
const TEXTO = 'Essa página tem cem seguidores.' + B(.5) +
  'No último episódio, a vila tinha cinquenta cabanas.' + B(.3) + 'E uma rua vazia, esperando.' + B(.6) +
  'Agora, chegaram mais cinquenta.' + B(.6) +
  'A rua de cima encheu primeiro.' + B(.5) +
  'Depois, abriram mais duas ruas.' + B(.3) + 'Mata adentro.' + B(.6) +
  'Até chegar na árvore.' + B(.4) + 'A da porta.' + B(.5) + 'Ninguém teve coragem de cortar.' + B(.6) +
  'Então, a vila desviou dela.' + B(.6) +
  'Cem moradores.' + B(.2) + 'Cem cabanas.' + B(.7) +
  'Mas cem pessoas comem muito.' + B(.4) + 'Então veio o píer.' + B(.3) + 'Os barcos.' + B(.3) + 'As redes.' + B(.6) +
  'E na ponta da praia, uma construção diferente.' + B(.4) + 'Um farol.' + B(.3) + 'Com uma casa embaixo.' + B(.3) + 'Ainda sem dono.' + B(.8) +
  'Na primeira noite com cem moradores,' + B(.3) + 'alguém viu uma luz...' + B(.4) + 'atrás da cachoeira.' + B(.7) +
  'Faltam novecentos seguidores pra cachoeira.' + B(.7) +
  'O comentário mais curtido desse vídeo vai morar no farol.' + B(.5) +
  'Segue a página.' + B(.3) + 'A próxima cabana pode ter o seu nome.';
fs.mkdirSync('voz/takes', {recursive: true});
for (let k = 1; k <= Number(process.argv[2] || 3); k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: TEXTO, model_id: 'eleven_multilingual_v2', voice_settings: SET, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/ep3-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/ep3-${k}.json`, JSON.stringify({voice_id: VOICE, voice_settings: SET, text: TEXTO, alignment: d.alignment}, null, 1));
  console.log('tomada', k);
}
