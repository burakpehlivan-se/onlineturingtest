import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n' + '='.repeat(80))
  console.log('İNSAN YAZIMI CEVAP API TEST')
  console.log('='.repeat(80) + '\n')

  try {
    const testQuestions = [
      'Yapay zeka nedir ve hangi alanlarda kullanılır?',
      'Kuantum bilgisayarlar klasik bilgisayarlardan nasıl farklıdır?',
      'İklim değişikliğinin ana nedenleri nelerdir?',
    ]

    for (const question of testQuestions) {
      console.log(`\n📝 Test Sorusu: "${question}"`)

      const response = await fetch('http://localhost:3000/api/search/human-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log(`✓ Başarılı`)
        console.log(`  Kaynak: ${data.source}`)
        console.log(`  URL: ${data.url}`)
        console.log(`  Cevap: "${data.answer.substring(0, 80)}..."`)
      } else {
        console.log(`✗ Hata: ${data.error}`)
      }
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
