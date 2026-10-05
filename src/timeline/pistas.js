// Pistas declarativas: el estado visual es una función pura de t.
// Cada pista es una lista de claves [t, valor, curva]; la curva de la clave j
// gobierna el tramo que termina en ella. Antes de la primera clave vale el primer
// valor y después de la última, el último. Los valores pueden ser números o
// vectores (se interpolan por componente). Sin acumuladores ni azar.
import { gsap } from 'gsap';

const lineal = (p) => p;
const salto = (p) => (p >= 1 ? 1 : 0);
const cache = new Map();

export function curva(nombre) {
  if (typeof nombre === 'function') return nombre;
  if (!nombre || nombre === 'none' || nombre === 'lineal') return lineal;
  if (nombre === 'salto') return salto;
  let f = cache.get(nombre);
  if (!f) {
    f = gsap.parseEase(nombre);
    if (typeof f !== 'function') throw new Error(`Curva desconocida: ${nombre}`);
    cache.set(nombre, f);
  }
  return f;
}

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, p) => a + (b - a) * p;

export function mezclar(a, b, p) {
  if (typeof a === 'number') return a + (b - a) * p;
  const n = a.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] + (b[i] - a[i]) * p;
  return out;
}

// Progreso con curva de un tramo [t0, t1] (0 antes, 1 después).
export function tramo(t, t0, t1, nombreCurva = 'none') {
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  return curva(nombreCurva)((t - t0) / (t1 - t0));
}

// Envolvente suave para oscilaciones ambientales: 0 fuera de [t0, t1].
// Siempre vale 0 desde t ≥ 89 (último segundo en calma total).
export function envolvente(t, t0, t1, borde = 0.5) {
  if (t >= 89) return 0;
  const a = clamp((t - t0) / borde);
  const b = clamp((t1 - t) / borde);
  const s = (x) => x * x * (3 - 2 * x);
  return s(a) * s(b);
}

export class Pistas {
  constructor() {
    this.mapa = new Map();
    this.listas = false;
  }

  // claves: [[t, valor, curva?], ...]
  k(nombre, claves) {
    let l = this.mapa.get(nombre);
    if (!l) {
      l = [];
      this.mapa.set(nombre, l);
    }
    for (const c of claves) l.push({ t: c[0], v: c[1], e: curva(c[2]) });
    this.listas = false;
    return this;
  }

  finalizar() {
    for (const [nombre, l] of this.mapa) {
      l.sort((a, b) => a.t - b.t);
      for (let i = 1; i < l.length; i++) {
        if (l[i].t === l[i - 1].t) throw new Error(`Pista «${nombre}»: dos claves en t=${l[i].t}`);
      }
    }
    this.listas = true;
  }

  v(nombre, t) {
    const l = this.mapa.get(nombre);
    if (!l) throw new Error(`Pista inexistente: ${nombre}`);
    const n = l.length;
    if (t <= l[0].t) return l[0].v;
    if (t >= l[n - 1].t) return l[n - 1].v;
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (l[m].t <= t) lo = m;
      else hi = m;
    }
    const a = l[lo];
    const b = l[hi];
    return mezclar(a.v, b.v, b.e((t - a.t) / (b.t - a.t)));
  }

  // Última clave de una pista (para pruebas: todas deben terminar en t ≤ 89).
  ultimaClave() {
    let max = 0;
    for (const l of this.mapa.values()) max = Math.max(max, l[l.length - 1].t);
    return max;
  }
}
