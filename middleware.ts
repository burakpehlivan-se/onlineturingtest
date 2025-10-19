import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Admin panel protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user has admin session
    const adminSession = request.cookies.get('admin-session')
    
    // If no session, redirect to login
    if (!adminSession) {
      const loginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verify session validity (basic check)
    try {
      const sessionData = JSON.parse(adminSession.value)
      const now = Date.now()
      
      // Check if session expired (24 hours)
      if (now - sessionData.timestamp > 24 * 60 * 60 * 1000) {
        const response = NextResponse.redirect(new URL('/admin-login', request.url))
        response.cookies.delete('admin-session')
        return response
      }
    } catch {
      // Invalid session format
      const response = NextResponse.redirect(new URL('/admin-login', request.url))
      response.cookies.delete('admin-session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
