'use client'

import { useState, useEffect, useCallback } from 'react'
import { WeekCalendar } from '@/components/tasks/WeekCalendar'
import { DayDetail } from '@/components/tasks/DayDetail'
import { LegacyIssueList } from '@/components/tasks/LegacyIssueList'
import { Tab } from '@/components/ui/Tab'
import { getWeekStart, getWeekEnd } from '@/lib/date-utils'

interface TaskItem { id: string; title: string; priority: string; status: string; dueDate: string | null }
interface IssueItem { id: string; title: string; plannedDate: string | null; status: string; tags: string; createdAt: string }

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'legacy'>('schedule')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [issues, setIssues] = useState<IssueItem[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = getWeekStart(currentWeek)
  const weekEnd = getWeekEnd(currentWeek)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [tRes, iRes] = await Promise.all([
      fetch(`/api/tasks?from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`),
      fetch('/api/legacy-issues'),
    ])
    setTasks(await tRes.json())
    setIssues(await iRes.json())
    setLoading(false)
  }, [weekStart.toISOString(), weekEnd.toISOString()])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggleTask = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'DONE' ? 'TODO' : 'DONE' }) })
    fetchData()
  }

  const handleToggleIssue = async (id: string, status: string) => {
    await fetch(`/api/legacy-issues/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'RESOLVED' ? 'PENDING' : 'RESOLVED' }) })
    fetchData()
  }

  const taskCounts: Record<string, { must: number; focus: number; normal: number }> = {}
  for (const t of tasks) {
    if (t.dueDate) {
      const d = new Date(t.dueDate).toISOString().split('T')[0]
      if (!taskCounts[d]) taskCounts[d] = { must: 0, focus: 0, normal: 0 }
      const k = t.priority.toLowerCase() as 'must' | 'focus' | 'normal'
      if (k in taskCounts[d]) taskCounts[d][k]++
    }
  }

  const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === selectedDate)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">日程表</h1>
      <div className="flex gap-1 mb-4">
        <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>日程表</Tab>
        <Tab active={activeTab === 'legacy'} onClick={() => setActiveTab('legacy')}>遗留问题</Tab>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />))}
        </div>
      ) : activeTab === 'schedule' ? (
        <div>
          <WeekCalendar currentWeek={currentWeek} selectedDate={selectedDate} taskCounts={taskCounts}
            onDateSelect={setSelectedDate}
            onPrevWeek={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d) }}
            onNextWeek={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d) }} />
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{selectedDate} 任务</h2>
            <DayDetail tasks={dayTasks} onToggle={handleToggleTask} />
          </div>
        </div>
      ) : <LegacyIssueList issues={issues} onToggle={handleToggleIssue} />}
    </div>
  )
}