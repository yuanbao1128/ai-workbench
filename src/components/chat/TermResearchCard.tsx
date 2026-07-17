'use client'

interface TermResearchCardProps {
  title: string
  status: 'UNKNOWN' | 'KNOWN'
  content?: string
  tags?: string[]
  source?: string
  createdAt?: string
  onViewDetail?: () => void
  onMarkKnown?: () => void
  onEdit?: () => void
}

export function TermResearchCard({
  title,
  status,
  content,
  tags,
  source,
  createdAt,
  onViewDetail,
  onMarkKnown,
  onEdit,
}: TermResearchCardProps) {
  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          术语
        </span>
        <span className={`w-2 h-2 rounded-full ${status === 'KNOWN' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-400">
          {status === 'KNOWN' ? '已了解' : '待了解'}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-gray-900 mb-1">{title}</h4>

      {/* Content preview */}
      {content && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{content}</p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 rounded-full text-xs text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
        {onViewDetail && (
          <button onClick={onViewDetail} className="px-2 py-1 text-xs text-gray-500 hover:text-primary hover:bg-blue-50 rounded transition-colors">
            📖 查看详情
          </button>
        )}
        {onMarkKnown && (
          <button onClick={onMarkKnown} className="px-2 py-1 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
            ✅ 标记已了解
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="px-2 py-1 text-xs text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors">
            ✏️ 编辑
          </button>
        )}
        {source && (
          <span className="ml-auto text-xs text-gray-400">来源：{source}</span>
        )}
        {createdAt && (
          <span className="text-xs text-gray-400">{createdAt}</span>
        )}
      </div>
    </div>
  )
}
