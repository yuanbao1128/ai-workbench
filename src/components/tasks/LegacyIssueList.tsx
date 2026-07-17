'use client'

import { useState } from 'react'
import { isOverdue } from '@/lib/date-utils'

interface LegacyIssueData {
  id: string
  title: string
  plannedDate: string | null
  status: string
  tags: string
  createdAt: string
}

function getDaysOverdue(plannedDate: string): number {
  const planned = new Date(plannedDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  planned.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24))
}

export function LegacyIssueList({
  issues,
  onToggle,
}: {
  issues: LegacyIssueData[]
  onToggle: (id: string, currentStatus: string) => void
}) {
  const [showResolved, setShowResolved] = useState(false)

  const active = issues.filter((i) => i.status === 'PENDING')
  const resolved = issues.filter((i) => i.status === 'RESOLVED')

  if (issues.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">暂无遗留问题</div>
  }

  return (
    <div className="space-y-4">
      {/* Active issues */}
      {active.map((issue) => {
        const overdue = issue.plannedDate && isOverdue(new Date(issue.plannedDate))
        const daysOverdue = issue.plannedDate && overdue
          ? getDaysOverdue(issue.plannedDate)
          : 0
        const tags = JSON.parse(issue.tags || '[]')

        return (
          <div
            key={issue.id}
            className={`p-3 rounded-lg border-l-2 ${
              overdue
                ? 'bg-red-50 border-l-red-500'
                : 'bg-orange-50 border-l-orange-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={false}
                onChange={() => onToggle(issue.id, issue.status)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-800">{issue.title}</span>
                {overdue && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                    已逾期 {daysOverdue} 天
                  </span>
                )}
              </div>
            </div>
            {(tags.length > 0 || issue.plannedDate) && (
              <div className="flex items-center gap-2 mt-2 ml-7">
                {tags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 bg-white/60 rounded text-gray-500">
                    {tag}
                  </span>
                ))}
                {issue.plannedDate && (
                  <span className="text-xs text-gray-400">
                    计划: {new Date(issue.plannedDate).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 5.5: Resolved issues — collapsible */}
      {resolved.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 mb-2 transition-colors cursor-pointer"
          >
            <span>{showResolved ? '▼' : '▶'}</span>
            <span>已解决 ({resolved.length})</span>
          </button>
          {showResolved && (
            <div className="space-y-1 opacity-55 animate-expand">
              {resolved.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200"
                >
                  <input type="checkbox" checked readOnly className="w-4 h-4" />
                  <span className="text-sm text-gray-400 line-through">{issue.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
