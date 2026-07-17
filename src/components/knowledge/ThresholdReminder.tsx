'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function ThresholdReminder({ count = 0 }: { count?: number }) {
  const today = new Date().toISOString().split('T')[0]
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`threshold-dismissed-${today}`)
    if (stored === 'true') setDismissed(true)
  }, [today])

  if (count < 5 || dismissed) return null

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem(`threshold-dismissed-${today}`, 'true')
    setDismissed(true)
  }

  return (
    <Link
      href="/knowledge?type=TERM&status=UNKNOWN"
      className="block bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 hover:bg-red-100 transition-colors relative"
    >
      <span>💡 待了解名词已达{count}个，有空时集中查阅吧</span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-red-400 hover:text-red-600 text-lg leading-none"
      >
        ×
      </button>
    </Link>
  )
}
