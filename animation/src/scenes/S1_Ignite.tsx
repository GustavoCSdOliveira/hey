import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera} from '../components/Camera';
import {Machine} from '../components/Machine';
import {AppleTitle, Eyebrow} from '../components/AppleTitle';
import {tween, useMs} from '../lib/motion';

/** 0–2000 ms · Ignição: máquina emerge do preto, LED liga (botão no vídeo original ~0,6 s). */
export const S1Ignite: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="dark" />
      <Camera from={{s: 0.88, x: 0, y: 140, rx: 8, ry: -10}} to={{s: 1.0, x: 0, y: 100, rx: 2, ry: 0}} endMs={2000}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: tween(ms, 0, 700)}}>
          <Machine led={tween(ms, 700, 1100)} />
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170, gap: 26}}>
        <Eyebrow text="Tratador de sementes" startMs={200} />
        <AppleTitle text="DICALAB" startMs={350} size={190} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
