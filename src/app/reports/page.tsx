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

  return <ReportsView reports={JSON.parse(JSON.stringify(reports))} />
}