// Renderizador, cámara «en píxeles» y conversión lienzo ↔ mundo.
// El lienzo lógico es la ventana entera (W × H px lógicos, composicion.js): no hay bandas ni
// «escenario» dentro de la ventana. Cámara fija en (0, 0, D) con D = 540 / tan(15°) ≈ 2015,3:
// en z = 0, 1 unidad de mundo = 1 px lógico; el fov vertical cubre H (30° cuando H = 1080), así
// que la perspectiva de lo que se acerca o se aleja (z ≠ 0) es la misma en cualquier pantalla.
import * as THREE from 'three';
import { ANCHO, ALTO } from '../data/medidas.js';
import { EXTENSION } from './shaders.js';

export const D = 540 / Math.tan(THREE.MathUtils.degToRad(15));

// Lienzo lógico vigente (lo fija ajustar()).
export const LIENZO = { W: ANCHO, H: ALTO };

export function aMundoX(px) {
  return px - LIENZO.W / 2;
}
export function aMundoY(py) {
  return LIENZO.H / 2 - py;
}

// Tope del búfer de dibujo (≈ 8,3 Mpx, un 4K).
const TOPE_BUFER = 3840 * 2160;

export function crearEscenario(canvas, { calidadBaja = false, verificarShaders = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !calidadBaja,
    alpha: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // solo afecta a los cuerpos MeshPhysical
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x061629, 1);
  renderer.setPixelRatio(1);
  // Los avisos benignos del compilador HLSL (ANGLE) ensucian la consola; se comprueban
  // los shaders solo con ?shaders=1 o ?debug=1.
  renderer.debug.checkShaderErrors = verificarShaders;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(30, ANCHO / ALTO, 10, 10000);
  camara.position.set(0, 0, D);
  camara.lookAt(0, 0, 0);
  camara.updateProjectionMatrix();
  camara.updateMatrixWorld(true);

  const tamBufer = new THREE.Vector2(ANCHO, ALTO);
  const v = new THREE.Vector3();
  const X = EXTENSION.value; // extensión visible en px lógicos (0, 0, W, H)

  // Proyecta un punto de mundo a px lógicos del lienzo (0–W × 0–H).
  function proyectar(x, y, z, out = [0, 0]) {
    v.set(x, y, z).project(camara);
    out[0] = X.x + (v.x + 1) * 0.5 * (X.z - X.x);
    out[1] = X.y + (1 - v.y) * 0.5 * (X.w - X.y);
    return out;
  }
  function proyectarV(vec, out = [0, 0]) {
    return proyectar(vec.x, vec.y, vec.z, out);
  }

  // Ajusta lienzo, búfer y cámara a la composición L. El búfer va a la resolución real de la
  // pantalla (px CSS × devicePixelRatio, con dpr ≤ 2): el navegador no reescala el lienzo y las
  // capturas se filtran una sola vez (mipmaps + anisotropía). Tope total ≈ 8,3 Mpx.
  function ajustar(L, dpr) {
    const { W, H } = L;
    LIENZO.W = W;
    LIENZO.H = H;
    const d = calidadBaja ? 1 : Math.min(Math.max(dpr || 1, 1), 2);
    let bw = Math.max(1, Math.round(L.anchoCss * d));
    let bh = Math.max(1, Math.round(L.altoCss * d));
    if (bw * bh > TOPE_BUFER) {
      const f = Math.sqrt(TOPE_BUFER / (bw * bh));
      bw = Math.max(1, Math.floor(bw * f));
      bh = Math.max(1, Math.floor(bh * f));
    }
    renderer.setSize(bw, bh, false);
    tamBufer.set(bw, bh);
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.width = `${L.anchoCss}px`;
    canvas.style.height = `${L.altoCss}px`;
    X.set(0, 0, W, H);
    camara.aspect = W / H;
    camara.fov = H === ALTO ? 30 : 2 * THREE.MathUtils.radToDeg(Math.atan(H / 2 / D));
    camara.updateProjectionMatrix();
    // px lógicos por px de búfer (antialias de los quads en pantalla).
    const pxLogico = W / bw;
    return { k: L.k, W, H, bw, bh, dpr: d, pxLogico, ext: [0, 0, W, H] };
  }

  return { renderer, escena, camara, proyectar, proyectarV, ajustar, tamBufer };
}
