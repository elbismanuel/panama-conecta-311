import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const html = 'C:/dev/pc311-animacion/dist/index.html';
const tiempos = (process.argv[2] || '0,5,12,20').split(',').map(Number);
const out = process.argv[3] || 'C:/dev/pc311-animacion/qa/probe';
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('request', (r) => { const u = r.url(); if (!/^(data|file|blob):/.test(u)) console.log('[net]', u); });
const url = pathToFileURL(html).href + (process.argv[4] || '?ui=0');
const t0 = Date.now();
await page.goto(url);
const ok = await page.evaluate(() => window.pc311 && window.pc311.listo);
console.log('listo', ok, (Date.now() - t0) + ' ms');
console.log(await page.evaluate(() => JSON.stringify(window.pc311.info())));
for (const t of tiempos) {
  await page.evaluate((t) => window.pc311.ir(t), t);
  await page.screenshot({ path: `${out}_${String(t).replace('.', '_')}.png` });
}
await browser.close();
