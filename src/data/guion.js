// Guion centralizado: escenas, titulares, subtítulos y rótulos de honestidad.
// Para reajustar los tiempos cuando se grabe la voz, basta con editar SUBTITULOS
// (ventanas ini/fin) y, si hace falta, las entradas/salidas de TITULARES.
import escenasRef from '../../referencia/escenas.json';

export const ESCENAS = [
  { n: 1, inicio: 0, fin: 8, nombre: 'Una necesidad cotidiana' },
  { n: 2, inicio: 8, fin: 16, nombre: 'Panamá Conecta en tu mano' },
  { n: 3, inicio: 16, fin: 24, nombre: 'Encuentra el servicio' },
  { n: 4, inicio: 24, fin: 32, nombre: 'También desde la web' },
  { n: 5, inicio: 32, fin: 42, nombre: 'Describe la situación' },
  { n: 6, inicio: 42, fin: 52, nombre: 'Ubica el caso' },
  { n: 7, inicio: 52, fin: 62, nombre: 'Aporta evidencia' },
  { n: 8, inicio: 62, fin: 72, nombre: 'Del reporte al registro' },
  { n: 9, inicio: 72, fin: 82, nombre: 'La consulta también importa' },
  { n: 10, inicio: 82, fin: 90, nombre: 'Cierre institucional' },
];

// Titulares con saltos de línea fijos por composición: «lineas» en pantallas apaisadas y
// «lineasV» (si cambia) en la composición vertical apilada. rol: display | riel | final.
// ranura (apaisado): derecha | izquierda | riel | libre | centro. En vertical todos van arriba
// salvo la frase final, que se centra con los logos. Posiciones y tamaños: composicion.js.
export const TITULARES = [
  { id: 't01', escena: 1, lineas: ['Tu comunidad,', 'más cerca'], rol: 'display', ranura: 'derecha', entra: 1.0, sale: 7.4 },
  { id: 't02', escena: 2, lineas: ['Panamá Conecta', '+ 311'], rol: 'display', ranura: 'izquierda', entra: 11.4, sale: 15.3 },
  { id: 't03', escena: 3, lineas: ['Elige el', 'servicio'], rol: 'display', ranura: 'izquierda', entra: 16.6, sale: 23.2 },
  // Una sola aparición en toda la escena: a la izquierda de la foto BL y luego de la ventana.
  { id: 't04', escena: 4, lineas: ['También', 'desde', 'la web'], lineasV: ['También desde', 'la web'], rol: 'riel', ranura: 'riel', entra: 24.7, sale: 31.6 },
  { id: 't05', escena: 5, lineas: ['Describe', 'lo que', 'ocurre'], lineasV: ['Describe', 'lo que ocurre'], rol: 'riel', ranura: 'riel', entra: 32.4, sale: 41.4 },
  { id: 't06', escena: 6, lineas: ['Ubica el', 'problema'], rol: 'riel', ranura: 'riel', entra: 42.3, sale: 51.2 },
  { id: 't07', escena: 7, lineas: ['Adjunta', 'evidencia'], rol: 'riel', ranura: 'riel', entra: 52.3, sale: 61.2 },
  { id: 't08', escena: 8, lineas: ['Registra tu caso'], lineasV: ['Registra', 'tu caso'], rol: 'display', ranura: 'libre', entra: 62.6, sale: 71.2 },
  { id: 't09', escena: 9, lineas: ['Consulta', 'su avance'], rol: 'display', ranura: 'izquierda', entra: 72.6, sale: 80.9 },
  { id: 't10', escena: 10, lineas: ['Tu comunidad, más cerca'], lineasV: ['Tu comunidad,', 'más cerca'], rol: 'final', ranura: 'centro', entra: 86.2, sale: Infinity },
];

