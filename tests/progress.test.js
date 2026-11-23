import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
const { getUnlocked, complete, isUnlocked, isDone } = await import('../js/progress.js');

beforeEach(() => mem.clear());

test('başta yalnızca 1-1 açık', () => {
  assert.deepEqual(getUnlocked(), ['1-1']);
  assert.equal(isUnlocked('1-2'), false);
});

test('bitirilen bölüm sonrakini açar ve bitti sayılır', () => {
  complete('1-1');
  assert.equal(isUnlocked('1-2'), true);
  assert.equal(isDone('1-1'), true);
  assert.equal(isDone('1-2'), false);
});

test('son bölümü bitirmek hata vermez', () => {
  complete('6-B');
  assert.equal(isDone('6-B'), true);
});

test('bozuk kayıt sıfırdan başlar', () => {
  mem.set('kk_progress', '{bozuk');
  assert.deepEqual(getUnlocked(), ['1-1']);
});
