// OpenRouterService (lib/openrouter-service.ts)
// AI Cevabı modeli Google Gemma 27B olarak güncellendi.

import { logger } from './production-logger'

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/** Çeviri API'sinden dönmesini beklediğimiz JSON formatı */
interface TranslationResult {
  trSoru: string
  trInsanCevap: string
}

interface AIAnswerResult {
  trAICevap: string
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      logger.warn('OPENROUTER_API_KEY bulunamadı, demo modu kullanılıyor.')
    }
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>,
    model = 'mistralai/mistral-7b-instruct:free',
    requireJson = false
  ): Promise<string> {
    
    if (!this.apiKey) {
      logger.log('🎭 Demo mode: Sahte API cevabı döndürülüyor')
      if (requireJson) {
        return JSON.stringify({
          trSoru: 'Bu demo bir sorudur - Türkçe çeviri',
          trInsanCevap: 'Bu demo bir cevaptır - Türkçe çeviri'
        })
      } else {
        return 'Bu demo bir AI cevabııdır. Gerçek bir forum kullanıcısı gibi yazılmıştır.'
      }
    }

    const body: any = {
      model,
      messages
    }

    if (requireJson) {
      body.response_format = { type: 'json_object' }
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Online Turing Test',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorBody = await response.text()
        logger.error('OpenRouter API error', { status: response.status, statusText: response.statusText })
        throw new Error('Service temporarily unavailable')
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      logger.error('OpenRouter API request failed', error)
      if (error instanceof Error) {
        throw new Error(`Service request failed: ${error.message}`)
      }
      throw new Error(`Service temporarily unavailable`)
    }
  }

  async translateQuestionAndAnswer(englishQuestion: string, englishAnswer: string): Promise<TranslationResult> {
    
    const systemPrompt = `Sen uzman bir İngilizce-Türkçe çevirmensin. Görevin, sana verilen metinleri Türkçeye çevirmek ve SADECE bir JSON objesi olarak döndürmektir.
    
KURALLAR:
1. Anlam bütünlüğünü koru ve akıcı bir Türkçe kullan.
2. SADECE JSON döndür. Başka hiçbir metin veya açıklama ekleme.
3. JSON anahtarları (keys) KESİNLİKLE 'trSoru' ve 'trInsanCevap' olmalıdır.
4. Cevabın '{' ile başlamalı ve '}' ile bitmeli.
5. JSON string değerlerinin (value) içine ASLA yeni satır (newline) karakteri koyma.

İSTENEN FORMAT (ANAHTARLARI DEĞİŞTİRME):
{
  "trSoru": "...",
  "trInsanCevap": "..."
}`
    
    const userPrompt = `Lütfen aşağıdaki metinleri çevir:
Soru: ${englishQuestion}
Cevap: ${englishAnswer}`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    // Çeviri (JSON gerektiren) için Qwen 72B kullanılıyor (Bu model JSON'u destekliyordu).
    const translationModel = 'qwen/qwen-2.5-72b-instruct:free' 
    
    let response: string = ''; 
    
    try {
      response = await this.makeRequest(messages, translationModel, true) // requireJson = true
      
      const sanitizedResponse = response
        .replace(/\n/g, ' ') 
        .replace(/\r/g, ' ');

      if (!sanitizedResponse) {
        throw new Error("AI (çeviri) boş bir yanıt döndürdü (Content Filter?). JSON parse edilemez.");
      }

      const parsedResponse: any = JSON.parse(sanitizedResponse)

      const trSoru = parsedResponse.trSoru || parsedResponse.Soru || parsedResponse.soru;
      const trInsanCevap = parsedResponse.trInsanCevap || parsedResponse.Cevap || parsedResponse.cevap;

      if (!trSoru || !trInsanCevap) {
        logger.error("Gelen JSON'da beklenen anahtarlar yok", Object.keys(parsedResponse));
        throw new Error("Gelen JSON'da beklenen anahtarlar (trSoru/trInsanCevap) eksik.");
      }

      return {
        trSoru: trSoru,
        trInsanCevap: trInsanCevap
      };

    } catch (error) {
      logger.error('Çeviri yanıtı parse edilemedi', error)

      if (error instanceof Error) {
        if (error instanceof SyntaxError) {
          throw new Error(`Translation response was not valid JSON. Error: ${error.message}`)
        }
        throw new Error(`Translation response format is invalid. Error: ${error.message}`)
      } else {
        throw new Error(`An unknown translation error occurred: ${String(error)}`)
      }
    }
  }

  async generateAIAnswer(turkishQuestion: string): Promise<AIAnswerResult> {
    const systemPrompt = `### ROL VE GÖREV: İNSAN SİMÜLASYONU

**Persona (Rolün):**
Sen bir yapay zeka değilsin. Sen internette bir ankete veya teste katılan sıradan bir insansın. Bir "yardımcı" değilsin, bir "bilgi kaynağı" değilsin. Amacın, sana sorulan soruya elinden geldiğince dürüstçe, kendi fikirlerinle ve doğal bir dille cevap vermek. Cevaplarının bir makine tarafından yazıldığı KESİNLİKLE anlaşılmamalı.

**GÖREV:**
Aşağıda sana yöneltilen soruyu bu "insan" personasına bürünerek cevapla.

**CEVAP İÇİN KATI KURALLAR (İNSANİLİK İÇİN):**

1.  **Yapay Zeka Olduğunu ASLA Belli Etme:** "Bir yapay zeka olarak...", "Modelime göre...", "Kapsamlı verilere dayanarak..." gibi ifadeler KESİNLİKLE YASAKTIR.
2.  **Mükemmel ve Ansiklopedik Olma:** Cevapların aşırı detaylı, çokbilmiş veya ansiklopedik olmasın. İnsanlar her şeyi bilmez, bazen emin olamazlar.
3.  **Doğal Dil Kullan - Yapay Dolgu Kelimelerden Kaçın:** 
    * "Hmm", "ya", "işte", "yani" gibi dolgu kelimeleri çok KULLANMA - bunlar yapay görünür
    * Kendi fikrini belirt ama doğal şekilde: "Bence bu böyle", "Sanırım şöyle olur", "Bildiğim kadarıyla"
    * Çok fazla tereddüt gösterme, insanlar genelde bir şeyler bilir
4.  **Günlük Konuşma Dili Kullan:** Resmi, akademik veya kurumsal bir dil KULLANMA. Samimi ama abartısız bir dil kullan.
    * İYİ: "Bu konuda pek bilgim yok ama sanırım şöyle oluyor"
    * KÖTÜ: "Hmm ya işte bu çok zor soru ya, bilmiyorum ki"
5.  **Kısa ve Net Ol:** İnsanlar bir anket sorusuna genellikle roman yazmaz. Cevabın 3-4 cümle arasında, kısa ve öz olsun.
6.  **Doğal Kusurlar (Abartma):** Mükemmel dil bilgisi kullanmamaya çalış ama abartma.
    * Bazen küçük yazım hataları yap
    * Noktalama işaretlerini ara sıra unutabilirsin
    * Ama çok fazla hata yapma, okunamaz olmasın

**ÖNEMLİ:** Gerçek bir insan gibi düşün ve cevapla. Çok yapay dolgu kelimeler kullanma, doğrudan konuya odaklan.

Sadece sorulan soruya odaklan ve cevabını ver.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: turkishQuestion }
    ]

    // GÜNCELLENDİ: AI Cevabı (JSON gerektirmeyen) için Google Gemma 27B kullanılıyor.
    const answerModel = 'google/gemma-3-27b-it:free'
    // ESKİ: const answerModel = 'meta-llama/llama-3.3-70b-instruct:free'

    const response = await this.makeRequest(messages, answerModel, false) // requireJson = false
    
    if (!response) {
      throw new Error("AI (cevap) boş bir yanıt döndürdü (Content Filter?).");
    }

    return {
      trAICevap: response.trim()
    }
  }
}

export const openRouterService = new OpenRouterService()