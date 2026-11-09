import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {DarkVignette, Grain} from './components/Atmosphere';
import {loadFonts} from './components/Fonts';
import {SubtitleTrack} from './components/SubtitleTrack';
import {AUDIO} from './data/assets';
import {OVERLAP, SCENES, SceneKey, TOTAL_FRAMES} from './data/storyboard';
import {BrandIntroduction} from './scenes/BrandIntroduction';
import {BrandSignature} from './scenes/BrandSignature';
import {BusinessValue} from './scenes/BusinessValue';
import {HumanExperience} from './scenes/HumanExperience';
import {LegalComplexity} from './scenes/LegalComplexity';
import {MaternidadeLegal} from './scenes/MaternidadeLegal';
import {Opening} from './scenes/Opening';
import {PrevidenciarioGeral} from './scenes/PrevidenciarioGeral';
import {TwoProducts} from './scenes/TwoProducts';
import {VinhetaIntro} from './scenes/VinhetaIntro';
import {C} from './theme/colors';

loadFonts();

const ORDER: Array<[SceneKey, React.FC]> = [
  ['intro', VinhetaIntro], ['opening', Opening], ['complexity', LegalComplexity], ['brand', BrandIntroduction], ['maternidade', MaternidadeLegal],
  ['previdenciario', PrevidenciarioGeral], ['twoProducts', TwoProducts], ['value', BusinessValue], ['human', HumanExperience], ['signature', BrandSignature],
];

export const ADVStationFilm: React.FC = () => (
  <AbsoluteFill style={{background: C.navy}}>
    {ORDER.map(([k, Comp]) => {
      const s = SCENES[k];
      return (
        <Sequence key={k} name={k} from={s.from} durationInFrames={Math.min(s.dur + OVERLAP, TOTAL_FRAMES - s.from)}>
          <Comp />
        </Sequence>
      );
    })}
    <SubtitleTrack />
    <DarkVignette strength={0.35} />
    <Grain />
    {AUDIO.narration ? <Audio src={staticFile(AUDIO.narration)} /> : null}
    {AUDIO.music ? <Audio src={staticFile(AUDIO.music)} volume={0.3} /> : null}
  </AbsoluteFill>
);
