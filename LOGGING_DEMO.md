# 📊 Logging Sistemi Demo

## Logging Nedir?

Oyunun çalışması sırasında tüm önemli olaylar terminal'de renkli ve düzenli bir şekilde gösterilir.

## Gösterilecek Bilgiler

### 1. 🎮 Oyun Başlatılması
```
🎮 OYUN BAŞLATILDI
  Kullanıcı: TestKullanıcı
  Zorluk: MEDIUM
  Session ID: session_1760779743182_gbq5zt1z8
```

### 2. 📝 Soru İstenmesi
```
📝 SORU İSTENDİ
  Session: session_1760779743182_gbq5zt1z8
```

### 3. ✓ Soru Getirilmesi
```
✓ SORU GETİRİLDİ
  ID: q_1760779743182_0
  Zorluk: medium
  Soru: "Yapay zeka nedir ve hangi alanlarda kullanılır?..."
```

### 4. 🤖 AI Komutu
```
🤖 AI KOMUTU
  Zorluk: MEDIUM
  Soru: "Yapay zeka nedir ve hangi alanlarda kullanılır?"
  Talimat: "Bir uzmanın blog yazısı gibi cevapla. Anlaşılır, akıcı ve bilgilendirici ol"
```

### 5. 🎯 Cevap Gönderilmesi
```
🎯 CEVAP GÖNDERİLDİ
  Session: session_1760779743182_gbq5zt1z8
  Seçim: A
  Question ID: q_1760779743182_0
```

### 6. ✓ DOĞRU / ✗ YANLIŞ Sonuç
```
✓ DOĞRU
  Seçim: A
  Doğru Cevap: A
  Kazanılan Puan: +20
  Toplam Puan: 20
  Kalan Can: 3❤️
```

### 7. 🏁 Oyun Bitişi
```
🏁 OYUN BİTTİ
  Oyuncu: TestKullanıcı
  Final Skor: 60
```

## Terminal'de Görmek İçin

1. Tarayıcıda http://localhost:3000 aç
2. Kullanıcı adı gir (örn: "Benim Adım")
3. Zorluk seviyesi seç (Kolay, Orta, Zor)
4. "Oyuna Başla" butonuna tıkla
5. Terminal'de tüm işlemleri renkli olarak göreceksin

## Renkler

- 🟢 Yeşil: Başarılı işlemler
- 🔴 Kırmızı: Hatalar veya yanlış cevaplar
- 🔵 Mavi: Bilgi mesajları
- 🟡 Sarı: Uyarılar veya önemli veriler
- 🟣 Magenta: Session ID'ler ve tanımlayıcılar
- 🔷 Cyan: Kullanıcı adları ve sorular
