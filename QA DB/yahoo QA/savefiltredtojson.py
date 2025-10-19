from datasets import load_dataset
import os

# --- Ayarlar ---
CEVAP_SUTUNU = 'best_answer'
SORU_SUTUNU = 'question_title'
MIN_KELIME_SAYISI = 40  # 3-4 cümlenin kabaca karşılığı
JSON_DOSYA_ADI = 'filtrelenmis_soru_cevaplar.json'
TUTULACAK_SUTUNLAR = [SORU_SUTUNU, CEVAP_SUTUNU] # Sadece bu sütunları kaydet

# --- 1. Veri Setini Yükle ---
print("Dataset yükleniyor...")
# 'community-datasets/yahoo_answers_topics' datasetini 'train' split'i ile yükle
dataset = load_dataset("community-datasets/yahoo_answers_topics", split="train")
print(f"Toplam {len(dataset)} satır yüklendi.")

# --- 2. Filtreleme Fonksiyonu ---
def is_long_enough(example):
    """Cevabın 40 kelimeden uzun olup olmadığını kontrol eder."""
    answer_text = example[CEVAP_SUTUNU]
    # Cevabın 'None' (boş) olmadığından emin ol
    return answer_text is not None and len(answer_text.split()) >= MIN_KELIME_SAYISI

# --- 3. Filtreyi Uygula ---
print("Cevap uzunluğuna göre filtreleme yapılıyor...")
filtered_dataset = dataset.filter(is_long_enough)
print(f"Filtreleme sonrası {len(filtered_dataset)} satır kaldı.")

# --- 4. Gereksiz Sütunları Kaldır ---
# JSON dosyasını temiz tutmak için sadece soru ve cevabı tutalım.
original_columns = filtered_dataset.column_names
columns_to_remove = [col for col in original_columns if col not in TUTULACAK_SUTUNLAR]

cleaned_dataset = filtered_dataset.remove_columns(columns_to_remove)
print(f"Gereksiz sütunlar kaldırıldı. Sadece {TUTULACAK_SUTUNLAR} tutuldu.")

# --- 5. JSON Olarak Kaydet ---
print(f"Veri {JSON_DOSYA_ADI} dosyasına kaydediliyor...")
try:
    # .to_json() metodu ile filtrelenmiş ve temizlenmiş veriyi kaydet
    cleaned_dataset.to_json(JSON_DOSYA_ADI)
    
    print("\nBaşarılı!")
    print(f"Filtrelenmiş veriniz '{os.path.abspath(JSON_DOSYA_ADI)}' konumuna kaydedildi.")
    
except Exception as e:
    print(f"Kaydetme sırasında bir hata oluştu: {e}")