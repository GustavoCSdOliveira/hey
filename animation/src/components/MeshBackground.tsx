import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../lib/theme';

/** Mesh gradient metálico fluido: radiais que derivam lentamente, simulando softboxes de estúdio. */
export const MeshBackground: React.FC<{tone: 'dark' | 'light'}> = ({tone}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const dark = tone === 'dark';
  const a = dark ? '#3a3a3f' : '#ffffff';
  const b = dark ? '#16161a' : '#d9d9de';
  const base = dark ? C.black : C.mist;
  const p = (i: number, r: number) => 50 + Math.sin(t * 0.35 + i * 2.1) * r;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 45% at ${p(0, 18)}% ${p(1, 10)}%, ${a} 0%, transparent 70%),
                     radial-gradient(55% 40% at ${p(2, 22)}% ${80 + Math.sin(t * 0.3) * 6}%, ${b} 0%, transparent 72%),
                     radial-gradient(40% 30% at ${p(3, 30)}% 20%, ${dark ? '#2a2a30' : '#f5f5f7'} 0%, transparent 70%),
                     ${base}`,
      }}
    />
  );
};
