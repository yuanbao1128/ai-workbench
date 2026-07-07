import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...body,
      completedAt: body.status === 'DONE' ? new Date() : undefined,
    },
  })

  return NextResponse.json(task)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}