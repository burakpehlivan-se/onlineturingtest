// Simple in-memory rate limiter for admin routes
// In production, consider using Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier)
  }

  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry) {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }

  if (currentEntry.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime
    }
  }

  // Increment count
  currentEntry.count++
  rateLimitStore.set(identifier, currentEntry)

  return {
    allowed: true,
    remaining: maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime
  }
}

// Get client IP address from request
export function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
  
  return ip
}
