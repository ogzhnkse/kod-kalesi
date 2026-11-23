// Ekran akışı: başlangıç → harita → bölüm → çalıştır/canlandır → sonuç.
import { LEVELS } from './levels.js';
import { parseMap } from './world.js';
import { evaluate, countLines } from './check.js';
import { drawWorld } from './render.js';
import { Narrator } from './dialog.js';
import { Runner } from './runner.js';
import { createEditor } from './editor.js';
import { sfx, isMuted, setMuted } from './audio.js';
import { drawSprite } from './sprites.js';
import * as progress from './progress.js';

const $ = (s) => document.querySelector(s);
const TOPIC_NAMES = { 1: 'print', 2: 'komutlar', 3: 'değişkenler', 4: 'sayılar', 5: 'input ve if', 6: 'for döngüsü' };
const STEP_MS = 230, SAY_MS = 700;

const state = {
  runner: null, pyReady: false, pyFailed: false,
  level: null, editor: null, narrator: null,
  animToken: 0, running: false, introToken: 0,
};

// ---------- yardımcılar ----------
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
}

function drawPortrait(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let x = 0; x < canvas.width; x += 5) {
    ctx.fillStyle = ['#7a1023', '#9c1a30', '#b3223a', '#8a1328'][Math.floor(x / 5) % 4];
    ctx.fillRect(x, 0, 5, canvas.height);
  }
  drawSprite(ctx, 'hoca_1', 0, 0, 5);
}

function setStatus(text, error = false) {
  for (const el of [$('#py-status'), $('#run-status')]) {
    el.textContent = text;
    el.classList.toggle('error', error);
  }
}

