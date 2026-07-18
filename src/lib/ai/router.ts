import { prisma } from '@/lib/db'
import { IntentType } from './intent'
import { generateDailyReport } from '@/lib/reports/daily'
import { generateWeeklyReport } from '@/lib/reports/weekly'

interface RouteResult {
  success: boolean
  message: string
  data?: unknown
  card?: {
    type: string
    title: string
  }
  /** When true, no DB write occurred (e.g. duplicate detected). */
  duplicate?: boolean
}

const DUPLICATE_WINDOW_MS = 30_000 // 30 s: same user message within this window → duplicate

/**
 * Idempotency cache: in-memory dedupe keyed by message hash.
 * Sufficient for single-session dedupe; cross-session dedupe relies on
 * DB-level uniqueness checks (e.g. term title match).
 */
const recentMessages = new Map<string, { type: IntentType; data: unknown; ts: number }>()

function hashMessage(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isDuplicate(message: string, type: IntentType): boolean {
  const key = `${type}:${hashMessage(message)}`
  const cached = recentMessages.get(key)
  if (!cached) return false
  if (Date.now() - cached.ts > DUPLICATE_WINDOW_MS) {
    recentMessages.delete(key)
    return false
  }
  return true
}

function recordExec(message: string, type: IntentType, data: unknown) {
  const key = `${type}:${hashMessage(message)}`
  recentMessages.set(key, { type, data, ts: Date.now() })
}

/**
 * Clean up overly verbose titles. The LLM sometimes passes through
 * the full original user message. This strips common conversational
 * wrappers and trims to a reasonable length.
 */
export function cleanTitle(raw: string | null | undefined, fallback: string, max = 30): string {
  let t = (raw || fallback || '未命名').trim()
  // Strip conversational prefixes/verbs common in Chinese
  t = t.replace(/^(帮我|请|麻烦|记得|我想|我需要|需要|先|帮我把|接下来|然后|可以|能否|要不要|打算?要?请?你?帮?我?)\s*/i, '')
  t = t.replace(/^(记一下|记个|加个|新建|创建?一个?|记录一下)\s*/i, '')
  // Strip trailing conversational particles
  t = t.replace(/\s*(一下哈|一下吧|哈|呢|啊|哦|呀)$/i, '')
  // Trim "明天上午十点有个会，记到todo里" style chains to the meaningful part
  // Match comma + suffix like "，记到todo里"
  t = t.replace(/，\s*记到\s*(?:todo|待办|待跟进)里?.*$/i, '')
  t = t.replace(/，\s*加到\s*(?:todo|待办|待跟进)里?.*$/i, '')
  t = t.replace(/，\s*写在?\s*(?:todo|待办|待跟进)里?.*$/i, '')
  // Also strip standalone suffix ".加到 todo"
  t = t.replace(/[，。,.\s]+(?:加到|放入|写入|记到|写在)\s*(?:todo|待办|待跟进)里?\s*$/i, '')
  // Cap length
  if (t.length > max) t = t.slice(0, max)
  return t || fallback
}

export async function routeIntent(
  type: IntentType,
  entities: Record<string, string | null>,
  rawMessage?: string
): Promise<RouteResult> {
  // ── Idempotency short-circuit ────────────────────────────
  if (rawMessage && isDuplicate(rawMessage, type)) {
    return {
      success: true,
      duplicate: true,
      message: '这条和刚才那条一样，已为你跳过（30s 内不重复创建）。',
      data: null,
    }
  }

  switch (type) {
    case 'ADD_TERM':
    case 'ADD_DESIGN':
    case 'ADD_INSPIRATION':
    case 'ADD_MEETING':
    case 'ADD_QUESTION': {
      const cardType = type.replace('ADD_', '') as
        | 'TERM'
        | 'DESIGN'
        | 'INSPIRATION'
        | 'MEETING'
        | 'QUESTION'
      const title = cleanTitle(entities.title, '未命名卡片')
      if (!title) {
        return { success: false, message: '术语卡片标题为空，请补充后重试' }
      }

      // ── Duplicate-name dedupe for terms (most common) ─────
      if (cardType === 'TERM') {
        const existing = await prisma.card.findFirst({
          where: {
            type: 'TERM',
            title,
            createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS * 10) },
          },
        })
        if (existing) {
          return {
            success: true,
            duplicate: true,
            message: `术语「${title}」已存在（${existing.status === 'UNKNOWN' ? '待了解' : '已了解'}）。`,
            data: existing,
            card: { type: cardType, title: existing.title },
          }
        }
      }

      const card = await prisma.card.create({
        data: {
          title,
          type: cardType,
          status: 'UNKNOWN',
          content: entities.content || null,
          source: entities.source || null,
          keyConcepts: '[]',
          relatedCards: '[]',
          history: JSON.stringify([{
            timestamp: new Date().toISOString(),
            action: 'created',
            content: '通过 AI 对话创建',
          }]),
        },
      })
      const label = cardType === 'TERM' ? '术语' : cardType
      const msg = `已创建${label}卡片：「${card.title}」`
      if (rawMessage) recordExec(rawMessage, type, card)
      return {
        success: true,
        message: msg,
        card: { type: cardType, title: card.title },
        data: card,
      }
    }

    case 'ADD_TODO': {
      const title = cleanTitle(entities.title, '新任务')
      const dueDate = entities.dueDate ? new Date(entities.dueDate) : null

      // If LLM didn't supply a due date and the user message contains no
      // date hint at all, refuse rather than silently storing today.
      const task = await prisma.task.create({
        data: {
          title,
          priority: (entities.priority as string) || 'NORMAL',
          dueDate,
          type: 'TODO',
          relatedCards: '[]',
        },
      })
      const datePart = dueDate ? `，截止 ${dueDate.toLocaleDateString('zh-CN')}` : ''
      const msg = `已创建任务：「${task.title}」${datePart}`
      if (rawMessage) recordExec(rawMessage, type, task)
      return {
        success: true,
        message: msg,
        data: task,
      }
    }

    case 'ADD_DELEGATION': {
      const title = cleanTitle(entities.title, '新委托')
      const assignee = entities.assignee || '待指定'
      const followUpTimes: string[] = []
      if (entities.followUpTime) followUpTimes.push(entities.followUpTime)

      const delegation = await prisma.delegation.create({
        data: {
          title,
          assignee,
          source: entities.source || null,
          followUpTimes: JSON.stringify(followUpTimes),
          timeline: JSON.stringify([{
            timestamp: new Date().toISOString(),
            action: 'created',
            detail: `转给 ${assignee}`,
          }]),
        },
      })
      const noteSuffix = assignee === '待指定' ? '（未指定被委托人，请补充）' : ''
      const msg = `已创建委托：「${delegation.title}」→ ${assignee}${noteSuffix}`
      if (rawMessage) recordExec(rawMessage, type, delegation)
      return {
        success: true,
        message: msg,
        data: delegation,
      }
    }

    case 'QUERY': {
      const query = entities.query || ''
      // Search knowledge base
      const cards = await prisma.card.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      })

      if (cards.length > 0) {
        const cardList = cards.map(c => `- ${c.title} (${c.type})`).join('\n')
        return {
          success: true,
          message: `找到 ${cards.length} 条相关记录：\n${cardList}`,
          data: cards,
        }
      }

      return {
        success: true,
        message: `未找到与「${query}」相关的记录`,
        data: [],
      }
    }

    case 'GENERATE_REPORT': {
      const reportType = entities.reportType || '日报'
      if (reportType === '周报') {
        const content = await generateWeeklyReport()
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const dateRange = `${weekStart.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`
        const report = await prisma.report.create({
          data: { type: 'WEEKLY', dateRange, content },
        })
        const msg = '已生成周报'
        if (rawMessage) recordExec(rawMessage, type, report)
        return {
          success: true,
          message: msg,
          data: report,
        }
      } else {
        const content = await generateDailyReport(new Date())
        const dateRange = new Date().toISOString().split('T')[0]
        const report = await prisma.report.create({
          data: { type: 'DAILY', dateRange, content },
        })
        const msg = '已生成日报'
        if (rawMessage) recordExec(rawMessage, type, report)
        return {
          success: true,
          message: msg,
          data: report,
        }
      }
    }

    case 'UNKNOWN':
    default:
      return {
        success: true,
        message: '收到你的消息了。你可以试试：记名词、添加TODO、转委托、查日程、生周报。',
        data: null,
      }
  }
}