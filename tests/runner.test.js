import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Runner } from '../js/runner.js';

// Sahte worker: postMessage'ı kaydeder, testin istediği gibi cevap verir.
function fakeFactory(behave) {
  const made = [];
  const make = () => {
    const w = {
      onmessage: null, terminated: false,
      postMessage(msg) { behave.onPost?.(w, msg); },
      terminate() { this.terminated = true; },
      emit(data) { this.onmessage?.({ data }); },
    };
    made.push(w);
    queueMicrotask(() => behave.onCreate?.(w));
    return w;
  };
  return { make, made };
}

const OK = { actions: [{ t: 'yuru' }], stdout: [], error: null };

test('worker cevabı run sonucudur', async () => {
  const f = fakeFactory({
    onCreate: w => w.emit({ type: 'ready' }),
    onPost: (w, m) => queueMicrotask(() => w.emit({ id: m.id, result: OK })),
  });
  const r = new Runner(f.make);
  await r.ready();
  assert.deepEqual(await r.run('yuru()', []), OK);
});

test('cevap gelmezse Timeout, worker yenilenir', async () => {
  const f = fakeFactory({ onCreate: w => w.emit({ type: 'ready' }) });
  const r = new Runner(f.make);
  await r.ready();
  const res = await r.run('while True: pass', [], 50);
  assert.equal(res.error.type, 'Timeout');
  assert.deepEqual(res.actions, []);
  assert.equal(f.made[0].terminated, true);
  assert.equal(f.made.length, 2);
});

test('zaman aşımından sonra yeni worker ile çalışmaya devam eder', async () => {
  let n = 0;
  const f = fakeFactory({
    onCreate: w => w.emit({ type: 'ready' }),
    onPost: (w, m) => { if (n++ > 0) queueMicrotask(() => w.emit({ id: m.id, result: OK })); },
  });
  const r = new Runner(f.make);
  await r.ready();
  await r.run('x', [], 30);
  assert.deepEqual(await r.run('yuru()', [], 200), OK);
});

test('yükleme hatasında ready PYODIDE_LOAD ile reddeder', async () => {
  const f = fakeFactory({ onCreate: w => w.emit({ type: 'load_error', message: 'net' }) });
  const r = new Runner(f.make);
  await assert.rejects(r.ready(), /PYODIDE_LOAD/);
});

test('abort süren çalıştırmayı Aborted ile bitirir, worker yenilenir', async () => {
  const f = fakeFactory({ onCreate: w => w.emit({ type: 'ready' }) });
  const r = new Runner(f.make);
  await r.ready();
  const p = r.run('while True: pass', [], 5000);
  await new Promise(res => setTimeout(res, 10));
  r.abort();
  const res = await p;
  assert.equal(res.error.type, 'Aborted');
  assert.equal(f.made[0].terminated, true);
  assert.equal(f.made.length, 2);
});
