// Izgara dünyayı canvas'a çizer.
import { drawSprite, SPRITES } from './sprites.js';

const C = {
  bg: '#0b0d1a', floor: '#1a1e33', floorDot: '#232845',
  wall: '#3a3f63', wallHi: '#555b88', wallLo: '#262a45',
  bubble: '#f4f1ea', bubbleText: '#0b0d1a',
};

export function tileSize(canvas, world) {
  return Math.max(8, Math.floor(Math.min(canvas.width / world.w, canvas.height / world.h)));
}

function drawWall(ctx, x, y, t) {
  ctx.fillStyle = C.wall; ctx.fillRect(x, y, t, t);
  const p = t / 8;
  ctx.fillStyle = C.wallLo;
  ctx.fillRect(x, y + 4 * p - p / 2, t, p / 2);
  ctx.fillRect(x, y + t - p / 2, t, p / 2);
  ctx.fillRect(x + 4 * p, y, p / 2, 4 * p);
  ctx.fillRect(x + 2 * p, y + 4 * p, p / 2, 4 * p);
  ctx.fillStyle = C.wallHi;
  ctx.fillRect(x, y, t, p / 2);
}

function drawFloor(ctx, x, y, t, gx, gy) {
  ctx.fillStyle = C.floor; ctx.fillRect(x, y, t, t);
  if ((gx + gy) % 2 === 0) {
    const p = t / 8;
    ctx.fillStyle = C.floorDot;
    ctx.fillRect(x + 3 * p, y + 3 * p, p, p);
  }
}

// Sprite'ı karenin ortasına ve altına hizalı çizer.
function placeSprite(ctx, name, x, y, t, flip = false) {
  const s = SPRITES[name];
  const scale = Math.floor(t / 16) || t / 16;
  const w = s.w * scale, h = s.h * scale;
  drawSprite(ctx, name, x + (t - w) / 2, y + (t - h) - Math.floor(t / 16), scale, flip);
}

function drawBubble(ctx, text, hx, hy, t, canvasW) {
  const size = Math.max(12, Math.round(t * 0.38));
  ctx.font = `${size}px "Pixelify Sans", monospace`;
  const label = text.length > 40 ? text.slice(0, 39) + '…' : text;
  const pad = size * 0.5;
  const w = ctx.measureText(label).width + pad * 2;
  const h = size + pad * 1.4;
  let bx = hx + t / 2 - w / 2;
  bx = Math.max(4, Math.min(bx, canvasW - w - 4));
  const by = Math.max(4, hy - h - size * 0.4);
  ctx.fillStyle = C.bubble;
  ctx.fillRect(bx, by, w, h);
  ctx.fillRect(hx + t / 2 - size * 0.3, by + h, size * 0.6, size * 0.4);
  ctx.fillStyle = C.bubbleText;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + pad, by + h / 2 + 1);
}

// world: parseMap sonucu (sabit), state: {hero, coins, doors, say?} (simulate karesi veya başlangıç).
export function drawWorld(ctx, world, state = world) {
  const cv = ctx.canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, cv.width, cv.height);
  const t = tileSize(cv, world);
  const ox = Math.floor((cv.width - t * world.w) / 2);
  const oy = Math.floor((cv.height - t * world.h) / 2);
  for (let gy = 0; gy < world.h; gy++) {
    for (let gx = 0; gx < world.w; gx++) {
      const x = ox + gx * t, y = oy + gy * t, k = `${gx},${gy}`;
      if (world.walls.has(k)) { drawWall(ctx, x, y, t); continue; }
      drawFloor(ctx, x, y, t, gx, gy);
      if (state.coins.has(k)) placeSprite(ctx, 'coin', x, y - t * 0.2, t);
      if (state.doors.has(k)) placeSprite(ctx, 'door', x, y, t);
      if (world.npcs.has(k)) placeSprite(ctx, 'npc', x, y, t);
    }
  }
  if (world.flag) placeSprite(ctx, 'flag', ox + world.flag.x * t, oy + world.flag.y * t, t);
  const hero = state.hero;
  const hx = ox + hero.x * t, hy = oy + hero.y * t;
  placeSprite(ctx, `hero_${hero.dir}`, hx, hy, t);
  if (state.say) drawBubble(ctx, state.say, hx, hy, t, cv.width);
}