// Subtítulos: texto literal de la locución (escenas.json índice 3); «/» = salto manual.
export const SUBTITULOS = [
  { escena: 1, ini: 0.1, fin: 4.1, texto: 'Cada día, una situación en nuestra comunidad / necesita ser escuchada.' },
  { escena: 1, ini: 4.15, fin: 8.0, texto: 'Una calle con basura acumulada / puede ser el inicio de un reporte.' },
  { escena: 2, ini: 8.4, fin: 15.6, texto: 'Con Panamá Conecta, la atención ciudadana / también comienza desde tu teléfono.' },
  { escena: 3, ini: 16.4, fin: 23.6, texto: 'Busca el servicio que corresponde a tu necesidad / y prepara la información para reportarla al 311.' },
  { escena: 4, ini: 24.3, fin: 26.9, texto: 'También puedes hacerlo desde la web.' },
  { escena: 4, ini: 27.0, fin: 31.6, texto: 'Por ejemplo, seleccionando / el servicio de recolección de la AAUD.' },
  { escena: 5, ini: 32.4, fin: 37.9, texto: 'Describe qué ocurre y aporta los detalles / que ayuden a comprender la situación.' },
  { escena: 5, ini: 38.0, fin: 41.6, texto: 'Una explicación clara hace más útil tu reporte.' },
  { escena: 6, ini: 42.4, fin: 51.6, texto: 'Indica dónde sucede: selecciona la ubicación / y añade una referencia para encontrar el lugar.' },
  { escena: 7, ini: 52.4, fin: 57.0, texto: 'Adjunta una fotografía o un video que aporte contexto.' },
  { escena: 7, ini: 57.1, fin: 61.6, texto: 'Revisa la información antes de registrar el caso.' },
  { escena: 8, ini: 62.4, fin: 66.8, texto: 'El registro permite identificar el caso para su consulta.' },
  { escena: 8, ini: 66.9, fin: 71.6, texto: 'Reportar es el primer paso para canalizar la atención.' },
  { escena: 9, ini: 72.4, fin: 81.6, texto: 'Desde Mis casos, puedes consultar la información / y el estado disponible de tus reportes.' },
  { escena: 10, ini: 82.2, fin: 83.8, texto: 'Panamá Conecta y 311.' },
  { escena: 10, ini: 83.85, fin: 89.0, texto: 'Tecnología al servicio de una ciudadanía / más cercana, participativa y conectada.' },
];

// Segmentación corta para pantallas estrechas (teléfono vertical): cada segmento estándar se
// parte dentro de SU MISMA ventana, en proporción a sus caracteres, para que quepa en dos
// líneas de unos 30 caracteres. Unidos, siguen siendo EXACTAMENTE la locución (validarGuion).
export const SUBTITULOS_CORTOS = [
  { escena: 1, ini: 0.1, fin: 2.69, texto: 'Cada día, una situación / en nuestra comunidad' },
  { escena: 1, ini: 2.74, fin: 4.1, texto: 'necesita ser escuchada.' },
  { escena: 1, ini: 4.15, fin: 5.93, texto: 'Una calle con basura acumulada' },
  { escena: 1, ini: 5.98, fin: 8.0, texto: 'puede ser el inicio / de un reporte.' },
  { escena: 2, ini: 8.4, fin: 12.25, texto: 'Con Panamá Conecta, / la atención ciudadana' },
  { escena: 2, ini: 12.3, fin: 15.6, texto: 'también comienza / desde tu teléfono.' },
  { escena: 3, ini: 16.4, fin: 19.76, texto: 'Busca el servicio que / corresponde a tu necesidad' },
  { escena: 3, ini: 19.81, fin: 23.6, texto: 'y prepara la información / para reportarla al tres once.' },
  { escena: 4, ini: 24.3, fin: 26.9, texto: 'También puedes hacerlo / desde la web.' },
  { escena: 4, ini: 27.0, fin: 28.84, texto: 'Por ejemplo, seleccionando' },
  { escena: 4, ini: 28.89, fin: 31.6, texto: 'el servicio de recolección / de la AAUD.' },
  { escena: 5, ini: 32.4, fin: 35.26, texto: 'Describe qué ocurre / y aporta los detalles' },
  { escena: 5, ini: 35.31, fin: 37.9, texto: 'que ayuden a comprender / la situación.' },
  { escena: 5, ini: 38.0, fin: 41.6, texto: 'Una explicación clara / hace más útil tu reporte.' },
  { escena: 6, ini: 42.4, fin: 46.82, texto: 'Indica dónde sucede: / selecciona la ubicación' },
  { escena: 6, ini: 46.87, fin: 51.6, texto: 'y añade una referencia / para encontrar el lugar.' },
  { escena: 7, ini: 52.4, fin: 57.0, texto: 'Adjunta una fotografía / o un video que aporte contexto.' },
  { escena: 7, ini: 57.1, fin: 61.6, texto: 'Revisa la información / antes de registrar el caso.' },
  { escena: 8, ini: 62.4, fin: 66.8, texto: 'El registro permite identificar / el caso para su consulta.' },
  { escena: 8, ini: 66.9, fin: 71.6, texto: 'Reportar es el primer paso / para canalizar la atención.' },
  { escena: 9, ini: 72.4, fin: 77.44, texto: 'Desde Mis casos, puedes / consultar la información' },
  { escena: 9, ini: 77.49, fin: 81.6, texto: 'y el estado disponible / de tus reportes.' },
  { escena: 10, ini: 82.2, fin: 83.8, texto: 'Panamá Conecta y tres once.' },
  { escena: 10, ini: 83.85, fin: 86.43, texto: 'Tecnología al servicio / de una ciudadanía' },
  { escena: 10, ini: 86.48, fin: 89.0, texto: 'más cercana, participativa / y conectada.' },
];

