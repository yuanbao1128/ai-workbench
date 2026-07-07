'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Calendar, Users, FileText } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: '仪表', href: '/' },
  { icon: BookOpen, label: '知识', href: '/knowledge' },
  { icon: Calendar, label: '日程', href: '/tasks' },
  { icon: Users, label: '委托', href: '/delegation' },
  { icon: FileText, label: '日报', href: '/reports' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 bg-white flex items-center justify-around pb-2 z-40 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              isActive ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}