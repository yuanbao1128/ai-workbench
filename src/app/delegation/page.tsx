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

  return <DelegationView delegations={JSON.parse(JSON.stringify(delegations))} />
}