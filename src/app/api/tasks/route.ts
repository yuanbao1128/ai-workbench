import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const priority = searchParams.get('priority')
  const status = searchParams.get('status')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  const where: Record<string, unknown> = {}
  if (priority) where.priority = priority
  if (status) where.status = status
  if (fromDate || toDate) {
    where.dueDate = {}
    if (fromDate) (where.dueDate as Record<string, unknown>).gte = new Date(fromDate)
    if (toDate) (where.dueDate as Record<string, unknown>).lte = new Date(toDate)
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(tasks)
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