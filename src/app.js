import { crearRemoto } from './remoto/host.js';
// Arranque, precarga y bucle único de dibujo.
// Orden por cuadro: t = reloj() → E = muestrear(t) → aplicar a Three → proyectar
// anclajes (anillo, rótulos) → escribir DOM (solo lo que cambió) → render.
// En pausa solo se dibuja si t cambió.
import * as THREE from 'three';
import { crearEscenario, aMundoX, aMundoY } from './three/escenario.js';
import { cargarTexturas } from './three/texturas.js';
import { crearEntorno } from './three/entorno.js';
import { crearFondo } from './three/fondo.js';
import { crearPlaca } from './three/placa.js';
import { crearTelefono } from './three/telefono.js';
import { crearVentana } from './three/ventana.js';
import { crearPortatil } from './three/portatil.js';
import { crearAnillo } from './three/anillo.js';
import { crearNodos } from './three/nodos.js';
import { crearTarjeta } from './three/tarjeta.js';
import { crearDirector } from './timeline/director.js';
import { tramo } from './timeline/pistas.js';
import { Reloj } from './timeline/reloj.js';
import { crearCapa } from './ui/capa.js';
import { crearSubtitulos, segmentoEn } from './ui/subtitulos.js';
import { crearControles } from './ui/controles.js';
import { crearMusica, renderizarMusica } from './ui/musica.js';
import { crearDepuracion } from './ui/depuracion.js';
import { ESCENAS, validarGuion } from './data/guion.js';
import { FUENTES, LOGOS } from './data/recursos.js';
import { OBJ, RANURAS, NODOS, DURACION, FOTO_TELEFONO, FOTO_MONITOR, RECORTES_FOTO } from './data/medidas.js';

function leerOpciones() {
  const q = new URLSearchParams(location.search);
  const si = (n) => q.has(n) && q.get(n) !== '0' && q.get(n) !== 'false';
  const num = (n) => (q.has(n) && q.get(n) !== '' && Number.isFinite(Number(q.get(n))) ? Number(q.get(n)) : null);
  let t = num('t');
  const escena = num('escena');
  if (t === null && escena !== null) t = ESCENAS[Math.min(10, Math.max(1, escena)) - 1].inicio;
  return {
    t,
    autoplay: si('autoplay'),
    pausa: q.has('pausa'),
    presentacion: si('present') || si('presentacion'),
    subs: q.get('subs') !== '0',
    ui: q.get('ui') !== '0',
    bucle: si('loop') || q.has('bucle'),
    calidadBaja: q.get('calidad') === 'baja',
    debug: si('debug'),
    realce: si('realce'), // opcional: eleva la tarjeta AAUD (por defecto solo anillo externo)
    proyector: si('proyector'),
    audio: q.get('audio'),
    sinWebGL: si('sinwebgl'),
    shaders: si('shaders'),
    reducido: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || si('reducido'),
  };
}

async function cargarFuentes() {
  const sora = new FontFace('Sora', `url(${FUENTES.sora}) format('woff2')`, { weight: '100 800', display: 'block' });
  const inter = new FontFace('Inter', `url(${FUENTES.inter}) format('woff2')`, { weight: '100 900', display: 'block' });
  document.fonts.add(sora);
  document.fonts.add(inter);
  await Promise.all([sora.load(), inter.load()]);
  await document.fonts.load('600 88px Sora');
  await document.fonts.load('500 36px Inter');
  await document.fonts.ready;
}

function webgl2Disponible() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch (_) {
    return false;
  }
}

function mostrarSinWebGL() {
  const d = document.createElement('div');
  d.id = 'sin-webgl';
  d.innerHTML = `
    <h1>Esta animación necesita WebGL&nbsp;2</h1>
    <p>Ábrala con Microsoft Edge o Google Chrome actualizados y verifique que la aceleración por hardware esté activada (en Edge: Configuración › Sistema y rendimiento; en Chrome: Configuración › Sistema). No requiere conexión a internet.</p>
    <div class="logos-sw">${LOGOS.map((l) => `<img src="${l.url}" alt="${l.alt}">`).join('')}</div>`;
  document.body.append(d);
  const cub = document.getElementById('cubierta');
  if (cub) cub.remove();
}

