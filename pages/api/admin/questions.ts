import { NextApiRequest, NextApiResponse } from 'next'
import { getQuestionsPool, clearQuestionsPool, deleteQuestionFromPool } from '../../../lib/questions-store'
import { checkRateLimit, getClientIP } from '../../../lib/rate-limiter'

interface QuestionsRequest {
  adminKey: string
  action: 'get' | 'clear' | 'delete'
  questionId?: string
}

interface QuestionsResponse {
  success: boolean
  message: string
  questions?: Array<{
    id: string
    question: string
    answerAI: string
    answerHuman: string
    source: string
    originalQuestion?: string
    originalAnswer?: string
    isTranslated?: boolean
  }>
  count?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuestionsResponse>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { adminKey, action, questionId }: QuestionsRequest = req.body
    const clientIP = getClientIP(req)

    // Rate limiting (20 requests per hour per IP)
    const rateLimit = checkRateLimit(`questions-api:${clientIP}`, 20, 60 * 60 * 1000)
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.'
      })
    }

    // Admin key kontrolü
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return res.status(401).json({
        success: false,
        message: 'Geçersiz admin anahtarı'
      })
    }

    // Action kontrolü
    if (!action || !['get', 'clear', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli action gerekli: get, clear, delete'
      })
    }

    switch (action) {
      case 'get':
        const questions = getQuestionsPool()
        return res.status(200).json({
          success: true,
          message: `${questions.length} soru bulundu`,
          questions: questions,
          count: questions.length
        })

      case 'clear':
        clearQuestionsPool()
        return res.status(200).json({
          success: true,
          message: 'Tüm sorular silindi',
          count: 0
        })

      case 'delete':
        if (!questionId) {
          return res.status(400).json({
            success: false,
            message: 'Silmek için questionId gerekli'
          })
        }
        
        const deleted = deleteQuestionFromPool(questionId)
        if (deleted) {
          return res.status(200).json({
            success: true,
            message: 'Soru silindi'
          })
        } else {
          return res.status(404).json({
            success: false,
            message: 'Soru bulunamadı'
          })
        }

      default:
        return res.status(400).json({
          success: false,
          message: 'Bilinmeyen action'
        })
    }

  } catch (error) {
    console.error('Questions API error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    })
  }
}
