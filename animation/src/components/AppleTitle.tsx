import React from 'react';
import {FONT} from '../lib/theme';
import {critical, tween, useMs} from '../lib/motion';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Título por palavras: entra com mola crítica + blur, e o peso vai de Ultralight (100) a Bold (700). */
export const AppleTitle: React.FC<{
  text: string; startMs?: number; size?: number; color?: string;
  fromWeight?: number; toWeight?: number; align?: 'left' | 'center';
}> = ({text, startMs = 0, size = 150, color = '#fff', fromWeight = 100, toWeight = 700, align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = useMs();
  const weight = Math.round(tween(ms, startMs, startMs + 1400, fromWeight, toWeight));
  return (
    <div
      style={{
        fontFamily: FONT, fontSize: size, lineHeight: 1.02, color, textAlign: align,
        letterSpacing: '-0.045em', fontWeight: weight, display: 'flex', flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26,
      }}
    >
      {text.split(' ').map((w, i) => {
        const s = spring({frame: frame - ((startMs + i * 90) / 1000) * fps, fps, config: critical(110)});
        return (
          <span key={i} style={{opacity: s, transform: `translateY(${(1 - s) * 40}px)`, filter: `blur(${(1 - s) * 18}px)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{text: string; startMs?: number; color?: string}> = ({text, startMs = 0, color = 'rgba(255,255,255,0.6)'}) => {
  const ms = useMs();
  return (
    <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, letterSpacing: '0.18em', textTransform: 'uppercase', color, opacity: tween(ms, startMs, startMs + 700)}}>
      {text}
    </div>
  );
};
