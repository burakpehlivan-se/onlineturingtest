# PRD: Proje "Online Turing Test" (Turing Test Platformu)

**Belge Sürümü:** 1.0
**Tarih:** 18 Ekim 2025
**Hazırlayan:** Kıdemli Yazılım Uzmanı

## 1. Giriş

### 1.1. Proje Özeti

"Oline Turing Testi", kullanıcıların bir soruya verilmiş iki cevabı (biri yapay zeka tarafından üretilmiş, diğeri internetten bulunan gerçek bir insan tarafından yazılmış metin) analiz ederek hangisinin yapay zekaya ait olduğunu tahmin etmeye çalıştığı, oyunlaştırılmış bir web platformudur.

### 1.2. Proje Amacı ve Hedefleri

* **Ana Amaç:** Kullanıcılara eğlenceli ve düşündürücü bir "Turing Testi" deneyimi sunmak.
* **İkincil Amaç:** İnsanların güncel yapay zeka modellerinin ürettiği metinleri, insan tarafından yazılmış metinlerden ayırt etme becerilerini ölçümlemek ve bu konuda bir farkındalık yaratmak.
* **İş Hedefi:** Yüksek kullanıcı etkileşimi (engagement) ve sitede kalma süresi elde etmek, sosyal medya paylaşımları yoluyla organik büyümeyi sağlamak.

## 2. Hedef Kitle

* **Genel Kullanıcılar:** Web tabanlı testleri ve zeka oyunlarını seven bireyler.
* **Teknoloji Meraklıları:** Yapay zekanın yeteneklerini ve sınırlarını test etmek isteyen, teknoloji okuryazarlığı yüksek kullanıcılar.
* **Öğrenciler ve Eğitimciler:** Yapay zeka, dilbilim ve bilişsel bilimler konularına ilgi duyan akademik çevreler.

## 3. Kullanıcı Hikayeleri (User Stories)

* **MVP-101 (Oyun Başlangıcı):** *Bir kullanıcı olarak,* ana sayfaya girdiğimde basit bir "Oyuna Başla" butonu ve oyunun ne hakkında olduğuna dair kısa bir açıklama görmek istiyorum. Kendi kullanıcı adımı da girebilmeliyim (uniqe olmasına gerek yok sadece bir nickname girme yeri olsun)
* **MVP-102 (Zorluk Seçimi):** *Bir kullanıcı olarak,* oyuna başlamadan önce "Kolay", "Orta" veya "Zor" olmak üzere bir zorluk seviyesi seçebilmek istiyorum.
* **MVP-103 (Test Arayüzü):** *Bir kullanıcı olarak,* ekranda rastgele üretilmiş bir soru ve bu soruya ait "A Cevabı" ile "B Cevabı"nı net bir şekilde görmek istiyorum.
* **MVP-104 (Tahmin Yapma):** *Bir kullanıcı olarak,* hangi cevabın yapay zeka, hangisinin insan olduğunu düşündüğümü belirtmek için "Bu AI" veya "Bu İnsan" gibi net butonlara tıklayabilmek istiyorum.
* **MVP-105 (Can Sistemi):** *Bir kullanıcı olarak,* oyun boyunca (örneğin 3) kaç "can" (tahmin hakkı) hakkım kaldığını görsel olarak (örn: kalp ikonları) takip edebilmek istiyorum.
* **MVP-106 (Puanlama):** *Bir kullanıcı olarak,* her doğru tahminimde puanımın arttığını görmek istiyorum. Daha zor testleri tahmin ettiğimde daha çok puan almalıyım.
* **MVP-107 (Anlık Geri Bildirim):** *Bir kullanıcı olarak,* tahminimi yaptıktan hemen sonra doğru cevabın hangisi olduğunu (görsel bir vurgu ile, örn: yeşil/kırmızı) görmek istiyorum.
* **MVP-108 (Oyun Sonu):** *Bir kullanıcı olarak,* tüm canlarım bittiğinde oyunun sona erdiğini ve ulaştığım "Final Skoru"nu gösteren bir özet ekranı görmek istiyorum.
* **MVP-109 (Paylaşım):** *Bir kullanıcı olarak,* oyun sonu ekranındaki final skorumu sosyal medyada (Twitter, Facebook, WhatsApp vb.) kolayca paylaşabilmek için bir "Skoru Paylaş" butonu görmek istiyorum.

## 4. Ana Özellikler (Fonksiyonel Gereksinimler)

### 4.1. Oyun Motoru ve Akışı

