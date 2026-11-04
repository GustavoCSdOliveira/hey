import React from 'react';
import {AbsoluteFill, random} from 'remotion';

/** Vinheta + grão fino de filme para dar corpo "hardware premium" sem banding. */
export const Finish: React.FC<{frame: number}> = ({frame}) => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
    <AbsoluteFill style={{opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' seed='${Math.floor(random(frame) * 100)}'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`}} />
  </>
);
