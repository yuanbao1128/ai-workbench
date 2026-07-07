import { prisma } from '@/lib/db'
import { getActivitiesForDate } from '@/lib/activity-logger'

const activityTypeLabel: Record<string, string> = {
  TASK_DONE: '完成任务',
  CARD_ADDED: '新增名词',
  CARD_LEARNED: '了解名词',
  DELEGATION_CREATED: '新增委托',
  DELEGATION_RESOLVED: '委托结案',
  MEETING: '参加会议',
  DESIGN: '新增方案',
}

export async function generateDailyReport(date: Date): Promise<string> {
  const activities = await getActivitiesForDate(date)

  // Also get completed tasks for the day
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const completedTasks = await prisma.task.findMany({
    where: {
      completedAt: { gte: start, lte: end },
    },
  })

  const newCards = await prisma.card.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
  })

  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long',
  })

  let report = `# 日报 — ${dateStr}\n\n`

  // Completed tasks
  if (completedTasks.length > 0) {
    report += `## 完成任务 (${completedTasks.length})\n`
    for (const task of completedTasks) {
      report += `- ✅ ${task.title}\n`
    }
    report += '\n'
  }

  // New knowledge cards
  if (newCards.length > 0) {
    report += `## 新增知识 (${newCards.length})\n`
    const typeLabels: Record<string, string> = {
      TERM: '术语', DESIGN: '方案', INSPIRATION: '灵感',
      MEETING: '纪要', QUESTION: '问题',
    }
    for (const card of newCards) {
      report += `- 📝 [${typeLabels[card.type] || card.type}] ${card.title}\n`
    }
    report += '\n'
  }

  // Other activities
  if (activities.length > 0) {
    report += `## 其他活动\n`
    for (const activity of activities) {
      report += `- ${activityTypeLabel[activity.type] || activity.type}: ${activity.description}\n`
    }
    report += '\n'
  }

  // Summary
  report += `## 摘要\n`
  report += `- 完成任务: ${completedTasks.length} 项\n`
  report += `- 新增知识: ${newCards.length} 项\n`
  report += `- 其他活动: ${activities.length} 项\n`

  return report
}