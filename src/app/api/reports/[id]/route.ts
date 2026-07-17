import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { content } = body

  const report = await prisma.report.update({
    where: { id },
    data: { content },
  })

  return NextResponse.json(report)
}
