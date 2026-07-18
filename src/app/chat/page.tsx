'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { VoiceInput } from '@/components/chat/VoiceInput'
import { QuickSuggestions } from '@/components/chat/QuickSuggestions'
import {
  loadMessages,
  saveMessages,
  clearMessages,
  generateMessageId,
  type PersistedMessage,
} from '@/lib/chat/storage'

export default function MobileAIPage() {
  const [messages, setMessages] = useState<PersistedMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hydratedRef = useRef(false)

  // ── Hydrate from localStorage on mount ─────────────────
  useEffect(() => {
    const stored = loadMessages()
    setMessages(stored)
    hydratedRef.current = true
  }, [])

  // ── Persist on every change after first hydration ─────
  useEffect(() => {
    if (!hydratedRef.current) return
    saveMessages(messages)
  }, [messages])

  // ── Auto-scroll ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: PersistedMessage = {
      id: generateMessageId(),
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    }
    setInput('')
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      const reply: PersistedMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.message || '收到你的消息',
        results: data.results,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: 'assistant',
          content: '抱歉，AI 服务暂时不可用，请稍后重试',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleVoiceResult = useCallback(
    (text: string) => {
      // 语音识别完成后直接发送，无需二次点击
      handleSend(text)
    },
    [handleSend]
  )

  const handleClearHistory = () => {
    if (!window.confirm('清空所有聊天记录？此操作不可撤销。')) return
    clearMessages()
    setMessages([])
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-lg">🤖</span>
        <span className="font-semibold text-gray-800 text-sm">AI 助手</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400">在线</span>
        </span>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="ml-2 text-xs text-gray-400 hover:text-red-500"
            title="清空聊天记录"
          >
            🗑
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">👋 你好！我是你的 AI 助手</p>
            <p className="text-sm">可以帮你记名词、添加任务、转委托、查日程、生成周报</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-50 rounded-br-md'
                  : 'bg-gray-50 rounded-bl-md'
              }`}
            >
              <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              {Array.isArray(msg.results) &&
                msg.results.map(
                  (result, j) =>
                    result.card && (
                      <div
                        key={j}
                        className="mt-2 p-2 bg-white rounded-lg border border-gray-200"
                      >
                        <span className="text-xs font-medium text-gray-500">
                          {result.card.type === 'TERM' ? '📝 术语' : '📋 卡片'}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {result.card.title}
                        </p>
                      </div>
                    )
                )}
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

      {/* Quick suggestions — hide when chat has messages (less needed) */}
      {messages.length === 0 && <QuickSuggestions onSuggestionClick={handleSend} />}

      {/* Input area */}
      <div className="border-t border-gray-200 px-4 py-3 pb-6 space-y-3">
        {/* Text input row */}
        <div className="flex items-center gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-600 transition-colors"
          >
            <span className="text-lg">↑</span>
          </button>
        </div>

        {/* Voice input row — distinct from text input to avoid iOS long-press copy */}
        <VoiceInput onResult={handleVoiceResult} prominent />
      </div>
    </div>
  )
}
