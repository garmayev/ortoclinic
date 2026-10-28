import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiFixture } from './fixtures.mjs';

const base = '/max/app-1/';
const root = resolve(fileURLToPath(new URL('../../dist-stand/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.ico': 'image/x-icon' };
const knownRoute = /^(?:home(?:\/(?:about|promo(?:\/\d+)?|services(?:\/\d+)?))?|history|create)?\/?$/;
const delay = ms => new Promise(done => setTimeout(done, Math.min(15000, Math.max(0, Number(ms) || 0))));

export function createStandServer() {
    return createServer(async (req, res) => {
        try {
            const url = new URL(req.url, 'http://127.0.0.1');
            const cookie = req.headers.cookie?.match(/(?:^|; )stand=([^;]*)/);
            let config = {};
            try { config = JSON.parse(decodeURIComponent(cookie?.[1] || '{}')); } catch {}
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'");
            if (url.pathname === '/') {
                res.setHeader('Content-Type', mime['.html']);
                res.end(`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Medix — локальный стенд</title><body><h1>Medix — синтетический стенд</h1><p>Только локальные данные. Сохранение записей отключено.</p><form action="/__stand/launch"><p>Платформа <select name="platform"><option>max</option><option>telegram</option><option>none</option></select></p><p>SDK <select name="sdk"><option value="ok">Готов</option><option value="error">Ошибка</option><option value="timeout">Таймаут</option></select></p><p>Задержка SDK, мс <input name="sdkDelay" type="number" value="0" min="0" max="15000"></p><p>Задержка API, мс <input name="apiDelay" type="number" value="0" min="0" max="15000"></p><p>API <select name="apiError"><option value="">200</option><option>503</option></select></p><p>Каталог <select name="catalog"><option value="normal">Обычный</option><option value="empty">Пустой</option><option value="large">1000 услуг</option></select></p><p>Синтетический пользователь <select name="user"><option>900001</option><option>900002</option></select></p><button>Запустить приложение</button></form></body></html>`);
                return;
            }
            if (url.pathname === '/__stand/launch') {
                const config = Object.fromEntries(url.searchParams);
                res.setHeader('Set-Cookie', `stand=${encodeURIComponent(JSON.stringify(config))}; Path=/; SameSite=Strict; HttpOnly`);
                res.writeHead(302, { Location: base + `?platform=${config.platform === 'none' ? 'none' : config.platform === 'telegram' ? 'telegram' : 'max'}` });
                res.end(); return;
            }
            if (/^\/__stand\/sdk\/(max|telegram)\.js$/.test(url.pathname)) {
                await delay(config.sdk === 'timeout' ? 15000 : config.sdkDelay);
                if (config.sdk === 'error') { res.writeHead(503); res.end(); return; }
                res.setHeader('Content-Type', mime['.js']);
                const user = Number(config.user) === 900002 ? 900002 : 900001;
                const target = url.pathname.includes('telegram') ? '(window.Telegram ||= {}).WebApp' : 'window.WebApp';
                const remember = url.pathname.includes('telegram')
                    ? `sessionStorage.removeItem('WebAppData');sessionStorage.setItem('__telegram__initParams',JSON.stringify({tgWebAppData:'synthetic'}));`
                    : `sessionStorage.removeItem('__telegram__initParams');sessionStorage.setItem('WebAppData','synthetic');`;
                res.end(`${remember}${target} = {initData:'synthetic-stand-only',initDataUnsafe:{user:{id:${user},first_name:'Тестовый',last_name:'Пользователь'}},ready(){},expand(){},close(){},requestContact:async()=>({phone:null})};`);
                return;
            }
            if (url.pathname.startsWith('/api/')) {
                await delay(config.apiDelay);
                const result = apiFixture(url.pathname, url.searchParams, config);
                res.writeHead(result.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.data)); return;
            }
            if (!url.pathname.startsWith(base)) { res.writeHead(404); res.end(); return; }
            const relative = decodeURIComponent(url.pathname.slice(base.length));
            const file = resolve(root, knownRoute.test(relative) ? 'index.html' : relative);
            if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
            try {
                const bytes = await readFile(file);
                res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
                res.setHeader('Cache-Control', /\/assets\/[^/]+-[\w-]+\.(?:js|css|avif|webp|woff2)$/.test(url.pathname) ? 'public, max-age=31536000, immutable' : 'no-cache');
                res.end(bytes);
            } catch { res.writeHead(404); res.end('Not found'); }
        } catch { res.writeHead(500); res.end('Stand error'); }
    });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    createStandServer().listen(4174, '127.0.0.1', () => console.log('Medix synthetic stand: http://127.0.0.1:4174/'));
}
