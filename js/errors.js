// Python hatalarını ve oyun başarısızlıklarını Oğuzhan Hoca'nın kısa Türkçe ipuçlarına çevirir.

const at = (line) => (line ? `${line}. satır: ` : '');

export function explainError({ type, message = '', line }) {
  const L = at(line);
  switch (type) {
    case 'SyntaxError':
      if (/never closed|was not closed/.test(message)) return `${L}Açtığın bir parantez ya da tırnak kapanmamış. Eşini bul.`;
      if (/unterminated string/.test(message)) return `${L}Tırnak açılmış ama kapanmamış. Yazı "böyle" iki tırnak arasında olur.`;
      if (/expected ':'/.test(message)) return `${L}Satırın sonunda iki nokta (:) eksik. if ve for onu ister.`;
      return `${L}Python bu satırı okuyamadı. Yazım hatası var; parantez, tırnak ve iki noktaya bak.`;
    case 'TabError':
      return `${L}Girintide tab ile boşluğu karıştırmışsın. Hepsini 4 boşluk yap.`;
    case 'IndentationError':
      if (/expected an indented block/.test(message)) return `${L}İki noktadan (:) sonraki satır içeri girintili olmalı. 4 boşluk ver.`;
      if (/unexpected indent/.test(message)) return `${L}Bu satır sebepsiz yere içeride. Girintiyi sil.`;
      return `${L}Girintiler birbirini tutmuyor. Aynı bloktaki satırlar aynı hizada olmalı.`;
    case 'NameError': {
      const m = message.match(/'([^']+)'/);
      const name = m ? m[1] : 'bu isim';
      return `${L}'${name}' diye bir şey tanımıyorum. Önce değer verdin mi? Yazımı doğru mu?`;
    }
    case 'TypeError':
      if (/not callable/.test(message)) return `${L}Fonksiyon olmayan bir şeyi çağırmaya çalıştın. Bir komutun adını değişkene mi verdin?`;
      if (/can only concatenate str|unsupported operand/.test(message)) return `${L}Yazı ile sayıyı + ile toplayamazsın. str() ya da int() ile türü eşitle.`;
      if (/tam sayı/.test(message)) return `${L}yuru() tam sayı ister. Tırnak içindeki "3" bir yazıdır, sayı değil.`;
      if (/argument/.test(message)) return `${L}Fonksiyona yanlış sayıda değer verdin. Parantezin içine bak.`;
      return `${L}Türler uyuşmadı: yazı mı sayı mı, bir kontrol et.`;
    case 'ValueError':
      if (/negatif/.test(message)) return `${L}Geri geri yürüyemezsin. yuru() sıfır ya da pozitif sayı ister.`;
      if (/invalid literal for int/.test(message)) return `${L}int() bu yazıyı sayıya çeviremedi. İçinde rakam dışında bir şey var.`;
      return `${L}Değer uygun değil. Fonksiyona ne verdiğine bak.`;
    case 'EOFError':
      return `${L}input() çok fazla çağrıldı; sana verilecek başka cevap yok.`;
    case 'ZeroDivisionError':
      return `${L}Sıfıra bölme yok. Matematik öğretmenin de onaylamaz.`;
    case 'TooManyActions':
      return 'Kahraman 1000 adımdan fazla hareket etti ve yoruldu. Döngün çok mu uzun?';
    case 'Timeout':
      return 'Kodun 3 saniyede bitmedi. Sonsuz döngüye mi girdin? Durdurdum.';
    default:
      return `${L}Bir hata çıktı (${type}). Konsoldaki İngilizce mesaja birlikte bakalım.`;
  }
}

const FAILS = {
  wall: 'Bam! Duvara çarptın. Adımlarını ve dönüşlerini say.',
  door_closed: 'Kapı kapalıyken içinden geçemezsin. Önce kapi_ac() ile aç.',
  no_coin: 'Burada altın yok. al() demeden önce altının üstünde dur.',
  no_door: 'Önünde kapı yok. Kapıya yüzün dönük ve bitişik olmalı.',
  wrong_password: 'Kapı şifreyi beğenmedi. Harfi harfine aynı mı?',
};

export function explainFail(reason) {
  return FAILS[reason] || 'Bir şeyler ters gitti. Kodunu adım adım takip et.';
}
