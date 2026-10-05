import { defineConfig } from 'vite';

// Compila el control remoto como un único script (IIFE) para inyectarlo en la animación.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/.remoto',
    emptyOutDir: true,
    target: 'es2022',
    reportCompressedSize: false,
    lib: { entry: 'src/remoto/inyectable.js', formats: ['iife'], name: 'pc311Remoto', fileName: () => 'remoto.js' },
  },
});
