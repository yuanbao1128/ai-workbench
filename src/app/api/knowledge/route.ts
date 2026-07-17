import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('q') || searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '9')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const skip = (page - 1) * pageSize
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.card.count({ where }),
    ])

    const response = NextResponse.json({
      cards,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
    response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
    return response
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}