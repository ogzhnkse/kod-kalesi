// Piksel çizimler. '.' saydam; diğer harfler palette'teki renk.

// Satırı belirli bir girintiyle verip 'w' genişliğe '.' ile tamamlar.
const P = (w) => (off, s = '') => ('.'.repeat(off) + s).padEnd(w, '.').slice(0, w);

const mirror = (rows) => rows.map(r => [...r].reverse().join(''));

// --- Oğuzhan Hoca (32×32): kısa koyu saç, yuvarlak şeffaf gözlük, keçi sakal, geniş gülümseme, lacivert polo.
const H = P(32);
const HOCA_PAL = {
  k: '#1c1514', K: '#3a2c28', // saç, saç parlaklığı
  s: '#c98d66', S: '#a86c4b', h: '#e2aa82', // ten, gölge, parlaklık
  g: '#e9e4da', l: '#d9a27c', e: '#2a1a12', // gözlük çerçevesi, cam arkası ten, göz
  m: '#6b2a26', t: '#f6efe4', // ağız, diş
  b: '#1d1513', B: '#3b2d29', // sakal
  n: '#16203a', N: '#2b3a5e', // polo
};
const HOCA_TOP = [
  H(11, 'KkkkkkkK'),
  H(8, 'kkkkkKKkkkkkkk'),
  H(7, 'kkkkkkkkKKkkkkkk'),
  H(7, 'kkkkkkkkkkkkkkkkk'),
  H(6, 'kkkkkkkkkkkkkkkkkkk'),
  H(6, 'kkkssssssssssssskkk'),
  H(6, 'kk' + 's'.repeat(15) + 'kk'),
  H(6, 'kssss' + 'h'.repeat(9) + 'ssssk'),
  H(6, 'ksssssssssssssssssk'),
  H(6, 'sskkkkksssskkkkksss'),
  H(6, 'sgggggggssgggggggss'),
  H(6, 'gglllllgggglllllggs'),
  H(6, 'sgleeelgssgleeelgss'),
  H(6, 'sglllllgssglllllgss'),
  H(6, 'ssgggggssssgggggsss'),
  H(6, 'ssssssssSSsssssssss'),
  H(6, 'S' + 's'.repeat(7) + 'SSS' + 's'.repeat(7) + 'S'),
];
const HOCA_BOTTOM = [
  H(6, 'S' + 's'.repeat(17) + 'S'),
  H(6, 'SSssssbbbbbbbssssSS'),
  H(7, 'SSssbbbbbbbbbssSS'),
  H(8, 'SSsbbbbBbbbbsSS'),
  H(10, 'SSbbbbbbbSS'),
  H(12, 'bbbbbbb'),
  H(12, 'SSSSSSSS'),
  H(4, 'nnnnnnnNNSSSSSSNNnnnnnnn'),
  H(3, 'nnnnnnnnnNNSSSSNNnnnnnnnnn'),
  H(2, 'nnnnnnnnnnnNNSSNNnnnnnnnnnnn'),
  H(1, 'nnnnnnnnnnnnnnNNnnnnnnnnnnnnnn'),
  H(0, 'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn'),
];
// Ağız: 17-19. satırlar (kapalı ve açık gülümseme).
const SMILE_TOP = H(6, 'Sss' + 'm' + 's'.repeat(11) + 'm' + 'ssS');
const CHEEK = H(6, 'S' + 's'.repeat(17) + 'S');
const MOUTH_CLOSED = [SMILE_TOP, H(6, 'Ssss' + 'm'.repeat(11) + 'sssS'), CHEEK];
const MOUTH_OPEN = [SMILE_TOP, H(6, 'Ssssm' + 't'.repeat(9) + 'msssS'), H(6, 'Sssss' + 'm'.repeat(9) + 'ssssS')];
// Toplam: 17 üst + 3 ağız + 12 alt = 32.
const hocaRows = (mouth) => [...HOCA_TOP, ...mouth, ...HOCA_BOTTOM];