1.  **Başlangıç Ekranı:** Logo, kısa açıklama, "Oyuna Başla" butonu.
2.  **Zorluk Seçim Ekranı:** "Kolay", "Orta", "Zor" seçenekleri sunulur.
3.  **Oyun Ekranı:**
    * Mevcut Puan (Skor) göstergesi.
    * Kalan Can (örn: 3 adet) göstergesi.
    * Rastgele üretilmiş **Soru**.
    * Karıştırılmış sırada **Cevap A** ve **Cevap B**.
    * Kullanıcının seçimi için "Cevap A AI'dır" / "Cevap B AI'dır" (veya benzeri net) butonları.
4.  **Geri Bildirim:** Kullanıcı seçim yaptıktan sonra, cevap kartları doğru (yeşil) ve yanlış (kırmızı) olarak işaretlenir. 2 saniye bekledikten sonra yeni soruya geçilir.
    * Doğru tahmin: Puan artar (örn: +10 puan). Soru zorluk seviyesine göre daha fazla puan kazanılır.
    * Yanlış tahmin: Bir can azalır.
5.  **Oyun Sonu Ekranı:**
    * Tüm canlar bittiğinde (Kalan Can = 0) bu ekrana geçilir.
    * "Oyun Bitti!" mesajı.
    * "Final Skorunuz: [SKOR]" göstergesi.
    * "Tekrar Oyna" butonu.
    * "Skoru Paylaş" butonu.

### 4.2. İçerik Üretim Akışı (Backend)

Bu, sistemin en kritik teknik özelliğidir:

