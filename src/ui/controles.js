// Controles discretos fuera del escenario lógico: barra translúcida inferior que aparece
// al mover el ratón y se oculta (con el cursor) tras 2,5 s sin movimiento durante la
// reproducción. Atajos de teclado y modo presentación (P / ?present=1).
import { ESCENAS } from '../data/guion.js';
import { DURACION } from '../data/medidas.js';
import { icono } from './iconos.js';

const fmt = (t) => {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0').replace('.', ',')}`;
};

export function crearControles({ reloj, app, subtitulos, musica, opciones }) {
  const marco = document.getElementById('marco');
  let presentacion = !!opciones.presentacion;
  let uiVisible = opciones.ui !== false;
  let temporizador = 0;
  let arrastrando = false;
  let seguiaReproduciendo = false;
  let bloqueoPantalla = null;

  // --- Botón grande inicial ---
  const granPlay = document.createElement('button');
  granPlay.id = 'gran-play';
  granPlay.setAttribute('aria-label', 'Reproducir');
  granPlay.innerHTML = icono('play', 44, 2);
  document.body.append(granPlay);

  // --- Barra ---
  const barra = document.createElement('div');
  barra.id = 'barra';
  barra.innerHTML = `
    <button data-a="play" title="Reproducir / pausar (Espacio)" aria-label="Reproducir">${icono('play', 20)}</button>
    <button data-a="reiniciar" title="Reiniciar (Inicio)" aria-label="Reiniciar">${icono('reiniciar', 19)}</button>
    <span class="tiempo">00:00,0 / 01:30,0</span>
    <div id="linea-tiempo" role="slider" aria-label="Posición" aria-valuemin="0" aria-valuemax="90" tabindex="0">
      <div class="pista"></div><div class="avance"></div><div class="cabezal"></div><div class="globo"></div>
    </div>
    <button data-a="capitulos" title="Capítulos" aria-label="Capítulos">${icono('capitulos', 20)}</button>
    <button data-a="subs" title="Subtítulos (S)" aria-label="Subtítulos">${icono('subtitulos', 20)}</button>
    <button data-a="musica" title="Música (M)" aria-label="Música">${icono('musica', 19)}</button>
    <button data-a="presentacion" title="Modo presentación (P)" aria-label="Modo presentación">${icono('presentacion', 20)}</button>
    <button data-a="completa" title="Pantalla completa (F)" aria-label="Pantalla completa">${icono('completa', 19)}</button>`;
  document.body.append(barra);
  const bPlay = barra.querySelector('[data-a="play"]');
  const bSubs = barra.querySelector('[data-a="subs"]');
  const bMusica = barra.querySelector('[data-a="musica"]');
  const tiempo = barra.querySelector('.tiempo');
  const linea = barra.querySelector('#linea-tiempo');
  const avance = linea.querySelector('.avance');
  const cabezal = linea.querySelector('.cabezal');
  const globo = linea.querySelector('.globo');
  for (const e of ESCENAS) {
    if (e.inicio === 0) continue;
    const m = document.createElement('div');
    m.className = 'marca';
    m.style.left = `${(e.inicio / DURACION) * 100}%`;
    linea.append(m);
  }

  // --- Capítulos ---
  const capitulos = document.createElement('div');
  capitulos.id = 'capitulos';
  capitulos.hidden = true;
  capitulos.innerHTML = ESCENAS.map(
    (e) =>
      `<button data-t="${e.inicio}"><span class="num">${String(e.n).padStart(2, '0')}</span><span>${e.nombre}</span><span class="t">${fmt(e.inicio).slice(0, 5)}</span></button>`,
  ).join('');
  document.body.append(capitulos);

  const negro = document.createElement('div');
  negro.id = 'negro';
  document.body.append(negro);
  const aviso = document.createElement('div');
  aviso.id = 'aviso';
  document.body.append(aviso);
  let avisoT = 0;
  function avisar(txt) {
    aviso.textContent = txt;
    aviso.classList.add('visible');
    clearTimeout(avisoT);
    avisoT = setTimeout(() => aviso.classList.remove('visible'), 1400);
  }

  // --- Visibilidad de la interfaz ---
  function mostrarUI() {
    if (presentacion || !uiVisible) return;
    barra.classList.remove('oculta');
    document.body.classList.add('barra-visible');
    marco.classList.remove('sin-cursor');
    document.body.classList.remove('sin-cursor');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      if (reloj.reproduciendo && !arrastrando && capitulos.hidden) ocultarUI();
    }, 2500);
  }
  function ocultarUI() {
    barra.classList.add('oculta');
    document.body.classList.remove('barra-visible');
    if (reloj.reproduciendo || presentacion) document.body.classList.add('sin-cursor');
  }
  function aplicarModo() {
    const sinUI = presentacion || !uiVisible;
    barra.style.display = sinUI ? 'none' : '';
    if (sinUI) {
      capitulos.hidden = true;
      document.body.classList.remove('barra-visible');
      document.body.classList.toggle('sin-cursor', presentacion);
    } else mostrarUI();
    refrescarGranPlay();
  }
  function refrescarGranPlay() {
    const ver = !presentacion && uiVisible && !reloj.reproduciendo && reloj.getT() <= 0.0001;
    granPlay.classList.toggle('oculto', !ver);
  }

  // --- Acciones ---
  async function bloquearPantalla(activo) {
    try {
      if (activo && 'wakeLock' in navigator && !bloqueoPantalla) bloqueoPantalla = await navigator.wakeLock.request('screen');
      if (!activo && bloqueoPantalla) {
        await bloqueoPantalla.release();
        bloqueoPantalla = null;
      }
    } catch (_) {
      bloqueoPantalla = null;
    }
  }
  function alternarReproduccion() {
    reloj.alternar();
    bloquearPantalla(reloj.reproduciendo);
    app.pedirCuadro();
    refrescar();
    if (reloj.reproduciendo) mostrarUI();
  }
  function ir(t) {
    reloj.ir(t);
    app.pedirCuadro();
    refrescar();
  }
  function escenaActual() {
    const t = reloj.getT();
    let i = 0;
    ESCENAS.forEach((e, k) => {
      if (t >= e.inicio - 1e-6) i = k;
    });
    return i;
  }
  function alternarSubs() {
    subtitulos.mostrar(!subtitulos.visibles);
    bSubs.classList.toggle('apagado', !subtitulos.visibles);
    bSubs.setAttribute('aria-pressed', String(subtitulos.visibles));
    app.pedirCuadro();
    avisar(subtitulos.visibles ? 'Subtítulos activados' : 'Subtítulos ocultos');
  }
  async function alternarMusica() {
    avisar(musica.activa ? 'Música apagada' : 'Preparando música…');
    const on = await musica.alternar();
    bMusica.classList.toggle('activo', on);
    bMusica.setAttribute('aria-pressed', String(on));
    avisar(on ? 'Música activada' : 'Música apagada');
  }
  function alternarCompleta() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }
  function alternarPresentacion() {
    presentacion = !presentacion;
    aplicarModo();
    avisar(presentacion ? 'Modo presentación · P o Esc para salir' : 'Modo presentación desactivado');
  }

  barra.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'play') alternarReproduccion();
    else if (a === 'reiniciar') ir(0);
    else if (a === 'capitulos') {
      capitulos.hidden = !capitulos.hidden;
      marcarCapitulo();
    } else if (a === 'subs') alternarSubs();
    else if (a === 'musica') alternarMusica();
    else if (a === 'presentacion') alternarPresentacion();
    else if (a === 'completa') alternarCompleta();
  });
  capitulos.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    ir(Number(b.dataset.t));
    capitulos.hidden = true;
  });
  granPlay.addEventListener('click', (ev) => {
    ev.stopPropagation();
    alternarReproduccion();
  });

  // Clic en el lienzo: reproducir/pausar. Doble clic: pantalla completa.
  marco.addEventListener('click', () => {
    if (!capitulos.hidden) {
      capitulos.hidden = true;
      return;
    }
    alternarReproduccion();
  });
  marco.addEventListener('dblclick', (ev) => {
    ev.preventDefault();
    alternarCompleta();
  });

  // Línea de tiempo con arrastre.
  const tDeEvento = (ev) => {
    const r = linea.getBoundingClientRect();
    return Math.min(DURACION, Math.max(0, ((ev.clientX - r.left) / r.width) * DURACION));
  };
  linea.addEventListener('pointerdown', (ev) => {
    arrastrando = true;
    seguiaReproduciendo = reloj.reproduciendo;
    reloj.pausar();
    linea.setPointerCapture(ev.pointerId);
    ir(tDeEvento(ev));
  });
  linea.addEventListener('pointermove', (ev) => {
    const t = tDeEvento(ev);
    const r = linea.getBoundingClientRect();
    const e = ESCENAS[ESCENAS.findLastIndex((x) => t >= x.inicio)];
    globo.textContent = `${String(e.n).padStart(2, '0')} · ${e.nombre} · ${fmt(t).slice(0, 5)}`;
    globo.style.left = `${ev.clientX - r.left}px`;
    if (arrastrando) ir(t);
  });
  const soltar = () => {
    if (!arrastrando) return;
    arrastrando = false;
    if (seguiaReproduciendo) alternarReproduccion();
  };
  linea.addEventListener('pointerup', soltar);
  linea.addEventListener('pointercancel', soltar);
  linea.addEventListener('click', (ev) => ev.stopPropagation());
  barra.addEventListener('dblclick', (ev) => ev.stopPropagation());
  barra.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  capitulos.addEventListener('dblclick', (ev) => ev.stopPropagation());

  window.addEventListener('mousemove', mostrarUI, { passive: true });
  window.addEventListener('pointerdown', mostrarUI, { passive: true });

  // --- Teclado ---
  window.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key;
    const paso = ev.shiftKey ? 1 : 5;
    let usado = true;
    if (k === ' ' || k === 'k' || k === 'K') {
      if (presentacion && reloj.getT() <= 0.0001 && !reloj.reproduciendo) alternarReproduccion();
      else alternarReproduccion();
    } else if (k === 'ArrowRight') ir(reloj.getT() + paso);
    else if (k === 'ArrowLeft') ir(reloj.getT() - paso);
    else if (k === ',') ir(reloj.getT() - 1 / 30);
    else if (k === '.') ir(reloj.getT() + 1 / 30);
    else if (k === 'Home') ir(0);
    else if (k === 'End') ir(DURACION);
    else if (k === 'PageDown') {
      if (reloj.getT() <= 0.0001 && !reloj.reproduciendo) alternarReproduccion();
      else ir(ESCENAS[Math.min(9, escenaActual() + 1)].inicio);
    } else if (k === 'PageUp') {
      const i = escenaActual();
      const t = reloj.getT();
      ir(ESCENAS[t - ESCENAS[i].inicio > 1 ? i : Math.max(0, i - 1)].inicio);
    } else if (/^[0-9]$/.test(k)) ir(ESCENAS[k === '0' ? 9 : Number(k) - 1].inicio);
    else if (k === 'f' || k === 'F') alternarCompleta();
    else if (k === 's' || k === 'S') alternarSubs();
    else if (k === 'm' || k === 'M') alternarMusica();
    else if (k === 'p' || k === 'P' || k === 'h' || k === 'H') alternarPresentacion();
    else if (k === 'Escape') {
      if (presentacion) alternarPresentacion();
      else if (!capitulos.hidden) capitulos.hidden = true;
      else usado = false;
    } else if (k === 'b' || k === 'B') negro.classList.toggle('activo');
    else if (k === 'l' || k === 'L') {
      reloj.bucle = !reloj.bucle;
      avisar(reloj.bucle ? 'Bucle activado' : 'Bucle desactivado');
    } else usado = false;
    if (usado) {
      ev.preventDefault();
      if (!presentacion) mostrarUI();
    }
  });

  function marcarCapitulo() {
    const i = escenaActual();
    capitulos.querySelectorAll('button').forEach((b, k) => b.classList.toggle('actual', k === i));
  }

  let ultimoTexto = '';
  function refrescar() {
    const t = reloj.getT();
    const txt = `${fmt(t)} / ${fmt(DURACION)}`;
    if (txt !== ultimoTexto) {
      tiempo.textContent = txt;
      ultimoTexto = txt;
    }
    const pct = `${(t / DURACION) * 100}%`;
    avance.style.width = pct;
    cabezal.style.left = pct;
    linea.setAttribute('aria-valuenow', t.toFixed(1));
    const rep = reloj.reproduciendo;
    if (bPlay._rep !== rep) {
      bPlay.innerHTML = icono(rep ? 'pausa' : 'play', 20);
      bPlay.setAttribute('aria-label', rep ? 'Pausar' : 'Reproducir');
      bPlay._rep = rep;
      if (!rep) mostrarUI();
      bloquearPantalla(rep);
    }
    refrescarGranPlay();
  }

  reloj.alTerminar = () => {
    bloquearPantalla(false);
    mostrarUI();
  };

  bSubs.classList.toggle('apagado', !subtitulos.visibles);
  bSubs.setAttribute('aria-pressed', String(subtitulos.visibles));
  bMusica.setAttribute('aria-pressed', 'false');
  aplicarModo();
  const estado = () => ({
    reproduciendo: reloj.reproduciendo,
    subtitulos: subtitulos.visibles,
    presentacion,
    bucle: reloj.bucle,
    musica: musica.activa,
    barraVisible: barra.style.display !== 'none' && !barra.classList.contains('oculta'),
    granPlay: !granPlay.classList.contains('oculto'),
    negro: negro.classList.contains('activo'),
  });
  return { refrescar, mostrarUI, estado };
}
