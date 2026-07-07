'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function KnowledgePage() {
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <Button variant="primary" onClick={() => {/* TODO: create modal */}}>
          + 新建
        </Button>
      </div>

      <FilterBar
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onTypeChange={(t) => { setTypeFilter(t); setStatusFilter('') }}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : cards.length === 0 ? (
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