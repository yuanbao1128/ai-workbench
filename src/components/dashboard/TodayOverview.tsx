'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dot } from '@/components/ui/Dot'

export function TodayOverview() {
  const [tasks, setTasks] = useState<{ must: number; focus: number; normal: number }>({ must: 0, focus: 0, normal: 0 })
  const [delegations, setDelegations] = useState(0)
  const [unknownTerms, setUnknownTerms] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      fetch(`/api/tasks?from=${today}&to=${today}`).then(r => r.json()),
      fetch('/api/delegation?status=active').then(r => r.json()),
      fetch('/api/knowledge?type=TERM&status=UNKNOWN').then(r => r.json()),
    ]).then(([tasksData, delegationsData, termsData]) => {
      setTasks({
        must: tasksData.filter((t: { priority: string }) => t.priority === 'MUST').length,
        focus: tasksData.filter((t: { priority: string }) => t.priority === 'FOCUS').length,
        normal: tasksData.filter((t: { priority: string }) => t.priority === 'NORMAL').length,
      })
      setDelegations(delegationsData.length)
      setUnknownTerms(termsData.length)
    }).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Must solve */}
      <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Dot color="red" />
          <h3 className="font-semibold text-sm text-gray-900">必须解决</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{tasks.must}</p>
        <p className="text-xs text-gray-400 mt-1">今日必须完成的任务</p>
      </Link>

      {/* Focus */}
      <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Dot color="amber" />
          <h3 className="font-semibold text-sm text-gray-900">重点关注</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{tasks.focus}</p>
        <p className="text-xs text-gray-400 mt-1">需要关注的任务</p>
      </Link>

      {/* Delegations */}
      <Link href="/delegation" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Dot color="amber" />
          <h3 className="font-semibold text-sm text-gray-900">待追问</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{delegations}</p>
        <p className="text-xs text-gray-400 mt-1">等待追问的委托</p>
      </Link>

      {/* Unknown terms */}
      <Link href="/knowledge?type=TERM&status=UNKNOWN" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Dot color="red" />
          <h3 className="font-semibold text-sm text-gray-900">待了解名词</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{unknownTerms}</p>
        <p className="text-xs text-gray-400 mt-1">{unknownTerms >= 5 ? '📚 有空集中查阅吧' : '保持学习'}</p>
      </Link>
    </div>
  )
}