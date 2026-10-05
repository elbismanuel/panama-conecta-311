// 09 · 72–82 s · La consulta también importa
// La tarjeta crece desde el nodo «Registrar» (plano SDF, esquinas sin deformar).
// Contenido editorial: título y tres líneas breves sacadas de la locución, sin barras de
// interfaz, estados ni progreso; no imita una pantalla de la app.
import { TARJETA } from '../../data/medidas.js';

// Entrada escalonada de las tres líneas (s): reparte el movimiento por toda la escena.
export const ENTRADA_LINEAS = [73.7, 75.3, 76.9];

export function registrar(P, C) {
  const { M } = C;
  const T = TARJETA;
  P.k('tar.op', [[71.2, 0], [71.5, 1, 'power2.out'], [81.2, 1], [82.0, 0, 'power2.in']]);
  P.k('tar.rect', [[71.2, [1500, 480, 120, 120]], [72.6, [T.x, T.y, T.w, T.h], 'expo.inOut']]);
  P.k('tar.radio', [[71.2, 60], [72.6, T.radio, 'expo.inOut']]);
  P.k('tar.z', [[81.2, 0], [82.0, -600 * M, 'power2.in']]);
  // Deriva muy leve (≤ 1°) para que la tarjeta no se vea torcida en reposo.
  P.k('tar.ry', [[73.0, 0], [80.6, 1 * M, 'sine.inOut'], [81.2, 1 * M], [82.0, 30 * M, 'power2.in']]);
  P.k('tar.rx', [[73.0, 0], [80.6, 0.5 * M, 'sine.inOut']]);
  P.k('tar.borde', [[72.6, 0], [73.0, 0.6, 'power2.inOut'], [81.0, 0.6], [81.4, 0, 'power2.in']]);
  // El brillo cruza la tarjeta cuando ya están las tres líneas (sin tramo muerto).
  P.k('tar.brillo', [[77.8, 0], [80.4, 1, 'sine.inOut']]);

  P.k('tarc.titulo', [[72.8, 0], [73.4, 1, 'power3.out']]);
  P.k('tarc.div', [[73.1, 0], [73.7, 1, 'power3.out']]);
  ENTRADA_LINEAS.forEach((t0, k) => P.k(`tarc.linea${k}`, [[t0, 0], [t0 + 0.7, 1, 'power3.out']]));
  P.k('tarc.sale', [[80.9, 0], [81.2, 1, 'power2.in']]);

  P.k('fondo.luz', [[72.6, [1356, 440, 700, 0.45], 'expo.inOut'], [81.2, [1356, 440, 700, 0.45]]]);

  // El anillo acompaña el crecimiento y cede su lugar al borde propio de la tarjeta.
  P.k('anillo.op', [[71.2, 1], [72.6, 0.6, 'power2.inOut'], [73.0, 0, 'power2.in']]);
  C.objetivo(71.2, 0, { tipo: 'tarjeta', sep: 6, sepFin: 0, t0: 72.0, t1: 72.6 });
}
