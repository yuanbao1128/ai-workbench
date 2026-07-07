'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Dot } from '@/components/ui/Dot'

interface CardDetail {
  id: string
  title: string
  type: string
  status: string
  content: string | null
  keyConcepts: string
  relatedCards: string
  source: string | null
  history: string
  createdAt: string
  updatedAt: string
}

const typeLabels: Record<string, string> = {
  TERM: '术语', DESIGN: '方案', INSPIRATION: '灵感',
  MEETING: '纪要', QUESTION: '问题',
}

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [card, setCard] = useState<CardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetch(`/api/knowledge/${id}`)
      .then(res => res.json())
      .then(data => {
        setCard(data)
        setEditContent(data.content || '')
        setLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    if (!card) return
    const res = await fetch(`/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })
    const updated = await res.json()
    setCard(updated)
    setEditing(false)
  }

  const handleToggleStatus = async () => {
    if (!card || card.type !== 'TERM') return
    const newStatus = card.status === 'KNOWN' ? 'UNKNOWN' : 'KNOWN'
    const res = await fetch(`/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const updated = await res.json()
    setCard(updated)
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这张卡片？')) return
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
    router.push('/knowledge')
  }

  if (loading) return <div className="text-center text-gray-400 py-12">加载中...</div>
  if (!card) return <div className="text-center text-gray-400 py-12">卡片不存在</div>

  const history = JSON.parse(card.history || '[]')
  const keyConcepts = JSON.parse(card.keyConcepts || '[]')
  const relatedCards = JSON.parse(card.relatedCards || '[]')

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
      >
        ← 返回
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{card.title}</h1>
          <Badge variant="blue">{typeLabels[card.type] || card.type}</Badge>
          {card.type === 'TERM' && (
            <span className="flex items-center gap-1">
              <Dot color={card.status === 'KNOWN' ? 'green' : 'red'} />
              <span className="text-xs text-gray-500">
                {card.status === 'KNOWN' ? '已了解' : '待了解'}
              </span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleDelete}>删除</Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-700">
            {card.type === 'TERM' ? '我的理解' : '内容'}
          </h3>
          {!editing ? (
            <Button variant="ghost" onClick={() => setEditing(true)}>编辑</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>取消</Button>
              <Button variant="primary" onClick={handleSave}>保存</Button>
            </div>
          )}
        </div>

        {editing ? (
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[120px] outline-none focus:border-primary"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {card.content || '暂无内容'}
          </p>
        )}
      </div>

      {/* Status toggle (TERM only) */}
      {card.type === 'TERM' && (
        <div className="mb-4">
          <Button
            variant={card.status === 'KNOWN' ? 'ghost' : 'primary'}
            onClick={handleToggleStatus}
          >
            {card.status === 'KNOWN' ? '标记为待了解' : '标记为已了解'}
          </Button>
        </div>
      )}

      {/* Key Concepts */}
      {keyConcepts.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">关键概念</h3>
          <div className="flex gap-1 flex-wrap">
            {keyConcepts.map((concept: string, i: number) => (
              <Tag key={i}>{concept}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Related Cards */}
      {relatedCards.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">关联卡片</h3>
          <div className="text-sm text-gray-500">
            {relatedCards.length} 张关联卡片
          </div>
        </div>
      )}

      {/* Source */}
      {card.source && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">来源</h3>
          <p className="text-sm text-gray-500">{card.source}</p>
        </div>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">编辑历史</h3>
          <div className="space-y-2">
            {history.map((entry: { timestamp: string; action: string; content: string }, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">
                    {new Date(entry.timestamp).toLocaleString('zh-CN')}
                  </span>
                  <span className="text-gray-700 ml-2">{entry.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}