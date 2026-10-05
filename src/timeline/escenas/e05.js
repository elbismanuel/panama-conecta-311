// 05 · 32–42 s · Describe la situación
// web_05_detalle a 0,9375 → acercamiento a 1,0 alineado a píxel; anillo SOLO en el área
// de texto (el campo Teléfono queda velado y fuera del centro). El paso a la 06 es un
// cambio de página por el fondo #F3F4F6 de la web: nunca se ven filas de dos capturas a la vez.
import { OBJ, ALTURA_VENTANA, VISTA, rectVentana } from '../../data/medidas.js';

// Cambio de página 05 → 06: [inicio, fin] (la mitad de cada lado es una captura sola).
export const PASO_56 = [41.45, 42.05];

export function registrar(P, C) {
  P.k('ven.z05', [[34.4, 0], [35.6, 1, 'expo.inOut']]);
  // A sale a su tamaño acercado; la ventana crece mientras aparece B (sin relleno blanco).
  const altoZoom = VISTA.w05Zoom[3];
  P.k('ven.rect', [
    [32.4, rectVentana(ALTURA_VENTANA.w05d)],
    [41.4, rectVentana(altoZoom)],
    [41.75, rectVentana(altoZoom)],
    [42.25, rectVentana(ALTURA_VENTANA.w06d), 'power2.inOut'],
  ]);
  P.k('ven.mix56', [[PASO_56[0], 0], [PASO_56[1], 1, 'sine.inOut']]);
  P.k('ven.velo', [[35.6, 0], [36.2, 0.35, 'power2.inOut'], [41.0, 0.35], [41.3, 0, 'power2.in']]);

  P.k('anillo.op', [[35.3, 0], [35.4, 1, 'salto'], [41.0, 1], [41.3, 0, 'power2.in']]);
  P.k('anillo.prog', [[35.3, 1], [35.4, 0, 'salto'], [36.1, 1, 'power2.inOut']]);
  // Separación de 4 px: es el único hueco medido entre la etiqueta (y ≤ 432) y el área (y ≥ 440).
  C.objetivo(35.4, 0, { tipo: 'ven', rect: OBJ.w05Area.r, corte: OBJ.w05Corte.r, radio: OBJ.w05Area.radio, sep: 4, halo: [5, 0.16] });
}
