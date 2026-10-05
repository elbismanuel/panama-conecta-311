// Director: reúne las pistas de las diez escenas y compone el estado E = f(t).
// muestrear(t) es una función pura: no guarda nada entre llamadas, así que
// reproducir, retroceder, saltar de capítulo o abrir con ?t= da el mismo cuadro.
import { Pistas, curva, mezclar, clamp, envolvente } from './pistas.js';
import * as e01 from './escenas/e01.js';
import * as e02 from './escenas/e02.js';
import * as e03 from './escenas/e03.js';
import * as e04 from './escenas/e04.js';
import * as e05 from './escenas/e05.js';
import * as e06 from './escenas/e06.js';
import * as e07 from './escenas/e07.js';
import * as e08 from './escenas/e08.js';
import * as e09 from './escenas/e09.js';
import * as e10 from './escenas/e10.js';
import { POSE_02 } from './escenas/e02.js';
import { PASO_56 } from './escenas/e05.js';
import { PASO_67 } from './escenas/e06.js';
import {
  RANURAS,
  VINETA,
  rectVentana,
  FOTO_TELEFONO,
  FOTO_MONITOR,
  FOCO_TL,
  FOCO_BL,
  LIMITE,
  VISTA,
  ESCALA_FORM,
  ALTURA_VENTANA,
} from '../data/medidas.js';

const ESCENAS_MOD = [e01, e02, e03, e04, e05, e06, e07, e08, e09, e10];
const TIPO_CAPTURA = { w03: 'real', w05d: 'demo', w06d: 'demo', w07d: 'demo' };

// Vista (x0, y0, w, h) de un recorte de foto con acercamiento z hacia un foco.
function vistaZoom(W, H, z, foco, desliz = 0) {
  const w = W / z;
  const h = H / z;
  const x0 = clamp(foco.x * (1 - 1 / z) + desliz, 0, W - w);
  const y0 = clamp(foco.y * (1 - 1 / z), 0, H - h);
  return [x0, y0, w, h];
}

function vistaDesliz(W, H, z, desliz) {
  const w = W / z;
  const h = H / z;
  return [clamp(desliz, 0, W - w), (H - h) / 2, w, h];
}

// Encuadre «cubrir»: la captura entera recortada a la proporción del panel (sin deformar).
function vistaCubrir(W, H, aspecto) {
  if (aspecto < W / H) {
    const w = H * aspecto;
    return [(W - w) / 2, 0, w, H];
  }
  const h = W / aspecto;
  return [0, (H - h) / 2, W, h];
}

