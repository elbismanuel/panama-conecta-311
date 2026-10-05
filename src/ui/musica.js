// Música instrumental ORIGINAL generada con Web Audio (sin muestras externas):
// 100 BPM, pad suave en Re mayor, bajo, pulso discreto y arpegio tenue.
// Se pre-renderiza la pista completa de 90 s con OfflineAudioContext y se reproduce
// desde el desplazamiento t del reloj maestro (pausa y scrub incluidos).
// Fundido de salida completo antes de 89 s: el último segundo es silencio.

const SR = 32000; // suficiente para un pad suave y renderiza más rápido (el navegador remuestrea al reproducir)
const DUR = 90;
const NEGRA = 60 / 100;
const COMPAS = NEGRA * 4;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// PRNG con semilla (la reverberación es idéntica en cada render).
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Acordes: [bajo, voces del pad]
const ACORDES = {
  D: [38, [57, 61, 64, 66]], // Dmaj9
  Bm: [35, [54, 57, 61, 62]], // Bm9
  G: [43, [54, 57, 59, 62]], // Gmaj9
  A: [45, [52, 57, 59, 64]], // Asus2
};

function programa() {
  const lista = [];
  const ciclo = ['D', 'Bm', 'G', 'A'];
  let t = 0;
  let i = 0;
  while (t < 81.6 - 1e-6) {
    lista.push({ t, dur: 2 * COMPAS, ac: ciclo[i % 4] });
    t += 2 * COMPAS;
    i++;
  }
  lista.push({ t: 81.6, dur: COMPAS, ac: 'G' });
  lista.push({ t: 84.0, dur: 5.0, ac: 'D' });
  return lista;
}

export async function renderizarMusica({ reverb = 1, sr = SR } = {}) {
  // Pocas voces persistentes con automatización (en vez de un nodo por nota):
  // el render sin conexión es mucho más rápido y el resultado es idéntico en cada carga.
  const ctx = new OfflineAudioContext(2, sr * DUR, sr);
    const prog = programa();

  const maestro = ctx.createGain();
  maestro.gain.setValueAtTime(0, 0);
  maestro.gain.linearRampToValueAtTime(1, 2.5);
  maestro.gain.setValueAtTime(1, 85.6);
  maestro.gain.linearRampToValueAtTime(0.0001, 88.6);
  maestro.gain.setValueAtTime(0, 88.62);
  maestro.connect(ctx.destination);

  // Reverberación ligera: cuatro líneas de retardo realimentadas y amortiguadas
  // (mucho más barata que una convolución y sin muestras externas).
  const rev = ctx.createGain();
  rev.gain.value = 1;
  const salidaRev = ctx.createGain();
  salidaRev.gain.value = reverb > 0.05 ? 0.32 : 0;
  const retardos = [0.0437, 0.0571, 0.0683, 0.0797];
  retardos.forEach((dt, i) => {
    const d = ctx.createDelay(1);
    d.delayTime.value = dt * 3.1;
    const amort = ctx.createBiquadFilter();
    amort.type = 'lowpass';
    amort.frequency.value = 2600;
    const fb = ctx.createGain();
    fb.gain.value = 0.72;
    const pan = ctx.createStereoPanner();
    pan.pan.value = i % 2 ? 0.6 : -0.6;
    rev.connect(d);
    d.connect(amort).connect(fb).connect(d);
    amort.connect(pan).connect(salidaRev);
  });
  salidaRev.connect(maestro);
  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(maestro);
  bus.connect(rev);

  // Pad: cuatro voces (dos osciladores desafinados cada una) que cambian de nota por acorde.
  const filtroPad = ctx.createBiquadFilter();
  filtroPad.type = 'lowpass';
  filtroPad.Q.value = 0.4;
  // Frecuencias fijas por tramos (sin rampas: el render sin conexión es mucho más rápido).
  filtroPad.frequency.setValueAtTime(1000, 0);
  filtroPad.frequency.setValueAtTime(1300, 32);
  filtroPad.frequency.setValueAtTime(1600, 62);
  filtroPad.frequency.setValueAtTime(1200, 82);
  filtroPad.connect(bus);
  for (let vi = 0; vi < 4; vi++) {
    const nivel = vi % 2 ? 0.05 : 0.026;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(nivel, 2.5);
    const pan = ctx.createStereoPanner();
    pan.pan.value = (vi / 3 - 0.5) * 0.7;
    g.connect(pan).connect(filtroPad);
    for (const desafino of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = vi % 2 ? 'triangle' : 'sawtooth';
      o.detune.value = desafino;
      let previa = null;
      for (const a of prog) {
        const f = mtof(ACORDES[a.ac][1][vi]);
        if (previa === null) o.frequency.setValueAtTime(f, 0);
        else if (f !== previa) {
          o.frequency.setValueAtTime(previa, a.t);
          o.frequency.exponentialRampToValueAtTime(f, a.t + 0.18);
        }
        previa = f;
      }
      o.connect(g);
      o.start(0);
      o.stop(DUR);
    }
    // Pequeña respiración en cada cambio de acorde.
    for (const a of prog) {
      if (a.t < 4) continue;
      g.gain.setValueAtTime(nivel, a.t - 0.35);
      g.gain.linearRampToValueAtTime(nivel * 0.6, a.t);
      g.gain.linearRampToValueAtTime(nivel, a.t + 1.0);
    }
  }

  // Bajo suave desde la escena 02.
  {
    const o = ctx.createOscillator();
    o.type = 'sine';
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    for (const a of prog) {
      if (a.t + a.dur <= 8) continue;
      const t0 = Math.max(a.t, 8);
      o.frequency.setValueAtTime(mtof(ACORDES[a.ac][0]), t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.16, t0 + 0.06);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + Math.max(0.3, (a.t + a.dur - t0) * 0.8));
      g.gain.linearRampToValueAtTime(0, Math.min(DUR, a.t + a.dur) - 0.02);
    }
    o.connect(g).connect(bus);
    o.start(0);
    o.stop(DUR);
  }

  // Pulso discreto en cada negra (16,2 → 81,6 s).
  {
    const o = ctx.createOscillator();
    o.type = 'sine';
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    o.frequency.setValueAtTime(92, 0);
    let n = 0;
    for (let t = 16.2; t < 81.6; t += NEGRA, n++) {
      const acento = n % 4 === 0 ? 1 : 0.65;
      o.frequency.setValueAtTime(92, t);
      o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22 * acento, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      g.gain.setValueAtTime(0, t + 0.27);
    }
    o.connect(g).connect(maestro);
    o.start(0);
    o.stop(DUR);
  }

  // Arpegio tenue en corcheas (24 → 81,6 s).
  {
    const filtroArp = ctx.createBiquadFilter();
    filtroArp.type = 'lowpass';
    filtroArp.frequency.setValueAtTime(2400, 0);
    filtroArp.frequency.setValueAtTime(3000, 62);
    filtroArp.connect(bus);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    const pan = ctx.createStereoPanner();
    const patron = [0, 2, 1, 3, 2, 1, 3, 2];
    o.frequency.setValueAtTime(440, 0);
    for (const a of prog) {
      const voces = ACORDES[a.ac][1];
      for (let k = 0; k < Math.round(a.dur / (NEGRA / 2)); k++) {
        const t = a.t + k * (NEGRA / 2);
        if (t < 24 || t >= 81.6) continue;
        o.frequency.setValueAtTime(mtof(voces[patron[k % patron.length]] + 12), t);
        pan.pan.setValueAtTime(k % 2 ? 0.25 : -0.25, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.04, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.28);
        g.gain.setValueAtTime(0, t + 0.29);
      }
    }
    o.connect(g).connect(pan).connect(filtroArp);
    o.start(0);
    o.stop(DUR);
  }

  // Campana de cierre (84,4 s): Re y La agudos, decaimiento largo.
  for (const [m, nivel] of [[74, 0.07], [81, 0.035]]) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 84.4);
    g.gain.linearRampToValueAtTime(nivel, 84.42);
    g.gain.exponentialRampToValueAtTime(0.0005, 88.4);
    g.gain.setValueAtTime(0, 88.45);
    o.connect(g).connect(bus);
    o.start(84.4);
    o.stop(88.5);
  }

  return ctx.startRendering();
}

