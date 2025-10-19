import fs from 'fs'
import path from 'path'
import { logger } from './production-logger'

const SESSIONS_FILE = path.join(process.cwd(), '.game-sessions.json')

interface GameSession {
  sessionId: string
  nickname: string
  difficulty: string
  score: number
  lives: number
  questionsAnswered: number
  createdAt: string
}

// Memory-based sessions for Netlify (serverless environment)
let memoryStore: Record<string, GameSession> = {}

export function loadSessions(): Record<string, GameSession> {
  // Try file first, fallback to memory
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
      const fileSessions = JSON.parse(data)
      // Merge with memory store
      memoryStore = { ...memoryStore, ...fileSessions }
      return memoryStore
    }
  } catch (error) {
    logger.error('Session yükleme hatası', error)
  }
  return memoryStore
}

export function saveSessions(sessions: Record<string, GameSession>): void {
  // Always save to memory
  memoryStore = sessions
  
  // Try to save to file (may fail on Netlify)
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
  } catch (error) {
    // Ignore file write errors on serverless
    logger.log('File write failed, using memory store only')
  }
}

export function getSession(sessionId: string): GameSession | null {
  const sessions = loadSessions()
  return sessions[sessionId] || null
}

export function saveSession(sessionId: string, session: GameSession): void {
  const sessions = loadSessions()
  sessions[sessionId] = session
  logger.log(`💾 Session kaydediliyor: ${sessionId}`)
  saveSessions(sessions)
  logger.log(`✓ Session kaydedildi: ${sessionId}`)
}

export function createSession(
  sessionId: string,
  nickname: string,
  difficulty: string
): GameSession {
  logger.log(`🆕 Yeni session oluşturuluyor: ${sessionId}`)
  const session: GameSession = {
    sessionId,
    nickname,
    difficulty,
    score: 0,
    lives: 3,
    questionsAnswered: 0,
    createdAt: new Date().toISOString(),
  }
  saveSession(sessionId, session)
  return session
}

export function updateSession(sessionId: string, updates: Partial<GameSession>): GameSession | null {
  const session = getSession(sessionId)
  if (!session) return null

  const updated = { ...session, ...updates }
  saveSession(sessionId, updated)
  return updated
}
