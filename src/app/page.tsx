'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dot } from '@/components/ui/Dot'
import { Button } from '@/components/ui/Button'
import { ThresholdReminder } from '@/components/knowledge/ThresholdReminder'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [counts, setCounts] = useState({ must: 0, focus: 0, delegation: 0, unknown: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks?from=0').then(r => r.json()),
      fetch('/api/delegation?status=active').then(r => r.json()),
      fetch('/api/knowledge?type=TERM&status=UNKNOWN').then(r => r.json()),
    ]).then(([tasks, delegations, terms]) => {
      setCounts({
        must: tasks.filter((t: { priority: string }) => t.priority === 'MUST').length,
        focus: tasks.filter((t: { priority: string }) => t.priority === 'FOCUS').length,
        delegation: delegations.length,
        unknown: terms.length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日概览</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ThresholdReminder count={counts.unknown} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2"><Dot color="red" /><h3 className="font-semibold text-sm text-gray-900">必须解决</h3></div>
            <p className="text-2xl font-bold text-gray-900">{counts.must}</p>
            <p className="text-xs text-gray-400 mt-1">今日必须完成的任务</p>
          </Link>
          <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2"><Dot color="amber" /><h3 className="font-semibold text-sm text-gray-900">重点关注</h3></div>
            <p className="text-2xl font-bold text-gray-900">{counts.focus}</p>
            <p className="text-xs text-gray-400 mt-1">需要关注的任务</p>
          </Link>
          <Link href="/delegation" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2"><Dot color="amber" /><h3 className="font-semibold text-sm text-gray-900">待追问</h3></div>
            <p className="text-2xl font-bold text-gray-900">{counts.delegation}</p>
            <p className="text-xs text-gray-400 mt-1">等待追问的委托</p>
          </Link>
          <Link href="/knowledge?type=TERM&status=UNKNOWN" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2"><Dot color="red" /><h3 className="font-semibold text-sm text-gray-900">待了解名词</h3></div>
            <p className="text-2xl font-bold text-gray-900">{counts.unknown}</p>
            <p className="text-xs text-gray-400 mt-1">{counts.unknown >= 5 ? '📚 有空集中查阅吧' : '保持学习'}</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">AI 助手</h3>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="输入消息... 如：记一下K8s不懂" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/chat?q=${encodeURIComponent(input)}`) }} />
            <Button variant="primary" onClick={() => router.push(`/chat?q=${encodeURIComponent(input)}`)}>发送</Button>
          </div>
        </div>
      </div>
    </div>
  )
}