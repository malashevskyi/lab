import { defineConfig } from 'vite';
// import path from 'path';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  // Ensures that asset paths are relative, which is required for
  // `chrome.runtime.getURL` to work correctly in content scripts.
  base: '',
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    crx({ manifest }),
    tailwindcss(),
  ],
  test: {
    globals: true, // use describe, it, expect without import
    environment: 'jsdom', // Встановлюємо середовище для DOM-тестів
    include: ['src/**/*.test.{ts,tsx}'], // Вказуємо, де шукати тести
  },
});
