import React from 'react';
import {random} from 'remotion';
import {C} from '../lib/theme';

const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};
export const seedColor = (coat: number, jitter = 0) => mix(C.seed, C.coated, Math.min(1, Math.max(0, coat + jitter)));

/** Sementes girando no tambor (vista de topo). Determinístico: sem Math.random. */
export const SeedField: React.FC<{size: number; ms: number; coat: number; n?: number; speed?: number}> = ({
  size, ms, coat, n = 260, speed = 0.9,
}) => {
  const R = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const r = Math.sqrt(random(`r${i}`)) * (R * 0.9);
        const a0 = random(`a${i}`) * Math.PI * 2;
        const a = a0 + (ms / 1000) * speed * (1.2 - r / R * 0.6);
        const sz = R * (0.035 + random(`s${i}`) * 0.02);
        return (
          <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} rx={sz * 1.25} ry={sz} fill={seedColor(coat, (random(`c${i}`) - 0.5) * 0.25)}
            transform={`rotate(${a * 57 + i * 13} ${Math.cos(a) * r} ${Math.sin(a) * r})`} opacity={0.95} />
        );
      })}
    </svg>
  );
};

/** Fluxo de sementes caindo em parábola: de (x0,y0) para (x1,y1). `ms` em ms; ativo entre on/off. */
export const SeedStream: React.FC<{x0: number; y0: number; x1: number; y1: number; ms: number; on: number; off: number; coat: number; n?: number; size?: number; spread?: number}> = ({
  x0, y0, x1, y1, ms, on, off, coat, n = 90, size = 9, spread = 26,
}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {Array.from({length: n}).map((_, i) => {
      const dur = 650 + random(`d${i}`) * 300;
      const t0 = on + random(`t${i}`) * (off - on);
      const p = (ms - t0) / dur;
      if (p < 0 || p > 1) return null;
      const jx = (random(`x${i}`) - 0.5) * spread * (0.3 + p);
      const x = x0 + (x1 - x0) * p + jx;
      const y = y0 + (y1 - y0) * (p * p * 0.85 + p * 0.15);
      return <ellipse key={i} cx={x} cy={y} rx={size * 1.25} ry={size} fill={seedColor(coat, (random(`k${i}`) - 0.5) * 0.2)} transform={`rotate(${p * 540 + i * 31} ${x} ${y})`} />;
    })}
  </svg>
);
