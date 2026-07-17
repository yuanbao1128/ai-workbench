import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import { ThresholdReminder } from '../src/components/knowledge/ThresholdReminder'

describe('ThresholdReminder - v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should show reminder when count >= 5', () => {
    render(<ThresholdReminder count={7} />)
    expect(screen.getByText(/待了解名词已达/)).toBeDefined()
  })

  it('should not show reminder when count < 5', () => {
    render(<ThresholdReminder count={3} />)
    expect(screen.queryByText(/待了解名词已达/)).toBeNull()
  })

  it('should not show reminder when count is 0', () => {
    render(<ThresholdReminder count={0} />)
    expect(screen.queryByText(/待了解名词已达/)).toBeNull()
  })

  it('should close reminder on × click and not show again today', () => {
    render(<ThresholdReminder count={8} />)
    const closeBtn = screen.getByText('×')
    fireEvent.click(closeBtn)
    expect(screen.queryByText(/待了解名词已达/)).toBeNull()
    // localStorage should have today's dismissal
    const today = new Date().toISOString().split('T')[0]
    expect(localStorage.getItem(`threshold-dismissed-${today}`)).toBe('true')
  })

  it('should link to knowledge page with TERM+UNKNOWN filter', () => {
    render(<ThresholdReminder count={5} />)
    const link = screen.getByText(/待了解名词已达/).closest('a')
    expect(link?.getAttribute('href')).toContain('/knowledge')
    expect(link?.getAttribute('href')).toContain('TERM')
    expect(link?.getAttribute('href')).toContain('UNKNOWN')
  })
})

// PriorityCard test
import { PriorityCard } from '../src/components/dashboard/PriorityCard'

describe('PriorityCard - v2', () => {
  const mockTasks = [
    { id: '1', title: '完成登录页重构', priority: 'MUST', dueDate: '2026-07-17', status: 'PENDING' },
    { id: '2', title: '修复首页加载慢问题', priority: 'MUST', dueDate: '2026-07-17', status: 'PENDING' },
    { id: '3', title: '更新 API 文档', priority: 'MUST', dueDate: '2026-07-17', status: 'PENDING' },
    { id: '4', title: '数据库优化', priority: 'MUST', dueDate: '2026-07-17', status: 'PENDING' },
  ]

  it('should render card with title and count', () => {
    render(<PriorityCard title="必须解决" priority="MUST" tasks={mockTasks.slice(0, 2)} />)
    expect(screen.getByText('必须解决')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should show max 3 tasks and +N overflow', () => {
    render(<PriorityCard title="必须解决" priority="MUST" tasks={mockTasks} />)
    expect(screen.getByText('+1 条')).toBeDefined()
  })

  it('should show empty state when no tasks', () => {
    render(<PriorityCard title="重点关注" priority="FOCUS" tasks={[]} />)
    expect(screen.getByText('暂无任务')).toBeDefined()
  })

  it('should render checkboxes for tasks', () => {
    render(<PriorityCard title="必须解决" priority="MUST" tasks={mockTasks.slice(0, 2)} />)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(2)
  })
})

// FollowUpCard test
import { FollowUpCard } from '../src/components/dashboard/FollowUpCard'

describe('FollowUpCard - v2', () => {
  const mockItems = [
    { id: '1', type: 'delegation', title: '登录页报错', assignee: '王工', status: 'WAITING', followUpTime: '2026-07-17' },
    { id: '2', type: 'todo', title: '完成需求文档', status: 'PENDING', dueDate: '2026-07-18' },
    { id: '3', type: 'todo', title: 'review 代码', status: 'PENDING', dueDate: '2026-07-19' },
  ]

  it('should render collapsed panel with item count', () => {
    render(<FollowUpCard items={mockItems} />)
    expect(screen.getByText(/待跟进/)).toBeDefined()
    expect(screen.getByText(/3项/)).toBeDefined()
  })

  it('should expand panel on click', () => {
    render(<FollowUpCard items={mockItems} />)
    const expandBtn = screen.getByText(/展开/)
    fireEvent.click(expandBtn)
    // After expand, should see tab bar
    expect(screen.getByText('全部')).toBeDefined()
  })

  it('should show tab filters when expanded', () => {
    render(<FollowUpCard items={mockItems} />)
    fireEvent.click(screen.getByText(/展开/))
    expect(screen.getByText('委托追问')).toBeDefined()
    expect(screen.getByText('我的TODO')).toBeDefined()
    expect(screen.getByText('已完成')).toBeDefined()
  })

  it('should show AI quick input when expanded', () => {
    render(<FollowUpCard items={mockItems} />)
    fireEvent.click(screen.getByText(/展开/))
    const textarea = document.querySelector('textarea')
    expect(textarea).toBeDefined()
  })
})

// UnknownTermsCloud test
import { UnknownTermsCloud } from '../src/components/dashboard/UnknownTermsCloud'

describe('UnknownTermsCloud - v2', () => {
  const mockTerms = [
    { id: '1', title: 'Kubernetes' },
    { id: '2', title: 'GraphQL' },
    { id: '3', title: 'WebSocket' },
  ]

  it('should render tag cloud with terms', () => {
    render(<UnknownTermsCloud terms={mockTerms} />)
    expect(screen.getByText('Kubernetes')).toBeDefined()
    expect(screen.getByText('GraphQL')).toBeDefined()
    expect(screen.getByText('WebSocket')).toBeDefined()
  })

  it('should show view all link', () => {
    render(<UnknownTermsCloud terms={mockTerms} />)
    expect(screen.getByText('查看全部 →')).toBeDefined()
  })

  it('should show empty state when no terms', () => {
    render(<UnknownTermsCloud terms={[]} />)
    expect(screen.getByText(/没有待了解的名词/)).toBeDefined()
  })
})
