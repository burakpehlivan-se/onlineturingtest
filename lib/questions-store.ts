import fs from 'fs'
import path from 'path'
import { logger } from './production-logger'

// Netlify Functions için /tmp dizini kullan (yazılabilir)
const QUESTIONS_FILE = process.env.NETLIFY 
  ? '/tmp/.questions-pool.json' 
  : path.join(process.cwd(), '.questions-pool.json')

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
      
      // Demo soruların otomatik yüklenmesini devre dışı bırak
      // Artık boş havuzla başla, manuel soru ekleme gerekli
      logger.log(`Boş soru havuzu ile başlatılıyor - manuel soru ekleme gerekli`)
      return []
    }
  } catch (error) {
    logger.error('Soru havuzu yükleme hatası', error)
  }
  return []
}

export function saveQuestionsPool(questions: StoredQuestion[]): void {
  try {
    console.log(`🔍 Questions Store - Saving to: ${QUESTIONS_FILE}`)
    console.log(`🔍 Questions Store - Saving ${questions.length} questions`)
    
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
    
    // Verify write was successful
    if (fs.existsSync(QUESTIONS_FILE)) {
      const fileSize = fs.statSync(QUESTIONS_FILE).size
      console.log(`✅ Questions Store - File written successfully, size: ${fileSize} bytes`)
    } else {
      console.error(`❌ Questions Store - File not found after write!`)
    }
    
    logger.log(`✓ Soru havuzu kaydedildi: ${questions.length} soru`)
  } catch (error) {
    console.error('❌ Questions Store - Save error:', error)
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
