import fs from 'fs'
import path from 'path'
import { logger } from './production-logger'

// Redis import (optional)
let redis: any = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require('@upstash/redis')
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('✅ Redis connection initialized')
  }
} catch (error) {
  console.log('⚠️ Redis not available, using file storage')
}

// Netlify Functions için persistent path kullan
const QUESTIONS_FILE = process.env.NETLIFY 
  ? path.join(process.cwd(), '.questions-pool.json')  // Netlify'da da persistent path
  : path.join(process.cwd(), '.questions-pool.json')

const REDIS_KEY = 'questions-pool'

export interface StoredQuestion {
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

export async function loadQuestionsPool(): Promise<StoredQuestion[]> {
  try {
    // Redis'i önce dene (Persistent storage)
    if (redis) {
      try {
        const data = await redis.get(REDIS_KEY)
        if (data && Array.isArray(data)) {
          logger.log(`✓ Redis'ten soru havuzu yüklendi: ${data.length} soru`)
          return data
        }
      } catch (redisError) {
        console.log('⚠️ Redis okuma hatası:', redisError)
      }
    }

    // Netlify'da dosya sistemi persistent değil - Redis kullanılmalı
    if (process.env.NETLIFY) {
      logger.warn('⚠️ Netlify ortamında Redis yapılandırması gerekli!')
      logger.warn('UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN environment variables\'ları ayarlayın')
      return []
    }

    // Local development için dosya sistemi
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      logger.log(`✓ Dosyadan soru havuzu yüklendi: ${parsed.length} soru`)
      
      // Redis'e de kaydet (sync için)
      if (redis && parsed.length > 0) {
        try {
          await redis.set(REDIS_KEY, parsed)
          console.log('✅ Sorular Redis\'e senkronize edildi')
        } catch (syncError) {
          console.log('⚠️ Redis senkronizasyon hatası:', syncError)
        }
      }
      
      return parsed
    } else {
      logger.warn(`Soru havuzu dosyası bulunamadı: ${QUESTIONS_FILE}`)
      logger.log(`Boş soru havuzu ile başlatılıyor - manuel soru ekleme gerekli`)
      return []
    }
  } catch (error) {
    logger.error('Soru havuzu yükleme hatası', error)
  }
  return []
}

export async function saveQuestionsPool(questions: StoredQuestion[]): Promise<void> {
  try {
    console.log(`🔍 Questions Store - Saving ${questions.length} questions`)
    
    // Redis'e kaydet
    if (redis) {
      try {
        await redis.set(REDIS_KEY, questions)
        console.log(`✅ Questions Store - Redis'e kaydedildi: ${questions.length} soru`)
        logger.log(`✓ Soru havuzu Redis'e kaydedildi: ${questions.length} soru`)
      } catch (redisError) {
        console.error('❌ Redis kaydetme hatası:', redisError)
      }
    }
    
    // Dosya sistemine de kaydet (backup)
    console.log(`🔍 Questions Store - Saving to file: ${QUESTIONS_FILE}`)
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

export async function addQuestionsToPool(newQuestions: StoredQuestion[]): Promise<StoredQuestion[]> {
  const existing = await loadQuestionsPool()
  const merged = [...existing]

  for (const newQ of newQuestions) {
    if (!merged.some((q) => q.question === newQ.question)) {
      merged.push(newQ)
    }
  }

  await saveQuestionsPool(merged)
  return merged
}

export async function getQuestionsPool(): Promise<StoredQuestion[]> {
  return await loadQuestionsPool()
}

export async function clearQuestionsPool(): Promise<void> {
  try {
    await saveQuestionsPool([])
    logger.log('✓ Soru havuzu temizlendi')
  } catch (error) {
    logger.error('Soru havuzu temizleme hatası', error)
  }
}

export async function deleteQuestionFromPool(questionId: string): Promise<boolean> {
  try {
    const questions = await loadQuestionsPool()
    const initialCount = questions.length
    const filtered = questions.filter((q: StoredQuestion) => q.id !== questionId)
    
    if (filtered.length < initialCount) {
      await saveQuestionsPool(filtered)
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
