import type { NextApiRequest, NextApiResponse } from 'next'

interface HumanAnswerRequest {
  question: string
}

interface HumanAnswerResponse {
  answer: string
  source: string
  url: string
}

const SAMPLE_HUMAN_ANSWERS = [
  {
    question: 'Yapay zeka nedir ve hangi alanlarda kullanılır?',
    answer:
      'Yapay zeka (AI) bilgisayarlar tarafından gerçekleştirilen zeka gösterimidir. İnsan zekasının bilgisayarlar tarafından taklit edilmesidir. Makine öğrenmesi ve derin öğrenme gibi teknikler kullanılarak, sistemler deneyimlerden öğrenebilir ve performansını iyileştirebilir. Hepsi de günlük hayatımızda kullanılıyor, örneğin akıllı telefonlar, sosyal medya algoritmaları ve otonom araçlar.',
    source: 'Reddit - r/MachineLearning',
    url: 'https://reddit.com/r/MachineLearning',
  },
  {
    question: 'Kuantum bilgisayarlar klasik bilgisayarlardan nasıl farklıdır?',
    answer:
      'Kuantum bilgisayarlar çok farklı çalışıyor. Klasik bilgisayarlar 0 veya 1 ile çalışırken, kuantum bilgisayarlar qubit adı verilen şeyler kullanıyor. Qubitlerin güzel tarafı, hem 0 hem de 1 olabilmeleri aynı anda. Buna süperpozisyon deniyor. Ayrıca dolanıklık diye bir şey var ki, bu da kubitler arasında garip bir bağlantı oluşturuyor. Bu yüzden kuantum bilgisayarlar bazı problemleri çok daha hızlı çözebiliyor.',
    source: 'Stack Overflow',
    url: 'https://stackoverflow.com',
  },
  {
    question: 'İklim değişikliğinin ana nedenleri nelerdir?',
    answer:
      'İklim değişikliği çok karmaşık bir konu ama temel olarak sera gazlarından kaynaklanıyor. Fabrikalar, arabalar, elektrik üretimi... hepsi karbondioksit salıyor. Ayrıca hayvan çiftlikleri metan salıyor, bu da çok kötü. Ormanlara da zarar veriyoruz, oysa ağaçlar CO2 absorbe ediyor. Sonuç olarak, bu gazlar atmosferde birikerek ısı tutuyor ve dünya ısınıyor. Buzullar erimesi, deniz seviyesi yükseliyor, hava durumu daha ekstrem oluyor.',
    source: 'Quora',
    url: 'https://quora.com',
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HumanAnswerResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question } = req.body as HumanAnswerRequest

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    console.log(`\n🔍 İNSAN YAZIMI CEVAP ARANIŞI`)
    console.log(`  Soru: "${question}"`)

    // Gerçek Google Search API entegrasyonu
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

    if (apiKey && searchEngineId) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(question)}&key=${apiKey}&cx=${searchEngineId}`
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()

        if (searchData.items && searchData.items.length > 0) {
          const result = searchData.items[0]
          const answer = result.snippet || result.title
          const source = new URL(result.link).hostname

          console.log(`  ✓ Google Search'ten bulundu: ${source}`)
          console.log(`  URL: ${result.link}\n`)

          return res.status(200).json({
            answer,
            source,
            url: result.link,
          })
        }
      } catch (error) {
        console.log(`  ⚠ Google Search API hatası, örnek cevaplar kullanılıyor`)
      }
    } else {
      console.log(`  ℹ Google Search API tanımlanmamış, örnek cevaplar kullanılıyor`)
    }

    // Fallback: MVP için örnek cevaplardan rastgele seç
    const matchingAnswers = SAMPLE_HUMAN_ANSWERS.filter((item) =>
      item.question.toLowerCase().includes(question.toLowerCase()) ||
      question.toLowerCase().includes(item.question.toLowerCase())
    )

    if (matchingAnswers.length > 0) {
      const selected = matchingAnswers[Math.floor(Math.random() * matchingAnswers.length)]
      console.log(`  ✓ Bulundu: ${selected.source}`)
      console.log(`  URL: ${selected.url}\n`)

      return res.status(200).json({
        answer: selected.answer,
        source: selected.source,
        url: selected.url,
      })
    }

    // Eğer tam eşleşme yoksa rastgele bir cevap seç
    const randomAnswer = SAMPLE_HUMAN_ANSWERS[Math.floor(Math.random() * SAMPLE_HUMAN_ANSWERS.length)]
    console.log(`  ✓ Rastgele seçildi: ${randomAnswer.source}`)
    console.log(`  URL: ${randomAnswer.url}\n`)

    res.status(200).json({
      answer: randomAnswer.answer,
      source: randomAnswer.source,
      url: randomAnswer.url,
    })
  } catch (error) {
    console.error('Human answer search error:', error)
    res.status(500).json({ error: 'Failed to search for human answer' })
  }
}
