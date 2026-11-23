// Python worker'ını yönetir: hazır olmayı bekler, kodu çalıştırır, zaman aşımında worker'ı yeniler.

const defaultFactory = () => new Worker(new URL('./py-worker.js', import.meta.url), { type: 'module' });

export class Runner {
  constructor(makeWorker = defaultFactory) {
    this.makeWorker = makeWorker;
    this.nextId = 1;
    this.pending = new Map();
    this.spawn();
  }

  spawn() {
    const w = this.makeWorker();
    this.worker = w;
    this.readyPromise = new Promise((resolve, reject) => {
      w.onmessage = ({ data }) => {
        if (data.type === 'ready') resolve();
        else if (data.type === 'load_error') reject(new Error('PYODIDE_LOAD: ' + data.message));
        else if (data.id && this.pending.has(data.id)) {
          const p = this.pending.get(data.id);
          this.pending.delete(data.id);
          clearTimeout(p.timer);
          p.resolve(data.result);
        }
      };
    });
    this.readyPromise.catch(() => {}); // reddi ready() çağıranlar görür
  }

  ready() {
    return this.readyPromise;
  }

  // Worker'ı öldürüp yeniler; bekleyen tüm çalıştırmalar 'type' hatasıyla biter.
  restart(type = 'Aborted') {
    this.worker.terminate();
    const pending = [...this.pending.values()];
    this.pending.clear();
    this.spawn();
    for (const p of pending) {
      clearTimeout(p.timer);
      p.resolve({ actions: [], stdout: [], error: { type: p.timedOut ? 'Timeout' : type, message: '', line: null } });
    }
  }

  // Süren çalıştırmaları iptal eder (öğrenci yeniden Çalıştır'a bastığında).
  abort() {
    if (this.pending.size) this.restart('Aborted');
  }

  async run(code, inputs = [], timeoutMs = 3000) {
    await this.readyPromise;
    const id = this.nextId++;
    return new Promise((resolve) => {
      const entry = { resolve, timedOut: false };
      entry.timer = setTimeout(() => {
        entry.timedOut = true;
        this.restart('Aborted');
      }, timeoutMs);
      this.pending.set(id, entry);
      this.worker.postMessage({ id, code, inputs });
    });
  }
}