export function crearDirector(opciones = {}) {
  const M = opciones.reducido ? 0.3 : 1; // prefers-reduced-motion: recorridos más cortos
  // El realce de la tarjeta AAUD es opcional (?realce=1): por defecto el resaltado es solo externo.
  const realce = opciones.realce === true;
  const P = new Pistas();
  const objetivos = [];
  const C = { M, realce, objetivo: (t, d, o) => objetivos.push({ t, d, o }) };
  for (const e of ESCENAS_MOD) e.registrar(P, C);

  // Valores por defecto de pistas que alguna configuración puede no registrar.
  const asegurar = (n, v) => {
    if (!P.mapa.has(n)) P.k(n, [[-1, v]]);
  };
  [
    ['fondo.vineta', 0], ['fondo.horiz', 0], ['fondo.vinetaY', VINETA.normal],
    ['placaA.ry', 0], ['placaA.blur', 0], ['placaA.dim', 1], ['placaA.mix', 0],
    ['placaA.slideTL', 0], ['placaA.slideTR', 0], ['placaA.zoomTL', 1],
    ['placaB.dim', 1], ['placaB.zoom', 1],
    ['tel.mix', 0], ['tel.enc', 0], ['tel.velo', 0],
    ['ven.zr', 0], ['ven.rx', 0], ['ven.mix35', 0], ['ven.mix56', 0], ['ven.mix67', 0],
    ['ven.z05', 0], ['ven.z07', 0], ['rea.z', 0],
    ['nodos.dim', 1], ['con.op', 1],
    ['lap.op', 0], ['logos.op', 0],
  ].forEach(([n, v]) => asegurar(n, v));
  P.finalizar();
  objetivos.sort((a, b) => a.t - b.t);

  const v = (n, t) => P.v(n, t);
  const easeIO3 = curva('power3.inOut');
  const easeExpo = curva('expo.inOut');

  // --- Calce foto → teléfono (escena 02) -----------------------------------
  // El teléfono 3D se coloca en el mismo plano z que la placa y sobre el teléfono
  // de la foto TR, con la vista UV vigente en ese instante.
  function poseCalce(t) {
    const z = v('placaA.z', t);
    const vis = vistaDesliz(822, 456, 1.035, v('placaA.slideTR', t));
    const esc = 822 / vis[2];
    const cx = RANURAS.placa.x + (FOTO_TELEFONO.cx - vis[0]) * esc;
    const cy = RANURAS.placa.y + (FOTO_TELEFONO.cy - vis[1]) * esc;
    const s = (FOTO_TELEFONO.alto / 704) * esc;
    return [cx, cy, z + 2, s, 0, 0, FOTO_TELEFONO.rollo];
  }
  const P0 = poseCalce(10.2);

  // --- Calce foto → monitor (escena 04) ------------------------------------
  function marcoMonitor(t) {
    const vis = vistaZoom(822, 459, v('placaB.zoom', t), FOCO_BL);
    const esc = 822 / vis[2];
    const R = RANURAS.placaBL;
    return [
      R.x + (FOTO_MONITOR.x0 - vis[0]) * esc,
      R.y + (FOTO_MONITOR.y0 - vis[1]) * esc,
      R.x + (FOTO_MONITOR.x1 - vis[0]) * esc,
      R.y + (FOTO_MONITOR.y1 - vis[1]) * esc,
    ];
  }
  const MON = marcoMonitor(26.2);
  const BISEL0 = 10 * 0.45;
  const R0 = [MON[0] + BISEL0, MON[1] + BISEL0, MON[2] - MON[0] - 2 * BISEL0, MON[3] - MON[1] - 2 * BISEL0];
  const VENTANA = rectVentana(ALTURA_VENTANA.w03Completa);

  // Vista de web_03 con el alto deducido de la proporción de la ventana (nunca deforma).
  const vistaW03 = (x0, y0, w, rect) => [x0, y0, w, (w * rect[3]) / rect[2]];

  // Los cambios de captura son siempre «de página»: A se funde al fondo claro de la web
  // (#F3F4F6) y de ahí aparece B. Nunca se ven filas de dos capturas a la vez.
  function contenidoVentana(t, rect) {
    const H = rect[3];
    const sH = H / ESCALA_FORM;
    if (t < 31.4) {
      if (t < 27.4) return { A: 'w03', vA: vistaCubrir(1920, 1080, rect[2] / rect[3]), mix: 0 };
      const [x0, y0, w] = v('ven.v03', t);
      return { A: 'w03', vA: vistaW03(x0, y0, w, rect), mix: 0 };
    }
    if (t < 32.4) {
      const Z = VISTA.w03Zoom;
      return {
        A: 'w03', vA: vistaW03(Z[0], Z[1], Z[2], rect),
        B: 'w05d', vB: [0, 0, 1280, sH], limB: LIMITE.w05d, mix: v('ven.mix35', t), paso: true,
      };
    }
    if (t < PASO_56[0]) return { A: 'w05d', vA: vistaAcercada(VISTA.w05Zoom, v('ven.z05', t), H), limA: LIMITE.w05d, mix: 0 };
    if (t < PASO_56[1]) {
      // web_05 sale acercada (escala 1,0); web_06 entra completa a 0,9375.
      return {
        A: 'w05d', vA: vistaAcercada(VISTA.w05Zoom, 1, H), limA: LIMITE.w05d,
        B: 'w06d', vB: [0, 0, 1280, sH], limB: LIMITE.w06d, mix: v('ven.mix56', t), paso: true,
      };
    }
    if (t < PASO_67[0]) return { A: 'w06d', vA: [0, 0, 1280, sH], limA: LIMITE.w06d, mix: 0 };
    if (t < PASO_67[1]) {
      return {
        A: 'w06d', vA: [0, 0, 1280, sH], limA: LIMITE.w06d,
        B: 'w07d', vB: [0, 0, 1280, sH], limB: LIMITE.w07d, mix: v('ven.mix67', t), paso: true,
      };
    }
    return { A: 'w07d', vA: vistaAcercada(VISTA.w07Zoom, v('ven.z07', t), H), limA: LIMITE.w07d, mix: 0 };
  }

  // Acercamiento por UV de 0,9375 a 1,0: escala, origen y alto de ventana con el mismo progreso.
  function vistaAcercada(z, p, H) {
    const s = ESCALA_FORM + (1 - ESCALA_FORM) * p;
    return [z[0] * p, z[1] * p, 1200 / s, H / s];
  }
  function altoAcercado(H0, z, p) {
    return H0 + (z[3] - H0) * p;
  }

  function objetivoEn(t) {
    let i = -1;
    for (let k = 0; k < objetivos.length; k++) if (objetivos[k].t <= t) i = k;
    if (i < 0) return null;
    const o = objetivos[i];
    if (i > 0 && o.d > 0 && t < o.t + o.d) {
      return { a: objetivos[i - 1].o, b: o.o, p: easeExpo((t - o.t) / o.d) };
    }
    return { a: o.o, b: null, p: 1 };
  }

  function muestrear(t) {
    const E = { t };
    E.fondo = {
      luz: v('fondo.luz', t),
      vineta: v('fondo.vineta', t),
      vinetaY: v('fondo.vinetaY', t),
      horiz: v('fondo.horiz', t),
      grano: Math.floor(Math.min(t, 89) * 30), // la semilla del grano se congela en t ≥ 89
    };

    // Placa A: TL → TR
    const vTL = vistaZoom(822, 456, v('placaA.zoomTL', t), FOCO_TL, v('placaA.slideTL', t));
    const vTR = vistaDesliz(822, 456, 1.035, v('placaA.slideTR', t));
    const antes = t < 8.4;
    E.placaA = {
      op: v('placaA.op', t),
      z: v('placaA.z', t),
      ry: v('placaA.ry', t),
      blur: v('placaA.blur', t),
      dim: v('placaA.dim', t),
      fotoA: antes ? 'TL' : 'TR',
      vistaA: antes ? vTL : vTR,
      fotoB: 'TR',
      vistaB: vTR,
      mix: antes ? v('placaA.mix', t) : 0,
    };

    // Placa B: BL
    E.placaB = {
      op: v('placaB.op', t),
      z: v('placaB.z', t),
      ry: 0,
      blur: v('placaB.blur', t),
      dim: v('placaB.dim', t),
      fotoA: 'BL',
      vistaA: vistaZoom(822, 459, v('placaB.zoom', t), FOCO_BL),
      fotoB: 'BL',
      vistaB: null,
      mix: 0,
    };

    // Teléfono
    let pose;
    if (t < 10.2) pose = poseCalce(t);
    else if (t < 11.6) {
      const p = easeIO3((t - 10.2) / 1.4);
      pose = mezclar(P0, POSE_02, p);
      pose[2] += 120 * M * Math.sin(Math.PI * p); // arco hacia la cámara al salir de la foto
    } else pose = v('tel.pose', t);
    const env = envolvente(t, 11.7, 15.4, 0.6) * M;
    if (env > 0) {
      pose = pose.slice();
      pose[5] += 1.0 * env * Math.sin((2 * Math.PI * (t - 11.7)) / 5.0);
      pose[1] += 3.0 * env * Math.sin((2 * Math.PI * (t - 11.7)) / 6.4);
    }
    E.tel = {
      op: v('tel.op', t),
      pose,
      mix: v('tel.mix', t),
      enc: v('tel.enc', t),
      velo: v('tel.velo', t),
      corte: null,
      calce: t >= 9.9 && t < 10.2,
    };

    // Ventana
    let rect;
    let zV;
    if (t < 27.4) {
      const p = easeExpo(clamp((t - 26.2) / 1.2));
      rect = mezclar(R0, VENTANA, p);
      zV = 90 * M * Math.sin(Math.PI * p);
    } else {
      rect = v('ven.rect', t);
      zV = v('ven.zr', t);
      if (t >= 32.4 && t < PASO_56[0]) rect = rectVentana(altoAcercado(ALTURA_VENTANA.w05d, VISTA.w05Zoom, v('ven.z05', t)));
      else if (t >= PASO_67[1]) rect = rectVentana(altoAcercado(ALTURA_VENTANA.w07d, VISTA.w07Zoom, v('ven.z07', t)));
      // Regla común: la ventana siempre queda centrada en vertical en su banda.
      else rect = rectVentana(rect[3]);
    }
    const cont = contenidoVentana(t, rect);
    // Fracción DEMO de lo que se ve. Con «paso» (fundido por el fondo claro) B solo se ve en
    // la segunda mitad; entre dos capturas DEMO el rótulo se mantiene (no parpadea).
    const visB = cont.paso ? clamp((cont.mix || 0) * 2 - 1) : cont.mix || 0;
    const visB2 = cont.paso ? visB * visB * (3 - 2 * visB) : visB;
    const visA = cont.paso ? 1 - clamp((cont.mix || 0) * 2) : 1 - (cont.mix || 0);
    const demoA = TIPO_CAPTURA[cont.A] === 'demo';
    const demoB = !!cont.B && TIPO_CAPTURA[cont.B] === 'demo';
    const demo = demoA && demoB ? 1 : (demoA ? visA : 0) + (demoB ? visB2 : 0);
    E.ven = {
      op: v('ven.op', t),
      rect,
      z: zV,
      rx: v('ven.rx', t),
      bisel: v('ven.bisel', t),
      enc: v('ven.enc', t),
      velo: v('ven.velo', t),
      corte: null,
      cont,
      demo,
    };
    E.rea = { op: realce && t >= 29.6 && t <= 31.4 ? 1 : 0, z: v('rea.z', t) };

    // Anillo guía y recorte del velo (sale de los mismos objetivos: el velo sigue al anillo).
    const ob = objetivoEn(t);
    E.anillo = { op: v('anillo.op', t), prog: v('anillo.prog', t), obj: ob };
    // El recorte hereda el radio del elemento cuando coincide con él (esquinas redondeadas).
    const corteDe = (o) => (o && (o.corte || o.rect)) || null;
    const radioDe = (o) => (o.corte && o.rect && o.corte !== o.rect ? o.radioCorte || 0 : o.radio || 0);
    if (ob) {
      const ca = corteDe(ob.a);
      const cb = ob.b ? corteDe(ob.b) : null;
      if (ca || cb) {
        const ra = ca ? radioDe(ob.a) : radioDe(ob.b);
        const rb = cb ? radioDe(ob.b) : ra;
        const corte = { a: ca || cb, b: cb || ca, p: ob.b ? ob.p : 0, ra, rb };
        if (ob.a.tipo === 'tel' || (ob.b && ob.b.tipo === 'tel')) E.tel.corte = corte;
        else E.ven.corte = corte;
      }
    }

    // 08: nodos
    E.nodos = [0, 1, 2, 3].map((i) => ({ op: v(`nodo${i}.op`, t), s: v(`nodo${i}.s`, t), z: v(`nodo${i}.z`, t) }));
    E.nodosDim = v('nodos.dim', t);
    E.nodosDx = 6 * M * Math.sin((2 * Math.PI * (t - 67.6)) / 7.2) * envolvente(t, 67.6, 71.2, 0.8);
    E.etq = [0, 1, 2, 3].map((i) => v(`etq${i}.op`, t));
    E.con = [0, 1, 2].map((j) => v(`con${j}.p`, t));
    E.conOp = v('con.op', t);

    // 09: tarjeta
    E.tar = {
      op: v('tar.op', t),
      rect: v('tar.rect', t),
      radio: v('tar.radio', t),
      z: v('tar.z', t),
      ry: v('tar.ry', t),
      rx: v('tar.rx', t),
      borde: v('tar.borde', t),
      brillo: v('tar.brillo', t),
      c: {
        titulo: v('tarc.titulo', t),
        div: v('tarc.div', t),
        lineas: [0, 1, 2].map((k) => v(`tarc.linea${k}`, t)),
        sale: v('tarc.sale', t),
      },
    };

    // 10: portátil y logos
    E.lap = { op: v('lap.op', t), pose: v('lap.pose', t) };
    E.logos = v('logos.op', t);

    // Rótulos de honestidad: su opacidad sale de la MISMA pista que su imagen.
    E.rotulos = {
      iaA: E.placaA.op,
      iaB: E.placaB.op,
      demo: E.ven.op * demo,
      flujo08: Math.max(...E.nodos.map((n) => n.op)),
      flujo09: E.tar.op,
    };
    return E;
  }

  return { muestrear, P, objetivos, M, realce };
}
