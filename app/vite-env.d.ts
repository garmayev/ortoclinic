// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly BASE_URL: string;
    // Добавьте другие переменные окружения если есть
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}