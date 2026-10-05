// 03 · 16–24 s · Encuentra el servicio
// Primer plano del teléfono (captura a 0,44), anillo EXTERNO en «Recursos Ambientales»
// y velo suave fuera del recorte; salida con giro fuerte (solo en la transición).
// El teléfono queda más alto y la viñeta inferior empieza antes (y 690): la caja de
// subtítulos se apoya sobre fondo oscuro y no compite con las filas de la captura.
import { OBJ, VINETA } from '../../data/medidas.js';

export const POSE_03 = [1400, 636, 0, 1.56, 0, -2, 0];

export function registrar(P, C) {
  const { M } = C;
  const [x, y, , s] = POSE_03;
  P.k('tel.pose', [
    [16.6, POSE_03, 'power3.inOut'],
    [23.4, POSE_03],
    [24.4, [x + 300 * M, y, -500 * M, s, 0, -40 * M, 0], 'power2.in'],
  ]);
  // Cambio de pantalla corto (0,25 s) mientras el teléfono aún es pequeño.
  P.k('tel.mix', [[15.45, 0], [15.7, 1, 'sine.inOut']]);
  P.k('tel.velo', [[18.4, 0], [19.0, 0.35, 'power2.inOut'], [23.2, 0.35], [23.5, 0, 'power2.in']]);
  P.k('tel.op', [[24.0, 1], [24.4, 0, 'power2.in']]);

  P.k('fondo.luz', [
    [16.6, [1400, 600, 760, 0.45], 'power3.inOut'],
    [23.4, [1400, 600, 760, 0.45]],
  ]);
  P.k('fondo.vineta', [[23.4, 1], [24.4, 0, 'power2.inOut']]);
  P.k('fondo.vinetaY', [
    [15.6, VINETA.normal],
    [16.8, VINETA.escena03, 'power2.inOut'],
    [24.4, VINETA.escena03],
    [24.5, VINETA.normal, 'salto'],
  ]);

  P.k('anillo.op', [[18.1, 0], [18.2, 1, 'salto'], [23.2, 1], [23.5, 0, 'power2.in']]);
  P.k('anillo.prog', [[18.2, 0], [18.9, 1, 'power2.inOut']]);
  C.objetivo(18.2, 0, { tipo: 'tel', rect: OBJ.m02Recursos.r, corte: OBJ.m02Recursos.r, radio: OBJ.m02Recursos.radio, sep: 6 });
}
