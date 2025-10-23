import { NextApiRequest, NextApiResponse } from 'next'
import { getQuestionsPool, clearQuestionsPool, deleteQuestionFromPool, addQuestionsToPool } from '../../../lib/questions-store'
import { checkRateLimit, getClientIP } from '../../../lib/rate-limiter'

interface QuestionsRequest {
  adminKey: string
  action: 'get' | 'clear' | 'delete' | 'add'
  questionId?: string
  questions?: Array<{
    id?: string
    question: string
    answerAI: string
    answerHuman: string
    source?: string
    originalQuestion?: string
    originalAnswer?: string
    isTranslated?: boolean
  }>
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
  added?: number
  totalInPool?: number
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
    res.status(200).json({ success: true, message: 'CORS preflight OK' })
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    // Handle both application/json and text/plain content types
    let requestData: QuestionsRequest
    
    if (typeof req.body === 'string') {
      // text/plain content type - parse JSON manually
      requestData = JSON.parse(req.body)
    } else {
      // application/json content type
      requestData = req.body
    }
    
    const { adminKey, action, questionId, questions } = requestData
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
    if (!action || !['get', 'clear', 'delete', 'add'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli action gerekli: get, clear, delete, add'
      })
    }

    switch (action) {
      case 'get':
        const questionsData = await getQuestionsPool()
        return res.status(200).json({
          success: true,
          message: `${questionsData.length} soru bulundu`,
          questions: questionsData,
          count: questionsData.length
        })

      case 'add':
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Geçerli soru listesi gerekli'
          })
        }

        // Validate each question
        for (const q of questions) {
          if (!q.question || !q.answerAI || !q.answerHuman) {
            return res.status(400).json({
              success: false,
              message: 'Her soru için question, answerAI ve answerHuman alanları gerekli'
            })
          }
        }

        // Process and add questions
        const processedQuestions = questions.map(q => ({
          id: q.id || `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          question: q.question,
          answerAI: q.answerAI,
          answerHuman: q.answerHuman,
          source: q.source || 'Admin Panel',
          originalQuestion: q.originalQuestion || '',
          originalAnswer: q.originalAnswer || '',
          isTranslated: q.isTranslated || false
        }))

        console.log('🔍 Questions API - Adding questions:', processedQuestions.length)
        
        const result = await addQuestionsToPool(processedQuestions)
        console.log('🔍 Questions API - Questions added, total now:', result.length)
        
        return res.status(200).json({
          success: true,
          message: `${processedQuestions.length} soru başarıyla eklendi`,
          added: processedQuestions.length,
          totalInPool: result.length
        })

      case 'clear':
        await clearQuestionsPool()
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
        
        const deleted = await deleteQuestionFromPool(questionId)
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
