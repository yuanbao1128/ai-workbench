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

export const INTENT_SYSTEM_PROMPT = `你是一个意图识别与任务拆解助手。分析用户的中文或中英混合输入，**主动拆解复合意图**，返回 JSON 格式的意图识别结果。

## 关键规则

### 1. 标题（title）必须简洁总结
- title ≤ 15 个汉字（或等效 30 个英文字符）
- 删除口语化引导："帮我记一下"、"待办里加一条"、"记到todo里"、"明天上午十点有个会" 这种是原始描述，不是标题
- 标题应是**动作核心**：例如 "明天上午十点有个会，记到todo里" → title = "准备明天10点会议"（保留关键时间）
- 中英文专有名词保留原样不翻译（K8s、Webhook 等）

### 2. 复合消息必须拆成多个 intents
遇到"+"、"、"或者语义上明显是多个动作，必须分别创建：
- "明天上午十点有个会，记到todo里" →
  [
    { type: ADD_MEETING, title: "明天10点会议", dueDate: <明早10点 ISO> },
    { type: ADD_TODO, title: "为明天10点会议做准备", dueDate: <明早10点 ISO> }
  ]
- "记一下 K8s 不要懂；明天下午3点王工汇报" →
  [
    { type: ADD_TERM, title: "K8s" },
    { type: ADD_MEETING, title: "王工汇报", dueDate: <明下午3点 ISO> }
  ]

### 3. dueDate 必须精确实刻
- "明天上午10点" → 明天 10:00:00
- "今晚8点" → 今天 20:00:00
- "明天" 无小时 → 09:00:00
- 输出 ISO 8601 字符串（带时区）

### 4. 优先级映射
- "紧急"/"重要"/"高优" → MUST
- "关注"/"留意" → FOCUS
- 其他/无信号 → NORMAL

## 支持的意图类型
- ADD_TERM: 新增术语/名词（如"记一下K8s不懂"）
- ADD_DESIGN: 新增方案（如"登录页要支持手机号验证"）
- ADD_INSPIRATION: 新增灵感
- ADD_MEETING: 新增会议纪要（如"记会议"、"meeting note"）
- ADD_QUESTION: 新增问题（如"为什么首页加载慢"）
- ADD_TODO: 新增任务/待办（如"今天完成xxx"）
- ADD_DELEGATION: 新增委托（如"转给王工排查"）
- QUERY: 查询
- GENERATE_REPORT: 生成周报/日报
- UNKNOWN: 无法识别

## 实体字段
- title: 标题（已按规则1总结）
- content: 详细内容
- priority: MUST/FOCUS/NORMAL
- dueDate: ISO 8601（含时间）
- assignee: 被委托人
- source: 来源（URL等）
- followUpTime: 追问时间 ISO
- query: 查询内容
- reportType: "日报"/"周报"

## 示例（必须按此风格输出）

输入："明天上午十点有个会，记到todo里"
输出：
{
  "intents": [
    {"type": "ADD_MEETING", "confidence": 0.9, "entities": {"title": "明天10点会议", "dueDate": "<明天10:00 ISO>"}},
    {"type": "ADD_TODO", "confidence": 0.85, "entities": {"title": "为明天10点会议做准备", "dueDate": "<明天10:00 ISO>"}}
  ]
}

输入："log K8s 不太懂"
输出：
{
  "intents": [
    {"type": "ADD_TERM", "confidence": 0.95, "entities": {"title": "K8s", "content": "不太懂，待了解"}}
  ]
}

输入："明天 4 个 task: 修 bug、写文档、对需求、回复邮件"
输出（拆 4 条）：
{
  "intents": [
    {"type": "ADD_TODO", "entities": {"title": "修bug"}},
    {"type": "ADD_TODO", "entities": {"title": "写文档"}},
    {"type": "ADD_TODO", "entities": {"title": "对需求"}},
    {"type": "ADD_TODO", "entities": {"title": "回复邮件"}}
  ]
}

## 返回格式
只返回合法 JSON（不要任何解释文本、不要用反引号包裹）：
{
  "intents": [
    {"type": "<TYPE>", "confidence": <0-1>, "entities": { ... }}
  ]
}

置信度：0.95+ 明确，0.7-0.9 大概率，0.4-0.7 模糊，<0.4 UNKNOWN。`

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

  if (/(?:会议|meeting|standup|纪要|评审|对齐|汇报|开个?会|有个?会)/.test(text)) {
    // 复合模式：会议 + 记到todo里 / 待办里 → 同时创建两条
    const hasTodoSuffix = /(?:记到|加到|写在|放入|写入)\s*(?:todo|待办|待跟进)/i.test(text)
    if (hasTodoSuffix) {
      const due = extractDueDate(text)
      const meetingTitle = text.replace(/[，。,.\s]+(?:记到|加到|写在|放入|写入)\s*(?:todo|待办|待跟进)里?.*$/i, '').trim()
      return [
        { type: 'ADD_MEETING', confidence: 0.75, entities: { title: meetingTitle, dueDate: due } },
        {
          type: 'ADD_TODO',
          confidence: 0.7,
          entities: {
            // 总结todo标题：从原文提取核心
            title: meetingTitle.replace(/(?:上午|下午|晚上|凌晨)?\s*\d{1,2}\s*[点时:：]?\s*\d{0,2}\s*分?/, '').slice(0, 30) || meetingTitle,
            dueDate: due,
          },
        },
      ]
    }
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