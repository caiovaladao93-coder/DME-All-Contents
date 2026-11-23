// Narração do ep. 1 de SARAMAR numa tomada só, com <break> e alinhamento por caractere (with-timestamps).
// A chave NÃO fica no código: o proxy do ambiente injeta o cabeçalho xi-api-key.
// Uso: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/gerar_voz.mjs [n_tomadas]
import fs from 'fs';
const VOICE = 'wcRzlqRM8P8rr8ZZsd9h'; // Saramar Narrador (Voice Design)
const SET = {stability: 0.5, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true, speed: 1.1};
const B = t => ` <break time="${t}s" /> `;
const TEXTO = 'Essa página tem dois seguidores.' + B(.5) + 'E aqui, cada seguidor vira um morador.' + B(.6) +
  'Essa é Saramar, uma ilha cercada de segredos que ninguém desvendou.' + B(.6) +
  'Uma cachoeira que esconde uma caverna.' + B(.3) + 'Um templo engolido pela lagoa.' + B(.3) + 'Pedras que ninguém sabe quem ergueu.' + B(.3) +
  'Uma árvore com uma porta.' + B(.4) + 'E, no fundo do mar...' + B(.4) + 'alguma coisa se mexe.' + B(.8) +
  'Mas, por enquanto, tudo o que existe é uma praia, dois moradores e uma fogueira.' + B(.6) +
  'Um deles junta a madeira que o mar trouxe.' + B(.3) + 'O outro limpa a areia e ergue as primeiras paredes.' + B(.5) +
  'É a primeira cabana.' + B(.3) + 'O primeiro acampamento.' + B(.6) +
  'Não tem porto, não tem farol.' + B(.4) + 'Só os dois...' + B(.3) + 'e o mar inteiro pela frente.' + B(.8) +
  'Mas toda vila começou assim.' + B(.7) +
  'A cada novo seguidor, Saramar cresce.' + B(.3) + 'Mais cabanas, barcos, pescadores...' + B(.2) + 'um farol...' + B(.3) +
  'até chegarmos aos segredos da ilha.' + B(.6) + 'Cada meta de seguidores abre um lugar novo do mapa.' + B(.6) + 'Segue a página.' + B(.3) + 'A próxima cabana pode ser a sua.';
fs.mkdirSync('voz/takes', {recursive: true});
for (let k = 1; k <= Number(process.argv[2] || 3); k++) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: {'xi-api-key': 'proxy-injected', 'content-type': 'application/json'},
    body: JSON.stringify({text: TEXTO, model_id: 'eleven_multilingual_v2', voice_settings: SET, language_code: 'pt'})});
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const d = await r.json();
  fs.writeFileSync(`voz/takes/ep1v3-${k}.mp3`, Buffer.from(d.audio_base64, 'base64'));
  fs.writeFileSync(`voz/takes/ep1v3-${k}.json`, JSON.stringify({voice_id: VOICE, voice_settings: SET, text: TEXTO, alignment: d.alignment}, null, 1));
  console.log('tomada', k);
}
