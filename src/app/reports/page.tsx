'use client'

import { useState, useEffect, useCallback } from 'react'
import { ReportGrid } from '@/components/reports/ReportGrid'
import { ReportDetail } from '@/components/reports/ReportDetail'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tab } from '@/components/ui/Tab'
import { Button } from '@/components/ui/Button'

interface ReportData { id: string; type: string; dateRange: string; content: string; createdAt: string }
interface PaginationMeta { page: number; pageSize: number; total: number; totalPages: number }

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, pageSize: 9, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'DAILY' | 'WEEKLY' | ''>('')
  const [page, setPage] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    params.set('page', String(page))
    params.set('pageSize', '9')
    const res = await fetch(`/api/reports?${params}`)
    const data = await res.json()
    // 6.4: Response includes { reports, pagination }
    setReports(data.reports || data)
    setPagination(data.pagination || { page: 1, pageSize: 9, total: Array.isArray(data) ? data.length : 0, totalPages: 1 })
    setLoading(false)
  }, [filter, page])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [filter])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = async (type: 'DAILY' | 'WEEKLY') => {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) })
      if (res.ok) {
        showToast(type === 'DAILY' ? '日报生成成功 ✅' : '周报生成成功 ✅')
        fetchData()
      } else {
        showToast('生成失败，请重试')
      }
    } catch {
      showToast('生成失败，请重试')
    }
    setGenerating(false)
  }

  const handleSaveReport = async (id: string, content: string) => {
    await fetch(`/api/reports/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    showToast('保存成功 ✅')
    fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">日报 & 周报</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => handleGenerate('DAILY')} disabled={generating}>
            {generating ? '⏳ 生成中...' : '📝 生成日报'}
          </Button>
          <Button variant="primary" onClick={() => handleGenerate('WEEKLY')} disabled={generating}>
            📊 生成周报
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        <Tab active={filter === ''} onClick={() => setFilter('')}>全部</Tab>
        <Tab active={filter === 'DAILY'} onClick={() => setFilter('DAILY')}>日报</Tab>
        <Tab active={filter === 'WEEKLY'} onClick={() => setFilter('WEEKLY')}>周报</Tab>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon="📝"
          title={filter ? `暂无${filter === 'DAILY' ? '日报' : '周报'}` : '暂无报告'}
          description="点击「生成日报」或「生成周报」开始"
        />
      ) : (
        <>
          <ReportGrid reports={reports} onCardClick={setSelectedReport} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Report detail modal */}
      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSave={handleSaveReport}
        />
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
