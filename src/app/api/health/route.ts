import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      result,
      env: {
        provider: process.env.AI_PROVIDER,
        model: process.env.AI_MODEL,
      },
    })
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      {
        status: 'error',
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    )
  }
}