import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useResponsive } from '../src/hooks/useResponsive'

// Mock window.matchMedia
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

describe('useResponsive hook', () => {
  it('should return isMobile=true when viewport < 768px', () => {
    window.matchMedia = createMatchMedia(true)
    // Mock innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true, configurable: true, value: 375
    })

    function TestComponent() {
      const { isMobile, isTablet, isPC } = useResponsive()
      return (
        <div>
          <span data-testid="isMobile">{String(isMobile)}</span>
          <span data-testid="isTablet">{String(isTablet)}</span>
          <span data-testid="isPC">{String(isPC)}</span>
        </div>
      )
    }

    render(<TestComponent />)
    expect(screen.getByTestId('isMobile').textContent).toBe('true')
    expect(screen.getByTestId('isPC').textContent).toBe('false')
  })
})