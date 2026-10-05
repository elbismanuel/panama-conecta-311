// Composición adaptable: a partir del tamaño REAL de la ventana (px CSS) calcula el lienzo
// lógico (W × H «px lógicos») y las ranuras de las diez escenas. La cámara «en píxeles» de
// Three.js, el director (pistas) y la capa HTML leen este mismo objeto L, de modo que
// dispositivos, titulares, rótulos y subtítulos comparten siempre las mismas coordenadas.
//
// Dos familias:
//  · «apaisado» (aspecto ≥ 1,2, de 5:4 a 21:9): el diseño 16:9 de referencia (medidas.js) se
//    ensancha o se alarga. Titulares anclados al margen izquierdo, dispositivos a la derecha; el
//    ancho extra se reparte en aire (márgenes y hueco central, con un ancho máximo de contenido)
//    y el alto extra centra la banda útil y agranda algo los teléfonos. En 16:9 exacto devuelve
//    las ranuras originales (QA de fidelidad 0/255 y determinismo).
//  · «vertical» (aspecto < 1,2: teléfonos, tabletas verticales y ventanas casi cuadradas):
//    composición apilada sobre un lienzo de 1080 px lógicos de ancho (1440 × aspecto entre 0,75
//    y 1,2): titular arriba, objeto al centro a todo el ancho útil, subtítulos abajo.
//
// Unidades: todo en px lógicos salvo lo que dice «Css». k = px CSS por px lógico.
import {
  ANCHO, ALTO, RANURAS, ROTULO, SUBS, VINETA, NODOS, TARJETA, CIERRE, LOGOS_MEDIDAS,
  FILA_RECURSOS, ESCALA_MAX_CAPTURA,
} from './medidas.js';

export const UMBRAL_APAISADO = 1.2;
const FMAX = 2400; // ancho lógico máximo del contenido apaisado; más allá solo crece el fondo
const BANDA0 = 777; // banda útil 16:9: del margen superior (86) a la caja de subtítulos (863)

// Mínimos de legibilidad (px CSS reales).
export const MINIMOS = { titular: 28, subtitulo: 16, rotulo: 12, etiqueta: 16 };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Barra de controles (px CSS): la composición le reserva sitio para que nunca tape subtítulos.
//  · compacta (≤ 640 px de ancho): dos filas, línea de tiempo arriba, objetivos táctiles de 44 px;
//  · baja (≤ 500 px de alto, teléfono apaisado): una fila de 48 px pegada al borde;
//  · normal: la barra de siempre (56 px a 16 px del borde).
export function medirBarra(anchoCss, altoCss) {
  if (anchoCss <= 640) return { modo: 'compacta', alto: 92, abajo: 8, lado: 8, hueco: 12 };
  if (altoCss <= 500) return { modo: 'baja', alto: 48, abajo: 6, lado: 12, hueco: 8 };
  return { modo: 'normal', alto: 56, abajo: 16, lado: 16, hueco: 12 };
}

// opciones: { insets: {t, r, b, l} (px CSS, env(safe-area-inset-*)), reservaBarra: bool }
export function componer(anchoCss, altoCss, opciones = {}) {
  const Wc = Math.max(1, anchoCss);
  const Hc = Math.max(1, altoCss);
  const ins = { t: 0, r: 0, b: 0, l: 0, ...(opciones.insets || {}) };
  const barra = medirBarra(Wc, Hc);
  // Pie de la barra (px CSS desde el borde inferior hasta el borde superior de la barra + aire).
  const pieBarra = opciones.reservaBarra ? barra.alto + barra.abajo + ins.b + barra.hueco : 0;
  const a = Wc / Hc;
  const L = a >= UMBRAL_APAISADO ? apaisado(Wc, Hc, ins, pieBarra) : vertical(Wc, Hc, ins, pieBarra);
  L.anchoCss = Wc;
  L.altoCss = Hc;
  L.aspecto = a;
  L.barra = barra;
  L.insets = ins;
  L.reservaBarra = !!opciones.reservaBarra;
  L.clave = [L.tipo, Wc, Hc, ins.t, ins.r, ins.b, ins.l, L.reservaBarra ? 1 : 0].join('|');
  completar(L);
  return L;
}

