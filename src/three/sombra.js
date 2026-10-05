// Sombra suave: plano con SDF de rectángulo redondeado difuminado (sin texturas).
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO } from './shaders.js';

const FRAG = /* glsl */ `
uniform vec2 uTamPlano;
uniform vec2 uTamObj;
uniform float uRadio;
uniform float uSuave;
uniform float uOpacidad;
varying vec2 vUv;
${GLSL_COMUN}
void main() {
  vec2 p = (vUv - 0.5) * uTamPlano;
  float d = sdCaja(p, uTamObj * 0.5, uRadio);
  float a = 1.0 - smoothstep(-uSuave, uSuave, d);
  gl_FragColor = vec4(vec3(0.008, 0.024, 0.05), a * a * uOpacidad);
}
`;

export function crearSombra({ suave = 30, opacidad = 0.4 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTamPlano: { value: new THREE.Vector2(1, 1) },
      uTamObj: { value: new THREE.Vector2(1, 1) },
      uRadio: { value: 16 },
      uSuave: { value: suave },
      uOpacidad: { value: opacidad },
    },
    vertexShader: VERT_PLANO,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const malla = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  malla.userData.opBase = opacidad;
  // Ajusta tamaño del objeto que proyecta la sombra (en px) y su radio.
  malla.userData.ajustar = (w, h, radio, op = 1) => {
    const m = mat.uniforms;
    const margen = m.uSuave.value * 2.2;
    m.uTamObj.value.set(w, h);
    m.uTamPlano.value.set(w + 2 * margen, h + 2 * margen);
    m.uRadio.value = radio;
    m.uOpacidad.value = opacidad * op;
    malla.scale.set(w + 2 * margen, h + 2 * margen, 1);
  };
  return malla;
}
