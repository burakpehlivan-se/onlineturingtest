import { NextApiRequest, NextApiResponse } from 'next'
import { loadQuestionsPool } from '../../../lib/questions-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { adminKey } = req.body

    // Admin key kontrolü
    const expectedKey = process.env.ADMIN_KEY || 'admin123'
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(401).json({ success: false, message: 'Geçersiz admin key' })
    }

    // Soruları yükle
    const questions = await loadQuestionsPool()

    return res.status(200).json({
      success: true,
      questions: questions,
      count: questions.length
    })

  } catch (error) {
    console.error('Get questions error:', error)
    return res.status(500).json({
      success: false,
      message: 'Sorular yüklenirken hata oluştu'
    })
  }
}
