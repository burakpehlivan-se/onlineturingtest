# 🚀 Netlify Deployment Guide

## Ön Hazırlık

### 1. Gerekli Hesaplar
- **GitHub hesabı** (kodunuzu push etmek için)
- **Netlify hesabı** (ücretsiz: https://netlify.com)
- **OpenRouter hesabı** (API key için: https://openrouter.ai)

### 2. Kodunuzu GitHub'a Push Edin
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

## Netlify'da Deployment

### 1. Site Oluşturma
1. **Netlify'a giriş yapın**: https://app.netlify.com
2. **"New site from Git"** butonuna tıklayın
3. **GitHub'ı seçin** ve repository'nizi bulun
4. **Branch**: `main` seçin
5. **Build command**: `npm run build`
6. **Publish directory**: `.next`

### 2. Environment Variables Ayarlama
Site oluşturduktan sonra:

1. **Site Settings > Environment Variables** bölümüne gidin
2. Aşağıdaki değişkenleri ekleyin:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
ADMIN_KEY=your_secure_admin_key_here
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
CRON_SECRET=your_secure_cron_secret_here
NODE_ENV=production
```

### 3. Domain Ayarlama
1. **Site Settings > Domain Management** bölümüne gidin
2. **Custom domain** ekleyin (opsiyonel)
3. **HTTPS** otomatik aktif olacak

### 4. Scheduled Functions Kontrolü
1. **Functions** sekmesine gidin
2. `api-cron-process-questions` fonksiyonunun görünür olduğunu kontrol edin
3. Bu fonksiyon her 6 saatte bir otomatik soru üretecek

## Deployment Sonrası

### 1. Admin Panel Erişimi
- **URL**: `https://your-site-name.netlify.app/admin-login`
- **Admin Key**: Environment variables'da ayladığınız `ADMIN_KEY`

### 2. İlk Soru Ekleme
1. Admin paneline giriş yapın
2. **"Soru İşleme"** sekmesine gidin
3. 5-10 soru ekleyin
4. **"Demo Oyun"** sekmesinde test edin

### 3. Site Testi
1. Ana sayfayı test edin: `https://your-site-name.netlify.app`
2. Oyun oynayın ve soruların geldiğini kontrol edin
3. F12 konsolunda cevapların görünmediğini doğrulayın

## Güvenlik Kontrolleri

### ✅ Kontrol Listesi
- [ ] Admin panel sadece `/admin-login` ile erişilebilir
- [ ] F12 konsolunda cevaplar görünmüyor
- [ ] Environment variables doğru ayarlanmış
- [ ] HTTPS aktif
- [ ] robots.txt admin rotalarını engelliyor
- [ ] Scheduled functions çalışıyor

## Sorun Giderme

### Build Hatası
```bash
# Yerel olarak test edin
npm install
npm run build
```

### Function Hatası
- Netlify Functions loglarını kontrol edin
- Environment variables'ı doğrulayın

### Admin Panel Erişim Sorunu
- `ADMIN_KEY` environment variable'ını kontrol edin
- Browser cache'ini temizleyin

## Güncelleme

Kod değişikliklerinden sonra:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Netlify otomatik olarak yeniden deploy edecek.

## İletişim

Sorun yaşarsanız Netlify support veya GitHub issues kullanabilirsiniz.
