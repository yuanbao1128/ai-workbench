'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { KnowledgeCard } from '@/components/knowledge/KnowledgeCard'
import { FilterBar } from '@/components/knowledge/FilterBar'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'

interface CardData {
  id: string; title: string; type: string; status: string; content?: string | null; createdAt: string
}

interface PagedResult {
  cards: CardData[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

function KnowledgeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type') || ''
  const statusFilter = searchParams.get('status') || ''
  const searchQuery = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const [data, setData] = useState<PagedResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (searchQuery) params.set('q', searchQuery)
    params.set('page', String(page))
    params.set('pageSize', '9')

    try {
      const res = await fetch(`/api/knowledge?${params}`)
      const json = await res.json()
      if (json.cards) {
        setData(json)
      } else {
        // Fallback: server returns flat array
        setData({
          cards: Array.isArray(json) ? json : [],
          pagination: { page: 1, pageSize: 9, total: Array.isArray(json) ? json.length : 0, totalPages: 1 },
        })
      }
    } catch {
      setData(null)
    }
    setLoading(false)
  }, [typeFilter, statusFilter, searchQuery, page])

  useEffect(() => { fetchCards() }, [fetchCards])

  const updateParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    // Reset page to 1 on filter change
    if (!updates.page) p.delete('page')
    router.push(`/knowledge?${p.toString()}`)
  }

  const cards = data?.cards || []
  const pagination = data?.pagination

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <Button variant="primary" onClick={() => {}}>+ 新建</Button>
      </div>

      <FilterBar
        typeFilter={typeFilter} statusFilter={statusFilter} searchQuery={searchQuery}
        onTypeChange={(t) => updateParams({ type: t, status: '' })}
        onStatusChange={(s) => updateParams({ status: s })}
        onSearchChange={(q) => updateParams({ q: q })}
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">📭</p>
          {searchQuery ? (
            <p className="text-gray-400">未找到匹配「{searchQuery}」的卡片</p>
          ) : (
            <p className="text-gray-400">暂无卡片，点击「+ 新建」开始</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map((card) => <KnowledgeCard key={card.id} card={card} />)}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="text-gray-400">加载中...</div>}>
      <KnowledgeContent />
    </Suspense>
  )
}
