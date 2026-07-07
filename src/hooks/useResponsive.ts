'use client'

import { useState, useEffect } from 'react'

export function useResponsive() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(window.innerWidth)
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isPC: width >= 1024,
    width,
  }
}