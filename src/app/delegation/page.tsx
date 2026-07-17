'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DelegationPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">正在跳转到仪表盘...</p>
    </div>
  )
}
