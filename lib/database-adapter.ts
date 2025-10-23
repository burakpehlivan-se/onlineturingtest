/**
 * Database Adapter - Farklı storage çözümleri arasında geçiş yapmak için
 * Redis, Netlify DB, veya dosya sistemi kullanabilir
 */

import { StoredQuestion } from './questions-store'

// Storage providers
import * as questionsStore from './questions-store' // Redis + File
import { netlifyDBStore } from './netlify-db-store' // Netlify DB (Neon)

type StorageProvider = 'redis' | 'netlify-db' | 'file'

class DatabaseAdapter {
  private provider: StorageProvider

  constructor() {
    // Otomatik provider seçimi
    this.provider = this.detectProvider()
    console.log(`🔧 Database Adapter: ${this.provider} provider kullanılıyor`)
  }

  private detectProvider(): StorageProvider {
    // Netlify DB varsa onu kullan (yeni Netlify DB otomatik env var)
    if (process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL) {
      return 'netlify-db'
    }
    
    // Redis varsa onu kullan
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return 'redis'
    }
    
    // Fallback: dosya sistemi
    return 'file'
  }

  async loadQuestionsPool(): Promise<StoredQuestion[]> {
    switch (this.provider) {
      case 'netlify-db':
        return await netlifyDBStore.loadQuestionsPool()
      case 'redis':
      case 'file':
      default:
        return await questionsStore.loadQuestionsPool()
    }
  }

  async saveQuestionsPool(questions: StoredQuestion[]): Promise<void> {
    switch (this.provider) {
      case 'netlify-db':
        return await netlifyDBStore.saveQuestionsPool(questions)
      case 'redis':
      case 'file':
      default:
        return await questionsStore.saveQuestionsPool(questions)
    }
  }

  async addQuestionsToPool(newQuestions: StoredQuestion[]): Promise<StoredQuestion[]> {
    switch (this.provider) {
      case 'netlify-db':
        return await netlifyDBStore.addQuestionsToPool(newQuestions)
      case 'redis':
      case 'file':
      default:
        return await questionsStore.addQuestionsToPool(newQuestions)
    }
  }

  async clearQuestionsPool(): Promise<void> {
    switch (this.provider) {
      case 'netlify-db':
        return await netlifyDBStore.clearQuestionsPool()
      case 'redis':
      case 'file':
      default:
        return await questionsStore.clearQuestionsPool()
    }
  }

  async deleteQuestionFromPool(questionId: string): Promise<boolean> {
    switch (this.provider) {
      case 'netlify-db':
        return await netlifyDBStore.deleteQuestionFromPool(questionId)
      case 'redis':
      case 'file':
      default:
        return await questionsStore.deleteQuestionFromPool(questionId)
    }
  }

  async getQuestionsPool(): Promise<StoredQuestion[]> {
    return await this.loadQuestionsPool()
  }

  /**
   * Veritabanını başlat (sadece Netlify DB için gerekli)
   */
  async initializeDatabase(): Promise<void> {
    if (this.provider === 'netlify-db') {
      await netlifyDBStore.initializeDatabase()
    }
  }

  /**
   * Provider bilgisini döndür
   */
  getProvider(): StorageProvider {
    return this.provider
  }
}

export const databaseAdapter = new DatabaseAdapter()
export type { StorageProvider }
