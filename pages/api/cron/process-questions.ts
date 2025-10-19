import type { NextApiRequest, NextApiResponse } from 'next'
import { questionProcessor } from '../../../lib/question-processor'
import { loadQuestionsPool } from '../../../lib/questions-store'

interface CronResponse {
  success: boolean
  message: string
  currentPoolSize?: number
  processed?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CronResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    // Netlify cron job authentication
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    console.log('🕐 Cron Job: Sürekli soru ekleme başlıyor...')
    
    const currentPool = loadQuestionsPool()
    const currentSize = currentPool.length
    
    console.log(`📊 Mevcut soru havuzu boyutu: ${currentSize}`)
    
    // Sınır olmadan sürekli 3-5 soru ekle
    const questionsToAdd = Math.floor(Math.random() * 3) + 3 // 3-5 arası rastgele
    
    console.log(`📝 ${questionsToAdd} yeni soru ekleniyor...`)
    
    await questionProcessor.processBatchQuestions(questionsToAdd)
    
    return res.status(200).json({
      success: true,
      message: `Added ${questionsToAdd} new questions to pool (no limit mode)`,
      currentPoolSize: currentSize,
      processed: questionsToAdd
    })

  } catch (error) {
    console.error('Cron job error:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
