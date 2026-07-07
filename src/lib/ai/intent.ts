export type IntentType =
  | 'ADD_TERM'
  | 'ADD_DESIGN'
  | 'ADD_INSPIRATION'
  | 'ADD_MEETING'
  | 'ADD_QUESTION'
  | 'ADD_TODO'
  | 'ADD_DELEGATION'
  | 'QUERY'
  | 'GENERATE_REPORT'
  | 'UNKNOWN'

export interface IntentResult {
  intents: {
    type: IntentType
    confidence: number
    entities: Record<string, string | null>
  }[]
  originalMessage: string
}

export const INTENT_SYSTEM_PROMPT = `你是一个意图识别助手。分析用户的中文输入，返回 JSON 格式的意图识别结果。

支持的意图类型：
- ADD_TERM: 新增术语/名词（如"记一下K8s不懂"）
- ADD_DESIGN: 新增方案（如"登录页需要支持手机号验证码"）
- ADD_INSPIRATION: 新增灵感
- ADD_MEETING: 新增会议纪要
- ADD_QUESTION: 新增问题
- ADD_TODO: 新增任务/待办（如"今天要完成xxx"）
- ADD_DELEGATION: 新增委托（如"转给王工排查"）
- QUERY: 查询（如"矢量数据库什么意思？"、"今天有什么重点？"）
- GENERATE_REPORT: 生成报告（如"帮我写周报"、"生成今天日报"）
- UNKNOWN: 无法识别意图，自由对话

提取实体：
- title: 标题
- priority: 优先级（MUST/FOCUS/NORMAL）
- dueDate: 截止日期（相对于今天，如"今天"、"周三"、"明天"）
- assignee: 被委托人
- source: 来源
- followUpTime: 追问时间
- query: 查询内容
- reportType: 日报或周报

如果一个消息包含多个意图，返回所有意图。返回格式：
{
  "intents": [
    { "type": "ADD_TERM", "confidence": 0.95, "entities": { "title": "K8s" } }
  ]
}`

export function parseIntentResponse(text: string): IntentResult['intents'] {
  try {
    // Try to parse as JSON
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.intents) return parsed.intents
    return [{ type: 'UNKNOWN' as IntentType, confidence: 0, entities: {} }]
  } catch {
    // Fallback: simple keyword matching
    return keywordIntentMatch(text)
  }
}

function keywordIntentMatch(text: string): IntentResult['intents'] {
  if (text.includes('记一下') || text.includes('不懂') || text.includes('记个')) {
    return [{ type: 'ADD_TERM', confidence: 0.7, entities: { title: text.replace(/记一下|记个|不懂/g, '').trim() } }]
  }
  if (text.includes('完成') || text.includes('今天') || text.includes('TODO')) {
    return [{ type: 'ADD_TODO', confidence: 0.7, entities: { title: text } }]
  }
  if (text.includes('转给') || text.includes('排查')) {
    return [{ type: 'ADD_DELEGATION', confidence: 0.7, entities: { title: text } }]
  }
  if (text.includes('日报') || text.includes('周报') || text.includes('写周报')) {
    const reportType = text.includes('周报') ? '周报' : '日报'
    return [{ type: 'GENERATE_REPORT', confidence: 0.8, entities: { reportType } }]
  }
  if (text.includes('什么意思') || text.includes('什么是') || text.includes('重点')) {
    return [{ type: 'QUERY', confidence: 0.7, entities: { query: text } }]
  }
  return [{ type: 'UNKNOWN', confidence: 0.3, entities: {} }]
}