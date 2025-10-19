import type { NextApiRequest, NextApiResponse } from 'next'

interface TestResponse {
  success: boolean
  message: string
  response?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'OPENROUTER_API_KEY not found in environment variables'
      })
    }

    console.log('🔍 Testing OpenRouter API connection...')
    console.log('API Key:', apiKey.substring(0, 20) + '...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Online Turing Test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message. Please respond with "Test successful!"'
          }
        ]
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      
      return res.status(response.status).json({
        success: false,
        message: `OpenRouter API error: ${response.status} ${response.statusText}`,
        error: errorText
      })
    }

    const data = await response.json()
    console.log('API Response:', data)

    const aiResponse = data.choices?.[0]?.message?.content || 'No response content'

    return res.status(200).json({
      success: true,
      message: 'OpenRouter API connection successful!',
      response: aiResponse
    })

  } catch (error) {
    console.error('Test error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
