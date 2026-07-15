import { prisma } from '@/lib/db'
import { KnowledgeList } from './KnowledgeList'

export const dynamic = 'force-dynamic'

interface SearchParams {
  type?: string
  status?: string
  search?: string
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const where: Record<string, unknown> = {}
  if (params.type) where.type = params.type
  if (params.status) where.status = params.status
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { content: { contains: params.search } },
    ]
  }

  const cards = await prisma.card.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return <KnowledgeList cards={JSON.parse(JSON.stringify(cards))} />
}