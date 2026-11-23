import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES } from '../js/sprites.js';

const NEEDED = ['hero_0', 'hero_1', 'hero_2', 'hero_3', 'coin', 'door', 'flag', 'npc', 'hoca_0', 'hoca_1'];

test('gerekli tüm sprite\'lar var', () => {
  for (const n of NEEDED) assert.ok(SPRITES[n], n);
});

test('her satır genişliğe eşit ve her renk harfi palette var', () => {
  for (const [name, s] of Object.entries(SPRITES)) {
    assert.equal(s.rows.length, s.h, `${name} yükseklik`);
    s.rows.forEach((r, i) => {
      assert.equal(r.length, s.w, `${name} satır ${i}`);
      for (const ch of r) if (ch !== '.') assert.ok(s.palette[ch], `${name}: '${ch}' palette yok`);
    });
  }
});

test('hoca konuşma kareleri yalnızca ağız bölgesinde farklı', () => {
  const a = SPRITES.hoca_0.rows, b = SPRITES.hoca_1.rows;
  const diff = a.map((r, i) => (r !== b[i] ? i : -1)).filter(i => i >= 0);
  assert.ok(diff.length > 0 && diff.every(i => i >= 17 && i <= 21), String(diff));
});
