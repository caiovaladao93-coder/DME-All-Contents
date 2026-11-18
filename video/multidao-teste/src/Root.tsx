import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import P from './data/plano.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Multidao" component={Film} durationInFrames={Math.round(P.dur * 30)} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
    <Still id="MultidaoCapa" component={Film} width={1080} height={1920} defaultProps={{audio: false, still: 0.4}} />
  </>
);
