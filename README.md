# Panamá Conecta + 311 · Animación web de 90 s

Animación de presentación para el panel **«El Futuro es Ahora: IA y Tecnologías detrás del CAC311»** (6 de octubre de 2026). Sustituye al MP4: es una página web hecha con **Three.js + GSAP + Vite**. Las capturas reales se muestran como capas planas, sin retoques. Los titulares, los rótulos y los subtítulos son HTML nítido sobre el lienzo WebGL.

- **Duración:** 90,0 s exactos, con un reloj propio. Cada cuadro es una función pura del tiempo, así que pausar, retroceder o saltar a un capítulo da siempre el mismo cuadro.
- **Lienzo:** 1920×1080 lógico. El área 16:9 se escala entera a la ventana y el fondo WebGL cubre el resto (sin aristas ni bandas planas), por ejemplo en 1366×768, 2560×1440, un proyector 16:10 o 4:3 o una ventana de navegador. El formato recomendado es **apaisado 16:9 a pantalla completa**. En un teléfono en vertical la escena todavía se ve pequeña: la composición vertical está pendiente.
- **Sin red:** el resultado es **un solo HTML** de unos 4,9 MB con imágenes, fuentes y código embebidos. Se abre con doble clic desde el disco o una memoria USB.

## Cómo abrirlo

1. Haga doble clic en `10_ANIMACION_WEB.html`, que está en la carpeta del paquete o en `dist/index.html`. Use **Microsoft Edge o Google Chrome** actualizados con la aceleración por hardware activada.
2. Pulse **F** (o haga doble clic) para pasar a pantalla completa.
3. Pulse **P** para entrar en el modo presentación: se ocultan los controles y el cursor.
4. Pulse **Espacio** para reproducir.

Al abrir el archivo se ve el primer cuadro con un botón de reproducir. Durante la reproducción, la barra inferior aparece al mover el ratón y se oculta, junto con el cursor, tras 2,5 s sin movimiento. Cuando la animación termina, queda fijo el último cuadro: la frase final y los logos.

### Atajos de teclado

| Tecla | Acción |
|---|---|
| Espacio · K | Reproducir o pausar |
| ← / → | −5 s / +5 s |
| Mayús + ← / → | −1 s / +1 s |
| , / . | Un cuadro atrás o adelante (1/30 s) |
| 1 … 9, 0 | Ir al inicio de las escenas 1 a 10 |
| Inicio / Fin | Ir a t = 0 / t = 90 |
| AvPág / RePág | Siguiente o anterior escena (AvPág en t = 0 inicia la reproducción) |
| F · doble clic | Pantalla completa |
| S | Mostrar u ocultar los subtítulos |
| M | Música original activada o desactivada (apagada por defecto) |
| P · H | Modo presentación, sin controles. Se sale con **P** o **Esc** |
| B | Pantalla negra; se quita con B |
| L | Bucle |

### Parámetros de la URL

`?t=37.5` posiciona y pausa en ese segundo · `?escena=5` · `?autoplay=1` · `?present=1` (también `?presentacion=1`) · `?subs=0` · `?loop=1` (también `?bucle`) · `?ui=0` (sin interfaz, para capturas) · `?calidad=baja` (sin MSAA, búfer al tamaño de la ventana) · `?realce=1` (opcional: eleva la tarjeta AAUD; por defecto el resaltado es solo el anillo externo) · `?proyector=1` (aclara solo la luz del fondo) · `?debug=1` (retícula, margen seguro, escala en vivo «s = 1,000» y papel cebolla de los calces) · `?sinwebgl=1` (simula un equipo sin WebGL) · `?audio=archivo` (opcional: usa un audio local como reloj maestro cuando haya locución grabada).

Ejemplo: `10_ANIMACION_WEB.html?present=1` abre la animación en modo presentación.

## Escenas

