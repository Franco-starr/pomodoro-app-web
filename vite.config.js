import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        logs: 'logs.html',
      },
    },
  },
});