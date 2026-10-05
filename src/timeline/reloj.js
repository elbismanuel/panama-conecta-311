// Reloj maestro único. t = t0 + (ahora − p0)/1000 · ritmo, limitado a [0, 90].
// Todo lo visible se deriva de este valor; pausar, saltar o retroceder no deja rastro.
import { DURACION } from '../data/medidas.js';

export class Reloj {
  constructor() {
    this.t0 = 0;
    this.p0 = performance.now();
    this.corriendo = false;
    this.ritmo = 1;
    this.bucle = false;
    this.meta = null; // detener exactamente en este t (pruebas)
    this.alTerminar = null;
    this.fuente = null; // elemento <audio> opcional como reloj maestro (?audio=)
  }

  get reproduciendo() {
    return this.corriendo;
  }

  getT() {
    if (!this.corriendo) return this.t0;
    let t;
    if (this.fuente && !this.fuente.paused) t = this.fuente.currentTime;
    else t = this.t0 + ((performance.now() - this.p0) / 1000) * this.ritmo;
    if (this.meta !== null && t >= this.meta) {
      t = this.meta;
      this.meta = null;
      this.pausarEn(t);
      return t;
    }
    if (t >= DURACION) {
      if (this.bucle) {
        this.t0 = 0;
        this.p0 = performance.now();
        if (this.fuente) this.fuente.currentTime = 0;
        return 0;
      }
      this.pausarEn(DURACION);
      if (this.alTerminar) this.alTerminar();
      return DURACION;
    }
    return t;
  }

  reproducir() {
    if (this.corriendo) return;
    if (this.t0 >= DURACION) this.t0 = 0;
    this.p0 = performance.now();
    this.corriendo = true;
    if (this.fuente) {
      this.fuente.currentTime = this.t0;
      this.fuente.play().catch(() => {});
    }
  }

  pausar() {
    if (!this.corriendo) return;
    this.pausarEn(this.getT());
  }

  pausarEn(t) {
    this.t0 = t;
    this.corriendo = false;
    if (this.fuente) this.fuente.pause();
  }

  alternar() {
    if (this.corriendo) this.pausar();
    else this.reproducir();
  }

  ir(t) {
    this.t0 = Math.min(DURACION, Math.max(0, t));
    this.p0 = performance.now();
    if (this.fuente) this.fuente.currentTime = this.t0;
  }
}
