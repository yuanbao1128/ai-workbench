import { describe, it, expect } from 'vitest'

describe('Anthropic SDK Configuration', () => {
  it('should have @anthropic-ai/sdk as a dependency', () => {
    const pkg = require('../package.json')
    expect(pkg.dependencies).toHaveProperty('@anthropic-ai/sdk')
  })

  it('should export getAIClient function', async () => {
    const mod = await import('../src/lib/ai/client')
    expect(typeof mod.getAIClient).toBe('function')
  })

  it('should export chat function', async () => {
    const mod = await import('../src/lib/ai/client')
    expect(typeof mod.chat).toBe('function')
  })
})