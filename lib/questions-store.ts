import fs from 'fs'
import path from 'path'
import { logger } from './production-logger'

const QUESTIONS_FILE = path.join(process.cwd(), '.questions-pool.json')

interface StoredQuestion {
  id: string
  question: string
  answerAI: string
  answerHuman: string
  source: string
  // Yeni alanlar - çevrilmiş sorular için
  originalQuestion?: string
  originalAnswer?: string
  isTranslated?: boolean
}

export function loadQuestionsPool(): StoredQuestion[] {
  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      logger.log(`✓ Soru havuzu yüklendi: ${parsed.length} soru`)
      return parsed
    } else {
      logger.warn(`Soru havuzu dosyası bulunamadı: ${QUESTIONS_FILE}`)
      
      // İlk kez çalışıyorsa hazır soruları yükle
      const initialQuestionsPath = path.join(process.cwd(), 'initial-questions.json')
      if (fs.existsSync(initialQuestionsPath)) {
        const initialData = fs.readFileSync(initialQuestionsPath, 'utf-8')
        const initialQuestions = JSON.parse(initialData)
        
        // Hazır soruları soru havuzuna kaydet
        saveQuestionsPool(initialQuestions)
        logger.log(`✓ İlk soru havuzu oluşturuldu: ${initialQuestions.length} soru`)
        return initialQuestions
      }
    }
  } catch (error) {
    logger.error('Soru havuzu yükleme hatası', error)
  }
  return []
}

export function saveQuestionsPool(questions: StoredQuestion[]): void {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
    logger.log(`✓ Soru havuzu kaydedildi: ${questions.length} soru -> ${QUESTIONS_FILE}`)
  } catch (error) {
    logger.error('Soru havuzu kaydetme hatası', error)
  }
}

export function addQuestionsToPool(newQuestions: StoredQuestion[]): StoredQuestion[] {
  const existing = loadQuestionsPool()
  const merged = [...existing]

  for (const newQ of newQuestions) {
    if (!merged.some((q) => q.question === newQ.question)) {
      merged.push(newQ)
    }
  }

  saveQuestionsPool(merged)
  return merged
}

export function getQuestionsPool(): StoredQuestion[] {
  return loadQuestionsPool()
}

export function clearQuestionsPool(): void {
  try {
    saveQuestionsPool([])
    logger.log('✓ Soru havuzu temizlendi')
  } catch (error) {
    logger.error('Soru havuzu temizleme hatası', error)
  }
}

export function deleteQuestionFromPool(questionId: string): boolean {
  try {
    const questions = loadQuestionsPool()
    const initialCount = questions.length
    const filtered = questions.filter(q => q.id !== questionId)
    
    if (filtered.length < initialCount) {
      saveQuestionsPool(filtered)
      logger.log(`✓ Soru silindi: ${questionId}`)
      return true
    } else {
      logger.warn(`Soru bulunamadı: ${questionId}`)
      return false
    }
  } catch (error) {
    logger.error('Soru silme hatası', error)
    return false
  }
}
