// Capa HTML nítida sobre el lienzo WebGL: titulares, rótulos de honestidad,
// gráfica editorial de la 08 (iconos, etiquetas, conectores), contenido de la
// tarjeta 09 (con perspectiva CSS igual a la cámara) y logos del cierre.
// Todo se calcula desde t; solo se escriben transform/opacidad cuando cambian.
import { TITULARES, ROTULOS, PASOS, CONSULTA } from '../data/guion.js';
import { RANURAS, NODOS, CONECTORES, TARJETA, TARJETA_CONTENIDO, SEGURO, ROTULO } from '../data/medidas.js';
import { LOGOS } from '../data/recursos.js';
import { tramo, clamp } from '../timeline/pistas.js';
import { icono, ICONOS_FLUJO } from './iconos.js';
import { D } from '../three/escenario.js';

const ROLES = {
  display: { tam: 88, min: 72, alto: 1.02 },
  riel: { tam: 64, min: 56, alto: 1.06 },
  final: { tam: 80, min: 72, alto: 1.0 },
};

function el(tag, clase, padre, html) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (html !== undefined) e.innerHTML = html;
  if (padre) padre.append(e);
  e._c = {};
  return e;
}

// Escribe un estilo solo si cambió (caché por elemento).
function est(e, prop, valor) {
  if (e._c[prop] === valor) return;
  e._c[prop] = valor;
  e.style[prop] = valor;
}
function opac(e, v) {
  const o = v <= 0.001 ? 0 : v >= 0.999 ? 1 : Math.round(v * 1000) / 1000;
  est(e, 'opacity', String(o));
  est(e, 'visibility', o > 0 ? 'visible' : 'hidden');
}
const px = (v) => `${Math.round(v * 100) / 100}px`;

