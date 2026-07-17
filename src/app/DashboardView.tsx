'use client'

import Link from 'next/link'
import { Dot } from '@/components/ui/Dot'
import { ThresholdReminder } from '@/components/knowledge/ThresholdReminder'
import { DashboardChat } from '@/components/dashboard/DashboardChat'

interface DashboardViewProps {
  mustCount: number
  focusCount: number
  delegationCount: number
  unknownCount: number
}

export function DashboardView({ mustCount, focusCount, delegationCount, unknownCount }: DashboardViewProps) {
  return (
    <div>
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

      {/* Two-column layout: left=overview, right=AI chat */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Overview cards */}
        <div className="lg:w-3/5 space-y-4">
          <ThresholdReminder count={unknownCount} />

          <div className="grid grid-cols-2 gap-3">
            <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Dot color="red" />
                <h3 className="font-semibold text-sm text-gray-900">必须解决</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{mustCount}</p>
              <p className="text-xs text-gray-400 mt-1">今日必须完成</p>
            </Link>

            <Link href="/tasks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Dot color="amber" />
                <h3 className="font-semibold text-sm text-gray-900">重点关注</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{focusCount}</p>
              <p className="text-xs text-gray-400 mt-1">需要关注的任务</p>
            </Link>

            <Link href="/delegation" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Dot color="amber" />
                <h3 className="font-semibold text-sm text-gray-900">待追问</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{delegationCount}</p>
              <p className="text-xs text-gray-400 mt-1">等待追问的委托</p>
            </Link>

            <Link href="/knowledge?type=TERM&status=UNKNOWN" className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Dot color="red" />
                <h3 className="font-semibold text-sm text-gray-900">待了解名词</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{unknownCount}</p>
              <p className="text-xs text-gray-400 mt-1">{unknownCount >= 5 ? '📚 有空集中查阅吧' : '保持学习'}</p>
            </Link>
          </div>
        </div>

        {/* Right column: AI Chat */}
        <div className="lg:w-2/5 lg:min-h-[calc(100vh-8rem)] lg:sticky lg:top-6">
          <DashboardChat />
        </div>
      </div>
    </div>
  )
}