import type { NextApiRequest, NextApiResponse } from 'next'
import { createSession } from '../../../lib/sessions-store'
import { logGameStart, logError } from '../../../lib/logger'

interface StartGameRequest {
  nickname: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface StartGameResponse {
  sessionId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StartGameResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { nickname, difficulty } = req.body as StartGameRequest

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    createSession(sessionId, nickname, difficulty)
    logGameStart(nickname, difficulty, sessionId)

    res.status(200).json({ sessionId })
  } catch (error) {
    logError('Oyun Başlatma', error)
    res.status(500).json({ error: 'Failed to start game' })
  }
}
