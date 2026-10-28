import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMessenger, loadSdk, initializeMessenger } from './sdkReady.mjs';

const location = (search = '', hash = '') => ({ search, hash });
test('launch data selects platform; an empty SDK global does not imply Telegram', () => {
    assert.equal(detectMessenger(location(), '', { Telegram: {} }), 'none');
    assert.equal(detectMessenger(location('?platform=max'), 'TelegramMessenger', {}), 'max');
    assert.equal(detectMessenger(location('', '#tgWebAppData=test'), '', {}), 'telegram');
    assert.equal(detectMessenger(location('', '#WebAppData=test'), '', {}), 'max');
    assert.equal(detectMessenger(location(), '', { sessionStorage: { getItem: key => key === 'WebAppData' ? 'test' : null } }), 'max');
});

function fakeDocument(action) {
    let script;
    return {
        createElement: () => (script = { remove() { this.removed = true; } }),
        head: { appendChild: element => action(element) },
        get script() { return script; },
    };
}
test('load event resolves and error/timeout remove the failed script', async () => {
    const success = fakeDocument(script => queueMicrotask(() => script.onload()));
    await loadSdk(success, '/sdk.js');
    assert.equal(success.script.async, true);
    const broken = fakeDocument(script => queueMicrotask(() => script.onerror()));
    await assert.rejects(loadSdk(broken, '/sdk.js'), /load failed/);
    assert.equal(broken.script.removed, true);
    const delayed = fakeDocument(() => {});
    await assert.rejects(loadSdk(delayed, '/sdk.js', 5), /timeout/);
    assert.equal(delayed.script.onload, null);
});

test('late SDK uses the current user, clears previous identity token, and supports retry', async () => {
    const values = new Map([['token', 'synthetic-old-token'], ['user_id', '1'], ['messenger_token_owner', 'max:1']]);
    const host = {
        location: location('?platform=max'), navigator: { userAgent: '' },
        localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) },
    };
    await assert.rejects(initializeMessenger(host, fakeDocument(script => queueMicrotask(() => script.onerror())), '/'));
    assert.equal(host.__MESSENGER_DATA__, undefined);
    const doc = fakeDocument(script => setTimeout(() => {
        host.WebApp = { initData: 'synthetic', initDataUnsafe: { user: { id: 2 } } };
        script.onload();
    }, 5));
    await initializeMessenger(host, doc, '/');
    assert.equal(host.__MESSENGER_DATA__.user.id, 2);
    assert.equal(values.has('token'), false);
    assert.equal(values.get('messenger_token_owner'), 'max:2');
});

test('outside a messenger no SDK request or synthetic account is used', async () => {
    const host = { location: location(), navigator: { userAgent: '' } };
    await initializeMessenger(host, fakeDocument(() => assert.fail('unexpected SDK load')), '/');
    assert.equal(host.__MESSENGER_DATA__.type, 'none');
    assert.equal(host.__MESSENGER_DATA__.user, null);
});
