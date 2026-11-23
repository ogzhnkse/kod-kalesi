import { test } from 'node:test';
import assert from 'node:assert/strict';
import { explainError, explainFail } from '../js/errors.js';

const cases = [
  { type: 'SyntaxError', message: "'(' was never closed", line: 3 },
  { type: 'IndentationError', message: 'expected an indented block', line: 4 },
  { type: 'TabError', message: 'inconsistent use of tabs and spaces in indentation', line: 5 },
  { type: 'NameError', message: "name 'sifre' is not defined", line: 2 },
  { type: 'TypeError', message: "'int' object is not callable", line: 2 },
  { type: 'ValueError', message: 'yuru() negatif sayı alamaz', line: 1 },
  { type: 'EOFError', message: 'okunacak girdi kalmadı', line: 6 },
];

for (const c of cases) {
  test(`${c.type} için satırlı Türkçe ipucu`, () => {
    const s = explainError(c);
    assert.ok(s.length > 0 && s.length <= 160, s);
    assert.match(s, new RegExp(String(c.line)));
  });
}

test('TabError tab/boşluk karışıklığını söyler', () => {
  assert.match(explainError(cases[2]), /tab/i);
});

test('NameError adı içerir', () => {
  assert.match(explainError(cases[3]), /sifre/);
});

test('ezilmiş komut TypeError ipucu "not callable" durumunu anlatır', () => {
  assert.match(explainError(cases[4]), /çağır|fonksiyon/i);
});

test('Timeout sonsuz döngüden bahseder', () => {
  assert.match(explainError({ type: 'Timeout', message: '', line: null }), /sonsuz döngü/i);
});

test('TooManyActions ve bilinmeyen tür boş olmayan metin döner', () => {
  for (const t of ['TooManyActions', 'ZeroDivisionError', 'Bilinmeyen']) {
    const s = explainError({ type: t, message: 'x', line: 1 });
    assert.ok(s.length > 0 && s.length <= 160, s);
  }
});

test('her başarısızlık sebebi için ipucu', () => {
  for (const r of ['wall', 'door_closed', 'no_coin', 'no_door', 'wrong_password']) {
    const s = explainFail(r);
    assert.ok(s.length > 0 && s.length <= 160, r);
  }
});
