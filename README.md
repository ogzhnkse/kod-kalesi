# Kod Kalesi

Lise öğrencileri için tarayıcıda oynanan, piksel arcade tarzı bir Python öğrenme oyunu. Rehberleri **Oğuzhan Hoca**. Öğrenciler gerçek Python 3 yazarak kahramanı kalenin içinde yönetir. Konular `print`'ten başlar, `for` döngüsünde biter (6 konu, 16 bölüm).

- Kurulum yok: tarayıcıda açılır. Python, [Pyodide](https://pyodide.org) ile tarayıcının içinde çalışır.
- Hesap, sunucu ya da öğrenci verisi yok. İlerleme öğrencinin tarayıcısında saklanır.
- Öğretmen rehberi: [docs/ogretmen.md](docs/ogretmen.md)

## Yerelde çalıştırma

```bash
python3 -m http.server 8765
# tarayıcıda: http://localhost:8765
```

## Testler

```bash
npm install
npm test          # simülatör, Python çekirdeği, bölümler (her bölümün doğru/yanlış çözümü)
npm run e2e       # tarayıcıda uçtan uca kontrol (önce yerel sunucuyu başlatın; internet gerekir)
```

## Yapı

| Dosya | Görev |
|---|---|
| `js/levels.js` | Bölümler: haritalar, Oğuzhan Hoca'nın konuşmaları, hedefler |
| `js/world.js` | Izgara dünya ve eylem simülatörü |
| `js/py-core.js`, `js/py-worker.js`, `js/runner.js` | Öğrenci kodunu Pyodide'de çalıştırma, 3 sn zaman aşımı |
| `js/check.js`, `js/errors.js` | Bölüm denetimi ve Türkçe hata ipuçları |
| `js/sprites.js`, `js/render.js`, `js/dialog.js`, `js/audio.js` | Piksel çizimler, ekran, anlatıcı, ses |
| `js/main.js`, `js/editor.js`, `js/progress.js` | Arayüz akışı, kod editörü (CodeMirror), ilerleme |
