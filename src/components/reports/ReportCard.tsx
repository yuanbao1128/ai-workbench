'use client'

interface ReportData {
  id: string
  type: string
  dateRange: string
  content: string
  createdAt: string
}

interface ReportCardProps {
  report: ReportData
  onClick: (report: ReportData) => void
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  // Extract summary: first heading or first 80 chars
  const summaryMatch = report.content.match(/^##\s+(.+)/m)
  const summary = summaryMatch ? summaryMatch[1] : report.content.slice(0, 80)

  const isDaily = report.type === 'DAILY'
  const dateLabel = isDaily ? report.dateRange : report.dateRange

  return (
    <button
      onClick={() => onClick(report)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col aspect-square"
    >
      {/* Top: Type badge + date */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            isDaily ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}
        >
          {isDaily ? '日报' : '周报'}
        </span>
        <span className="text-xs text-gray-400">{formatReportDate(report.createdAt)}</span>
      </div>

      {/* Middle: Summary (2-line clamp) */}
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 flex-1">
        {summary}
      </p>

      {/* Bottom: Date range */}
      <div className="pt-3 mt-auto border-t border-gray-100">
        <span className="text-xs text-gray-400">{dateLabel}</span>
      </div>
    </button>
  )
}

function formatReportDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
