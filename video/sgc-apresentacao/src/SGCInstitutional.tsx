import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {C} from './theme/colors';
import {loadFonts} from './theme/typography';
import {ORDER, SCENES, SceneKey} from './data/storyboard';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {BrandIntroduction} from './scenes/BrandIntroduction';
import {Questions} from './scenes/Questions';
import {Preview} from './scenes/Preview';
import {Unlock} from './scenes/Unlock';
import {PDF} from './scenes/PDF';
import {FinalCTA} from './scenes/FinalCTA';
import {SubtitleTrack} from './components/SubtitleTrack';

loadFonts();
const COMP: Record<SceneKey, React.FC> = {hook: Hook, problem: Problem, brand: BrandIntroduction, questions: Questions, preview: Preview, unlock: Unlock, pdf: PDF, cta: FinalCTA};
const OVERLAP = 16; // cada cena continua por baixo da seguinte durante a transição de entrada desta

export const SGCInstitutional: React.FC<{subtitles?: boolean; audio?: boolean}> = ({subtitles = false, audio = true}) => (
  <AbsoluteFill style={{background: C.navyNight}}>
    {ORDER.map((k, i) => {
      const S = COMP[k];
      const last = i === ORDER.length - 1;
      return <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].dur + (last ? 0 : OVERLAP)} name={k}><S /></Sequence>;
    })}
    {audio ? <>
      <Audio src={staticFile('assets/audio/trilha.wav')} />
      {ORDER.map((k) => <Sequence key={'v' + k} from={SCENES[k].from + SCENES[k].voice} name={'voz ' + k}>
        <Audio src={staticFile(`assets/audio/falas/${k}.mp3`)} volume={1} /></Sequence>)}
    </> : null}
    {subtitles ? <SubtitleTrack /> : null}
  </AbsoluteFill>
);
