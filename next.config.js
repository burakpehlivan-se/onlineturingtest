/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Netlify deployment settings
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  
  // Security headers
  async headers() {
    return [
      {
        // Protect sensitive JSON files
        source: '/.questions-pool.json',
        headers: [
          { key: 'x-robots-tag', value: 'noindex' },
          { key: 'Cache-Control', value: 'no-store' }
        ]
      },
      {
        source: '/.game-sessions.json', 
        headers: [
          { key: 'x-robots-tag', value: 'noindex' },
          { key: 'Cache-Control', value: 'no-store' }
        ]
      },
      {
        // Extra security for admin routes
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }
        ]
      },
      {
        // Security headers for all pages
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
        ]
      }
    ]
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  }
}

module.exports = nextConfig
