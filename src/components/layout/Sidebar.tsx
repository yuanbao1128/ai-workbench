'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  icon: string
  label: string
  href: string
  badge?: number
  badgeVariant?: 'red' | 'amber' | 'blue'
}

const navItems: NavItem[] = [
  { icon: '📊', label: '仪表盘', href: '/' },
  { icon: '📝', label: '知识库', href: '/knowledge', badge: 0, badgeVariant: 'red' },
  { icon: '📅', label: '日程表', href: '/tasks' },
  { icon: '📋', label: '日报', href: '/reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-lg font-bold text-gray-900">🤖 AI 工作台</div>
        <div className="text-xs text-gray-400 mt-1">产品经理</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-primary border-r-3 border-primary font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.badgeVariant === 'red' ? 'bg-red-50 text-red-600' :
                  item.badgeVariant === 'amber' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-400">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            郭
          </div>
          郭红军
        </div>
      </div>
    </aside>
  )
}
