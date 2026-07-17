'use client'

import Link from 'next/link'
import { Dot } from '@/components/ui/Dot'

interface TaskItem {
  id: string
  title: string
  priority?: string
  dueDate?: string
  status: string
}

interface PriorityCardProps {
  title: string
  priority: 'MUST' | 'FOCUS'
  tasks: TaskItem[]
}

export function PriorityCard({ title, priority, tasks }: PriorityCardProps) {
  const dotColor = priority === 'MUST' ? 'red' : 'amber'
  const displayTasks = tasks.slice(0, 3)
  const overflow = tasks.length - 3

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <Link href="/tasks" className="flex items-center gap-2 mb-3 hover:underline">
        <Dot color={dotColor} />
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <span className="ml-auto text-2xl font-bold text-gray-900">{tasks.length}</span>
      </Link>

      {/* Task list */}
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">暂无任务</p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <Link
              key={task.id}
              href="/tasks"
              className="flex items-start gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <input
                type="checkbox"
                className="mt-0.5 shrink-0 rounded border-gray-300"
                defaultChecked={task.status === 'DONE'}
                onClick={(e) => e.stopPropagation()}
                onChange={() => {}}
              />
              <span className="flex-1 line-clamp-1">{task.title}</span>
              {task.dueDate && (
                <span className="text-xs text-gray-400 shrink-0">{task.dueDate}</span>
              )}
            </Link>
          ))}
          {overflow > 0 && (
            <p className="text-xs text-gray-400 pl-5">+{overflow} 条</p>
          )}
        </div>
      )}
    </div>
  )
}
