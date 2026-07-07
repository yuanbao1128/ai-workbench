import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export async function streamChat(
  messages: Anthropic.Messages.MessageParam[],
  systemPrompt?: string
): Promise<AsyncIterable<Anthropic.Messages.RawMessageStreamEvent>> {
  const anthropic = getAnthropicClient()
  return anthropic.messages.stream({
    model: process.env.AI_MODEL || 'claude-sonnet-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  })
}

export async function chat(
  messages: Anthropic.Messages.MessageParam[],
  systemPrompt?: string
): Promise<Anthropic.Messages.Message> {
  const anthropic = getAnthropicClient()
  return anthropic.messages.create({
    model: process.env.AI_MODEL || 'claude-sonnet-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  })
}