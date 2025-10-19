import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { checkRateLimit, getClientIP } from '../../../lib/rate-limiter'

interface LoginResponse {
  success: boolean
  message?: string
  sessionToken?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { adminKey } = req.body
    const clientIP = getClientIP(req)

    // Check rate limit (5 attempts per 15 minutes per IP)
    const rateLimit = checkRateLimit(`admin-login:${clientIP}`, 5, 15 * 60 * 1000)
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.'
      })
    }

    // Verify admin key
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return res.status(401).json({
        success: false,
        message: 'Geçersiz admin anahtarı'
      })
    }

    // Generate secure session token
    const sessionData = {
      timestamp: Date.now(),
      adminId: 'admin',
      hash: crypto.randomBytes(32).toString('hex')
    }

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    res.status(200).json({
      success: true,
      sessionToken: sessionToken
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    })
  }
}

// Helper function for delay (to prevent timing attacks)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
