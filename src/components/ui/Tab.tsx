import { ReactNode } from 'react'

interface TabProps {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}

export function Tab({ active = false, children, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}