| # | Tiempo | Escena | Qué se ve |
|---|---|---|---|
| 01 | 0–8 s | Una necesidad cotidiana | Foto TL (IA) en placa y «Tu comunidad, más cerca» |
| 02 | 8–16 s | Panamá Conecta en tu mano | Foto TR. El teléfono 3D nace **apagado** sobre el de la foto, vuela y se enciende con `mobile_01_inicio` |
| 03 | 16–24 s | Encuentra el servicio | Primer plano de `mobile_02_categorias` (0,44) con anillo externo en «Recursos Ambientales, Animales»; la viñeta inferior deja los subtítulos sobre fondo oscuro |
| 04 | 24–32 s | También desde la web | Titular a la izquierda (una sola vez) y foto BL a la derecha. Un panel nace sobre el monitor de la foto y se convierte en ventana con `web_03` (0,625 → ≈ 0,949, encuadre de las dos columnas de tarjetas) y anillo externo en «Recolección - AAUD» |
| 05 | 32–42 s | Describe la situación | `web_05` detalle (0,9375 → 1,0), anillo solo en el área de texto; el campo Teléfono queda velado. Cambio de página a la 06 por el fondo `#F3F4F6` |
| 06 | 42–52 s | Ubica el caso | `web_06` detalle (0,9375): selector → detalle de la ubicación → mapa. Cambio de página a la 07 |
| 07 | 52–62 s | Aporta evidencia | `web_07` detalle: zona de adjuntos; con la vista ya quieta, el anillo se vuelve a trazar sobre todas las secciones y luego encoge a un círculo que vuela al primer nodo |
| 08 | 62–72 s | Del reporte al registro | Gráfica editorial Describir → Ubicar → Adjuntar → Registrar, literal del guion (sin ✓, sin número de caso) |
| 09 | 72–82 s | La consulta también importa | Tarjeta abstracta «Consulta del caso» con tres líneas editoriales tomadas de la locución (sin barras, estados ni progreso); no imita una pantalla de la app |
| 10 | 82–90 s | Cierre institucional | Teléfono (`mobile_02`) y portátil (`web_01`); salen por completo antes de que aparezcan la frase final y los logos originales. De 89 a 90 s, quietud total |

**Composición de la ventana web (04–07).** La ventana se centra siempre en vertical (y 486) en la banda útil: el rótulo DEMO cabe encima y queda aire hasta los subtítulos. Los cambios entre capturas son «de página»: la captura A se funde al fondo claro de la web y de ahí aparece B, de modo que nunca se ven filas de dos capturas a la vez.

## Cómo reconstruir

Requisitos: Node 20 o superior y Microsoft Edge (solo para la QA).

```bash
npm install
npm run dev     # servidor de desarrollo de Vite
npm run build   # genera dist/index.html (un solo archivo) y lo copia como
                # «…/Panama_Conecta_311_Video_06oct2026/10_ANIMACION_WEB.html»
npm run qa      # QA automática con Edge por file:// (ver abajo)
npm run qa -- --tiempos=4,12.5,38   # solo esas capturas
```

La carpeta de destino de la copia se puede cambiar con la variable de entorno `PC311_PAQUETE`.

**Respaldo en video (opcional).** `node scripts/exportar-cuadros.mjs` exporta los 2700 cuadros (30 fps, 1920×1080) a `qa/cuadros/`. El proceso es determinista, así que los cuadros son idénticos a la reproducción. Para unirlos se necesita ffmpeg, que no está instalado en este equipo: `ffmpeg -framerate 30 -i qa/cuadros/c%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16 respaldo.mp4`. Con `--subs=0` se obtiene la versión sin subtítulos.

**Herramientas de desarrollo:**
- `scripts/sonda.mjs "4,12.5" qa/prueba "?ui=0&debug=1"` toma capturas sueltas;
- `scripts/exportar-musica.mjs salida.wav` exporta la pista a WAV para escucharla;
- `scripts/sonda-musica.mjs` mide el tiempo de render del audio.

## Cómo cambiar textos y tiempos

- **Textos y subtítulos** están en `src/data/guion.js`.
  - `TITULARES` guarda cada titular con sus saltos de línea fijos, su ranura y sus tiempos de entrada y salida.
  - `SUBTITULOS` guarda cada segmento de locución con sus ventanas `ini`/`fin`. El carácter `/` marca el salto de línea.
  - `PASOS` (etiquetas de la 08) y `CONSULTA` (tarjeta de la 09) también viven ahí.
  - Al cargar, la app comprueba que los subtítulos unidos son **exactamente** la locución de `referencia/escenas.json`, que ningún subtítulo pasa de 17 caracteres por segundo ni sale de su escena, que los titulares coinciden con el texto en pantalla (máximo seis palabras), que `PASOS` es el de la TOMA 08 y que las líneas de la tarjeta tienen seis palabras o menos. Si algo no cuadra, lo avisa en la consola y la QA falla.
  - Cuando se grabe la voz, basta con reajustar `ini`/`fin`.
- **Animación:** cada escena está en `src/timeline/escenas/e01.js` … `e10.js`.
  - Cada una define pistas declarativas `[t, valor, curva]` en tiempos absolutos. Las curvas son las de GSAP, como `power3.out` o `expo.inOut`.
  - `src/timeline/director.js` compone el estado completo `E = f(t)`.
