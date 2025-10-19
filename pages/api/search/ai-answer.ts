import type { NextApiRequest, NextApiResponse } from 'next'

interface AIAnswerRequest {
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface AIAnswerResponse {
  answer: string
  model: string
}

const DIFFICULTY_PROMPTS = {
  easy: 'Net, bilgilendirici, listeleme yaparak ve resmi bir dille cevapla. Maksimum 150 kelime.',
  medium:
    'Bir uzmanın blog yazısı gibi cevapla. Anlaşılır, akıcı ve bilgilendirici ol. Maksimum 200 kelime.',
  hard: 'Bir internet forumunda yazıyormuş gibi cevap ver. Samimi ol, biraz kişisel görüş katabilirsin. Maksimum 250 kelime.',
}

const SAMPLE_AI_ANSWERS = [
  {
    question: 'Yapay zeka nedir ve hangi alanlarda kullanılır?',
    answer:
      'Yapay zeka, insan benzeri zeka gösterebilen bilgisayar sistemleridir. Makine öğrenmesi, derin öğrenme ve doğal dil işleme gibi teknolojileri kullanarak, veri analizi, görüntü tanıma ve karar verme gibi görevleri otomatik olarak gerçekleştirebilir. Sağlık, finans, ulaştırma ve eğitim gibi birçok alanda uygulanmaktadır.',
  },
  {
    question: 'Kuantum bilgisayarlar klasik bilgisayarlardan nasıl farklıdır?',
    answer:
      'Kuantum bilgisayarlar, klasik bilgisayarlardan temel olarak farklıdır. Klasik bilgisayarlar 0 ve 1 (bit) kullanırken, kuantum bilgisayarlar kuantum bitleri (qubit) kullanır. Kubitler, süperpozisyon ve dolanıklık gibi kuantum mekaniksel özellikleri sayesinde, aynı anda birden fazla durumda olabilir. Bu, kuantum bilgisayarları belirli problemleri çözmede çok daha hızlı hale getirir.',
  },
  {
    question: 'İklim değişikliğinin ana nedenleri nelerdir?',
    answer:
      'İklim değişikliğinin ana nedenleri, insan faaliyetleri tarafından atmosfere salınan sera gazlarıdır. Özellikle karbondioksit (CO2), metan (CH4) ve azot oksit (N2O) gibi gazlar, güneş ışınlarının geri yansımasını engeller ve ısı tutar. Fosil yakıtların yakılması, endüstri, tarım ve ulaştırma bu gazların ana kaynağıdır. Ormanların yok edilmesi de atmosferdeki CO2 seviyesini artırır.',
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIAnswerResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, difficulty } = req.body as AIAnswerRequest

    if (!question || !difficulty) {
      return res.status(400).json({ error: 'Question and difficulty are required' })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    const isValidApiKey = apiKey && !apiKey.includes('your_') && apiKey.length > 10

    if (!isValidApiKey) {
      console.log('ℹ OPENROUTER_API_KEY tanımlanmamış, örnek cevap kullanılıyor')
      const matchingAnswers = SAMPLE_AI_ANSWERS.filter((item) =>
        item.question.toLowerCase().includes(question.toLowerCase()) ||
        question.toLowerCase().includes(item.question.toLowerCase())
      )

      if (matchingAnswers.length > 0) {
        const selected = matchingAnswers[Math.floor(Math.random() * matchingAnswers.length)]
        console.log(`  ✓ Örnek cevap seçildi`)
        console.log(`  Cevap: "${selected.answer.substring(0, 80)}..."\n`)
        return res.status(200).json({
          answer: selected.answer,
          model: 'sample',
        })
      }

      const randomAnswer = SAMPLE_AI_ANSWERS[Math.floor(Math.random() * SAMPLE_AI_ANSWERS.length)]
      console.log(`  ✓ Rastgele örnek cevap seçildi`)
      console.log(`  Cevap: "${randomAnswer.answer.substring(0, 80)}..."\n`)
      return res.status(200).json({
        answer: randomAnswer.answer,
        model: 'sample',
      })
    }

    console.log(`\n🤖 AI CEVAP ÜRETİMİ`)
    console.log(`  Soru: "${question}"`)
    console.log(`  Zorluk: ${difficulty.toUpperCase()}`)
    console.log(`  Talimat: "${DIFFICULTY_PROMPTS[difficulty]}"`)

    const prompt = `${DIFFICULTY_PROMPTS[difficulty]}\n\nSoru: ${question}\n\nCevap:`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Online Turing Test',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Sen bilgili ve yardımcı bir asistansın. Sorulan sorulara doğru, bilgilendirici ve uygun uzunlukta cevaplar ver.',
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

    if (!response.ok) {
      const error = await response.json()
      console.error(`  ✗ API Hatası: ${error.error?.message || 'Unknown error'}`)
      return res.status(response.status).json({ error: error.error?.message || 'API request failed' })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('  ✗ Beklenmeyen API yanıtı')
      return res.status(500).json({ error: 'Unexpected API response' })
    }

    const answer = data.choices[0].message.content.trim()
    const model = data.model || 'gpt-3.5-turbo'

    console.log(`  ✓ Başarılı (${model})`)
    console.log(`  Cevap: "${answer.substring(0, 80)}..."\n`)

    res.status(200).json({
      answer,
      model,
    })
  } catch (error) {
    console.error('AI answer generation error:', error)
    res.status(500).json({ error: 'Failed to generate AI answer' })
  }
}
