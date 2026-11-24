// Bölüm verileri. Harita: # duvar, . zemin, H kahraman (sağa bakar), F bayrak, C altın, D kapı, N bekçi.


const FIELD = (flagRow) => {
  const rows = ['########', '#......#', '#H.....#', '#......#', '########'];
  return rows.map((r, y) => (y === flagRow ? r.slice(0, 6) + 'F' + r.slice(7) : r));
};

const SPLIT = (flagUp) => [
  '########',
  flagUp ? '#.....F#' : '#......#',
  '#H######',
  flagUp ? '#......#' : '#.....F#',
  '########',
];

const CORRIDOR = (empty) => ['##########', '#H' + '.'.repeat(empty) + 'C'.repeat(8 - empty) + '#', '##########'];

export const LEVELS = [
  // 1 — print
  {
    id: '1-1', topic: 'print', title: 'İlk Söz', code: 'PIKSEL',
    intro: [
      'Selam! Ben Oğuzhan Hoca. Bu kalede her şey Python ile yürür.',
      'print() parantezin içine yazdığını ekrana yazar. Kahramanımız da onu söyler.',
      'Yazılar tırnak içinde olur: print("selam") gibi. Hadi, ilk sözü sen söylet.',
    ],
    goal: 'Kahramana tam olarak "Merhaba" dedir.',
    starter: '# Kodunu buraya yaz, sonra Çalıştır\'a bas\n',
    goals: ['output'],
    cases: [{ map: ['#######', '#..H..#', '#######'], output: ['Merhaba'] }],
  },
  {
    id: '1-2', topic: 'print', title: 'Kapıdaki Bekçi', code: 'TIRNAK',
    intro: [
      'Bu bekçi kelimesi kelimesine titizdir. Büyük harf, virgül, ünlem... hepsi önemli.',
      'Tırnağı unutursan Python cümleni kod sanar ve kafası karışır. Dene, gör.',
    ],
    goal: 'Bekçiye "Kapıyı aç, ben geldim!" de.',
    starter: '',
    goals: ['output'],
    cases: [{ map: ['#######', '#.H.N.#', '#######'], output: ['Kapıyı aç, ben geldim!'] }],
  },
  {
    id: '1-3', topic: 'print', title: 'Sayım', code: 'SIRA',
    intro: [
      'Python kodu yukarıdan aşağı, satır satır okur. Sıra her şeydir.',
      'Her print yeni bir satıra yazar.',
    ],
    goal: 'Sırayla Bir, İki, Üç yazdır. Her biri ayrı satırda.',
    starter: '',
    goals: ['output'],
    cases: [{ map: ['#######', '#..H..#', '#######'], output: ['Bir', 'İki', 'Üç'] }],
  },

  // 2 — komutlar
  {
    id: '2-1', topic: 'komutlar', title: 'Bayrağa Koş', code: 'ADIM',
    intro: [
      'Konuşmak güzel ama biraz da hareket edelim.',
      'yuru() bir adım attırır. yuru(3) ise üç adım. Parantezin içindeki sayıya argüman denir.',
    ],
    goal: 'Bayrağa ulaş.',
    starter: '',
    goals: ['flag'],
    cases: [{ map: ['#########', '#H.....F#', '#########'] }],
  },
  {
    id: '2-2', topic: 'komutlar', title: 'Labirent', code: 'LABIRENT',
    intro: [
      'sola_don() ve saga_don() kahramanı yerinde döndürür, yürütmez.',
      'Sağ ve sol, kahramanın baktığı yöne göredir. Kafanı yamultarak düşünmek serbest.',
    ],
    goal: 'Labirentten geçip bayrağa ulaş.',
    starter: 'yuru(2)\n',
    goals: ['flag'],
    cases: [{ map: ['########', '#H..####', '###.####', '###...F#', '########'] }],
  },

  // 3 — değişkenler
  {
    id: '3-1', topic: 'değişkenler', title: 'Şifreli Kapılar', code: 'ANAHTAR',
    intro: [
      'Yeni komut: kapi_ac("şifre") hemen önündeki kapıyı açar. Şifre doğruysa kapı kaybolur, yürüyebilirsin.',
      'İki kapı da aynı şifreyi istiyor: ejderha. Her seferinde yazmak yerine bir kutuya koyalım.',
      'sifre = "ejderha" dersen, sifre adlı kutuya o yazı girer. Sonra kapi_ac(sifre) yeter.',
      'Kapıyı açmak için ona bakıyor ve bitişik duruyor olmalısın.',
    ],
    goal: 'Şifreyi bir değişkene koy, iki kapıyı da açıp bayrağa ulaş.',
    starter: 'sifre = "ejderha"\n',
    goals: ['flag'],
    cases: [{ map: ['########', '#HD.D.F#', '########'], password: 'ejderha' }],
  },
  {
    id: '3-2', topic: 'değişkenler', title: 'Şifre Değişti', code: 'DEGISKEN',
    intro: [
      'Kötü haber: ikinci kapının şifresi "ay". Birinci kapı hala "gunes" istiyor.',
      'Bir değişkene yeni değer verebilirsin. Eski değer silinir, yenisi yerine geçer.',
    ],
    goal: 'Kodu düzelt: ikinci kapıdan önce sifre değişkenini değiştir.',
    starter: 'sifre = "gunes"\nkapi_ac(sifre)\nyuru(2)\nkapi_ac(sifre)\nyuru(3)\n',
    goals: ['flag'],
    cases: [{ map: ['########', '#HD.D.F#', '########'], password: { '2,1': 'gunes', '4,1': 'ay' } }],
  },

  // 4 — sayılar
  {
    id: '4-1', topic: 'sayılar', title: 'Hesaplı Adım', code: 'HESAP',
    intro: [
      'Python iyi bir hesap makinesidir: + toplar, - çıkarır, * çarpar, / böler.',
      'Bayrak 3 kere 4 adım uzakta. Kafadan hesaplama, Python hesaplasın.',
    ],
    goal: 'yuru() içinde çarpma kullanarak bayrağa ulaş.',
    starter: '',
    goals: ['flag'],
    cases: [{ map: ['################', '#H...........F##', '################'] }],
  },
  {
    id: '4-2', topic: 'sayılar', title: 'Altın Sayımı', code: 'ALTIN',
    intro: [
      'Yeni komut: al(). Altının olduğu kareye yürü, sonra al() de. Üstünde altın yoksa olmaz.',
      'Üç altını topla ve kaç tane topladığını say. Sayacı bir değişkende tut: altin = altin + 1',
      'Dikkat: "Toplam: " bir yazı, 3 bir sayı. İkisini + ile birleştirmek için str(3) gerekir.',
    ],
    goal: 'Tüm altınları topla, sonra "Toplam: 3" yazdır.',
    starter: 'altin = 0\n',
    goals: ['coins', 'output'],
    cases: [{ map: ['########', '#HC.C.C#', '########'], output: ['Toplam: 3'] }],
  },

  // 5 — input ve if
  {
    id: '5-1', topic: 'input', title: 'Bekçinin Fısıltısı', code: 'SORU',
    intro: [
      'Bekçi şifreyi her gün değiştiriyor ve sana fısıldıyor. input() onun söylediğini alır.',
      'sifre = input() dersen fısıltı sifre değişkenine girer. Ezberlemek işe yaramaz, deneyeceğim.',
    ],
    goal: 'Bekçinin söylediği şifreyle kapıyı aç ve bayrağa ulaş.',
    starter: '',
    goals: ['flag'],
    cases: [
      { map: ['######', '#HD.F#', '######'], inputs: ['kartal'], password: 'kartal' },
      { map: ['######', '#HD.F#', '######'], inputs: ['yunus'], password: 'yunus' },
    ],
  },
  {
    id: '5-2', topic: 'if', title: 'İki Yol', code: 'YOL',
    intro: [
      'Bekçi bir renk söyleyecek. "kirmizi" ise bayrak yukarıda, değilse aşağıda.',
      'if renk == "kirmizi": ile karar verilir. == karşılaştırır, = ise değer atar. Karıştırma!',
      'if ve else\'in altındaki satırlar 4 boşluk içeride olmalı. Python girintiye çok önem verir.',
    ],
    goal: 'Renge göre doğru yolu seç ve bayrağa ulaş.',
    starter: 'renk = input()\nif renk == "kirmizi":\n    sola_don()\nelse:\n    saga_don()\n',
    goals: ['flag'],
    cases: [
      { map: SPLIT(true), inputs: ['kirmizi'] },
      { map: SPLIT(false), inputs: ['mavi'] },
    ],
  },
  {
    id: '5-3', topic: 'if', title: 'Üç Yol', code: 'KAVSAK',
    intro: [
      'Şimdi üç renk var: kirmizi yukarı, yesil düz, mavi aşağı.',
      'İkiden fazla seçenek için elif kullan. "else if"in kısası, Python tembeldir.',
    ],
    goal: 'Üç rengin üçünde de bayrağa ulaş.',
    starter: 'renk = input()\n',
    goals: ['flag'],
    cases: [
      { map: FIELD(1), inputs: ['kirmizi'] },
      { map: FIELD(2), inputs: ['yesil'] },
      { map: FIELD(3), inputs: ['mavi'] },
    ],
  },

  // 6 — for
  {
    id: '6-1', topic: 'for', title: 'Beş Altın', code: 'TEKRAR',
    intro: [
      'Aynı iki satırı beş kez yazmak sıkıcı. Bilgisayarlar sıkılmaz, onlara yaptıralım.',
      'for i in range(5): altındaki girintili satırları 5 kez tekrarlar.',
      'Bu bölümde en fazla 3 satır yazabilirsin. Kopyala-yapıştır yasak!',
    ],
    goal: 'for döngüsüyle beş altını da topla.',
    starter: 'for i in range(5):\n',
    goals: ['coins'],
    maxLines: 3,
    cases: [{ map: ['########', '#HCCCCC#', '########'] }],
  },
  {
    id: '6-2', topic: 'for', title: 'Merdiven', code: 'MERDIVEN',
    intro: [
      'Bir basamak: ileri, sola dön, ileri, sağa dön. Bayrak dört basamak yukarıda.',
      'Döngünün içine istediğin kadar satır koyabilirsin, yeter ki hepsi aynı hizada olsun.',
    ],
    goal: 'Merdiveni çık, bayrağa ulaş. En fazla 5 satır.',
    starter: '',
    goals: ['flag'],
    maxLines: 5,
    cases: [{ map: ['#######', '#####F#', '####..#', '###..##', '##..###', '#H.####', '#######'] }],
  },
  {
    id: '6-3', topic: 'for', title: 'Döngüde Karar', code: 'KARAR',
    intro: [
      'Koridorun başı boş, altınlar sonda. Kaç kare boş olduğunu bekçi söyleyecek.',
      'Döngü değişkeni i her turda bir artar: 0, 1, 2... Döngünün içinde if ile ona bakabilirsin.',
      'input() hep yazı verir. Sayı lazımsa int(input()) yaz.',
    ],
    goal: 'Koridoru yürü, yalnızca altınlı karelerde al(). En fazla 6 satır.',
    starter: 'bos = int(input())\n',
    goals: ['coins'],
    maxLines: 6,
    cases: [
      { map: CORRIDOR(3), inputs: ['3'] },
      { map: CORRIDOR(5), inputs: ['5'] },
    ],
  },
  {
    id: '6-B', topic: 'for', title: 'BOSS: Yirmi Kapı', code: 'EJDERHA',
    intro: [
      'Son sınav! Önünde yirmi kapı var, hepsinin şifresi "python".',
      'Elle yazmaya kalkarsan 41 satır eder. Ama burada yalnızca 6 satır hakkın var.',
      'Bunu geçersen bu kalenin ustası sensin. Hadi bakalım!',
    ],
    goal: 'Yirmi kapıyı aç, bayrağa ulaş. En fazla 6 satır.',
    starter: '',
    goals: ['flag'],
    maxLines: 6,
    cases: [{ map: ['########################', '#H' + 'D'.repeat(20) + 'F#', '########################'], password: 'python' }],
  },
];


