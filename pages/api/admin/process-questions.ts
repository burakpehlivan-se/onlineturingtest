import type { NextApiRequest, NextApiResponse } from 'next'
import { questionProcessor } from '../../../lib/question-processor'

interface ProcessQuestionsResponse {
  success: boolean
  message: string
  processed?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessQuestionsResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { count = 1, adminKey } = req.body

    // Admin key kontrolü
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 10'
      })
    }

    await questionProcessor.processBatchQuestions(count)
    
    res.status(200).json({
      success: true,
      message: `Successfully processed ${count} questions`,
      processed: count
    })

  } catch (error) {
    // Error logged by questionProcessor
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
