// 06 · 42–52 s · Ubica el caso (escala fija 0,9375, sin acercamiento)
// Selector → detalle de la ubicación → mapa. El marcador NO se anima (nada que sugiera GPS).
// Paso a la 07 por el fondo #F3F4F6 (sin mezclar filas de dos capturas).
import { OBJ, ALTURA_VENTANA, rectVentana } from '../../data/medidas.js';

// Cambio de página 06 → 07: [inicio, fin].
export const PASO_67 = [51.4, 52.0];

export function registrar(P, C) {
  P.k('ven.velo', [[43.0, 0], [43.7, 0.35, 'power2.inOut'], [51.0, 0.35], [51.3, 0, 'power2.in']]);
  // La ventana se acorta mientras sale A (A solo pierde filas); B aparece ya a su tamaño.
  P.k('ven.rect', [[51.3, rectVentana(ALTURA_VENTANA.w06d)], [51.65, rectVentana(ALTURA_VENTANA.w07d), 'power2.inOut']]);
  P.k('ven.mix67', [[PASO_67[0], 0], [PASO_67[1], 1, 'sine.inOut']]);

  P.k('anillo.op', [[42.9, 0], [43.0, 1, 'salto'], [51.0, 1], [51.3, 0, 'power2.in']]);
  P.k('anillo.prog', [[42.9, 1], [43.0, 0, 'salto'], [43.7, 1, 'power2.inOut']]);
  C.objetivo(43.0, 0, { tipo: 'ven', rect: OBJ.w06Selector.r, corte: OBJ.w06SelectorCorte.r, radio: OBJ.w06Selector.radio, sep: 5, halo: [9, 0.24] });
  C.objetivo(46.2, 0.8, { tipo: 'ven', rect: OBJ.w06Detalle.r, corte: OBJ.w06DetalleCorte.r, radio: OBJ.w06Detalle.radio, sep: 4, halo: [4, 0.14] });
  C.objetivo(48.6, 0.8, { tipo: 'ven', rect: OBJ.w06Mapa.r, corte: OBJ.w06MapaCorte.r, radio: OBJ.w06Mapa.radio, sep: 8 });
}
