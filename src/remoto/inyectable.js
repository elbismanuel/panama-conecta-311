// Punto de entrada para GitHub Pages: añade el control remoto al HTML de la animación ya
// compilado y validado (pages/animacion-base.html), usando su API window.pc311.
import { crearRemoto } from './host.js';

async function iniciar() {
  while (!window.pc311?.listo) await new Promise((r) => setTimeout(r, 50));
  if (!(await window.pc311.listo)) return; // sin WebGL no hay animación que controlar
  while (!window.pc311.getT) await new Promise((r) => setTimeout(r, 50));
  const a = window.pc311;
  crearRemoto({
    control: {
      getT: () => a.getT(),
      reproduciendo: () => a.ui().reproduciendo,
      reproducir: () => a.reproducir(),
      pausar: () => a.pausar(),
      // pc311.ir pausa y posiciona en el acto; luego espera dos cuadros de dibujo, que no llegan
      // si la pestaña está en segundo plano. No hace falta esperarlos: el bucle redibuja solo.
      ir: (t) => {
        a.ir(t);
      },
    },
  });
}
iniciar();