1.  **Soru Üretimi:** Sistem, bir AI modeline (bkz. Bölüm 7) "Bana [konu] hakkında ilginç bir soru sor" (örn: felsefe, bilim, günlük yaşam) talimatı göndererek bir soru metni ($SORU) üretir.
2.  **"İnsan" Cevabı Üretimi:**
    * Sistem, $SORU metnini bir **Arama Motoru API**'sine (örn: Google Search API) sorgu olarak gönderir.
    * Gelen arama sonuçlarını (URL'ler) tarar.
    * Arama sonuçlarındaki sayfalardan $SORU ile en alakalı olan metin pasajını (snippet) seçer.
    * Bu pasajı $CEVAP_İNSAN olarak kaydeder. (Not: Reklam, menü vb. "boilerplate" metinleri ayıklamak için bir "scraper" ve "text-cleaning" algoritması gereklidir).
3.  **"Yapay Zeka" Cevabı Üretimi:**
    * Sistem, $SORU metnini ve kullanıcının seçtiği zorluk seviyesine ($ZORLUK) uygun sistem talimatını (system prompt) **AI Model API**'sine (OpenRouter) gönderir.
    * Gelen cevabı $CEVAP_AI olarak kaydeder.
4.  **Sunum:** $CEVAP_İNSAN ve $CEVAP_AI, kullanıcıya rastgele (A/B veya B/A) olarak sunulur. Hangi cevabın AI olduğu bilgisi sunucuda (server-side) tutulur.

### 4.3. Puanlama ve Can Sistemi

* Her oyun **3 Can** ile başlar.
* Her yanlış tahmin **-1 Can** düşürür.
* Her doğru tahmin **+10 Puan** kazandırır. Soru zorluk seviyesine göre daha fazla puan kazanılır. (10 ar artar puanlar)
* Zorluk seviyeleri puanlamayı etkile*me*lidir (MVP için), ancak gelecekte "Zor" seviye daha çok puan verebilir.

### 4.4. Skor Paylaşma

* "Skoru Paylaş" butonuna tıklandığında, sistem "İnsan Avcısı oyununda [SKOR] puan aldım! Sence sen AI'ı insandan ayırabilir misin? [Uygulama URL'si]" metnini kullanıcının tercih ettiği sosyal platforma (platformun paylaşım URL şeması kullanılarak) gönderir.

## 5. Kullanıcı Arayüzü (UI) / Kullanıcı Deneyimi (UX) Gereksinimleri

* **Tasarım:** Minimalist, modern ve "teknolojik" bir tema (örn: koyu mod tercih edilebilir).
* **Duyarlılık (Responsiveness):** Uygulama hem masaüstü hem de mobil tarayıcılarda sorunsuz çalışmalıdır (Mobile-First yaklaşım).
* **Etkileşim:** Butonlar net ve tıklanabilir olmalı. Kullanıcı bir seçim yaptığında anında görsel geri bildirim almalıdır (bekleme veya yükleme hissi en aza indirilmeli).
* **Okunabilirlik:** Sorular ve cevaplar için kullanılan fontlar net ve kolay okunabilir olmalıdır. Cevap metinleri için (potansiyel olarak uzun olabilirler) "scroll" edilebilir (kaydırılabilir) alanlar tasarlanmalıdır.

## 6. Teknik Gereksinimler

* **Frontend:** React, Vue veya Svelte gibi modern bir JavaScript kütüphanesi (state yönetimi ve reaktif UI için).
* **Backend:** Python (FastAPI veya Flask) ya da Node.js (Express). Bu dil/çerçeveler, harici API'lere (AI ve Arama) istek atmak için idealdir.
* **API Entegrasyonları (Kritik):**
    * **Arama API'si:** Google Custom Search API, Bing Web Search API veya benzeri bir servise abonelik.
    * **AI Model API'si:** OpenRouter API anahtarı.
* **Veritabanı (MVP için Opsiyonel):** Kullanıcı hesabı olmayacağı için karmaşık bir veritabanı gerekmez. Ancak, analitik verileri (oynanan oyun sayısı, ortalama skor, genel doğruluk oranı vb.) toplamak için basit bir veritabanı (örn: PostgreSQL veya MongoDB) kurulması şiddetle tavsiye edilir.
* **Oturum Yönetimi (Session):** Kullanıcının mevcut puanı ve kalan can bilgisi, tarayıcının `localStorage` / `sessionStorage` (istemci tarafı) veya sunucu tarafında bir oturum (session) yapısında tutulmalıdır.

## 7. Yapay Zeka Gereksinimleri

### 7.1. MCP (Model/Cloud/Platform)

* **Platform:** **OpenRouter**
* **Gerekçe:** Birden fazla modeli (açık kaynak ve kapalı kaynak) tek bir API üzerinden test etme ve kullanma esnekliği sağlar.
* **Kullanılacak Modeller:** Başlangıç için yüksek performanslı bir model (örn: `anthropic/claude-3-opus` veya `openai/gpt-4o`) ve bir adet popüler açık kaynaklı model (örn: `mistralai/mixtral-8x22b`) test edilmelidir.

### 7.2. Çekirdek AI Fonksiyonları

1.  **Soru Üretici (Soru Bankası):**
    * **Talimat (Prompt):** `SYSTEM: "Sen bir soru üreticisin. Kullanıcıya genel kültür, felsefe veya bilim hakkında düşündürücü, tek cümlelik bir soru sor."`
    * **Kullanıcı:** `"Bana bir soru üret."`

2.  **AI Cevap Üretici (Zorluk Seviyeli):**
    * Bu, projenin "gizli sosudur". AI'a gönderilecek sistem talimatı ($ZORLUK) değişkenlik gösterecektir.
    * **ZORLUK: KOLAY**
        * **Sistem Talimatı (Prompt):** `"Sen bir yapay zeka asistanısın. Aşağıdaki soruyu net, bilgilendirici, listeleme yaparak ve resmi bir dille cevapla. Bir AI olduğunu gizlemeye çalışma."`
    * **ZORLUK: ORTA**
        * **Sistem Talimatı (Prompt):** `"Aşağıdaki soruyu bir uzmanın blog yazısı gibi cevapla. Anlaşılır, akıcı ve bilgilendirici ol. Çok resmi olma, ama argo da kullanma."`
    * **ZORLUK: ZOR**
        * **Sistem Talimatı (Prompt):** `"Aşağıdaki soruya bir internet forumunda yazıyormuş gibi cevap ver. Samimi ol, biraz kişisel görüş katabilirsin, belki bir-iki küçük yazım hatası (typo) yapabilirsin. Asla bir AI veya model olduğunu belirtme. İnsan gibi davran."`

### 7.3. "İnsan" Cevabı Bulma Süreci (Detay)

* Backend, Google/Bing API'sinden $SORU için arama yaptığında, `stackoverflow.com`, `reddit.com`, `quora.com`, bloglar veya haber siteleri gibi yüksek oranda insan tarafından yazılmış içerik barındıran sitelere öncelik vermelidir.
* Wikipedia gibi çok yapılandırılmış veya ansiklopedik sitelerden alınan metinler, AI metinlerine benzeyebileceği için daha az tercih edilmelidir.
* Bulunan metin (snippet), anlamlı bir bütünlük (en az 2-3 cümle) taşımalıdır.

## 8. Başarı Ölçütleri (KPIs)

* **Birincil KPI'lar:**
    * **Günlük Aktif Kullanıcı (DAU):** Uygulamayı günlük kaç tekil kullanıcının ziyaret ettiği.
    * **Ortalama Oturum Süresi:** Bir kullanıcının sitede geçirdiği ortalama süre (Hedef: 3+ dakika).
* **İkincil Metrikler (Analitik):**
    * **Genel Doğruluk Oranı:** Tüm kullanıcıların AI tahminlerindeki ortalama başarı yüzdesi (Bu, "insanların AI'ı ne kadar ayırt edebildiği" metriğidir).
    * **Paylaşım Oranı:** Oyun sonu ekranını gören kullanıcıların "Skoru Paylaş" butonuna tıklama oranı.
    * **Oyun Tamamlama Oranı:** Oyuna başlayan kullanıcıların canları bitene kadar oynama oranı (Hemen Çıkma Oranı'nın tersi).