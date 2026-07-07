'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { VoiceInput } from './VoiceInput'

interface Message {
  role: 'user' | 'assistant'
  content: string
  results?: {
    type: string
    success: boolean
    message: string
    card?: { type: string; title: string }
  }[]
}

const quickSuggestions = [
  '记名词',
  '添加TODO',
  '转委托',
  '查日程',
  '生周报',
]

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || '收到你的消息',
          results: data.results,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，AI 服务暂时不可用',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    const prompts: Record<string, string> = {
      '记名词': 'K8s 不太懂，记一下',
      '添加TODO': '今天要完成需求文档，记一下',
      '转委托': '李老板反馈登录页报错了，转给王工排查',
      '查日程': '今天有什么重点？',
      '生周报': '帮我写周报',
    }
    handleSend(prompts[suggestion] || suggestion)
  }

  const handleVoiceResult = (text: string) => {
    setInput(text)
    handleSend(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">👋 你好！我是你的 AI 助手</p>
            <p className="text-sm">可以帮你记名词、添加任务、转委托、查日程、生成周报</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-50 rounded-br-md'
                : 'bg-gray-50 rounded-bl-md'
            }`}>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>

              {/* Result cards */}
              {msg.results && msg.results.length > 0 && msg.results.map((result, j) => (
                result.card && (
                  <div key={j} className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">
                      {result.card.type === 'TERM' ? '📝 术语' : '📋 卡片'}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{result.card.title}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-400">
              思考中...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-1 px-4 pb-2 overflow-x-auto">
        {quickSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestionClick(s)}
            className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <VoiceInput onResult={handleVoiceResult} />
          <input
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="输入消息...（支持语音输入）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}