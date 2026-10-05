// Subtítulos: texto literal de la locución, máximo dos líneas, centrados abajo
// sobre fondo oscuro translúcido. Entrada y salida de 0,2 s calculadas desde t.
import { SUBTITULOS, FUNDIDO_SUB } from '../data/guion.js';
import { clamp } from '../timeline/pistas.js';

export function segmentoEn(t) {
  for (let i = 0; i < SUBTITULOS.length; i++) {
    const s = SUBTITULOS[i];
    if (t >= s.ini && t < s.fin) {
      const op = Math.min(clamp((t - s.ini) / FUNDIDO_SUB), clamp((s.fin - t) / FUNDIDO_SUB));
      return { i, op, s };
    }
  }
  return null;
}

export function crearSubtitulos(padre) {
  const raiz = document.createElement('div');
  raiz.id = 'c-subs';
  const caja = document.createElement('div');
  caja.className = 'subs-caja';
  const l1 = document.createElement('span');
  const l2 = document.createElement('span');
  l1.className = 'subs-linea';
  l2.className = 'subs-linea';
  caja.append(l1, l2);
  raiz.append(caja);
  padre.append(raiz);
  let actual = -1;
  let opAnterior = -1;
  let visibles = true;

  function actualizar(t) {
    const seg = segmentoEn(t);
    const op = seg && visibles ? seg.op : 0;
    if (seg && seg.i !== actual) {
      actual = seg.i;
      const [a, b] = seg.s.texto.split(' / ');
      l1.textContent = a;
      l2.textContent = b || '';
      l2.style.display = b ? 'block' : 'none';
    }
    if (op !== opAnterior) {
      caja.style.opacity = String(op);
      caja.style.visibility = op > 0 ? 'visible' : 'hidden';
      opAnterior = op;
    }
  }

  function mostrar(v) {
    visibles = v;
    opAnterior = -1;
  }

  return { actualizar, mostrar, get visibles() { return visibles; }, caja };
}
