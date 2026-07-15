import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { DelegationView } from './DelegationView'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
}

const getDelegations = unstable_cache(
  async (status?: string) => {
    const where: Record<string, unknown> = {}
    if (status) {
      if (status === 'active') {
        where.OR = [{ status: 'WAITING' }, { status: 'ASKED' }]
      } else {
        where.status = status
      }
    }
    return prisma.delegation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  },
  ['delegations'],
  { revalidate: 10, tags: ['delegations'] }
)

export default async function DelegationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const delegations = await getDelegations(params.status)

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <DelegationView delegations={JSON.parse(JSON.stringify(delegations))} />
    </Suspense>
  )
}