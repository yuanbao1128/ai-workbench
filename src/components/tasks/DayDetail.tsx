'use client'

interface TaskData {
  id: string
  title: string
  priority: string
  status: string
  dueDate: string | null
}

interface FollowUpItem {
  id: string
  title: string
  type: 'todo' | 'delegation'
  dueDate: string | null
  assignee?: string
}

const priorityLabels: Record<string, string> = {
  MUST: '必须解决',
  FOCUS: '重点关注',
  NORMAL: '普通',
}

const priorityEmoji: Record<string, string> = {
  MUST: '🔴',
  FOCUS: '🟡',
  NORMAL: '',
}

const priorityBadgeClass: Record<string, string> = {
  MUST: 'badge-red',
  FOCUS: 'badge-amber',
  NORMAL: 'badge-gray',
}

const priorityBorderColors: Record<string, string> = {
  MUST: 'border-l-red-500',
  FOCUS: 'border-l-amber-500',
  NORMAL: 'border-l-gray-200',
}

function formatTaskTime(dueDate: string | null): string | null {
  if (!dueDate) return null
  try {
    const d = new Date(dueDate)
    // Check if there's a time component (not midnight)
    if (d.getHours() !== 0 || d.getMinutes() !== 0) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  } catch { /* ignore */ }
  return null
}

export function DayDetail({
  tasks,
  followUps = [],
  onToggle,
}: {
  tasks: TaskData[]
  followUps?: FollowUpItem[]
  onToggle: (id: string, currentStatus: string) => void
}) {
  const grouped = {
    MUST: tasks.filter((t) => t.priority === 'MUST' && t.status !== 'DONE'),
    FOCUS: tasks.filter((t) => t.priority === 'FOCUS' && t.status !== 'DONE'),
    NORMAL: tasks.filter((t) => t.priority === 'NORMAL' && t.status !== 'DONE'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  }

  const hasContent = tasks.length > 0 || followUps.length > 0

  if (!hasContent) {
    return <div className="text-center text-gray-400 py-8 text-sm">暂无任务</div>
  }

  return (
    <div className="space-y-4">
      {/* Priority groups: MUST, FOCUS, NORMAL */}
      {(['MUST', 'FOCUS', 'NORMAL'] as const).map((priority) => {
        const items = grouped[priority]
        if (items.length === 0) return null
        const emoji = priorityEmoji[priority]
        const label = priorityLabels[priority]

        return (
          <div key={priority}>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              {emoji && <span>{emoji}</span>}
              <span>{label}</span>
              <span className="text-xs text-gray-400">({items.length})</span>
            </div>
            <div className="space-y-2">
              {items.map((task) => {
                const time = formatTaskTime(task.dueDate)
                return (
                  <div
                    key={task.id}
                    className={`card p-3 bg-gray-50 priority-${priority.toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => onToggle(task.id, task.status)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                          {time && (
                            <div className="text-xs text-gray-400 mt-0.5">⏰ {time}</div>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${priorityBadgeClass[priority]} text-xs`}>
                        {label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* 5.6: Follow-up group (purple) */}
      {followUps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-purple-500 mb-2">
            <span>📌</span>
            <span>待跟进（来自&ldquo;待跟进&rdquo;模块）</span>
          </div>
          <div className="space-y-2">
            {followUps.map((item) => {
              const dateLabel = item.dueDate
                ? new Date(item.dueDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
                : null
              return (
                <div key={item.id} className="card p-3 bg-purple-50 border-l-3 border-l-purple-400">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>📌</span>
                      <span className="font-medium text-gray-900">
                        {item.assignee ? `${item.title} → 回复${item.assignee}` : item.title}
                      </span>
                    </div>
                    {dateLabel && (
                      <span className="text-xs text-purple-500">📅 截止 {dateLabel}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5.8: Completed group */}
      {grouped.DONE.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-2">
            ✅ 已完成 ({grouped.DONE.length})
          </h3>
          <div className="space-y-1 opacity-55">
            {grouped.DONE.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200"
              >
                <input type="checkbox" checked readOnly className="w-4 h-4" />
                <span className="text-sm text-gray-400 line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
