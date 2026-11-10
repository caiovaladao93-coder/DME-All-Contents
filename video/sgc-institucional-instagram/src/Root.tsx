import React from 'react';
import {Composition, Still} from 'remotion';
import {SGCVertical} from './SGCVertical';
import {TOTAL} from './data/storyboard';
import {Cover} from './Cover';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SGCVertical" component={SGCVertical} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{subtitles: false, audio: true}} />
    <Composition id="SGCVerticalLegendado" component={SGCVertical} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{subtitles: true, audio: true}} />
    <Still id="SGCCover" component={Cover} width={1080} height={1920} />
  </>
);
