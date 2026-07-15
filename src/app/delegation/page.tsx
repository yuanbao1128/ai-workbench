'use client'

import { useState, useEffect, useCallback } from 'react'
import { DelegationCard } from '@/components/delegation/DelegationCard'
import { Tab } from '@/components/ui/Tab'

interface DelegationItem { id: string; title: string; assignee: string; source: string | null; status: string; priority: string; followUpTimes: string; conclusion: string | null; timeline: string; createdAt: string }

const filterTabs = [{ value: '', label: '全部' }, { value: 'active', label: '等待中' }, { value: 'RESOLVED', label: '已解决' }]

export default function DelegationPage() {
  const [delegations, setDelegations] = useState<DelegationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    const res = await fetch(`/api/delegation?${params}`)
    setDelegations(await res.json())
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleUpdate = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/delegation/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    await fetch(`/api/delegation/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">委托跟进</h1>
      <div className="flex gap-1 mb-4">
        {filterTabs.map(t => (<Tab key={t.value} active={filter === t.value} onClick={() => setFilter(t.value)}>{t.label}</Tab>))}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />))}
        </div>
      ) : delegations.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无委托</div>
      ) : (
        <div className="space-y-3">
          {delegations.map(d => (<DelegationCard key={d.id} delegation={d} onUpdate={handleUpdate} onDelete={handleDelete} />))}
        </div>
      )}
    </div>
  )
}