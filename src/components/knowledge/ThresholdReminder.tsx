'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function ThresholdReminder() {
  const [unknownCount, setUnknownCount] = useState(0)

  useEffect(() => {
    fetch('/api/knowledge?type=TERM&status=UNKNOWN')
      .then(res => res.json())
      .then(data => setUnknownCount(data.length))
      .catch(() => setUnknownCount(0))
  }, [])

  if (unknownCount < 5) return null

  return (
    <Link
      href="/knowledge?type=TERM&status=UNKNOWN"
      className="block bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
    >
      📚 待了解名词已达 {unknownCount} 个，有空时集中查阅吧
    </Link>
  )
}