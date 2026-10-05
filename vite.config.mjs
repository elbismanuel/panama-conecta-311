import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Un solo HTML autocontenido: JS, CSS, imágenes y fuentes en línea (data URI).
export default defineConfig({
  base: './',
  publicDir: false, // los recursos se importan con ?url y quedan embebidos
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'es2022',
    assetsInlineLimit: 1e9,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 20000,
    reportCompressedSize: false,
    modulePreload: false,
  },
  server: {
    watch: { ignored: ['**/dist/**', '**/qa/**'] },
    fs: { allow: ['.'] },
  },
});
