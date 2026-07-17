'use client'

import { useState } from 'react'

interface WeeklyReportViewProps {
  content: string
  onCopy: () => void
  onDownload: () => void
  onSave: (content: string) => Promise<void>
}

export function WeeklyReportView({ content, onCopy, onDownload, onSave }: WeeklyReportViewProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editContent)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {editing ? (
        <div className="space-y-3">
          <textarea
            className="w-full h-96 border border-gray-200 rounded-lg p-4 text-sm outline-none focus:border-primary font-mono resize-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditing(false); setEditContent(content) }}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-sm text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6 leading-relaxed">
            {content}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={onCopy}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              📋 复制全文
            </button>
            <button
              onClick={() => { setEditing(true); setEditContent(content) }}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              ✏️ 编辑
            </button>
            <button
              onClick={onDownload}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              📥 下载 Markdown
            </button>
          </div>
        </>
      )}
    </div>
  )
}
