# İnsan Avcısı - Online Turing Test Platformu

Yapay zekanın ürettiği cevapları insanın yazıp yazmadığını tahmin ettiğin eğlenceli bir oyun platformu!

## 🎮 Oyun Hakkında

**İnsan Avcısı**, kullanıcıların bir soruya verilen iki cevabı (biri yapay zeka tarafından üretilmiş, diğeri internetten bulunan gerçek bir insan tarafından yazılmış) analiz ederek hangisinin yapay zekaya ait olduğunu tahmin etmeye çalıştığı, oyunlaştırılmış bir web platformudur.

### Özellikler

- 🧠 Yapay zeka ve insan yazısını ayırt etme oyunu
- 🎯 3 zorluk seviyesi: Kolay, Orta, Zor
- ❤️ Can sistemi (3 can ile başla)
- 🏆 Puan sistemi (zorluk seviyesine göre değişen puanlar)
- 📱 Mobil uyumlu tasarım
- 🎨 Modern, koyu tema arayüz
- 📤 Sosyal medyada skor paylaşma

## 🚀 Başlangıç

### Gereksinimler

- Node.js 16+
- npm veya yarn

### Kurulum

```bash
npm install
```

### Ortam Değişkenleri

`.env.local` dosyası oluştur ve aşağıdaki değişkenleri ekle:

```env
# OpenRouter API (Gerekli: AI çeviri ve cevap üretimi için)
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin ve Cron Job güvenliği
ADMIN_KEY=your_admin_key_here
CRON_SECRET=your_cron_secret_here

# Upstash Redis (Opsiyonel - MVP için gerekli değil)
NEXT_PUBLIC_UPSTASH_URL=your_upstash_url
UPSTASH_TOKEN=your_upstash_token

# Google Custom Search API (Gelecek: İnsan yazımı cevap arama için)
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
```

### Geliştirme Sunucusu

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine git.

### Üretim İçin Derleme

```bash
npm run build
npm start
```

## 🏗️ Teknoloji Yığını

- **Frontend**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Next.js API Routes (Netlify Functions)
- **Veritabanı**: Upstash (Sunucusuz Redis)
- **Hosting**: Netlify
- **AI API**: OpenRouter
- **Arama API**: Google Custom Search

## 📁 Proje Yapısı

```
├── pages/
│   ├── api/
│   │   ├── game/
│   │   │   ├── start.ts       # Oyun başlatma
│   │   │   ├── next-question.ts # Sonraki soru
│   │   │   └── submit.ts      # Cevap gönderme
│   │   ├── admin/
│   │   │   └── process-questions.ts # Manuel soru işleme
│   │   └── cron/
│   │       └── process-questions.ts # Otomatik soru işleme
│   ├── index.tsx              # Ana sayfa
│   ├── game.tsx               # Oyun ekranı
│   ├── admin.tsx              # Admin panel
│   ├── _app.tsx               # App wrapper
│   └── _document.tsx          # Document wrapper
├── lib/
│   ├── openrouter-service.ts  # OpenRouter API servisi
│   ├── question-processor.ts  # Soru işleme pipeline'ı
│   ├── questions-store.ts     # Soru havuzu yönetimi
│   └── sessions-store.ts      # Oyun oturumları
├── styles/
│   └── globals.css            # Global stiller
├── filtrelenmis_soru_cevaplar.json # Kaynak soru veritabanı
├── .questions-pool.json       # İşlenmiş soru havuzu
├── public/                    # Statik dosyalar
└── netlify.toml              # Netlify konfigürasyonu
```

## 🔄 Soru İşleme Pipeline'ı

Sistem otomatik olarak yeni sorular üretir:

1. **Kaynak Seçimi**: `filtrelenmis_soru_cevaplar.json` dosyasından rastgele İngilizce soru-cevap seçilir
2. **Çeviri**: OpenRouter API ile soru ve insan cevabı Türkçeye çevrilir
3. **AI Cevabı**: Aynı soruya forum kullanıcısı gibi davranan AI cevap üretir
4. **Kayıt**: Çevrilmiş soru, insan cevabı ve AI cevabı soru havuzuna eklenir
5. **Otomatik**: Netlify cron job ile her 6 saatte bir çalışır (havuz 50'den az ise)

### Manuel Soru İşleme

Admin paneli (`/admin`) üzerinden manuel olarak soru işleyebilirsin:
- Admin key ile giriş yap
- 1-5 arası soru sayısı seç
- "Soruları İşle" butonuna tıkla

## 🎮 Oyun Akışı

1. **Başlangıç**: Kullanıcı adı gir ve zorluk seviyesi seç
2. **Oyun**: Her soru için iki cevap gösterilir (biri AI, biri insan)
3. **Tahmin**: "Bu AI" veya "Bu İnsan" seçeneğinden birini seç
4. **Geri Bildirim**: Doğru/yanlış cevap anında gösterilir
5. **Skor**: Doğru tahminlerde puan kazanırsın
6. **Oyun Sonu**: 3 can bittiğinde oyun sona erer
7. **Paylaş**: Final skorunu sosyal medyada paylaş

## 📊 Puanlama Sistemi

- **Kolay**: 10 puan/doğru tahmin
- **Orta**: 20 puan/doğru tahmin
- **Zor**: 30 puan/doğru tahmin

## 🔗 Netlify Deployment

Bu proje Netlify'a dağıtılmak üzere tasarlanmıştır. Aşağıdaki dosyalar gereklidir:

- ✅ `LICENSE` (MIT Lisansı)
- ✅ `CODE_OF_CONDUCT.md` (Contributor Covenant)
- ✅ `netlify.toml` (Konfigürasyon)
- ✅ Footer'da "Powered by Netlify" bağlantısı

## 📝 Lisans

MIT License - Detaylar için `LICENSE` dosyasına bak.

## 🤝 Katkıda Bulunma

Katkılar hoş karşılanır! Lütfen `CODE_OF_CONDUCT.md` dosyasını oku.

## 📧 İletişim

Sorularınız veya önerileriniz için bir issue açabilirsiniz.

---

**Yapay zeka ve insan yazısını ayırt edebilir misin?** 🧠
