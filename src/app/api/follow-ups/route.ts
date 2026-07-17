import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // Fetch both collections
    const [delegations, tasks] = await Promise.all([
      prisma.delegation.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: { type: 'TODO' },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Map to unified items
    const delegationItems = delegations.map(d => ({
      id: d.id,
      type: 'delegation' as const,
      title: d.title,
      status: d.status,
      assignee: d.assignee || undefined,
      source: d.source || undefined,
      followUpTime: (() => {
        try { return JSON.parse(d.followUpTimes || '[]')[0] || undefined }
        catch { return undefined }
      })(),
      createdAt: d.createdAt.toISOString(),
    }))

    const todoItems = tasks.map(t => ({
      id: t.id,
      type: 'todo' as const,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString().split('T')[0],
      source: undefined,
      createdAt: t.createdAt.toISOString(),
    }))

    const allItems = [...delegationItems, ...todoItems]

    // Tab filtering
    let filtered = allItems
    switch (tab) {
      case 'delegation':
        filtered = delegationItems.filter(i => i.status !== 'RESOLVED')
        break
      case 'todo':
        filtered = todoItems.filter(i => i.status !== 'DONE')
        break
      case 'done':
        filtered = allItems.filter(i => i.status === 'DONE' || i.status === 'RESOLVED')
        break
      default:
        filtered = allItems.filter(i => i.status !== 'DONE' && i.status !== 'RESOLVED')
    }

    // Counts
    const counts = {
      all: allItems.filter(i => i.status !== 'DONE' && i.status !== 'RESOLVED').length,
      delegation: delegationItems.filter(i => i.status !== 'RESOLVED').length,
      todo: todoItems.filter(i => i.status !== 'DONE').length,
      done: allItems.filter(i => i.status === 'DONE' || i.status === 'RESOLVED').length,
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedItems = filtered.slice(start, start + pageSize)

    return NextResponse.json({
      items: paginatedItems,
      counts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Follow-ups error:', error)
    return NextResponse.json(
      { error: 'Failed to load follow-ups' },
      { status: 500 }
    )
  }
}