- **Coordenadas medidas** sobre los PNG (objetivos del anillo, recortes del velo, vistas, alturas y centro de la ventana, ranuras, viñeta, rótulos y retícula) están en `src/data/medidas.js`.

## Inventario de capturas usadas

Todos los archivos son los originales de `public/recursos/`, sin modificar. Coinciden con `MANIFIESTO_SHA256.json` del paquete: 18 de 18.

| Archivo | Tipo | Dónde | Escala en pantalla |
|---|---|---|---|
| `estilo/REFERENCIA_CINEMATOGRAFICA_IA.png` (recortes TL, TR y BL; BR no se usa) | Generada por IA | 01, 02, 04 | 1,0 (deriva interna ≤ 1,035) |
| `mobile/mobile_01_inicio.png` | Captura real | 02 | 0,283 |
| `mobile/mobile_02_categorias.png` | Captura real | 03, 10 | 0,44 / 0,26 |
| `web/web_03_busqueda_basura.png` | Captura real | 04 | 0,625 → ≈ 0,949 (vista x 328–1592, y 140–814) |
| `web/web_05_DEMO_descripcion_detalle.png` (filas 0–676) | DEMO | 05 | 0,9375 → **1,0** |
| `web/web_06_DEMO_ubicacion_detalle.png` (filas 0–752) | DEMO | 06 | 0,9375 |
| `web/web_07_DEMO_evidencia_detalle.png` (filas 0–612) | DEMO | 07 | 0,9375 → **1,0** |
| `web/web_01_catalogo.png` | Captura real | 10 | 0,5 |
| `marca/logo_horizontal_blanco.png`, `marca/logo_311.png`, `marca/logo_aig.png` | Logos originales | 10 | `<img>` sin filtros ni recortes |

Los recortes verticales de las capturas `_detalle` dejan fuera los botones «Cancelar» y «Registrar Caso». No se usan `web_04`, las versiones completas con banda DEMO, `logo_horizontal.png` ni `logo_panama_conecta.png`.

**Fidelidad.**
- Las texturas usan `SRGBColorSpace`, mipmaps, anisotropía máxima y un shader propio sin luces ni tonemapping.
- A escala 1,0 (05 y 07), el desplazamiento es entero y el píxel de salida es el texel exacto. La QA lo comprueba: diferencia máxima 0/255. En `web_03` (≈ 0,949) comprueba el sesgo de color medio frente al original.
- Los resaltados son gráficos externos: un anillo con el interior transparente y un velo `#061629` al 35 % fuera del recorte, que sigue las esquinas redondeadas del elemento. Nunca recolorean, tapan ni desplazan lo resaltado (el realce elevado de la AAUD solo existe con `?realce=1`).

## Rótulos de honestidad

| Rótulo | Dónde |
|---|---|
| «Escena ilustrativa generada por IA» | Dentro de cada foto, abajo a la izquierda |
| «DEMOSTRACIÓN · Datos ficticios · Sin envío» | Sobre la ventana con capturas DEMO, de 32,2 a 61,8 s |
| «Representación del flujo» | Bajo la gráfica de la 08 (sigue a los nodos) y bajo la tarjeta de la 09 (sigue a la tarjeta) |

La opacidad de cada rótulo sale de la **misma pista** que su imagen. La QA comprueba a 30 Hz, para los cinco rótulos, que nunca aparece una imagen sin su rótulo ni un rótulo sin su imagen. Los rótulos usan Inter 22 px sobre fondo al 80 %.

## QA automática (`npm run qa`)

La QA abre el HTML final por `file://` en Edge, a 1920×1080, y deja todo en `qa/`:

- capturas `tXX_XX.png` en 61 momentos;
- determinismo: un mismo t por salto directo, tras reproducir, tras retroceder y por `?t=` da hashes idénticos;
- fidelidad de capturas a escala 1,0 y sesgo de color de `web_03`;
- texto dentro del margen seguro del 8 %, subtítulos de dos líneas como máximo y ancho máximo de 1240;
- palabras vetadas en el DOM: URL, QR, App Store, Google Play, iOS, éxito, expediente, IA fuera del rótulo, automático;
- regla de rótulos;
- FPS;
- resoluciones 1366×768, 2560×1440 y 1280×800 (sin interfaz);
- interfaz visible a 1366×768, 1536×730, 1280×800, 844×390 y 390×844: los subtítulos no quedan bajo la barra (suben lo justo mientras se ve), todos los botones caben y la línea de tiempo mide 80 px o más;
- movimiento reducido;
- teclado;
- render de la música (último segundo en silencio);
- pantalla sin WebGL.

