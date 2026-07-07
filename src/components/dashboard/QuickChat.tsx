'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function QuickChat() {
  const [input, setInput] = useState('')
  const router = useRouter()

  const handleSend = () => {
    if (!input.trim()) return
    router.push(`/chat?q=${encodeURIComponent(input)}`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="font-semibold text-sm text-gray-900 mb-3">AI 助手</h3>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="输入消息... 如：记一下K8s不懂"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
        />
        <Button variant="primary" onClick={handleSend}>发送</Button>
      </div>
    </div>
  )
}