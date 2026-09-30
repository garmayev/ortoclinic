// app/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './router';
import {RouterProvider} from "react-router";

console.log('[Main] Script loaded');

const rootElement = document.getElementById('root');
console.log('[Main] Root element:', rootElement);

if (rootElement) {
    console.log('[Main] Creating React root');
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
    console.log('[Main] React rendered');
} else {
    console.error('[Main] Root element not found!');
}
