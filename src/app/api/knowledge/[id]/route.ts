import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const card = await prisma.card.findUnique({ where: { id } })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  return NextResponse.json(card)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Get existing card for history tracking
  const existing = await prisma.card.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const history = JSON.parse(existing.history || '[]')
  history.push({
    timestamp: new Date().toISOString(),
    action: 'updated',
    content: Object.keys(body).join(', '),
  })

  const card = await prisma.card.update({
    where: { id },
    data: {
      ...body,
      keyConcepts: body.keyConcepts ? JSON.stringify(body.keyConcepts) : undefined,
      relatedCards: body.relatedCards ? JSON.stringify(body.relatedCards) : undefined,
      history: JSON.stringify(history),
    },
  })

  return NextResponse.json(card)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.card.delete({ where: { id } })
  return NextResponse.json({ success: true })
}