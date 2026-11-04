import React from 'react';
import {AbsoluteFill} from 'remotion';
import {tween, useMs, appleInOut} from '../lib/motion';

export type Pose = {s: number; x: number; y: number; rx: number; ry: number};
/** Câmera macro 3D: dolly (scale), pan (x,y) e órbita (rx,ry) entre duas poses com easing Apple. */
export const Camera: React.FC<{from: Pose; to: Pose; startMs?: number; endMs: number; children: React.ReactNode}> = ({
  from, to, startMs = 0, endMs, children,
}) => {
  const ms = useMs();
  const k = (a: number, b: number) => tween(ms, startMs, endMs, a, b, appleInOut);
  return (
    <AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 50%'}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate(${k(from.x, to.x)}px, ${k(from.y, to.y)}px) scale(${k(from.s, to.s)}) rotateX(${k(from.rx, to.rx)}deg) rotateY(${k(from.ry, to.ry)}deg)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Profundidade de campo: desfoque animado (rack focus). */
export const Focus: React.FC<{blur: number; children: React.ReactNode; style?: React.CSSProperties}> = ({blur, children, style}) => (
  <AbsoluteFill style={{filter: `blur(${blur}px)`, ...style}}>{children}</AbsoluteFill>
);
