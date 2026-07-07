import { prisma } from '@/lib/db'

type ActivityType = 'TASK_DONE' | 'CARD_ADDED' | 'CARD_LEARNED' | 'DELEGATION_CREATED' | 'DELEGATION_RESOLVED' | 'MEETING' | 'DESIGN'

export async function logActivity(
  type: ActivityType,
  description: string,
  refId?: string,
  refType?: string
) {
  return prisma.activity.create({
    data: { type, description, refId: refId || null, refType: refType || null },
  })
}

export async function getActivitiesForDate(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return prisma.activity.findMany({
    where: {
      timestamp: { gte: start, lte: end },
    },
    orderBy: { timestamp: 'desc' },
  })
}

export async function getActivitiesForDateRange(from: Date, to: Date) {
  return prisma.activity.findMany({
    where: {
      timestamp: { gte: from, lte: to },
    },
    orderBy: { timestamp: 'desc' },
  })
}