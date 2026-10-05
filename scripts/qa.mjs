// QA automática: abre el HTML FINAL por file:// en Microsoft Edge (Playwright),
// toma capturas en una lista de tiempos y verifica determinismo, fidelidad de
// capturas, textos, rótulos, palabras vetadas, red y consola.
//
// Uso:  npm run qa                      (todo)
//       npm run qa -- --tiempos=4,12.5  (solo esas capturas, sin verificaciones pesadas)
//       npm run qa -- --html=dist/index.html
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const qaDir = path.join(raiz, 'qa');
fs.mkdirSync(qaDir, { recursive: true });
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? '1'];
  }),
);
const PAQUETE =
  'C:/Users/eflores/OneDrive - Autoridad Nacional para la Innovación Gubernamental/Escritorio/Panama_Conecta_311_Video_06oct2026/10_ANIMACION_WEB.html';
const html = args.html ? path.resolve(raiz, args.html) : fs.existsSync(PAQUETE) ? PAQUETE : path.join(raiz, 'dist', 'index.html');
const urlBase = pathToFileURL(html).href;

const TIEMPOS_DEFECTO = [
  1.2, 4.0, 7.6, 8.0, 9.95, 10.8, 12.5, 15.0, 16.0, 17.2, 18.6, 21.0, 23.8, 24.5, 26.6, 27.0, 28.3, 29.1, 30.5, 31.8,
  32.5, 35.0, 36.5, 38.0, 41.3, 41.75, 41.9, 43.4, 44.0, 46.6, 47.5, 49.0, 50.0, 51.7, 52.5, 53.9, 55.0, 57.2, 59.0, 61.8,
  61.5, 62.4, 63.6, 65.1, 67.0, 69.0, 71.9, 73.5, 75.0, 77.0, 78.5, 81.6, 82.2, 83.0, 84.0, 85.9, 86.3, 86.8, 88.0, 89.5, 90.0,
];
const tiempos = args.tiempos ? args.tiempos.split(',').map(Number) : TIEMPOS_DEFECTO;
const soloCapturas = !!args.tiempos;

const registro = [];
const informe = { html, fecha: new Date().toISOString(), resultados: {} };
const log = (...a) => {
  const s = a.join(' ');
  registro.push(s);
  console.log(s);
};
const nombreT = (t) => `t${t.toFixed(2).replace('.', '_').padStart(5, '0')}`;

const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });

async function abrir(params = '', viewport = { width: 1920, height: 1080 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') log(`[consola:${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => log(`[error de página] ${e.message}`));
  page.on('request', (r) => {
    const u = r.url();
    if (!/^(data|file|blob):/i.test(u)) log(`[RED] ${r.method()} ${u}`);
  });
  await page.goto(`${urlBase}${params}`);
  const ok = await page.evaluate(() => window.pc311.listo);
  if (!ok) log('[aviso] la app no inició WebGL');
  return page;
}

const decodificar = (buf) => PNG.sync.read(buf);
function diferencia(a, b) {
  const A = decodificar(a);
  const B = decodificar(b);
  let max = 0;
  let distintos = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
    if (d > 0) distintos++;
    if (d > max) max = d;
  }
  return { max, distintos, total: A.data.length / 4 };
}
const hash = (buf) => createHash('sha1').update(decodificar(buf).data).digest('hex').slice(0, 12);

const t0 = Date.now();
const page = await abrir('?ui=0');
log(`HTML: ${html}`);
log(`Info: ${JSON.stringify(await page.evaluate(() => window.pc311.info()))}`);

// 1. Hoja de contactos
for (const t of tiempos) {
  await page.evaluate((t) => window.pc311.ir(t), t);
  await page.screenshot({ path: path.join(qaDir, `${nombreT(t)}.png`) });
}
log(`Capturas: ${tiempos.length} en qa/`);

