import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LegacyIssueList } from '../src/components/tasks/LegacyIssueList'

describe('LegacyIssueList - v2', () => {
  const onToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 5.5: Overdue items with "已逾期 N 天"
  it('should show days overdue for overdue issues', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const issues = [
      {
        id: '1',
        title: '过期问题',
        plannedDate: threeDaysAgo.toISOString().split('T')[0],
        status: 'PENDING',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    expect(screen.getByText('过期问题')).toBeDefined()
    // Should show "已逾期 3 天" or similar
    expect(screen.getByText(/已逾期/)).toBeDefined()
  })

  // 5.5: Overdue items with red highlight
  it('should highlight overdue items in red', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const issues = [
      {
        id: '1',
        title: '昨天的问题',
        plannedDate: yesterday.toISOString().split('T')[0],
        status: 'PENDING',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    const card = screen.getByText('昨天的问题').closest('div[class*="rounded-lg"]')
    expect(card?.className).toContain('bg-red-50')
  })

  // 5.5: Not-overdue items (future dated) don't get red highlight
  it('should not highlight future planned items in red', () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const issues = [
      {
        id: '1',
        title: '未来的问题',
        plannedDate: nextWeek.toISOString().split('T')[0],
        status: 'PENDING',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    const card = screen.getByText('未来的问题').closest('div[class*="rounded-lg"]')
    expect(card?.className).not.toContain('bg-red-50')
    expect(card?.className).toContain('bg-orange-50')
  })

  // 5.5: Resolved items in collapsible section
  it('should hide resolved items by default and show toggle button', () => {
    const issues = [
      {
        id: '1',
        title: 'Test Resolved Issue',
        plannedDate: null,
        status: 'RESOLVED',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    // Toggle button should show count
    expect(screen.getByText(/已解决/)).toBeDefined()
    // Resolved items should be hidden initially (collapsed)
    expect(screen.queryByText('Test Resolved Issue')).toBeNull()
  })

  it('should show resolved items when toggle is clicked', () => {
    const issues = [
      {
        id: '1',
        title: 'Test Resolved Issue',
        plannedDate: null,
        status: 'RESOLVED',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    // Click the toggle button (has ▶ arrow when collapsed)
    fireEvent.click(screen.getByText('▶'))
    // Now the item should be visible
    expect(screen.getByText('Test Resolved Issue')).toBeDefined()
  })

  // Checkbox toggle behavior
  it('should call onToggle when checkbox is clicked', () => {
    const issues = [
      {
        id: '1',
        title: '待解决问题',
        plannedDate: null,
        status: 'PENDING',
        tags: '[]',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<LegacyIssueList issues={issues} onToggle={onToggle} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith('1', 'PENDING')
  })

  // Empty state
  it('should show empty state when no issues', () => {
    render(<LegacyIssueList issues={[]} onToggle={onToggle} />)
    expect(screen.getByText('暂无遗留问题')).toBeDefined()
  })
})
