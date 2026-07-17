'use client'

interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <span className="text-sm text-gray-400">
        {total !== undefined && `共 ${total} 项`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◀
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-sm rounded-lg ${
              p === page
                ? 'bg-primary text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ▶
        </button>
      </div>
    </div>
  )
}
