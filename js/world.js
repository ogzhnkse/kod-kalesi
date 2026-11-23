// Izgara dünya ve eylem simülatörü (saf; tarayıcı ve Node'da çalışır).

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 0 yukarı, 1 sağ, 2 aşağı, 3 sol
const key = (x, y) => `${x},${y}`;

export function parseMap(rows) {
  const world = {
    w: Math.max(...rows.map(r => r.length)),
    h: rows.length,
    walls: new Set(), coins: new Set(), doors: new Set(), npcs: new Set(),
    flag: null,
    hero: { x: 0, y: 0, dir: 1 },
  };
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const k = key(x, y);
      if (ch === '#') world.walls.add(k);
      else if (ch === 'C') world.coins.add(k);
      else if (ch === 'D') world.doors.add(k);
      else if (ch === 'N') world.npcs.add(k);
      else if (ch === 'F') world.flag = { x, y };
      else if (ch === 'H') world.hero = { x, y, dir: 1 };
    });
  });
  return world;
}

export function cloneWorld(w) {
  return {
    ...w,
    walls: new Set(w.walls), coins: new Set(w.coins), doors: new Set(w.doors), npcs: new Set(w.npcs),
    flag: w.flag && { ...w.flag },
    hero: { ...w.hero },
  };
}

const ahead = (hero) => {
  const [dx, dy] = DIRS[hero.dir];
  return { x: hero.x + dx, y: hero.y + dy };
};

function snapshot(w, say) {
  const f = { hero: { ...w.hero }, coins: new Set(w.coins), doors: new Set(w.doors) };
  if (say !== undefined) f.say = say;
  return f;
}

export function simulate(world, actions, { password } = {}) {
  const w = cloneWorld(world);
  const frames = [];
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    let fail = null;
    if (a.t === 'yuru') {
      const n = ahead(w.hero);
      const k = key(n.x, n.y);
      const outside = n.x < 0 || n.y < 0 || n.x >= w.w || n.y >= w.h;
      if (outside || w.walls.has(k) || w.npcs.has(k)) fail = 'wall';
      else if (w.doors.has(k)) fail = 'door_closed';
      else { w.hero.x = n.x; w.hero.y = n.y; }
    } else if (a.t === 'sol') {
      w.hero.dir = (w.hero.dir + 3) % 4;
    } else if (a.t === 'sag') {
      w.hero.dir = (w.hero.dir + 1) % 4;
    } else if (a.t === 'al') {
      const k = key(w.hero.x, w.hero.y);
      if (w.coins.has(k)) w.coins.delete(k);
      else fail = 'no_coin';
    } else if (a.t === 'kapi') {
      const n = ahead(w.hero);
      const k = key(n.x, n.y);
      if (!w.doors.has(k)) fail = 'no_door';
      else if (a.s !== (password && typeof password === 'object' ? password[k] : password)) fail = 'wrong_password';
      else w.doors.delete(k);
    }
    if (fail) return { frames, final: w, fail: { reason: fail, index: i } };
    frames.push(snapshot(w, a.t === 'say' ? a.s : undefined));
  }
  return { frames, final: w, fail: null };
}
