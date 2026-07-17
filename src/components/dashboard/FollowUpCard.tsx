'use client'

import { useState } from 'react'

interface FollowUpItem {
  id: string
  type: 'delegation' | 'todo'
  title: string
  status: string
  assignee?: string
  dueDate?: string
  followUpTime?: string
}

interface FollowUpCardProps {
  items: FollowUpItem[]
}

export function FollowUpCard({ items }: FollowUpCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'delegation' | 'todo' | 'done'>('all')
  const [quickInput, setQuickInput] = useState('')

  const openCount = items.filter(i => i.status !== 'DONE' && i.status !== 'RESOLVED').length

  const filteredItems = items.filter((item) => {
    switch (activeTab) {
      case 'delegation': return item.type === 'delegation' && item.status !== 'RESOLVED'
      case 'todo': return item.type === 'todo' && item.status !== 'DONE'
      case 'done': return item.status === 'DONE' || item.status === 'RESOLVED'
      default: return item.status !== 'DONE' && item.status !== 'RESOLVED'
    }
  })

  const counts = {
    all: items.filter(i => i.status !== 'DONE' && i.status !== 'RESOLVED').length,
    delegation: items.filter(i => i.type === 'delegation' && i.status !== 'RESOLVED').length,
    todo: items.filter(i => i.type === 'todo' && i.status !== 'DONE').length,
    done: items.filter(i => i.status === 'DONE' || i.status === 'RESOLVED').length,
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="text-lg">📌</span>
        <h3 className="font-semibold text-sm text-gray-900">待跟进 ({openCount}项)</h3>
        <span className="ml-auto text-xs text-gray-400">
          {expanded ? '收起 ▲' : '展开 ▼'}
        </span>
      </button>

      {/* Collapsed preview: first 2 items */}
      {!expanded && items.length > 0 && (
        <div className="mt-2 space-y-1">
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className="text-sm text-gray-600 pl-7">
              {item.title}
              {item.type === 'delegation' && item.assignee && (
                <span className="text-xs text-gray-400 ml-2">→{item.assignee}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="mt-3 space-y-3 animate-expand">
          {/* AI Quick Input */}
          <div className="flex gap-2 pl-7">
            <textarea
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              placeholder="AI 快速输入：如「完成需求文档」「张三找我...转给李四」"
              rows={2}
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
            />
            <button
              className="shrink-0 self-end px-3 py-1.5 bg-primary text-white text-xs rounded-lg"
              onClick={() => setQuickInput('')}
            >
              发送
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-100 pb-2">
            {(['all', 'delegation', 'todo', 'done'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-50 text-primary font-medium'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab === 'all' && '全部'}
                {tab === 'delegation' && '委托追问'}
                {tab === 'todo' && '我的TODO'}
                {tab === 'done' && '已完成'}
                <span className="ml-1 text-gray-400">({counts[tab]})</span>
              </button>
            ))}
          </div>

          {/* Item list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">暂无事项</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 text-sm ${
                    item.status === 'DONE' || item.status === 'RESOLVED'
                      ? 'line-through text-gray-400 opacity-55 bg-gray-50 rounded px-2 py-1'
                      : 'text-gray-700'
                  }`}
                >
                  {item.type === 'todo' && (
                    <input type="checkbox" className="shrink-0 rounded border-gray-300" defaultChecked={item.status === 'DONE'} />
                  )}
                  <span className="flex-1">{item.title}</span>
                  {item.type === 'delegation' && item.assignee && (
                    <span className="text-xs text-gray-400">→{item.assignee}</span>
                  )}
                  {item.followUpTime && (
                    <span className="text-xs text-gray-400">{item.followUpTime}</span>
                  )}
                  {item.type === 'delegation' && item.status === 'WAITING' && (
                    <button className="text-xs text-primary px-2 py-0.5 rounded border border-primary/30 hover:bg-blue-50">
                      已追问
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
