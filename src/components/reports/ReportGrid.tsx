'use client'

import { ReportCard } from './ReportCard'

interface ReportData {
  id: string
  type: string
  dateRange: string
  content: string
  createdAt: string
}

interface ReportGridProps {
  reports: ReportData[]
  onCardClick: (report: ReportData) => void
}

export function ReportGrid({ reports, onCardClick }: ReportGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onClick={onCardClick} />
      ))}
    </div>
  )
}
