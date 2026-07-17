'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WeekCalendar } from '@/components/tasks/WeekCalendar'
import { DayDetail } from '@/components/tasks/DayDetail'
import { LegacyIssueList } from '@/components/tasks/LegacyIssueList'
import { Tab } from '@/components/ui/Tab'

interface TaskItem {
  id: string; title: string; priority: string; status: string; dueDate: string | null
}
interface IssueItem {
  id: string; title: string; plannedDate: string | null; status: string; tags: string; createdAt: string
}

export function TasksView({ tasks, issues }: { tasks: TaskItem[]; issues: IssueItem[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'schedule' | 'legacy'>('schedule')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // 5.2: Keyboard shortcuts for week navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only when on schedule tab
      if (activeTab !== 'schedule') return
      // Don't fire when focusing input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentWeek((prev) => {
          const d = new Date(prev)
          d.setDate(d.getDate() - 7)
          return d
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentWeek((prev) => {
          const d = new Date(prev)
          d.setDate(d.getDate() + 7)
          return d
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  const handleToggleTask = async (id: string, status: string) => {
    const newStatus = status === 'DONE' ? 'TODO' : 'DONE'
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  const handleToggleIssue = async (id: string, status: string) => {
    const newStatus = status === 'RESOLVED' ? 'PENDING' : 'RESOLVED'
    await fetch(`/api/legacy-issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  const taskCounts: Record<string, { must: number; focus: number; normal: number }> = {}
  for (const task of tasks) {
    if (task.dueDate) {
      const dateStr = new Date(task.dueDate).toISOString().split('T')[0]
      if (!taskCounts[dateStr]) taskCounts[dateStr] = { must: 0, focus: 0, normal: 0 }
      const key = task.priority.toLowerCase() as 'must' | 'focus' | 'normal'
      if (key in taskCounts[dateStr]) taskCounts[dateStr][key]++
    }
  }

  const dayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toISOString().split('T')[0] === selectedDate
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">日程表</h1>
      <div className="flex gap-1 mb-4">
        <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
          日程表
        </Tab>
        <Tab active={activeTab === 'legacy'} onClick={() => setActiveTab('legacy')}>
          遗留问题
        </Tab>
      </div>

      {activeTab === 'schedule' ? (
        <div>
          <WeekCalendar
            currentWeek={currentWeek}
            selectedDate={selectedDate}
            taskCounts={taskCounts}
            followUpCounts={{}}
            onDateSelect={setSelectedDate}
            onPrevWeek={() => {
              const d = new Date(currentWeek)
              d.setDate(d.getDate() - 7)
              setCurrentWeek(d)
            }}
            onNextWeek={() => {
              const d = new Date(currentWeek)
              d.setDate(d.getDate() + 7)
              setCurrentWeek(d)
            }}
          />
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{selectedDate} 任务</h2>
            <DayDetail tasks={dayTasks} onToggle={handleToggleTask} />
          </div>
        </div>
      ) : (
        <LegacyIssueList issues={issues} onToggle={handleToggleIssue} />
      )}
    </div>
  )
}