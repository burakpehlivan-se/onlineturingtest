import { NextApiRequest, NextApiResponse } from 'next'
import { loadQuestionsPool, saveQuestionsPool } from '../../../lib/questions-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { adminKey, questionId } = req.body

    // Admin key kontrolü
    const expectedKey = process.env.ADMIN_KEY || 'admin123'
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(401).json({ success: false, message: 'Geçersiz admin key' })
    }

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Question ID gerekli' })
    }

    // Soruları yükle
    const questions = await loadQuestionsPool()
    
    // Soruyu bul
    const questionIndex = questions.findIndex(q => q.id === questionId)
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Soru bulunamadı' })
    }

    // Soruyu sil
    questions.splice(questionIndex, 1)
    
    // Kaydet
    await saveQuestionsPool(questions)

    return res.status(200).json({
      success: true,
      message: 'Soru başarıyla silindi',
      remainingCount: questions.length
    })

  } catch (error) {
    console.error('Delete question error:', error)
    return res.status(500).json({
      success: false,
      message: 'Soru silinirken hata oluştu'
    })
  }
}