// Ekrandaki KOMUTLAR şeridi: her komut "from" bölümünde tanıtılır, sonrasında hep görünür.
export const COMMANDS = [
  { name: 'print', sig: 'print("yazı")', desc: 'Kahramana yazıyı söyletir', from: '1-1' },
  { name: 'yuru', sig: 'yuru(n)', desc: 'n adım ileri yürür. Sayı yazmazsan 1 adım', from: '2-1' },
  { name: 'sola_don', sig: 'sola_don()', desc: 'Yerinde sola döner, yürümez', from: '2-2' },
  { name: 'saga_don', sig: 'saga_don()', desc: 'Yerinde sağa döner, yürümez', from: '2-2' },
  { name: 'kapi_ac', sig: 'kapi_ac("şifre")', desc: 'Hemen önündeki kapıyı şifreyle açar', from: '3-1' },
  { name: 'al', sig: 'al()', desc: 'Üstünde durduğun karedeki altını alır', from: '4-2' },
  { name: 'str', sig: 'str(sayı)', desc: 'Sayıyı yazıya çevirir', from: '4-2' },
  { name: 'input', sig: 'input()', desc: 'Bekçinin söylediğini alır (hep yazı)', from: '5-1' },
  { name: 'if', sig: 'if / else', desc: 'Koşul doğruysa if altını, değilse else altını çalıştırır', from: '5-2' },
  { name: 'elif', sig: 'elif', desc: 'Bir koşul daha dener', from: '5-3' },
  { name: 'for', sig: 'for i in range(n):', desc: 'Altındaki girintili satırları n kez tekrarlar', from: '6-1' },
  { name: 'int', sig: 'int(yazı)', desc: 'Yazıyı sayıya çevirir', from: '6-3' },
];

export function commandsFor(levelId) {
  const at = LEVELS.findIndex(l => l.id === levelId);
  return COMMANDS.filter(c => LEVELS.findIndex(l => l.id === c.from) <= at);
}
