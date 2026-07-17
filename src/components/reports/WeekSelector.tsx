'use client'

interface WeekSelectorProps {
  weeks: Array<{ id: string; weekNumber: number | null; dateRange: string }>
  selectedId: string | null
  onSelect: (id: string) => void
}

export function WeekSelector({ weeks, selectedId, onSelect }: WeekSelectorProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
      {weeks.map((w) => (
        <button
          key={w.id}
          onClick={() => onSelect(w.id)}
          className={`shrink-0 px-3 py-1.5 text-xs rounded-full transition-colors whitespace-nowrap ${
            selectedId === w.id
              ? 'bg-primary text-white font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {w.weekNumber ? `第${w.weekNumber}周` : w.dateRange}
        </button>
      ))}
    </div>
  )
}
