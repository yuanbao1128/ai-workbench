import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/ai/client'
import { parseIntentResponse, IntentType } from '@/lib/ai/intent'
import { routeIntent } from '@/lib/ai/router'

const SYSTEM_PROMPT = `你是一个意图识别助手。分析用户的中文输入，返回 JSON 格式的意图识别结果。

支持的意图类型：
- ADD_TERM: 新增术语/名词
- ADD_DESIGN: 新增方案
- ADD_INSPIRATION: 新增灵感
- ADD_MEETING: 新增会议纪要
- ADD_QUESTION: 新增问题
- ADD_TODO: 新增任务/待办
- ADD_DELEGATION: 新增委托
- QUERY: 查询知识库或今日概览
- GENERATE_REPORT: 生成日报或周报
- UNKNOWN: 无法识别意图

提取实体字段：title, content, priority, dueDate, assignee, source, followUpTime, query, reportType

返回格式（必须是纯 JSON）：
{"intents":[{"type":"ADD_TERM","confidence":0.95,"entities":{"title":"K8s"}}]}`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if ANTHROPIC_API_KEY is configured
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY

    let intents: { type: IntentType; confidence: number; entities: Record<string, string | null> }[]

    if (hasApiKey) {
      try {
        const response = await chat(
          [{ role: 'user', content: message }],
          SYSTEM_PROMPT
        )

        const text = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as { type: 'text'; text: string }).text)
          .join('\n')

        intents = parseIntentResponse(text)
      } catch {
        // Fallback to keyword matching
        const { parseIntentResponse: parse } = await import('@/lib/ai/intent')
        intents = parse(message)
      }
    } else {
      // No API key: use keyword matching
      const { parseIntentResponse } = await import('@/lib/ai/intent')
      intents = parseIntentResponse(message)
    }

    // Execute all intents
    const results = []
    for (const intent of intents) {
      const result = await routeIntent(intent.type, intent.entities)
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
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'AI 服务暂时不可用，请稍后重试' },
      { status: 500 }
    )
  }
}