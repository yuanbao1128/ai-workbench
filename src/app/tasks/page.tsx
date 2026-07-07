'use client'

import { useState, useEffect, useCallback } from 'react'
import { WeekCalendar } from '@/components/tasks/WeekCalendar'
import { DayDetail } from '@/components/tasks/DayDetail'
import { LegacyIssueList } from '@/components/tasks/LegacyIssueList'
import { Tab } from '@/components/ui/Tab'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

interface TaskItem {
  id: string
  title: string
  priority: string
  status: string
  dueDate: string | null
}

interface LegacyIssueItem {
  id: string
  title: string
  plannedDate: string | null
  status: string
  tags: string
  createdAt: string
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'legacy'>('schedule')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [issues, setIssues] = useState<LegacyIssueItem[]>([])
  const [loading, setLoading] = useState(false)

  const weekStart = getWeekStart(currentWeek)
  const weekEnd = getWeekEnd(currentWeek)
  const weekStartStr = weekStart.toISOString()
  const weekEndStr = weekEnd.toISOString()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const [tasksRes, issuesRes] = await Promise.all([
      fetch(`/api/tasks?from=${weekStartStr}&to=${weekEndStr}`),
      fetch('/api/legacy-issues'),
    ])
    const tasksData = await tasksRes.json()
    const issuesData = await issuesRes.json()
    setTasks(tasksData)
    setIssues(issuesData)
    setLoading(false)
  }, [weekStartStr, weekEndStr])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleToggleTask = async (id: string, status: string) => {
    const newStatus = status === 'DONE' ? 'TODO' : 'DONE'
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchTasks()
  }

  const handleToggleIssue = async (id: string, status: string) => {
    const newStatus = status === 'RESOLVED' ? 'PENDING' : 'RESOLVED'
    await fetch(`/api/legacy-issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchTasks()
  }

  // Compute task counts per day for calendar
  const taskCounts: Record<string, { must: number; focus: number; normal: number }> = {}
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dateStr = new Date(task.dueDate).toISOString().split('T')[0]
      if (!taskCounts[dateStr]) {
        taskCounts[dateStr] = { must: 0, focus: 0, normal: 0 }
      }
      const key = task.priority.toLowerCase() as 'must' | 'focus' | 'normal'
      if (key in taskCounts[dateStr]) {
        taskCounts[dateStr][key]++
      }
    }
  })

  // Filter tasks for selected date
  const dayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toISOString().split('T')[0] === selectedDate
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">日程表</h1>

      {/* Tab switching */}
      <div className="flex gap-1 mb-4">
        <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
          日程表
        </Tab>
        <Tab active={activeTab === 'legacy'} onClick={() => setActiveTab('legacy')}>
          遗留问题
        </Tab>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : activeTab === 'schedule' ? (
        <div>
          <WeekCalendar
            currentWeek={currentWeek}
            selectedDate={selectedDate}
            taskCounts={taskCounts}
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
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {selectedDate} 任务
            </h2>
            <DayDetail tasks={dayTasks} onToggle={handleToggleTask} />
          </div>
        </div>
      ) : (
        <LegacyIssueList issues={issues} onToggle={handleToggleIssue} />
      )}
    </div>
  )
}