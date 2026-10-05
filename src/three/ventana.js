// Ventana web: plano de contenido (captura real) + losa de bisel #0E1A2B de 10 px y
// radio 18 dibujada por SDF (cambia de tamaño sin deformar las esquinas) + sombra.
// Sin barra de navegador inventada. Incluye el plano de «realce» de la escena 04.
import * as THREE from 'three';
import { GLSL_COMUN, VERT_PLANO, srgb } from './shaders.js';
import { crearMaterialCaptura, fijarCaptura, fijarCorte } from './captura.js';
import { crearSombra } from './sombra.js';
import { aMundoX, aMundoY } from './escenario.js';
import { OBJ } from '../data/medidas.js';

const FRAG_BISEL = /* glsl */ `
uniform vec2 uTam;
uniform float uRadio;
uniform float uOpacidad;
uniform vec3 uArriba;
uniform vec3 uAbajo;
varying vec2 vUv;
${GLSL_COMUN}
void main() {
  vec2 p = (vUv - 0.5) * uTam;
  float d = sdCaja(p, uTam * 0.5, uRadio);
  float aa = max(fwidth(d), 1e-4);
  float a = clamp(0.5 - d / aa, 0.0, 1.0);
  vec3 c = mix(uAbajo, uArriba, smoothstep(0.0, 1.0, vUv.y));
  // filo de luz superior y canto sutil
  float canto = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + 0.75 * aa));
  float arriba = smoothstep(0.25, 0.5, p.y / uTam.y + 0.25);
  c = mix(c, vec3(1.0), canto * (0.05 + 0.10 * arriba));
  gl_FragColor = vec4(c, a * uOpacidad);
}
`;

export function crearVentana(tex) {
  const grupo = new THREE.Group();

  const matBisel = new THREE.ShaderMaterial({
    uniforms: {
      uTam: { value: new THREE.Vector2(1, 1) },
      uRadio: { value: 18 },
      uOpacidad: { value: 1 },
      uArriba: { value: srgb(0x13233a) },
      uAbajo: { value: srgb(0x0b1524) },
    },
    vertexShader: VERT_PLANO,
    fragmentShader: FRAG_BISEL,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const bisel = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matBisel);
  bisel.position.z = -1.5;

  const matCont = crearMaterialCaptura();
  const contenido = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matCont);

  const sombra = crearSombra({ suave: 40, opacidad: 0.5 });
  sombra.position.z = -6;

  // Realce de «Recolección - AAUD»: recorte exacto de la misma captura que se eleva en z.
  const A = OBJ.w03Aaud.r;
  const matRea = crearMaterialCaptura();
  fijarCaptura(matRea, 'A', tex.w03, [A[0], A[1], A[2] - A[0], A[3] - A[1]]);
  matRea.uniforms.uTam.value.set(A[2] - A[0], A[3] - A[1]);
  matRea.uniforms.uRadio.value = OBJ.w03Aaud.radio;
  const realce = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matRea);
  realce.scale.set(A[2] - A[0], A[3] - A[1], 1);
  const sombraRea = crearSombra({ suave: 16, opacidad: 0.38 });

  grupo.add(sombra, bisel, contenido, sombraRea, realce);
  sombra.renderOrder = 30;
  bisel.renderOrder = 31;
  contenido.renderOrder = 32;
  sombraRea.renderOrder = 33;
  realce.renderOrder = 34;

  const vistaA = [0, 0, 1, 1];

  // e: estado de la ventana (director.js); rea: { op, z }; texturas por id.
  function aplicar(e, rea) {
    grupo.visible = e.op > 0.001;
    if (!grupo.visible) return;
    const [x, y, w, h] = e.rect;
    grupo.position.set(aMundoX(x + w / 2), aMundoY(y + h / 2), e.z);
    grupo.rotation.set(THREE.MathUtils.degToRad(e.rx), 0, 0);
    const b = 10 * e.bisel;
    bisel.scale.set(w + 2 * b, h + 2 * b, 1);
    matBisel.uniforms.uTam.value.set(w + 2 * b, h + 2 * b);
    matBisel.uniforms.uRadio.value = 18 * e.bisel;
    matBisel.uniforms.uOpacidad.value = e.op;
    contenido.scale.set(w, h, 1);
    const u = matCont.uniforms;
    u.uTam.value.set(w, h);
    u.uRadio.value = 8 * e.bisel;
    u.uOpacidad.value = e.op;
    u.uEnc.value = e.enc;
    const c = e.cont;
    fijarCaptura(matCont, 'A', tex[c.A], c.vA, c.limA ?? 1e6);
    vistaA[0] = c.vA[0];
    vistaA[1] = c.vA[1];
    vistaA[2] = c.vA[2];
    vistaA[3] = c.vA[3];
    if (c.B) fijarCaptura(matCont, 'B', tex[c.B], c.vB, c.limB ?? 1e6);
    u.uMezcla.value = c.B ? c.mix : 0;
    u.uPaso.value = c.B && c.paso ? 1 : 0;
    u.uVelo.value = e.velo;
    // Con la tarjeta AAUD elevada, la original queda velada bajo su sombra.
    const elevada = rea.op > 0 && c.A === 'w03' && rea.z > 2;
    fijarCorte(matCont, e.corte, elevada);
    sombra.position.y = -30;
    sombra.userData.ajustar(w + 2 * b, h + 2 * b, 18, e.op * e.op);

    // Realce: solo mientras dura (29,6–31,4) y con la vista de web_03 a escala 1,0.
    const visible = rea.op > 0 && c.A === 'w03';
    realce.visible = visible;
    sombraRea.visible = visible;
    if (visible) {
      const cxA = (A[0] + A[2]) / 2;
      const cyA = (A[1] + A[3]) / 2;
      const lx = ((cxA - c.vA[0]) / c.vA[2] - 0.5) * w;
      const ly = (0.5 - (cyA - c.vA[1]) / c.vA[3]) * h;
      realce.position.set(lx, ly, rea.z);
      const elev = Math.min(1, rea.z / 120);
      sombraRea.position.set(lx, ly - 4 - 8 * elev, 0.5);
      sombraRea.userData.ajustar(A[2] - A[0], A[3] - A[1], 8, elev);
      matRea.uniforms.uOpacidad.value = e.op;
    }
  }

  // px de captura A → punto local del plano unitario de contenido.
  function localDeCaptura(px, py, out) {
    out.set((px - vistaA[0]) / vistaA[2] - 0.5, 0.5 - (py - vistaA[1]) / vistaA[3], 0);
    return out;
  }

  return { grupo, contenido, realce, bisel, aplicar, localDeCaptura, matCont };
}
