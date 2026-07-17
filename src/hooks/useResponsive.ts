'use client'

import { useState, useEffect, useCallback } from 'react'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

export function useResponsive() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(window.innerWidth)
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getBreakpoint = useCallback((w: number): Breakpoint => {
    if (w >= 1280) return 'xl'
    if (w >= 1024) return 'lg'
    if (w >= 768) return 'md'
    return 'sm'
  }, [])

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isPC: width >= 1024,
    breakpoint: getBreakpoint(width),
    width,
  }
}
