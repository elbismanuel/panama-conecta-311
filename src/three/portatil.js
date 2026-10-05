// Portátil genérico del cierre: tapa con bisel de 14 px, pantalla 960×540 con web_01
// (captura real a 0,5) y base trapezoidal 1140×24. Sin logo de marca ni muesca.
import * as THREE from 'three';
import { crearMaterialCaptura, fijarCaptura } from './captura.js';
import { materialesCuerpo, cuerpoExtruido, formaRedondeada } from './entorno.js';
import { aMundoX, aMundoY } from './escenario.js';

export function crearPortatil(tex, env) {
  const grupo = new THREE.Group();
  const mats = materialesCuerpo(env);
  // Coordenadas locales relativas al pivote (1180, 470) del lienzo.
  const tapa = new THREE.Mesh(cuerpoExtruido(988, 568, 18, 10, 3), mats.marco);
  tapa.position.set(0, 470 - 460, 0); // centro de la tapa en y 460 del lienzo
  const vidrio = new THREE.Mesh(new THREE.ShapeGeometry(formaRedondeada(980, 560, 15), 20), mats.vidrio);
  vidrio.position.set(0, 10, 5.05);

  const matPant = crearMaterialCaptura();
  fijarCaptura(matPant, 'A', tex.w01, [0, 0, 1920, 1080]);
  matPant.uniforms.uTam.value.set(960, 540);
  matPant.uniforms.uRadio.value = 4;
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matPant);
  pantalla.scale.set(960, 540, 1);
  pantalla.position.set(0, 10, 5.4);

  // Base: trapecio (borde superior 1100, inferior 1140) en y 746–770 del lienzo.
  const forma = new THREE.Shape();
  const r = 5;
  forma.moveTo(-550 + r, 12);
  forma.lineTo(550 - r, 12);
  forma.quadraticCurveTo(550, 12, 552, 10);
  forma.lineTo(570, -9);
  forma.quadraticCurveTo(571, -12, 566, -12);
  forma.lineTo(-566, -12);
  forma.quadraticCurveTo(-571, -12, -570, -9);
  forma.lineTo(-552, 10);
  forma.quadraticCurveTo(-550, 12, -550 + r, 12);
  const geoBase = new THREE.ExtrudeGeometry(forma, {
    depth: 8,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geoBase.translate(0, 0, -4);
  const matBase = mats.marco.clone();
  matBase.color.set(0x3a4759);
  matBase.roughness = 0.28;
  matBase.envMapIntensity = 0.6;
  const base = new THREE.Mesh(geoBase, matBase);
  base.position.set(0, 470 - 758, 18);
  // Filo de luz del borde superior de la base (sin logo ni muesca).
  const matFilo = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, toneMapped: false });
  const filo = new THREE.Mesh(new THREE.PlaneGeometry(1096, 1.4), matFilo);
  filo.position.set(0, 470 - 746 - 0.5, 28.2);

  grupo.add(tapa, vidrio, pantalla, base, filo);
  tapa.renderOrder = 40;
  vidrio.renderOrder = 40.01;
  pantalla.renderOrder = 41;
  base.renderOrder = 40.02;

  const todos = [mats.marco, mats.vidrio, matBase];
  filo.renderOrder = 40.03;

  // Estado: { op, pose: [x, y, z, ry°, s] } (x, y = pivote en px del lienzo; s = escala).
  function aplicar(e) {
    grupo.visible = e.op > 0.001;
    if (!grupo.visible) return;
    const [x, y, z, ry, s = 1] = e.pose;
    grupo.position.set(aMundoX(x), aMundoY(y), z);
    grupo.scale.setScalar(s);
    grupo.rotation.set(0, THREE.MathUtils.degToRad(ry), 0);
    for (const m of todos) m.opacity = e.op;
    matFilo.opacity = 0.22 * e.op;
    matPant.uniforms.uOpacidad.value = e.op;
  }

  return { grupo, aplicar, pantalla };
}
