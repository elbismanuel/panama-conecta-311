// Exporta la pista original a WAV (16 bits) para revisarla fuera del navegador (herramienta de desarrollo).
// Uso: node scripts/exportar-musica.mjs salida.wav
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const salida = process.argv[2] || 'qa/musica.wav';
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve('dist/index.html')).href + '?ui=0');
await page.evaluate(() => window.pc311.listo);
const b64 = await page.evaluate(async () => {
  const b = await window.pc311.renderizarBuffer();
  const n = b.length;
  const ch = b.numberOfChannels;
  const datos = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const esc = (o, s) => [...s].forEach((c, i) => datos.setUint8(o + i, c.charCodeAt(0)));
  esc(0, 'RIFF'); datos.setUint32(4, 36 + n * ch * 2, true); esc(8, 'WAVE'); esc(12, 'fmt ');
  datos.setUint32(16, 16, true); datos.setUint16(20, 1, true); datos.setUint16(22, ch, true);
  datos.setUint32(24, b.sampleRate, true); datos.setUint32(28, b.sampleRate * ch * 2, true);
  datos.setUint16(32, ch * 2, true); datos.setUint16(34, 16, true); esc(36, 'data'); datos.setUint32(40, n * ch * 2, true);
  const c0 = b.getChannelData(0); const c1 = b.getChannelData(ch > 1 ? 1 : 0);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (const c of [c0, c1]) { datos.setInt16(o, Math.max(-1, Math.min(1, c[i])) * 32767, true); o += 2; }
  }
  const u8 = new Uint8Array(datos.buffer);
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
});
fs.writeFileSync(salida, Buffer.from(b64, 'base64'));
console.log('WAV:', salida, (fs.statSync(salida).size / 1e6).toFixed(1), 'MB');
await browser.close();
