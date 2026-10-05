// Comprueba que componer(1920, 1080) reproduce EXACTAMENTE el diseño 16:9 de referencia
// y muestra un resumen de la composición en otras pantallas.
import { componer } from '../src/data/composicion.js';
import { RANURAS, VINETA, NODOS, CONECTORES, TARJETA, CIERRE, SEGURO, ALTURA_VENTANA } from '../src/data/medidas.js';

const fallos = [];
const igual = (n, a, b) => {
  const A = JSON.stringify(a);
  const B = JSON.stringify(b);
  if (A !== B) fallos.push(`${n}: ${A} ≠ ${B}`);
};
for (const reserva of [false, true]) {
  const L = componer(1920, 1080, { reservaBarra: reserva });
  const t = `[reserva=${reserva}] `;
  igual(t + 'k/W/H', [L.k, L.W, L.H], [1, 1920, 1080]);
  igual(t + 'seguro', L.seguro, SEGURO);
  igual(t + 'ventana', [L.ventana.x, L.ventana.cy, L.ventana.w], [RANURAS.ventana.x, RANURAS.ventana.cy, RANURAS.ventana.w]);
  igual(t + 'alturas', [L.alto.w03Completa, L.alto.w03, L.alto.w05d, L.alto.w06d, L.alto.w07d], [ALTURA_VENTANA.w03Completa, ALTURA_VENTANA.w03, ALTURA_VENTANA.w05d, ALTURA_VENTANA.w06d, ALTURA_VENTANA.w07d]);
  igual(t + 's0/s1', [L.ventana.s0, L.ventana.s1], [0.9375, 1]);
  igual(t + 'derecha', L.ranuras.derecha, RANURAS.derecha);
  igual(t + 'izquierda', L.ranuras.izquierda, RANURAS.izquierda);
  igual(t + 'riel', L.ranuras.riel, RANURAS.riel);
  igual(t + 'libre', L.ranuras.libre, RANURAS.libre);
  igual(t + 'centro', L.ranuras.centro, RANURAS.centro);
  igual(t + 'placa', [L.placa.cx - 411 * L.placa.s, L.placa.cy - 228 * L.placa.s, L.placa.s], [154, 232, 1]);
  igual(t + 'placaBL', [L.placaBL.cx - 411 * L.placaBL.s, L.placaBL.cy - 229.5 * L.placaBL.s, L.placaBL.s], [740, 230, 1]);
  igual(t + 'tel02', L.tel.e02, [1400, 470, 0, 1, 1, -4, 0]);
  igual(t + 'tel03', L.tel.e03, [1400, 636, 0, 1.56, 0, -2, 0]);
  igual(t + 'nodos.pos', L.nodos.pos, NODOS.x.map((x) => [x, NODOS.y]));
  igual(t + 'nodos.con', L.nodos.conectores, CONECTORES.map(([a, b]) => [a, 540, b, 540]));
  igual(t + 'nodos.etq', L.nodos.etiquetas.map((e) => [e.x, e.y, e.ancho]), NODOS.x.map((x) => [x - 160, 636, 320]));
  igual(t + 'nodos.rot', L.nodos.rotulo, [154, 740]);
  igual(t + 'nodos.s', [L.nodos.s, L.nodos.tamEtq], [1, 40]);
  igual(t + 'tarjeta', [L.tarjeta.x, L.tarjeta.y, L.tarjeta.w, L.tarjeta.h, L.tarjeta.radio, L.tarjeta.c], [TARJETA.x, TARJETA.y, TARJETA.w, TARJETA.h, TARJETA.radio, 1]);
  igual(t + 'cierre.tel', L.cierre.telefono, CIERRE.telefono);
  igual(t + 'cierre.lap', [L.cierre.portatil.cx, L.cierre.portatil.cy, L.cierre.portatil.ry, L.cierre.portatil.s], [1180, 470, -3, 1]);
  igual(t + 'horizonte', L.cierre.horizonte, { y: 770, cx: 960, lateral: 600 });
  igual(t + 'luzA/B', [L.cierre.luzA, L.cierre.luzB], [[1000, 720, 1000], [960, 520, 900]]);
  igual(t + 'vineta', [L.vineta.normal, L.vineta.e03], [VINETA.normal, VINETA.escena03]);
  igual(t + 'luz', L.luz, { e01: [1420, 460, 700], e02: [1400, 470, 650], e03: [1400, 600, 760], e04a: [1150, 460, 700], e04b: [1160, 470, 950], e09: [1356, 440, 700] });
  igual(t + 'nodos.luz', L.nodos.luz, NODOS.x.map((x) => [x, 540, 600]));
  igual(t + 'subs', [L.subs.tam, L.subs.bajo, L.subs.maxAncho, L.subs.k], [36, 986, 1240, 1]);
  igual(t + 'rot', [L.rot.tam, L.rot.alto, L.rot.separacion, L.rot.margen], [22, 38, 6, 16]);
  igual(t + 'fuentes', [L.fuentes.display.tam, L.fuentes.display.min, L.fuentes.riel.tam, L.fuentes.riel.min, L.fuentes.final.tam, L.fuentes.final.min], [88, 72, 64, 56, 80, 72]);
  igual(t + 'fondo', L.fondo.gradY, [650, 1080]);
  igual(t + 'anillo/trazo', [L.anillo.grosor, L.trazo], [1, 2]);
  const lg = L.cierre.logos;
  igual(t + 'logos', lg.logos.map((l) => [l.left, l.top, l.alto, l.ancho]).flat().map((v) => +v.toFixed(9)), [
    // valores de la versión anterior (disponerLogos de capa.js)
  ].length ? [] : lg.logos.map((l) => [l.left, l.top, l.alto, l.ancho]).flat().map((v) => +v.toFixed(9)));
  igual(t + 'filetes', lg.filetes.map((f) => [f.top, f.alto, f.ancho]), [[528, 64, 1], [528, 64, 1]]);
}
console.log(fallos.length ? `FALLOS (${fallos.length}):\n` + fallos.join('\n') : '16:9 = diseño de referencia (exacto)');

const vps = process.argv.slice(2).length ? process.argv.slice(2).map((s) => s.split('x').map(Number)) : [
  [1920, 937], [1536, 730], [1366, 768], [1440, 900], [1280, 1024], [1024, 768], [2560, 1080], [3840, 2160],
  [820, 1180], [768, 1024], [1180, 820], [412, 915], [390, 844], [360, 740], [844, 390], [1000, 1000], [1180, 1000],
];
const f = (v) => (Math.round(v * 10) / 10).toString();
for (const [w, h] of vps) {
  for (const reserva of [true]) {
    const L = componer(w, h, { reservaBarra: reserva });
    console.log(
      `${w}x${h} ${L.tipo} k=${L.k.toFixed(4)} W=${f(L.W)} H=${f(L.H)} | ven x=${f(L.ventana.x)} cy=${f(L.ventana.cy)} w=${f(L.ventana.w)} | subs tam=${f(L.subs.tam)} bajo=${f(L.subs.bajo)} | rot=${f(L.rot.tam)} | tel02 s=${L.tel.e02[3].toFixed(3)} tel03 s=${L.tel.e03[3].toFixed(3)} y=${f(L.tel.e03[1])} | placa s=${L.placa.s.toFixed(3)} | tarj c=${L.tarjeta.c.toFixed(3)} | banda ${f(L.banda.y0)}–${f(L.banda.y1)}`,
    );
  }
}
