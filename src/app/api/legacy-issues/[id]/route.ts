import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const issue = await prisma.legacyIssue.update({
    where: { id },
    data: {
      ...body,
      resolvedAt: body.status === 'RESOLVED' ? new Date() : undefined,
    },
  })

  return NextResponse.json(issue)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.legacyIssue.delete({ where: { id } })
  return NextResponse.json({ success: true })
}