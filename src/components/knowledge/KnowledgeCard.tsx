'use client'

import Link from 'next/link'
import { Dot } from '@/components/ui/Dot'

interface CardData {
  id: string
  title: string
  type: string
  status: string
  content?: string | null
  createdAt: string
}

const typeLabels: Record<string, string> = {
  TERM: '术语',
  DESIGN: '方案',
  INSPIRATION: '灵感',
  MEETING: '纪要',
  QUESTION: '问题',
}

const typeBadgeColors: Record<string, string> = {
  TERM: 'bg-blue-50 text-blue-600',
  DESIGN: 'bg-purple-50 text-purple-600',
  INSPIRATION: 'bg-amber-50 text-amber-600',
  MEETING: 'bg-green-50 text-green-600',
  QUESTION: 'bg-red-50 text-red-600',
}

export function KnowledgeCard({ card }: { card: CardData }) {
  return (
    <Link
      href={`/knowledge/${card.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all aspect-square p-4 flex flex-col"
    >
      {/* Type badge + Status dot */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[card.type] || 'bg-gray-100 text-gray-500'}`}>
          {typeLabels[card.type] || card.type}
        </span>
        {card.type === 'TERM' && (
          <Dot color={card.status === 'KNOWN' ? 'green' : 'red'} />
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
        {card.title}
      </h3>

      {/* Content preview */}
      {card.content && (
        <p className="text-xs text-gray-500 line-clamp-3 flex-1">
          {card.content}
        </p>
      )}

      {/* Date */}
      <div className="text-xs text-gray-400 mt-auto pt-2">
        {new Date(card.createdAt).toLocaleDateString('zh-CN')}
      </div>
    </Link>
  )
}