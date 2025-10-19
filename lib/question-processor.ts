import fs from 'fs'
import path from 'path'
import { openRouterService } from './openrouter-service'
import { addQuestionsToPool } from './questions-store'
import { logger } from './production-logger'

interface OriginalQuestion {
  question_title: string
  best_answer: string
}

interface ProcessedQuestion {
  id: string
  question: string
  answerAI: string
  answerHuman: string
  source: string
  originalQuestion: string
  originalAnswer: string
  isTranslated: boolean
}

export class QuestionProcessor {
  private originalDataPath: string

  constructor() {
    // Use demo questions if main file doesn't exist (for Netlify deployment)
    const mainFile = path.join(process.cwd(), 'filtrelenmis_soru_cevaplar.json')
    const demoFile = path.join(process.cwd(), 'demo-questions.json')
    
    this.originalDataPath = fs.existsSync(mainFile) ? mainFile : demoFile
  }

  /**
   * Büyük JSON dosyasından rastgele bir soru seçer
   */
  private async selectRandomQuestion(): Promise<OriginalQuestion> {
    try {
      // Dosya çok büyük olduğu için streaming okuma yapabiliriz
      // Şimdilik basit bir yaklaşım kullanıyorum
      const data = fs.readFileSync(this.originalDataPath, 'utf-8')
      
      // Her satır bir JSON objesi olduğunu varsayıyorum
      const lines = data.trim().split('\n')
      const randomIndex = Math.floor(Math.random() * lines.length)
      const randomLine = lines[randomIndex]
      
      const question: OriginalQuestion = JSON.parse(randomLine)
      
      logger.log(`📝 Seçilen soru: ${question.question_title.substring(0, 50)}...`)
      return question
      
    } catch (error) {
      logger.error('Soru seçme hatası', error)
      throw new Error('Failed to select random question')
    }
  }

  /**
   * Ana işleme pipeline'ı
   */
  async processNewQuestion(): Promise<ProcessedQuestion> {
    try {
      logger.log('🚀 Yeni soru işleme başlıyor...')
      
      // 1. Rastgele soru seç
      const originalQuestion = await this.selectRandomQuestion()
      
      // 2. Soruyu ve cevabı Türkçeye çevir
      logger.log('🔄 Çeviri yapılıyor...')
      const translation = await openRouterService.translateQuestionAndAnswer(
        originalQuestion.question_title,
        originalQuestion.best_answer
      )
      
      // 3. AI cevabı üret
      logger.log('🤖 AI cevabı üretiliyor...')
      const aiAnswer = await openRouterService.generateAIAnswer(translation.trSoru)
      
      // 4. Benzersiz ID oluştur
      const questionId = `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      
      const processedQuestion: ProcessedQuestion = {
        id: questionId,
        question: translation.trSoru,
        answerAI: aiAnswer.trAICevap,
        answerHuman: translation.trInsanCevap,
        source: 'Yahoo Answers (Translated)',
        originalQuestion: originalQuestion.question_title,
        originalAnswer: originalQuestion.best_answer,
        isTranslated: true
      }
      
      logger.log('🎉 SORU İŞLEME TAMAMLANDI!')
      
      return processedQuestion
      
    } catch (error) {
      logger.error('Soru işleme hatası', error)
      throw error
    }
  }

  /**
   * Birden fazla soru işler ve havuza ekler
   */
  async processBatchQuestions(count: number = 1): Promise<void> {
    logger.log(`📦 ${count} adet soru işlenecek...`)
    
    const processedQuestions: ProcessedQuestion[] = []
    
    for (let i = 0; i < count; i++) {
      try {
        logger.log(`--- Soru ${i + 1}/${count} ---`)
        const processed = await this.processNewQuestion()
        processedQuestions.push(processed)
        
        // API rate limiting için kısa bekleme
        if (i < count - 1) {
          logger.log('⏳ API rate limiting için 2 saniye bekleniyor...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error) {
        logger.error(`Soru ${i + 1} işlenirken hata`, error)
        // Hata durumunda devam et
      }
    }
    
    if (processedQuestions.length > 0) {
      // Havuza ekle
      addQuestionsToPool(processedQuestions)
      logger.log(`🎉 ${processedQuestions.length} soru başarıyla havuza eklendi!`)
    } else {
      logger.warn('Hiçbir soru işlenemedi.')
    }
  }
}

export const questionProcessor = new QuestionProcessor()
