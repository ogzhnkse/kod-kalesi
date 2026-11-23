// Oğuzhan Hoca: portre animasyonu + daktilo efektli konuşma.
import { drawSprite } from './sprites.js';
import { sfx } from './audio.js';

function drawCurtain(ctx, w, h) {
  for (let x = 0; x < w; x += 4) {
    const fold = Math.floor(x / 4) % 4;
    ctx.fillStyle = ['#7a1023', '#9c1a30', '#b3223a', '#8a1328'][fold];
    ctx.fillRect(x, 0, 4, h);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, h - 6, w, 6);
}

export class Narrator {
  constructor(textEl, portraitCanvas) {
    this.textEl = textEl;
    this.canvas = portraitCanvas;
    this.ctx = portraitCanvas.getContext('2d');
    this.token = 0;
    this.finishNow = null;
    this.drawFace(0);
    textEl.addEventListener('click', () => this.finishNow?.());
  }

  drawFace(frame) {
    const { ctx, canvas } = this;
    ctx.imageSmoothingEnabled = false;
    drawCurtain(ctx, canvas.width, canvas.height);
    const scale = Math.floor(canvas.width / 32);
    drawSprite(ctx, `hoca_${frame}`, (canvas.width - 32 * scale) / 2, canvas.height - 32 * scale, scale);
  }

  cancel() {
    this.token++;
    this.finishNow = null;
    this.drawFace(0);
  }

  // Metni harf harf yazar; metne tıklanınca hemen tamamlar. Bitince çözülür.
  say(text, { mood = 'normal' } = {}) {
    const my = ++this.token;
    this.textEl.dataset.mood = mood;
    this.textEl.textContent = '';
    return new Promise((resolve) => {
      let i = 0;
      const done = () => {
        if (my !== this.token) return resolve();
        this.textEl.textContent = text;
        this.finishNow = null;
        this.drawFace(0);
        resolve();
      };
      this.finishNow = done;
      const tick = () => {
        if (my !== this.token || this.finishNow !== done) return resolve();
        i++;
        this.textEl.textContent = text.slice(0, i);
        this.drawFace(Math.floor(i / 3) % 2);
        if (i % 3 === 0 && text[i - 1] !== ' ') sfx('talk');
        if (i >= text.length) return done();
        setTimeout(tick, 22);
      };
      tick();
    });
  }
}
