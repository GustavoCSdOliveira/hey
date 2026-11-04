import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../lib/theme';
import {tween, useMs, useSpringAt} from '../lib/motion';

/** 22350–25401 ms · Logo (branco puro, como no vídeo original): frasco + wordmark. */
export const S7Logo: React.FC = () => {
  const ms = useMs();
  const s = useSpringAt(250, 90);
  const w = tween(ms, 500, 1500, 100, 800);
  return (
    <AbsoluteFill style={{background: '#fff', alignItems: 'center', justifyContent: 'center', opacity: tween(ms, 0, 400)}}>
      <div style={{transform: `scale(${0.9 + s * 0.1}) translateY(${(1 - s) * 30}px)`, opacity: s, textAlign: 'center'}}>
        <svg width="190" height="220" viewBox="0 0 100 116">
          <circle cx="50" cy="26" r="20" fill="none" stroke="#1d4fa8" strokeWidth="7" />
          <path d="M30 40 L8 98 Q4 112 20 112 H80 Q96 112 92 98 L70 40 Z" fill="none" stroke="#1d4fa8" strokeWidth="7" strokeLinejoin="round" />
          <path d="M20 84 Q50 70 80 84 L88 100 Q90 108 80 108 H20 Q10 108 12 100 Z" fill="#8cc63f" />
        </svg>
        <div style={{fontFamily: FONT, fontSize: 150, letterSpacing: '-0.045em', fontWeight: w, color: '#1d4fa8', marginTop: 20}}>
          DICA<span style={{color: '#8cc63f'}}>LAB</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
