import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { ReportsView } from './ReportsView'

export const dynamic = 'force-dynamic'

interface SearchParams {
  type?: string
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const where: Record<string, unknown> = {}
  if (params.type) where.type = params.type

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <ReportsView reports={JSON.parse(JSON.stringify(reports))} />
    </Suspense>
  )
}