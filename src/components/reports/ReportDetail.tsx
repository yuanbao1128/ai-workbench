'use client'

import { useState } from 'react'

interface ReportData {
  id: string
  type: string
  dateRange: string
  content: string
  createdAt: string
}

interface ReportDetailProps {
  report: ReportData
  onClose: () => void
  onSave?: (id: string, content: string) => Promise<void>
}

export function ReportDetail({ report, onClose, onSave }: ReportDetailProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(report.content)
  const [saving, setSaving] = useState(false)

  const isDaily = report.type === 'DAILY'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.content)
  }

  const handleDownload = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${isDaily ? '日报' : '周报'}-${report.dateRange}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(report.id, editContent)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] mx-4 flex flex-col animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isDaily ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}
            >
              {isDaily ? '日报' : '周报'}
            </span>
            <span className="text-sm text-gray-500">{report.dateRange}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-3 flex-1">
          {editing ? (
            <textarea
              className="w-full h-80 border border-gray-200 rounded-lg p-4 text-sm outline-none focus:border-primary font-mono resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {report.content}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-3 border-t border-gray-100">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            📋 复制全文
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            📥 下载
          </button>
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setEditContent(report.content) }}
                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-xs text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </>
          ) : (
            <button
              onClick={() => { setEditing(true); setEditContent(report.content) }}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
            >
              ✏️ 编辑
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
