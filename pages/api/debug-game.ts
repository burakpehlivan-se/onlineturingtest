import type { NextApiRequest, NextApiResponse } from 'next'
import { createSession, getSession, updateSession } from '../../lib/sessions-store'
import { loadQuestionsPool } from '../../lib/questions-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n' + '='.repeat(80))
  console.log('🎮 TERMINAL OYUN BAŞLATILDI')
  console.log('='.repeat(80) + '\n')

  try {
    // 1. Oyun başlat
    const sessionId = `debug_${Date.now()}`
    console.log('📝 1. OYUN BAŞLATILIYOR')
    console.log(`   Session ID: ${sessionId}`)

    const session = createSession(sessionId, 'TestKullanıcı', 'easy')
    console.log(`   ✓ Session oluşturuldu:`, session)

    // 2. Soru havuzunu yükle
    console.log('\n📚 2. SORU HAVUZU YÜKLENIYOR')
    const questionPool = loadQuestionsPool()
    console.log(`   ✓ Sorular yüklendi: ${questionPool.length} soru`)

    if (questionPool.length === 0) {
      console.log('   ✗ Soru havuzu boş!')
      return res.status(200).json({ error: 'Soru havuzu boş' })
    }

    // 3. Rastgele soru seç
    console.log('\n🎯 3. RASTGELE SORU SEÇİLİYOR')
    const randomQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]
    console.log(`   Soru ID: ${randomQuestion.id}`)
    console.log(`   Soru: "${randomQuestion.question}"`)
    console.log(`   answerAI type: ${typeof randomQuestion.answerAI}`)
    console.log(`   answerAI length: ${randomQuestion.answerAI?.length || 'UNDEFINED'}`)
    console.log(`   answerHuman type: ${typeof randomQuestion.answerHuman}`)
    console.log(`   answerHuman length: ${randomQuestion.answerHuman?.length || 'UNDEFINED'}`)

    // 4. Cevapları karıştır
    console.log('\n🔀 4. CEVAPLAR KARIŞTIRILIYYOR')
    const answerOrder = Math.random() > 0.5
      ? { A: randomQuestion.answerAI, B: randomQuestion.answerHuman }
      : { A: randomQuestion.answerHuman, B: randomQuestion.answerAI }

    const correctAnswer = answerOrder.A === randomQuestion.answerAI ? 'A' : 'B'

    console.log(`   Cevap A: ${answerOrder.A ? '✓ OK (' + answerOrder.A.length + ' char)' : '✗ UNDEFINED'}`)
    console.log(`   Cevap B: ${answerOrder.B ? '✓ OK (' + answerOrder.B.length + ' char)' : '✗ UNDEFINED'}`)
    console.log(`   Doğru Cevap: ${correctAnswer}`)

    // 5. API Response oluştur
    console.log('\n📤 5. API RESPONSE OLUŞTURULUYOR')
    const responseData = {
      question: {
        id: randomQuestion.id,
        question: randomQuestion.question,
        answerA: answerOrder.A,
        answerB: answerOrder.B,
      },
      score: session.score,
      lives: session.lives,
      gameOver: false,
    }

    console.log(`   Response question.answerA: ${responseData.question.answerA ? '✓ OK' : '✗ UNDEFINED'}`)
    console.log(`   Response question.answerB: ${responseData.question.answerB ? '✓ OK' : '✗ UNDEFINED'}`)

    // 6. Cevap gönder
    console.log('\n🎯 6. CEVAP GÖNDERİLİYOR')
    const choice = 'A'
    console.log(`   Seçim: ${choice}`)
    console.log(`   Doğru Cevap: ${correctAnswer}`)
    console.log(`   Sonuç: ${choice === correctAnswer ? '✓ DOĞRU' : '✗ YANLIŞ'}`)

    // 7. Session güncelle
    console.log('\n💾 7. SESSION GÜNCELLENIYOR')
    const newScore = choice === correctAnswer ? session.score + 10 : session.score
    const newLives = choice === correctAnswer ? session.lives : session.lives - 1

    const updated = updateSession(sessionId, {
      score: newScore,
      lives: newLives,
      questionsAnswered: session.questionsAnswered + 1,
    })

    console.log(`   ✓ Session güncellendi:`, updated)

    // 8. Güncellenmiş session'ı oku
    console.log('\n🔍 8. GÜNCELLENMIŞ SESSION OKUNUYOR')
    const readSession = getSession(sessionId)
    console.log(`   ✓ Session okundu:`, readSession)

    console.log('\n' + '='.repeat(80))
    console.log('✓ TEST TAMAMLANDI')
    console.log('='.repeat(80) + '\n')

    res.status(200).json({
      success: true,
      message: 'Terminal oyun tamamlandı. Terminal çıktısını kontrol et.',
      responseData,
    })
  } catch (error) {
    console.error('❌ HATA:', error)
    res.status(500).json({ error: String(error) })
  }
}
