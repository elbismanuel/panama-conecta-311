// Teléfono Android genérico: cuerpo 330×704×22 (radio 44) a escala 1, bisel de 12,
// cara frontal de vidrio, cámara en el bisel (sin perforar la pantalla) y botones laterales.
// La pantalla es una capa plana con la captura real (306×680 = 0,2833 de 1080×2400).
import * as THREE from 'three';
import { crearMaterialCaptura, fijarCaptura, fijarCorte } from './captura.js';
import { materialesCuerpo, cuerpoExtruido, formaRedondeada } from './entorno.js';
import { aMundoX, aMundoY } from './escenario.js';

export const TEL = { cuerpoW: 330, cuerpoH: 704, radio: 44, grosor: 22, pantW: 306, pantH: 680, radioPant: 34 };

export function crearTelefono(tex, env) {
  const grupo = new THREE.Group();
  const mats = materialesCuerpo(env);
  const cuerpo = new THREE.Mesh(cuerpoExtruido(TEL.cuerpoW, TEL.cuerpoH, TEL.radio, TEL.grosor, 5), mats.marco);
  const frente = TEL.grosor / 2;
  const vidrio = new THREE.Mesh(new THREE.ShapeGeometry(formaRedondeada(324, 698, 41), 24), mats.vidrio);
  vidrio.position.z = frente + 0.05;
  const lente = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), mats.camara);
  lente.position.set(0, TEL.cuerpoH / 2 - 6.2, frente + 0.12);
  const botonP = new THREE.Mesh(new THREE.BoxGeometry(3, 64, 7), mats.marco);
  botonP.position.set(TEL.cuerpoW / 2 + 0.8, 150, 0);
  const botonV = new THREE.Mesh(new THREE.BoxGeometry(3, 104, 7), mats.marco);
  botonV.position.set(TEL.cuerpoW / 2 + 0.8, 30, 0);

  const matPant = crearMaterialCaptura();
  matPant.uniforms.uRadio.value = TEL.radioPant;
  matPant.uniforms.uTam.value.set(TEL.pantW, TEL.pantH);
  fijarCaptura(matPant, 'A', tex.m01, [0, 0, 1080, 2400]);
  fijarCaptura(matPant, 'B', tex.m02, [0, 0, 1080, 2400]);
  // Cambio de pantalla de la app: pasa por su propio fondo (#F3F4F6), sin doble exposición.
  matPant.uniforms.uPaso.value = 1;
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matPant);
  pantalla.scale.set(TEL.pantW, TEL.pantH, 1);
  pantalla.position.z = frente + 0.4;

  grupo.add(cuerpo, vidrio, lente, botonP, botonV, pantalla);
  [cuerpo, vidrio, lente, botonP, botonV].forEach((m, i) => (m.renderOrder = 20 + i * 0.01));
  pantalla.renderOrder = 21;
  grupo.rotation.order = 'XYZ';

  // Estado: { op, pose:[x,y,z,s,rx,ry,rz], mix, enc, velo, corte }.
  function aplicar(e) {
    grupo.visible = e.op > 0.001;
    if (!grupo.visible) return;
    const [x, y, z, s, rx, ry, rz] = e.pose;
    grupo.position.set(aMundoX(x), aMundoY(y), z);
    grupo.scale.setScalar(s);
    grupo.rotation.set(THREE.MathUtils.degToRad(rx), THREE.MathUtils.degToRad(ry), THREE.MathUtils.degToRad(rz));
    for (const m of [mats.marco, mats.vidrio, mats.camara]) m.opacity = e.op;
    const u = matPant.uniforms;
    u.uOpacidad.value = e.op;
    u.uMezcla.value = e.mix;
    u.uEnc.value = e.enc;
    u.uVelo.value = e.velo;
    fijarCorte(matPant, e.corte);
  }

  // px de captura (1080×2400) → punto local del plano unitario de la pantalla
  // (se transforma con pantalla.matrixWorld, que ya incluye la escala 306×680).
  function localDeCaptura(px, py, out) {
    out.set(px / 1080 - 0.5, 0.5 - py / 2400, 0);
    return out;
  }

  return { grupo, pantalla, aplicar, localDeCaptura, matPant };
}
