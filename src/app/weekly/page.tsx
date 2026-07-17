'use client'

import { useState, useEffect } from 'react'
import { WeekSelector } from '@/components/reports/WeekSelector'
import { WeeklyReportView } from '@/components/reports/WeeklyReportView'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

interface WeeklyReportData {
  id: string
  weekNumber: number | null
  dateRange: string
  content: string
  createdAt: string
}

export default function WeeklyPage() {
  const [reports, setReports] = useState<WeeklyReportData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/reports?type=WEEKLY&pageSize=50')
    const data = await res.json()
    const list: WeeklyReportData[] = data.reports || data
    setReports(list)
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const selectedReport = reports.find(r => r.id === selectedId) || null

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'WEEKLY' }),
      })
      if (res.ok) {
        const newReport = await res.json()
        showToast('周报生成成功 ✅')
        await fetchData()
        setSelectedId(newReport.id)
      } else {
        showToast('生成失败，请重试')
      }
    } catch {
      showToast('生成失败，请重试')
    }
    setGenerating(false)
  }

  const handleCopy = async () => {
    if (!selectedReport?.content) return
    await navigator.clipboard.writeText(selectedReport.content)
    showToast('已复制到剪贴板 📋')
  }

  const handleDownload = () => {
    if (!selectedReport) return
    const weekLabel = selectedReport.weekNumber ? `第${selectedReport.weekNumber}周` : selectedReport.dateRange
    const blob = new Blob([selectedReport.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `周报-${weekLabel}-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async (content: string) => {
    if (!selectedReport) return
    await fetch(`/api/reports/${selectedReport.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    showToast('保存成功 ✅')
    fetchData()
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 周报</h1>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 周报</h1>
        <EmptyState
          icon="📊"
          title="暂无周报"
          description="点击下方按钮生成本周周报"
          action={{ label: '🔄 生成本周周报', onClick: handleGenerate }}
        />
        {toast && (
          <div className="fixed top-4 right-4 z-[60] px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-toast">
            {toast}
          </div>
        )}
      </div>
    )
  }

  const weeks = reports.map(r => ({
    id: r.id,
    weekNumber: r.weekNumber,
    dateRange: r.dateRange,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">📊 周报</h1>
        <Button variant="primary" onClick={handleGenerate} disabled={generating}>
          {generating ? '⏳ 生成中...' : '🔄 生成本周周报'}
        </Button>
      </div>

      {/* 6.8: Week selector */}
      <WeekSelector weeks={weeks} selectedId={selectedId} onSelect={setSelectedId} />

      {/* 6.9: Report view */}
      {selectedReport ? (
        <WeeklyReportView
          content={selectedReport.content}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onSave={handleSave}
        />
      ) : (
        <p className="text-center text-gray-400 py-12">请选择一个周报</p>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-toast">
          {toast}
        </div>
      )}
    </div>
  )
}
