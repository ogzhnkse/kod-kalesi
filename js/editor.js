// Kod editörü: CodeMirror 6 (CDN). Yüklenemezse sade textarea'ya düşer.

const CM = 'https://esm.sh/';
// Tüm paketler aynı state/view/language örneğini kullanmalı; yoksa CodeMirror "Unrecognized extension" hatası verir.
const DEPS = '?deps=@codemirror/state@6.7.6,@codemirror/view@6.43.15,@codemirror/language@6.13.1';

async function loadCodeMirror() {
  const [cm, view, state, commands, language, py] = await Promise.all([
    import(CM + 'codemirror@6.0.2' + DEPS),
    import(CM + '@codemirror/view@6.43.15' + DEPS),
    import(CM + '@codemirror/state@6.7.6'),
    import(CM + '@codemirror/commands@6.11.1' + DEPS),
    import(CM + '@codemirror/language@6.13.1' + DEPS),
    import(CM + '@codemirror/lang-python@6.2.1' + DEPS),
  ]);
  return { cm, view, state, commands, language, py };
}

function textareaEditor(el, doc) {
  const ta = document.createElement('textarea');
  ta.className = 'fallback-editor';
  ta.spellcheck = false;
  ta.value = doc;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart;
      ta.setRangeText('    ', s, ta.selectionEnd, 'end');
    }
  });
  el.append(ta);
  return {
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; },
    markLine: () => {},
    onChange: (fn) => ta.addEventListener('input', () => fn(ta.value)),
  };
}

export async function createEditor(el, doc = '') {
  try {
    return buildCodeMirror(el, doc, await loadCodeMirror());
  } catch (e) {
    console.warn('CodeMirror yüklenemedi, sade editöre geçiliyor:', e);
    el.innerHTML = '';
    return textareaEditor(el, doc);
  }
}

function buildCodeMirror(el, doc, m) {
  const { cm, view, state, commands, language, py } = m;
  const setMark = state.StateEffect.define();
  const markField = state.StateField.define({
    create: () => view.Decoration.none,
    update(deco, tr) {
      deco = deco.map(tr.changes);
      for (const e of tr.effects) {
        if (e.is(setMark)) {
          if (e.value == null) deco = view.Decoration.none;
          else {
            const line = tr.state.doc.line(Math.min(e.value, tr.state.doc.lines));
            deco = view.Decoration.set([view.Decoration.line({ class: 'cm-errorLine' }).range(line.from)]);
          }
        }
      }
      if (tr.docChanged) deco = view.Decoration.none;
      return deco;
    },
    provide: (f) => view.EditorView.decorations.from(f),
  });
  const listeners = [];
  const ed = new view.EditorView({
    parent: el,
    doc,
    extensions: [
      cm.basicSetup,
      py.python(),
      language.indentUnit.of('    '),
      state.EditorState.tabSize.of(4),
      view.keymap.of([commands.indentWithTab]),
      markField,
      // Koyu zemin: CodeMirror'a koyu tema olduğunu söyle, imleç siyah çizilmesin.
      view.EditorView.theme({
        '.cm-cursor, .cm-dropCursor': { borderLeft: '3px solid #ffcf3a' },
        '.cm-content': { caretColor: '#ffcf3a' },
      }, { dark: true }),
      view.EditorView.updateListener.of((u) => { if (u.docChanged) listeners.forEach(fn => fn(u.state.doc.toString())); }),
    ],
  });
  return {
    getValue: () => ed.state.doc.toString(),
    setValue: (v) => ed.dispatch({ changes: { from: 0, to: ed.state.doc.length, insert: v } }),
    markLine: (n) => ed.dispatch({ effects: setMark.of(n ?? null) }),
    onChange: (fn) => listeners.push(fn),
    focus: () => ed.focus(),
  };
}
