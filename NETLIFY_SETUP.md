# Netlify Deployment Sorunu ve Çözümü

## ❌ Problem
Netlify'da sorular her seferinde siliniyor çünkü:
- Netlify Functions **stateless** (durumsuz)
- Dosya sistemi **geçici** (ephemeral)
- Her function çalıştırıldığında yeni container
- Deploy sonrası tüm dosyalar sıfırlanır

## ✅ Çözüm: Redis Kullanımı

### 1. Upstash Redis Hesabı Oluştur
1. https://upstash.com/ adresine git
2. Ücretsiz hesap oluştur
3. Yeni Redis database oluştur
4. **REST API** credentials'ları kopyala

### 2. Netlify Environment Variables Ayarla
Netlify Dashboard → Site Settings → Environment Variables:

```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. Mevcut Sistem Zaten Hazır
- `lib/questions-store.ts` Redis'i destekliyor
- Otomatik fallback: Redis → Dosya sistemi
- Netlify'da Redis yoksa uyarı veriyor

## 🔧 Alternatif Çözümler

### Çözüm 1: Netlify Blob Storage (Ek paket gerekli)
```bash
npm install @netlify/blobs
```

### Çözüm 2: External Database
- Supabase
- PlanetScale
- MongoDB Atlas

## 🚀 Deployment Sonrası Test
1. Admin panelinden soru ekle
2. Deploy yap
3. Soruların hala orada olduğunu kontrol et

## 📊 Mevcut Sistem Özellikleri
- ✅ Hybrid storage (Redis + File)
- ✅ Automatic sync
- ✅ Fallback mechanism
- ✅ Rate limiting
- ✅ Admin authentication
- ❌ Netlify'da persistence yok (Redis gerekli)

## 🔍 Debug
Logs'ta şu mesajları ara:
- `✅ Redis connection initialized`
- `✓ Redis'ten soru havuzu yüklendi`
- `⚠️ Netlify ortamında Redis yapılandırması gerekli!`
