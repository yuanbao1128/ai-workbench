import { describe, it, expect } from 'vitest'

describe('Anthropic SDK Configuration', () => {
  it('should have @anthropic-ai/sdk as a dependency', () => {
    const pkg = require('../package.json')
    expect(pkg.dependencies).toHaveProperty('@anthropic-ai/sdk')
  })

  it('should export getAnthropicClient function', async () => {
    const mod = await import('../src/lib/ai/client')
    expect(typeof mod.getAnthropicClient).toBe('function')
  })

  it('should export streamChat function', async () => {
    const mod = await import('../src/lib/ai/client')
    expect(typeof mod.streamChat).toBe('function')
  })

  it('should export chat function', async () => {
    const mod = await import('../src/lib/ai/client')
    expect(typeof mod.chat).toBe('function')
  })
})