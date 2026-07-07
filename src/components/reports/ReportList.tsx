'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ReportData {
  id: string
  type: string
  dateRange: string
  content: string
  createdAt: string
}

export function ReportList({ reports }: { reports: ReportData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleDownload = (report: ReportData) => {
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.type === 'DAILY' ? '日报' : '周报'}-${report.dateRange}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (reports.length === 0) {
    return <div className="text-center text-gray-400 py-12">暂无报告</div>
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const isExpanded = expandedId === report.id
        const isEditing = editingId === report.id

        // Extract summary (first heading or first line)
        const summaryMatch = report.content.match(/^##\s+(.+)/m)
        const summary = summaryMatch ? summaryMatch[1] : report.content.slice(0, 80)

        return (
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    report.type === 'DAILY' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {report.type === 'DAILY' ? '日报' : '周报'}
                  </span>
                  <span className="text-sm text-gray-500">{report.dateRange}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{summary}</p>
              </div>
              <span className="text-gray-400 text-sm">{isExpanded ? '收起' : '展开'}</span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                {isEditing ? (
                  <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[200px] font-mono outline-none focus:border-primary"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                ) : (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {report.content}
                  </pre>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" onClick={() => handleCopy(report.content)}>
                    复制全文
                  </Button>
                  <Button variant="ghost" onClick={() => handleDownload(report)}>
                    下载 Markdown
                  </Button>
                  {isEditing ? (
                    <>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                      <Button variant="primary" onClick={() => {
                        // TODO: save edit via API
                        setEditingId(null)
                      }}>保存</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => {
                      setEditContent(report.content)
                      setEditingId(report.id)
                    }}>编辑</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}