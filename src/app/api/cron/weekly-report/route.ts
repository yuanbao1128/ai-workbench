import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateWeeklyReport } from '@/lib/reports/weekly'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  const today = new Date()
  const weekStart = getWeekStart(today)
  const weekEnd = getWeekEnd(today)
  const dateRange = `${weekStart.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`

  // Check if already generated
  const existing = await prisma.report.findFirst({
    where: { type: 'WEEKLY', dateRange },
  })

  if (existing) {
    return NextResponse.json({ message: 'Weekly report already exists', id: existing.id })
  }

  const content = await generateWeeklyReport(today)
  const report = await prisma.report.create({
    data: { type: 'WEEKLY', dateRange, content },
  })

  return NextResponse.json({ message: 'Weekly report generated', id: report.id })
}