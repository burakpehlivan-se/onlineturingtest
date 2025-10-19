import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/sessions-store'
import { loadQuestionsPool } from '../../../lib/questions-store'
import { logQuestionRequested, logQuestionRetrieved, logAICommand, logError } from '../../../lib/logger'

interface Question {
  id: string
  question: string
  answerA: string
  answerB: string
  correctAnswer?: 'A' | 'B'
}

interface NextQuestionResponse {
  question?: Question
  score: number
  lives: number
  gameOver: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NextQuestionResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.query as { sessionId: string }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    logQuestionRequested(sessionId)
    const session = getSession(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.lives <= 0) {
      return res.status(200).json({
        score: session.score,
        lives: session.lives,
        gameOver: true,
      })
    }

    const questionPool = loadQuestionsPool()

    if (questionPool.length === 0) {
      // Soru havuzu boş - bu durumda error döndür
      return res.status(500).json({ 
        error: 'No questions available. Please contact administrator.' 
      })
    }

    const randomQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]

    console.log(`\n🔍 randomQuestion object:`, {
      id: randomQuestion.id,
      question: randomQuestion.question?.substring(0, 40),
      answerAI: randomQuestion.answerAI?.substring(0, 40),
      answerHuman: randomQuestion.answerHuman?.substring(0, 40),
    })

    if (!randomQuestion.answerAI || !randomQuestion.answerHuman) {
      console.error(`❌ HATA: Soru ${randomQuestion.id} için cevaplar eksik!`, {
        hasAnswerAI: !!randomQuestion.answerAI,
        hasAnswerHuman: !!randomQuestion.answerHuman,
      })
      return res.status(500).json({ error: 'Question data incomplete' })
    }

    const answerOrder = Math.random() > 0.5
      ? { A: randomQuestion.answerAI, B: randomQuestion.answerHuman }
      : { A: randomQuestion.answerHuman, B: randomQuestion.answerAI }

    const correctAnswer = answerOrder.A === randomQuestion.answerAI ? 'A' : 'B'

    logQuestionRetrieved(randomQuestion.id, randomQuestion.question, session.difficulty)
    console.log(`  Cevap A: ${answerOrder.A === randomQuestion.answerAI ? '(AI)' : '(İnsan)'} - ${answerOrder.A?.substring(0, 50) || 'UNDEFINED'}...`)
    console.log(`  Cevap B: ${answerOrder.B === randomQuestion.answerAI ? '(AI)' : '(İnsan)'} - ${answerOrder.B?.substring(0, 50) || 'UNDEFINED'}...`)
    console.log(`  Doğru Cevap: ${correctAnswer}\n`)

    console.log(`\n🔍 API RESPONSE DEBUG`)
    console.log(`  Question ID: ${randomQuestion.id}`)
    console.log(`  Question: ${randomQuestion.question?.substring(0, 40) || 'UNDEFINED'}...`)
    console.log(`  AnswerA: ${answerOrder.A ? 'OK (' + answerOrder.A.length + ' char)' : 'UNDEFINED'}`)
    console.log(`  AnswerB: ${answerOrder.B ? 'OK (' + answerOrder.B.length + ' char)' : 'UNDEFINED'}\n`)

    const responseData = {
      question: {
        id: randomQuestion.id,
        question: randomQuestion.question,
        answerA: answerOrder.A,
        answerB: answerOrder.B,
        correctAnswer: correctAnswer as 'A' | 'B',
      },
      score: session.score,
      lives: session.lives,
      gameOver: false,
    }

    console.log(`💬 SENDING RESPONSE:`, {
      questionId: responseData.question.id,
      answerALength: responseData.question.answerA?.length,
      answerBLength: responseData.question.answerB?.length,
    })

    res.status(200).json(responseData)
  } catch (error) {
    logError('Soru Getirme', error)
    res.status(500).json({ error: 'Failed to get next question' })
  }
}