// --- Kahraman (12×14), kapüşonlu genç maceracı.
const HERO_PAL = {
  o: '#0e0f1a', k: '#5a3a1e', s: '#f0c095', e: '#0e0f1a',
  c: '#22c7b8', C: '#13877e', p: '#3b3f6b', b: '#6b3f25',
};
const HERO_BODY = [
  '..occccccco.',
  '.occcccccco.',
  '.ocCccccCso.',
  '.ocCccccCco.',
  '..occccccco.',
  '..oppppppo..',
  '..opppoppo..',
  '..opo..opo..',
  '..obbo.obbo.',
];
const HERO_RIGHT = [
  '...oooooo...',
  '..okkkkkkko.',
  '..okksssseo.',
  '..oksssssso.',
  '...oossssoo.',
  ...HERO_BODY,
];
const HERO_DOWN = [
  '...oooooo...',
  '..okkkkkkko.',
  '..osessseso.',
  '..osssssso..',
  '...oossoo...',
  ...HERO_BODY,
];
const HERO_UP = [
  '...oooooo...',
  '..okkkkkkko.',
  '..okkkkkkko.',
  '..okkkkkko..',
  '...ookkoo...',
  ...HERO_BODY,
];

const sprite = (rows, palette) => ({ w: rows[0].length, h: rows.length, palette, rows });

export const SPRITES = {
  hoca_0: sprite(hocaRows(MOUTH_CLOSED), HOCA_PAL),
  hoca_1: sprite(hocaRows(MOUTH_OPEN), HOCA_PAL),
  hero_0: sprite(HERO_UP, HERO_PAL),
  hero_1: sprite(HERO_RIGHT, HERO_PAL),
  hero_2: sprite(HERO_DOWN, HERO_PAL),
  hero_3: sprite(mirror(HERO_RIGHT), HERO_PAL),
  coin: sprite([
    '..oooo..',
    '.oyyyyo.',
    'oyyhyyyo',
    'oyhyyYyo',
    'oyyyyYyo',
    'oyyyYYyo',
    '.oyyyyo.',
    '..oooo..',
  ], { o: '#7a4a00', y: '#ffcf3a', Y: '#e09a12', h: '#fff4b0' }),
  door: sprite([
    '..oooooooooo..',
    '.owwwwwwwwwwo.',
    'owWwwwWwwwwWwo',
    'owWwwwWwwwwWwo',
    'owWwwwWwwwwWwo',
    'owWwwwWwwwwWwo',
    'owWwwwWwyywWwo',
    'owWwwwWwyywWwo',
    'owWwwwWwwywWwo',
    'owWwwwWwwwwWwo',
    'owWwwwWwwwwWwo',
    'owWwwwWwwwwWwo',
    'owwwwwwwwwwwwo',
    'oooooooooooooo',
  ], { o: '#1b0f08', w: '#8a5a2b', W: '#5e3a18', y: '#ffcf3a' }),
  flag: sprite([
    '.oo.........',
    '.orrrrrro...',
    '.orrrrrrrro.',
    '.orrrRrrrrro',
    '.orrrrrrrro.',
    '.orrrrrro...',
    '.oo.........',
    '.oo.........',
    '.oo.........',
    '.oo.........',
    '.oo.........',
    'oooo........',
  ], { o: '#d8d8e0', r: '#ff4f6d', R: '#ffd1da' }),
  npc: sprite([
    '...oooooo...',
    '..ommmmmmo..',
    '.ommmMmmmmo.',
    '..osseesso..',
    '..osssssso..',
    '...oossoo...',
    '..oaaaaaaoq.',
    '.oaaAaaAaaoq',
    '.oaaaaaaaaoq',
    '..oaaaaaao.q',
    '..oppppppo.q',
    '..opo..opo.q',
    '..obbo.obboq',
  ], { o: '#0e0f1a', m: '#9aa3b5', M: '#e3e7ef', s: '#e0a77c', e: '#0e0f1a', a: '#b23a48', A: '#ffcf3a', p: '#3b3f6b', b: '#4a2b18', q: '#c9ced8' }),
};

// Bir sprite'ı (x, y) köşesine, her pikseli 'scale' boyutunda çizer. flip: yatay ayna.
export function drawSprite(ctx, name, x, y, scale, flip = false) {
  const s = SPRITES[name];
  const p = Math.max(1, scale);
  for (let j = 0; j < s.h; j++) {
    const row = s.rows[j];
    for (let i = 0; i < s.w; i++) {
      const ch = row[flip ? s.w - 1 - i : i];
      if (ch === '.') continue;
      ctx.fillStyle = s.palette[ch];
      ctx.fillRect(Math.floor(x + i * p), Math.floor(y + j * p), Math.ceil(p), Math.ceil(p));
    }
  }
}
