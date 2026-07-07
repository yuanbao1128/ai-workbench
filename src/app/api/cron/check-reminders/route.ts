import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const now = new Date()

  // Find delegations with due follow-up times
  const delegations = await prisma.delegation.findMany({
    where: {
      status: { in: ['WAITING', 'ASKED'] },
    },
  })

  const due = delegations.filter((d) => {
    const times = JSON.parse(d.followUpTimes || '[]')
    return times.some((time: string) => {
      const followUpTime = new Date(time)
      const diff = Math.abs(followUpTime.getTime() - now.getTime())
      return diff < 60000 // Within 1 minute
    })
  })

  if (due.length > 0) {
    // In production, push notifications here
    console.log(`[CRON] ${due.length} follow-up reminders due`)
  }

  return NextResponse.json({ checked: delegations.length, due: due.length })
}