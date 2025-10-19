import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n' + '='.repeat(80))
  console.log('AI CEVAP ÜRETİMİ TEST')
  console.log('='.repeat(80) + '\n')

  try {
    const testCases = [
      { question: 'Yapay zeka nedir?', difficulty: 'easy' as const },
      { question: 'Kuantum bilgisayarlar nasıl çalışır?', difficulty: 'medium' as const },
      { question: 'İklim değişikliğinin etkileri nelerdir?', difficulty: 'hard' as const },
    ]

    for (const testCase of testCases) {
      console.log(`\n📝 Test: "${testCase.question}" (${testCase.difficulty})`)

      const response = await fetch('http://localhost:3000/api/search/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase),
      })

      const data = await response.json()

      if (response.ok) {
        console.log(`✓ Başarılı`)
        console.log(`  Model: ${data.model}`)
        console.log(`  Cevap: "${data.answer.substring(0, 100)}..."`)
      } else {
        console.log(`✗ Hata: ${data.error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(80))
    console.log('TEST TAMAMLANDI')
    console.log('='.repeat(80) + '\n')

    res.status(200).json({ message: 'Test completed. Check terminal output.' })
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({ error: 'Test failed' })
  }
}
