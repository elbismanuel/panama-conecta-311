// Escena 08: cuatro discos 3D (Ø120, grosor 16) con aro de borde blanco al 30 %.
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO } from './shaders.js';
import { NODOS } from '../data/medidas.js';
import { aMundoX, aMundoY } from './escenario.js';

const FRAG_ARO = /* glsl */ `
uniform float uOpacidad;
varying vec2 vUv;
${GLSL_COMUN}
void main() {
  vec2 p = (vUv - 0.5) * 128.0;
  float d = abs(length(p) - 59.0);
  float aa = max(fwidth(d), 1e-4);
  float a = 1.0 - smoothstep(0.75 - aa, 0.75 + aa, d);
  gl_FragColor = vec4(vec3(1.0), 0.30 * a * uOpacidad);
}
`;

export function crearNodos(env) {
  const grupo = new THREE.Group();
  const geo = new THREE.CylinderGeometry(NODOS.diametro / 2, NODOS.diametro / 2, NODOS.grosor, 96, 1);
  geo.rotateX(Math.PI / 2);
  const nodos = NODOS.x.map((x, i) => {
    const n = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0a2b4d,
      emissive: 0x0a2b4d,
      emissiveIntensity: 0.9,
      metalness: 0.0,
      roughness: 0.5,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      envMap: env,
      envMapIntensity: 0.22,
      transparent: true,
    });
    const disco = new THREE.Mesh(geo, mat);
    disco.position.z = -NODOS.grosor / 2;
    const matAro = new THREE.ShaderMaterial({
      uniforms: { uOpacidad: { value: 1 } },
      vertexShader: VERT_PLANO,
      fragmentShader: FRAG_ARO,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const aro = new THREE.Mesh(new THREE.PlaneGeometry(128, 128), matAro);
    aro.position.z = 0.6;
    disco.renderOrder = 50 + i * 0.1;
    aro.renderOrder = 50.05 + i * 0.1;
    n.add(disco, aro);
    n.userData = { mat, matAro, x };
    grupo.add(n);
    return n;
  });

  // E: { nodos:[{op,s,z}], nodosDim, nodosDx, nodosPos:[[x,y]×4], nodosEsc } (composición).
  function aplicar(E) {
    let alguno = false;
    nodos.forEach((n, i) => {
      const s = E.nodos[i];
      n.visible = s.op > 0.001;
      if (!n.visible) return;
      alguno = true;
      const brillo = i < 3 ? E.nodosDim : 1;
      const [x, y] = E.nodosPos[i];
      n.position.set(aMundoX(x + E.nodosDx), aMundoY(y), s.z);
      n.scale.setScalar(E.nodosEsc === 1 ? s.s : s.s * E.nodosEsc);
      n.userData.mat.opacity = s.op * brillo;
      n.userData.matAro.uniforms.uOpacidad.value = s.op * brillo;
    });
    grupo.visible = alguno;
  }

  return { grupo, nodos, aplicar };
}
