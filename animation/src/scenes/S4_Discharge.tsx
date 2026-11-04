import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera} from '../components/Camera';
import {Machine, Bucket} from '../components/Machine';
import {SeedStream} from '../components/Seeds';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {tween, useMs} from '../lib/motion';

/** 9480–13500 ms · Descarga: balde entra (0–0,7 s), calha gira (0,5 s), fluxo vermelho começa (1 s). */
export const S4Discharge: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Camera from={{s: 1.0, x: 0, y: 120, rx: 0, ry: -6}} to={{s: 1.12, x: 0, y: 160, rx: 3, ry: 4}} endMs={4020}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative'}}>
            <Machine led={1} chute={tween(ms, 500, 1100)} />
            <div style={{position: 'absolute', left: 190, top: 560, opacity: tween(ms, 0, 700), transform: `translateY(${(1 - tween(ms, 0, 700)) * 120}px)`}}>
              <Bucket width={380} fill={tween(ms, 1000, 4000, 0.05, 0.4)} />
            </div>
            <div style={{position: 'absolute', inset: 0}}>
              <SeedStream x0={300} y0={300} x1={380} y1={560} ms={ms} on={1000} off={3800} coat={1} n={120} size={8} spread={20} />
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Descarregue." color="#1d1d1f" size={150} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="03" label="Saída controlada" dark={false} startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
