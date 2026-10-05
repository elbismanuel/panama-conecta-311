// Punto de entrada: estilos + arranque de la animación.
import './estilos.css';
import { iniciar } from './app.js';

iniciar().catch((e) => {
  console.error('No se pudo iniciar la animación:', e);
});
