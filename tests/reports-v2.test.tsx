import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportCard } from '../src/components/reports/ReportCard'
import { ReportGrid } from '../src/components/reports/ReportGrid'
import { ReportDetail } from '../src/components/reports/ReportDetail'
import { WeekSelector } from '../src/components/reports/WeekSelector'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock')
global.URL.revokeObjectURL = vi.fn()

const mockReport = {
  id: 'r1',
  type: 'DAILY',
  dateRange: '2026-07-17',
  content: '## 今日工作总结\n\n- 完成了任务A\n- 学习了K8s基础',
  createdAt: '2026-07-17T10:00:00Z',
}

const mockWeeklyReport = {
  id: 'r2',
  type: 'WEEKLY',
  dateRange: '2026-07-13-2026-07-19',
  content: '## 本周总结\n\n### 核心摘要\n本周完成了Phase 5的开发工作',
  createdAt: '2026-07-19T10:00:00Z',
}

describe('ReportCard - v2', () => {
  it('should render daily report type badge', () => {
    const onClick = vi.fn()
    render(<ReportCard report={mockReport} onClick={onClick} />)
    expect(screen.getByText('日报')).toBeDefined()
  })

  it('should render weekly report type badge', () => {
    const onClick = vi.fn()
    render(<ReportCard report={mockWeeklyReport} onClick={onClick} />)
    expect(screen.getByText('周报')).toBeDefined()
  })

  it('should extract and display summary from first heading', () => {
    const onClick = vi.fn()
    render(<ReportCard report={mockReport} onClick={onClick} />)
    expect(screen.getByText('今日工作总结')).toBeDefined()
  })

  it('should display date range', () => {
    const onClick = vi.fn()
    render(<ReportCard report={mockReport} onClick={onClick} />)
    expect(screen.getByText('2026-07-17')).toBeDefined()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ReportCard report={mockReport} onClick={onClick} />)
    fireEvent.click(screen.getByText('日报').closest('button')!)
    expect(onClick).toHaveBeenCalledWith(mockReport)
  })
})

describe('ReportGrid - v2', () => {
  it('should render grid of report cards', () => {
    const reports = [mockReport, mockWeeklyReport]
    const onClick = vi.fn()
    render(<ReportGrid reports={reports} onCardClick={onClick} />)

    expect(screen.getByText('日报')).toBeDefined()
    expect(screen.getByText('周报')).toBeDefined()
  })

  it('should render empty grid when no reports', () => {
    const onClick = vi.fn()
    const { container } = render(<ReportGrid reports={[]} onCardClick={onClick} />)
    const grid = container.firstChild as HTMLElement
    expect(grid.children.length).toBe(0)
  })

  it('should use grid layout with 2 cols on mobile, 3 on lg', () => {
    const onClick = vi.fn()
    const { container } = render(<ReportGrid reports={[mockReport]} onCardClick={onClick} />)
    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
  })
})

describe('ReportDetail - v2', () => {
  it('should display report type and date in header', () => {
    const onClose = vi.fn()
    render(<ReportDetail report={mockReport} onClose={onClose} />)
    expect(screen.getByText('日报')).toBeDefined()
    expect(screen.getByText('2026-07-17')).toBeDefined()
  })

  it('should display full report content', () => {
    const onClose = vi.fn()
    render(<ReportDetail report={mockReport} onClose={onClose} />)
    // Text is inside <pre>, use regex to match across newlines
    expect(screen.getByText(/今日工作总结/)).toBeDefined()
  })

  it('should have action buttons: copy, download, edit', () => {
    const onClose = vi.fn()
    render(<ReportDetail report={mockReport} onClose={onClose} />)
    expect(screen.getByText(/复制全文/)).toBeDefined()
    expect(screen.getByText(/下载/)).toBeDefined()
    expect(screen.getByText(/编辑/)).toBeDefined()
  })

  it('should switch to edit mode when edit is clicked', () => {
    const onClose = vi.fn()
    render(<ReportDetail report={mockReport} onClose={onClose} />)
    fireEvent.click(screen.getByText(/编辑/))
    // Textarea should appear with current content
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeDefined()
    expect(textarea.value).toBe(mockReport.content)
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<ReportDetail report={mockReport} onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ReportDetail report={mockReport} onClose={onClose} />)
    // Click the backdrop (the fixed overlay)
    fireEvent.click(container.firstChild as HTMLElement)
    // Wait a tick for the event
  })
})

describe('WeekSelector - v2', () => {
  const weeks = [
    { id: 'w1', weekNumber: 28, dateRange: '2026-07-13-2026-07-19' },
    { id: 'w2', weekNumber: 27, dateRange: '2026-07-06-2026-07-12' },
  ]

  it('should render week number badges', () => {
    const onSelect = vi.fn()
    render(<WeekSelector weeks={weeks} selectedId="w1" onSelect={onSelect} />)
    expect(screen.getByText('第28周')).toBeDefined()
  })

  it('should highlight selected week', () => {
    const onSelect = vi.fn()
    render(<WeekSelector weeks={weeks} selectedId="w1" onSelect={onSelect} />)
    const selectedBtn = screen.getByText('第28周')
    expect(selectedBtn.className).toContain('bg-primary')
  })

  it('should call onSelect when a week is clicked', () => {
    const onSelect = vi.fn()
    render(<WeekSelector weeks={weeks} selectedId="w1" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('第27周'))
    expect(onSelect).toHaveBeenCalledWith('w2')
  })
})

describe('Reports API - v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated response with reports and pagination meta', async () => {
    // Mock the prisma module
    vi.mock('../src/lib/db', () => ({
      prisma: {
        report: {
          findMany: vi.fn().mockResolvedValue([mockReport]),
          count: vi.fn().mockResolvedValue(10),
          create: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn(),
        },
      },
    }))

    const { GET } = await import('../src/app/api/reports/route')
    const url = new URL('http://localhost/api/reports?page=1&pageSize=9')
    const req = new Request(url)
    const res = await GET(req as any)
    const data = await res.json()

    expect(data).toHaveProperty('reports')
    expect(data).toHaveProperty('pagination')
  })
})
