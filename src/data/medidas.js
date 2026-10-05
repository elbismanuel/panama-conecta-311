// Medidas fijas: retícula del DISEÑO DE REFERENCIA 16:9 (1920×1080 lógicos) y coordenadas
// medidas sobre los PNG originales. Todas las medidas de captura están en píxeles de la propia
// captura; los rectángulos son [x0, y0, x1, y1) con el extremo final excluido.
//
// La composición de cada pantalla NO se lee de aquí directamente: src/data/composicion.js la
// calcula a partir del tamaño real de la ventana (y en 16:9 devuelve exactamente estas ranuras).

export const ANCHO = 1920;
export const ALTO = 1080;
export const DURACION = 90;

// --- Diseño de referencia 16:9 (base de composicion.js) ------------------------------------

// Margen seguro del 8 %: todo el texto vive dentro.
export const SEGURO = { x0: 154, x1: 1766, y0: 86, y1: 994 };

export const RANURAS = {
  placa: { x: 154, y: 232, w: 822, h: 456 }, // fotos TL / TR a escala 1,0
  // Foto BL a la derecha del riel (el titular de la 04 aparece una sola vez, a la izquierda);
  // su centro (1151) casi coincide con el de la ventana (1162), que nace de su monitor.
  placaBL: { x: 740, y: 230, w: 822, h: 459 },
  derecha: { x0: 1072, x1: 1766, cy: 460 },
  izquierda: { x0: 154, x1: 1050, cy: 460 },
  riel: { x0: 154, x1: 514, top: 340 },
  libre: { x0: 154, x1: 1766, top: 150 }, // titular de la 08 (encima de la gráfica)
  centro: { x0: 154, x1: 1766, top: 370 }, // frase final de la 10
  // La ventana se centra en vertical (cy 486) en la banda útil: arriba cabe el rótulo DEMO
  // (y 86–124) sobre el bisel y abajo queda aire hasta la caja de subtítulos de dos líneas
  // (y ≥ 863). Con la ventana más alta (web_06, 705 px) el bisel va de 123,5 a 848,5.
  ventana: { x: 562, cy: 486, w: 1200 },
};

// Rectángulo [x, y, w, h] de la ventana 16:9 para un alto dado (centrado en RANURAS.ventana.cy).
export function rectVentana(h) {
  return [RANURAS.ventana.x, RANURAS.ventana.cy - h / 2, RANURAS.ventana.w, h];
}

// Rótulos de honestidad: alto de la píldora y separación con su imagen (px lógicos, a 22 px).
export const ROTULO = { alto: 38, separacion: 6, margen: 16, tam: 22 };

// Subtítulos 16:9: borde inferior de la caja en y 986, letra de 36 px, ancho máximo 1240.
export const SUBS = { bajo: 986, tam: 36, ancho: 1240, altoCaja: 123 };

// Viñeta inferior en espacio de pantalla: [inicio y, recorrido] en px lógicos.
export const VINETA = { normal: [780, 300], escena03: [670, 190] };

// Escena 08: nodos del flujo.
export const NODOS = { x: [360, 760, 1160, 1560], y: 540, diametro: 120, grosor: 16 };
export const CONECTORES = [
  [436, 684],
  [836, 1084],
  [1236, 1484],
];

// Escena 09: tarjeta editorial.
export const TARJETA = { x: 946, y: 190, w: 820, h: 500, radio: 24 };
// Contenido editorial de la tarjeta (px dentro de la tarjeta de 820×500).
export const TARJETA_CONTENIDO = { margen: 56, primeraLinea: 184, paso: 88 };

// Escena 10: dispositivos del cierre.
export const CIERRE = {
  telefono: { cx: 430.5, cy: 480, escala: 0.92, ry: 4 },
  portatil: { cx: 1180, cy: 470, ry: -3 },
};

// Logos originales: tamaño del PNG, alto de presentación en 16:9 y caja de contenido visible
// medida sobre el canal alfa (x0, y0, x1, y1). Las URL y los textos alternativos están en recursos.js.
export const LOGOS_MEDIDAS = [
  { id: 'pc', w: 1948, h: 377, alto: 84, caja: [19, 9, 1899, 355] },
  { id: '311', w: 813, h: 441, alto: 110, caja: [47, 17, 766, 371] },
  { id: 'aig', w: 2682, h: 639, alto: 96, caja: [109, 93, 2572, 546] },
];

// --- Medidas de los PNG (no dependen de la pantalla) ----------------------------------------

