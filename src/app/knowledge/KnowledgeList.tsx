'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { KnowledgeCard } from '@/components/knowledge/KnowledgeCard'
import { FilterBar } from '@/components/knowledge/FilterBar'
import { Button } from '@/components/ui/Button'

interface CardData {
  id: string
  title: string
  type: string
  status: string
  content?: string | null
  createdAt: string
}

export function KnowledgeList({ cards }: { cards: CardData[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type') || ''
  const statusFilter = searchParams.get('status') || ''
  const searchQuery = searchParams.get('search') || ''

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`/knowledge?${params.toString()}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <Button variant="primary" onClick={() => {}}>
          + 新建
        </Button>
      </div>

      <FilterBar
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onTypeChange={(t) => { updateParams({ type: t, status: '' }) }}
        onStatusChange={(s) => updateParams({ status: s })}
        onSearchChange={(s) => updateParams({ search: s })}
      />

      {cards.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无卡片</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <KnowledgeCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}