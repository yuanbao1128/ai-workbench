import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayDetail } from '../src/components/tasks/DayDetail'

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

describe('DayDetail - v2', () => {
  const onToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 5.3: MUST priority group
  it('should group tasks by MUST priority with emoji header', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '评审登录页方案', priority: 'MUST', status: 'PENDING', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    // Emoji and label are in separate spans
    expect(screen.getByText('🔴')).toBeDefined()
    // getAllByText because "必须解决" appears in both header and badge
    const labels = screen.getAllByText('必须解决')
    expect(labels.length).toBeGreaterThanOrEqual(2) // header + badge
    expect(screen.getByText('评审登录页方案')).toBeDefined()
  })

  it('should group tasks by FOCUS priority with emoji header', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '需求文档 v2', priority: 'FOCUS', status: 'PENDING', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    expect(screen.getByText('🟡')).toBeDefined()
    expect(screen.getByText('需求文档 v2')).toBeDefined()
  })

  it('should group tasks by NORMAL priority', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '普通任务', priority: 'NORMAL', status: 'PENDING', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    expect(screen.getByText('普通任务')).toBeDefined()
  })

  // 5.6: Follow-up group
  it('should display follow-up items in purple group', () => {
    const followUps: FollowUpItem[] = [
      { id: 'f1', title: '回复张三 — 发电量报表', type: 'delegation', dueDate: '2026-07-17', assignee: '张三' },
    ]
    render(<DayDetail tasks={[]} followUps={followUps} onToggle={onToggle} />)
    expect(screen.getByText(/待跟进/)).toBeDefined()
    expect(screen.getByText(/回复张三/)).toBeDefined()
  })

  // 5.3: Task shows time
  it('should display task time when dueDate has time component', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '评审登录页方案', priority: 'MUST', status: 'PENDING', dueDate: '2026-07-17T15:00:00' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    expect(screen.getByText(/15:00/)).toBeDefined()
  })

  // 5.3: Priority badge on each task
  it('should display priority badge on each task card', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '评审', priority: 'MUST', status: 'PENDING', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    // Badge spans have the "badge" CSS class
    const badge = document.querySelector('.badge-red')
    expect(badge).toBeDefined()
    expect(badge?.textContent).toBe('必须解决')
  })

  // 5.8: Strikethrough for done tasks
  it('should show completed tasks with strikethrough', () => {
    const tasks: TaskData[] = [
      { id: '1', title: '已完成任务', priority: 'NORMAL', status: 'DONE', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    const doneItem = screen.getByText('已完成任务')
    expect(doneItem.className).toContain('line-through')
  })

  // 5.3/5.8: Click checkbox calls onToggle
  it('should call onToggle when checkbox is clicked', () => {
    const tasks: TaskData[] = [
      { id: '1', title: 'Toggle me', priority: 'MUST', status: 'PENDING', dueDate: '2026-07-17' },
    ]
    render(<DayDetail tasks={tasks} followUps={[]} onToggle={onToggle} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // First non-readonly checkbox is the active task
    const checkbox = checkboxes.find(c => !(c as HTMLInputElement).readOnly)
    fireEvent.click(checkbox!)
    expect(onToggle).toHaveBeenCalledWith('1', 'PENDING')
  })

  // Empty state
  it('should show empty state when no tasks or follow-ups', () => {
    render(<DayDetail tasks={[]} followUps={[]} onToggle={onToggle} />)
    expect(screen.getByText('暂无任务')).toBeDefined()
  })
})
