// 07 · 52–62 s · Aporta evidencia
// Zona de adjuntos con anillo sólido (no duplica el borde punteado), sin archivos
// simulados ni pulsaciones; «Registrar Caso» queda fuera del recorte.
// El anillo no cambia de objetivo mientras la vista se mueve: se apaga antes del
// alejamiento y se vuelve a trazar sobre las secciones con la vista ya quieta.
import { OBJ } from '../../data/medidas.js';

// Círculo de 120 px de captura en el centro de las secciones (640, 352): el anillo encoge
// a esta forma antes de soltarse de la ventana, para no viajar como un rectángulo grande.
const CENTRO_SECCION = [580, 292, 700, 412];

export function registrar(P, C) {
  const { M } = C;
  P.k('ven.z07', [[52.8, 0], [54.0, 1, 'expo.inOut'], [56.8, 1], [57.6, 0, 'expo.inOut']]);
  P.k('ven.velo', [[53.6, 0], [54.3, 0.35, 'power2.inOut'], [56.4, 0.35], [56.8, 0, 'power2.in']]);
  P.k('ven.op', [[61.4, 1], [62.2, 0, 'power2.in']]);
  P.k('ven.zr', [[61.2, 0], [62.4, -500 * M, 'power2.in']]);
  P.k('ven.rx', [[61.2, 0], [62.4, 6 * M, 'power2.in']]);

  P.k('fondo.luz', [
    [61.2, [1160, 470, 950, 0.3]],
    [62.6, [360, 540, 600, 0.4], 'power2.inOut'],
  ]);

  // Al encoger se atenúa (no debe parecer que señala otro elemento) y recupera la fuerza al volar.
  P.k('anillo.op', [
    [53.5, 0], [53.6, 1, 'salto'], [56.4, 1], [56.7, 0, 'power2.in'], [57.7, 0], [57.8, 1, 'salto'],
    [61.2, 1], [61.45, 0.3, 'power2.in'], [61.9, 1, 'power2.out'],
  ]);
  P.k('anillo.prog', [[53.5, 1], [53.6, 0, 'salto'], [54.3, 1, 'power2.inOut'], [57.7, 1], [57.8, 0, 'salto'], [58.5, 1, 'power2.inOut']]);
  C.objetivo(53.6, 0, { tipo: 'ven', rect: OBJ.w07Zona.r, corte: OBJ.w07ZonaCorte.r, radio: OBJ.w07Zona.radio, sep: 5, halo: [10, 0.26] });
  C.objetivo(57.8, 0, { tipo: 'ven', rect: OBJ.w07Seccion.r, radio: OBJ.w07Seccion.radio, sep: 6 });
  // El anillo encoge a un círculo sobre la ventana y de ahí vuela al nodo 1.
  C.objetivo(61.2, 0.5, { tipo: 'ven', rect: CENTRO_SECCION, radio: 60, sep: 0 });
  C.objetivo(61.7, 0.9, { tipo: 'nodo', i: 0, sep: 6 });
}