export function crearCapa(escenario, opciones) {
  const M = opciones.M;
  const avisos = [];

  // ---------------- Titulares ----------------
  const contTit = el('div', 'c-titulares', escenario);
  const titulares = TITULARES.map((h) => {
    const rol = ROLES[h.rol === 'display' || h.rol === 'riel' || h.rol === 'final' ? h.rol : 'display'];
    const bloque = el('div', `titular rol-${h.rol}`, contTit);
    bloque.id = h.id;
    const filete = h.rol === 'display' ? el('div', 'filete', bloque) : null;
    const lineas = h.lineas.map((txt) => {
      const m = el('div', 'mascara', bloque);
      const l = el('div', 'linea', m);
      l.textContent = txt;
      return l;
    });
    return { h, rol, bloque, filete, lineas, tam: rol.tam };
  });

  // Autoajuste: con la fuente real, si una línea no cabe en su ranura se reduce de 4 en 4 px.
  function anchoRanura(h) {
    if (h.ranura === 'derecha') return RANURAS.derecha.x1 - RANURAS.derecha.x0;
    if (h.ranura === 'izquierda') return RANURAS.izquierda.x1 - RANURAS.izquierda.x0;
    if (h.ranura === 'riel') return RANURAS.riel.x1 - RANURAS.riel.x0;
    if (h.ranura === 'centro') return SEGURO.x1 - SEGURO.x0;
    return h.ancho;
  }
  function maquetar() {
    for (const T of titulares) {
      const { h, rol, bloque } = T;
      const ancho = anchoRanura(h);
      let tam = rol.tam;
      for (;;) {
        bloque.style.fontSize = `${tam}px`;
        const max = Math.max(...T.lineas.map((l) => l.scrollWidth));
        if (max <= ancho || tam <= rol.min) {
          if (max > ancho) avisos.push(`Titular ${h.id} no cabe ni a ${tam}px`);
          break;
        }
        tam -= 4;
      }
      T.tam = tam;
      const altoLinea = tam * rol.alto;
      const altoBloque = altoLinea * h.lineas.length;
      let x;
      let top;
      if (h.ranura === 'derecha') {
        x = RANURAS.derecha.x0;
        top = RANURAS.derecha.cy - altoBloque / 2;
      } else if (h.ranura === 'izquierda') {
        x = RANURAS.izquierda.x0;
        top = RANURAS.izquierda.cy - altoBloque / 2;
      } else if (h.ranura === 'riel') {
        x = RANURAS.riel.x0;
        top = RANURAS.riel.top;
      } else if (h.ranura === 'centro') {
        x = SEGURO.x0;
        top = h.top;
      } else {
        x = h.x;
        top = h.top;
      }
      bloque.style.left = `${x}px`;
      bloque.style.top = `${top}px`;
      bloque.style.width = `${ancho}px`;
      bloque.style.lineHeight = String(rol.alto);
      T.x = x;
      T.top = top;
      T.alto = altoBloque;
    }
  }

  // ---------------- Rótulos de honestidad ----------------
  const contRot = el('div', 'c-rotulos', escenario);
  const rotulo = (texto) => {
    const r = el('div', 'rotulo', contRot);
    el('i', '', r);
    const s = el('span', '', r);
    s.textContent = texto;
    return r;
  };
  const rot = {
    iaA: rotulo(ROTULOS.ia),
    iaB: rotulo(ROTULOS.ia),
    demo: rotulo(ROTULOS.demo),
    flujo08: rotulo(ROTULOS.flujo),
    flujo09: rotulo(ROTULOS.flujo),
  };
  let anchoDemo = 0;

  // ---------------- 08: iconos, etiquetas y conectores ----------------
  const contFlujo = el('div', 'c-flujo', escenario);
  const svgCon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgCon.setAttribute('viewBox', '0 0 1920 1080');
  svgCon.setAttribute('class', 'conectores');
  contFlujo.append(svgCon);
  svgCon._c = {};
  const conectores = CONECTORES.map(([x0, x1]) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linea.setAttribute('x1', x0);
    linea.setAttribute('x2', x1);
    linea.setAttribute('y1', NODOS.y);
    linea.setAttribute('y2', NODOS.y);
    const largo = x1 - x0;
    linea.setAttribute('stroke-dasharray', `${largo} ${largo}`);
    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    chevron.setAttribute('points', `${x1 - 7},${NODOS.y - 8} ${x1 + 1},${NODOS.y} ${x1 - 7},${NODOS.y + 8}`);
    g.append(linea, chevron);
    svgCon.append(g);
    linea._c = {};
    chevron._c = {};
    g._c = {};
    return { g, linea, chevron, largo };
  });
  const iconos = ICONOS_FLUJO.map((n) => el('div', 'icono-flujo', contFlujo, icono(n, 44, 2.5)));
  const etiquetas = PASOS.map((p) => {
    const e = el('div', 'etiqueta-flujo', contFlujo);
    e.textContent = p;
    return e;
  });

  // ---------------- 09: contenido de la tarjeta ----------------
  const contTar = el('div', 'c-tarjeta', escenario);
  contTar.style.perspective = `${D}px`;
  const tarjeta = el('div', 'tarjeta-dom', contTar);
  const tcTitulo = el('div', 'tc-titulo', tarjeta);
  tcTitulo.textContent = CONSULTA.titulo;
  const tcDiv = el('div', 'tc-div', tarjeta);
  // Tres líneas editoriales (texto de titular, no barras de interfaz).
  const TC = TARJETA_CONTENIDO;
  const tcLineas = CONSULTA.lineas.map((txt, k) => {
    const f = el('div', 'tc-linea', tarjeta);
    f.style.left = `${TC.margen}px`;
    f.style.right = `${TC.margen}px`;
    f.style.top = `${TC.primeraLinea + k * TC.paso}px`;
    el('i', '', f);
    const s = el('span', '', f);
    s.textContent = txt;
    return f;
  });

  // ---------------- 10: logos originales ----------------
  const contLogos = el('div', 'c-logos', escenario);
  const filas = disponerLogos();
  for (const f of filas.logos) {
    const img = el('img', 'logo', contLogos);
    img.src = f.url;
    img.alt = f.alt;
    img.draggable = false;
    img.style.left = `${f.left}px`;
    img.style.top = `${f.top}px`;
    img.style.height = `${f.alto}px`;
    img.style.width = `${f.ancho}px`;
  }
  for (const x of filas.filetes) {
    const s = el('span', 'filete-v', contLogos);
    s.style.left = `${x}px`;
  }

  // ---------------- Interfaz pública ----------------
  function medir() {
    maquetar();
    anchoDemo = rot.demo.offsetWidth;
  }

  function actualizarTitulares(t) {
    for (const T of titulares) {
      const { h } = T;
      const activo = t >= h.entra - 0.01 && t <= h.sale + 0.45;
      if (!activo) {
        opac(T.bloque, 0);
        continue;
      }
      const sal = tramo(t, h.sale, h.sale + 0.4, 'power2.in');
      opac(T.bloque, 1 - sal);
      est(T.bloque, 'transform', `translateY(${px(-16 * sal * M)})`);
      const dur = h.rol === 'final' ? 0.8 : 0.7;
      T.lineas.forEach((l, i) => {
        const p = tramo(t, h.entra + 0.08 * i, h.entra + 0.08 * i + dur, 'power3.out');
        est(l, 'transform', `translateY(${Math.round((1 - p) * 110 * M * 10) / 10}%)`);
        opac(l, p);
      });
      if (T.filete) {
        const f = tramo(t, h.entra, h.entra + 0.5, 'power3.out');
        est(T.filete, 'transform', `scaleX(${Math.round(f * 1000) / 1000})`);
      }
    }
  }

  // proy: posiciones proyectadas por la app (px del lienzo).
  function actualizar(t, E, proy) {
    actualizarTitulares(t);

    // Rótulos: misma opacidad que su imagen; posición atada a la imagen.
    const r = E.rotulos;
    opac(rot.iaA, r.iaA);
    const R = ROTULO;
    if (r.iaA > 0.001 && proy.iaA) est(rot.iaA, 'transform', `translate(${px(proy.iaA[0] + R.margen)}, ${px(proy.iaA[1] - R.margen - R.alto)})`);
    opac(rot.iaB, r.iaB);
    if (r.iaB > 0.001 && proy.iaB) est(rot.iaB, 'transform', `translate(${px(proy.iaB[0] + R.margen)}, ${px(proy.iaB[1] - R.margen - R.alto)})`);
    opac(rot.demo, r.demo);
    if (r.demo > 0.001 && proy.demo) {
      // Encima de la ventana, alineado a su borde derecho (borde exterior del bisel de 10 px).
      const x = Math.min(proy.demo[0] + 10, SEGURO.x1) - anchoDemo;
      const y = Math.max(proy.demo[1] - 10 - R.separacion - R.alto, SEGURO.y0);
      est(rot.demo, 'transform', `translate(${px(x)}, ${px(y)})`);
    }
    opac(rot.flujo08, r.flujo08);
    est(rot.flujo08, 'transform', `translate(${SEGURO.x0}px, 740px)`);
    opac(rot.flujo09, r.flujo09);
    est(rot.flujo09, 'transform', `translate(${TARJETA.x}px, ${TARJETA.y + TARJETA.h + 2 * R.separacion}px)`);

    // 08
    const vis08 = t > 62.4 && t < 72.4;
    est(contFlujo, 'display', vis08 ? 'block' : 'none');
    if (vis08) {
      conectores.forEach((c, j) => {
        const p = E.con[j];
        est(c.linea, 'strokeDashoffset', String(Math.round(c.largo * (1 - p) * 10) / 10));
        opac(c.chevron, clamp((p - 0.9) / 0.1));
        est(c.g, 'transform', `translateX(${px(E.nodosDx)})`);
        opac(c.g, p > 0 ? E.conOp : 0);
      });
      E.nodos.forEach((n, i) => {
        const brillo = i < 3 ? E.nodosDim : 1;
        const pr = proy.nodos[i];
        opac(iconos[i], n.op * brillo);
        if (pr) est(iconos[i], 'transform', `translate(${px(pr[0] - 22)}, ${px(pr[1] - 22)}) scale(${Math.round(pr[2] * 1000) / 1000})`);
        const e = etiquetas[i];
        const oe = E.etq[i];
        opac(e, oe * brillo);
        est(e, 'transform', `translate(${px(NODOS.x[i] + E.nodosDx - 160)}, ${px(636 + (1 - oe) * 10 * M)})`);
      });
    }

    // 09
    const ta = E.tar;
    const vis09 = ta.op > 0.001 && t > 72.5 && t < 82;
    est(contTar, 'display', vis09 ? 'block' : 'none');
    if (vis09) {
      const [x, y, w, h] = ta.rect;
      est(
        tarjeta,
        'transform',
        `translate3d(${px(x + w / 2 - TARJETA.w / 2)}, ${px(y + h / 2 - TARJETA.h / 2)}, ${px(ta.z)}) rotateX(${-ta.rx}deg) rotateY(${ta.ry}deg)`,
      );
      const c = ta.c;
      const sale = 1 - c.sale;
      opac(tcTitulo, c.titulo * sale);
      est(tcTitulo, 'transform', `translateY(${px((1 - c.titulo) * 14 * M)})`);
      opac(tcDiv, c.div * sale);
      est(tcDiv, 'transform', `scaleX(${Math.round(c.div * 1000) / 1000})`);
      tcLineas.forEach((f, k) => {
        const p = c.lineas[k];
        opac(f, p * sale);
        est(f, 'transform', `translateY(${px((1 - p) * 16 * M)})`);
      });
    }

    // 10B: logos
    opac(contLogos, E.logos);
    est(contLogos, 'transform', `translateY(${px((1 - E.logos) * 10 * M)})`);
  }

  return { actualizar, medir, avisos, titulares, rot };
}

// Fila de logos: entre los contenidos visibles quedan 72 px + filete de 1 px + 72 px;
// centro óptico de la fila en y 560 y el conjunto centrado en x 960.
export function disponerLogos() {
  const HUECO = 72;
  const items = LOGOS.map((l) => {
    const s = l.alto / l.h;
    const ancho = l.w * s;
    const [cx0, cy0, cx1, cy1] = l.caja;
    return { ...l, s, ancho, vis0: cx0 * s, vis1: cx1 * s, visY0: cy0 * s, visY1: cy1 * s };
  });
  const anchoVisible = items.reduce((a, it) => a + (it.vis1 - it.vis0), 0) + (items.length - 1) * (2 * HUECO + 1);
  let x = 960 - anchoVisible / 2;
  const filetes = [];
  items.forEach((it, i) => {
    it.left = x - it.vis0;
    it.top = 560 - (it.visY0 + it.visY1) / 2;
    x += it.vis1 - it.vis0;
    if (i < items.length - 1) {
      filetes.push(x + HUECO);
      x += 2 * HUECO + 1;
    }
  });
  return { logos: items, filetes, anchoVisible };
}
