// ?debug=1: retícula, margen seguro, ranuras, eje óptico, lectura en vivo de la escala
// de la captura en foco y «papel cebolla» de los calces foto → dispositivo.
import { SEGURO, RANURAS, rectVentana } from '../data/medidas.js';
import { escenaEn } from '../data/guion.js';

const NS = 'http://www.w3.org/2000/svg';

export function crearDepuracion(escenario) {
  const raiz = document.createElement('div');
  raiz.id = 'c-debug';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.setAttribute('width', '1920');
  svg.setAttribute('height', '1080');
  const rect = (x, y, w, h, color, guion = '') => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    r.setAttribute('fill', 'none');
    r.setAttribute('stroke', color);
    r.setAttribute('stroke-width', '1.5');
    if (guion) r.setAttribute('stroke-dasharray', guion);
    svg.append(r);
    return r;
  };
  for (let x = 0; x <= 1920; x += 160) rect(x, 0, 0.01, 1080, 'rgba(255,255,255,.08)');
  for (let y = 0; y <= 1080; y += 90) rect(0, y, 1920, 0.01, 'rgba(255,255,255,.08)');
  rect(SEGURO.x0, SEGURO.y0, SEGURO.x1 - SEGURO.x0, SEGURO.y1 - SEGURO.y0, '#ffd166', '8 6');
  rect(0, 460, 1920, 0.01, 'rgba(255,209,102,.5)', '4 6');
  const P = RANURAS.placa;
  rect(P.x, P.y, P.w, P.h, 'rgba(120,200,255,.6)', '3 5');
  rect(RANURAS.derecha.x0, 300, RANURAS.derecha.x1 - RANURAS.derecha.x0, 320, 'rgba(120,255,180,.5)', '3 5');
  rect(RANURAS.izquierda.x0, 300, RANURAS.izquierda.x1 - RANURAS.izquierda.x0, 320, 'rgba(120,255,180,.5)', '3 5');
  rect(RANURAS.riel.x0, RANURAS.riel.top, RANURAS.riel.x1 - RANURAS.riel.x0, 220, 'rgba(255,140,200,.5)', '3 5');
  // Banda útil de la ventana (centrada en RANURAS.ventana.cy) y la ventana de web_03 entera.
  rect(RANURAS.ventana.x, 130, RANURAS.ventana.w, 716, 'rgba(255,140,200,.25)', '2 6');
  const V = rectVentana(675);
  rect(V[0], V[1], V[2], V[3], 'rgba(255,140,200,.4)', '3 5');
  const B = RANURAS.placaBL;
  rect(B.x, B.y, B.w, B.h, 'rgba(120,200,255,.4)', '3 5');
  rect(340, 852, 1240, 134, 'rgba(255,255,255,.25)', '2 4');
  const cebollaFoto = document.createElementNS(NS, 'polygon');
  cebollaFoto.setAttribute('fill', 'rgba(255,0,200,.18)');
  cebollaFoto.setAttribute('stroke', '#ff00c8');
  const cebollaObj = document.createElementNS(NS, 'polygon');
  cebollaObj.setAttribute('fill', 'none');
  cebollaObj.setAttribute('stroke', '#00e5ff');
  cebollaObj.setAttribute('stroke-width', '2');
  svg.append(cebollaFoto, cebollaObj);
  const lectura = document.createElement('div');
  lectura.className = 'lectura';
  raiz.append(svg, lectura);
  escenario.append(raiz);

  const poli = (el, pts) => el.setAttribute('points', pts ? pts.map((p) => p.join(',')).join(' ') : '');

  function actualizar(t, info) {
    const e = escenaEn(t);
    const fps = info.fps ? ` · ${info.fps} fps` : '';
    lectura.textContent = `t = ${t.toFixed(2).replace('.', ',')} s · escena ${String(e.n).padStart(2, '0')}${fps}\n${info.escala ? `s = ${info.escala.toFixed(3).replace('.', ',')} (${info.foco})` : 's = —'}`;
    poli(cebollaFoto, info.cebollaFoto);
    poli(cebollaObj, info.cebollaObj);
  }
  return { actualizar };
}