export function crearMusica() {
  let ctx = null;
  let buffer = null;
  let preparando = null;
  let fuente = null;
  let inicioCtx = 0;
  let inicioT = 0;
  let activa = false;
  const ganancia = { nodo: null };

  async function preparar() {
    if (buffer) return buffer;
    if (!preparando) preparando = renderizarMusica().then((b) => (buffer = b));
    return preparando;
  }

  function detener() {
    if (fuente) {
      try {
        fuente.stop();
      } catch (_) {
        /* ya detenida */
      }
      fuente.disconnect();
      fuente = null;
    }
  }

  function arrancar(t) {
    detener();
    if (!buffer || !ctx || t >= 88.7) return;
    fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.connect(ganancia.nodo);
    inicioCtx = ctx.currentTime + 0.02;
    inicioT = t;
    fuente.start(inicioCtx, t);
  }

  // Se llama en cada cuadro con el t del reloj maestro.
  function sincronizar(t, reproduciendo) {
    if (!activa || !buffer || !ctx) return;
    if (!reproduciendo) {
      if (fuente) detener();
      return;
    }
    if (!fuente) {
      arrancar(t);
      return;
    }
    const esperado = inicioT + (ctx.currentTime - inicioCtx);
    if (Math.abs(esperado - t) > 0.08) arrancar(t);
  }

  async function alternar() {
    activa = !activa;
    if (activa) {
      if (!ctx) {
        ctx = new AudioContext();
        ganancia.nodo = ctx.createGain();
        ganancia.nodo.gain.value = 0.9;
        ganancia.nodo.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') await ctx.resume();
      await preparar();
    } else detener();
    return activa;
  }

  return {
    alternar,
    sincronizar,
    preparar,
    get activa() {
      return activa;
    },
    get lista() {
      return !!buffer;
    },
  };
}
