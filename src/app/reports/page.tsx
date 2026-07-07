'use client'

import { useState, useEffect, useCallback } from 'react'
import { ReportList } from '@/components/reports/ReportList'
import { Tab } from '@/components/ui/Tab'
import { Button } from '@/components/ui/Button'

interface ReportData {
  id: string
  type: string
  dateRange: string
  content: string
  createdAt: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'DAILY' | 'WEEKLY' | ''>('')
  const [generating, setGenerating] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    const res = await fetch(`/api/reports?${params}`)
    const data = await res.json()
    setReports(data)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleGenerate = async (type: 'DAILY' | 'WEEKLY') => {
    setGenerating(true)
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    setGenerating(false)
    fetchReports()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">日报 & 周报</h1>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => handleGenerate('DAILY')}
            disabled={generating}
          >
            {generating ? '生成中...' : '生成日报'}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleGenerate('WEEKLY')}
            disabled={generating}
          >
            生成周报
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        <Tab active={filter === ''} onClick={() => setFilter('')}>全部</Tab>
        <Tab active={filter === 'DAILY'} onClick={() => setFilter('DAILY')}>日报</Tab>
        <Tab active={filter === 'WEEKLY'} onClick={() => setFilter('WEEKLY')}>周报</Tab>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : (
        <ReportList reports={reports} />
      )}
    </div>
  )
}