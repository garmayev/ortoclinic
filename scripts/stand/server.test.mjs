import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createStandServer } from './server.mjs';
import { catalog } from './fixtures.mjs';

test('synthetic catalogue preserves all price fields and inactive services', () => {
    const services = catalog(1000).children[0].services;
    assert.equal(services.length, 1000);
    assert.equal(services[2].status, 0);
    for (const service of services) for (const field of ['id', 'title', 'status', 'company_id', 'category_id', 'duration', 'price', 'price_max', 'price_unit']) assert.ok(field in service);
    assert.equal(catalog(0).children[0].services.length, 0);
});

test('stand serves known deep links, correct cache/MIME, and isolates all writes', async t => {
    const server = createStandServer();
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => server.close());
    const origin = `http://127.0.0.1:${server.address().port}`;
    const get = (path, options) => fetch(origin + path, options);
    const rootResponse = await get('/max/app-1/');
    assert.equal(rootResponse.status, 200);
    assert.equal(rootResponse.headers.get('cache-control'), 'no-cache');
    const html = await rootResponse.text();
    for (const path of ['home', 'home/services', 'home/services/9010', 'home/about', 'home/promo/1', 'create', 'history']) {
        assert.equal(await (await get('/max/app-1/' + path)).text(), html);
    }
    assert.equal((await get('/max/app-1/unknown')).status, 404);
    assert.equal((await get('/max/app-1/assets/missing.js')).status, 404);
    const avif = html.match(/href="([^"]+\.avif)"/)[1];
    const image = await get(avif);
    assert.equal(image.headers.get('content-type'), 'image/avif');
    assert.match(image.headers.get('cache-control'), /immutable/);
    for (const path of ['/api/appointment/create', '/api/appointment/cancel', '/api/user/register-telegram']) {
        assert.equal((await get(path, { method: 'POST' })).status, 409);
    }
    const launch = await get('/__stand/launch?platform=telegram&user=900002&catalog=large', { redirect: 'manual' });
    const cookie = launch.headers.get('set-cookie').split(';')[0];
    const sdk = await (await get('/__stand/sdk/telegram.js', { headers: { cookie } })).text();
    assert.match(sdk, /900002/);
    assert.match(sdk, /window.Telegram/);
    const category = await (await get('/api/category/view?id=9000', { headers: { cookie } })).json();
    assert.equal(category.children[0].services.length, 1000);
    const broken = await get('/__stand/launch?apiError=503&sdk=error', { redirect: 'manual' });
    const brokenCookie = broken.headers.get('set-cookie').split(';')[0];
    assert.equal((await get('/api/company/view', { headers: { cookie: brokenCookie } })).status, 503);
    assert.equal((await get('/__stand/sdk/max.js', { headers: { cookie: brokenCookie } })).status, 503);
});
