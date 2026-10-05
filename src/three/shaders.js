// Fragmentos GLSL compartidos.
// Convención: las texturas son SRGBColorSpace (la GPU las decodifica a lineal al
// muestrear); los shaders propios componen en sRGB y escriben sRGB directamente
// en el lienzo, sin tonemapping. Así, en reposo, el píxel de salida es el texel exacto.
import * as THREE from 'three';

export const GLSL_COMUN = /* glsl */ `
vec3 aSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
float sdCaja(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

export const VERT_PLANO = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Extensión visible del lienzo lógico (x0, y0, x1, y1) en px: [0, 0, 1920, 1080] en 16:9 y
// mayor cuando la ventana tiene otra proporción (el fondo cubre las bandas). Es un uniform
// COMPARTIDO por todos los quads en espacio de pantalla (fondo, viñeta, anillo).
export const EXTENSION = { value: new THREE.Vector4(0, 0, 1920, 1080) };

// Vértice de un quad en espacio de pantalla definido por uCaja (px lógicos).
export const VERT_PANTALLA = /* glsl */ `
uniform vec4 uCaja; // x0, y0, x1, y1 en px del lienzo
uniform vec4 uExt;
varying vec2 vPx;
void main() {
  vec2 px = mix(uCaja.xy, uCaja.zw, vec2(uv.x, 1.0 - uv.y));
  vPx = px;
  vec2 n = (px - uExt.xy) / (uExt.zw - uExt.xy);
  gl_Position = vec4(n.x * 2.0 - 1.0, 1.0 - n.y * 2.0, 0.0, 1.0);
}
`;

// Color hexadecimal → vec3 sRGB (0..1), sin conversión a lineal.
export function srgb(hex) {
  return new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}
