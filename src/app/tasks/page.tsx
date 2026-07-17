'use client'

import { useState, useEffect, useCallback } from 'react'
import { WeekCalendar } from '@/components/tasks/WeekCalendar'
import { DayDetail } from '@/components/tasks/DayDetail'
import { LegacyIssueList } from '@/components/tasks/LegacyIssueList'
import { Tab } from '@/components/ui/Tab'

interface TaskItem { id: string; title: string; priority: string; status: string; dueDate: string | null }
interface IssueItem { id: string; title: string; plannedDate: string | null; status: string; tags: string; createdAt: string }
interface FollowUpItem { id: string; title: string; type: 'todo' | 'delegation'; dueDate: string | null; assignee?: string }

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'legacy'>('schedule')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
  )
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([])
  const [issues, setIssues] = useState<IssueItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    // Use selectedDate as week reference + include follow-ups
    const [tRes, iRes] = await Promise.all([
      fetch(`/api/tasks?week=${selectedDate}&include=follow-ups`),
      fetch('/api/legacy-issues'),
    ])
    const tData = await tRes.json()
    // 5.7: Response includes { tasks, followUps } when include=follow-ups
    setTasks(tData.tasks || tData)
    setFollowUps(tData.followUps || [])
    setIssues(await iRes.json())
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  // Re-fetch when currentWeek changes (affects week range)
  useEffect(() => {
    // Update selectedDate to Monday of current week if it's outside the week
    const weekStart = new Date(currentWeek)
    const day = weekStart.getDay()
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
    weekStart.setDate(diff)
    const mondayStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`

    // Check if selectedDate is within the current week
    const selDate = new Date(selectedDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    if (selDate < weekStart || selDate > weekEnd) {
      setSelectedDate(mondayStr)
    }
  }, [currentWeek])

  // 5.2: Keyboard shortcuts for week navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'schedule') return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentWeek((prev) => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentWeek((prev) => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  const handleToggleTask = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'DONE' ? 'TODO' : 'DONE' }) })
    fetchData()
  }

  const handleToggleIssue = async (id: string, status: string) => {
    await fetch(`/api/legacy-issues/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'RESOLVED' ? 'PENDING' : 'RESOLVED' }) })
    fetchData()
  }

  // Compute task counts by date for WeekCalendar badges
  const taskCounts: Record<string, { must: number; focus: number; normal: number }> = {}
  for (const t of tasks) {
    if (t.dueDate) {
      const d = new Date(t.dueDate).toISOString().split('T')[0]
      if (!taskCounts[d]) taskCounts[d] = { must: 0, focus: 0, normal: 0 }
      const k = t.priority.toLowerCase() as 'must' | 'focus' | 'normal'
      if (k in taskCounts[d]) taskCounts[d][k]++
    }
  }

  // Compute follow-up counts by date for WeekCalendar purple badges
  const followUpCounts: Record<string, number> = {}
  for (const f of followUps) {
    if (f.dueDate) {
      const d = new Date(f.dueDate).toISOString().split('T')[0]
      followUpCounts[d] = (followUpCounts[d] || 0) + 1
    }
  }

  // Filter tasks for selected date
  const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === selectedDate)

  // Filter followUps for selected date
  const dayFollowUps = followUps.filter(f => f.dueDate && new Date(f.dueDate).toISOString().split('T')[0] === selectedDate)

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
          <WeekCalendar currentWeek={currentWeek} selectedDate={selectedDate}
            taskCounts={taskCounts} followUpCounts={followUpCounts}
            onDateSelect={setSelectedDate}
            onPrevWeek={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d) }}
            onNextWeek={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d) }} />
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{selectedDate} 任务</h2>
            <DayDetail tasks={dayTasks} followUps={dayFollowUps} onToggle={handleToggleTask} />
          </div>
        </div>
      ) : <LegacyIssueList issues={issues} onToggle={handleToggleIssue} />}
    </div>
  )
}