// Funciones derivadas comunes a las dos familias.
function completar(L) {
  const V = L.ventana;
  // Rectángulo [x, y, w, h] de la ventana para un alto dado (centrada en V.cy).
  L.rectVentana = (h) => [V.x, V.cy - h / 2, V.w, h];
  // Escalas de captura: _detalle completas (ancho 1280) y vistas acercadas de 1200 px.
  V.s0 = V.w / 1280;
  V.s1 = V.w / 1200;
  L.alto = {
    w03Completa: (1080 * V.w) / 1920, // web_03 entera
    w03: (674 * V.w) / 1264, // encuadre de las dos columnas
    w05d: 676 * V.s0,
    w06d: 752 * V.s0,
    w07d: 612 * V.s0,
  };
  // Titular h (guion.js) → ranura concreta: { x, ancho, top | cy, rol, lineas, alinear }.
  L.titular = (h) => {
    const rol = L.fuentes[h.rol] || L.fuentes.display;
    const lineas = L.tipo === 'vertical' && h.lineasV ? h.lineasV : h.lineas;
    const nombre = L.tipo === 'vertical' ? (h.ranura === 'centro' ? 'centro' : 'arriba') : h.ranura;
    const R = L.ranuras[nombre];
    const s = { x: R.x0, ancho: R.x1 - R.x0, rol, lineas, alinear: h.rol === 'final' ? 'centro' : 'izq' };
    if (R.cy !== undefined) s.cy = R.cy;
    else s.top = R.top;
    return s;
  };
}

function insetsLogicos(ins, k) {
  return { t: ins.t / k, r: ins.r / k, b: ins.b / k, l: ins.l / k };
}

