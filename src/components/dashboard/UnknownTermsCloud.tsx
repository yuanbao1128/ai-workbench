'use client'

import Link from 'next/link'

interface TermItem {
  id: string
  title: string
}

interface UnknownTermsCloudProps {
  terms: TermItem[]
}

export function UnknownTermsCloud({ terms }: UnknownTermsCloudProps) {
  if (terms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-sm text-gray-400">🎉 没有待了解的名词，继续保持！</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-900">📚 待了解名词</h3>
        <Link
          href="/knowledge?type=TERM&status=UNKNOWN"
          className="text-xs text-primary hover:underline"
        >
          查看全部 →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <Link
            key={term.id}
            href={`/knowledge/${term.id}`}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors border border-gray-200"
          >
            {term.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
