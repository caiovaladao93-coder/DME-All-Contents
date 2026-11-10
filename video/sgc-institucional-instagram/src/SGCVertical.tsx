import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {C} from './theme/colors';
import {loadFonts} from './theme/typography';
import {ORDER, SCENES, SceneKey} from './data/storyboard';
import {S1Intuicao} from './scenes/S1Intuicao';
import {S2QuemSomos} from './scenes/S2QuemSomos';
import {S3Diagnostico} from './scenes/S3Diagnostico';
import {S4Plano} from './scenes/S4Plano';
import {S5Acompanhamento} from './scenes/S5Acompanhamento';
import {S6Filosofia} from './scenes/S6Filosofia';
import {S7Assinatura} from './scenes/S7Assinatura';
import {SubtitleTrack} from './components/SubtitleTrack';

loadFonts();
const COMP: Record<SceneKey, React.FC> = {s1: S1Intuicao, s2: S2QuemSomos, s3: S3Diagnostico, s4: S4Plano, s5: S5Acompanhamento, s6: S6Filosofia, s7: S7Assinatura};
const OVERLAP = 16; // cada cena continua por baixo da seguinte durante a transição

export const SGCVertical: React.FC<{subtitles?: boolean; audio?: boolean}> = ({subtitles = false, audio = true}) => (
  <AbsoluteFill style={{background: C.navyNight}}>
    {ORDER.map((k, i) => <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].dur + (i === ORDER.length - 1 ? 0 : OVERLAP)} name={k}>{React.createElement(COMP[k])}</Sequence>)}
    {audio ? <>
      <Audio src={staticFile('assets/audio/trilha.wav')} />
      {ORDER.map((k) => <Sequence key={'v' + k} from={SCENES[k].from + SCENES[k].voice} name={'voz ' + k}><Audio src={staticFile(`assets/audio/falas/${k}.mp3`)} /></Sequence>)}
    </> : null}
    {subtitles ? <SubtitleTrack /> : null}
  </AbsoluteFill>
);
