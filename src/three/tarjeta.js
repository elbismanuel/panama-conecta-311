// Escena 09: tarjeta editorial «Consulta del caso». Plano SDF de tamaño variable
// (crece desde el nodo «Registra» sin deformar esquinas), degradado #0A2B4D → #003C6F,
// filo de luz superior, brillo especular que la recorre y borde cian propio.
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO } from './shaders.js';
import { crearSombra } from './sombra.js';
import { aMundoX, aMundoY } from './escenario.js';

const FRAG = /* glsl */ `
uniform vec2 uTam;
uniform float uRadio;
uniform float uOpacidad;
uniform float uBorde;
uniform float uBrillo;
varying vec2 vUv;
${GLSL_COMUN}
void main() {
  vec2 p = (vUv - 0.5) * uTam;
  float d = sdCaja(p, uTam * 0.5, uRadio);
  float aa = max(fwidth(d), 1e-4);
  float a = clamp(0.5 - d / aa, 0.0, 1.0);
  vec3 c0 = vec3(10.0, 43.0, 77.0) / 255.0;
  vec3 c1 = vec3(0.0, 60.0, 111.0) / 255.0;
  float g = clamp(0.62 * (1.0 - vUv.y) + 0.38 * vUv.x, 0.0, 1.0);
  vec3 c = mix(c0, c1, g);
  // Brillo especular: banda diagonal suave que cruza la tarjeta una vez.
  float diag = (vUv.x - (1.0 - vUv.y) * 0.45);
  float pos = mix(-0.6, 1.4, uBrillo);
  float banda = exp(-pow((diag - pos) / 0.16, 2.0)) * step(0.001, uBrillo) * (1.0 - step(0.999, uBrillo));
  c += vec3(0.07, 0.10, 0.13) * banda;
  // Filo de luz superior (1 px blanco al 18 %).
  float canto = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + 0.6 * aa));
  float arriba = smoothstep(0.1, 0.45, p.y / uTam.y);
  c = mix(c, vec3(1.0), canto * 0.18 * arriba);
  // Borde cian propio (recibe el relevo del anillo guía).
  float borde = 1.0 - smoothstep(1.5 - aa, 1.5 + aa, abs(d + 1.5));
  c = mix(c, vec3(95.0, 211.0, 243.0) / 255.0, borde * uBorde);
  gl_FragColor = vec4(c, a * uOpacidad);
}
`;

export function crearTarjeta() {
  const grupo = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTam: { value: new THREE.Vector2(820, 500) },
      uRadio: { value: 24 },
      uOpacidad: { value: 1 },
      uBorde: { value: 0 },
      uBrillo: { value: 0 },
    },
    vertexShader: VERT_PLANO,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  const sombra = crearSombra({ suave: 44, opacidad: 0.55 });
  sombra.position.set(0, -30, -6);
  grupo.add(sombra, plano);
  sombra.renderOrder = 60;
  plano.renderOrder = 61;

  // e: { op, rect:[x,y,w,h], radio, z, ry, rx, borde, brillo }
  function aplicar(e) {
    grupo.visible = e.op > 0.001;
    if (!grupo.visible) return;
    const [x, y, w, h] = e.rect;
    grupo.position.set(aMundoX(x + w / 2), aMundoY(y + h / 2), e.z);
    grupo.rotation.set(THREE.MathUtils.degToRad(e.rx), THREE.MathUtils.degToRad(e.ry), 0);
    plano.scale.set(w, h, 1);
    const u = mat.uniforms;
    u.uTam.value.set(w, h);
    u.uRadio.value = e.radio;
    u.uOpacidad.value = e.op;
    u.uBorde.value = e.borde;
    u.uBrillo.value = e.brillo;
    sombra.userData.ajustar(w, h, e.radio, e.op * Math.max(0, Math.min(1, (w - 120) / 300)));
  }

  return { grupo, plano, aplicar };
}
