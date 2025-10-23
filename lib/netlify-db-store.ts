import { neon } from '@neondatabase/serverless'

interface StoredQuestion {
  id: string
  question: string
  answerAI: string
  answerHuman: string
  source: string
  originalQuestion?: string
  originalAnswer?: string
  isTranslated?: boolean
  createdAt?: Date
}

export class NetlifyDBStore {
  private sql: any

  constructor() {
    // Neon database connection using environment variable
    const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('Database connection string not found. Please set NETLIFY_DATABASE_URL or DATABASE_URL environment variable.')
    }
    this.sql = neon(connectionString)
  }

  /**
   * Veritabanı tablolarını oluştur (ilk kurulum için)
   */
  async initializeDatabase(): Promise<void> {
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS questions (
          id VARCHAR(255) PRIMARY KEY,
          question TEXT NOT NULL,
          answer_ai TEXT NOT NULL,
          answer_human TEXT NOT NULL,
          source VARCHAR(255) NOT NULL,
          original_question TEXT,
          original_answer TEXT,
          is_translated BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Index'ler ekle
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
        CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
      `
      
      console.log('✅ Netlify DB tabloları başarıyla oluşturuldu')
    } catch (error) {
      console.error('❌ Veritabanı başlatma hatası:', error)
      throw error
    }
  }

  async loadQuestionsPool(): Promise<StoredQuestion[]> {
    try {
      const result = await this.sql`
        SELECT 
          id,
          question,
          answer_ai as "answerAI",
          answer_human as "answerHuman",
          source,
          original_question as "originalQuestion",
          original_answer as "originalAnswer",
          is_translated as "isTranslated",
          created_at as "createdAt"
        FROM questions 
        ORDER BY created_at DESC
      `
      
      console.log(`✅ Netlify DB'den ${result.length} soru yüklendi`)
      return result
    } catch (error) {
      console.error('❌ Netlify DB okuma hatası:', error)
      return []
    }
  }

  async saveQuestionsPool(questions: StoredQuestion[]): Promise<void> {
    try {
      // Önce tüm soruları sil
      await this.sql`DELETE FROM questions`
      
      // Yeni soruları ekle
      for (const q of questions) {
        await this.sql`
          INSERT INTO questions (
            id, question, answer_ai, answer_human, source,
            original_question, original_answer, is_translated
          ) VALUES (
            ${q.id}, ${q.question}, ${q.answerAI}, ${q.answerHuman}, ${q.source},
            ${q.originalQuestion || null}, ${q.originalAnswer || null}, ${q.isTranslated || false}
          )
        `
      }
      
      console.log(`✅ Netlify DB'ye ${questions.length} soru kaydedildi`)
    } catch (error) {
      console.error('❌ Netlify DB kaydetme hatası:', error)
      throw error
    }
  }

  async addQuestionsToPool(newQuestions: StoredQuestion[]): Promise<StoredQuestion[]> {
    try {
      // Mevcut soruları kontrol et ve sadece yenilerini ekle
      for (const newQ of newQuestions) {
        const existing = await this.sql`
          SELECT id FROM questions WHERE question = ${newQ.question} LIMIT 1
        `
        
        if (existing.length === 0) {
          await this.sql`
            INSERT INTO questions (
              id, question, answer_ai, answer_human, source,
              original_question, original_answer, is_translated
            ) VALUES (
              ${newQ.id}, ${newQ.question}, ${newQ.answerAI}, ${newQ.answerHuman}, ${newQ.source},
              ${newQ.originalQuestion || null}, ${newQ.originalAnswer || null}, ${newQ.isTranslated || false}
            )
          `
        }
      }
      
      // Güncel listeyi döndür
      return await this.loadQuestionsPool()
    } catch (error) {
      console.error('❌ Netlify DB ekleme hatası:', error)
      throw error
    }
  }

  async clearQuestionsPool(): Promise<void> {
    try {
      await this.sql`DELETE FROM questions`
      console.log('✅ Netlify DB soru havuzu temizlendi')
    } catch (error) {
      console.error('❌ Netlify DB temizleme hatası:', error)
      throw error
    }
  }

  async deleteQuestionFromPool(questionId: string): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM questions WHERE id = ${questionId}
      `
      
      if (result.count > 0) {
        console.log(`✅ Soru silindi: ${questionId}`)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Netlify DB silme hatası:', error)
      return false
    }
  }

  /**
   * Soru istatistikleri
   */
  async getQuestionStats(): Promise<{
    total: number
    bySource: Record<string, number>
    translated: number
  }> {
    try {
      const [totalResult, sourceResult, translatedResult] = await Promise.all([
        this.sql`SELECT COUNT(*) as count FROM questions`,
        this.sql`SELECT source, COUNT(*) as count FROM questions GROUP BY source`,
        this.sql`SELECT COUNT(*) as count FROM questions WHERE is_translated = true`
      ])

      const bySource: Record<string, number> = {}
      sourceResult.forEach((row: any) => {
        bySource[row.source] = parseInt(row.count)
      })

      return {
        total: parseInt(totalResult[0].count),
        bySource,
        translated: parseInt(translatedResult[0].count)
      }
    } catch (error) {
      console.error('❌ İstatistik hatası:', error)
      return { total: 0, bySource: {}, translated: 0 }
    }
  }
}

export const netlifyDBStore = new NetlifyDBStore()
