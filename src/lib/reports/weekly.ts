import { prisma } from '@/lib/db'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

export async function generateWeeklyReport(date: Date = new Date()): Promise<string> {
  const weekStart = getWeekStart(date)
  const weekEnd = getWeekEnd(date)

  const startStr = weekStart.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  const endStr = weekEnd.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  const dateRange = `${startStr} - ${endStr}`

  // Get daily reports for the week
  const dailyReports = await prisma.report.findMany({
    where: {
      type: 'DAILY',
      createdAt: { gte: weekStart, lte: weekEnd },
    },
  })

  // Get completed tasks
  const completedTasks = await prisma.task.findMany({
    where: {
      completedAt: { gte: weekStart, lte: weekEnd },
    },
  })

  // Get new/learned cards
  const newCards = await prisma.card.findMany({
    where: {
      createdAt: { gte: weekStart, lte: weekEnd },
    },
  })

  const learnedCards = await prisma.card.findMany({
    where: {
      type: 'TERM',
      status: 'KNOWN',
      updatedAt: { gte: weekStart, lte: weekEnd },
    },
  })

  // Get next week tasks
  const nextWeekStart = new Date(weekEnd)
  nextWeekStart.setDate(nextWeekStart.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6)

  const nextWeekTasks = await prisma.task.findMany({
    where: {
      status: { not: 'DONE' },
      dueDate: { gte: nextWeekStart, lte: nextWeekEnd },
    },
    orderBy: { priority: 'asc' },
  })

  let report = `# 周报 — ${dateRange}\n\n`

  // Core summary
  report += `## 核心摘要\n\n`
  report += `本周完成 ${completedTasks.length} 项任务，新增 ${newCards.length} 项知识卡片。\n\n`

  // Project delivery progress
  if (completedTasks.length > 0) {
    report += `## 项目/需求交付进展\n\n`
    for (const task of completedTasks) {
      const priorityLabel = task.priority === 'MUST' ? '必须解决' :
        task.priority === 'FOCUS' ? '重点关注' : '普通'
      report += `- ✅ [${priorityLabel}] ${task.title}\n`
    }
    report += '\n'
  }

  // Specific output
  report += `## 具体产出\n\n`
  report += `- 完成任务: ${completedTasks.length} 项\n`
  report += `- 新增知识卡片: ${newCards.length} 项\n`
  report += `- 生成日报: ${dailyReports.length} 份\n`
  report += '\n'

  // Learning & Growth
  if (learnedCards.length > 0) {
    report += `## 学习&成长\n\n`
    for (const card of learnedCards) {
      report += `- 📚 [已了解] ${card.title}\n`
    }
    report += '\n'
  }

  // Next week plan
  if (nextWeekTasks.length > 0) {
    report += `## 下周重点计划\n\n`
    for (const task of nextWeekTasks) {
      const priorityLabel = task.priority === 'MUST' ? '🔴' :
        task.priority === 'FOCUS' ? '🟡' : '⚪'
      report += `- ${priorityLabel} ${task.title}\n`
    }
    report += '\n'
  }

  report += `---\n*自动生成于 ${new Date().toLocaleString('zh-CN')}*\n`

  return report
}