// ---------------------------------------------------------------------------------------------
// Familia «apaisado»
// ---------------------------------------------------------------------------------------------
function apaisado(Wc, Hc, insCss, pieBarra) {
  let k;
  let W;
  let H;
  if (Wc / ANCHO <= Hc / ALTO) {
    k = Wc / ANCHO;
    W = ANCHO;
    H = Hc / k;
  } else {
    k = Hc / ALTO;
    H = ALTO;
    W = Wc / k;
  }
  const ins = insetsLogicos(insCss, k);

  // Marco horizontal: hasta FMAX el ancho extra E se reparte a tercios (margen izquierdo, hueco
  // central y margen derecho); más allá el contenido se centra y el fondo llena el resto.
  const F = Math.min(W, FMAX);
  const fx0 = (W - F) / 2;
  const E = F - ANCHO;
  const dxL = fx0 + E / 3; // grupo izquierdo (titulares, foto de la 01)
  const dxR = fx0 + (2 * E) / 3; // grupo derecho (dispositivos, capturas, tarjeta)
  const dxC = W / 2 - ANCHO / 2; // grupo central (cierre)
  const X0 = 154 + dxL;
  const X1 = 1766 + dxR;

  // Margen seguro del 8 % (más los recortes del sistema, si los hay).
  const seguro = {
    x0: Math.max((154 * W) / ANCHO, ins.l + 8 / k),
    x1: Math.min(W - (154 * W) / ANCHO, W - ins.r - 8 / k),
    y0: Math.max((86 * H) / ALTO, ins.t + 8 / k),
    y1: Math.min((994 * H) / ALTO, H - ins.b - 8 / k),
  };
  const y0 = seguro.y0;

  // Tipografía fluida con mínimos reales.
  const fuentes = {
    display: { tam: Math.max(88, MINIMOS.titular / k), min: Math.max(72, MINIMOS.titular / k), alto: 1.02 },
    riel: { tam: Math.max(64, MINIMOS.titular / k), min: Math.max(56, MINIMOS.titular / k), alto: 1.06 },
    final: { tam: Math.max(80, MINIMOS.titular / k), min: Math.max(72, MINIMOS.titular / k), alto: 1.0 },
  };
  const subs = subtitulosBase(Math.max(SUBS.tam, MINIMOS.subtitulo / k));
  let bajo = Math.min((SUBS.bajo * H) / ALTO, seguro.y1);
  if (pieBarra > 0) bajo = Math.min(bajo, (Hc - pieBarra) / k);
  subs.bajo = bajo;
  subs.maxAncho = Math.min(SUBS.ancho * subs.k, seguro.x1 - seguro.x0);
  const subsTop = bajo - subs.altoCaja;
  const rot = rotulos(Math.max(ROTULO.tam, MINIMOS.rotulo / k));

  // Banda útil vertical: del margen superior a la caja de subtítulos. my() lleva una y del
  // diseño 16:9 a la banda real (la encoge si es más baja y la centra si es más alta).
  const h = subsTop - y0;
  const sv = Math.min(1, h / BANDA0);
  const ext = Math.max(0, h - BANDA0);
  const my = (y) => y0 + (y - 86) * sv + ext / 2;
  const fDisp = 1 + Math.min(0.2, (ext / BANDA0) * 0.45); // teléfonos algo mayores si sobra alto

  // Ventana web: anclada a la derecha; se centra entre el rótulo DEMO y los subtítulos.
  const arriba = y0 + rot.alto - 0.5 + 10;
  const libreV = subsTop - 14.5 - 10 - arriba;
  const sw = Math.min(1, libreV / 705);
  const wV = 1200 * sw;
  const ventana = { x: 1762 + dxR - wV, cy: arriba + libreV / 2, w: wV };

  const ranuras = {
    derecha: { x0: 1072 + dxR, x1: 1766 + dxR, cy: my(460) },
    izquierda: { x0: X0, x1: 1050 + dxL, cy: my(460) },
    riel: { x0: X0, x1: ventana.x - 48, top: ventana.cy - 146 * sw },
    libre: { x0: X0, x1: X1, top: my(150) },
    centro: { x0: 154 + dxC, x1: 1766 + dxC, top: my(370) },
  };

  // Fotos ilustrativas (escala 1,0 salvo bandas muy bajas).
  const sPl = Math.min(1, (h - 120) / 456);
  const placa = { cx: 154 + dxL + 411 * sPl, cy: my(460), s: sPl };
  const placaBL = { cx: 1562 + dxR - 411 * sPl, cy: my(459.5), s: sPl };

  // Teléfono: 02 (pose media) y 03 (primer plano que sale por el borde inferior).
  const s02 = Math.min(fDisp, (h - 73) / 704);
  const s03 = Math.max(1.56 * fDisp, (H - y0) / 704 + 0.02);
  const top03 = my(86.88);
  const cy03 = s03 === 1.56 && top03 === 86.88 ? 636 : top03 + 352 * s03;
  const tel = {
    e02: [1400 + dxR, my(470), 0, s02, 1, -4, 0],
    e03: [1400 + dxR, cy03, 0, s03, 0, -2, 0],
  };

  // 08: nodos repartidos a lo ancho del contenido.
  const sN = 1 + (fDisp - 1) * 0.5;
  const yN = my(540);
  const IW = X1 - X0;
  const xs = NODOS.x.map((x) => X0 + ((x - 154) * IW) / 1612);
  const rN = (NODOS.diametro / 2) * sN;
  const nodos = {
    orient: 'h',
    s: sN,
    pos: xs.map((x) => [x, yN]),
    conectores: [0, 1, 2].map((j) => [xs[j] + rN + 16, yN, xs[j + 1] - rN - 16, yN]),
    etiquetas: xs.map((x) => ({ x: x - 160, y: yN + 96 * sN, ancho: 320, alinear: 'centro' })),
    tamEtq: Math.max(40, MINIMOS.etiqueta / k),
    rotulo: [X0, yN + 200 * sN],
    luz: xs.map((x) => [x, yN, 600]),
  };

  // 09: tarjeta a la derecha (crece desde el nodo 4).
  const cT = Math.min(1 + (fDisp - 1) * 0.5, (h - rot.alto - 2 * rot.separacion - 40) / 500);
  const tarjeta = { x: 1766 + dxR - TARJETA.w * cT, y: my(440) - (TARJETA.h / 2) * cT, w: TARJETA.w * cT, h: TARJETA.h * cT, radio: TARJETA.radio * cT, c: cT };

  // 10: teléfono y portátil lado a lado; frase final y fila de logos.
  const fc = Math.min(1 + (fDisp - 1) * 0.5, (h - 129) / 648);
  const gcx = 1015 + dxC;
  const T10 = CIERRE.telefono;
  const P10 = CIERRE.portatil;
  const cyLap = my(470);
  const cierre = {
    telefono: { cx: gcx + (T10.cx - 1015) * fc, cy: my(480), escala: T10.escala * fc, ry: T10.ry },
    portatil: { cx: gcx + (P10.cx - 1015) * fc, cy: cyLap, ry: P10.ry, s: fc },
    horizonte: { y: cyLap + 300 * fc, cx: 960 + dxC, lateral: 600 * fc },
    luzA: [1000 + dxC, my(720), 1000],
    luzB: [960 + dxC, my(520), 900],
    logos: disponerLogos({ modo: 'fila', cx: 960 + dxC, cy: my(560), escala: 1 }),
  };

  const vineta = { normal: [subsTop - 83, H - (subsTop - 83)], e03: [subsTop - 193, 190] };
  const luz = {
    e01: [1420 + dxR, my(460), 700],
    e02: [1400 + dxR, my(470), 650],
    e03: [1400 + dxR, my(600), 760],
    e04a: [1150 + dxR, my(460), 700],
    e04b: [1160 + dxR, my(470), 950],
    e09: [tarjeta.x + tarjeta.w / 2, tarjeta.y + tarjeta.h / 2, 700],
  };

  return {
    tipo: 'apaisado',
    k, W, H, seguro, fuentes, subs, rot, ranuras, ventana, placa, placaBL, tel, nodos, tarjeta, cierre, vineta, luz,
    fondo: { gradY: [(650 * H) / ALTO, H] },
    anillo: { grosor: Math.max(1, 1.6 / (3 * k)) },
    trazo: Math.max(2, 1.2 / k),
    banda: { y0, y1: subsTop, sv, ext, fDisp },
  };
}

