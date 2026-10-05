// 10 · 82–90 s · Cierre institucional
// Acto A: teléfono (mobile_02) y portátil (web_01) sobre azul profundo, sin titular.
// Acto B: frase final y logos originales. Los dispositivos terminan de salir (85,9 s)
// antes de que se revele la frase (86,2 s): nunca hay texto sobre las pantallas.
// De 89 a 90 s, quietud total.
import { CIERRE } from '../../data/medidas.js';

export function registrar(P, C) {
  const { M } = C;
  const T = CIERRE.telefono;
  const L = CIERRE.portatil;
  P.k('tel.op', [[81.9, 0], [82.9, 1, 'power2.out'], [85.0, 1], [85.9, 0, 'power2.in']]);
  P.k('tel.pose', [
    [81.9, [T.cx, T.cy + 120 * M, -400 * M, T.escala, 0, T.ry + 8 * M, 0], 'salto'],
    [83.6, [T.cx, T.cy, 0, T.escala, 0, T.ry, 0], 'power3.out'],
    [85.0, [T.cx, T.cy, 24 * M, T.escala, 0, T.ry, 0]],
    [85.9, [T.cx, T.cy + 40 * M, -300 * M, T.escala, 0, T.ry, 0], 'power2.in'],
  ]);
  P.k('lap.op', [[82.1, 0], [83.1, 1, 'power2.out'], [85.0, 1], [85.9, 0, 'power2.in']]);
  P.k('lap.pose', [
    [82.1, [L.cx, L.cy + 120 * M, -400 * M, L.ry - 8 * M]],
    [83.8, [L.cx, L.cy, 0, L.ry], 'power3.out'],
    [85.0, [L.cx, L.cy, 24 * M, L.ry]],
    [85.9, [L.cx, L.cy + 40 * M, -300 * M, L.ry], 'power2.in'],
  ]);
  P.k('fondo.luz', [
    [82.4, [1000, 720, 1000, 0.4], 'power2.inOut'],
    [85.0, [1000, 720, 1000, 0.4]],
    [86.0, [960, 520, 900, 0.15], 'power2.inOut'],
  ]);
  P.k('fondo.vineta', [[81.8, 0], [82.8, 1, 'power2.inOut'], [85.0, 1], [86.0, 0, 'power2.inOut']]);
  P.k('fondo.horiz', [[81.8, 0], [82.8, 1, 'power2.inOut'], [85.0, 1], [86.0, 0, 'power2.inOut']]);
  P.k('logos.op', [[86.6, 0], [87.4, 1, 'power2.out']]);
}
