// Web Worker: Pyodide'yi yükler, öğrenci kodunu çalıştırır.
import { runStudentCode } from './py-core.js';

export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodide = null;

async function boot() {
  try {
    const { loadPyodide } = await import(PYODIDE_URL + 'pyodide.mjs');
    pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
    self.postMessage({ type: 'ready' });
  } catch (e) {
    self.postMessage({ type: 'load_error', message: String(e && e.message || e) });
  }
}

self.onmessage = async ({ data }) => {
  const result = await runStudentCode(pyodide, data.code, data.inputs || []);
  self.postMessage({ id: data.id, result });
};

boot();
