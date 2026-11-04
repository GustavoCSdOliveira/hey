import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {Color, InstancedMesh, Object3D, SphereGeometry} from 'three';
import {random} from 'remotion';

export type Seed = {p: [number, number, number]; r?: number; s?: number; coat: number; j?: number} | null;
const RAW = new Color('#d8b070');
const COATED = new Color('#c4261f');

/** Sementes como InstancedMesh (milhares de grãos por 1 draw call). `seeds` null = oculto. */
export const SeedInstances: React.FC<{seeds: Seed[]; size?: number}> = ({seeds, size = 0.055}) => {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new SphereGeometry(1, 10, 8), []);
  const dummy = useMemo(() => new Object3D(), []);
  const col = useMemo(() => new Color(), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    seeds.forEach((sd, i) => {
      if (!sd) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.0001); }
      else {
        dummy.position.set(...sd.p);
        dummy.rotation.set((sd.r ?? 0) + i, (sd.r ?? 0) * 1.7, i * 0.37);
        const sc = size * (sd.s ?? 1);
        dummy.scale.set(sc * 1.35, sc * 0.85, sc * 0.85);
        col.copy(RAW).lerp(COATED, Math.min(1, Math.max(0, sd.coat + (random(`j${i}`) - 0.5) * 0.25)));
        m.setColorAt(i, col);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, seeds.length]} castShadow frustumCulled={false}>
      <meshStandardMaterial roughness={0.32} metalness={0.05} />
    </instancedMesh>
  );
};

/** Fluxo balístico de sementes: origem → destino, ativo entre `on` e `off` (ms). */
export const streamSeeds = (ms: number, a: [number, number, number], b: [number, number, number], on: number, off: number, coat: number, n = 140, spread = 0.12): Seed[] =>
  Array.from({length: n}).map((_, i) => {
    const dur = 420 + random(`d${i}`) * 260;
    const t0 = on + random(`t${i}`) * (off - on);
    const p = (ms - t0) / dur;
    if (p < 0 || p > 1) return null;
    const jx = (random(`x${i}`) - 0.5) * spread * (0.4 + p);
    const jz = (random(`z${i}`) - 0.5) * spread * (0.4 + p);
    return {p: [a[0] + (b[0] - a[0]) * p + jx, a[1] + (b[1] - a[1]) * (p * p * 0.9 + p * 0.1), a[2] + (b[2] - a[2]) * p + jz], r: p * 9, coat};
  });

/** Camada de sementes girando dentro do tambor (raio R, altura y). */
export const drumSeeds = (ms: number, center: [number, number, number], R: number, coat: number, n = 650): Seed[] =>
  Array.from({length: n}).map((_, i) => {
    const r = Math.sqrt(random(`r${i}`)) * R;
    const a = random(`a${i}`) * Math.PI * 2 + (ms / 1000) * 1.1 * (1.25 - r / R * 0.6);
    const lift = Math.sin(a * 2 + i) * 0.04 + random(`h${i}`) * 0.1;
    return {p: [center[0] + Math.cos(a) * r, center[1] + lift, center[2] + Math.sin(a) * r], r: a, coat};
  });

/** Monte de sementes dentro do balde (coordenadas locais), `fill` 0–1. */
export const heapSeeds = (fill: number, coat: number, n = 700, R = 0.62, base = 0.12, maxH = 0.62): Seed[] =>
  Array.from({length: n}).map((_, i) => {
    if (i / n > fill) return null;
    const r = Math.sqrt(random(`hr${i}`)) * R * (1 - (i / n) * 0.15);
    const a = random(`ha${i}`) * Math.PI * 2;
    const y = base + (i / n) * maxH * (1 - (r / R) * 0.25);
    return {p: [Math.cos(a) * r, y, Math.sin(a) * r], coat};
  });
