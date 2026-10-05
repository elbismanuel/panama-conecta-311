// Anillo guía: un único trazo cian (3 px) con filo exterior #003C6F al 60 % y halo que
// respira entre 30 y 40 %. Interior con alfa 0: nunca tapa lo resaltado.
// Se dibuja en espacio de pantalla con el rectángulo ya proyectado (px del lienzo).
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PANTALLA as VERT, EXTENSION } from './shaders.js';

const FRAG = /* glsl */ `
uniform vec2 uCentro;
uniform vec2 uMedia;
uniform float uRadio;
uniform float uProg;
uniform float uOpacidad;
uniform float uHaloA;
uniform float uHaloW;
uniform float uT;
uniform float uPx;
uniform float uGrosor;
varying vec2 vPx;
${GLSL_COMUN}

// Posición sobre el perímetro medida desde el centro superior por la mitad derecha
// (el trazo se dibuja simétrico hacia ambos lados y se cierra abajo).
float perimetro(vec2 p, vec2 b, float r) {
  vec2 a = max(b - r, vec2(0.0));
  float X = abs(p.x);
  float Y = p.y;
  vec2 q = vec2(X - a.x, abs(Y) - a.y);
  float arco = 1.5707963 * r;
  float s = 0.0;
  if (q.x > 0.0 && q.y > 0.0) {
    s = Y < 0.0 ? a.x + r * atan(q.x, q.y) : a.x + arco + 2.0 * a.y + r * atan(q.y, q.x);
  } else if (q.x > q.y) {
    s = a.x + arco + clamp(Y, -a.y, a.y) + a.y;
  } else if (Y < 0.0) {
    s = clamp(X, 0.0, a.x);
  } else {
    s = a.x + 2.0 * arco + 2.0 * a.y + (a.x - clamp(X, 0.0, a.x));
  }
  return s;
}

void main() {
  vec2 p = vPx - uCentro;
  float d = sdCaja(p, uMedia, uRadio);
  vec2 a = max(uMedia - uRadio, vec2(0.0));
  float mitad = 2.0 * a.x + 2.0 * a.y + 3.14159265 * uRadio;
  float s = perimetro(p, uMedia, uRadio);
  float vis = 1.0;
  if (uProg < 0.999) {
    vis = (1.0 - smoothstep(uProg * mitad - 1.0, uProg * mitad + 1.0, s)) * smoothstep(0.0, 0.03, uProg);
  }
  float aa = uPx * 0.75;
  // Grosor del trazo (3 px) y del filo, × uGrosor en pantallas pequeñas (≥ 1,6 px reales).
  float t1 = 1.5 * uGrosor;
  float t2 = 2.5 * uGrosor;
  float trazo = 1.0 - smoothstep(t1 - aa, t1 + aa, abs(d));
  float filo = smoothstep(t1 - aa, t1 + aa, d) * (1.0 - smoothstep(t2 - aa, t2 + aa, d)) * 0.6;
  float respira = 1.0 + 0.3333 * (0.5 + 0.5 * sin(6.2831853 * uT / 2.4));
  float halo = uHaloA * respira * pow(1.0 - clamp((d - t2) / uHaloW, 0.0, 1.0), 2.0) * step(t2, d);
  vec3 CIAN = vec3(95.0, 211.0, 243.0) / 255.0;
  vec3 AZUL = vec3(0.0, 60.0, 111.0) / 255.0;
  vec3 C = CIAN * halo;
  float A = halo;
  C = AZUL * filo + C * (1.0 - filo);
  A = filo + A * (1.0 - filo);
  C = CIAN * trazo + C * (1.0 - trazo);
  A = trazo + A * (1.0 - trazo);
  float k = vis * uOpacidad;
  gl_FragColor = vec4(C * k, A * k);
}
`;

export function crearAnillo() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCaja: { value: new THREE.Vector4(0, 0, 1, 1) },
      uExt: EXTENSION,
      uCentro: { value: new THREE.Vector2() },
      uMedia: { value: new THREE.Vector2(10, 10) },
      uRadio: { value: 8 },
      uProg: { value: 1 },
      uOpacidad: { value: 0 },
      uHaloA: { value: 0.3 },
      uHaloW: { value: 14 },
      uT: { value: 0 },
      uPx: { value: 1 },
      uGrosor: { value: 1 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const malla = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  malla.frustumCulled = false;
  malla.renderOrder = 100;

  // r = { cx, cy, w, h, radio } en px del lienzo; halo = [ancho, alfa]; grosor (composición).
  function aplicar(op, prog, r, halo, t, pxLienzo, grosor = 1) {
    malla.visible = op > 0.001 && !!r;
    if (!malla.visible) return;
    const u = mat.uniforms;
    const m = halo[0] + 6 * grosor;
    u.uCaja.value.set(r.cx - r.w / 2 - m, r.cy - r.h / 2 - m, r.cx + r.w / 2 + m, r.cy + r.h / 2 + m);
    u.uCentro.value.set(r.cx, r.cy);
    u.uMedia.value.set(r.w / 2, r.h / 2);
    u.uRadio.value = Math.min(r.radio, r.w / 2, r.h / 2);
    u.uProg.value = prog;
    u.uOpacidad.value = op;
    u.uHaloW.value = halo[0];
    u.uHaloA.value = halo[1];
    u.uT.value = t;
    u.uPx.value = pxLienzo;
    u.uGrosor.value = grosor;
  }
  return { malla, aplicar };
}
