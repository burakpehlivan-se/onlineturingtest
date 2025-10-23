import { NextApiRequest, NextApiResponse } from 'next'
import { databaseAdapter } from '../../../lib/database-adapter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { adminKey } = req.body

    // Admin key kontrolü
    const expectedKey = process.env.ADMIN_KEY || 'admin123'
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(401).json({ success: false, message: 'Geçersiz admin key' })
    }

    // Veritabanını başlat
    await databaseAdapter.initializeDatabase()
    
    const provider = databaseAdapter.getProvider()

    return res.status(200).json({
      success: true,
      message: `Veritabanı başarıyla başlatıldı (${provider})`,
      provider: provider
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return res.status(500).json({
      success: false,
      message: 'Veritabanı başlatılırken hata oluştu'
    })
  }
}
