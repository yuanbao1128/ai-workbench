import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const mustTasks = await prisma.task.findMany({
    where: {
      priority: 'MUST',
      status: { not: 'DONE' },
      dueDate: { gte: today, lt: tomorrow },
    },
  })

  const focusTasks = await prisma.task.findMany({
    where: {
      priority: 'FOCUS',
      status: { not: 'DONE' },
      dueDate: { gte: today, lt: tomorrow },
    },
  })

  const pendingDelegations = await prisma.delegation.count({
    where: { status: { in: ['WAITING', 'ASKED'] } },
  })

  const unknownTerms = await prisma.card.count({
    where: { type: 'TERM', status: 'UNKNOWN' },
  })

  const brief = {
    date: today.toISOString().split('T')[0],
    mustTasks: mustTasks.map((t) => t.title),
    focusTasks: focusTasks.map((t) => t.title),
    pendingDelegations,
    unknownTerms,
  }

  // In production, push notification here
  console.log('[CRON] Morning brief:', JSON.stringify(brief))

  return NextResponse.json(brief)
}