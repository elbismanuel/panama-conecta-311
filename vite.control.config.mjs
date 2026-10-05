import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [viteSingleFile()],
  build: {
    emptyOutDir: false,
    rollupOptions: { input: 'control.html' },
    assetsInlineLimit: 1e9,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
