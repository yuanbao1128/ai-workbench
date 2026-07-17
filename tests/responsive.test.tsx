import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useResponsive } from '../src/hooks/useResponsive'

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true, configurable: true, value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

function TestComponent() {
  const { isMobile, isTablet, isPC, breakpoint, width } = useResponsive()
  return (
    <div>
      <span data-testid="isMobile">{String(isMobile)}</span>
      <span data-testid="isTablet">{String(isTablet)}</span>
      <span data-testid="isPC">{String(isPC)}</span>
      <span data-testid="breakpoint">{breakpoint}</span>
      <span data-testid="width">{String(width)}</span>
    </div>
  )
}

describe('useResponsive hook - v2 breakpoints', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(false)
  })

  it('should return breakpoint="sm" when viewport < 768px', () => {
    setViewportWidth(375)
    render(<TestComponent />)
    expect(screen.getByTestId('breakpoint').textContent).toBe('sm')
    expect(screen.getByTestId('isMobile').textContent).toBe('true')
  })

  it('should return breakpoint="md" when viewport 768-1023px', () => {
    setViewportWidth(800)
    render(<TestComponent />)
    expect(screen.getByTestId('breakpoint').textContent).toBe('md')
    expect(screen.getByTestId('isTablet').textContent).toBe('true')
  })

  it('should return breakpoint="lg" when viewport 1024-1279px', () => {
    setViewportWidth(1100)
    render(<TestComponent />)
    expect(screen.getByTestId('breakpoint').textContent).toBe('lg')
    expect(screen.getByTestId('isPC').textContent).toBe('true')
  })

  it('should return breakpoint="xl" when viewport >= 1280px', () => {
    setViewportWidth(1440)
    render(<TestComponent />)
    expect(screen.getByTestId('breakpoint').textContent).toBe('xl')
    expect(screen.getByTestId('isPC').textContent).toBe('true')
  })

  it('should update breakpoint on window resize', () => {
    setViewportWidth(1440)
    render(<TestComponent />)
    expect(screen.getByTestId('breakpoint').textContent).toBe('xl')

    act(() => {
      setViewportWidth(375)
    })
    expect(screen.getByTestId('breakpoint').textContent).toBe('sm')
  })
})
