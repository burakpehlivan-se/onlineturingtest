import type { NextApiRequest, NextApiResponse } from 'next'
import { logGameStart, logQuestionRequested, logAnswerResult, logGameOver } from '../../lib/logger'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n' + '='.repeat(80))
  console.log('TEST LOGGING BAŞLATILDI')
  console.log('='.repeat(80) + '\n')

  logGameStart('TestKullanıcı', 'medium', 'session_test_123')
  logQuestionRequested('session_test_123')
  logAnswerResult(true, 'A', 'A', 20, 20, 3)
  logAnswerResult(false, 'B', 'A', 0, 20, 2)
  logGameOver('TestKullanıcı', 20)

  console.log('='.repeat(80))
  console.log('TEST TAMAMLANDI')
  console.log('='.repeat(80) + '\n')

  res.status(200).json({ message: 'Test logging completed. Check terminal output.' })
}
