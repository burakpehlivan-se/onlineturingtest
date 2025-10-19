import type { NextApiRequest, NextApiResponse } from 'next'
import { loadQuestionsPool, addQuestionsToPool } from '../../../lib/questions-store'
import { logQuestionsGenerated, logError } from '../../../lib/logger'

const SAMPLE_QUESTIONS = [
  {
    question: 'Yapay zeka nedir ve hangi alanlarda kullanılır?',
    answerAI:
      'Yapay zeka, insan benzeri zeka gösterebilen bilgisayar sistemleridir. Makine öğrenmesi, derin öğrenme ve doğal dil işleme gibi teknolojileri kullanarak, veri analizi, görüntü tanıma ve karar verme gibi görevleri otomatik olarak gerçekleştirebilir. Sağlık, finans, ulaştırma ve eğitim gibi birçok alanda uygulanmaktadır.',
    answerHuman:
      'Yapay zeka (AI) bilgisayarlar tarafından gerçekleştirilen zeka gösterimidir. İnsan zekasının bilgisayarlar tarafından taklit edilmesidir. Makine öğrenmesi ve derin öğrenme gibi teknikler kullanılarak, sistemler deneyimlerden öğrenebilir ve performansını iyileştirebilir. Hepsi de günlük hayatımızda kullanılıyor, örneğin akıllı telefonlar, sosyal medya algoritmaları ve otonom araçlar.',
    source: 'Reddit - r/MachineLearning',
  },
  {
    question: 'Kuantum bilgisayarlar klasik bilgisayarlardan nasıl farklıdır?',
    answerAI:
      'Kuantum bilgisayarlar, klasik bilgisayarlardan temel olarak farklıdır. Klasik bilgisayarlar 0 ve 1 (bit) kullanırken, kuantum bilgisayarlar kuantum bitleri (qubit) kullanır. Kubitler, süperpozisyon ve dolanıklık gibi kuantum mekaniksel özellikleri sayesinde, aynı anda birden fazla durumda olabilir. Bu, kuantum bilgisayarları belirli problemleri çözmede çok daha hızlı hale getirir.',
    answerHuman:
      'Kuantum bilgisayarlar çok farklı çalışıyor. Klasik bilgisayarlar 0 veya 1 ile çalışırken, kuantum bilgisayarlar qubit adı verilen şeyler kullanıyor. Qubitlerin güzel tarafı, hem 0 hem de 1 olabilmeleri aynı anda. Buna süperpozisyon deniyor. Ayrıca dolanıklık diye bir şey var ki, bu da kubitler arasında garip bir bağlantı oluşturuyor. Bu yüzden kuantum bilgisayarlar bazı problemleri çok daha hızlı çözebiliyor.',
    source: 'Stack Overflow',
  },
  {
    question: 'İklim değişikliğinin ana nedenleri nelerdir?',
    answerAI:
      'İklim değişikliğinin ana nedenleri, insan faaliyetleri tarafından atmosfere salınan sera gazlarıdır. Özellikle karbondioksit (CO2), metan (CH4) ve azot oksit (N2O) gibi gazlar, güneş ışınlarının geri yansımasını engeller ve ısı tutar. Fosil yakıtların yakılması, endüstri, tarım ve ulaştırma bu gazların ana kaynağıdır. Ormanların yok edilmesi de atmosferdeki CO2 seviyesini artırır.',
    answerHuman:
      'İklim değişikliği çok karmaşık bir konu ama temel olarak sera gazlarından kaynaklanıyor. Fabrikalar, arabalar, elektrik üretimi... hepsi karbondioksit salıyor. Ayrıca hayvan çiftlikleri metan salıyor, bu da çok kötü. Ormanlara da zarar veriyoruz, oysa ağaçlar CO2 absorbe ediyor. Sonuç olarak, bu gazlar atmosferde birikerek ısı tutuyor ve dünya ısınıyor. Buzullar erimesi, deniz seviyesi yükseliyor, hava durumu daha ekstrem oluyor.',
    source: 'Quora',
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const questions = loadQuestionsPool()

    const newQuestions = SAMPLE_QUESTIONS.filter(
      (q) => !questions.some((existing: any) => existing.question === q.question)
    ).map((q, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      ...q,
    }))

    // OpenRouter'dan dinamik AI cevapları getir (opsiyonel)
    if (process.env.OPENROUTER_API_KEY && newQuestions.length > 0) {
      console.log(`\n🤖 OpenRouter'dan AI cevapları getiriliyor...`)
      for (const question of newQuestions) {
        try {
          // Doğrudan OpenRouter API'sine sor
          const prompt = `Orta zorluk seviyesinde, bir uzmanın blog yazısı gibi cevapla. Anlaşılır, akıcı ve bilgilendirici ol. Maksimum 200 kelime.\n\nSoru: ${question.question}\n\nCevap:`

          const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Online Turing Test',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Sen bilgili ve yardımcı bir asistansın. Sorulan sorulara doğru, bilgilendirici ve uygun uzunlukta cevaplar ver.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 300,
            }),
          })

          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            if (aiData.choices && aiData.choices[0]?.message?.content) {
              question.answerAI = aiData.choices[0].message.content.trim()
              console.log(`  ✓ ${question.question.substring(0, 40)}...`)
            }
          } else {
            console.log(`  ⚠ API Hatası: ${aiResponse.status}`)
          }
        } catch (err) {
          console.log(`  ⚠ AI cevap getirilemedi, örnek cevap kullanılıyor`)
        }
      }
    }

    if (newQuestions.length > 0) {
      const updatedQuestions = addQuestionsToPool(newQuestions)
      logQuestionsGenerated(newQuestions.length, updatedQuestions.length)

      console.log(`\n📚 SORU HAVUZU GÜNCELLENDİ`)
      console.log(`  Toplam Soru: ${updatedQuestions.length}`)
      console.log(`  Yeni Sorular: ${newQuestions.length}`)
      console.log(`  AI Cevapları: ${process.env.OPENROUTER_API_KEY ? 'Aktif' : 'Pasif (örnek cevaplar)'}\n`)
    } else {
      console.log(`\n📚 SORU HAVUZU ZATEN DOLU - ${questions.length} soru mevcut\n`)
    }

    const finalQuestions = newQuestions.length > 0 ? loadQuestionsPool() : questions
    res.status(200).json({
      success: true,
      addedCount: newQuestions.length,
      totalQuestions: finalQuestions.length,
    })
  } catch (error) {
    logError('Soru Oluşturma', error)
    res.status(500).json({ error: 'Failed to generate questions' })
  }
}
