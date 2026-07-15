import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TasksView } from './TasksView'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

const getTasksData = unstable_cache(
  async () => {
    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()
    return Promise.all([
      prisma.task.findMany({
        where: { dueDate: { gte: weekStart, lte: weekEnd } },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.legacyIssue.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])
  },
  ['tasks'],
  { revalidate: 10, tags: ['tasks'] }
)

export default async function TasksPage() {
  const [tasks, issues] = await getTasksData()

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <TasksView
        tasks={JSON.parse(JSON.stringify(tasks))}
        issues={JSON.parse(JSON.stringify(issues))}
      />
    </Suspense>
  )
}