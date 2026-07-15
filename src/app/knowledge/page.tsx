'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { KnowledgeCard } from '@/components/knowledge/KnowledgeCard'
import { FilterBar } from '@/components/knowledge/FilterBar'
import { Button } from '@/components/ui/Button'

interface CardData {
  id: string; title: string; type: string; status: string; content?: string | null; createdAt: string
}

export default function KnowledgePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type') || ''
  const statusFilter = searchParams.get('status') || ''
  const searchQuery = searchParams.get('search') || ''

  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (searchQuery) params.set('search', searchQuery)
    const res = await fetch(`/api/knowledge?${params}`)
    const data = await res.json()
    setCards(data)
    setLoading(false)
  }, [typeFilter, statusFilter, searchQuery])

  useEffect(() => { fetchCards() }, [fetchCards])

  const updateParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    router.push(`/knowledge?${p.toString()}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <Button variant="primary" onClick={() => {}}>+ 新建</Button>
      </div>
      <FilterBar
        typeFilter={typeFilter} statusFilter={statusFilter} searchQuery={searchQuery}
        onTypeChange={(t) => { updateParams({ type: t, status: '' }) }}
        onStatusChange={(s) => updateParams({ status: s })}
        onSearchChange={(s) => updateParams({ search: s })}
      />
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无卡片</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => <KnowledgeCard key={card.id} card={card} />)}
        </div>
      )}
    </div>
  )
}