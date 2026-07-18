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

export const INTENT_SYSTEM_PROMPT = `你是一个意图识别助手。分析用户的中文或中英混合输入，返回 JSON 格式的意图识别结果。

支持的意图类型：
- ADD_TERM: 新增术语/名词（如"记一下K8s不懂"、"log K8s"、"jot down Vector DB"）
- ADD_DESIGN: 新增方案（如"登录页需要支持手机号验证码"）
- ADD_INSPIRATION: 新增灵感（如"灵感：把设置页改成向导式"）
- ADD_MEETING: 新增会议纪要（如"记会议"、"meeting note"、"standup 要点"）
- ADD_QUESTION: 新增问题（如"为什么首页加载慢"、"待解决：接口超时"）
- ADD_TODO: 新增任务/待办（如"今天要完成xxx"、"todo"、"add task"）
- ADD_DELEGATION: 新增委托（如"转给王工排查"、"delegate to 张工"、"followup @王工"）
- QUERY: 查询（如"矢量数据库什么意思？"、"今天有什么重点？"、"what is K8s"）
- GENERATE_REPORT: 生成报告（如"帮我写周报"、"生成今天日报"、"weekly report"）
- UNKNOWN: 无法识别意图，自由对话

实体提取：
- title: 标题（核心名词短语，不含引导语）
- content: 详细内容或描述
- priority: MUST / FOCUS / NORMAL。中文"紧急/重要"=MUST，"关注"=FOCUS
- dueDate: ISO 8601 字符串，相对日期必须转换为绝对时间（"明天上午10点" → 计算成具体日期时间）
- assignee: 被委托人姓名（如"转给王工" → "王工"）
- source: 来源（链接、参考文档等）
- followUpTime: 追问时间（ISO 8601）
- recurrence: "每天"=daily, "每周"=weekly, "每月"=monthly, 默认 none
- remindBefore: 提前提醒时间（ISO 8601，相对于 dueDate）
- query: 查询内容
- reportType: 日报/周报

单条消息可能包含多个意图，必须全部返回：
"记一下 K8s 不要懂；明天下午3点王工汇报"
→ 返回 [
  { type: ADD_TERM, entities: { title: "K8s 不要懂" } },
  { type: ADD_MEETING, entities: { title: "王工汇报", dueDate: <明天下午3点的 ISO> } }
]

返回格式（必须是合法 JSON，不要用反引号包裹）：
{
  "intents": [
    { "type": "ADD_TERM", "confidence": 0.95, "entities": { "title": "K8s" } }
  ]
}

置信度（confidence）指导：
- 0.95+ : 明确无歧义
- 0.7-0.9 : 大概率正确
- 0.4-0.7 : 模糊，请用户确认
- <0.4 : UNKNOWN，回到通用对话

注意：
- 用户可能用口语、夹杂英文（已在前处理阶段归一化，但仍可能出现未覆盖的英文术语）
- "记一下"、"提醒我"、"todo"、"task" 等同义表达都识别为 ADD_TODO 或 ADD_TERM
- 中英保留原样，不要翻译 title 中是英文的专有名词`

export function parseIntentResponse(text: string): IntentResult['intents'] {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed && Array.isArray(parsed.intents)) {
      return parsed.intents
    }
    return [{ type: 'UNKNOWN' as IntentType, confidence: 0, entities: {} }]
  } catch {
    return keywordIntentMatch(text)
  }
}

import { normalizeVoiceText } from '@/lib/voice/term-dict'
import { extractDueDate } from '@/lib/chat/relative-date'

/**
 * Pre-process raw user input (including voice transcription) into an
 * LLM-friendly form. Returns both the cleaned text and the original for
 * debugging / fallback.
 */
export function preprocessUserInput(raw: string): {
  cleaned: string
  replacements: { from: string; to: string }[]
  relativeDueDate: string | null
} {
  const norm = normalizeVoiceText(raw)
  const due = extractDueDate(raw)
  return {
    cleaned: norm.text,
    replacements: norm.replacements,
    relativeDueDate: due,
  }
}

export function keywordIntentMatch(text: string): IntentResult['intents'] {
  // 顺序很重要: 先匹配具体的领域（会议/委托/报告等），再匹配通用（记/TODO）
  // 否则"meeting note"会被"note"抢先匹配成 ADD_TERM
  const lowered = text.toLowerCase()

  if (/(?:会议|meeting|standup|纪要|评审|对齐|汇报)/.test(text)) {
    return [{ type: 'ADD_MEETING', confidence: 0.7, entities: { title: text } }]
  }
  if (/(?:转给|转委托|delegate|assign to|让.{0,3}处理|让.{0,3}排查|让.{0,3}看下)/.test(text)) {
    return [
      {
        type: 'ADD_DELEGATION',
        confidence: 0.6,
        entities: { title: text, assignee: null },
      },
    ]
  }
  if (/(?:灵感|idea|i have an idea|突然想到)/.test(text)) {
    return [{ type: 'ADD_INSPIRATION', confidence: 0.6, entities: { title: text } }]
  }
  if (/(?:方案|design|设计稿|原型)/.test(text)) {
    return [{ type: 'ADD_DESIGN', confidence: 0.6, entities: { title: text } }]
  }
  if (/(?:写周报|生成.{0,3}日报|周报|日报|weekly|daily report)/.test(text)) {
    const reportType = /周报|weekly/i.test(text) ? '周报' : '日报'
    return [{ type: 'GENERATE_REPORT', confidence: 0.75, entities: { reportType } }]
  }
  if (/(?:为什么|什么原因|not sure|why|待解决)/.test(text)) {
    return [{ type: 'ADD_QUESTION', confidence: 0.6, entities: { title: text } }]
  }
  if (
    /(?:完成|todo|task|待办|提醒|remind)/i.test(text) ||
    /(今天|明天|今晚|tomorrow|tonight).*?(?:要|得|得去|need to|have to)/.test(lowered)
  ) {
    const due = extractDueDate(text)
    return [
      {
        type: 'ADD_TODO',
        confidence: 0.65,
        entities: { title: text, dueDate: due ?? null },
      },
    ]
  }
  if (
    /(?:记一下|记个|不懂|what is|什么意思|log |jot|note)\s*[:：]?\s*/i.test(text) ||
    /^(?:什么是|解释|查一下)/.test(text)
  ) {
    return [
      {
        type: 'ADD_TERM',
        confidence: 0.65,
        entities: {
          title: text
            .replace(/(?:记一下|记个|不懂|什么意思|log|note|jot)/gi, '')
            .trim(),
        },
      },
    ]
  }
  if (/(?:今天有什么|我今天|what.{0,3}on my plate|今天安排)/.test(text)) {
    return [{ type: 'QUERY', confidence: 0.7, entities: { query: 'today' } }]
  }
  return [{ type: 'UNKNOWN', confidence: 0.3, entities: {} }]
}