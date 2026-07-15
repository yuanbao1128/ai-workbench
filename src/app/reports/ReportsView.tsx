'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export function ReportsView({ reports }: { reports: ReportData[] }) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async (type: 'DAILY' | 'WEEKLY') => {
    setGenerating(true)
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    setGenerating(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">日报 & 周报</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => handleGenerate('DAILY')} disabled={generating}>
            {generating ? '生成中...' : '生成日报'}
          </Button>
          <Button variant="primary" onClick={() => handleGenerate('WEEKLY')} disabled={generating}>
            生成周报
          </Button>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <Tab active={!router} onClick={() => router.push('/reports')}>全部</Tab>
        <Tab active={false} onClick={() => router.push('/reports?type=DAILY')}>日报</Tab>
        <Tab active={false} onClick={() => router.push('/reports?type=WEEKLY')}>周报</Tab>
      </div>

      <ReportList reports={reports} />
    </div>
  )
}