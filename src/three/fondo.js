// «Estudio»: degradado vertical + charco de luz (modo screen) + dither ±1/255.
// Viñeta inferior en espacio de pantalla (encima de lo 3D, debajo del DOM).
// Ambos quads cubren el lienzo lógico entero (EXTENSION = la ventana): el degradado se estira
// con el alto de la pantalla (uEscY = 1080 / H) y nunca hay aristas ni bandas.
// Escena 10A: banda de horizonte cian (en 16:9 en y 770) y «suelo» oscuro; su posición sale de
// la composición (uHorizonte = y, cx, semiancho).
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PANTALLA, EXTENSION } from './shaders.js';
import { VINETA } from '../data/medidas.js';

const FRAG_FONDO = /* glsl */ `
uniform vec4 uLuz;
uniform float uHoriz;
uniform float uGrano;
uniform float uRealce;
uniform float uEscY;
uniform vec3 uHorizonte;
varying vec2 vPx;
${GLSL_COMUN}
vec3 hx(float r, float g, float b) { return vec3(r, g, b) / 255.0; }
void main() {
  vec3 c0 = hx(10.0, 43.0, 77.0);   // #0A2B4D
  vec3 c1 = hx(6.0, 22.0, 41.0);    // #061629
  vec3 c2 = hx(4.0, 16.0, 31.0);    // #04101F
  float y = vPx.y * uEscY;
  vec3 c = y < 650.0 ? mix(c0, c1, smoothstep(0.0, 650.0, y)) : mix(c1, c2, smoothstep(650.0, 1080.0, y));
  // Charco de luz: #0B4F8A con un 10 % de cian, mezclado en modo screen.
  vec3 L = mix(hx(11.0, 79.0, 138.0), hx(95.0, 211.0, 243.0), 0.10);
  float dd = length(vPx - uLuz.xy) / max(uLuz.z, 1.0);
  float k = uLuz.w * uRealce * exp(-2.4 * dd * dd);
  c = 1.0 - (1.0 - c) * (1.0 - L * k);
  if (uHoriz > 0.0) {
    float dy = vPx.y - uHorizonte.x;
    float lateral = exp(-pow((vPx.x - uHorizonte.y) / uHorizonte.z, 2.0));
    float banda = exp(-pow(dy / 3.0, 2.0));
    float halo = exp(-abs(dy) / 45.0) * 0.55;
    float suelo = smoothstep(0.0, 140.0, dy);
    c = mix(c, hx(4.0, 16.0, 31.0), uHoriz * suelo * 0.8);
    c = mix(c, hx(95.0, 211.0, 243.0), clamp(0.18 * (banda + halo) * lateral * uHoriz, 0.0, 1.0));
  }
  float n = hash12(floor(gl_FragCoord.xy) + vec2(uGrano * 7.13, uGrano * 3.71)) - 0.5;
  c += n * (2.0 / 255.0);
  gl_FragColor = vec4(c, 1.0);
}
`;

const FRAG_VINETA = /* glsl */ `
uniform float uFuerza;
uniform vec2 uVineta; // inicio y recorrido en px lógicos
varying vec2 vPx;
void main() {
  float p = clamp((vPx.y - uVineta.x) / uVineta.y, 0.0, 1.0);
  float a = 0.88 * p * p * (3.0 - 2.0 * p) * uFuerza;
  gl_FragColor = vec4(vec3(4.0, 16.0, 31.0) / 255.0, a);
}
`;

function quadPantalla(frag, uniforms, caja) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uCaja: { value: new THREE.Vector4(...caja) }, uExt: EXTENSION, ...uniforms },
    vertexShader: VERT_PANTALLA,
    fragmentShader: frag,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.frustumCulled = false;
  return m;
}

export function crearFondo({ proyector = false } = {}) {
  const fondo = quadPantalla(
    FRAG_FONDO,
    {
      uLuz: { value: new THREE.Vector4(1420, 460, 700, 0.35) },
      uHoriz: { value: 0 },
      uGrano: { value: 0 },
      uRealce: { value: proyector ? 1.2 : 1.0 },
      uEscY: { value: 1 },
      uHorizonte: { value: new THREE.Vector3(770, 960, 600) },
    },
    [0, 0, 1920, 1080],
  );
  fondo.material.transparent = false;
  fondo.renderOrder = -100;
  const vineta = quadPantalla(FRAG_VINETA, { uFuerza: { value: 0 }, uVineta: { value: new THREE.Vector2(...VINETA.normal) } }, [0, 780, 1920, 1080]);
  vineta.renderOrder = 95;

  function aplicar(f) {
    const u = fondo.material.uniforms;
    u.uLuz.value.set(f.luz[0], f.luz[1], f.luz[2], f.luz[3]);
    u.uHoriz.value = f.horiz;
    u.uGrano.value = f.grano;
    u.uEscY.value = 1080 / f.grad[1];
    u.uHorizonte.value.set(f.horizonte[0], f.horizonte[1], f.horizonte[2]);
    vineta.material.uniforms.uFuerza.value = f.vineta;
    vineta.material.uniforms.uVineta.value.set(f.vinetaY[0], f.vinetaY[1]);
    vineta.visible = f.vineta > 0.001;
    // Los dos quads cubren toda la extensión visible (bandas incluidas).
    const X = EXTENSION.value;
    fondo.material.uniforms.uCaja.value.set(X.x, X.y, X.z, X.w);
    vineta.material.uniforms.uCaja.value.set(X.x, f.vinetaY[0], X.z, Math.max(X.w, f.vinetaY[0] + 1));
  }
  return { fondo, vineta, aplicar };
}
