'use client'

interface QuickSuggestionsProps {
  /** Current page name to show context-aware suggestions */
  page?: 'dashboard' | 'knowledge' | 'tasks' | 'reports' | 'weekly'
  onSuggestionClick: (prompt: string) => void
}

const suggestionsByPage: Record<string, Array<{ label: string; prompt: string }>> = {
  dashboard: [
    { label: '记名词', prompt: 'K8s 不太懂，记一下' },
    { label: '加TODO', prompt: '今天要完成需求文档，记一下' },
    { label: '转委托', prompt: '李老板反馈登录页报错了，转给王工排查' },
    { label: '查今天', prompt: '今天有什么重点？' },
  ],
  knowledge: [
    { label: '记名词', prompt: 'K8s 不太懂，记一下' },
    { label: '查名词', prompt: '帮我查一下 K8s 相关的知识' },
    { label: '整理知识', prompt: '帮我整理一下待了解的名词' },
  ],
  tasks: [
    { label: '加任务', prompt: '今天要完成需求文档，记一下' },
    { label: '查今天', prompt: '今天有什么重点？' },
    { label: '转委托', prompt: '李老板反馈登录页报错了，转给王工排查' },
  ],
  reports: [
    { label: '写日报', prompt: '帮我写日报' },
    { label: '写周报', prompt: '帮我写周报' },
    { label: '查进度', prompt: '本周完成了哪些工作？' },
  ],
  weekly: [
    { label: '写周报', prompt: '帮我写周报' },
    { label: '查进度', prompt: '本周完成了哪些工作？' },
  ],
}

// Default suggestions when no page context
const defaultSuggestions = [
  { label: '记名词', prompt: 'K8s 不太懂，记一下' },
  { label: '添加TODO', prompt: '今天要完成需求文档，记一下' },
  { label: '转委托', prompt: '李老板反馈登录页报错了，转给王工排查' },
  { label: '查日程', prompt: '今天有什么重点？' },
  { label: '生周报', prompt: '帮我写周报' },
]

export function QuickSuggestions({ page, onSuggestionClick }: QuickSuggestionsProps) {
  const suggestions = (page ? suggestionsByPage[page] : null) || defaultSuggestions

  return (
    <div className="flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-thin">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSuggestionClick(s.prompt)}
          className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
