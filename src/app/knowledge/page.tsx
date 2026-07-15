import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { KnowledgeList } from './KnowledgeList'

export const dynamic = 'force-dynamic'

interface SearchParams {
  type?: string
  status?: string
  search?: string
}

const getCards = unstable_cache(
  async (type?: string, status?: string, search?: string) => {
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }
    return prisma.card.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })
  },
  ['knowledge-cards'],
  { revalidate: 10, tags: ['knowledge'] }
)

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const cards = await getCards(params.type, params.status, params.search)

  return (
    <Suspense fallback={<div className="text-center text-gray-400 py-12">加载中...</div>}>
      <KnowledgeList cards={JSON.parse(JSON.stringify(cards))} />
    </Suspense>
  )
}