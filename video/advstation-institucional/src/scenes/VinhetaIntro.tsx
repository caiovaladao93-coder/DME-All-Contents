import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vinheta} from '../components/Brand';
import {C} from '../theme/colors';
import {EASE_IO, prog} from '../theme/animation';

/**
 * ABERTURA — vinheta original da marca (mesmos tempos/easings de .asvv), sem título:
 * plataforma, A com mola, bolha, faíscas e "ADV STATION" letra a letra.
 * Saída: o marinho sobe a partir da plataforma dourada e abre a cena 01.
 */
export const VinhetaIntro: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = prog(f, 100, 20, EASE_IO);
  return (
    <AbsoluteFill>
      <Vinheta t0={0} />
      {wipe > 0 ? <AbsoluteFill style={{background: C.navy, clipPath: `inset(${(100 - wipe * 100).toFixed(2)}% 0 0 0)`}} /> : null}
    </AbsoluteFill>
  );
};