// Recortes de la referencia generada por IA (con 4 px de margen frente a las franjas).
export const RECORTES_FOTO = {
  TL: { x: 4, y: 4, w: 822, h: 456 },
  TR: { x: 846, y: 4, w: 822, h: 456 },
  BL: { x: 4, y: 478, w: 822, h: 459 },
};

// Objetos de las fotos que «calzan» con los dispositivos 3D (medidos en px del recorte).
// Teléfono de TR: eje mayor de (525, 62,5) a (474,5, 353); alto ≈ 295, ancho ≈ 122; giro ≈ −9,9°.
export const FOTO_TELEFONO = { cx: 499.75, cy: 207.75, alto: 295, rollo: -9.86 };
// Monitor de BL: marco exterior (casi frontal).
export const FOTO_MONITOR = { x0: 389, y0: 91, x1: 682, y1: 281 };
export const FOCO_TL = { x: 520, y: 280 }; // ciudadana y bolsas
export const FOCO_BL = { x: 535, y: 186 }; // centro del monitor

// Recortes verticales de las capturas _detalle (siempre por encima de los botones).
// w06d termina en la fila 752, 4 px bajo el recuadro de ayuda del mapa (que acaba en la
// fila 747): así la ventana mide 705 y deja aire hasta los subtítulos.
export const LIMITE = { w05d: 676, w06d: 752, w07d: 612 };

// Escalas de pantalla en 16:9 (px de lienzo por px de captura). En otras pantallas la escala
// sale del ancho de la ventana (composicion.js): ancho/1280 para los _detalle y ancho/1920 para web_03.
export const ESCALA_FORM = 0.9375; // 1280 → 1200
export const ESCALA_W03 = 0.625; // 1920 → 1200 (captura completa)
// Acercamiento máximo permitido sobre la escala nativa 1:1 de una captura.
export const ESCALA_MAX_CAPTURA = 1.05;

// Objetivos de resaltado: borde exterior del elemento real, radio en px de captura.
export const OBJ = {
  m02Recursos: { r: [44, 710, 1036, 888], radio: 33 },
  w03Aaud: { r: [352, 450, 948, 552], radio: 8 },
  w05Area: { r: [49, 440, 1231, 554], radio: 6 },
  w05Corte: { r: [41, 418, 1239, 578] },
  w06Selector: { r: [49, 284, 628, 334], radio: 6 },
  w06SelectorCorte: { r: [41, 252, 636, 342] },
  w06Detalle: { r: [47, 380, 630, 474], radio: 8 },
  w06DetalleCorte: { r: [41, 354, 636, 481] },
  w06Mapa: { r: [652, 256, 1231, 640], radio: 8 },
  w06MapaCorte: { r: [644, 248, 1239, 647] },
  w07Zona: { r: [49, 416, 1231, 548], radio: 8 },
  w07ZonaCorte: { r: [41, 386, 1239, 578] },
  w07Seccion: { r: [24, 104, 1256, 601], radio: 10 },
};

// Vistas a escala 1,0 en 16:9 (desplazamiento entero para que cada texel caiga en un píxel).
// En 05 y 07 la vista empieza en y 80, justo debajo de la cabecera del modal, para no
// cortar el título «Registrar Nuevo Caso»; la ventana se acorta (borde superior fijo)
// para no pasar del recorte vertical.
// web_03 se encuadra centrada en las dos columnas de tarjetas (x 352–1571) con 24 px de
// aire a cada lado, de «Resultados» (y 164) a «Denuncias» (y 803): escala 1200/1264 ≈ 0,949.
// El alto de la ventana sale de la proporción de la vista (674 × 0,949 ≈ 640).
export const VISTA = {
  w03Zoom: [328, 140, 1264, 674],
  w05Zoom: [40, 80, 1200, 596], // filas 80–676: etiqueta, área de texto, contador y «Documentos Adjuntos»
  w07Zoom: [40, 80, 1200, 532], // filas 80–612: secciones y zona de adjuntos
};

// Alturas de la ventana 16:9 (px de lienzo) según la captura que muestra.
export const ALTURA_VENTANA = {
  w03Completa: 675, // web_03 entera a 0,625
  w03: (674 * 1200) / 1264, // ≈ 639,87
  w05d: 633.75,
  w06d: 705, // 752 × 0,9375
  w07d: 573.75,
};

// Escena 03: altura (px locales del teléfono a escala 1) de la fila «Recursos Ambientales»
// sobre el centro de la pantalla: el anillo queda 113,5 × escala por encima del centro.
export const FILA_RECURSOS = 113.5;
