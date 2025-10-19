import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, updateSession } from '../../../lib/sessions-store'
import { logAnswerSubmitted, logAnswerResult, logGameOver, logError } from '../../../lib/logger'

interface SubmitAnswerRequest {
  sessionId: string
  choice: 'A' | 'B'
  questionId: string
  correctAnswer: 'A' | 'B'
}

interface SubmitAnswerResponse {
  correct: boolean
  correctAnswer: 'A' | 'B'
  pointsEarned: number
  newScore: number
  newLives: number
}

const POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitAnswerResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId, choice, questionId } = req.body as SubmitAnswerRequest

    if (!sessionId || !choice || !questionId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    logAnswerSubmitted(sessionId, choice, questionId)
    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Get correct answer from session (more secure than trusting frontend)
    const correctAnswer = session.currentCorrectAnswer || req.body.correctAnswer
    const isCorrect = choice === correctAnswer
    let newScore = session.score
    let newLives = session.lives
    let pointsEarned = 0

    if (isCorrect) {
      pointsEarned = POINTS_BY_DIFFICULTY[session.difficulty] || 10
      newScore += pointsEarned
    } else {
      newLives -= 1
    }

    updateSession(sessionId, {
      score: newScore,
      lives: newLives,
      questionsAnswered: session.questionsAnswered + 1,
    })

    logAnswerResult(isCorrect, choice, correctAnswer, pointsEarned, newScore, newLives)

    if (newLives <= 0) {
      logGameOver(session.nickname, newScore)
    }

    res.status(200).json({
      correct: isCorrect,
      correctAnswer,
      pointsEarned,
      newScore,
      newLives,
    })
  } catch (error) {
    logError('Cevap Gönderme', error)
    res.status(500).json({ error: 'Failed to submit answer' })
  }
}
