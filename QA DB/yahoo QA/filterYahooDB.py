from datasets import load_dataset
import random

# Dataset'in sütun adlarını (schema) kontrol ettiğimizde 
# cevap sütununun adı 'best_answer'
CEVAP_SUTUNU = 'best_answer'
SORU_SUTUNU = 'question_title'
MIN_KELIME_SAYISI = 40  # 3-4 cümlenin kabaca karşılığı

print("Dataset yükleniyor (bu işlem biraz sürebilir)...")

# 1. Dataset'i yükle (eğitim (train) setini alalım, daha büyüktür)
# Bu komut, API çağrılarını arka planda otomatik yapar.
dataset = load_dataset("community-datasets/yahoo_answers_topics", split="train")

print(f"Toplam {len(dataset)} satır yüklendi.")

# 2. Filtreleme fonksiyonumuzu tanımlayalım
def is_long_enough(example):
    # 'best_answer' sütunundaki metni al
    answer_text = example[CEVAP_SUTUNU]
    
    # Cevabın boş olmadığından (None) emin ol ve kelime sayısını kontrol et
    return answer_text is not None and len(answer_text.split()) >= MIN_KELIME_SAYISI

# 3. Filtreyi uygula
# Bu, tüm dataset üzerinde çalışır ve sadece şartı sağlayanları tutar.
filtered_dataset = dataset.filter(is_long_enough)

print(f"Filtreleme tamamlandı. {len(filtered_dataset)} satır kaldı.")

# --- Artık filtrelenmiş veriyi kullanabiliriz ---

# Turing testiniz için rastgele bir Soru-Cevap alalım:
if len(filtered_dataset) > 0:
    random_sample = filtered_dataset[random.randint(0, len(filtered_dataset) - 1)]
    
    print("\n--- RASTGELE ÖRNEK ---")
    print(f"SORU: {random_sample[SORU_SUTUNU]}")
    print(f"İNSAN CEVABI: {random_sample[CEVAP_SUTUNU]}")
else:
    print("Bu kritere uyan cevap bulunamadı.")