// Copia el HTML autocontenido al paquete audiovisual (único archivo que se escribe allí).
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origen = join(raiz, 'dist', 'index.html');
const paquete =
  process.env.PC311_PAQUETE ||
  'C:/Users/eflores/OneDrive - Autoridad Nacional para la Innovación Gubernamental/Escritorio/Panama_Conecta_311_Video_06oct2026';
const destino = join(paquete, '10_ANIMACION_WEB.html');

if (!existsSync(origen)) {
  console.error('No existe dist/index.html; ejecute «vite build» primero.');
  process.exit(1);
}
if (!existsSync(paquete)) {
  console.warn(`No se encontró la carpeta del paquete: ${paquete}\nEl HTML queda en dist/index.html.`);
  process.exit(0);
}
copyFileSync(origen, destino);
const mb = (statSync(destino).size / 1024 / 1024).toFixed(2);
console.log(`Copiado a ${destino} (${mb} MB)`);
