## Proje "Online Turing Testi": Nihai Teknoloji Yığını Raporu

### 1\. Temel Mimari Prensibi: Serverless-First (Sunucusuz-Öncelikli)

Mimari, "ağır" bir backend sunucusu (FastAPI, Express vb.) ve veritabanı (PostgreSQL) kurmak yerine, tüm iş mantığını Netlify platformunun sunduğu sunucusuz bileşenler üzerinde çalıştırmaya dayanır. Hem frontend hem de backend, tek bir proje çatısı altında (Next.js) yönetilecektir.

### 2\. Teknoloji Yığını (Technology Stack)

| Katman | Teknoloji | Gerekçe ve Görevi |
| :--- | :--- | :--- |
| **Platform** | **Netlify** | Projenin tamamını barındıran, dağıtan ve çalıştıran ana platform. |
| **Framework (Frontend + Backend)** | **Next.js** | **(Tek Çatı):** Hem kullanıcı arayüzünü (React bileşenleri) hem de backend API'lerini (`/pages/api` klasörü) tek bir projede barındırır. |
| **Veritabanı (Ana Veri & Oturum)** | **Upstash (Sunucusuz Redis)** | **(Hafif Veri Deposu):** PRD 4.2'de üretilen Soru/Cevap çiftlerini ve kullanıcıların anlık oyun durumunu (puan/can) tutar. |
| **Arka Plan İşlemleri** | **Netlify Scheduled Functions** | **(İçerik Üretici):** Yavaş çalışan Soru/Cevap üretim (AI + Google Search) kodunu, kullanıcılardan bağımsız, arka planda periyodik olarak tetikler. |
| **API Mimarisi** | **RESTful API** | `Next.js API Rotaları` (`/api/...`) üzerinden sunulur. |
| **Harici API Entegrasyonları** | **OpenRouter API** & **Google Search API** | PRD'de belirtildiği gibi AI içeriği ve "insan" cevabı üretmek için kullanılır. |

-----

### 3\. Gerekçelendirme ve Detaylandırma

#### Neden Netlify + Next.js? (Platform ve Framework)

Bu ikili, "hafif backend" hedefiniz için mükemmel bir kombinasyondur:

1.  **Tek Proje, Tek Dil:** Hem kullanıcı arayüzünüz (React) hem de API'niz (Node.js) aynı proje deposunda, aynı dilde (TypeScript/JavaScript) geliştirilir. Bu, geliştirme deneyimini inanılmaz basitleştirir.
2.  **Otomatik Dağıtım (CI/CD):** Projenizi GitHub'a `push` ettiğiniz anda Netlify, projenizi otomatik olarak algılar, derler ve canlıya alır.
3.  **Performans ve Ölçeklenebilirlik (Sıfır Yönetim):**
      * **Frontend:** Netlify'ın global CDN'i (İçerik Dağıtım Ağı) sayesinde Next.js siteniz kullanıcılara çok hızlı yüklenir.
      * **Backend:** `/pages/api` klasörünüzdeki her bir API dosyası, Netlify tarafından otomatik olarak **Netlify Functions**'a (sunucusuz fonksiyonlar) dönüştürülür. Bu fonksiyonlar, trafik yokken "uyur" (maliyet yaratmaz), ani bir viral trafik (PRD 1.2) geldiğinde ise saniyeler içinde binlerce isteği karşılamak üzere otomatik ölçeklenir.

#### Neden Upstash (Redis)? (Veritabanı)

Ayrı bir PostgreSQL sunucusu kurmak ve yönetmek "hafif" hedefiyle çelişir. Upstash ise bu sorunu çözer:

1.  **Hafiflik:** Tamamen sunucusuzdur. Kurulum, bakım, yedekleme gerektirmez. Sadece bir hesap açıp bağlantı adresini (`UPSTASH_URL`) Netlify projenize eklersiniz.
2.  **Hız:** Bellek-içi (in-memory) bir veritabanı olduğu için okuma/yazma işlemleri milisaniyeler sürer. Bu, oyun sırasında Soru çekme (MVP-103) ve puan/can güncelleme (MVP-105, 106) için kritik önem taşır.
3.  **Uygunluk:** Hem üretilen Soru/Cevap çiftlerini (örn: bir JSON listesi olarak) depolamak hem de kullanıcı oturumlarını (örn: `session:abc-123` anahtarıyla) tutmak için ideal bir Key-Value (Anahtar-Değer) deposudur.
4.  **Maliyet:** "Eğlence projesi" için fazlasıyla yeterli, kalıcı ücretsiz bir planı (free-tier) mevcuttur.

