import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DMEInstitucional16x9" component={Film} durationInFrames={TL.frames} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Still id="DMECapa" component={Film} width={1920} height={1080} defaultProps={{audio: false, still: 12.4}} />
  </>
);
