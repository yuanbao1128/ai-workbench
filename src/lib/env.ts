const requiredEnvVars = [
  'DATABASE_URL',
] as const

// Optional env vars (documented for reference)
export const OPTIONAL_ENV_VARS = [
  'ANTHROPIC_API_KEY',
  'AI_MODEL',
  'CRON_SECRET',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'VAPID_SUBJECT',
] as const

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && fallback === undefined) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value || fallback || ''
}