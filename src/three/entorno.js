// Entorno de reflejos para los CUERPOS de los dispositivos (nunca para las pantallas):
// PMREM de RoomEnvironment más dos tiras emisivas cian que dibujan el reflejo de borde.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function crearEntorno(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const sala = new RoomEnvironment();
  const cian = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x5fd3f3).multiplyScalar(5) });
  const tira1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 9, 0.25), cian);
  tira1.position.set(-9, 6, 4);
  const tira2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 9, 0.25), cian);
  tira2.position.set(9, 6, -2);
  sala.add(tira1, tira2);
  const env = pmrem.fromScene(sala, 0.04).texture;
  pmrem.dispose();
  return env;
}

export function materialesCuerpo(env) {
  const marco = new THREE.MeshPhysicalMaterial({
    color: 0x1b2636,
    metalness: 0.6,
    roughness: 0.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMap: env,
    envMapIntensity: 0.4,
    transparent: true,
  });
  // Vidrio frontal oscuro: reflejo muy contenido para que el bisel se lea negro, no plateado.
  const vidrio = new THREE.MeshPhysicalMaterial({
    color: 0x05080d,
    metalness: 0.0,
    roughness: 0.32,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    envMap: env,
    envMapIntensity: 0.1,
    transparent: true,
  });
  const camara = new THREE.MeshPhysicalMaterial({
    color: 0x0a0f18,
    metalness: 0.0,
    roughness: 0.3,
    envMap: env,
    envMapIntensity: 0.15,
    transparent: true,
  });
  return { marco, vidrio, camara };
}

export function formaRedondeada(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
}

// Cuerpo extruido con bisel (esquinas redondeadas reales en XY, cantos suaves en Z).
export function cuerpoExtruido(w, h, r, grosor, bisel) {
  const geo = new THREE.ExtrudeGeometry(formaRedondeada(w - 2 * bisel, h - 2 * bisel, Math.max(1, r - bisel)), {
    depth: grosor - 2 * bisel,
    bevelEnabled: true,
    bevelThickness: bisel,
    bevelSize: bisel,
    bevelSegments: 6,
    curveSegments: 28,
  });
  geo.translate(0, 0, -(grosor - 2 * bisel) / 2);
  // Normales suaves: el perfil del bisel es tangente a la cara y al canto.
  geo.deleteAttribute('uv');
  geo.deleteAttribute('normal');
  const suave = mergeVertices(geo, 1e-3);
  suave.computeVertexNormals();
  return suave;
}
