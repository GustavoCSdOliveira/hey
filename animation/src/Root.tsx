import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH, msToFrames} from './lib/timeline';
import {Finish} from './components/Finish';
import {S1Ignite} from './scenes/S1_Ignite';
import {S2Load} from './scenes/S2_Load';
import {S3Coat} from './scenes/S3_Coat';
import {S4Discharge} from './scenes/S4_Discharge';
import {S5Macro} from './scenes/S5_Macro';
import {S6Finish} from './scenes/S6_Finish';
import {S7Logo} from './scenes/S7_Logo';

const MAP = {ignite: S1Ignite, load: S2Load, coat: S3Coat, discharge: S4Discharge, macro: S5Macro, finish: S6Finish, logo: S7Logo};

const Main: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('audio/original.m4a')} volume={0.35} />
      {SCENES.map(({key, start, end}) => {
        const Scene = MAP[key];
        return (
          <Sequence key={key} from={msToFrames(start)} durationInFrames={msToFrames(end) - msToFrames(start)} name={key}>
            <Scene />
          </Sequence>
        );
      })}
      {frame < msToFrames(22350) && <Finish frame={frame} />}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
