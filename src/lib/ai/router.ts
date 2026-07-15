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
}

export async function routeIntent(
  type: IntentType,
  entities: Record<string, string | null>
): Promise<RouteResult> {
  switch (type) {
    case 'ADD_TERM':
    case 'ADD_DESIGN':
    case 'ADD_INSPIRATION':
    case 'ADD_MEETING':
    case 'ADD_QUESTION': {
      const cardType = type.replace('ADD_', '')
      const card = await prisma.card.create({
        data: {
          title: entities.title || '未命名',
          type: cardType as string,
          status: cardType === 'TERM' ? 'UNKNOWN' : 'UNKNOWN',
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
      return {
        success: true,
        message: `已创建${cardType === 'TERM' ? '术语' : cardType}卡片：「${card.title}」`,
        card: { type: cardType, title: card.title },
        data: card,
      }
    }

    case 'ADD_TODO': {
      const task = await prisma.task.create({
        data: {
          title: entities.title || '未命名任务',
          priority: (entities.priority as string) || 'NORMAL',
          dueDate: entities.dueDate ? new Date(entities.dueDate) : new Date(),
          relatedCards: '[]',
        },
      })
      return {
        success: true,
        message: `已创建任务：「${task.title}」`,
        data: task,
      }
    }

    case 'ADD_DELEGATION': {
      const delegation = await prisma.delegation.create({
        data: {
          title: entities.title || '未命名委托',
          assignee: entities.assignee || '待指定',
          source: entities.source || null,
          followUpTimes: '[]',
          timeline: JSON.stringify([{
            timestamp: new Date().toISOString(),
            action: 'created',
            detail: `转给 ${entities.assignee || '待指定'}`,
          }]),
        },
      })
      return {
        success: true,
        message: `已创建委托：「${delegation.title}」→ ${delegation.assignee}`,
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
        return {
          success: true,
          message: '已生成周报',
          data: report,
        }
      } else {
        const content = await generateDailyReport(new Date())
        const dateRange = new Date().toISOString().split('T')[0]
        const report = await prisma.report.create({
          data: { type: 'DAILY', dateRange, content },
        })
        return {
          success: true,
          message: '已生成日报',
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