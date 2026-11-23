// Narração do ep. 2 de SARAMAR ("A vila") numa tomada só, com <break> e alinhamento por caractere.
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz_ep2.mjs [n_tomadas]
import fs from 'fs';
const VOICE = 'wcRzlqRM8P8rr8ZZsd9h'; // Saramar Narrador (Voice Design)
const SET = {stability: 0.5, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true, speed: 1.1};
const B = t => ` <break time="${t}s" /> `;
const TEXTO = 'Essa página tem cinquenta seguidores.' + B(.5) +
  'No último episódio, Saramar tinha dois moradores e uma cabana.' + B(.4) + 'Agora, chegaram mais quarenta e oito.' + B(.6) +
  'E dessa vez, ninguém ia construir de qualquer jeito.' + B(.6) +
  'Primeiro, abriram espaço.' + B(.4) + 'Só o necessário.' + B(.5) +
  'Cada árvore derrubada virou madeira pra uma casa.' + B(.6) +
  'Depois, os dois mais antigos marcaram as ruas.' + B(.3) +
  'E dividiram lotes pequenos, um do lado do outro, pra sobrar lugar pra quem ainda vai chegar.' + B(.6) +
  'E aí, cada um construiu a sua cabana.' + B(.4) + 'Rua por rua.' + B(.3) + 'Cada uma com o nome do seu dono.' + B(.5) +
  'No meio, uma praça.' + B(.3) + 'Um poço, cavado à mão.' + B(.3) + 'E uma horta pra todo mundo.' + B(.5) +
  'Cinquenta moradores.' + B(.2) + 'Cinquenta cabanas.' + B(.3) + 'E ainda sobra muita ilha.' + B(.8) +
  'Mas lembra da garrafa que o mar trouxe?' + B(.5) + 'Dentro dela, tinha um mapa.' + B(.4) +
  'Um mapa antigo, que mostra o que a ilha realmente esconde.' + B(.4) +
  'E cada segredo pede muito mais gente do que a gente imaginava.' + B(.4) +
  'Mil seguidores, pra cachoeira.' + B(.3) + 'Cem mil, pro rosto de pedra.' + B(.4) +
  'E o que vive no fundo do mar...' + B(.4) + 'ninguém sabe.' + B(.7) +
  'Segue a página.' + B(.3) + 'A próxima cabana pode ter o seu nome.';
fs.mkdirSync('voz/takes', {recursive: true});
for (let k = 1; k <= Number(process.argv[2] || 3); k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: TEXTO, model_id: 'eleven_multilingual_v2', voice_settings: SET, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/ep2v2-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/ep2v2-${k}.json`, JSON.stringify({voice_id: VOICE, voice_settings: SET, text: TEXTO, alignment: d.alignment}, null, 1));
  console.log('tomada', k);
}
