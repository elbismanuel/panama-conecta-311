// 04 · 24–32 s · También desde la web
// Placa BL a la derecha del riel (el titular aparece una sola vez, a la izquierda); un panel
// apagado nace sobre el monitor de la foto y vuela a la VENTANA; web_03 a 0,625 → encuadre
// de las dos columnas de tarjetas (≈ 0,949) con anillo externo en «Recolección - AAUD».
// El realce (tarjeta elevada) es opcional con ?realce=1: por defecto el resaltado es solo externo.
import { OBJ, ALTURA_VENTANA, VISTA, rectVentana } from '../../data/medidas.js';

export function registrar(P, C) {
  const { M } = C;
  // La foto entra cuando el teléfono de la 03 ya casi se fue (sin cruzarse con él).
  P.k('placaB.op', [[24.1, 0], [25.0, 1, 'expo.out'], [26.2, 1], [27.1, 0, 'power1.inOut']]);
  P.k('placaB.z', [[24.1, -200 * M], [25.0, 0, 'expo.out'], [26.2, 0], [27.4, -300 * M, 'power2.inOut']]);
  P.k('placaB.blur', [[24.1, 1], [25.0, 0, 'expo.out'], [26.2, 0], [27.4, 1, 'power2.inOut']]);
  P.k('placaB.dim', [[26.2, 1], [27.4, 0.4, 'power2.inOut']]);
  P.k('placaB.zoom', [[25.0, 1.0], [26.2, 1.03, 'sine.inOut']]);

  P.k('fondo.luz', [
    [24.8, [1150, 460, 700, 0.35], 'power2.inOut'],
    [26.2, [1150, 460, 700, 0.35]],
    [27.6, [1160, 470, 950, 0.3], 'power2.inOut'],
  ]);

  // Ventana: de 26,2 a 27,4 el rectángulo se deriva del monitor de la foto (director.js).
  // El alto pasa de la captura entera (675) al encuadre de las tarjetas (≈ 640) con la vista.
  P.k('ven.op', [[26.2, 0], [26.35, 1, 'power1.out']]);
  P.k('ven.rect', [
    [27.6, rectVentana(ALTURA_VENTANA.w03Completa)],
    [28.8, rectVentana(ALTURA_VENTANA.w03), 'expo.inOut'],
    [31.4, rectVentana(ALTURA_VENTANA.w03)],
    [32.2, rectVentana(ALTURA_VENTANA.w05d), 'expo.inOut'],
  ]);
  P.k('ven.bisel', [[26.2, 0.45], [27.4, 1, 'expo.inOut']]);
  P.k('ven.enc', [[26.9, 0], [27.4, 1, 'power2.out']]);
  // Solo x0, y0 y ancho: el alto de la vista sale de la proporción de la ventana (sin deformar).
  P.k('ven.v03', [[27.6, [0, 0, 1920]], [28.8, VISTA.w03Zoom.slice(0, 3), 'expo.inOut']]);
  // Cambio de página corto (0,3 s) por el fondo #F3F4F6 de la web.
  P.k('ven.mix35', [[31.85, 0], [32.15, 1, 'sine.inOut']]);
  P.k('ven.velo', [[29.0, 0], [29.6, 0.35, 'power2.inOut'], [31.2, 0.35], [31.6, 0, 'power2.in']]);

  // Realce opcional: como máximo 80 px de elevación (≈ 1,04, dentro del 105 %).
  if (C.realce) P.k('rea.z', [[29.6, 0], [30.2, 80 * M, 'power3.out'], [30.8, 80 * M], [31.2, 0, 'power2.inOut']]);

  P.k('anillo.op', [[28.7, 0], [28.8, 1, 'salto'], [31.0, 1], [31.4, 0, 'power2.in']]);
  P.k('anillo.prog', [[28.7, 1], [28.8, 0, 'salto'], [29.5, 1, 'power2.inOut']]);
  C.objetivo(28.8, 0, { tipo: 'ven', rect: OBJ.w03Aaud.r, corte: OBJ.w03Aaud.r, radio: OBJ.w03Aaud.radio, sep: 8 });
  if (C.realce) C.objetivo(29.6, 0, { tipo: 'rea', corte: OBJ.w03Aaud.r, radio: OBJ.w03Aaud.radio, sep: 8 });
}
