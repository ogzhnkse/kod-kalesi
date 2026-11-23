import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { loadPyodide } from 'pyodide';
import { runStudentCode } from '../js/py-core.js';
import { LEVELS } from '../js/levels.js';
import { evaluate, countLines } from '../js/check.js';
import { SOLUTIONS } from './solutions.js';

let runFn;
before(async () => {
  const py = await loadPyodide();
  runFn = (code, inputs) => runStudentCode(py, code, inputs);
});

const EXPECTED_IDS = ['1-1', '1-2', '1-3', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2',
  '5-1', '5-2', '5-3', '6-1', '6-2', '6-3', '6-B'];

test('bölümler beklenen sırada ve benzersiz', () => {
  assert.deepEqual(LEVELS.map(l => l.id), EXPECTED_IDS);
});

test('her bölümün çözümü var', () => {
  for (const id of EXPECTED_IDS) assert.ok(SOLUTIONS[id], id);
});

test('anlatım satırları kısa, bölüm kodları benzersiz', () => {
  for (const l of LEVELS) {
    assert.ok(l.intro.length > 0, l.id);
    for (const s of l.intro) assert.ok(s.length <= 120, `${l.id}: ${s}`);
    assert.ok(l.code && l.goal && l.title, l.id);
  }
  assert.equal(new Set(LEVELS.map(l => l.code)).size, LEVELS.length);
});

test('input bölümlerinde en az iki farklı girdi var', () => {
  for (const l of LEVELS.filter(l => l.cases.some(c => c.inputs))) {
    assert.ok(l.cases.length >= 2, l.id);
  }
});

for (const id of EXPECTED_IDS) {
  test(`${id}: doğru çözüm geçer`, async () => {
    const l = LEVELS.find(x => x.id === id);
    const r = await evaluate(l, SOLUTIONS[id].ok, runFn);
    assert.equal(r.passed, true, r.message);
  });
  test(`${id}: yanlış çözüm geçemez`, async () => {
    const l = LEVELS.find(x => x.id === id);
    const r = await evaluate(l, SOLUTIONS[id].bad, runFn);
    assert.equal(r.passed, false);
    assert.ok(r.message.length > 0);
  });
}

test('5-1: girdiyi koda sabit yazan çözüm ikinci denemede düşer', async () => {
  const r = await evaluate(LEVELS.find(x => x.id === '5-1'), SOLUTIONS['5-1'].bad, runFn);
  assert.equal(r.caseIndex, 1);
});

test('6-B: açık yazılmış 41 satır satır sınırına takılır', async () => {
  const r = await evaluate(LEVELS.find(x => x.id === '6-B'), SOLUTIONS['6-B'].bad, runFn);
  assert.match(r.message, /6 satır/);
});

test('countLines boş ve yorum satırlarını saymaz', () => {
  assert.equal(countLines('# not\nyuru()\n\n   \n  al()  # yorum'), 2);
});

test('evaluate ilk hatalı denemede durur (zaman aşımı tekrar tekrar beklenmez)', async () => {
  let calls = 0;
  const fake = async () => { calls++; return { actions: [], stdout: [], error: { type: 'Timeout', message: '', line: null } }; };
  const r = await evaluate(LEVELS.find(x => x.id === '5-3'), 'x', fake);
  assert.equal(calls, 1);
  assert.equal(r.passed, false);
  assert.equal(r.caseIndex, 0);
});
