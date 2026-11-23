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
          const done = this.pending.get(data.id);
          this.pending.delete(data.id);
          done(data.result);
        }
      };
    });
    this.readyPromise.catch(() => {}); // reddi ready() çağıranlar görür
  }

  ready() {
    return this.readyPromise;
  }

  async run(code, inputs = [], timeoutMs = 3000) {
    await this.readyPromise;
    const id = this.nextId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.worker.terminate();
        this.spawn();
        resolve({ actions: [], stdout: [], error: { type: 'Timeout', message: '', line: null } });
      }, timeoutMs);
      this.pending.set(id, (result) => { clearTimeout(timer); resolve(result); });
      this.worker.postMessage({ id, code, inputs });
    });
  }
}
