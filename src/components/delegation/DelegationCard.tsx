'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConclusionModal } from './ConclusionModal'

interface DelegationData {
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

const statusBadge: Record<string, { variant: 'amber' | 'blue' | 'green'; label: string }> = {
  WAITING: { variant: 'amber', label: '等待中' },
  ASKED: { variant: 'blue', label: '已追问' },
  REPLIED: { variant: 'blue', label: '已回复' },
  RESOLVED: { variant: 'green', label: '已解决' },
}

export function DelegationCard({
  delegation,
  onUpdate,
  onDelete,
}: {
  delegation: DelegationData
  onUpdate: (id: string, data: Record<string, unknown>) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showConclusion, setShowConclusion] = useState(false)

  const badge = statusBadge[delegation.status] || { variant: 'gray' as const, label: delegation.status }
  const timeline = JSON.parse(delegation.timeline || '[]')
  const followUpTimes = JSON.parse(delegation.followUpTimes || '[]')

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900">{delegation.title}</h3>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>

        {/* Basic info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span>转给：{delegation.assignee}</span>
          {delegation.source && <span>来源：{delegation.source}</span>}
          <span>{new Date(delegation.createdAt).toLocaleString('zh-CN')}</span>
        </div>

        {/* Follow-up times */}
        {followUpTimes.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span>追问时间：</span>
            {followUpTimes.map((time: string, i: number) => (
              <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded">
                {new Date(time).toLocaleString('zh-CN')}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {delegation.status === 'WAITING' && (
            <Button
              variant="ghost"
              onClick={() => onUpdate(delegation.id, { status: 'ASKED' })}
            >
              已追问
            </Button>
          )}
          {delegation.status !== 'RESOLVED' && (
            <Button
              variant="ghost"
              onClick={() => setShowConclusion(true)}
            >
              记录结论
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => onDelete(delegation.id)}
          >
            删除
          </Button>
        </div>

        {/* Expanded timeline */}
        {expanded && timeline.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">时间线</h4>
            <div className="space-y-2">
              {timeline.map((entry: { timestamp: string; action: string; detail: string }, i: number) => {
                const dotColor = entry.action === 'created' ? 'bg-orange-500' :
                  entry.action === 'asked' ? 'bg-green-500' :
                  'bg-gray-300'
                return (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                    <div>
                      <span className="text-gray-400 text-xs">
                        {new Date(entry.timestamp).toLocaleString('zh-CN')}
                      </span>
                      <span className="text-gray-700 ml-2">{entry.detail}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {delegation.conclusion && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-1">结论</h4>
            <p className="text-sm text-gray-700">{delegation.conclusion}</p>
          </div>
        )}
      </div>

      <ConclusionModal
        open={showConclusion}
        onClose={() => setShowConclusion(false)}
        onSave={(conclusion, status) => {
          onUpdate(delegation.id, { conclusion, status })
        }}
      />
    </>
  )
}