import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const issues = await prisma.legacyIssue.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const response = NextResponse.json(issues)
  response.headers.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=30')
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, plannedDate, tags } = body

  const issue = await prisma.legacyIssue.create({
    data: {
      title,
      plannedDate: plannedDate ? new Date(plannedDate) : null,
      tags: JSON.stringify(tags || []),
    },
  })

  return NextResponse.json(issue, { status: 201 })
}