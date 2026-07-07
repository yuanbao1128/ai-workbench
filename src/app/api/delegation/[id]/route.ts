import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const delegation = await prisma.delegation.findUnique({ where: { id } })
  if (!delegation) {
    return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
  }
  return NextResponse.json(delegation)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.delegation.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
  }

  const timeline = JSON.parse(existing.timeline || '[]')
  const actionLabels: Record<string, string> = {
    ASKED: '已追问',
    REPLIED: '已回复',
    RESOLVED: '已解决',
  }

  if (body.status && body.status !== existing.status && actionLabels[body.status]) {
    timeline.push({
      timestamp: new Date().toISOString(),
      action: body.status.toLowerCase(),
      detail: actionLabels[body.status],
    })
  }

  if (body.conclusion) {
    timeline.push({
      timestamp: new Date().toISOString(),
      action: 'conclusion',
      detail: body.conclusion,
    })
  }

  const delegation = await prisma.delegation.update({
    where: { id },
    data: {
      ...body,
      timeline: JSON.stringify(timeline),
      resolvedAt: body.status === 'RESOLVED' ? new Date() : existing.resolvedAt,
    },
  })

  return NextResponse.json(delegation)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.delegation.delete({ where: { id } })
  return NextResponse.json({ success: true })
}