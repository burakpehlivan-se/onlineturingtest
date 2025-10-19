import { NextApiRequest, NextApiResponse } from 'next'

interface TestResponse {
  success: boolean
  message: string
  adminKeyValid?: boolean
  environment?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true, message: 'CORS preflight OK' })
    return
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Admin test endpoint is working',
      environment: process.env.NODE_ENV || 'development'
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { adminKey } = req.body

    // Admin key kontrolü
    const expectedKey = process.env.ADMIN_KEY
    const isValid = adminKey && adminKey === expectedKey

    return res.status(200).json({
      success: true,
      message: isValid ? 'Admin key is valid' : 'Admin key is invalid',
      adminKeyValid: isValid,
      environment: process.env.NODE_ENV || 'development'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + (error as Error).message
    })
  }
}
