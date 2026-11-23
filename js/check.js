// Bölüm hedeflerini denetler.
import { parseMap, simulate } from './world.js';
import { explainError, explainFail } from './errors.js';

export function countLines(code) {
  return code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
}

const inputNote = (c) => (c.inputs ? `(Girdi: ${c.inputs.map(s => `"${s}"`).join(', ')}) ` : '');

export function checkLevel(level, code, results) {
  if (level.maxLines && countLines(code) > level.maxLines) {
    return { passed: false, message: `Bu bölümde en fazla ${level.maxLines} satır kod yazabilirsin. Senin kodun ${countLines(code)} satır. Döngü zamanı!` };
  }
  for (let i = 0; i < level.cases.length; i++) {
    const c = level.cases[i];
    const { run, sim } = results[i];
    const note = i > 0 ? inputNote(c) : '';
    const fail = (message, extra = {}) => ({ passed: false, caseIndex: i, message: note + message, ...extra });
    if (run.error) return fail(explainError(run.error), { line: run.error.line });
    if (sim.fail) return fail(explainFail(sim.fail.reason));
    for (const g of level.goals) {
      if (g === 'flag') {
        const f = sim.final.flag;
        if (!f || sim.final.hero.x !== f.x || sim.final.hero.y !== f.y) return fail('Kod bitti ama bayrağa ulaşamadın. Adımlarını say.');
      } else if (g === 'coins') {
        if (sim.final.coins.size > 0) return fail(`Yerde ${sim.final.coins.size} altın kaldı. Hepsini topla!`);
      } else if (g === 'door') {
        if (sim.final.doors.size > 0) return fail('Hala kapalı kapı var.');
      } else if (g === 'output') {
        const want = c.output.join(' | ');
        const got = run.stdout.join(' | ');
        if (want !== got) return fail(`Beklenen çıktı: "${want}". Senin çıktın: "${got || '(boş)'}". Harfi harfine aynı olmalı.`);
      }
    }
  }
  return { passed: true };
}

export async function evaluate(level, code, runFn) {
  const results = [];
  for (const c of level.cases) {
    const run = await runFn(code, c.inputs || []);
    const sim = simulate(parseMap(c.map), run.actions, { password: c.password });
    results.push({ run, sim });
    if (run.error) break; // checkLevel bu denemede durur; sonrakileri çalıştırmaya gerek yok
  }
  return { ...checkLevel(level, code, results), results };
}
