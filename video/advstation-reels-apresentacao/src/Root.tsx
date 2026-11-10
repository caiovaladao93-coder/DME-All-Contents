import React from 'react';
import {Composition, Still} from 'remotion';
import {ADVReels} from './ADVReels';
import {TOTAL} from './data/storyboard';
import {Cover} from './Cover';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ADVReels" component={ADVReels} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{audio: true, captions: false}} />
    <Composition id="ADVReelsLegendado" component={ADVReels} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{audio: true, captions: true}} />
    <Still id="ADVCapa" component={Cover} width={1080} height={1920} />
  </>
);
