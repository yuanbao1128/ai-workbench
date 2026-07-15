import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { ReportsView } from './ReportsView'

export const dynamic = 'force-dynamic'

interface SearchParams {
  type?: string
}

const getReports = unstable_cache(
  async (type?: string) => {
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    return prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  },
  ['reports'],
  { revalidate: 10, tags: ['reports'] }
)

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const reports = await getReports(params.type)

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <ReportsView reports={JSON.parse(JSON.stringify(reports))} />
    </Suspense>
  )
}