import { NextApiRequest, NextApiResponse } from 'next'
import { addQuestionsToPool } from '../../../lib/questions-store'
import { checkRateLimit, getClientIP } from '../../../lib/rate-limiter'

interface BulkUploadRequest {
  adminKey: string
  questions: Array<{
    id: string
    question: string
    answerAI: string
    answerHuman: string
    source: string
    originalQuestion?: string
    originalAnswer?: string
    isTranslated?: boolean
  }>
}

interface BulkUploadResponse {
  success: boolean
  message: string
  uploaded?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkUploadResponse>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

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
    const { adminKey, questions }: BulkUploadRequest = req.body
    const clientIP = getClientIP(req)

    // Rate limiting (3 uploads per hour per IP)
    const rateLimit = checkRateLimit(`bulk-upload:${clientIP}`, 3, 60 * 60 * 1000)
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla yükleme denemesi. Lütfen daha sonra tekrar deneyin.'
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

    // Questions validation
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli soru listesi gerekli'
      })
    }

    if (questions.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Tek seferde maksimum 50 soru yükleyebilirsiniz'
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

    // Add questions to pool
    const processedQuestions = questions.map(q => ({
      id: q.id || `bulk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      question: q.question,
      answerAI: q.answerAI,
      answerHuman: q.answerHuman,
      source: q.source || 'Bulk Upload',
      originalQuestion: q.originalQuestion || '',
      originalAnswer: q.originalAnswer || '',
      isTranslated: q.isTranslated || false
    }))

    addQuestionsToPool(processedQuestions)

    res.status(200).json({
      success: true,
      message: `${processedQuestions.length} soru başarıyla yüklendi`,
      uploaded: processedQuestions.length
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    })
  }
}
