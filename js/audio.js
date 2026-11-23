// Retro ses efektleri (WebAudio ile üretilir, dosya yok).
const KEY = 'kk_muted';
let ctx = null;

const store = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function isMuted() {
  return store()?.getItem(KEY) === '1';
}

export function setMuted(m) {
  store()?.setItem(KEY, m ? '1' : '0');
}

const SOUNDS = {
  talk: [[520, 0.03]],
  step: [[180, 0.05]],
  coin: [[988, 0.06], [1319, 0.12]],
  door: [[220, 0.08], [330, 0.08], [440, 0.12]],
  error: [[220, 0.12], [150, 0.2]],
  win: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]],
};

export function sfx(name) {
  if (isMuted() || typeof AudioContext === 'undefined') return;
  const notes = SOUNDS[name];
  if (!notes) return;
  ctx = ctx || new AudioContext();
  let t = ctx.currentTime;
  for (const [freq, dur] of notes) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(name === 'talk' ? 0.03 : 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
    t += dur;
  }
}
