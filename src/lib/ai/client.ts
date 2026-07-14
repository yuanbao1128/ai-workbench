import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type AIProvider = 'anthropic' | 'openai' | 'custom'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
  baseUrl?: string
}

function getConfigFromEnv(): Partial<AIConfig> {
  return {
    provider: (process.env.AI_PROVIDER as AIProvider) || 'anthropic',
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    model: process.env.AI_MODEL,
    baseUrl: process.env.AI_BASE_URL,
  }
}

export function getAIClient(config?: Partial<AIConfig>) {
  const envConfig = getConfigFromEnv()
  const finalConfig = { ...envConfig, ...config }
  const provider = finalConfig.provider || 'anthropic'
  const apiKey = finalConfig.apiKey || envConfig.apiKey || ''

  if (provider === 'openai') {
    return new OpenAI({
      apiKey,
      baseURL: finalConfig.baseUrl,
    })
  }

  if (provider === 'anthropic') {
    return new Anthropic({ apiKey })
  }

  // Custom provider - use OpenAI-compatible format
  return new OpenAI({
    apiKey,
    baseURL: finalConfig.baseUrl,
  })
}

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt?: string,
  config?: Partial<AIConfig>
) {
  const envConfig = getConfigFromEnv()
  const finalConfig = { ...envConfig, ...config }
  const provider = finalConfig.provider || 'anthropic'

  if (provider === 'openai' || provider === 'custom') {
    const openai = getAIClient(finalConfig) as OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const response = await openai.chat.completions.create({
      model: finalConfig.model || 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 4096,
    })

    return {
      content: [{ type: 'text' as const, text: response.choices[0]?.message?.content || '' }],
    }
  }

  const anthropic = getAIClient(finalConfig) as Anthropic
  const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  return anthropic.messages.create({
    model: finalConfig.model || 'claude-sonnet-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages: anthropicMessages,
  })
}