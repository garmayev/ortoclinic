// web/vite.config.ts
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const baseUrl = isDev ? '/' : '/max/app-1/';

  return {
    plugins: [
      react(),
      tsconfigPaths(),
    ],
    base: baseUrl,
    root: path.resolve(__dirname), // Явно указываем корень проекта
    publicDir: path.resolve(__dirname, 'public'), // Папка с публичными файлами
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'), // Указываем путь к HTML
        },
      },
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'app'),
        '@': path.resolve(__dirname, 'src'),
      }
    },
    server: {
      https: {
        key: fs.readFileSync('./medix.local-key.pem'),
        cert: fs.readFileSync('./medix.local.pem'),
      },
      host: '0.0.0.0',
      port: 444,
      hmr: {
        protocol: "wss",
        host: 'medix.local',
        clientPort: 444,
      },
      proxy: {
        '/api': {
          target: 'https://medix.amgs.online',
          changeOrigin: true,
          secure: false,
        },
        '/images': {
          target: 'https://medix.amgs.online',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/images/, ''),
        },
        '/base': {
          target: 'https://medix.amgs.online',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => '',
        }
      }
    }
  };
});