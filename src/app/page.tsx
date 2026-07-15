import { prisma } from '@/lib/db'
import { DashboardView } from './DashboardView'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [mustTasks, focusTasks, pendingDelegations, unknownTerms] = await Promise.all([
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

  return (
    <DashboardView
      mustCount={mustTasks}
      focusCount={focusTasks}
      delegationCount={pendingDelegations}
      unknownCount={unknownTerms}
    />
  )
}