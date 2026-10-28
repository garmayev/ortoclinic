// app/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { initializeMessenger } from './sdkReady.mjs';

console.log('[Main] Script loaded');

const rootElement = document.getElementById('root');
console.log('[Main] Root element:', rootElement);

async function start() {
    if (!rootElement) return;
    try {
        await initializeMessenger();
    } catch {
        // No authentication or stored-token fallback after SDK failure.
        const message = document.createElement('p');
        message.textContent = 'Не удалось загрузить приложение мессенджера. Проверьте соединение.';
        const retry = document.createElement('button');
        retry.textContent = 'Повторить загрузку';
        retry.onclick = () => { retry.disabled = true; void start(); };
        rootElement.replaceChildren(message, retry);
        return;
    }
    const { router } = await import('./router');
    console.log('[Main] Creating React root');
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
    console.log('[Main] React rendered');
}
void start();