export const ROTULOS = {
  ia: 'Escena ilustrativa generada por IA',
  demo: 'DEMOSTRACIÓN · Datos ficticios · Sin envío',
  flujo: 'Representación del flujo',
};

// Etiquetas de la gráfica editorial de la escena 08 (literal del guion, TOMA 08 · VISUAL).
export const PASOS = ['Describir', 'Ubicar', 'Adjuntar', 'Registrar'];

// Tarjeta editorial de la escena 09: título y tres líneas breves tomadas de la locución
// (sin estados, porcentajes ni barras de interfaz).
export const CONSULTA = {
  titulo: 'Consulta del caso',
  lineas: ['Información del reporte', 'Estado disponible', 'Desde Mis casos'],
};

export const FUNDIDO_SUB = 0.2;
// Velocidad de lectura máxima de los subtítulos (caracteres por segundo).
export const MAX_CPS = 17;

// Validación contra la referencia: si algo no coincide, se informa en consola
// (la QA falla con cualquier error de consola).
export function validarGuion() {
  const errores = [];
  const conjuntos = [
    ['estándar', SUBTITULOS],
    ['corta', SUBTITULOS_CORTOS],
  ];
  for (let i = 0; i < 10; i++) {
    const ref = escenasRef[i];
    for (const [nombre, lista] of conjuntos) {
      const unidos = lista
        .filter((s) => s.escena === i + 1)
        .map((s) => s.texto.replace(' / ', ' '))
        .join(' ');
      if (unidos !== ref[3]) errores.push(`Subtítulos (${nombre}) de la escena ${i + 1} ≠ locución`);
    }
    for (const h of TITULARES.filter((x) => x.escena === i + 1)) {
      for (const lineas of [h.lineas, h.lineasV].filter(Boolean)) {
        const texto = lineas.join(' ');
        if (texto !== ref[5]) errores.push(`Titular ${h.id} ≠ texto en pantalla de la escena ${i + 1}`);
        if (texto.split(/\s+/).length > 6) errores.push(`Titular ${h.id} con más de seis palabras`);
      }
    }
    if (ESCENAS[i].inicio !== ref[0] || ESCENAS[i].fin !== ref[1]) errores.push(`Tiempos de la escena ${i + 1} ≠ guion`);
  }
  for (const [nombre, lista] of conjuntos) {
    for (let i = 1; i < lista.length; i++) {
      if (lista[i].ini < lista[i - 1].fin) errores.push(`Subtítulos (${nombre}) solapados en ${lista[i].ini}`);
    }
    for (const s of lista) {
      if (s.texto.split(' / ').length > 2) errores.push(`Subtítulo (${nombre}) con más de dos líneas: ${s.texto}`);
      const cps = s.texto.replace(' / ', ' ').length / (s.fin - s.ini);
      if (cps > MAX_CPS + 1e-9) errores.push(`Subtítulo (${nombre}) de ${cps.toFixed(1)} c/s (máx. ${MAX_CPS}): ${s.texto}`);
      const e = ESCENAS[s.escena - 1];
      if (s.ini < e.inicio || s.fin > e.fin) errores.push(`Subtítulo (${nombre}) fuera de su escena: ${s.texto}`);
    }
  }
  if (!escenasRef[7][4].includes(PASOS.join(' → '))) errores.push('Etiquetas de la escena 08 ≠ guion (TOMA 08)');
  for (const l of [CONSULTA.titulo, ...CONSULTA.lineas]) {
    if (l.split(/\s+/).length > 6) errores.push(`Texto de la tarjeta 09 con más de seis palabras: ${l}`);
  }
  return errores;
}

export function escenaEn(t) {
  for (let i = ESCENAS.length - 1; i >= 0; i--) if (t >= ESCENAS[i].inicio) return ESCENAS[i];
  return ESCENAS[0];
}
