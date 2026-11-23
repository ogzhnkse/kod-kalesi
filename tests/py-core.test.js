import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { loadPyodide } from 'pyodide';
import { runStudentCode } from '../js/py-core.js';

let py;
before(async () => { py = await loadPyodide(); });

const run = (code, inputs = []) => runStudentCode(py, code, inputs);

test('print stdout ve say eylemi üretir', async () => {
  const r = await run('print("Merhaba")');
  assert.equal(r.error, null);
  assert.deepEqual(r.stdout, ['Merhaba']);
  assert.deepEqual(r.actions, [{ t: 'say', s: 'Merhaba' }]);
});

test('yuru(3) üç yuru eylemine açılır', async () => {
  const r = await run('yuru(3)\nsola_don()\nsaga_don()\nal()');
  assert.deepEqual(r.actions.map(a => a.t), ['yuru', 'yuru', 'yuru', 'sol', 'sag', 'al']);
});

test('input verilen girdileri sırayla döner', async () => {
  const r = await run('x = input("şifre? ")\nkapi_ac(x)', ['ejder']);
  assert.equal(r.error, null);
  assert.deepEqual(r.actions, [{ t: 'kapi', s: 'ejder' }]);
});

test('girdi tükenince EOFError', async () => {
  const r = await run('input()\ninput()', ['a']);
  assert.equal(r.error.type, 'EOFError');
  assert.equal(r.error.line, 2);
});

test('Türkçe karakterler bozulmadan geçer', async () => {
  const r = await run('print("şifre ğİ")');
  assert.deepEqual(r.stdout, ['şifre ğİ']);
});

test('print birden çok argümanı boşlukla birleştirir', async () => {
  const r = await run('print("altın:", 3)');
  assert.deepEqual(r.stdout, ['altın: 3']);
});

test('oyun komutunu ezen kod çökmez, TypeError satır 2', async () => {
  const r = await run('yuru = 5\nyuru()');
  assert.equal(r.error.type, 'TypeError');
  assert.equal(r.error.line, 2);
});

test('yuru tam sayı olmayanla TypeError, negatifle ValueError', async () => {
  assert.equal((await run('yuru("3")')).error.type, 'TypeError');
  assert.equal((await run('yuru(-1)')).error.type, 'ValueError');
});

test('SyntaxError satır 1', async () => {
  const r = await run('print("a"');
  assert.equal(r.error.type, 'SyntaxError');
  assert.equal(r.error.line, 1);
});

test('NameError satır ve isim', async () => {
  const r = await run('\nprint(y)');
  assert.equal(r.error.type, 'NameError');
  assert.equal(r.error.line, 2);
  assert.match(r.error.message, /'y'/);
});

test('1000 eylemi aşınca TooManyActions', async () => {
  const r = await run('for i in range(2000):\n    yuru()');
  assert.equal(r.error.type, 'TooManyActions');
});

test('çalıştırmalar arasında değişken sızmaz', async () => {
  await run('a = 1');
  const r = await run('print(a)');
  assert.equal(r.error.type, 'NameError');
});

test('hata öncesi eylemler korunur', async () => {
  const r = await run('yuru()\nprint(z)');
  assert.deepEqual(r.actions, [{ t: 'yuru' }]);
});