En `qa/consola.txt` quedan los errores de consola, los errores de página y **toda** petición de red que no sea `data:`, `file:` o `blob:` (debe estar vacío). En `qa/verificacion.json` queda el detalle.

## Estructura

```
src/main.js               arranque
src/app.js                precarga, bucle único de dibujo, anclajes proyectados, API de pruebas
src/data/guion.js         escenas, titulares, subtítulos, rótulos (+ validación)
src/data/medidas.js       retícula y coordenadas medidas sobre los PNG
src/data/recursos.js      imports ?url (quedan embebidos como data URI)
src/timeline/reloj.js     reloj maestro
src/timeline/pistas.js    motor de pistas (función pura de t)
src/timeline/director.js  compone E = f(t)
src/timeline/escenas/     e01.js … e10.js
src/three/                escenario (cámara en píxeles), fondo, placa, captura (shader), teléfono,
                          ventana, portátil, anillo, nodos, tarjeta, entorno, texturas, sombra
src/ui/                   capa HTML, subtítulos, controles, música, depuración, iconos
scripts/qa.mjs            QA con Playwright + Edge
scripts/copiar.mjs        copia el HTML al paquete
```

## Notas

- **Música.**
  - Es **original**: se sintetiza con Web Audio a 100 BPM, con un pad en Re mayor, bajo, pulso discreto y un arpegio tenue. No usa muestras externas.
  - Está apagada por defecto. Se pre-renderiza en segundo plano y sigue al reloj al pausar o desplazarse.
  - Termina con un fundido completo a los 88,6 s; el último segundo es silencio.
  - No se sintetiza voz: la narración será en vivo o se grabará después.
- **Movimiento reducido.** Si el sistema tiene activado `prefers-reduced-motion`, los recorridos y giros se reducen al 30 % y se eliminan las oscilaciones ambientales.
- **Licencias.**
  - Sora e Inter: SIL OFL 1.1.
  - Iconos Lucide: ISC.
  - three.js: MIT.
  - GSAP: licencia estándar sin coste.
- **Ensayo.** Antes del panel, ensaye en la portátil del evento:
  - abra el archivo desde la USB, con el escalado de Windows al 100 % y en pantalla completa;
  - mida los FPS con `?debug=1`;
  - si el proyector se ve lavado, use `?proyector=1`.

## GitHub Pages y control desde el teléfono

Publicada en **https://elbismanuel.github.io/panama-conecta-311/** (repositorio `elbismanuel/panama-conecta-311`). Cada `git push` a `main` la vuelve a publicar con `.github/workflows/pages.yml` (Settings → Pages → Source: GitHub Actions).

**Qué se publica.** `npm run build:pages` no compila la animación desde `src/`: toma `pages/animacion-base.html`, que es el `10_ANIMACION_WEB.html` validado del 2-oct (SHA-256 `a622684b…`), cambia «tres once» por «311» en los subtítulos y le inyecta el control remoto (`src/remoto/inyectable.js`), que usa la API `window.pc311`. Además genera `dist/control.html`, la página del teléfono. Así se hace porque el código fuente actual no arranca: la composición adaptable (`src/data/composicion.js`) quedó a medias el 2-oct, y `src/three/*` espera campos (`grad`, `horizonte`, `vinetaY`) que `director.js` todavía no produce. Cuando se termine, basta con reemplazar `pages/animacion-base.html` por el nuevo `dist/index.html`. `npm run qa:remoto` prueba el control de punta a punta por internet (12 comprobaciones).

1. Abra la animación publicada en la computadora.
2. Pulse **Control remoto** → **Activar control** (también puede abrir `?remoto=1`).
3. Escanee el código QR con el teléfono o abra allí el enlace privado.
4. Cierre el panel de vinculación en la computadora y use el teléfono para reproducir, pausar, reiniciar o desplazarse 5 segundos. Reiniciar deja la animación en pausa.
5. Para revocar el acceso, pulse **Desconectar teléfono** o recargue la animación. Solo se admite un teléfono por sesión.

La animación conserva el modo local sin red. El control remoto requiere HTTP(S), internet y el servicio de señalización PeerServer Cloud. Los comandos viajan por WebRTC. Algunas redes bloquean WebRTC; pruebe el punto de acceso del teléfono y ensaye en la red del evento. La página de control deshabilita los botones si pierde el estado de la pantalla y no guarda órdenes para enviarlas después. No hay claves de servidor en el repositorio; el enlace contiene una clave aleatoria por sesión y no debe compartirse públicamente.

Active pantalla completa y, si la necesita, música desde la computadora: los navegadores requieren interacción local para esas funciones. La sesión remota no transmite video ni audio al teléfono.
