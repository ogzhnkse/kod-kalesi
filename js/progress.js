// İlerleme: hangi bölümler bitti (localStorage'da).
import { LEVELS } from './levels.js';

const KEY = 'kk_progress';
const ORDER = LEVELS.map(l => l.id);

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter(id => ORDER.includes(id)) : [];
  } catch {
    return [];
  }
}

export const isDone = (id) => load().includes(id);

export function complete(id) {
  const done = load();
  if (!done.includes(id)) done.push(id);
  localStorage.setItem(KEY, JSON.stringify(done));
}

export function getUnlocked() {
  const done = load();
  return ORDER.filter((id, i) => i === 0 || done.includes(id) || done.includes(ORDER[i - 1]));
}

export const isUnlocked = (id) => getUnlocked().includes(id);