// ---------------------------------------------------------------------------------------------
// Familia «vertical» (apilada)
// ---------------------------------------------------------------------------------------------
function vertical(Wc, Hc, insCss, pieBarra) {
  const a = Wc / Hc;
  const W = a <= 0.75 ? 1080 : 1440 * a;
  const k = Wc / W;
  const H = Hc / k;
  const ins = insetsLogicos(insCss, k);
  const mx = Math.max(0.08 * W, ins.l + 16 / k, ins.r + 16 / k);
  const seguro = {
    x0: mx,
    x1: W - mx,
    y0: Math.max(0.08 * H, ins.t + 16 / k),
    y1: Math.min(0.92 * H, H - ins.b - 16 / k),
  };
  const g = Math.max(0.045 * W, 16 / k + Math.max(ins.l, ins.r)); // margen de los objetos
  const anchoUtil = W - 2 * g;

  // Tipografía: titular ≈ 9,5 % del ancho (28–60 px reales); subtítulos 16,5–26 px reales.
  const T = Math.max(clamp(0.095 * Wc, MINIMOS.titular, 60) / k, MINIMOS.titular / k);
  const fuentes = {
    display: { tam: T, min: MINIMOS.titular / k, alto: 1.02 },
    riel: { tam: T, min: MINIMOS.titular / k, alto: 1.04 },
    final: { tam: T * 0.94, min: MINIMOS.titular / k, alto: 1.0 },
  };
  const subs = subtitulosBase(clamp(0.042 * Wc, 16.5, 26) / k);
  let bajo = seguro.y1;
  if (pieBarra > 0) bajo = Math.min(bajo, (Hc - pieBarra) / k);
  subs.bajo = bajo;
  subs.maxAncho = W - 2 * Math.max(g, 12 / k);
  const subsTop = bajo - subs.altoCaja;
  const rot = rotulos(Math.max(ROTULO.tam, 12.5 / k));

  // Zonas: titular arriba (dos líneas como máximo), objeto al centro, subtítulos abajo.
  const titTop = seguro.y0 + 40; // aire para el filete cian del titular
  const titBajo = titTop + 2 * T * 1.02;
  const hueco = Math.max(0.035 * H, 48);
  const zt = titBajo + hueco;
  const zb = subsTop - hueco;
  const zH = zb - zt;
  const zc = (zt + zb) / 2;

  const ranuras = {
    arriba: { x0: seguro.x0, x1: seguro.x1, top: titTop },
    centro: { x0: seguro.x0, x1: seguro.x1, top: 0 }, // se fija abajo con el grupo de logos
  };

  // Fotos: a lo ancho útil (como máximo 1,1 de su resolución).
  const sPl = Math.min(1.1, anchoUtil / 822, (zH - 40) / 459);
  const placa = { cx: W / 2, cy: zc, s: sPl };
  const placaBL = { cx: W / 2, cy: zc, s: sPl };

  // Teléfono protagonista; primer plano de la 03 que sale por el borde inferior.
  const s02 = Math.min(2.0, (zH * 0.94) / 704, anchoUtil / 330);
  const s03 = Math.min(anchoUtil / 330, Math.max(s02 * 1.25, (H - zt + 40) / 704));
  const tel = {
    e02: [W / 2, zc, 0, s02, 1, -4, 0],
    e03: [W / 2, zt + 352 * s03, 0, s03, 0, -2, 0],
  };

  // Ventana web como tarjeta a todo el ancho útil (nunca por encima de 1,05 de la captura).
  const pilaRot = rot.alto + rot.separacion + 10;
  const wV = Math.min(anchoUtil - 20, 1200 * ESCALA_MAX_CAPTURA, ((zH - pilaRot - 10) * 1280) / 752);
  const ventana = { x: (W - wV) / 2, cy: zc + pilaRot / 2, w: wV };

  // 08: columna de nodos con la etiqueta a la derecha de cada uno.
  const sN = clamp(zH / 1150, 0.8, 1.25);
  const dN = NODOS.diametro * sN;
  const tamEtq = clamp(0.05 * Wc, MINIMOS.etiqueta, 30) / k;
  const paso = Math.min(300 * sN, (zH - dN - rot.alto - 48) / 3);
  const altoGrupo = 3 * paso + dN + 48 + rot.alto;
  const y1N = zc - altoGrupo / 2 + dN / 2;
  const anchoGrupo = dN + 44 * sN + 5.6 * tamEtq;
  const xN = Math.max(seguro.x0, (W - anchoGrupo) / 2) + dN / 2;
  const ys = [0, 1, 2, 3].map((i) => y1N + i * paso);
  const nodos = {
    orient: 'v',
    s: sN,
    pos: ys.map((y) => [xN, y]),
    conectores: [0, 1, 2].map((j) => [xN, ys[j] + dN / 2 + 16, xN, ys[j + 1] - dN / 2 - 16]),
    etiquetas: ys.map((y) => ({ x: xN + dN / 2 + 44 * sN, y: y - tamEtq * 0.58, ancho: 0, alinear: 'izq' })),
    tamEtq,
    rotulo: [xN - dN / 2, ys[3] + dN / 2 + 48],
    luz: ys.map((y) => [xN + 160, y, 620]),
  };

  // 09: tarjeta a todo el ancho útil, contenido escalado en proporción.
  const wT = Math.min(anchoUtil, ((zH - rot.alto - 24) * TARJETA.w) / TARJETA.h);
  const cT = wT / TARJETA.w;
  const hT = TARJETA.h * cT;
  const tarjeta = { x: (W - wT) / 2, y: zc - (hT + rot.alto + 12) / 2, w: wT, h: hT, radio: TARJETA.radio * cT, c: cT };

  // 10: portátil sobre teléfono (apilados) o lado a lado, lo que dé dispositivos mayores.
  const huecoD = 0.06 * zH;
  const sApil = Math.min(anchoUtil / 1140, (0.96 * zH - huecoD) / (594 + 0.92 * 704));
  const sLado = Math.min(anchoUtil / 1503.6, (0.96 * zH) / 648);
  let telefono;
  let portatil;
  let horizonte;
  if (sApil >= sLado) {
    const s = sApil;
    const alto = 594 * s + huecoD + 0.92 * 704 * s;
    const top = zc - alto / 2;
    const cyLap = top + 294 * s;
    const cyTel = cyLap + 300 * s + huecoD + 0.92 * 352 * s;
    portatil = { cx: W / 2, cy: cyLap, ry: -3, s };
    telefono = { cx: W / 2, cy: cyTel, escala: 0.92 * s, ry: 4 };
    horizonte = { y: cyTel + 0.92 * 352 * s - 34 * s, cx: W / 2, lateral: 420 };
  } else {
    const s = sLado;
    const x0 = W / 2 - (1503.6 * s) / 2;
    telefono = { cx: x0 + 151.8 * s, cy: zc + 10 * s, escala: 0.92 * s, ry: 4 };
    portatil = { cx: x0 + 1503.6 * s - 570 * s, cy: zc, ry: -3, s };
    horizonte = { y: zc + 300 * s, cx: W / 2, lateral: 520 };
  }
  // Frase final y logos apilados (proporción original) centrados entre márgenes.
  const Tf = fuentes.final.tam;
  const altoFinal = 2 * Tf;
  const escLogos = clamp(W / 1080, 1, 1.3) * 1.06;
  const columna = disponerLogos({ modo: 'columna', cx: W / 2, cy: 0, escala: escLogos });
  const huecoF = 0.9 * Tf;
  const altoGrupoF = altoFinal + huecoF + columna.alto;
  const topF = (seguro.y0 + subsTop) / 2 - altoGrupoF / 2;
  ranuras.centro.top = topF;
  const logos = disponerLogos({ modo: 'columna', cx: W / 2, cy: topF + altoFinal + huecoF + columna.alto / 2, escala: escLogos });
  const cierre = {
    telefono, portatil, horizonte,
    luzA: [W / 2, zc + 120, 1000],
    luzB: [W / 2, topF + altoGrupoF / 2, 900],
    logos,
  };

  const vineta = { normal: [subsTop - 120, H - (subsTop - 120)], e03: [subsTop - 300, 280] };
  const anilloY = tel.e03[1] - FILA_RECURSOS * s03;
  const luz = {
    e01: [W * 0.66, zt + zH * 0.18, 780],
    e02: [W / 2, zc, 760],
    e03: [W / 2, anilloY, 800],
    e04a: [W / 2, zc, 760],
    e04b: [W / 2, ventana.cy, 980],
    e09: [W / 2, tarjeta.y + hT / 2, 760],
  };

  return {
    tipo: 'vertical',
    k, W, H, seguro, fuentes, subs, rot, ranuras, ventana, placa, placaBL, tel, nodos, tarjeta, cierre, vineta, luz,
    fondo: { gradY: [0.6 * H, H] },
    anillo: { grosor: Math.max(1, 1.6 / (3 * k)) },
    trazo: Math.max(2, 1.2 / k),
    banda: { y0: zt, y1: zb, sv: 1, ext: 0, fDisp: 1 },
  };
}

