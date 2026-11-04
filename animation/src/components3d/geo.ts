import {ExtrudeGeometry, Shape} from 'three';

/** Caixa com bordas arredondadas (bevel), centrada na origem. */
export const roundedBoxGeo = (w: number, h: number, d: number, r = 0.08) => {
  const s = new Shape();
  const x = (w - 2 * r) / 2;
  const y = (h - 2 * r) / 2;
  s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(-x, y); s.closePath();
  const g = new ExtrudeGeometry(s, {depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 5, curveSegments: 8});
  g.translate(0, 0, -(d - 2 * r) / 2);
  return g;
};