function log(text, cls = '') {
  const c = $('#console');
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = text + '\n';
  c.append(span);
  c.scrollTop = c.scrollHeight;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

function resizeWorldCanvas() {
  const cv = $('#world');
  const r = cv.getBoundingClientRect();
  if (r.width && r.height) {
    cv.width = Math.round(r.width * devicePixelRatio);
    cv.height = Math.round(r.height * devicePixelRatio);
  }
}

function initialWorld(caseIdx = 0) {
  return parseMap(state.level.cases[caseIdx].map);
}

function drawInitial(caseIdx = 0) {
  const w = initialWorld(caseIdx);
  drawWorld($('#world').getContext('2d'), w);
}

function updateLineLimit() {
  const el = $('#line-limit');
  const max = state.level?.maxLines;
  if (!max) { el.textContent = ''; return; }
  const n = countLines(state.editor.getValue());
  el.textContent = `${n} / ${max} satır`;
  el.classList.toggle('over', n > max);
}

// ---------- ses düğmesi ----------
function syncMute() {
  document.querySelectorAll('.btn-mute').forEach(b => {
    b.classList.toggle('off', isMuted());
    b.textContent = isMuted() ? '♪ kapalı' : '♪ açık';
  });
}
document.querySelectorAll('.btn-mute').forEach(b => b.addEventListener('click', () => { setMuted(!isMuted()); syncMute(); }));

// ---------- harita ----------
function renderMap() {
  const box = $('#level-map');
  box.innerHTML = '';
  const topics = [];
  for (const l of LEVELS) {
    const n = l.id[0];
    let t = topics.find(x => x.n === n);
    if (!t) topics.push(t = { n, levels: [] });
    t.levels.push(l);
  }
  topics.forEach((t) => {
    const sec = document.createElement('div');
    sec.className = 'topic';
    sec.innerHTML = `<h2>${t.n}. <b>${TOPIC_NAMES[t.n]}</b></h2><div class="tiles"></div>`;
    for (const l of t.levels) {
      const b = document.createElement('button');
      const locked = !progress.isUnlocked(l.id);
      b.className = 'level-tile' + (locked ? ' locked' : '') + (progress.isDone(l.id) ? ' done' : '') + (l.id.endsWith('B') ? ' boss' : '');
      b.innerHTML = `<span class="id"></span><span class="name"></span>`;
      b.querySelector('.id').textContent = l.id;
      b.querySelector('.name').textContent = l.title;
      b.disabled = locked;
      b.addEventListener('click', () => openLevel(l));
      sec.querySelector('.tiles').append(b);
    }
    box.append(sec);
  });
}

// ---------- bölüm ----------
async function playIntro(lines) {
  const my = ++state.introToken;
  const next = $('#btn-next');
  for (let i = 0; i < lines.length; i++) {
    if (my !== state.introToken) return;
    await state.narrator.say(lines[i]);
    if (my !== state.introToken) return;
    if (i < lines.length - 1) {
      next.hidden = false;
      await new Promise(res => {
        const go = () => { next.removeEventListener('click', go); res(); };
        next.addEventListener('click', go);
        state.cancelIntroWait = go;
      });
      next.hidden = true;
    }
  }
}

function stopIntro() {
  state.introToken++;
  $('#btn-next').hidden = true;
  state.cancelIntroWait?.();
  state.cancelIntroWait = null;
}

const codeKey = (id) => `kk_code_${id}`;

function openLevel(level) {
  state.level = level;
  cancelAnimation();
  $('#win').hidden = true;
  $('#console').textContent = '';
  $('#level-title').innerHTML = `<span class="lid"></span><span class="lname"></span>`;
  $('#level-title .lid').textContent = level.id;
  $('#level-title .lname').textContent = level.title;
  $('#goal-text').textContent = level.goal;
  state.editor.setValue(localStorage.getItem(codeKey(level.id)) ?? level.starter);
  state.editor.markLine(null);
  updateLineLimit();
  show('screen-play');
  resizeWorldCanvas();
  drawInitial();
  if (level.cases.some(c => c.inputs)) {
    log(`Bu bölümde bekçi her denemede farklı bir şey söyleyecek. (${level.cases.length} deneme)`, 'info');
  }
  stopIntro();
  playIntro(level.intro);
}

function cancelAnimation() {
  state.animToken++;
  state.running = false;
  $('#btn-run').disabled = !state.pyReady;
}

async function animate(world, frames, token) {
  const ctx = $('#world').getContext('2d');
  let prev = world;
  drawWorld(ctx, world);
  await wait(200);
  for (const f of frames) {
    if (token !== state.animToken) return false;
    if (f.coins.size < prev.coins.size) sfx('coin');
    else if (f.doors.size < prev.doors.size) sfx('door');
    else if (f.hero.x !== prev.hero.x || f.hero.y !== prev.hero.y) sfx('step');
    drawWorld(ctx, world, f);
    prev = f;
    await wait(f.say !== undefined ? SAY_MS : STEP_MS);
  }
  return token === state.animToken;
}

async function run() {
  if (!state.pyReady) return;
  stopIntro();
  cancelAnimation();
  const token = state.animToken;
  state.running = true;
  $('#win').hidden = true;
  state.editor.markLine(null);
  $('#console').textContent = '';
  $('#run-status').textContent = 'Çalışıyor…';
  const level = state.level;
  const code = state.editor.getValue();
  localStorage.setItem(codeKey(level.id), code);

  const result = await evaluate(level, code, (c, inputs) => state.runner.run(c, inputs));
  if (token !== state.animToken) return;
  $('#run-status').textContent = '';

  const idx = result.caseIndex ?? 0;
  const shown = result.results[idx] || result.results[0];
  const c = level.cases[idx];
  if (c.inputs) log(`Bekçi fısıldadı: ${c.inputs.map(s => `"${s}"`).join(', ')}`, 'info');

  const world = parseMap(c.map);
  const completed = shown ? await animate(world, shown.sim.frames, token) : true;
  if (!completed) return;

  if (shown) shown.run.stdout.forEach(line => log(line));
  if (shown?.run.error) {
    const e = shown.run.error;
    const where = e.line ? ` (satır ${e.line})` : '';
    log(`${e.type}${e.message ? ': ' + e.message : ''}${where}`, 'err');
  }

  state.running = false;
  if (result.passed) {
    progress.complete(level.id);
    sfx('win');
    $('#win-code').textContent = level.code;
    $('#win').hidden = false;
    state.narrator.say(pickPraise(), { mood: 'win' });
  } else {
    sfx('error');
    if (result.line) state.editor.markLine(result.line);
    state.narrator.say(result.message, { mood: 'error' });
  }
}

const PRAISES = [
  'İşte bu! Python seninle gurur duyuyor. Ben de.',
  'Temiz iş. Kodun bir saat gibi çalıştı.',
  'Harika! Bunu ilk denemede mi yaptın, yoksa bana mı öyle geldi?',
  'Kale kapıları senin için açılıyor. Devam!',
];
const pickPraise = () => PRAISES[Math.floor(Math.random() * PRAISES.length)];

function nextLevel() {
  const i = LEVELS.indexOf(state.level);
  if (i === LEVELS.length - 1) {
    show('screen-end');
    return;
  }
  openLevel(LEVELS[i + 1]);
}

// ---------- başlat ----------
async function boot() {
  drawPortrait($('#title-portrait'));
  drawPortrait($('#end-portrait'));
  syncMute();
  state.narrator = new Narrator($('#speech-text'), $('#portrait'));
  const pyBoot = bootPython(); // Python editörden bağımsız, hemen yüklenmeye başlasın
  state.editor = await createEditor($('#editor'), '');
  state.editor.onChange(() => updateLineLimit());

  $('#btn-start').addEventListener('click', () => { renderMap(); show('screen-map'); });
  $('#btn-map').addEventListener('click', () => { cancelAnimation(); stopIntro(); renderMap(); show('screen-map'); });
  $('#btn-end-map').addEventListener('click', () => { renderMap(); show('screen-map'); });
  $('#btn-run').addEventListener('click', run);
  $('#btn-reset').addEventListener('click', () => {
    cancelAnimation();
    $('#win').hidden = true;
    state.editor.markLine(null);
    drawInitial();
  });
  $('#btn-again').addEventListener('click', () => { $('#win').hidden = true; drawInitial(); });
  $('#btn-continue').addEventListener('click', nextLevel);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && $('#screen-play').classList.contains('active')) { e.preventDefault(); run(); }
  });
  window.addEventListener('resize', () => {
    if (!$('#screen-play').classList.contains('active') || state.running) return;
    resizeWorldCanvas();
    drawInitial();
  });

  await pyBoot;
}

async function bootPython() {
  try {
    state.runner = new Runner();
    await state.runner.ready();
    state.pyReady = true;
    setStatus('Python hazır ✓');
    $('#btn-run').disabled = false;
  } catch {
    state.pyFailed = true;
    setStatus('Python yüklenemedi. İnternet bağlantını kontrol et ya da sayfayı yenile. (Okul ağı engelliyor olabilir.)', true);
  }
}

boot();
