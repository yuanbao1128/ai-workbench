'use client'

interface TaskData {
  id: string
  title: string
  priority: string
  status: string
  dueDate: string | null
}

const priorityLabels: Record<string, string> = {
  MUST: '必须解决',
  FOCUS: '重点关注',
  NORMAL: '普通',
}

const priorityBorderColors: Record<string, string> = {
  MUST: 'border-l-red-500',
  FOCUS: 'border-l-amber-500',
  NORMAL: 'border-l-gray-200',
}

export function DayDetail({
  tasks,
  onToggle,
}: {
  tasks: TaskData[]
  onToggle: (id: string, currentStatus: string) => void
}) {
  const grouped = {
    MUST: tasks.filter((t) => t.priority === 'MUST' && t.status !== 'DONE'),
    FOCUS: tasks.filter((t) => t.priority === 'FOCUS' && t.status !== 'DONE'),
    NORMAL: tasks.filter((t) => t.priority === 'NORMAL' && t.status !== 'DONE'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  }

  if (tasks.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">暂无任务</div>
  }

  return (
    <div className="space-y-4">
      {(['MUST', 'FOCUS', 'NORMAL'] as const).map((priority) => {
        const items = grouped[priority]
        if (items.length === 0) return null
        return (
          <div key={priority}>
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
              {priorityLabels[priority]} ({items.length})
            </h3>
            <div className="space-y-1">
              {items.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200 border-l-2 ${priorityBorderColors[priority]}`}
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggle(task.id, task.status)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-800 flex-1">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {grouped.DONE.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-2">
            已完成 ({grouped.DONE.length})
          </h3>
          <div className="space-y-1 opacity-50">
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