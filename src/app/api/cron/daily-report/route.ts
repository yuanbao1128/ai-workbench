import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyReport } from '@/lib/reports/daily'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  // Check if already generated
  const existing = await prisma.report.findFirst({
    where: { type: 'DAILY', dateRange: dateStr },
  })

  if (existing) {
    return NextResponse.json({ message: 'Daily report already exists', id: existing.id })
  }

  const content = await generateDailyReport(today)
  const report = await prisma.report.create({
    data: { type: 'DAILY', dateRange: dateStr, content },
  })

  return NextResponse.json({ message: 'Daily report generated', id: report.id })
}