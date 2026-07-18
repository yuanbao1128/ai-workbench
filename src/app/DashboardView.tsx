'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThresholdReminder } from '@/components/knowledge/ThresholdReminder'
import { PriorityCard } from '@/components/dashboard/PriorityCard'
import { FollowUpCard } from '@/components/dashboard/FollowUpCard'
import { UnknownTermsCloud } from '@/components/dashboard/UnknownTermsCloud'

interface OverviewData {
  mustCount: number
  focusCount: number
  delegationCount: number
  unknownCount: number
  mustTasks: { id: string; title: string; priority: string; dueDate?: string; status: string }[]
  focusTasks: { id: string; title: string; priority: string; dueDate?: string; status: string }[]
  followUps: { id: string; type: 'delegation' | 'todo'; title: string; status: string; assignee?: string; dueDate?: string; followUpTime?: string }[]
  unknownTerms: { id: string; title: string }[]
}

export function DashboardView() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/overview')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // Fall back to individual API calls
      try {
        const [tasksRes, delegationsRes, termsRes] = await Promise.all([
          fetch('/api/tasks').then(r => r.json()),
          fetch('/api/delegation?status=active').then(r => r.json()),
          fetch('/api/knowledge?type=TERM&status=UNKNOWN').then(r => r.json()),
        ])
        const tasks = Array.isArray(tasksRes) ? tasksRes : []
        const delegations = Array.isArray(delegationsRes) ? delegationsRes : []
        const terms = Array.isArray(termsRes) ? termsRes : []
        setData({
          mustCount: tasks.filter((t: { priority: string }) => t.priority === 'MUST').length,
          focusCount: tasks.filter((t: { priority: string }) => t.priority === 'FOCUS').length,
          delegationCount: delegations.length,
          unknownCount: terms.length,
          mustTasks: tasks.filter((t: { priority: string }) => t.priority === 'MUST'),
          focusTasks: tasks.filter((t: { priority: string }) => t.priority === 'FOCUS'),
          followUps: [
            ...delegations.map((d: { id: string; title: string; status: string; assignee?: string; followUpTime?: string }) => ({
              ...d, type: 'delegation' as const,
            })),
            ...tasks.filter((t: { type?: string }) => t.type === 'TODO').map((t: { id: string; title: string; status: string; dueDate?: string }) => ({
              ...t, type: 'todo' as const,
            })),
          ],
          unknownTerms: terms.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })),
        })
      } catch {
        // silent fail — show empty state
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  // visibilitychange — auto refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOverview()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchOverview])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const d = data || {
    mustCount: 0, focusCount: 0, delegationCount: 0, unknownCount: 0,
    mustTasks: [], focusTasks: [], followUps: [], unknownTerms: [],
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日概览</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
            })}
          </p>
        </div>
      </div>

      {/* Full-width layout */}
      <div className="space-y-4">
        <ThresholdReminder count={d.unknownCount} />

        <div className="grid grid-cols-1 gap-3">
          <PriorityCard title="必须解决" priority="MUST" tasks={d.mustTasks} />
          <PriorityCard title="重点关注" priority="FOCUS" tasks={d.focusTasks} />
        </div>

        <FollowUpCard items={d.followUps} />

        <UnknownTermsCloud terms={d.unknownTerms} />
      </div>
    </div>
  )
}
