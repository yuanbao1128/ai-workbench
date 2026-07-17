import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyReport } from '@/lib/reports/daily'
import { generateWeeklyReport } from '@/lib/reports/weekly'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '9')

  const where: Record<string, unknown> = {}
  if (type) where.type = type

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const response = NextResponse.json({
    reports,
    pagination: { page, pageSize, total, totalPages },
  })
  response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, date } = body

  let content: string
  let dateRange: string
  let weekNumber: number | undefined

  if (type === 'DAILY') {
    const reportDate = date ? new Date(date) : new Date()
    content = await generateDailyReport(reportDate)
    dateRange = reportDate.toISOString().split('T')[0]
  } else if (type === 'WEEKLY') {
    const reportDate = date ? new Date(date) : new Date()
    content = await generateWeeklyReport(reportDate)
    // Compute week number (ISO week)
    const weekStart = new Date(reportDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    dateRange = `${weekStart.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`
    weekNumber = getWeekNumber(weekStart)
  } else {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  const report = await prisma.report.create({
    data: { type, dateRange, content, weekNumber },
  })

  return NextResponse.json(report, { status: 201 })
}

/** Compute ISO week number */
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
