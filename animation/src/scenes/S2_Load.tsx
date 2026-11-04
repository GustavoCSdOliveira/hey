import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera} from '../components/Camera';
import {Machine} from '../components/Machine';
import {SeedStream} from '../components/Seeds';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {tween, useMs} from '../lib/motion';

/** 2000–5970 ms · Carga: tampa abre (0–0,8 s), sementes caem (0,7–2,4 s), tampa fecha (2,9–3,6 s). */
export const S2Load: React.FC = () => {
  const ms = useMs();
  const lid = tween(ms, 0, 800) * (1 - tween(ms, 2900, 3600));
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Camera from={{s: 1.0, x: 0, y: 120, rx: 0, ry: 6}} to={{s: 1.18, x: 0, y: 200, rx: 4, ry: -4}} endMs={3970}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative'}}>
            <Machine lid={lid} led={1} />
            <div style={{position: 'absolute', inset: 0}}>
              <SeedStream x0={330} y0={-120} x1={400} y1={170} ms={ms} on={700} off={2400} coat={0} n={110} size={9} />
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Carregue." color="#1d1d1f" size={170} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="01" label="Carga do lote" dark={false} startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
