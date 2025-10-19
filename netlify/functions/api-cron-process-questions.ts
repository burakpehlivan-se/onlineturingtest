import { Handler } from '@netlify/functions'
import { questionProcessor } from '../../lib/question-processor'
import { loadQuestionsPool } from '../../lib/questions-store'

export const handler: Handler = async (event, context) => {
  // Verify cron secret for security
  const cronSecret = event.headers['x-netlify-cron-secret'] || event.queryStringParameters?.secret
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    // Check current question pool size
    const currentQuestions = loadQuestionsPool()
    const currentCount = currentQuestions.length

    // Only process if we have less than 50 questions
    if (currentCount >= 50) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Question pool has ${currentCount} questions. No processing needed.`,
          processed: 0,
          totalQuestions: currentCount
        })
      }
    }

    // Calculate how many questions to add (target: 50)
    const questionsToAdd = Math.min(5, 50 - currentCount)

    // Process new questions
    await questionProcessor.processBatchQuestions(questionsToAdd)

    // Get updated count
    const updatedQuestions = loadQuestionsPool()
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully processed ${questionsToAdd} questions`,
        processed: questionsToAdd,
        totalQuestions: updatedQuestions.length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Cron job error:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process questions',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
