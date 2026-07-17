import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const priority = searchParams.get('priority')
  const status = searchParams.get('status')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')
  const weekRef = searchParams.get('week')
  const dateParam = searchParams.get('date')
  const include = searchParams.get('include')

  // Build date range
  let dateRange: { gte: Date; lte: Date } | null = null

  if (dateParam) {
    // Exact date: from 00:00:00 to 23:59:59.999
    const date = new Date(dateParam)
    dateRange = {
      gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
      lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
    }
  } else if (weekRef) {
    // Week: compute Monday 00:00:00 to Sunday 23:59:59.999
    const refDate = new Date(weekRef)
    dateRange = {
      gte: getWeekStart(refDate),
      lte: getWeekEnd(refDate),
    }
  } else if (fromDate || toDate) {
    dateRange = {} as { gte: Date; lte: Date }
    if (fromDate) dateRange.gte = new Date(fromDate)
    if (toDate) dateRange.lte = new Date(toDate)
  }

  const where: Record<string, unknown> = {}
  if (priority) where.priority = priority
  if (status) where.status = status
  if (dateRange) where.dueDate = dateRange

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  // If include=follow-ups, also fetch follow-up items
  if (include === 'follow-ups') {
    const followUps: Array<{
      id: string
      title: string
      type: 'todo' | 'delegation'
      dueDate: string | null
      assignee?: string
    }> = []

    // Fetch TODO tasks within the date range
    const todoWhere: Record<string, unknown> = { type: 'TODO' }
    if (dateRange) todoWhere.dueDate = dateRange

    const todoTasks = await prisma.task.findMany({
      where: todoWhere,
      orderBy: { createdAt: 'desc' },
    })

    for (const t of todoTasks) {
      followUps.push({
        id: t.id,
        title: t.title,
        type: 'todo',
        dueDate: t.dueDate?.toISOString() ?? null,
      })
    }

    // Fetch delegations and filter by followUpTimes in range
    const delegations = await prisma.delegation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    for (const d of delegations) {
      // Parse followUpTimes
      let times: string[] = []
      try { times = JSON.parse(d.followUpTimes || '[]') }
      catch { /* ignore */ }

      // Check if any followUpTime falls in the date range
      const hasMatch = times.some((time) => {
        if (dateRange) {
          const t = new Date(time).getTime()
          return t >= dateRange.gte.getTime() && t <= dateRange.lte.getTime()
        }
        // If no date range specified, include all active delegations
        return d.status !== 'RESOLVED'
      })

      if (hasMatch) {
        followUps.push({
          id: d.id,
          title: d.title,
          type: 'delegation',
          dueDate: times[0] ? new Date(times[0]).toISOString() : null,
          assignee: d.assignee || undefined,
        })
      }
    }

    const response = NextResponse.json({ tasks, followUps })
    response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
    return response
  }

  const response = NextResponse.json(tasks)
  response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, priority, dueDate, relatedCards } = body

  const task = await prisma.task.create({
    data: {
      title,
      priority: priority || 'NORMAL',
      dueDate: dueDate ? new Date(dueDate) : null,
      relatedCards: JSON.stringify(relatedCards || []),
    },
  })

  return NextResponse.json(task, { status: 201 })
}
