import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestCoalescer } from './requestCoalescer.mjs';

test('concurrent calls share a request; settled results are not cached', async () => {
    const request = createRequestCoalescer();
    let calls = 0;
    const load = async () => ++calls;
    assert.deepEqual(await Promise.all([request('a', '1', load), request('a', '1', load)]), [1, 1]);
    assert.equal(await request('a', '1', load), 2);
});
test('old session completion cannot remove a new session request', async () => {
    const request = createRequestCoalescer();
    let finishOld, finishNew;
    const old = request('a', '1', () => new Promise(resolve => { finishOld = resolve; }));
    await Promise.resolve();
    const current = request('b', '1', () => new Promise(resolve => { finishNew = resolve; }));
    await Promise.resolve();
    finishOld('old');
    await old;
    assert.equal(request('b', '1', () => assert.fail('duplicate')), current);
    finishNew('new');
    assert.equal(await current, 'new');
});
test('failures allow retry', async () => {
    const request = createRequestCoalescer();
    await assert.rejects(request('a', '1', async () => { throw new Error('503'); }));
    assert.equal(await request('a', '1', async () => 'ok'), 'ok');
});
