import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {C} from './theme/colors';
import {loadFonts} from './components/Fonts';
import {ORDER, SCENES, SceneKey, VOICED} from './data/storyboard';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, SVinheta} from './scenes/Scenes';
import {Captions} from './components/Captions';

loadFonts();
const COMP: Record<SceneKey, React.FC> = {vin: SVinheta, v1: S1, v2: S2, v3: S3, v4: S4, v5: S5, v6: S6, v7: S7, v8: S8, v9: S9};
const OVERLAP = 16; // a cena anterior continua por baixo da entrada da seguinte

export const ADVReels: React.FC<{audio?: boolean; captions?: boolean}> = ({audio = true, captions = false}) => (
  <AbsoluteFill style={{background: C.navy}}>
    {ORDER.map((k, i) => <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].dur + (i === ORDER.length - 1 ? 0 : OVERLAP)} name={k}>{React.createElement(COMP[k])}</Sequence>)}
    {audio ? <>
      <Audio src={staticFile('assets/audio/trilha.wav')} />
      {VOICED.map((k) => <Sequence key={'a' + k} from={SCENES[k].from + (SCENES[k].voice ?? 0)} name={'voz ' + k}><Audio src={staticFile(`assets/audio/falas/${k}.mp3`)} /></Sequence>)}
    </> : null}
    {captions ? <Captions /> : null}
  </AbsoluteFill>
);
