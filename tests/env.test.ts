import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateEnv, getEnv } from '../src/lib/env'

describe('Environment Variables', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should validate required env vars', () => {
    vi.stubEnv('DATABASE_URL', 'file:./dev.db')
    const result = validateEnv()
    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('should report missing required env vars', () => {
    vi.stubEnv('DATABASE_URL', undefined)
    const result = validateEnv()
    expect(result.valid).toBe(false)
    expect(result.missing).toContain('DATABASE_URL')
  })

  it('should return env value with getEnv', () => {
    vi.stubEnv('TEST_VAR', 'test-value')
    expect(getEnv('TEST_VAR')).toBe('test-value')
  })

  it('should return fallback when env var is missing', () => {
    vi.stubEnv('TEST_VAR', undefined)
    expect(getEnv('TEST_VAR', 'fallback')).toBe('fallback')
  })
})