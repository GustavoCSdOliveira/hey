import React from 'react';
import {Glass} from './Glass';
import {FONT} from '../lib/theme';
import {tween, useMs, useSpringAt} from '../lib/motion';

/** Cartão de vidro "Etapa 0N" que desliza de baixo com mola crítica. */
export const StepChip: React.FC<{n: string; label: string; startMs?: number; dark?: boolean}> = ({n, label, startMs = 300, dark = true}) => {
  const s = useSpringAt(startMs, 100);
  const ms = useMs();
  const bar = tween(ms, startMs, startMs + 1800);
  const fg = dark ? '#fff' : '#1d1d1f';
  return (
    <Glass dark={dark} style={{width: 520, padding: '30px 38px', opacity: s, transform: `translateY(${(1 - s) * 80}px)`}}>
      <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 600, letterSpacing: '0.16em', color: fg, opacity: 0.55}}>ETAPA {n}</div>
      <div style={{fontFamily: FONT, fontSize: 54, fontWeight: 300, letterSpacing: '-0.03em', color: fg, marginTop: 6}}>{label}</div>
      <div style={{height: 3, borderRadius: 2, background: 'rgba(128,128,128,0.3)', marginTop: 22}}>
        <div style={{height: 3, borderRadius: 2, width: `${bar * 100}%`, background: fg}} />
      </div>
    </Glass>
  );
};
