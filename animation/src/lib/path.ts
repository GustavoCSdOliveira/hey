import {appleInOut, tween} from './motion';

export type V3 = [number, number, number];
/** Interpola vetores entre keyframes [ms, valor] com easing Apple in-out. */
export const path = <T extends number[]>(ms: number, keys: [number, T][]): T => {
  if (ms <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (ms <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, b] = keys[i];
      return a.map((v, j) => tween(ms, t0, t1, v, b[j], appleInOut)) as T;
    }
  }
  return keys[keys.length - 1][1];
};
export const path1 = (ms: number, keys: [number, number][]) => path(ms, keys.map(([t, v]) => [t, [v]] as [number, number[]]))[0];
export const path3 = (ms: number, keys: [number, V3][]): V3 => path<V3>(ms, keys);
