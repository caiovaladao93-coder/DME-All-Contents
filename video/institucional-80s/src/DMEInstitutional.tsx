import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Grain, Vignette} from './components/CinematicImage';
import {loadFonts} from './components/Fonts';
import {GraphiteWipe} from './components/SceneTransition';
import {Subtitle} from './components/Subtitle';
import {ASSETS} from './data/assets';
import {APP_BLOCKS, OVERLAP, SCENES, TOTAL_FRAMES} from './data/scenes';
import {Scene01Hook} from './scenes/Scene01Hook';
import {Scene02Problems} from './scenes/Scene02Problems';
import {Scene03BrandIntroduction} from './scenes/Scene03BrandIntroduction';
import {Scene04Method} from './scenes/Scene04Method';
import {Scene05Solutions} from './scenes/Scene05Solutions';
import {Scene06Applications} from './scenes/Scene06Applications';
import {Scene07Benefits} from './scenes/Scene07Benefits';
import {Scene08Philosophy} from './scenes/Scene08Philosophy';
import {Scene09Signature} from './scenes/Scene09Signature';
import {Scene10CTA} from './scenes/Scene10CTA';
import {C} from './theme/colors';

loadFonts();

const ORDER: Array<[keyof typeof SCENES, React.FC]> = [
  ['s01Hook', Scene01Hook],
  ['s02Problems', Scene02Problems],
  ['s03Brand', Scene03BrandIntroduction],
  ['s04Method', Scene04Method],
  ['s05Solutions', Scene05Solutions],
  ['s06Applications', Scene06Applications],
  ['s07Benefits', Scene07Benefits],
  ['s08Philosophy', Scene08Philosophy],
  ['s09Signature', Scene09Signature],
  ['s10CTA', Scene10CTA],
];

export const DMEInstitutional: React.FC = () => {
  const s6 = SCENES.s06Applications.from;
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      {ORDER.map(([key, Comp]) => {
        const s = SCENES[key];
        const dur = Math.min(s.dur + OVERLAP, TOTAL_FRAMES - s.from);
        return (
          <Sequence key={key} name={key} from={s.from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}
      {/* trocas da cena 06 e entrada da 07: mesma máscara, mesma curva */}
      <GraphiteWipe at={s6 + APP_BLOCKS[1].from} />
      <GraphiteWipe at={s6 + APP_BLOCKS[2].from} />
      <GraphiteWipe at={SCENES.s07Benefits.from} />
      <Subtitle yFor={() => 1452} />
      <Vignette strength={0.45} />
      <Grain />
      {ASSETS.narration ? <Audio src={staticFile(ASSETS.narration)} /> : null}
      {ASSETS.music ? <Audio src={staticFile(ASSETS.music)} volume={0.25} /> : null}
    </AbsoluteFill>
  );
};
