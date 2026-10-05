// Carga de las capturas originales como texturas fieles:
// createImageBitmap sin conversión de color ni premultiplicado, SRGBColorSpace,
// mipmaps con filtrado trilineal y anisotropía máxima. Nada de reescalados previos.
import * as THREE from 'three';
import { IMAGENES } from '../data/recursos.js';
import { RECORTES_FOTO } from '../data/medidas.js';

async function cargarBitmap(url) {
  const r = await fetch(url);
  const b = await r.blob();
  return createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
}

function crearTextura(fuente, aniso, mipmaps = true) {
  const t = fuente instanceof HTMLCanvasElement ? new THREE.CanvasTexture(fuente) : new THREE.Texture(fuente);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false; // origen arriba a la izquierda: px de captura = UV × tamaño
  t.premultiplyAlpha = false;
  t.anisotropy = aniso;
  t.generateMipmaps = mipmaps;
  t.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

// Versión desenfocada de un recorte (solo para las fotos de IA, nunca para capturas).
// Se extienden los bordes antes de desenfocar para que no entre la franja azul vecina.
function desenfocar(bm, rec, radio) {
  const pad = Math.ceil(radio * 3);
  const c = document.createElement('canvas');
  c.width = rec.w + 2 * pad;
  c.height = rec.h + 2 * pad;
  const g = c.getContext('2d');
  g.drawImage(bm, rec.x, rec.y, rec.w, rec.h, pad, pad, rec.w, rec.h);
  g.drawImage(bm, rec.x, rec.y, rec.w, 1, pad, 0, rec.w, pad);
  g.drawImage(bm, rec.x, rec.y + rec.h - 1, rec.w, 1, pad, pad + rec.h, rec.w, pad);
  g.drawImage(c, pad, 0, 1, c.height, 0, 0, pad, c.height);
  g.drawImage(c, pad + rec.w - 1, 0, 1, c.height, pad + rec.w, 0, pad, c.height);
  const out = document.createElement('canvas');
  out.width = rec.w;
  out.height = rec.h;
  const o = out.getContext('2d');
  o.filter = `blur(${radio}px)`;
  o.drawImage(c, -pad, -pad);
  return out;
}

export async function cargarTexturas(renderer) {
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const ids = Object.keys(IMAGENES);
  const bitmaps = await Promise.all(ids.map((id) => cargarBitmap(IMAGENES[id].url)));
  const tex = {};
  const errores = [];
  ids.forEach((id, i) => {
    const bm = bitmaps[i];
    const d = IMAGENES[id];
    if (bm.width !== d.w || bm.height !== d.h) errores.push(`${d.archivo}: ${bm.width}×${bm.height} ≠ ${d.w}×${d.h}`);
    tex[id] = crearTextura(bm, aniso);
    tex[id].userData = { w: bm.width, h: bm.height };
  });
  const ref = bitmaps[ids.indexOf('ref')];
  for (const f of Object.keys(RECORTES_FOTO)) {
    tex[`${f}6`] = crearTextura(desenfocar(ref, RECORTES_FOTO[f], 6), aniso, false);
    tex[`${f}16`] = crearTextura(desenfocar(ref, RECORTES_FOTO[f], 16), aniso, false);
  }
  return { tex, errores };
}
