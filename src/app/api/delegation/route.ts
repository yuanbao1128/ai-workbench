import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateFollowUpTimes } from '@/lib/delegation-rules'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status) {
    if (status === 'active') {
      where.OR = [{ status: 'WAITING' }, { status: 'ASKED' }]
    } else {
      where.status = status
    }
  }

  const delegations = await prisma.delegation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const response = NextResponse.json(delegations)
  response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, assignee, source, priority, customFollowUp } = body

  const followUpTimes = calculateFollowUpTimes(customFollowUp)

  const delegation = await prisma.delegation.create({
    data: {
      title,
      assignee,
      source: source || null,
      priority: priority || 'NORMAL',
      customFollowUp: customFollowUp || null,
      followUpTimes: JSON.stringify(followUpTimes),
      timeline: JSON.stringify([{
        timestamp: new Date().toISOString(),
        action: 'created',
        detail: `转给 ${assignee}${source ? `，来源 ${source}` : ''}`,
      }]),
    },
  })

  return NextResponse.json(delegation, { status: 201 })
}