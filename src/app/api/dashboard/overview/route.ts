import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [tasks, delegations, unknownTerms] = await Promise.all([
      prisma.task.findMany({
        where: { status: 'PENDING' },
        orderBy: { priority: 'desc' },
      }),
      prisma.delegation.findMany({
        where: { status: { not: 'RESOLVED' } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.card.findMany({
        where: { type: 'TERM', status: 'UNKNOWN' },
        select: { id: true, title: true },
      }),
    ])

    const mustTasks = tasks.filter(t => t.priority === 'MUST')
    const focusTasks = tasks.filter(t => t.priority === 'FOCUS')

    // Also fetch TODO-type tasks (created via AI chat "记到todo里")
    const todoTasks = await prisma.task.findMany({
      where: { type: 'TODO', status: { not: 'DONE' } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const followUps = [
      ...delegations.map(d => ({
        id: d.id,
        type: 'delegation' as const,
        title: d.title,
        status: d.status,
        assignee: d.assignee || undefined,
        followUpTime: (() => {
          try {
            const times = JSON.parse(d.followUpTimes || '[]')
            return times[0] || undefined
          } catch { return undefined }
        })(),
      })),
      ...todoTasks.map(t => ({
        id: t.id,
        type: 'todo' as const,
        title: t.title,
        status: t.status,
        dueDate: t.dueDate?.toISOString() ?? undefined,
      })),
    ]

    return NextResponse.json({
      mustCount: mustTasks.length,
      focusCount: focusTasks.length,
      delegationCount: delegations.length,
      unknownCount: unknownTerms.length,
      mustTasks: mustTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString().split('T')[0],
        status: t.status,
      })),
      focusTasks: focusTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString().split('T')[0],
        status: t.status,
      })),
      followUps,
      unknownTerms: unknownTerms.map(t => ({
        id: t.id,
        title: t.title,
      })),
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard overview' },
      { status: 500 }
    )
  }
}