// ---------------------------------------------------------------------------------------------
// Piezas comunes
// ---------------------------------------------------------------------------------------------
function subtitulosBase(tam) {
  const kS = tam / SUBS.tam;
  return { tam, k: kS, altoCaja: SUBS.altoCaja * kS };
}

function rotulos(tam) {
  const kR = tam / ROTULO.tam;
  return { tam, k: kR, alto: ROTULO.alto * kR, separacion: ROTULO.separacion * kR, margen: ROTULO.margen * kR };
}

// Logos originales sin alterar su proporción.
//  · fila (apaisado): contenidos visibles separados por 72 px + filete de 1 px + 72 px, centro
//    óptico de la fila en cy y el conjunto centrado en cx (en 16:9: cy 560, cx 960);
//  · columna (vertical): apilados, centrados en cx, con un filete horizontal entre cada par.
export function disponerLogos({ modo, cx, cy, escala = 1 }) {
  const items = LOGOS_MEDIDAS.map((l) => {
    const alto = l.alto * escala;
    const s = alto / l.h;
    const [cx0, cy0, cx1, cy1] = l.caja;
    return { id: l.id, alto, s, ancho: l.w * s, vis0: cx0 * s, vis1: cx1 * s, visY0: cy0 * s, visY1: cy1 * s };
  });
  if (modo === 'fila') {
    const HUECO = 72 * escala;
    const anchoVisible = items.reduce((acc, it) => acc + (it.vis1 - it.vis0), 0) + (items.length - 1) * (2 * HUECO + 1);
    let x = cx - anchoVisible / 2;
    const filetes = [];
    items.forEach((it, i) => {
      it.left = x - it.vis0;
      it.top = cy - (it.visY0 + it.visY1) / 2;
      x += it.vis1 - it.vis0;
      if (i < items.length - 1) {
        filetes.push({ left: x + HUECO, top: cy - 32 * escala, ancho: 1, alto: 64 * escala });
        x += 2 * HUECO + 1;
      }
    });
    return { modo, logos: items, filetes, ancho: anchoVisible, alto: Math.max(...items.map((it) => it.visY1 - it.visY0)) };
  }
  const HUECO = 44 * escala;
  const alto = items.reduce((acc, it) => acc + (it.visY1 - it.visY0), 0) + (items.length - 1) * (2 * HUECO + 1);
  let y = cy - alto / 2;
  const filetes = [];
  items.forEach((it, i) => {
    it.top = y - it.visY0;
    it.left = cx - (it.vis0 + it.vis1) / 2;
    y += it.visY1 - it.visY0;
    if (i < items.length - 1) {
      filetes.push({ left: cx - 32 * escala, top: y + HUECO, ancho: 64 * escala, alto: 1 });
      y += 2 * HUECO + 1;
    }
  });
  return { modo, logos: items, filetes, ancho: Math.max(...items.map((it) => it.vis1 - it.vis0)), alto };
}

// Medidas de referencia 16:9 que la composición debe reproducir EXACTAMENTE (lo comprueba
// scripts/qa-adaptable.mjs y la app en ?debug=1).
export const REFERENCIA_16x9 = {
  ventana: RANURAS.ventana,
  vineta: VINETA,
};
