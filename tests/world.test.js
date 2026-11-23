import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMap, simulate } from '../js/world.js';

const Y = { t: 'yuru' };

test('parseMap kahramanı, bayrağı ve duvarları okur', () => {
  const w = parseMap(['#####', '#H.F#', '#####']);
  assert.deepEqual(w.hero, { x: 1, y: 1, dir: 1 });
  assert.deepEqual(w.flag, { x: 3, y: 1 });
  assert.ok(w.walls.has('0,0'));
  assert.equal(w.w, 5);
  assert.equal(w.h, 3);
});

test('iki adım yürüyünce bayrağa varır', () => {
  const r = simulate(parseMap(['#####', '#H.F#', '#####']), [Y, Y]);
  assert.equal(r.final.hero.x, 3);
  assert.equal(r.fail, null);
  assert.equal(r.frames.length, 2);
});

test('duvara çarpınca durur', () => {
  const r = simulate(parseMap(['#####', '#H.F#', '#####']), [Y, Y, Y]);
  assert.deepEqual(r.fail, { reason: 'wall', index: 2 });
  assert.equal(r.frames.length, 2);
});

test('sola dönüp yürüyünce üst duvara çarpar', () => {
  const r = simulate(parseMap(['#####', '#H.F#', '#####']), [{ t: 'sol' }, Y]);
  assert.equal(r.fail.reason, 'wall');
});

test('dört kez sağa dönünce başa döner', () => {
  const s = { t: 'sag' };
  const r = simulate(parseMap(['#####', '#H.F#', '#####']), [s, s, s, s]);
  assert.equal(r.final.hero.dir, 1);
});

test('altın toplanır, yoksa no_coin', () => {
  const r = simulate(parseMap(['#HC.#']), [Y, { t: 'al' }]);
  assert.equal(r.final.coins.size, 0);
  const r2 = simulate(parseMap(['#HC.#']), [Y, { t: 'al' }, { t: 'al' }]);
  assert.equal(r2.fail.reason, 'no_coin');
});

test('kapı: kapalıyken geçilmez, yanlış şifre, doğru şifre, kapı yoksa', () => {
  const m = parseMap(['#HD.#']);
  assert.equal(simulate(m, [Y]).fail.reason, 'door_closed');
  assert.equal(simulate(m, [{ t: 'kapi', s: 'x' }], { password: 'ejder' }).fail.reason, 'wrong_password');
  const ok = simulate(m, [{ t: 'kapi', s: 'ejder' }, Y], { password: 'ejder' });
  assert.equal(ok.fail, null);
  assert.equal(ok.final.hero.x, 2);
  assert.equal(ok.final.doors.size, 0);
  assert.equal(simulate(parseMap(['#H.D#']), [{ t: 'kapi', s: 'ejder' }], { password: 'ejder' }).fail.reason, 'no_door');
});

test('NPC geçilmez', () => {
  assert.equal(simulate(parseMap(['#HN#']), [Y]).fail.reason, 'wall');
});

test('say kahramanı oynatmaz, kareye balon koyar', () => {
  const r = simulate(parseMap(['#H.#']), [{ t: 'say', s: 'selam' }]);
  assert.equal(r.frames[0].say, 'selam');
  assert.equal(r.final.hero.x, 1);
});

test('simulate girdi dünyayı değiştirmez', () => {
  const m = parseMap(['#HC.#']);
  simulate(m, [Y, { t: 'al' }]);
  assert.equal(m.hero.x, 1);
  assert.equal(m.coins.size, 1);
});
