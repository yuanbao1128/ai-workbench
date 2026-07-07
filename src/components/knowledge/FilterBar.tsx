'use client'

import { Input } from '@/components/ui/Input'
import { Tab } from '@/components/ui/Tab'

const cardTypes = [
  { value: '', label: '全部' },
  { value: 'TERM', label: '术语' },
  { value: 'DESIGN', label: '方案' },
  { value: 'INSPIRATION', label: '灵感' },
  { value: 'MEETING', label: '纪要' },
  { value: 'QUESTION', label: '问题' },
]

const statuses = [
  { value: '', label: '全部' },
  { value: 'UNKNOWN', label: '待了解' },
  { value: 'KNOWN', label: '已了解' },
]

interface FilterBarProps {
  typeFilter: string
  statusFilter: string
  searchQuery: string
  onTypeChange: (type: string) => void
  onStatusChange: (status: string) => void
  onSearchChange: (search: string) => void
}

export function FilterBar({
  typeFilter,
  statusFilter,
  searchQuery,
  onTypeChange,
  onStatusChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3 mb-4">
      {/* Search */}
      <Input
        placeholder="🔍 搜索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Type filter */}
      <div className="flex gap-1 overflow-x-auto">
        {cardTypes.map((t) => (
          <Tab
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => onTypeChange(t.value)}
          >
            {t.label}
          </Tab>
        ))}
      </div>

      {/* Status filter (only relevant for TERM) */}
      {typeFilter === 'TERM' && (
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Tab
              key={s.value}
              active={statusFilter === s.value}
              onClick={() => onStatusChange(s.value)}
            >
              {s.label}
            </Tab>
          ))}
        </div>
      )}
    </div>
  )
}