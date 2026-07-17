import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouterProvider } from 'next-router-mock'
// Note: We use a simplified approach — render with Next.js Link mock

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

import { Sidebar } from '../src/components/layout/Sidebar'
import { BottomNav } from '../src/components/layout/BottomNav'

describe('Sidebar - v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render 5 nav items', () => {
    render(<Sidebar />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('should have correct nav labels: 仪表盘, 知识库, 日程表, 日报, 周报', () => {
    render(<Sidebar />)
    expect(screen.getByText('仪表盘')).toBeDefined()
    expect(screen.getByText('知识库')).toBeDefined()
    expect(screen.getByText('日程表')).toBeDefined()
    expect(screen.getByText('日报')).toBeDefined()
    expect(screen.getByText('周报')).toBeDefined()
  })

  it('should NOT have 委托跟进 nav item', () => {
    render(<Sidebar />)
    expect(screen.queryByText('委托跟进')).toBeNull()
  })

  it('should have 224px width (w-56 = 224px)', () => {
    render(<Sidebar />)
    const aside = document.querySelector('aside')
    expect(aside).toBeDefined()
    expect(aside?.className).toContain('w-56')
  })

  it('should highlight active nav item based on pathname', () => {
    // usePathname is mocked to return '/' so 仪表盘 should be active
    render(<Sidebar />)
    const dashboardLink = screen.getByText('仪表盘').closest('a')
    expect(dashboardLink?.className).toContain('bg-blue-50')
  })

  it('should have href /weekly for 周报 nav item', () => {
    render(<Sidebar />)
    const weeklyLink = screen.getByText('周报').closest('a')
    expect(weeklyLink?.getAttribute('href')).toBe('/weekly')
  })
})

describe('BottomNav - v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render 5 tab items', () => {
    render(<BottomNav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('should have correct tab labels: 仪表, 知识, 日程, 日报, AI', () => {
    render(<BottomNav />)
    expect(screen.getByText('仪表')).toBeDefined()
    expect(screen.getByText('知识')).toBeDefined()
    expect(screen.getByText('日程')).toBeDefined()
    expect(screen.getByText('日报')).toBeDefined()
    expect(screen.getByText('AI')).toBeDefined()
  })

  it('should NOT have 委托 tab', () => {
    render(<BottomNav />)
    expect(screen.queryByText('委托')).toBeNull()
  })

  it('should have href /chat for AI tab (mobile)', () => {
    render(<BottomNav />)
    const aiLink = screen.getByText('AI').closest('a')
    expect(aiLink?.getAttribute('href')).toBe('/chat')
  })

  it('should use lucide-react icons', () => {
    render(<BottomNav />)
    // All 5 tabs should have SVG icons
    const nav = document.querySelector('nav')
    expect(nav?.querySelectorAll('svg').length).toBe(5)
  })
})
