import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OBilheteEp1" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
    <Still id="OBilheteCapa" component={Film} width={1080} height={1920} defaultProps={{audio: false, still: 4.3}} />
  </>
);
