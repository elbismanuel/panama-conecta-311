// Arma dist/index.html para GitHub Pages: la animación validada (pages/animacion-base.html)
// más el control remoto compilado (dist/.remoto/remoto.js), en línea antes de </body>.
import { readFile, writeFile, rm } from 'node:fs/promises';

let html = await readFile('pages/animacion-base.html', 'utf8');
const remoto = (await readFile('dist/.remoto/remoto.js', 'utf8')).replace(/<\/script/gi, '<\/script');

// Subtítulos y locución con «311» en cifra, como en referencia/escenas.json (2-oct, 11:13).
const antes = html.split('tres once').length - 1;
html = html.replaceAll('tres once', '311');

const fin = html.lastIndexOf('</body>');
if (fin < 0) throw new Error('pages/animacion-base.html no tiene </body>');
html = html.slice(0, fin) + '<script>' + remoto + '</script>\n' + html.slice(fin);
await writeFile('dist/index.html', html);
await rm('dist/.remoto', { recursive: true, force: true });
console.log(`dist/index.html: ${(html.length / 1e6).toFixed(2)} MB · «tres once» → «311» en ${antes} lugares`);
