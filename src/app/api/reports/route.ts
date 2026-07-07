import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyReport } from '@/lib/reports/daily'
import { generateWeeklyReport } from '@/lib/reports/weekly'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const where: Record<string, unknown> = {}
  if (type) where.type = type

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, date } = body

  let content: string
  let dateRange: string

  if (type === 'DAILY') {
    const reportDate = date ? new Date(date) : new Date()
    content = await generateDailyReport(reportDate)
    dateRange = reportDate.toISOString().split('T')[0]
  } else if (type === 'WEEKLY') {
    const reportDate = date ? new Date(date) : new Date()
    content = await generateWeeklyReport(reportDate)
    const weekStart = new Date(reportDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    dateRange = `${weekStart.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`
  } else {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  const report = await prisma.report.create({
    data: { type, dateRange, content },
  })

  return NextResponse.json(report, { status: 201 })
}