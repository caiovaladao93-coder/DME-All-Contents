import React from 'react';
import {Composition, Still} from 'remotion';
import {SGCInstitutional} from './SGCInstitutional';
import {TOTAL} from './data/storyboard';
import {Cover} from './Cover';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SGCInstitutional" component={SGCInstitutional} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{subtitles: false, audio: true}} />
    <Composition id="SGCInstitutionalLegendado" component={SGCInstitutional} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{subtitles: true, audio: true}} />
    <Still id="SGCCover" component={Cover} width={1920} height={1080} />
  </>
);
