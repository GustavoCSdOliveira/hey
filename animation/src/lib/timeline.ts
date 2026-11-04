// Linha do tempo em MILISSEGUNDOS, derivada do vídeo original (25.401 s, cortes detectados via ffmpeg).
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);

export type SceneKey = 'ignite' | 'load' | 'coat' | 'discharge' | 'macro' | 'finish' | 'logo';
export const SCENES: {key: SceneKey; start: number; end: number}[] = [
  {key: 'ignite', start: 0, end: 2000},
  {key: 'load', start: 2000, end: 5970},
  {key: 'coat', start: 5970, end: 9480},
  {key: 'discharge', start: 9480, end: 13500},
  {key: 'macro', start: 13500, end: 17000},
  {key: 'finish', start: 17000, end: 22350},
  {key: 'logo', start: 22350, end: 25401},
];
export const TOTAL_MS = 25401;
export const TOTAL_FRAMES = msToFrames(TOTAL_MS);
