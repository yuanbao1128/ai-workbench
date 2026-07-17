'use client'

import { ChatPanel } from '@/components/chat/ChatPanel'

export function AIPanel() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-80 xl:w-[380px] shrink-0 h-screen sticky top-0 bg-white border-l border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-lg">🤖</span>
        <span className="font-semibold text-gray-800 text-sm">AI 助手</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-gray-400">在线</span>
        </span>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatPanel />
      </div>
    </aside>
  )
}
