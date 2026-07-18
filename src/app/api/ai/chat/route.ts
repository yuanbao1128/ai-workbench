import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/ai/client'
import { parseIntentResponse, IntentType, INTENT_SYSTEM_PROMPT, preprocessUserInput } from '@/lib/ai/intent'
import { routeIntent } from '@/lib/ai/router'
import { prisma } from '@/lib/db'
import { AIProvider } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

async function loadAISettings() {
  const settings = await prisma.setting.findUnique({
    where: { id: 'app-settings' },
  })

  if (!settings || !settings.apiKey) {
    return null
  }

  return {
    provider: settings.apiProvider as AIProvider,
    apiKey: settings.apiKey,
    model: settings.model,
    baseUrl: settings.baseUrl || undefined,
  }
}

function hasApiKey(): boolean {
  const provider = process.env.AI_PROVIDER || 'anthropic'
  if (provider === 'openai') return !!process.env.OPENAI_API_KEY
  if (provider === 'custom') return !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY
  return !!process.env.ANTHROPIC_API_KEY
}

function getFirstText(content: unknown[]): string {
  if (!Array.isArray(content)) return ''
  return content
    .filter((block): block is { type: string; text: string } => {
      return typeof block === 'object' && block !== null && 'type' in block && 'text' in block
    })
    .map((block) => block.text)
    .join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Load settings from database
    const dbSettings = await loadAISettings()
    const hasEnvKey = hasApiKey()

    let intents: { type: IntentType; confidence: number; entities: Record<string, string | null> }[]

    // Pre-process: normalize English terms & extract relative dates
    const preprocessed = preprocessUserInput(message)
    const llmMessage = preprocessed.cleaned || message

    if (dbSettings || hasEnvKey) {
      try {
        const config = dbSettings || undefined
        const response = await chat(
          [{ role: 'user', content: llmMessage }],
          INTENT_SYSTEM_PROMPT,
          config
        )

        const text = getFirstText(response.content)
        intents = parseIntentResponse(text)
      } catch {
        // Fallback to keyword matching (uses pre-cleaned text)
        intents = parseIntentResponse(llmMessage)
      }
    } else {
      // No API key: use keyword matching with pre-cleaned text
      intents = parseIntentResponse(llmMessage)
    }

    // Enrich intents with pre-extracted relative dates when LLM missed them
    intents = intents.map((i) => {
      if (preprocessed.relativeDueDate && !i.entities?.dueDate) {
        return {
          ...i,
          entities: { ...(i.entities ?? {}), dueDate: preprocessed.relativeDueDate },
        }
      }
      return i
    })

    // Execute all intents (in sequence, with idempotency protection)
    const results = []
    for (const intent of intents) {
      const result = await routeIntent(intent.type, intent.entities, message)
      results.push({
        type: intent.type,
        confidence: intent.confidence,
        ...result,
      })
    }

    return NextResponse.json({
      intents,
      results,
      message: results.map((r) => r.message).join('\n'),
      normalized: {
        cleaned: preprocessed.cleaned,
        replacements: preprocessed.replacements,
        detectedDueDate: preprocessed.relativeDueDate,
      },
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'AI 服务暂时不可用，请稍后重试' },
      { status: 500 }
    )
  }
}