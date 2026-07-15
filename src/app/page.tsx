import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { DashboardView } from './DashboardView'

export const dynamic = 'force-dynamic'

const getDashboardData = unstable_cache(
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return Promise.all([
      prisma.task.count({
        where: { priority: 'MUST', status: { not: 'DONE' }, dueDate: { gte: today, lt: tomorrow } },
      }),
      prisma.task.count({
        where: { priority: 'FOCUS', status: { not: 'DONE' }, dueDate: { gte: today, lt: tomorrow } },
      }),
      prisma.delegation.count({
        where: { status: { in: ['WAITING', 'ASKED'] } },
      }),
      prisma.card.count({
        where: { type: 'TERM', status: 'UNKNOWN' },
      }),
    ])
  },
  ['dashboard'],
  { revalidate: 10, tags: ['dashboard'] }
)

export default async function Home() {
  const [mustTasks, focusTasks, pendingDelegations, unknownTerms] = await getDashboardData()

  return (
    <DashboardView
      mustCount={mustTasks}
      focusCount={focusTasks}
      delegationCount={pendingDelegations}
      unknownCount={unknownTerms}
    />
  )
}