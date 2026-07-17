import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

import { AIPanel } from '../src/components/layout/AIPanel'

describe('AIPanel - v2', () => {
  it('should render the AI panel header with online status', () => {
    render(<AIPanel />)
    const headers = screen.getAllByText(/AI 助手/)
    expect(headers.length).toBeGreaterThanOrEqual(1)
    // The header should have "在线" status
    expect(screen.getByText('在线')).toBeDefined()
  })

  it('should have sticky positioning and proper width classes', () => {
    render(<AIPanel />)
    const panel = document.querySelector('aside')
    expect(panel).toBeDefined()
    expect(panel?.className).toContain('sticky')
    expect(panel?.className).toContain('top-0')
    expect(panel?.className).toContain('xl:w-[380px]')
  })

  it('should render quick suggestions', () => {
    render(<AIPanel />)
    // Should have quick suggestion buttons from ChatPanel
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should render chat input area', () => {
    render(<AIPanel />)
    const input = document.querySelector('input')
    expect(input).toBeDefined()
    expect(input?.getAttribute('placeholder')).toBeDefined()
  })

  it('should have a send button', () => {
    render(<AIPanel />)
    const sendButton = screen.getByText('发送')
    expect(sendButton).toBeDefined()
  })

  it('should be hidden on mobile but visible from md breakpoint', () => {
    render(<AIPanel />)
    const panel = document.querySelector('aside')
    expect(panel?.className).toContain('hidden')
    expect(panel?.className).toContain('md:flex')
  })
})
