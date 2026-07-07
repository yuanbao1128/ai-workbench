import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const cards = await prisma.card.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(cards)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, type, content, source, keyConcepts, relatedCards } = body

  const card = await prisma.card.create({
    data: {
      title,
      type: type || 'TERM',
      status: type === 'TERM' ? 'UNKNOWN' : 'UNKNOWN',
      content: content || null,
      source: source || null,
      keyConcepts: JSON.stringify(keyConcepts || []),
      relatedCards: JSON.stringify(relatedCards || []),
      history: JSON.stringify([{
        timestamp: new Date().toISOString(),
        action: 'created',
        content: '创建卡片',
      }]),
    },
  })

  return NextResponse.json(card, { status: 201 })
}