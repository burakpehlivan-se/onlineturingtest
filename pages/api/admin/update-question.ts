import { NextApiRequest, NextApiResponse } from 'next'
import { loadQuestionsPool, saveQuestionsPool } from '../../../lib/questions-store'

interface StoredQuestion {
  id: string
  question: string
  answerAI: string
  answerHuman: string
  source: string
  originalQuestion?: string
  originalAnswer?: string
  isTranslated?: boolean
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { adminKey, question } = req.body

    // Admin key kontrolü
    const expectedKey = process.env.ADMIN_KEY || 'admin123'
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(401).json({ success: false, message: 'Geçersiz admin key' })
    }

    if (!question || !question.id) {
      return res.status(400).json({ success: false, message: 'Geçerli soru verisi gerekli' })
    }

    // Soruları yükle
    const questions = loadQuestionsPool()
    
    // Soruyu bul
    const questionIndex = questions.findIndex(q => q.id === question.id)
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Soru bulunamadı' })
    }

    // Soruyu güncelle
    const updatedQuestion: StoredQuestion = {
      ...questions[questionIndex],
      question: question.question || questions[questionIndex].question,
      answerAI: question.answerAI || questions[questionIndex].answerAI,
      answerHuman: question.answerHuman || questions[questionIndex].answerHuman,
      source: question.source || questions[questionIndex].source
    }

    questions[questionIndex] = updatedQuestion
    
    // Kaydet
    saveQuestionsPool(questions)

    return res.status(200).json({
      success: true,
      message: 'Soru başarıyla güncellendi',
      question: updatedQuestion
    })

  } catch (error) {
    console.error('Update question error:', error)
    return res.status(500).json({
      success: false,
      message: 'Soru güncellenirken hata oluştu'
    })
  }
}
