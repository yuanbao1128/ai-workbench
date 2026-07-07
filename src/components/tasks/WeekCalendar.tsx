'use client'

import { getWeekDays, formatDate, isToday } from '@/lib/date-utils'

interface WeekCalendarProps {
  currentWeek: Date
  selectedDate: string
  taskCounts: Record<string, { must: number; focus: number; normal: number }>
  onDateSelect: (dateStr: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function WeekCalendar({
  currentWeek,
  selectedDate,
  taskCounts,
  onDateSelect,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  const days = getWeekDays(currentWeek)
  const weekStart = days[0]
  const weekEnd = days[6]

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrevWeek} className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1">
          ← 上周
        </button>
        <span className="text-sm font-medium text-gray-700">
          {formatDate(weekStart, 'short')} - {formatDate(weekEnd, 'short')}
        </span>
        <button onClick={onNextWeek} className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1">
          下周 →
        </button>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1">
        {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
          <div key={label} className="text-center text-xs text-gray-400 py-1">
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = day.toISOString().split('T')[0]
          const counts = taskCounts[dateStr] || { must: 0, focus: 0, normal: 0 }
          const selected = dateStr === selectedDate
          const today = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`p-2 rounded-lg text-center transition-colors ${
                selected
                  ? 'bg-blue-50 ring-2 ring-primary'
                  : today
                  ? 'bg-blue-50/50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-xs ${today ? 'font-bold text-primary' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                {counts.must > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {counts.focus > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                {counts.normal > 0 && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}