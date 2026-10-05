// Recursos originales (public/recursos, sin modificar). Con ?url, Vite los embebe
// como data URI en el HTML final: cero peticiones de red y sin problemas de CORS en file://.
import refUrl from '../../public/recursos/estilo/REFERENCIA_CINEMATOGRAFICA_IA.png?url';
import m01Url from '../../public/recursos/mobile/mobile_01_inicio.png?url';
import m02Url from '../../public/recursos/mobile/mobile_02_categorias.png?url';
import w01Url from '../../public/recursos/web/web_01_catalogo.png?url';
import w03Url from '../../public/recursos/web/web_03_busqueda_basura.png?url';
import w05dUrl from '../../public/recursos/web/web_05_DEMO_descripcion_detalle.png?url';
import w06dUrl from '../../public/recursos/web/web_06_DEMO_ubicacion_detalle.png?url';
import w07dUrl from '../../public/recursos/web/web_07_DEMO_evidencia_detalle.png?url';
import logoPCUrl from '../../public/recursos/marca/logo_horizontal_blanco.png?url';
import logo311Url from '../../public/recursos/marca/logo_311.png?url';
import logoAIGUrl from '../../public/recursos/marca/logo_aig.png?url';
import soraUrl from '@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url';
import interUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import { LOGOS_MEDIDAS } from './medidas.js';

// Inventario de capturas: tamaño real en píxeles y tipo (para el README y las pruebas).
export const IMAGENES = {
  ref: { url: refUrl, w: 1672, h: 941, archivo: 'estilo/REFERENCIA_CINEMATOGRAFICA_IA.png', tipo: 'ia' },
  m01: { url: m01Url, w: 1080, h: 2400, archivo: 'mobile/mobile_01_inicio.png', tipo: 'real' },
  m02: { url: m02Url, w: 1080, h: 2400, archivo: 'mobile/mobile_02_categorias.png', tipo: 'real' },
  w01: { url: w01Url, w: 1920, h: 1080, archivo: 'web/web_01_catalogo.png', tipo: 'real' },
  w03: { url: w03Url, w: 1920, h: 1080, archivo: 'web/web_03_busqueda_basura.png', tipo: 'real' },
  w05d: { url: w05dUrl, w: 1280, h: 768, archivo: 'web/web_05_DEMO_descripcion_detalle.png', tipo: 'demo' },
  w06d: { url: w06dUrl, w: 1280, h: 972, archivo: 'web/web_06_DEMO_ubicacion_detalle.png', tipo: 'demo' },
  w07d: { url: w07dUrl, w: 1280, h: 704, archivo: 'web/web_07_DEMO_evidencia_detalle.png', tipo: 'demo' },
};

// Logos originales: se muestran como <img>, sin filtros ni recortes y con su proporción.
// Medidas (tamaño, alto de presentación y caja visible) en medidas.js → LOGOS_MEDIDAS.
const LOGO_DATOS = {
  pc: { url: logoPCUrl, alt: 'Panamá Conecta' },
  311: { url: logo311Url, alt: '311 Centro de Atención Ciudadana' },
  aig: { url: logoAIGUrl, alt: 'Gobierno Nacional · Autoridad Nacional para la Innovación Gubernamental (AIG)' },
};
export const LOGOS = LOGOS_MEDIDAS.map((m) => ({ ...m, ...LOGO_DATOS[m.id] }));

export const FUENTES = { sora: soraUrl, inter: interUrl };