#### Neden Netlify Scheduled Functions? (Arka Plan Görevi)

PRD'nizdeki en büyük teknik zorluk (PRD 4.2), bir Soru/Cevap çifti üretmenin yavaş (5-10 saniye) olmasıdır. Kullanıcıyı asla bu kadar bekletemeyiz.

  * **Çözüm:** Bu yavaş çalışan kodu (`/api/cron/generate-question` gibi özel bir API rotasına yazarız) ve **Netlify Scheduled Functions** kullanarak bu rotayı arka planda (örn: her 5 dakikada bir) tetikleriz.
  * **Akış:** Bu fonksiyon çalışır, OpenRouter ve Google'dan verileri çeker, işler ve sonucu **Upstash**'a yazar.
  * **Sonuç:** Kullanıcı oyunu oynarken, API'niz Upstash'taki *hazır* veriyi çektiği için oyun akışı "anlık" (PRD 5.0) olur.

-----


## Netify a aktarım

Bu dosyalar projenizin Git deposunun ana dizininde (`root`) bulunmalıdır.

### A. Açık Kaynak Lisansı (LICENSE)

  * **Gereksinim:** Projenizin OSI onaylı bir lisansa sahip olması gerekiyor.
  * **Yapılacak İşlem:** Projenizin ana dizinine `LICENSE` (veya `LICENSE.md`) adında bir dosya eklemelisiniz.
  * **Tavsiyem:** Bu tür web projeleri için en basit, en yaygın ve en izin verici lisans olan **MIT Lisansı**'nı kullanmanızdır.
  * **Nasıl Yapılır:** [https://choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/) adresindeki metni kopyalayın, `[year]` ve `[fullname]` kısımlarını kendi bilgilerinizle değiştirip `LICENSE` dosyası olarak kaydedin.

### B. Davranış Kuralları (Code of Conduct)

  * **Gereksinim:** Projenin ana dizininde bir "Code of Conduct" (CoC) dosyası olması gerekiyor.
  * **Yapılacak İşlem:** Projenizin ana dizinine `CODE_OF_CONDUCT.md` adında bir dosya eklemelisiniz.
  * **Tavsiyem:** Bunu sıfırdan yazmayın. Endüstri standardı olan **Contributor Covenant**'ı kullanın.
  * **Nasıl Yapılır:** [https://www.contributor-covenant.org/version/2/1/code\_of\_conduct.md](https://www.google.com/search?q=https://www.contributor-covenant.org/version/2/1/code_of_conduct.md) adresindeki şablonu kopyalayın, `[INSERT EMAIL ADDRESS]` kısmına projenizle ilgili bir e-posta adresi (veya GitHub kullanıcı adınızı) ekleyin ve dosyayı kaydedin.

-----

## 2\. Arayüz (UI) Eklemeleri (Next.js)

### C. Netlify Rozeti veya Bağlantısı

  * **Gereksinim:** Sitenizin ana sayfasında (veya tüm sayfalarda) Netlify'a geri bağlantı veren bir link olmalı.
  * **Yapılacak İşlem:** Next.js projenizdeki "footer" (alt bilgi) bileşenine bu bağlantıyı eklemelisiniz.
  * **Tavsiyem:** Genellikle bu, `Layout.js`, `_app.js` veya `Footer.js` gibi tüm sayfalarda ortak olan bir bileşenin içine yerleştirilir.

**Seçenek 1 (Metin Bağlantı):** Footer bileşeninizin `.jsx` / `.tsx` dosyasına şu HTML'i ekleyin:

```html
<a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
  This site is powered by Netlify
</a>
```

**Seçenek 2 (Resmi Rozet):** Netlify'ın hazır rozetlerinden birini kullanabilirsiniz (daha şık durur):

```html
<a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
  <img 
    src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg" 
    alt="Deploys by Netlify" 
  />
</a>
```

-----

## 3\. Proje Stratejisi (Ticari Olmama)

### D. Ticari Faaliyet Yasağı

  * **Gereksinim:** Proje ticari olmamalıdır.
  * **Yapılacak İşlem:** Projeniz bir "eğlence projesi" olarak kalmalıdır. Netlify, sitenizde ücretli özellikler (örn: "daha fazla can satın al"), ücretli destek, reklam veya bir şirket adına yürütülen ticari bir faaliyet görürse planınızı iptal eder. PRD'nizdeki hedefler (farkındalık, etkileşim) bu kurala zaten uyuyor, sadece bu çizgiyi korumanız gerekiyor.

-----

## Özet: Yapılacaklar Listesi

Pro planı almak için Git reponuzu ve kodunuzu aşağıdaki gibi güncellemelisiniz:

1.  ✅ **`LICENSE`** dosyasını (MIT Lisansı ile) projenin ana dizinine ekleyin.
2.  ✅ **`CODE_OF_CONDUCT.md`** dosyasını (Contributor Covenant şablonu ile) projenin ana dizinine ekleyin.
3.  ✅ Next.js projenizdeki **Footer** bileşenine **"Powered by Netlify"** bağlantısını veya rozetini ekleyin.
4.  ✅ Projenin ticari bir gelir modeli olmadığını teyit edin.
5.  ✅ Bu 4 adımı tamamladıktan sonra, kodunuzu GitHub'a `push` edin, sitenizin Netlify'da yayınlandığından emin olun ve ardından Netlify'ın **[resmi başvuru formunu](https://www.google.com/search?q=https://www.netlify.com/legal/open-source-policy-form/)** doldurun.

Bu adımlardan sonra Netlify ekibi sitenizi inceleyecek ve projenizi Pro plana ücretsiz olarak yükseltecektir.

### 4\. Nihai Veri Akışı (Özet)

1.  **ARKA PLAN:** `Netlify Scheduled Function`, `netlify.toml` dosyanızdaki kurala göre (örn: `*/5 * * * *`) `/api/cron/generate-question` rotasını tetikler. Bu fonksiyon, PRD 4.2'deki mantığı (OpenRouter + Google Search) çalıştırır ve üretilen Q\&A çiftini **Upstash**'a kaydeder.
2.  **KULLANICI (OYUN BAŞLANGICI):** Kullanıcı "Oyuna Başla" butonuna tıklar. Tarayıcı, `/api/game/start` API rotasına istek atar.
3.  **OTURUM (SESSION):** Bu API rotası (bir Netlify Function olarak çalışır), yeni bir oyun oturumu (puan=0, can=3) oluşturur ve bunu benzersiz bir ID ile **Upstash**'a kaydeder. Oturum ID'si kullanıcıya (tarayıcıya) `cookie` olarak gönderilir.
4.  **OYUN AKIŞI (HIZLI):** Kullanıcı yeni soru istediğinde (`/api/game/next-question`), backend **Upstash**'taki *hazır* sorulardan rastgele birini anında çeker, hangi cevabın AI olduğunu kullanıcının Upstash'taki oturumuna yazar ve veriyi kullanıcıya gönderir.
5.  **TAHMİN:** Kullanıcı seçim yaptığında (`POST /api/game/submit`), backend **Upstash**'taki oturum verisinden doğru cevabı okur, puanı/canı günceller ve sonucu (doğru/yanlış) kullanıcıya döndürür.

### 5\. Resmi Kaynaklar ve Dokümantasyon

  * **Netlify:** [https://docs.netlify.com/](https://docs.netlify.com/)
  * **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
      * *Next.js'i Netlify'a Dağıtma:* [https://docs.netlify.com/integrations/frameworks/next-js/](https://www.google.com/search?q=https://docs.netlify.com/integrations/frameworks/next-js/)
  * **Netlify Scheduled Functions:** [https://docs.netlify.com/functions/scheduled-functions/](https://docs.netlify.com/functions/scheduled-functions/)
  * **Upstash (Sunucusuz Redis):** [https://upstash.com/docs/redis](https://upstash.com/docs/redis)
  * **OpenRouter API:** [https://openrouter.ai/docs](https://openrouter.ai/docs)

