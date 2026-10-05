// Mide el tiempo de render de la música con distintas opciones (herramienta de desarrollo).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const html = path.resolve('dist/index.html');
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(html).href + '?ui=0');
await page.evaluate(() => window.pc311.listo);
for (const op of [{}, { reverb: 0.01 }]) {
  const r = await page.evaluate((op) => window.pc311.probarMusica(op), op);
  console.log(JSON.stringify(op), Math.round(r.ms) + ' ms', 'pico', r.pico.toFixed(3));
}
await browser.close();
