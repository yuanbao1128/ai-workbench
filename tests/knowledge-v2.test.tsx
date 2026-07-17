import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/knowledge'),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

import { KnowledgeCard } from '../src/components/knowledge/KnowledgeCard'
import { Pagination } from '../src/components/ui/Pagination'

describe('KnowledgeCard - v2', () => {
  const card = {
    id: '1',
    title: 'Kubernetes',
    type: 'TERM',
    status: 'UNKNOWN',
    content: '容器编排平台...',
    createdAt: '2026-07-15T00:00:00.000Z',
  }

  it('should render with aspect-square and proper card structure', () => {
    render(<KnowledgeCard card={card} />)
    const link = screen.getByText('Kubernetes').closest('a')
    expect(link?.className).toContain('aspect-square')
  })

  it('should show type badge', () => {
    render(<KnowledgeCard card={card} />)
    expect(screen.getByText('术语')).toBeDefined()
  })

  it('should show status dot for TERM type', () => {
    render(<KnowledgeCard card={card} />)
    // Should have a red dot for UNKNOWN status
    const statusElements = document.querySelectorAll('.bg-red-500')
    expect(statusElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should show date at bottom', () => {
    render(<KnowledgeCard card={card} />)
    expect(screen.getByText(/2026/)).toBeDefined()
  })

  it('should truncate long titles', () => {
    const longCard = { ...card, title: 'A very long title that should be truncated in the card display'.repeat(3) }
    render(<KnowledgeCard card={longCard} />)
    const title = screen.getByText(/A very long/)
    expect(title?.className).toContain('line-clamp')
  })
})

describe('Pagination - v2', () => {
  it('should render page numbers', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={() => {}} />
    )
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('should show total count', () => {
    render(
      <Pagination page={1} totalPages={3} total={27} onPageChange={() => {}} />
    )
    expect(screen.getByText(/共 27 项/)).toBeDefined()
  })

  it('should disable prev button on first page', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={() => {}} />
    )
    const prevBtn = screen.getByText('◀').closest('button')
    expect(prevBtn?.disabled).toBe(true)
  })

  it('should disable next button on last page', () => {
    render(
      <Pagination page={5} totalPages={5} onPageChange={() => {}} />
    )
    const nextBtn = screen.getByText('▶').closest('button')
    expect(nextBtn?.disabled).toBe(true)
  })
})
