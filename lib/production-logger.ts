// Production-safe logging utility
// In production, sensitive logs are disabled to prevent information leakage

const isProduction = process.env.NODE_ENV === 'production'

export const logger = {
  // Safe logging - only logs in development
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args)
    }
  },

  // Error logging - always logs but sanitizes in production
  error: (message: string, error?: any) => {
    if (isProduction) {
      // In production, log generic error without sensitive details
      console.error(`Error: ${message}`)
    } else {
      console.error(`Error: ${message}`, error)
    }
  },

  // Warning logging - always logs but sanitizes in production
  warn: (message: string) => {
    if (isProduction) {
      console.warn(`Warning: ${message}`)
    } else {
      console.warn(`⚠️ ${message}`)
    }
  },

  // Info logging - only in development
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args)
    }
  }
}

// Backward compatibility exports
export const log = logger.log
export const logError = logger.error
export const logWarn = logger.warn
export const logInfo = logger.info
