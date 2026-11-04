import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** cubic-bezier(0.25, 1, 0.5, 1) — o "easeOutQuart" suave usado como assinatura. */
export const apple = Easing.bezier(0.25, 1, 0.5, 1);
export const appleInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Mola criticamente amortecida: damping = 2·√(k·m) → sem overshoot, desaceleração orgânica. */
export const critical = (stiffness = 120, mass = 1) => ({
  stiffness,
  mass,
  damping: 2 * Math.sqrt(stiffness * mass),
});

/** Tempo local da cena em ms. */
export const useMs = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (frame / fps) * 1000;
};

/** Interpola `ms` de [t0,t1] para [a,b] com easing Apple (clamp). */
export const tween = (ms: number, t0: number, t1: number, a = 0, b = 1, easing = apple) =>
  interpolate(ms, [t0, t1], [a, b], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Mola crítica 0→1 iniciando em `startMs`. */
export const useSpringAt = (startMs: number, stiffness = 120) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - (startMs / 1000) * fps, fps, config: critical(stiffness)});
};
