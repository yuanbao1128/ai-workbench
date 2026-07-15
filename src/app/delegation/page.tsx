import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { DelegationView } from './DelegationView'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
}

export default async function DelegationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const where: Record<string, unknown> = {}
  if (params.status) {
    if (params.status === 'active') {
      where.OR = [{ status: 'WAITING' }, { status: 'ASKED' }]
    } else {
      where.status = params.status
    }
  }

  const delegations = await prisma.delegation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <DelegationView delegations={JSON.parse(JSON.stringify(delegations))} />
    </Suspense>
  )
}