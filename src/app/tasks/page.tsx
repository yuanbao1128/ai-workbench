import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { TasksView } from './TasksView'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const [tasks, issues] = await Promise.all([
    prisma.task.findMany({
      where: { dueDate: { gte: weekStart, lte: weekEnd } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.legacyIssue.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <TasksView
        tasks={JSON.parse(JSON.stringify(tasks))}
        issues={JSON.parse(JSON.stringify(issues))}
      />
    </Suspense>
  )
}