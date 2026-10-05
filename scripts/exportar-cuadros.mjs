// Respaldo de emergencia: exporta los 2700 cuadros (30 fps, 1920×1080) del HTML final
// a PNG en qa/cuadros/ para armar un MP4 si en el evento no se pudiera usar el navegador.
//
// Uso:  node scripts/exportar-cuadros.mjs [desde] [hasta] [--subs=0]
// Luego (si hay ffmpeg):
//   ffmpeg -framerate 30 -i qa/cuadros/c%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16 respaldo.mp4
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sinSubs = process.argv.includes('--subs=0');
const desde = Number(args[0] ?? 0);
const hasta = Number(args[1] ?? 2700);
const html = path.resolve('dist/index.html');
const dir = path.resolve('qa/cuadros');
fs.mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`${pathToFileURL(html).href}?ui=0${sinSubs ? '&subs=0' : ''}`);
await page.evaluate(() => window.pc311.listo);
const t0 = Date.now();
for (let i = desde; i <= hasta; i++) {
  await page.evaluate((t) => window.pc311.ir(t), i / 30);
  await page.screenshot({ path: path.join(dir, `c${String(i).padStart(4, '0')}.png`) });
  if (i % 150 === 0) console.log(`cuadro ${i} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
console.log(`Listo: ${hasta - desde + 1} cuadros en ${dir}`);
