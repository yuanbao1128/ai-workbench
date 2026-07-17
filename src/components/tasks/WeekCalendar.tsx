'use client'

import { getWeekDays, formatDate, isToday } from '@/lib/date-utils'

interface WeekCalendarProps {
  currentWeek: Date
  selectedDate: string
  taskCounts: Record<string, { must: number; focus: number; normal: number }>
  followUpCounts: Record<string, number>
  onDateSelect: (dateStr: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function WeekCalendar({
  currentWeek,
  selectedDate,
  taskCounts,
  followUpCounts,
  onDateSelect,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  const days = getWeekDays(currentWeek)
  const weekStart = days[0]
  const weekEnd = days[6]

  // Month display: "2026年7月"
  const monthLabel = `${currentWeek.getFullYear()}年${currentWeek.getMonth() + 1}月`

  const isWeekend = (day: Date) => {
    const dow = day.getDay()
    return dow === 0 || dow === 6
  }

  return (
    <div className="card p-5">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevWeek}
          className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 transition-colors"
        >
          ◀ 上周
        </button>
        <h3 className="font-semibold text-gray-900 text-sm">{monthLabel}</h3>
        <button
          onClick={onNextWeek}
          className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 transition-colors"
        >
          下周 ▶
        </button>
      </div>

      {/* 7-column day-of-week headers */}
      <div className="grid grid-cols-7 gap-2">
        {['一', '二', '三', '四', '五', '六', '日'].map((label, i) => {
          const dayText = days[i]
          const dateLabel = formatDate(dayText, 'short')
          const weekend = i >= 5
          return (
            <div
              key={label}
              className={`text-center text-xs font-medium py-2 ${weekend ? 'text-gray-300' : 'text-gray-400'}`}
            >
              <div>周{label}</div>
              <div>{dateLabel}</div>
            </div>
          )
        })}

        {/* Day cells */}
        {days.map((day) => {
          // Use local date components to avoid timezone shift
          const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
          const counts = taskCounts[dateStr] || { must: 0, focus: 0, normal: 0 }
          const followUps = followUpCounts[dateStr] || 0
          const selected = dateStr === selectedDate
          const today = isToday(day)
          const weekend = isWeekend(day)

          // Build badge list
          const badges: { label: string; color: string; testId: string }[] = []
          for (let i = 0; i < counts.must; i++) {
            badges.push({ label: '必须', color: 'badge-red', testId: 'task-badge' })
          }
          for (let i = 0; i < counts.focus; i++) {
            badges.push({ label: '重点', color: 'badge-amber', testId: 'task-badge' })
          }
          for (let i = 0; i < counts.normal; i++) {
            badges.push({ label: '任务', color: 'badge-gray', testId: 'task-badge' })
          }
          for (let i = 0; i < followUps; i++) {
            badges.push({ label: '📌', color: 'badge-purple', testId: 'followup-badge' })
          }

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`rounded-lg p-2 min-h-[80px] text-left transition-colors ${
                selected
                  ? 'border-2 border-primary bg-primary-50'
                  : weekend
                  ? 'bg-gray-100'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium ${
                    today
                      ? 'bg-primary text-white rounded-full'
                      : weekend
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {badges.slice(0, 3).map((badge, i) => (
                  <span
                    key={i}
                    data-testid={badge.testId}
                    className={`badge ${badge.color} text-[10px]`}
                  >
                    {badge.label}
                  </span>
                ))}
                {badges.length > 3 && (
                  <span className="text-[10px] text-gray-400">+{badges.length - 3}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
