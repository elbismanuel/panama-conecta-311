// Shader de captura: muestra una captura real como capa plana, sin alterarla.
// - Recorte/encuadre por UV (uVista en px de captura), mezcla de dos texturas intactas.
// - Esquinas SDF del plano, sin deformar la imagen (la vista conserva la proporción).
// - Velo: fuera de uCorte mezcla #061629 al uVelo; DENTRO el píxel sale idéntico al texel.
// - En reposo (una textura, sin velo, escala 1,0, desplazamiento entero) = texel exacto.
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO, srgb } from './shaders.js';

const FRAG = /* glsl */ `
uniform sampler2D tA;
uniform sampler2D tB;
uniform vec2 uTexA;
uniform vec2 uTexB;
uniform vec4 uVistaA;
uniform vec4 uVistaB;
uniform float uLimA;
uniform float uLimB;
uniform vec3 uRelleno;
uniform float uMezcla;
uniform vec2 uTam;
uniform float uRadio;
uniform vec4 uCorte;
uniform vec4 uCorte2;
uniform float uMezclaCorte;
uniform vec2 uRadioCorte;
uniform float uPaso;
uniform vec3 uColorPaso;
uniform float uVelo;
uniform vec3 uColorVelo;
uniform float uEnc;
uniform vec3 uApagado;
uniform float uOpacidad;
uniform float uSesgo;
varying vec2 vUv;
${GLSL_COMUN}

// Recorte con esquinas redondeadas (radio en px de captura): el velo sigue el contorno real.
float dentroDe(vec4 r, vec2 px, float radio) {
  vec2 centro = (r.xy + r.zw) * 0.5;
  vec2 media = (r.zw - r.xy) * 0.5;
  float d = sdCaja(px - centro, media, min(radio, min(media.x, media.y)));
  float fw = max(max(fwidth(px.x), fwidth(px.y)), 1e-4);
  return clamp(0.5 - d / fw, 0.0, 1.0);
}

vec3 muestra(sampler2D t, vec2 tam, vec4 vista, float lim, vec2 uv, out vec2 px) {
  px = vista.xy + uv * vista.zw;
  vec3 c = aSrgb(texture2D(t, px / tam, uSesgo).rgb);
  // Por debajo del recorte vertical se rellena de blanco (no debería verse en reposo).
  return mix(c, uRelleno, step(lim, px.y));
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 pxA;
  vec3 c = muestra(tA, uTexA, uVistaA, uLimA, uv, pxA);
  if (uMezcla > 0.0) {
    vec2 pxB;
    vec3 cb = muestra(tB, uTexB, uVistaB, uLimB, uv, pxB);
    float m = uMezcla;
    if (uPaso > 0.5) {
      // Cambio de página: A se funde al fondo claro de la web y de ahí aparece B (sin doble exposición).
      c = m < 0.5 ? mix(c, uColorPaso, smoothstep(0.0, 1.0, m * 2.0)) : mix(uColorPaso, cb, smoothstep(0.0, 1.0, m * 2.0 - 1.0));
    } else {
      c = mix(c, cb, m);
    }
  }
  if (uVelo > 0.0) {
    // Velo fuera del recorte; entre dos objetivos el recorte se funde (no se desliza).
    float dentro = mix(dentroDe(uCorte, pxA, uRadioCorte.x), dentroDe(uCorte2, pxA, uRadioCorte.y), uMezclaCorte);
    c = mix(c, uColorVelo, uVelo * (1.0 - dentro));
  }
  c = mix(uApagado, c, uEnc);
  vec2 p = (vUv - 0.5) * uTam;
  float dB = sdCaja(p, uTam * 0.5, uRadio);
  float aa = max(fwidth(dB), 1e-4);
  float a = clamp(0.5 - dB / aa, 0.0, 1.0);
  gl_FragColor = vec4(c, a * uOpacidad);
}
`;

export function crearMaterialCaptura() {
  return new THREE.ShaderMaterial({
    uniforms: {
      tA: { value: null },
      tB: { value: null },
      uTexA: { value: new THREE.Vector2(1, 1) },
      uTexB: { value: new THREE.Vector2(1, 1) },
      uVistaA: { value: new THREE.Vector4(0, 0, 1, 1) },
      uVistaB: { value: new THREE.Vector4(0, 0, 1, 1) },
      uLimA: { value: 1e6 },
      uLimB: { value: 1e6 },
      uRelleno: { value: srgb(0xffffff) },
      uMezcla: { value: 0 },
      uTam: { value: new THREE.Vector2(100, 100) },
      uRadio: { value: 0 },
      uCorte: { value: new THREE.Vector4(0, 0, 0, 0) },
      uCorte2: { value: new THREE.Vector4(0, 0, 0, 0) },
      uMezclaCorte: { value: 0 },
      uRadioCorte: { value: new THREE.Vector2(0, 0) },
      uPaso: { value: 0 },
      uColorPaso: { value: srgb(0xf3f4f6) },
      uVelo: { value: 0 },
      uColorVelo: { value: srgb(0x061629) },
      uEnc: { value: 1 },
      uApagado: { value: srgb(0x05080d) },
      uOpacidad: { value: 1 },
      uSesgo: { value: -0.35 },
    },
    vertexShader: VERT_PLANO,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

// Recorte del velo: { a, b, p, ra, rb } (rectángulos y radios en px de captura) o null.
export function fijarCorte(mat, corte, vacio = false) {
  const u = mat.uniforms;
  if (!corte || vacio) {
    u.uCorte.value.set(0, 0, 0, 0);
    u.uCorte2.value.set(0, 0, 0, 0);
    u.uMezclaCorte.value = 0;
    u.uRadioCorte.value.set(0, 0);
    return;
  }
  u.uCorte.value.set(corte.a[0], corte.a[1], corte.a[2], corte.a[3]);
  u.uCorte2.value.set(corte.b[0], corte.b[1], corte.b[2], corte.b[3]);
  u.uMezclaCorte.value = corte.p;
  u.uRadioCorte.value.set(corte.ra || 0, corte.rb || 0);
}

// Asigna una textura y su vista a la ranura A o B del material.
export function fijarCaptura(mat, ranura, tex, vista, limite = 1e6) {
  const u = mat.uniforms;
  u[`t${ranura}`].value = tex;
  u[`uTex${ranura}`].value.set(tex.userData.w, tex.userData.h);
  u[`uVista${ranura}`].value.set(vista[0], vista[1], vista[2], vista[3]);
  u[`uLim${ranura}`].value = limite;
}
