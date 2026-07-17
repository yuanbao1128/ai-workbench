import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { WeekCalendar } from '../src/components/tasks/WeekCalendar'

const MOCK_NOW = new Date('2026-07-17T12:00:00')

// Helper to find a button by its exact date number
function getDateButton(date: number) {
  const buttons = screen.getAllByRole('button')
  // Filter to buttons that have the exact date number as text content somewhere
  const found = buttons.filter((btn) => {
    const spans = btn.querySelectorAll('span')
    return Array.from(spans).some((s) => s.textContent === String(date))
  })
  return found[0]
}

describe('WeekCalendar - v2', () => {
  const defaultProps = {
    currentWeek: MOCK_NOW,
    selectedDate: '2026-07-17',
    taskCounts: {} as Record<string, { must: number; focus: number; normal: number }>,
    followUpCounts: {} as Record<string, number>,
    onDateSelect: vi.fn(),
    onPrevWeek: vi.fn(),
    onNextWeek: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 5.1: 7-column grid
  it('should render 7 day-of-week headers (周一~周日)', () => {
    render(<WeekCalendar {...defaultProps} />)
    expect(screen.getByText('周一')).toBeDefined()
    expect(screen.getByText('周二')).toBeDefined()
    expect(screen.getByText('周三')).toBeDefined()
    expect(screen.getByText('周四')).toBeDefined()
    expect(screen.getByText('周五')).toBeDefined()
    expect(screen.getByText('周六')).toBeDefined()
    expect(screen.getByText('周日')).toBeDefined()
  })

  it('should render 7 clickable date buttons', () => {
    render(<WeekCalendar {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Navigation buttons (2) + date buttons (7) = 9 total
    const dateButtons = buttons.filter((btn) => {
      const spans = btn.querySelectorAll('span')
      return Array.from(spans).some((s) => /^\d+$/.test(s.textContent || ''))
    })
    expect(dateButtons).toHaveLength(7)
  })

  // 5.1: Task badges
  it('should display task badges for a day with tasks', () => {
    const props = {
      ...defaultProps,
      taskCounts: {
        '2026-07-17': { must: 1, focus: 2, normal: 0 },
      },
    }
    render(<WeekCalendar {...props} />)
    const cell = getDateButton(17)
    expect(cell).toBeDefined()
    const badges = cell?.querySelectorAll('[data-testid="task-badge"]')
    expect(badges?.length).toBe(3)
  })

  // 5.1: Follow-up badges
  it('should display purple pin badges for follow-up items', () => {
    const props = {
      ...defaultProps,
      taskCounts: {
        '2026-07-15': { must: 0, focus: 0, normal: 1 },
      },
      followUpCounts: {
        '2026-07-15': 2,
      },
    }
    render(<WeekCalendar {...props} />)
    const cell = getDateButton(15)
    const followUpBadges = cell?.querySelectorAll('[data-testid="followup-badge"]')
    expect(followUpBadges?.length).toBe(2)
  })

  // 5.1: Today with blue circle
  it('should show today (July 17) date with blue circle background', () => {
    render(<WeekCalendar {...defaultProps} />)
    const cell = getDateButton(17)
    const dateSpan = cell?.querySelector('span')
    expect(dateSpan?.className).toContain('bg-primary')
    expect(dateSpan?.className).toContain('rounded-full')
  })

  // 5.1/5.4: Selected date with blue border
  it('should highlight selected date with blue border', () => {
    render(<WeekCalendar {...defaultProps} />)
    const cell = getDateButton(17)
    expect(cell?.className).toContain('border-primary')
  })

  // 5.1: Weekend days in gray
  it('should render weekend days (Sat/Sun) with gray background', () => {
    render(<WeekCalendar {...defaultProps} />)
    const satCell = getDateButton(18)
    const sunCell = getDateButton(19)
    expect(satCell?.className).toContain('bg-gray-100')
    expect(sunCell?.className).toContain('bg-gray-100')
  })

  // 5.1: Empty day has no badges
  it('should show empty cell for days with no tasks', () => {
    render(<WeekCalendar {...defaultProps} />)
    const emptyCell = getDateButton(13)
    expect(emptyCell).toBeDefined()
    const badges = emptyCell?.querySelectorAll('[data-testid="task-badge"]')
    expect(badges?.length).toBe(0)
  })

  // 5.2: Navigation buttons
  it('should render ◀ 上周 and 下周 ▶ navigation buttons', () => {
    render(<WeekCalendar {...defaultProps} />)
    expect(screen.getByText(/上周/)).toBeDefined()
    expect(screen.getByText(/下周/)).toBeDefined()
  })

  it('should call onPrevWeek when ◀ 上周 is clicked', () => {
    render(<WeekCalendar {...defaultProps} />)
    fireEvent.click(screen.getByText(/上周/))
    expect(defaultProps.onPrevWeek).toHaveBeenCalledTimes(1)
  })

  it('should call onNextWeek when 下周 ▶ is clicked', () => {
    render(<WeekCalendar {...defaultProps} />)
    fireEvent.click(screen.getByText(/下周/))
    expect(defaultProps.onNextWeek).toHaveBeenCalledTimes(1)
  })

  // 5.2: Week range/month display
  it('should display current month in header', () => {
    render(<WeekCalendar {...defaultProps} />)
    expect(screen.getByText('2026年7月')).toBeDefined()
  })

  // 5.4: Click date calls onDateSelect
  it('should call onDateSelect when a date is clicked', () => {
    render(<WeekCalendar {...defaultProps} />)
    fireEvent.click(getDateButton(14))
    expect(defaultProps.onDateSelect).toHaveBeenCalledWith('2026-07-14')
  })
})
