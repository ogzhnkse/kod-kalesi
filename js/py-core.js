// Öğrenci kodunu Pyodide üzerinde çalıştırır; oyun komutlarını eylem listesine kaydeder.
// Hem Web Worker'da hem Node testlerinde kullanılır.

export const MAX_ACTIONS = 1000;

const HARNESS = `
import json, builtins, traceback

class TooManyActions(Exception):
    pass

def _kk_run(code, inputs):
    actions = []
    stdout = []
    inputs = list(inputs)

    def push(a):
        if len(actions) >= ${MAX_ACTIONS}:
            raise TooManyActions()
        actions.append(a)

    def yuru(n=1):
        if isinstance(n, bool) or not isinstance(n, int):
            raise TypeError("yuru() bir tam sayı ister")
        if n < 0:
            raise ValueError("yuru() negatif sayı alamaz")
        for _ in range(n):
            push({"t": "yuru"})

    def sola_don():
        push({"t": "sol"})

    def saga_don():
        push({"t": "sag"})

    def al():
        push({"t": "al"})

    def kapi_ac(sifre):
        push({"t": "kapi", "s": str(sifre)})

    def _print(*args, sep=" ", end="\\n", **kw):
        s = sep.join(str(a) for a in args)
        stdout.append(s)
        push({"t": "say", "s": s})

    def _input(prompt=""):
        if not inputs:
            raise EOFError("okunacak girdi kalmadı")
        return inputs.pop(0)

    g = {
        "__name__": "__main__", "__builtins__": builtins,
        "print": _print, "input": _input,
        "yuru": yuru, "sola_don": sola_don, "saga_don": saga_don,
        "al": al, "kapi_ac": kapi_ac,
    }
    err = None
    try:
        exec(compile(code, "<kod>", "exec"), g)
    except SyntaxError as e:
        err = {"type": type(e).__name__, "message": str(e.msg), "line": e.lineno}
    except TooManyActions:
        err = {"type": "TooManyActions", "message": "", "line": None}
    except BaseException as e:
        line = None
        for fr in traceback.extract_tb(e.__traceback__):
            if fr.filename == "<kod>":
                line = fr.lineno
        err = {"type": type(e).__name__, "message": str(e), "line": line}
    return json.dumps({"actions": actions, "stdout": stdout, "error": err}, ensure_ascii=False)
`;

const harnessCache = new WeakMap();

function getHarness(pyodide) {
  let fn = harnessCache.get(pyodide);
  if (!fn) {
    const ns = pyodide.globals.get('dict')();
    pyodide.runPython(HARNESS, { globals: ns });
    fn = ns.get('_kk_run');
    harnessCache.set(pyodide, fn);
  }
  return fn;
}

export async function runStudentCode(pyodide, code, inputs = []) {
  const fn = getHarness(pyodide);
  const pyInputs = pyodide.toPy(inputs.map(String));
  try {
    return JSON.parse(fn(code, pyInputs));
  } finally {
    pyInputs.destroy();
  }
}
