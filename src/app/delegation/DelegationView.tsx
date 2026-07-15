'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DelegationCard } from '@/components/delegation/DelegationCard'
import { Tab } from '@/components/ui/Tab'

interface DelegationItem {
  id: string
  title: string
  assignee: string
  source: string | null
  status: string
  priority: string
  followUpTimes: string
  conclusion: string | null
  timeline: string
  createdAt: string
}

const filterTabs = [
  { value: '', label: '全部' },
  { value: 'active', label: '等待中' },
  { value: 'RESOLVED', label: '已解决' },
]

export function DelegationView({ delegations }: { delegations: DelegationItem[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const handleUpdate = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/delegation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个委托？')) return
    await fetch(`/api/delegation/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">委托跟进</h1>

      <div className="flex gap-1 mb-4">
        {filterTabs.map((tab) => (
          <Tab
            key={tab.value}
            active={filter === tab.value}
            onClick={() => {
              setFilter(tab.value)
              const params = new URLSearchParams()
              if (tab.value) params.set('status', tab.value)
              router.push(`/delegation?${params.toString()}`)
            }}
          >
            {tab.label}
          </Tab>
        ))}
      </div>

      {delegations.length === 0 ? (
        <div className="text-center text-gray-400 py-12">暂无委托</div>
      ) : (
        <div className="space-y-3">
          {delegations.map((d) => (
            <DelegationCard
              key={d.id}
              delegation={d}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}