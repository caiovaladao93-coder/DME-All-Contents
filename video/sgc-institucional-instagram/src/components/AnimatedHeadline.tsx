import React from 'react';
import {C} from '../theme/colors';
import {HEAD} from '../theme/typography';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';

/**
 * Título palavra a palavra (máscara por palavra). Palavras entre [colchetes] ficam em laranja.
 * Linhas separadas por "|". sheenAt: quadro em que um reflexo sutil atravessa as palavras em laranja.
 */
export const AnimatedHeadline: React.FC<{f: number; start: number; text: string; size: number; weight?: number; color?: string; accent?: string;
  stagger?: number; out?: number; sheenAt?: number; align?: 'left' | 'center' | 'right'; tracking?: string; lineHeight?: number; style?: React.CSSProperties}> =
  ({f, start, text, size, weight = 800, color = C.white, accent = C.orange, stagger = 3, out, sheenAt, align = 'left', tracking = '-0.02em', lineHeight = 1.04, style}) => {
    let i = 0; let acc = false;
    const q = out != null ? prog(f, out, 12, EASE_IN) : 0;
    return (
      <div style={{fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight, letterSpacing: tracking, color, textAlign: align, ...style}}>
        {text.split('|').map((line, li) => (
          <div key={li} style={{whiteSpace: 'nowrap'}}>
            {line.split(' ').filter(Boolean).map((raw, wi) => {
              let w = raw; if (w.startsWith('[')) { acc = true; w = w.slice(1); }
              let end = false; if (w.includes(']')) { end = true; w = w.replace(']', ''); }
              const isAcc = acc; if (end) acc = false;
              const p = prog(f, start + (i++) * stagger, 16, EASE_OUT);
              const sheen = sheenAt != null && isAcc ? prog(f, sheenAt, 24, (t) => t) : -1;
              const accStyle: React.CSSProperties = isAcc ? (sheen > 0 && sheen < 1 ? {
                backgroundImage: `linear-gradient(100deg, ${accent} ${sheen * 160 - 40}%, #FFD2B5 ${sheen * 160 - 20}%, ${accent} ${sheen * 160}%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: accent}) : {};
              return (
                <span key={wi} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.1em', marginRight: '0.24em'}}>
                  <span style={{display: 'inline-block', transform: `translateY(${((1 - p) * 125 - q * 30).toFixed(2)}%)`, opacity: Math.min(1, p * 5) * (1 - q), ...accStyle}}>{w}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
