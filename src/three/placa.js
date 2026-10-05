// Placa de foto ilustrativa (generada por IA): esquinas SDF de 16 px, filo de 1 px,
// sombra suave detrás, desenfoque simulado en tres niveles (nítida / 6 px / 16 px),
// atenuación de brillo y viñeta interna del 12 %. Solo se aplica a las fotos.
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO } from './shaders.js';
import { crearSombra } from './sombra.js';
import { RECORTES_FOTO } from '../data/medidas.js';

const FRAG = /* glsl */ `
uniform sampler2D tRef;
uniform vec2 uTamRef;
uniform vec4 uRecA;
uniform vec4 uRecB;
uniform vec4 uVistaA;
uniform vec4 uVistaB;
uniform sampler2D tMedA;
uniform sampler2D tFuerteA;
uniform float uMezcla;
uniform float uBlur;
uniform float uDim;
uniform float uOpacidad;
uniform vec2 uTam;
uniform float uRadio;
varying vec2 vUv;
${GLSL_COMUN}
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 qa = uVistaA.xy + uv * uVistaA.zw;
  vec3 c = aSrgb(texture2D(tRef, (uRecA.xy + qa) / uTamRef).rgb);
  if (uBlur > 0.0) {
    vec2 ur = qa / uRecA.zw;
    vec3 m = aSrgb(texture2D(tMedA, ur).rgb);
    vec3 f = aSrgb(texture2D(tFuerteA, ur).rgb);
    c = uBlur < 0.5 ? mix(c, m, uBlur * 2.0) : mix(m, f, uBlur * 2.0 - 1.0);
  }
  if (uMezcla > 0.0) {
    vec2 qb = uVistaB.xy + uv * uVistaB.zw;
    vec3 cb = aSrgb(texture2D(tRef, (uRecB.xy + qb) / uTamRef).rgb);
    c = mix(c, cb, uMezcla);
  }
  vec2 dv = (vUv - 0.5) * 2.0;
  float vin = smoothstep(0.55, 1.45, length(dv * vec2(1.0, 0.82)));
  c *= 1.0 - 0.12 * vin;
  c *= uDim;
  vec2 p = (vUv - 0.5) * uTam;
  float dB = sdCaja(p, uTam * 0.5, uRadio);
  float aa = max(fwidth(dB), 1e-4);
  float a = clamp(0.5 - dB / aa, 0.0, 1.0);
  float filo = 1.0 - smoothstep(0.0, aa * 1.2, abs(dB + 0.5 * aa));
  c = mix(c, vec3(1.0), 0.10 * filo);
  gl_FragColor = vec4(c, a * uOpacidad);
}
`;

export function crearPlaca(tex, { w, h, recorteA = 'TL' }) {
  const grupo = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tRef: { value: tex.ref },
      uTamRef: { value: new THREE.Vector2(tex.ref.userData.w, tex.ref.userData.h) },
      uRecA: { value: new THREE.Vector4() },
      uRecB: { value: new THREE.Vector4() },
      uVistaA: { value: new THREE.Vector4(0, 0, w, h) },
      uVistaB: { value: new THREE.Vector4(0, 0, w, h) },
      tMedA: { value: tex[`${recorteA}6`] },
      tFuerteA: { value: tex[`${recorteA}16`] },
      uMezcla: { value: 0 },
      uBlur: { value: 0 },
      uDim: { value: 1 },
      uOpacidad: { value: 1 },
      uTam: { value: new THREE.Vector2(w, h) },
      uRadio: { value: 16 },
    },
    vertexShader: VERT_PLANO,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const foto = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  foto.scale.set(w, h, 1);
  const sombra = crearSombra({ suave: 34, opacidad: 0.4 });
  sombra.position.set(0, -24, -4);
  sombra.userData.ajustar(w, h, 16);
  grupo.add(sombra, foto);
  grupo.userData = { foto, sombra, mat, w, h };

  function fijarRecorte(ranura, nombre) {
    const r = RECORTES_FOTO[nombre];
    mat.uniforms[`uRec${ranura}`].value.set(r.x, r.y, r.w, r.h);
    if (ranura === 'A') {
      mat.uniforms.tMedA.value = tex[`${nombre}6`];
      mat.uniforms.tFuerteA.value = tex[`${nombre}16`];
    }
  }

  // Estado: { op, z, ry, blur, dim, fotoA, vistaA, fotoB, vistaB, mix, cx, cy, s }
  // (cx, cy: centro en px lógicos; s: escala de la placa según la composición).
  function aplicar(e, cx, cy, s = 1) {
    const u = mat.uniforms;
    grupo.visible = e.op > 0.001;
    if (!grupo.visible) return;
    fijarRecorte('A', e.fotoA);
    u.uVistaA.value.set(...e.vistaA);
    if (e.mix > 0 && e.vistaB) {
      fijarRecorte('B', e.fotoB);
      u.uVistaB.value.set(...e.vistaB);
    }
    u.uMezcla.value = e.mix;
    u.uBlur.value = e.blur;
    u.uDim.value = e.dim;
    u.uOpacidad.value = e.op;
    sombra.material.uniforms.uOpacidad.value = 0.4 * e.op * e.op;
    grupo.position.set(cx, cy, e.z);
    grupo.scale.setScalar(s);
    grupo.rotation.set(0, THREE.MathUtils.degToRad(e.ry), 0);
  }

  return { grupo, aplicar, foto };
}