if (!soloCapturas) {
  // 2. Determinismo
  const shot = () => page.screenshot();
  await page.evaluate(() => window.pc311.ir(50));
  const a = await shot();
  await page.evaluate(() => window.pc311.ir(45));
  await page.evaluate(() => window.pc311.reproducirHasta(50));
  const b = await shot();
  await page.evaluate(() => window.pc311.ir(80));
  await page.evaluate(() => window.pc311.ir(50));
  const c = await shot();
  const p2 = await abrir('?ui=0&t=50');
  const d = await p2.screenshot();
  await p2.close();
  const det = {
    directo: hash(a),
    trasReproducir: hash(b),
    trasRetroceder: hash(c),
    porURL: hash(d),
    difReproducir: diferencia(a, b),
    difRetroceder: diferencia(a, c),
    difURL: diferencia(a, d),
  };
  const pares = [];
  for (const t of [12.5, 38.0, 67.0, 84.0]) {
    await page.evaluate((t) => window.pc311.ir(t - 2.5), t);
    await page.evaluate((t) => window.pc311.reproducirHasta(t), t);
    const r = await shot();
    const pu = await abrir(`?ui=0&t=${t}`);
    const u = await pu.screenshot();
    await pu.close();
    pares.push({ t, ...diferencia(r, u) });
  }
  det.reproduccionVsURL = pares;
  // Quietud del último segundo: 89,0 = 89,5 = 90,0 (grano congelado, sin oscilaciones).
  const quietud = [];
  for (const t of [89.0, 89.5, 90.0]) {
    await page.evaluate((t) => window.pc311.ir(t), t);
    quietud.push(await shot());
  }
  det.quietudFinal = { d89_895: diferencia(quietud[0], quietud[1]), d89_90: diferencia(quietud[0], quietud[2]) };
  informe.resultados.determinismo = det;
  log(`Quietud 89–90 s: diferencias ${det.quietudFinal.d89_895.distintos} y ${det.quietudFinal.d89_90.distintos} píxeles`);
  log(`Determinismo t=50: directo ${det.directo} · tras reproducir ${det.trasReproducir} · tras retroceder ${det.trasRetroceder} · ?t= ${det.porURL}`);
  log(`  diferencias máx/píxeles: reproducir ${det.difReproducir.max}/${det.difReproducir.distintos} · retroceder ${det.difRetroceder.max}/${det.difRetroceder.distintos} · URL ${det.difURL.max}/${det.difURL.distintos}`);
  for (const p of pares) log(`  reproducción vs ?t=${p.t}: máx ${p.max}, píxeles distintos ${p.distintos}`);

  // 3. Fidelidad de capturas en reposo a escala 1,0
  const fuente = (f) => PNG.sync.read(fs.readFileSync(path.join(raiz, 'public', 'recursos', f)));
  async function comparar(t, archivo, mapa, rect, margen = 3) {
    await page.evaluate((t) => window.pc311.ir(t), t);
    const img = decodificar(await shot());
    const src = fuente(archivo);
    let max = 0;
    let n = 0;
    let suma = 0;
    for (let y = rect[1] + margen; y < rect[3] - margen; y++) {
      for (let x = rect[0] + margen; x < rect[2] - margen; x++) {
        const [cx, cy] = mapa(x, y);
        const i = (cy * img.width + cx) * 4;
        const j = (y * src.width + x) * 4;
        for (let k = 0; k < 3; k++) {
          const dd = Math.abs(img.data[i + k] - src.data[j + k]);
          suma += dd;
          if (dd > max) max = dd;
        }
        n++;
      }
    }
    return { t, archivo, rect, max, media: +(suma / (n * 3)).toFixed(3), muestras: n };
  }
  // Sesgo de color a escala ≠ 1 (web_03 a 1200/1264): media RGB en pantalla frente a la
  // media del mismo rectángulo en el PNG original (no hay correspondencia texel a píxel).
  async function sesgo(t, archivo, vista, destino, rect) {
    await page.evaluate((t) => window.pc311.ir(t), t);
    const img = decodificar(await shot());
    const src = fuente(archivo);
    const s = destino[2] / vista[2];
    const media = (im, x0, y0, x1, y1) => {
      const m = [0, 0, 0];
      let n = 0;
      for (let y = Math.ceil(y0); y < Math.floor(y1); y++) {
        for (let x = Math.ceil(x0); x < Math.floor(x1); x++) {
          const i = (y * im.width + x) * 4;
          for (let k = 0; k < 3; k++) m[k] += im.data[i + k];
          n++;
        }
      }
      return m.map((v) => v / n);
    };
    const a = media(src, rect[0], rect[1], rect[2], rect[3]);
    const b = media(img, destino[0] + (rect[0] - vista[0]) * s, destino[1] + (rect[1] - vista[1]) * s, destino[0] + (rect[2] - vista[0]) * s, destino[1] + (rect[3] - vista[1]) * s);
    return { t, archivo, rect, escala: +s.toFixed(4), sesgoMax: +Math.max(...a.map((v, k) => Math.abs(v - b[k]))).toFixed(3) };
  }
  // Geometría de la ventana: centrada en y 486 (RANURAS.ventana.cy en src/data/medidas.js).
  const CY = 486;
  const fid = [];
  fid.push(await comparar(38.0, 'web/web_05_DEMO_descripcion_detalle.png', (x, y) => [562 + x - 40, CY - 596 / 2 + y - 80], [49, 440, 1231, 554]));
  fid.push(await comparar(55.0, 'web/web_07_DEMO_evidencia_detalle.png', (x, y) => [562 + x - 40, CY - 532 / 2 + y - 80], [49, 416, 1231, 548]));
  const hW03 = (674 * 1200) / 1264;
  const sesgos = [];
  sesgos.push(await sesgo(28.95, 'web/web_03_busqueda_basura.png', [328, 140, 1264, 674], [562, CY - hW03 / 2, 1200, hW03], [352, 450, 948, 552]));
  sesgos.push(await sesgo(28.95, 'web/web_03_busqueda_basura.png', [328, 140, 1264, 674], [562, CY - hW03 / 2, 1200, hW03], [980, 580, 1560, 800]));
  informe.resultados.fidelidad = fid;
  informe.resultados.sesgoColor = sesgos;
  for (const f of fid) log(`Fidelidad t=${f.t} ${path.basename(f.archivo)} [${f.rect}] → máx ${f.max}/255, media ${f.media} (${f.muestras} px)`);
  for (const f of sesgos) log(`Sesgo de color t=${f.t} ${path.basename(f.archivo)} [${f.rect}] a escala ${f.escala} → ${f.sesgoMax}/255`);

  // 4–6. Textos, rótulos y palabras vetadas (muestreo en el navegador)
  const textos = await page.evaluate(async () => {
    const S = { x0: 154, x1: 1766, y0: 86, y1: 994 };
    const esc = document.getElementById('escenario');
    const fuera = [];
    const vetadas = [];
    const dosLineas = [];
    const rotulos = [];
    const VETO = [/http/i, /www/i, /\bQR\b/, /App Store/i, /Google Play/i, /\biOS\b/, /éxito/i, /expediente/i, /N\.º de caso/i, /automátic/i];
    const errores = window.pc311.validar();
    for (let t = 0; t <= 90.001; t += 0.2) {
      await window.pc311.ir(t);
      const r0 = esc.getBoundingClientRect();
      const k = r0.width / 1920;
      const visibles = [...esc.querySelectorAll('.linea, .rotulo, .etiqueta-flujo, .tc-titulo, .tc-linea, .subs-linea')].filter((e) => {
        let n = e;
        while (n && n !== esc) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.02) return false;
          n = n.parentElement;
        }
        return e.textContent.trim().length > 0;
      });
      for (const e of visibles) {
        const r = e.getBoundingClientRect();
        const b = { x0: (r.left - r0.left) / k, x1: (r.right - r0.left) / k, y0: (r.top - r0.top) / k, y1: (r.bottom - r0.top) / k };
        if (b.x0 < S.x0 - 0.5 || b.x1 > S.x1 + 0.5 || b.y0 < S.y0 - 0.5 || b.y1 > S.y1 + 0.5) {
          fuera.push({ t: +t.toFixed(1), texto: e.textContent.trim().slice(0, 40), caja: [b.x0, b.y0, b.x1, b.y1].map((v) => Math.round(v)) });
        }
      }
      const texto = esc.innerText.replace(/Escena ilustrativa generada por IA/g, '');
      for (const re of VETO) if (re.test(texto)) vetadas.push({ t: +t.toFixed(1), patron: String(re) });
      if (/\bIA\b/.test(texto)) vetadas.push({ t: +t.toFixed(1), patron: 'IA fuera del rótulo' });
      const caja = document.querySelector('.subs-caja');
      if (getComputedStyle(caja).visibility !== 'hidden') {
        const lineas = [...caja.querySelectorAll('.subs-linea')].filter((l) => l.style.display !== 'none' && l.textContent);
        const h = caja.getBoundingClientRect().height / k;
        if (lineas.length > 2 || h > 2 * 36 * 1.32 + 28 + 2) dosLineas.push({ t: +t.toFixed(1), lineas: lineas.length, alto: Math.round(h) });
        const ancho = caja.getBoundingClientRect().width / k;
        if (ancho > 1240.5) dosLineas.push({ t: +t.toFixed(1), ancho: Math.round(ancho) });
      }
      // Rótulo DOM ↔ imagen (estado)
      const E = window.pc311.muestrear(t);
      const pares = [
        ['iaA', E.placaA.op],
        ['iaB', E.placaB.op],
        ['demo', E.ven.op * E.ven.demo],
        ['flujo08', Math.max(...E.nodos.map((n) => n.op))],
        ['flujo09', E.tar.op],
      ];
      for (const [id, op] of pares) {
        const el = window.pc311.rotuloDom(id);
        const o = parseFloat(getComputedStyle(el).opacity) * (getComputedStyle(el).visibility === 'hidden' ? 0 : 1);
        if ((op > 0.3 && o < 0.29) || (o > 0.3 && op < 0.29)) rotulos.push({ t: +t.toFixed(1), id, imagen: +op.toFixed(3), rotulo: +o.toFixed(3) });
      }
    }
    return { errores, fuera, vetadas, dosLineas, rotulos };
  });
  // Regla de rótulos a 30 Hz sobre el estado puro.
  const rot30 = await page.evaluate(() => {
    const fallos = [];
    for (let i = 0; i <= 2700; i++) {
      const t = i / 30;
      const E = window.pc311.muestrear(t);
      const pares = [
        ['foto TL/TR', E.placaA.op, E.rotulos.iaA],
        ['foto BL', E.placaB.op, E.rotulos.iaB],
        ['DEMO', E.ven.op * E.ven.demo, E.rotulos.demo],
        ['gráfica 08', Math.max(...E.nodos.map((n) => n.op)), E.rotulos.flujo08],
        ['tarjeta 09', E.tar.op, E.rotulos.flujo09],
      ];
      for (const [n, img, rot] of pares) if ((img > 0.3 && rot < 0.3) || (rot > 0.3 && img < 0.3)) fallos.push({ t, n, img, rot });
    }
    return { muestras: 2701, fallos: fallos.slice(0, 20), nFallos: fallos.length, ultimaClave: window.pc311.ultimaClave() };
  });
  informe.resultados.textos = textos;
  informe.resultados.rotulos30Hz = rot30;
  log(`Guion: ${textos.errores.length ? textos.errores.join(' | ') : 'subtítulos = locución, titulares = texto en pantalla, ≤ 6 palabras'}`);
  log(`Textos fuera del margen seguro: ${textos.fuera.length}${textos.fuera.length ? ' → ' + JSON.stringify(textos.fuera.slice(0, 8)) : ''}`);
  log(`Subtítulos con más de dos líneas o demasiado anchos: ${textos.dosLineas.length}${textos.dosLineas.length ? ' → ' + JSON.stringify(textos.dosLineas.slice(0, 5)) : ''}`);
  log(`Palabras vetadas en el DOM: ${textos.vetadas.length}${textos.vetadas.length ? ' → ' + JSON.stringify(textos.vetadas.slice(0, 5)) : ''}`);
  log(`Rótulos DOM ↔ imagen (5 Hz): ${textos.rotulos.length} discrepancias${textos.rotulos.length ? ' → ' + JSON.stringify(textos.rotulos.slice(0, 5)) : ''}`);
  log(`Rótulos ↔ imagen (30 Hz, estado): ${rot30.nFallos} fallos en ${rot30.muestras} muestras · última clave de animación en t=${rot30.ultimaClave}`);

  // 7. Rendimiento
  await page.evaluate(() => window.pc311.ir(10));
  const fps = await page.evaluate(() => window.pc311.medirFps(5));
  informe.resultados.fps = fps;
  log(`FPS (headless, 1920×1080, t 10→15): ${fps.toFixed(1)}`);

  // 8. Resoluciones
  const RES = [
    [1366, 768],
    [2560, 1440],
    [1280, 800],
  ];
  for (const [w, h] of RES) {
    const pr = await abrir('?ui=0', { width: w, height: h });
    for (const t of [12.5, 38.0, 67.0, 88.0]) {
      await pr.evaluate((t) => window.pc311.ir(t), t);
      await pr.screenshot({ path: path.join(qaDir, `res_${w}x${h}_${nombreT(t)}.png`) });
    }
    log(`Resolución ${w}×${h}: ${JSON.stringify(await pr.evaluate(() => window.pc311.info()))}`);
    await pr.close();
  }

  // 8a. Interfaz visible en ventanas comunes y estrechas: la caja de subtítulos no puede
  // quedar debajo de la barra, todos los botones deben caber y la línea de tiempo ≥ 80 px.
  // (El formato vertical se registra, pero su composición queda para una fase posterior.)
  const RES_UI = [
    [1366, 768, 40],
    [1536, 730, 20],
    [1280, 800, 38],
    [844, 390, 12.5],
    [390, 844, 40],
  ];
  const interfaz = [];
  for (const [w, h, t] of RES_UI) {
    const pr = await abrir('', { width: w, height: h });
    await pr.evaluate((t) => window.pc311.ir(t), t);
    await pr.mouse.move(w / 2, h / 2);
    await pr.mouse.move(w / 2 + 4, h / 2 + 4);
    await pr.waitForTimeout(450);
    const m = await pr.evaluate(() => {
      const c = document.querySelector('.subs-caja').getBoundingClientRect();
      const b = document.getElementById('barra').getBoundingClientRect();
      const lin = document.getElementById('linea-tiempo').getBoundingClientRect();
      const bot = [...document.querySelectorAll('#barra button')].filter((x) => getComputedStyle(x).display !== 'none');
      const rot = document.querySelector('.rotulo');
      const k = document.getElementById('escenario').getBoundingClientRect().width / 1920;
      return {
        solapeSubsBarra: c.height > 0 && c.bottom > b.top && c.top < b.bottom,
        botonesFuera: bot.filter((x) => x.getBoundingClientRect().right > innerWidth + 0.5).length,
        lineaTiempo: Math.round(lin.width),
        subsPxReales: +(parseFloat(getComputedStyle(document.querySelector('.subs-caja')).fontSize) * k).toFixed(1),
        rotuloPxReales: +(parseFloat(getComputedStyle(rot).fontSize) * k).toFixed(1),
      };
    });
    m.ok = !m.solapeSubsBarra && m.botonesFuera === 0 && m.lineaTiempo >= 80;
    interfaz.push({ w, h, t, ...m });
    await pr.screenshot({ path: path.join(qaDir, `ui_${w}x${h}.png`) });
    log(`Interfaz ${w}×${h} t=${t}: ${JSON.stringify(m)}`);
    await pr.close();
  }
  informe.resultados.interfaz = interfaz;

  // 8b. Movimiento reducido (prefers-reduced-motion)
  {
    const pr = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    pr.on('pageerror', (e) => log(`[error de página] ${e.message}`));
    await pr.goto(`${urlBase}?ui=0`);
    await pr.evaluate(() => window.pc311.listo);
    for (const t of [10.8, 23.9, 61.9]) {
      await pr.evaluate((t) => window.pc311.ir(t), t);
      await pr.screenshot({ path: path.join(qaDir, `reducido_${nombreT(t)}.png`) });
    }
    await pr.close();
    log('Movimiento reducido: capturas reducido_*.png');
  }

  // 8c. Teclado y estado de la interfaz
  {
    const pk = await abrir('');
    const ui = () => pk.evaluate(() => window.pc311.ui());
    const tt = () => pk.evaluate(() => window.pc311.getT());
    const res = {};
    await pk.keyboard.press('Space');
    await pk.waitForTimeout(700);
    res.espacioReproduce = (await ui()).reproduciendo && (await tt()) > 0.3;
    await pk.keyboard.press('Space');
    res.espacioPausa = !(await ui()).reproduciendo;
    const a = await tt();
    await pk.keyboard.press('ArrowRight');
    res.flechaMas5 = Math.abs((await tt()) - a - 5) < 0.01;
    await pk.keyboard.press('Shift+ArrowLeft');
    res.mayusFlechaMenos1 = Math.abs((await tt()) - a - 4) < 0.01;
    await pk.keyboard.press('Home');
    res.inicio = (await tt()) === 0;
    await pk.keyboard.press('5');
    res.escena5 = (await tt()) === 32;
    await pk.keyboard.press('End');
    res.fin = (await tt()) === 90;
    await pk.keyboard.press('s');
    res.subtitulosOcultos = !(await ui()).subtitulos;
    await pk.keyboard.press('s');
    res.subtitulosVisibles = (await ui()).subtitulos;
    await pk.keyboard.press('p');
    res.presentacion = (await ui()).presentacion && !(await ui()).barraVisible;
    await pk.keyboard.press('Escape');
    res.salePresentacion = !(await ui()).presentacion;
    await pk.keyboard.press('l');
    res.bucle = (await ui()).bucle;
    await pk.keyboard.press('b');
    res.negro = (await ui()).negro;
    await pk.keyboard.press('b');
    await pk.keyboard.press('m');
    await pk.waitForTimeout(2500);
    res.musica = (await ui()).musica;
    informe.resultados.teclado = res;
    log(`Teclado: ${JSON.stringify(res)}`);
    await pk.close();
  }

  // 8d. Música original (render sin conexión)
  {
    const pm = await abrir('?ui=0');
    const m = await pm.evaluate(() => window.pc311.probarMusica());
    informe.resultados.musica = m;
    log(`Música: render ${m.ms.toFixed(0)} ms · ${m.duracion.toFixed(1)} s · pico ${m.pico.toFixed(3)} · RMS 10–20 s ${m.rms10a20.toFixed(4)} · 60–70 s ${m.rms60a70.toFixed(4)} · último segundo ${m.rms88_7a90.toExponential(1)}`);
    await pm.close();
  }

  // 9. Interfaz: pantalla inicial y barra de controles
  const pu = await abrir('');
  await pu.screenshot({ path: path.join(qaDir, 'ui_inicio.png') });
  await pu.evaluate(() => window.pc311.ir(37.5));
  await pu.mouse.move(900, 500);
  await pu.mouse.move(960, 540);
  await pu.waitForTimeout(400);
  await pu.screenshot({ path: path.join(qaDir, 'ui_barra.png') });
  await pu.close();
  const pp = await abrir('?present=1');
  await pp.screenshot({ path: path.join(qaDir, 'ui_presentacion.png') });
  await pp.close();
  const ps = await abrir('?sinwebgl=1');
  await ps.waitForTimeout(300);
  await ps.screenshot({ path: path.join(qaDir, 'ui_sin_webgl.png') });
  await ps.close();
  const pv = await abrir('?ui=0&shaders=1');
  await pv.evaluate(() => window.pc311.ir(45));
  await pv.close();
  log('Verificación de shaders (?shaders=1): ver líneas [consola] anteriores, si las hay.');
}

await browser.close();
log(`Duración de la QA: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
fs.writeFileSync(path.join(qaDir, 'consola.txt'), registro.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(qaDir, 'verificacion.json'), JSON.stringify(informe, null, 2), 'utf8');