export async function iniciar() {
  const opc = leerOpciones();
  const marco = document.getElementById('marco');
  const canvas = document.getElementById('lienzo');
  const escenarioDom = document.getElementById('escenario');
  let resolverListo;
  const listo = new Promise((r) => (resolverListo = r));
  window.pc311 = { listo, escenas: ESCENAS };

  await cargarFuentes().catch((e) => console.warn('Fuentes:', e));
  for (const err of validarGuion()) console.error(`Guion: ${err}`);

  if (opc.sinWebGL || !webgl2Disponible()) {
    mostrarSinWebGL();
    window.pc311.webgl = false;
    resolverListo(false);
    return;
  }

  let E3;
  try {
    E3 = crearEscenario(canvas, { calidadBaja: opc.calidadBaja, verificarShaders: opc.shaders || opc.debug });
  } catch (e) {
    mostrarSinWebGL();
    resolverListo(false);
    return;
  }
  const { renderer, escena, camara, proyectar } = E3;

  const { tex, errores } = await cargarTexturas(renderer);
  for (const e of errores) console.error(`Proporción de captura: ${e}`);
  const env = crearEntorno(renderer);

  // ---------------- Objetos ----------------
  const fondo = crearFondo({ proyector: opc.proyector });
  const placaA = crearPlaca(tex, { w: 822, h: 456, recorteA: 'TL' });
  const placaB = crearPlaca(tex, { w: 822, h: 459, recorteA: 'BL' });
  placaA.grupo.children.forEach((m, i) => (m.renderOrder = 10 + i));
  placaB.grupo.children.forEach((m, i) => (m.renderOrder = 12 + i));
  const telefono = crearTelefono(tex, env);
  const ventana = crearVentana(tex);
  const portatil = crearPortatil(tex, env);
  const anillo = crearAnillo();
  const nodos = crearNodos(env);
  const tarjeta = crearTarjeta();
  escena.add(fondo.fondo, placaA.grupo, placaB.grupo, telefono.grupo, ventana.grupo, portatil.grupo, nodos.grupo, tarjeta.grupo, anillo.malla, fondo.vineta);

  const director = crearDirector({ reducido: opc.reducido, realce: opc.realce });
  const reloj = new Reloj();
  reloj.bucle = opc.bucle;
  if (opc.audio) {
    const a = new Audio(opc.audio);
    a.preload = 'auto';
    reloj.fuente = a;
  }

  // ---------------- Capa DOM ----------------
  const capa = crearCapa(escenarioDom, { M: director.M });
  const subtitulos = crearSubtitulos(escenarioDom);
  subtitulos.mostrar(opc.subs);
  const depuracion = opc.debug ? crearDepuracion(escenarioDom) : null;
  capa.medir();
  for (const a of capa.avisos) console.error(a);

  // ---------------- Tamaño ----------------
  let geo = null;
  function ajustar() {
    geo = E3.ajustar(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
    escenarioDom.style.transform = `translate(${geo.x}px, ${geo.y}px) scale(${geo.k})`;
    ajustarSubtitulos();
    sucio = true;
  }
  // Subtítulos frente a la barra de controles (que no escala con el escenario): mientras la
  // barra está visible, si la banda inferior no alcanza, la caja sube lo justo (en px lógicos).
  // En pantallas apaisadas pequeñas la letra no baja de 14 px reales.
  const SUBS = { base: 986, tam: 36, minReal: 14, aire: 12 };
  function ajustarSubtitulos() {
    if (!geo) return;
    const raiz = document.documentElement.style;
    const H = window.innerHeight;
    const barra = document.getElementById('barra');
    const libre = H - (geo.y + SUBS.base * geo.k); // px reales bajo la caja
    const ocupa =
      barra && barra.style.display !== 'none' ? barra.offsetHeight + (parseFloat(getComputedStyle(barra).bottom) || 0) + SUBS.aire : 0;
    raiz.setProperty('--subs-alza', String(Math.max(0, (ocupa - libre) / geo.k)));
    const apaisada = window.innerWidth >= H;
    const tam = apaisada ? Math.max(SUBS.tam, SUBS.minReal / geo.k) : SUBS.tam;
    raiz.setProperty('--subs-tam', String(Math.round(tam * 100) / 100));
  }
  window.addEventListener('resize', ajustar);

  // ---------------- Anclajes proyectados ----------------
  const tmp = new THREE.Vector3();
  const pA = [0, 0];
  function proyLocal(obj, lx, ly, out = [0, 0]) {
    tmp.set(lx, ly, 0).applyMatrix4(obj.matrixWorld);
    return proyectar(tmp.x, tmp.y, tmp.z, out);
  }
  function caja(pts) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const p of pts) {
      x0 = Math.min(x0, p[0]);
      y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]);
      y1 = Math.max(y1, p[1]);
    }
    return { x0, y0, x1, y1 };
  }
  // Rectángulo de captura (px) → rectángulo de lienzo a través de un plano.
  function rectCaptura(malla, local, r) {
    const pts = [
      [r[0], r[1]],
      [r[2], r[1]],
      [r[0], r[3]],
      [r[2], r[3]],
    ].map(([x, y]) => {
      local(x, y, tmp);
      return proyLocal(malla, tmp.x, tmp.y);
    });
    return caja(pts);
  }
  function conSep(b, sep, radio) {
    return { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, w: b.x1 - b.x0 + 2 * sep, h: b.y1 - b.y0 + 2 * sep, radio: radio + sep };
  }
  function resolver(o, t) {
    if (!o) return null;
    if (o.tipo === 'tel') {
      const b = rectCaptura(telefono.pantalla, telefono.localDeCaptura, o.rect);
      const esc = (b.x1 - b.x0) / (o.rect[2] - o.rect[0]);
      return conSep(b, o.sep, o.radio * esc);
    }
    if (o.tipo === 'ven') {
      const b = rectCaptura(ventana.contenido, ventana.localDeCaptura, o.rect);
      const esc = (b.x1 - b.x0) / (o.rect[2] - o.rect[0]);
      return conSep(b, o.sep, o.radio * esc);
    }
    if (o.tipo === 'rea') {
      const b = caja([
        proyLocal(ventana.realce, -0.5, 0.5),
        proyLocal(ventana.realce, 0.5, 0.5),
        proyLocal(ventana.realce, -0.5, -0.5),
        proyLocal(ventana.realce, 0.5, -0.5),
      ]);
      const esc = (b.x1 - b.x0) / (OBJ.w03Aaud.r[2] - OBJ.w03Aaud.r[0]);
      return conSep(b, o.sep, o.radio * esc);
    }
    if (o.tipo === 'nodo') {
      const n = nodos.nodos[o.i];
      const c = proyLocal(n, 0, 0);
      const borde = proyLocal(n, NODOS.diametro / 2, 0);
      const r = Math.abs(borde[0] - c[0]);
      const d = 2 * (r + o.sep);
      return { cx: c[0], cy: c[1], w: d, h: d, radio: d / 2 };
    }
    if (o.tipo === 'tarjeta') {
      const p = tarjeta.plano;
      const b = caja([proyLocal(p, -0.5, 0.5), proyLocal(p, 0.5, 0.5), proyLocal(p, -0.5, -0.5), proyLocal(p, 0.5, -0.5)]);
      const esc = (b.x1 - b.x0) / p.scale.x;
      // La separación se cierra (6 → 0 px) para ceder el sitio al borde propio de la tarjeta.
      const sep = o.sepFin === undefined ? o.sep : o.sep + (o.sepFin - o.sep) * tramo(t, o.t0, o.t1, 'power2.inOut');
      return conSep(b, sep, tarjeta.plano.material.uniforms.uRadio.value * esc);
    }
    return null;
  }
  const lerpR = (a, b, p) => ({
    cx: a.cx + (b.cx - a.cx) * p,
    cy: a.cy + (b.cy - a.cy) * p,
    w: a.w + (b.w - a.w) * p,
    h: a.h + (b.h - a.h) * p,
    radio: a.radio + (b.radio - a.radio) * p,
  });
  const HALO = [14, 0.3];

  // ---------------- Aplicar estado ----------------
  const proy = { iaA: null, iaB: null, demo: null, nodos: [null, null, null, null] };
  let ultimoAnillo = null;
  function aplicar(E) {
    fondo.aplicar(E.fondo);
    placaA.aplicar(E.placaA, aMundoX(RANURAS.placa.x + 411), aMundoY(RANURAS.placa.y + 228));
    placaB.aplicar(E.placaB, aMundoX(RANURAS.placaBL.x + 411), aMundoY(RANURAS.placaBL.y + 229.5));
    telefono.aplicar(E.tel);
    ventana.aplicar(E.ven, E.rea);
    nodos.aplicar(E);
    tarjeta.aplicar(E.tar);
    portatil.aplicar(E.lap);
    escena.updateMatrixWorld();

    // Anillo
    const A = E.anillo;
    let opAnillo = A.op;
    let r = null;
    let halo = HALO;
    if (A.op > 0.001 && A.obj) {
      const ra = resolver(A.obj.a, E.t);
      const ha = A.obj.a.halo || HALO;
      if (A.obj.b) {
        const rb = resolver(A.obj.b, E.t);
        const hb = A.obj.b.halo || HALO;
        r = lerpR(ra, rb, A.obj.p);
        halo = [ha[0] + (hb[0] - ha[0]) * A.obj.p, ha[1] + (hb[1] - ha[1]) * A.obj.p];
        // Entre dos campos del mismo formulario el anillo se atenúa al cruzar el contenido.
        if (A.obj.a.tipo === 'ven' && A.obj.b.tipo === 'ven') opAnillo *= 1 - 0.6 * Math.sin(Math.PI * A.obj.p);
      } else {
        r = ra;
        halo = ha;
      }
    }
    ultimoAnillo = r;
    anillo.aplicar(opAnillo, A.prog, r, halo, E.t, geo.pxLogico);

    // Rótulos y elementos DOM anclados
    proy.iaA = E.placaA.op > 0.001 ? proyLocal(placaA.foto, -0.5, -0.5, [0, 0]) : null;
    proy.iaB = E.placaB.op > 0.001 ? proyLocal(placaB.foto, -0.5, -0.5, [0, 0]) : null;
    proy.demo = E.ven.op > 0.001 ? proyLocal(ventana.contenido, 0.5, 0.5, [0, 0]) : null;
    for (let i = 0; i < 4; i++) {
      const n = nodos.nodos[i];
      if (E.nodos[i].op > 0.001) {
        const c = proyLocal(n, 0, 0, [0, 0]);
        const b = proyLocal(n, 60, 0);
        proy.nodos[i] = [c[0], c[1], Math.abs(b[0] - c[0]) / 60];
      } else proy.nodos[i] = null;
    }
  }

  function infoDepuracion(E) {
    const info = { escala: 0, foco: '', cebollaFoto: null, cebollaObj: null };
    if (E.ven.op > 0.5) {
      const a = proyLocal(ventana.contenido, -0.5, 0, [0, 0]);
      const b = proyLocal(ventana.contenido, 0.5, 0, [0, 0]);
      info.escala = (b[0] - a[0]) / E.ven.cont.vA[2];
      info.foco = E.ven.cont.A;
    } else if (E.tel.op > 0.5) {
      const a = proyLocal(telefono.pantalla, -0.5, 0, [0, 0]);
      const b = proyLocal(telefono.pantalla, 0.5, 0, [0, 0]);
      info.escala = (b[0] - a[0]) / 1080;
      info.foco = E.tel.mix > 0.5 ? 'm02' : 'm01';
    }
    const t = E.t;
    if (t > 9.5 && t < 10.6) {
      // Teléfono de la foto TR proyectado desde la placa.
      const v = E.placaA.vistaA;
      const loc = (x, y) => [((x - v[0]) / v[2]) - 0.5, 0.5 - (y - v[1]) / v[3]];
      const ang = (FOTO_TELEFONO.rollo * Math.PI) / 180;
      const hw = 61;
      const hh = FOTO_TELEFONO.alto / 2;
      const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => {
        const rx = x * Math.cos(ang) + y * Math.sin(ang);
        const ry = -x * Math.sin(ang) + y * Math.cos(ang);
        const [lx, ly] = loc(FOTO_TELEFONO.cx + rx, FOTO_TELEFONO.cy + ry);
        return proyLocal(placaA.foto, lx, ly, [0, 0]);
      });
      info.cebollaFoto = pts;
      info.cebollaObj = [[-165, 352], [165, 352], [165, -352], [-165, -352]].map(([x, y]) => proyLocal(telefono.grupo, x, y, [0, 0]));
    }
    if (t > 25.9 && t < 26.8) {
      const v = E.placaB.vistaA;
      const loc = (x, y) => [((x - v[0]) / v[2]) - 0.5, 0.5 - (y - v[1]) / v[3]];
      const M = FOTO_MONITOR;
      info.cebollaFoto = [[M.x0, M.y0], [M.x1, M.y0], [M.x1, M.y1], [M.x0, M.y1]].map(([x, y]) => proyLocal(placaB.foto, ...loc(x, y), [0, 0]));
      info.cebollaObj = [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]].map(([x, y]) => proyLocal(ventana.bisel, x, y, [0, 0]));
    }
    return info;
  }

  // ---------------- Dibujo ----------------
  let sucio = true;
  let ultimoT = -1;
  let cuadros = 0;
  const esperas = [];

  const marcas = [];
  function dibujar(t) {
    const E = director.muestrear(t);
    aplicar(E);
    capa.actualizar(t, E, proy);
    subtitulos.actualizar(t);
    if (depuracion) {
      const ahora = performance.now();
      marcas.push(ahora);
      while (marcas.length && ahora - marcas[0] > 1000) marcas.shift();
      const info = infoDepuracion(E);
      info.fps = reloj && reloj.reproduciendo ? marcas.length : 0;
      depuracion.actualizar(t, info);
    }
    renderer.render(escena, camara);
    cuadros++;
    return E;
  }

  // ---------------- Precarga y calentamiento ----------------
  ajustar();
  for (const t of Object.values(tex)) renderer.initTexture(t);
  escena.traverse((o) => (o.visible = true));
  try {
    await renderer.compileAsync(escena, camara);
  } catch (_) {
    renderer.compile(escena, camara);
  }
  for (const e of ESCENAS) dibujar((e.inicio + e.fin) / 2);
  for (const t of [10.0, 26.5, 30.0, 61.8, 71.8]) dibujar(t);

  // ---------------- Controles ----------------
  const musica = crearMusica();
  const app = {
    pedirCuadro: () => {
      sucio = true;
    },
  };
  const controles = crearControles({ reloj, app, subtitulos, musica, opciones: opc });
  crearRemoto({
    control: {
      getT: () => reloj.getT(),
      reproduciendo: () => reloj.reproduciendo,
      reproducir: () => reloj.reproducir(),
      pausar: () => reloj.pausar(),
      ir: async (t) => {
        reloj.pausar();
        reloj.ir(t);
        app.pedirCuadro();
        controles.refrescar();
      },
    },
  });
  ajustarSubtitulos();

  const t0 = opc.t !== null ? opc.t : 0;
  reloj.ir(t0);
  dibujar(t0);
  ultimoT = t0;

  function bucle() {
    requestAnimationFrame(bucle);
    const t = reloj.getT();
    if (t !== ultimoT || sucio) {
      dibujar(t);
      ultimoT = t;
      sucio = false;
    }
    controles.refrescar();
    musica.sincronizar(t, reloj.reproduciendo);
    if (esperas.length) {
      for (const w of esperas.splice(0)) requestAnimationFrame(() => w());
    }
  }
  requestAnimationFrame(bucle);

  const cub = document.getElementById('cubierta');
  if (cub) {
    cub.classList.add('oculta');
    await new Promise((r) => setTimeout(r, 450));
    cub.remove();
  }
  if (opc.autoplay && !opc.pausa) reloj.reproducir();
  // La música (apagada por defecto) se pre-renderiza en segundo plano para que la tecla M
  // responda al instante; el render sin conexión corre en el hilo de audio.
  if (opc.ui) {
    const pre = () => musica.preparar().catch((e) => console.warn('Música:', e));
    if ('requestIdleCallback' in window) requestIdleCallback(pre, { timeout: 4000 });
    else setTimeout(pre, 2500);
  }

  // ---------------- API para pruebas ----------------
  const tras = () => new Promise((r) => esperas.push(r));
  Object.assign(window.pc311, {
    webgl: true,
    getT: () => reloj.getT(),
    ir: async (t) => {
      reloj.pausar();
      reloj.ir(t);
      sucio = true;
      await tras();
      await tras();
    },
    reproducir: () => reloj.reproducir(),
    pausar: () => reloj.pausar(),
    reproducirHasta: (tf) =>
      new Promise((res) => {
        reloj.meta = tf;
        reloj.reproducir();
        const mirar = () => {
          if (!reloj.reproduciendo) tras().then(() => tras().then(() => res(reloj.getT())));
          else requestAnimationFrame(mirar);
        };
        requestAnimationFrame(mirar);
      }),
    muestrear: (t) => director.muestrear(t),
    subtitulo: (t) => segmentoEn(t),
    anillo: () => ultimoAnillo,
    ultimaClave: () => director.P.ultimaClave(),
    medirFps: (seg = 4) =>
      new Promise((res) => {
        const c0 = cuadros;
        const p0 = performance.now();
        reloj.reproducir();
        setTimeout(() => {
          reloj.pausar();
          res(((cuadros - c0) * 1000) / (performance.now() - p0));
        }, seg * 1000);
      }),
    info: () => ({ ...geo, dpr: window.devicePixelRatio, maxAniso: renderer.capabilities.getMaxAnisotropy(), duracion: DURACION }),
    recortes: RECORTES_FOTO,
    validar: () => [...validarGuion(), ...capa.avisos],
    rotuloDom: (id) => capa.rot[id],
    ui: () => controles.estado(),
    // Renderiza la pista original (sin reproducirla) y devuelve niveles para la QA.
    renderizarBuffer: (op) => renderizarMusica(op),
    probarMusica: async (op) => {
      const p0 = performance.now();
      const b = await renderizarMusica(op);
      const ms = performance.now() - p0;
      const d = b.getChannelData(0);
      const sr = b.sampleRate;
      const rms = (a, z) => {
        let s = 0;
        const i0 = Math.floor(a * sr);
        const i1 = Math.min(d.length, Math.floor(z * sr));
        for (let i = i0; i < i1; i++) s += d[i] * d[i];
        return Math.sqrt(s / Math.max(1, i1 - i0));
      };
      let pico = 0;
      for (let i = 0; i < d.length; i++) pico = Math.max(pico, Math.abs(d[i]));
      return { ms, duracion: b.duration, canales: b.numberOfChannels, pico, rms10a20: rms(10, 20), rms60a70: rms(60, 70), rms88_7a90: rms(88.7, 90) };
    },
  });
  resolverListo(true);
}
